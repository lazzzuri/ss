import sharp from "sharp";
import { put } from "@vercel/blob";
import { coverSvg } from "./cover";
import { sql } from "./db";

const STYLE =
  "Editorial photograph, natural light, realistic, Kyiv apartment context, modern PVC windows, calm composition, no text, no letters, no logos, no watermarks, no people's faces.";

export type ImageProvider = "openai" | "replicate" | "procedural";

export function imageProvider(): ImageProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.REPLICATE_API_TOKEN) return "replicate";
  return "procedural";
}

async function viaOpenAI(prompt: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt: `${prompt}. ${STYLE}`, size: "1536x1024", quality: "medium", n: 1 }),
    signal: AbortSignal.timeout(150_000),
  });
  if (!res.ok) throw new Error(`openai images ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const item = json.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) return Buffer.from(await (await fetch(item.url)).arrayBuffer());
  throw new Error("openai images: empty response");
}

async function viaReplicate(prompt: string): Promise<Buffer> {
  const model = process.env.REPLICATE_MODEL || "black-forest-labs/flux-schnell";
  const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json", Prefer: "wait" },
    body: JSON.stringify({ input: { prompt: `${prompt}. ${STYLE}`, aspect_ratio: "3:2", output_format: "webp", num_outputs: 1 } }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`replicate ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { output?: string | string[] };
  const url = Array.isArray(json.output) ? json.output[0] : json.output;
  if (!url) throw new Error("replicate: no output");
  return Buffer.from(await (await fetch(url)).arrayBuffer());
}

/** Generates a cover. Falls back to the procedural cover if the provider fails. */
export async function generateCover(prompt: string, seed: string): Promise<{ data: Buffer; provider: ImageProvider }> {
  const provider = imageProvider();
  try {
    if (provider === "openai") return { data: await toWebp(await viaOpenAI(prompt)), provider };
    if (provider === "replicate") return { data: await toWebp(await viaReplicate(prompt)), provider };
  } catch (e) {
    console.error("image generation failed, using procedural cover", e);
  }
  return { data: await proceduralCover(seed), provider: "procedural" };
}

export async function proceduralCover(seed: string): Promise<Buffer> {
  return sharp(Buffer.from(coverSvg(seed))).webp({ quality: 82 }).toBuffer();
}

async function toWebp(buf: Buffer): Promise<Buffer> {
  return sharp(buf).resize(1536, 1024, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
}

/** Stores an image in Vercel Blob when configured, otherwise in Postgres. Returns a public URL. */
export async function storeImage(data: Buffer, name: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`blog/${name}.webp`, data, { access: "public", contentType: "image/webp", addRandomSuffix: true });
    return blob.url;
  }
  const db = await sql();
  const r = await db`insert into images (mime, data) values ('image/webp', ${data}) returning id`;
  return `/api/img/${r[0].id}`;
}
