import Link from "next/link";
import { hasDb } from "@/lib/db";
import { listLeads, LEAD_STATUSES } from "@/lib/leads";
import { listPartners } from "@/lib/partners";
import { leadText } from "@/lib/lead-text";
import { updateLeadAction } from "../actions";

const LABEL: Record<string, string> = { all: "Усі", new: "Нові", sent: "Передані", sold: "Продані", invalid: "Брак" };

export default async function Leads({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s = "all" } = await searchParams;
  if (!hasDb()) return <p className="flash bad">Підключіть базу даних (DATABASE_URL), щоб бачити заявки.</p>;
  const [leads, partners] = await Promise.all([listLeads(s), listPartners()]);
  return (
    <>
      <h1 className="h2">Заявки</h1>
      <div className="chips">
        {["all", ...LEAD_STATUSES].map((k) => (
          <Link key={k} className="chip" href={`/admin/leads?s=${k}`} style={k === s ? { borderColor: "var(--amber)" } : undefined}>{LABEL[k]}</Link>
        ))}
      </div>
      {leads.length === 0 && <p className="muted">Заявок немає.</p>}
      {leads.map((l) => (
        <div key={l.id} className="lead-card glass">
          <div className="row">
            <b className="mono">№{l.id}</b>
            <span className={`pill ${l.status}`}>{LABEL[l.status]}</span>
            {l.urgent && <span className="pill urgent">терміново</span>}
            {l.damage && <span className="pill damage">обстріл</span>}
            <span className="muted" style={{ fontSize: 13 }}>{new Date(l.createdAt).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })} · {l.lang.toUpperCase()} · {l.page}</span>
            {l.utm && <span className="muted mono" style={{ fontSize: 12 }}>{Object.entries(l.utm).map(([k, v]) => `${k}=${v}`).join(" ")}</span>}
          </div>
          <pre>{leadText(l)}</pre>
          <form action={updateLeadAction} className="inline-form">
            <input type="hidden" name="id" value={l.id} />
            <label className="f"><span>Статус</span>
              <select className="select" name="status" defaultValue={l.status}>{LEAD_STATUSES.map((st) => <option key={st} value={st}>{LABEL[st]}</option>)}</select>
            </label>
            <label className="f"><span>Майстер</span>
              <select className="select" name="partnerId" defaultValue={l.partnerId ?? ""}>
                <option value="">—</option>
                {partners.map((p) => <option key={p.id} value={p.id}>{p.name}{p.company ? ` (${p.company})` : ""}</option>)}
              </select>
            </label>
            <label className="f"><span>Ціна заявки, ₴</span><input className="input" name="soldPrice" inputMode="numeric" defaultValue={l.soldPrice ?? ""} style={{ width: 110 }} /></label>
            <label className="f" style={{ flex: 1, minWidth: 200 }}><span>Нотатки</span><input className="input" name="notes" defaultValue={l.notes ?? ""} style={{ width: "100%" }} /></label>
            <button className="btn btn-amber" style={{ minHeight: 38, padding: "8px 16px" }}>Зберегти</button>
          </form>
        </div>
      ))}
    </>
  );
}
