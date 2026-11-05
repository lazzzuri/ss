import { sql } from "./db";

export type PartnerStatus = "applied" | "active" | "paused";
export const PARTNER_STATUSES: PartnerStatus[] = ["applied", "active", "paused"];

export interface Partner {
  id: number;
  createdAt: string;
  name: string;
  company: string;
  phone: string;
  telegram: string;
  email: string;
  districts: string[];
  services: string[];
  pricePerLead: number | null;
  status: PartnerStatus;
  notes: string;
}

export type PartnerInput = Omit<Partner, "id" | "createdAt">;

function row(r: Record<string, unknown>): Partner {
  return {
    id: Number(r.id),
    createdAt: new Date(r.created_at as string).toISOString(),
    name: (r.name as string) ?? "",
    company: (r.company as string) ?? "",
    phone: (r.phone as string) ?? "",
    telegram: (r.telegram as string) ?? "",
    email: (r.email as string) ?? "",
    districts: (r.districts as string[]) ?? [],
    services: (r.services as string[]) ?? [],
    pricePerLead: (r.price_per_lead as number) ?? null,
    status: (r.status as PartnerStatus) ?? "applied",
    notes: (r.notes as string) ?? "",
  };
}

export async function listPartners(): Promise<Partner[]> {
  const db = await sql();
  return (await db`select * from partners order by (status = 'active') desc, created_at desc`).map(row);
}

export async function insertPartner(p: PartnerInput): Promise<number> {
  const db = await sql();
  const r = await db`
    insert into partners (name, company, phone, telegram, email, districts, services, price_per_lead, status, notes)
    values (${p.name}, ${p.company}, ${p.phone}, ${p.telegram}, ${p.email}, ${p.districts}, ${p.services}, ${p.pricePerLead}, ${p.status}, ${p.notes})
    returning id`;
  return Number(r[0].id);
}

export async function updatePartner(id: number, p: PartnerInput): Promise<void> {
  const db = await sql();
  await db`
    update partners set name = ${p.name}, company = ${p.company}, phone = ${p.phone}, telegram = ${p.telegram},
      email = ${p.email}, districts = ${p.districts}, services = ${p.services}, price_per_lead = ${p.pricePerLead},
      status = ${p.status}, notes = ${p.notes}
    where id = ${id}`;
}

export async function deletePartner(id: number): Promise<void> {
  const db = await sql();
  await db`update leads set partner_id = null where partner_id = ${id}`;
  await db`delete from partners where id = ${id}`;
}
