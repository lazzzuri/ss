import { type NextRequest } from "next/server";
import { hasDb, sql } from "@/lib/db";

export const runtime = "nodejs";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse|pingdom|uptime|curl|wget|python|axios|httpclient/i;
const ID = /^[a-z0-9-]{8,64}$/i;
const TYPES = new Set([
  "pageview", "click", "field", "scroll", "leave", "phone_click", "messenger_click",
  "calc_interact", "calc_add_window", "calc_profile", "calc_step2", "calc_back",
  "form_submit", "form_error", "lead", "repair_submit", "partner_submit", "partner_lead",
]);

function device(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function browser(ua: string): string {
  if (/Edg\//.test(ua)) return "edge";
  if (/OPR\//.test(ua)) return "opera";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Chrome\//.test(ua)) return "chrome";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua)) return "safari";
  return "other";
}

const str = (v: unknown, max: number) => (v == null ? null : String(v).slice(0, max));

export async function POST(req: NextRequest) {
  if (!hasDb()) return new Response(null, { status: 204 });
  const ua = req.headers.get("user-agent") || "";
  const allowHeadless = process.env.ANALYTICS_ALLOW_HEADLESS === "1";
  if (BOT.test(ua) || (!allowHeadless && /HeadlessChrome/.test(ua))) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const vid = String(body.vid ?? "");
  const sid = String(body.sid ?? "");
  if (!ID.test(vid) || !ID.test(sid) || !Array.isArray(body.events)) return new Response(null, { status: 400 });

  let refHost: string | null = null;
  try {
    const ref = new URL(String(body.ref || ""));
    if (ref.host && ref.host !== req.nextUrl.host) refHost = ref.host.replace(/^www\./, "");
  } catch {}
  const utm = (body.utm && typeof body.utm === "object" ? body.utm : {}) as Record<string, string>;
  const common = {
    vid,
    sid,
    lang: str(body.lang, 5),
    ref: refHost,
    utm_source: str(utm.utm_source ?? (utm.gclid ? "google-ads" : utm.fbclid ? "facebook" : null), 100),
    utm_medium: str(utm.utm_medium, 100),
    utm_campaign: str(utm.utm_campaign, 100),
    device: device(ua),
    browser: browser(ua),
    country: str(req.headers.get("x-vercel-ip-country"), 4),
    width: Number.isFinite(Number(body.w)) ? Math.min(10000, Math.round(Number(body.w))) : null,
  };

  const now = Date.now();
  const rows = (body.events as Record<string, unknown>[])
    .slice(0, 60)
    .filter((e) => e && TYPES.has(String(e.t)))
    .map((e) => {
      const ts = Number(e.ts);
      return {
        ...common,
        ts: new Date(Number.isFinite(ts) && Math.abs(now - ts) < 864e5 ? ts : now),
        type: String(e.t),
        path: str(e.p, 200),
        label: str(e.l, 120),
        value: typeof e.v === "number" && Number.isFinite(e.v) ? e.v : null,
        meta: (() => { if (!e.m || typeof e.m !== "object") return null; const j = JSON.stringify(e.m); return j.length <= 2000 ? j : null; })(),
      };
    });
  if (!rows.length) return new Response(null, { status: 204 });

  try {
    const db = await sql();
    await db`insert into events ${db(
      rows.map((r) => ({ ...r, meta: r.meta })),
      "ts", "vid", "sid", "type", "path", "label", "value", "meta", "lang", "ref", "utm_source", "utm_medium", "utm_campaign", "device", "browser", "country", "width",
    )}`;
  } catch (e) {
    console.error("analytics insert failed", e);
  }
  return new Response(null, { status: 204 });
}
