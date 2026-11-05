import { hasDb } from "@/lib/db";
import { listPartners, PARTNER_STATUSES, type Partner } from "@/lib/partners";
import { catalogOf } from "@/content/catalog";
import { deletePartnerAction, savePartnerAction } from "../actions";

const LABEL: Record<string, string> = { applied: "заявка", active: "активний", paused: "пауза" };

function PartnerForm({ p }: { p?: Partner }) {
  const districts = catalogOf("district");
  return (
    <form action={savePartnerAction} style={{ display: "grid", gap: 10 }}>
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="grid2">
        <label className="f"><span>Ім'я</span><input className="input" name="name" defaultValue={p?.name} required /></label>
        <label className="f"><span>Компанія</span><input className="input" name="company" defaultValue={p?.company} /></label>
        <label className="f"><span>Телефон</span><input className="input" name="phone" defaultValue={p?.phone} /></label>
        <label className="f"><span>Telegram / Viber</span><input className="input" name="telegram" defaultValue={p?.telegram} /></label>
        <label className="f"><span>Email</span><input className="input" name="email" defaultValue={p?.email} /></label>
        <label className="f"><span>Ціна за заявку, ₴</span><input className="input" name="pricePerLead" inputMode="numeric" defaultValue={p?.pricePerLead ?? ""} /></label>
        <label className="f"><span>Статус</span><select className="select" name="status" defaultValue={p?.status ?? "active"}>{PARTNER_STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}</select></label>
        <label className="f"><span>Послуги (через кому)</span><input className="input" name="services" defaultValue={p?.services.join(", ")} /></label>
      </div>
      <fieldset><legend>Райони</legend>
        <div className="toggles">{districts.map((d) => <label key={d.slug} className="tog"><input type="checkbox" name="districts" value={d.slug} defaultChecked={p?.districts.includes(d.slug)} />{d.name.uk}</label>)}</div>
      </fieldset>
      <label className="f"><span>Нотатки</span><textarea className="textarea" name="notes" defaultValue={p?.notes} /></label>
      <div className="row"><button className="btn btn-amber" style={{ minHeight: 40 }}>{p ? "Зберегти" : "Додати майстра"}</button></div>
    </form>
  );
}

export default async function Partners() {
  if (!hasDb()) return <p className="flash bad">Підключіть базу даних (DATABASE_URL).</p>;
  const partners = await listPartners();
  return (
    <>
      <h1 className="h2">Майстри</h1>
      <details className="glass" style={{ padding: 18, borderRadius: 20 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ Додати майстра</summary>
        <div style={{ marginTop: 14 }}><PartnerForm /></div>
      </details>
      {partners.length === 0 && <p className="muted">Поки немає майстрів. Заявки зі сторінки «Майстрам» з'являтимуться тут зі статусом «заявка».</p>}
      {partners.map((p) => (
        <details key={p.id} className="lead-card glass">
          <summary style={{ cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <b>{p.name}</b>{p.company && <span className="muted">{p.company}</span>}
            <span className={`pill ${p.status}`}>{LABEL[p.status]}</span>
            <span className="mono muted">{p.phone}</span>
            {p.pricePerLead != null && <span className="mono">{p.pricePerLead} ₴/заявка</span>}
            <span className="muted" style={{ fontSize: 13 }}>{p.districts.length ? `${p.districts.length} район(и)` : "райони не вказані"}</span>
          </summary>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <PartnerForm p={p} />
            <form action={deletePartnerAction}><input type="hidden" name="id" value={p.id} /><button className="btn btn-glass" style={{ minHeight: 36 }}>Видалити</button></form>
          </div>
        </details>
      ))}
    </>
  );
}
