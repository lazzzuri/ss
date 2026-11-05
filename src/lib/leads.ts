import type { WindowPreset } from "@/content/types";
import { sql } from "./db";

export type LeadStatus = "new" | "sent" | "sold" | "invalid";
export const LEAD_STATUSES: LeadStatus[] = ["new", "sent", "sold", "invalid"];

export interface LeadInput {
  lang: string;
  service: string;
  name: string;
  phone: string;
  district: string;
  address: string;
  housing: string;
  floor: number | null;
  urgent: boolean;
  damage: boolean;
  photos: boolean;
  problems: string[];
  comment: string;
  windows: WindowPreset[];
  profile: string | null;
  extras: string[];
  area: number | null;
  priceLow: number | null;
  priceHigh: number | null;
  page: string;
  utm: Record<string, string> | null;
  ipHash: string;
  vid?: string | null;
  sid?: string | null;
}

export interface Lead extends LeadInput {
  id: number;
  createdAt: string;
  status: LeadStatus;
  partnerId: number | null;
  soldPrice: number | null;
  notes: string | null;
}

function row(r: Record<string, unknown>): Lead {
  return {
    id: Number(r.id),
    createdAt: new Date(r.created_at as string).toISOString(),
    lang: r.lang as string,
    service: r.service as string,
    name: (r.name as string) ?? "",
    phone: r.phone as string,
    district: (r.district as string) ?? "",
    address: (r.address as string) ?? "",
    housing: (r.housing as string) ?? "",
    floor: (r.floor as number) ?? null,
    urgent: !!r.urgent,
    damage: !!r.damage,
    photos: !!r.photos,
    problems: (r.problems as string[]) ?? [],
    comment: (r.comment as string) ?? "",
    windows: (r.windows as WindowPreset[]) ?? [],
    profile: (r.profile as string) ?? null,
    extras: (r.extras as string[]) ?? [],
    area: r.area == null ? null : Number(r.area),
    priceLow: (r.price_low as number) ?? null,
    priceHigh: (r.price_high as number) ?? null,
    page: (r.page as string) ?? "",
    utm: (r.utm as Record<string, string>) ?? null,
    ipHash: (r.ip_hash as string) ?? "",
    vid: (r.vid as string) ?? null,
    sid: (r.sid as string) ?? null,
    status: (r.status as LeadStatus) ?? "new",
    partnerId: r.partner_id == null ? null : Number(r.partner_id),
    soldPrice: (r.sold_price as number) ?? null,
    notes: (r.notes as string) ?? null,
  };
}

export async function recentLeadsFromIp(ipHash: string, minutes = 10): Promise<number> {
  const db = await sql();
  const r = await db`select count(*)::int as n from leads where ip_hash = ${ipHash} and created_at > now() - make_interval(mins => ${minutes})`;
  return (r[0]?.n as number) ?? 0;
}

export async function insertLead(l: LeadInput): Promise<number> {
  const db = await sql();
  const r = await db`
    insert into leads (lang, service, name, phone, district, address, housing, floor, urgent, damage, photos,
      problems, comment, windows, profile, extras, area, price_low, price_high, page, utm, ip_hash, vid, sid)
    values (${l.lang}, ${l.service}, ${l.name}, ${l.phone}, ${l.district}, ${l.address}, ${l.housing}, ${l.floor},
      ${l.urgent}, ${l.damage}, ${l.photos}, ${l.problems}, ${l.comment}, ${db.json(l.windows as never)}, ${l.profile},
      ${l.extras}, ${l.area}, ${l.priceLow}, ${l.priceHigh}, ${l.page}, ${l.utm ? db.json(l.utm as never) : null}, ${l.ipHash},
      ${l.vid ?? null}, ${l.sid ?? null})
    returning id`;
  return Number(r[0].id);
}

export async function listLeads(status?: string, limit = 200): Promise<Lead[]> {
  const db = await sql();
  const rows = status && status !== "all"
    ? await db`select * from leads where status = ${status} order by created_at desc limit ${limit}`
    : await db`select * from leads order by created_at desc limit ${limit}`;
  return rows.map(row);
}

export async function updateLead(id: number, patch: { status?: string; partnerId?: number | null; soldPrice?: number | null; notes?: string | null }) {
  const db = await sql();
  await db`
    update leads set
      status = coalesce(${patch.status ?? null}, status),
      partner_id = ${patch.partnerId ?? null},
      sold_price = ${patch.soldPrice ?? null},
      notes = ${patch.notes ?? null}
    where id = ${id}`;
}

export async function leadStats(): Promise<{ today: number; week: number; total: number; newCount: number; soldSum: number }> {
  const db = await sql();
  const r = await db`
    select
      count(*) filter (where created_at > date_trunc('day', now() at time zone 'Europe/Kyiv') at time zone 'Europe/Kyiv')::int as today,
      count(*) filter (where created_at > now() - interval '7 days')::int as week,
      count(*)::int as total,
      count(*) filter (where status = 'new')::int as new_count,
      coalesce(sum(sold_price) filter (where status = 'sold'), 0)::int as sold_sum
    from leads`;
  const x = r[0] ?? {};
  return { today: x.today as number, week: x.week as number, total: x.total as number, newCount: x.new_count as number, soldSum: x.sold_sum as number };
}
