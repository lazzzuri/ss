import { NextResponse, type NextRequest } from "next/server";
import { hasDb } from "@/lib/db";
import { insertLead, recentLeadsFromIp, type LeadInput } from "@/lib/leads";
import { getSettings } from "@/lib/settings";
import { cleanWindows, quote, EXTRAS, PROFILES, type Extra, type Profile } from "@/lib/calc";
import { notifyTelegram } from "@/lib/telegram";
import { leadText } from "@/lib/lead-text";
import { SERVICE_SLUGS, DISTRICT_SLUGS } from "@/content/slugs";

export const runtime = "nodejs";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

async function ipHash(req: NextRequest): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0";
  const data = new TextEncoder().encode(`${ip}|${process.env.ADMIN_SECRET ?? "yv"}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // bots: honeypot filled or submitted faster than a human could
  if (str(body.website, 100) || Number(body.elapsed ?? 99999) < 2500) {
    return NextResponse.json({ ok: true });
  }

  const phone = str(body.phone, 24);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) {
    return NextResponse.json({ ok: false, error: "phone" }, { status: 422 });
  }

  const settings = await getSettings();
  const service = (SERVICE_SLUGS as readonly string[]).includes(String(body.service)) ? String(body.service) : "zamina-vikon";
  const district = (DISTRICT_SLUGS as readonly string[]).includes(String(body.district)) || body.district === "other" ? String(body.district) : "";
  const windows = cleanWindows(body.windows);
  const profile = PROFILES.includes(body.profile as Profile) ? (body.profile as Profile) : null;
  const extras = Array.isArray(body.extras) ? (body.extras.filter((e) => EXTRAS.includes(e as Extra)) as Extra[]) : [];
  const q = windows.length && profile ? quote(windows, profile, extras, settings) : null;
  const problems = Array.isArray(body.problems) ? body.problems.slice(0, 10).map((p) => str(p, 120)).filter(Boolean) : [];
  const count = Number(body.windowsCount);
  if (!windows.length && Number.isFinite(count) && count > 0) problems.push(`вікон: ${Math.min(50, Math.round(count))}`);

  const lead: LeadInput = {
    lang: body.lang === "ru" ? "ru" : "uk",
    service,
    name: str(body.name, 80),
    phone,
    district,
    address: str(body.address, 160),
    housing: str(body.housing, 40),
    floor: Number.isFinite(Number(body.floor)) && Number(body.floor) > 0 ? Math.min(60, Math.round(Number(body.floor))) : null,
    urgent: !!body.urgent,
    damage: !!body.damage,
    photos: !!body.photos,
    problems,
    comment: str(body.comment, 1000),
    windows,
    profile,
    extras,
    area: q ? Math.round(q.area * 100) / 100 : null,
    priceLow: q?.low ?? null,
    priceHigh: q?.high ?? null,
    page: str(body.page, 200),
    utm: body.utm && typeof body.utm === "object" ? (body.utm as Record<string, string>) : null,
    ipHash: await ipHash(req),
    vid: /^[a-z0-9-]{8,64}$/i.test(String(body.vid ?? "")) ? String(body.vid) : null,
    sid: /^[a-z0-9-]{8,64}$/i.test(String(body.sid ?? "")) ? String(body.sid) : null,
  };

  let id: number | undefined;
  if (hasDb()) {
    try {
      if ((await recentLeadsFromIp(lead.ipHash)) >= 5) {
        return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
      }
      id = await insertLead(lead);
    } catch (e) {
      console.error("lead insert failed", e);
    }
  }
  const sent = await notifyTelegram(leadText({ ...lead, id }));
  if (!id && !sent) {
    return NextResponse.json({ ok: false, error: "storage" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, id: id ?? null });
}
