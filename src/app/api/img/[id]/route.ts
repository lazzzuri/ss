import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });
  try {
    const db = await sql();
    const r = await db`select mime, data from images where id = ${Number(id)}`;
    if (!r[0]) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(r[0].data as Buffer), {
      headers: { "Content-Type": r[0].mime as string, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
