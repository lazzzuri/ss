import { NextResponse, type NextRequest } from "next/server";
import { hasDb } from "@/lib/db";
import { insertPartner } from "@/lib/partners";
import { notifyTelegram } from "@/lib/telegram";
import { DISTRICT_SLUGS } from "@/content/slugs";

export const runtime = "nodejs";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (str(b.website, 100)) return NextResponse.json({ ok: true });
  const phone = str(b.phone, 24);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) return NextResponse.json({ ok: false, error: "phone" }, { status: 422 });

  const districts = Array.isArray(b.districts) ? b.districts.map(String).filter((d) => (DISTRICT_SLUGS as readonly string[]).includes(d)) : [];
  const services = Array.isArray(b.services) ? b.services.map((s) => str(s, 60)).slice(0, 8) : [];
  const partner = {
    name: str(b.name, 120) || "—",
    company: "",
    phone,
    telegram: str(b.telegram, 60),
    email: "",
    districts,
    services,
    pricePerLead: null,
    status: "applied" as const,
    notes: str(b.comment, 1000),
  };

  let saved = false;
  if (hasDb()) {
    try {
      await insertPartner(partner);
      saved = true;
    } catch (e) {
      console.error("partner insert failed", e);
    }
  }
  const sent = await notifyTelegram(
    `НОВИЙ МАЙСТЕР\n${partner.name}\nТелефон: ${phone}\nTelegram/Viber: ${partner.telegram || "—"}\nПослуги: ${services.join(", ") || "—"}\nРайони: ${districts.join(", ") || "—"}\n${partner.notes}`,
  );
  if (!saved && !sent) return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true });
}
