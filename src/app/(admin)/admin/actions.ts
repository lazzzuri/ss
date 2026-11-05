"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { updateLead, LEAD_STATUSES } from "@/lib/leads";
import { insertPartner, updatePartner, deletePartner, PARTNER_STATUSES, type PartnerInput } from "@/lib/partners";
import { deletePost, getPostById, materializeSeed, setPostStatus, updatePost } from "@/lib/posts";
import { getSettings, saveSettings } from "@/lib/settings";
import { runAutopost } from "@/lib/autopost";
import type { Settings } from "@/config/site";

async function requireAdmin() {
  const ok = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

const s = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const n = (f: FormData, k: string) => {
  const v = Number(String(f.get(k) ?? "").replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(v) && String(f.get(k) ?? "").trim() !== "" ? v : null;
};

export async function updateLeadAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const status = s(f, "status");
  await updateLead(id, {
    status: (LEAD_STATUSES as string[]).includes(status) ? status : undefined,
    partnerId: n(f, "partnerId"),
    soldPrice: n(f, "soldPrice"),
    notes: s(f, "notes") || null,
  });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

function partnerFrom(f: FormData): PartnerInput {
  const status = s(f, "status");
  return {
    name: s(f, "name", 120) || "—",
    company: s(f, "company", 120),
    phone: s(f, "phone", 40),
    telegram: s(f, "telegram", 60),
    email: s(f, "email", 120),
    districts: f.getAll("districts").map(String),
    services: s(f, "services", 300).split(",").map((x) => x.trim()).filter(Boolean),
    pricePerLead: n(f, "pricePerLead"),
    status: (PARTNER_STATUSES as string[]).includes(status) ? (status as PartnerInput["status"]) : "active",
    notes: s(f, "notes"),
  };
}

export async function savePartnerAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id") || 0);
  if (id) await updatePartner(id, partnerFrom(f));
  else await insertPartner(partnerFrom(f));
  revalidatePath("/admin/partners");
}

export async function deletePartnerAction(f: FormData) {
  await requireAdmin();
  await deletePartner(Number(f.get("id")));
  revalidatePath("/admin/partners");
}

export async function setPostStatusAction(f: FormData) {
  await requireAdmin();
  await setPostStatus(Number(f.get("id")), s(f, "status") === "draft" ? "draft" : "published");
  revalidatePath("/admin/posts");
}

export async function deletePostAction(f: FormData) {
  await requireAdmin();
  await deletePost(Number(f.get("id")));
  revalidatePath("/admin/posts");
}

export async function materializeSeedAction(f: FormData) {
  await requireAdmin();
  const id = await materializeSeed(s(f, "slug"));
  revalidatePath("/admin/posts");
  if (id) redirect(`/admin/posts/${id}`);
}

export async function savePostAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const post = await getPostById(id);
  if (!post) redirect("/admin/posts");
  await updatePost(id, {
    title: { uk: s(f, "title_uk", 200), ru: s(f, "title_ru", 200) },
    description: { uk: s(f, "description_uk", 300), ru: s(f, "description_ru", 300) },
    body: { uk: s(f, "body_uk", 60000), ru: s(f, "body_ru", 60000) },
    coverAlt: { uk: s(f, "alt_uk", 200), ru: s(f, "alt_ru", 200) },
    status: s(f, "status") === "draft" ? "draft" : "published",
    tags: s(f, "tags", 200).split(",").map((x) => x.trim()).filter(Boolean),
  });
  revalidatePath(`/uk/blog/${post!.slug}`);
  revalidatePath(`/ru/blog/${post!.slug}`);
  redirect(`/admin/posts/${id}?saved=1`);
}

export async function saveSettingsAction(f: FormData) {
  await requireAdmin();
  const cur = await getSettings();
  const num = (k: string, fallback: number) => n(f, k) ?? fallback;
  const repairPrices = cur.repairPrices.map((_, i) => ({
    name: { uk: s(f, `rp_name_uk_${i}`, 160), ru: s(f, `rp_name_ru_${i}`, 160) },
    price: { uk: s(f, `rp_price_uk_${i}`, 80), ru: s(f, `rp_price_ru_${i}`, 80) },
  })).filter((r) => r.name.uk || r.name.ru);
  const next: Settings = {
    phone: s(f, "phone", 40),
    telegram: s(f, "telegram", 60).replace(/^@/, ""),
    viber: s(f, "viber", 40),
    email: s(f, "email", 120),
    measureDays: s(f, "measureDays", 20) || cur.measureDays,
    prices: { econom: num("price_econom", cur.prices.econom), standard: num("price_standard", cur.prices.standard), energy: num("price_energy", cur.prices.energy) },
    installShare: num("installPct", cur.installShare * 100) / 100,
    extras: { removal: num("ex_removal", cur.extras.removal), sill: num("ex_sill", cur.extras.sill), drip: num("ex_drip", cur.extras.drip), net: num("ex_net", cur.extras.net) },
    repairPrices: repairPrices.length ? repairPrices : cur.repairPrices,
  };
  await saveSettings(next);
  for (const p of ["/uk", "/ru", "/uk/tsiny", "/ru/tsiny"]) revalidatePath(p);
  redirect("/admin/settings?saved=1");
}

export async function generateNowAction() {
  await requireAdmin();
  let msg: string;
  try {
    const r = await runAutopost({ force: true });
    msg = r.status === "created" ? `ok:${r.id}` : `skip:${r.reason}`;
  } catch (e) {
    msg = `err:${e instanceof Error ? e.message : "failed"}`;
  }
  revalidatePath("/admin/posts");
  redirect(`/admin/posts?gen=${encodeURIComponent(msg)}`);
}
