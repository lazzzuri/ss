import Link from "next/link";
import { getJourney } from "@/lib/analytics";

const ICON: Record<string, string> = {
  pageview: "📄", click: "👆", field: "⌨️", scroll: "↕️", leave: "⏱", phone_click: "📞", messenger_click: "💬",
  calc_interact: "🧮", calc_add_window: "➕", calc_profile: "🪟", calc_step2: "➡️", calc_back: "⬅️",
  form_submit: "📨", repair_submit: "📨", form_error: "⚠️", lead: "✅", partner_submit: "🔧", partner_lead: "🔧",
};
const NAME: Record<string, string> = {
  pageview: "Відкрив сторінку", click: "Клік", field: "Поле форми", scroll: "Прокрутив", leave: "Пішов зі сторінки", phone_click: "Натиснув на телефон",
  messenger_click: "Месенджер", calc_interact: "Почав рахувати", calc_add_window: "Додав вікно", calc_profile: "Обрав профіль", calc_step2: "Перейшов до контактів",
  calc_back: "Повернувся до вікон", form_submit: "Надіслав форму", repair_submit: "Надіслав заявку на ремонт", form_error: "Помилка форми", lead: "Заявку отримано",
  partner_submit: "Надіслав анкету майстра", partner_lead: "Анкету майстра отримано",
};

export default async function Journey({ params }: { params: Promise<{ vid: string }> }) {
  const { vid } = await params;
  const { events, leads } = await getJourney(vid);
  const first = events[0];
  return (
    <>
      <div className="row"><Link href="/admin/analytics">← Аналітика</Link></div>
      <h1 className="h2">Відвідувач <span className="mono">{vid.slice(0, 8)}</span></h1>
      {first && (
        <p className="muted">
          {first.device} · {first.browser}{first.country ? ` · ${first.country}` : ""} · джерело: {(first.utm_source as string) || (first.ref as string) || "прямий захід"}
          {first.utm_campaign ? ` · кампанія ${first.utm_campaign}` : ""} · подій: {events.length} · візитів: {new Set(events.map((e) => e.sid)).size}
        </p>
      )}
      {leads.length > 0 && (
        <div className="flash">Заявки: {leads.map((l) => `№${l.id} (${l.service}${l.price_high ? `, до ${l.price_high} ₴` : ""})`).join(", ")} · <Link href="/admin/leads">до заявок</Link></div>
      )}
      <section className="glass" style={{ padding: 16, borderRadius: 20 }}>
        <div className="atable-wrap">
          <table className="atable">
            <thead><tr><th>Час</th><th>Подія</th><th>Сторінка</th><th>Деталі</th></tr></thead>
            <tbody>
              {events.map((e, i) => {
                const prev = events[i - 1];
                const newVisit = prev && prev.sid !== e.sid;
                return (
                  <tr key={i} style={newVisit ? { borderTop: "2px solid var(--amber)" } : undefined}>
                    <td className="mono" style={{ whiteSpace: "nowrap" }}>{new Date(e.ts as string).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}</td>
                    <td>{ICON[e.type as string] ?? "•"} {NAME[e.type as string] ?? e.type}</td>
                    <td className="mono" style={{ fontSize: 12.5 }}>{e.path}</td>
                    <td style={{ maxWidth: 420, overflowWrap: "anywhere" }}>
                      {e.label ? String(e.label) : ""}
                      {e.value != null ? ` · ${e.type === "leave" ? `${e.value} с` : e.type === "scroll" ? `${e.value}%` : e.value}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
