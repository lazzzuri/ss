import Link from "next/link";
import { hasDb } from "@/lib/db";
import { getAnalytics } from "@/lib/analytics";

const share = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "—");
const DEVICE: Record<string, string> = { mobile: "Телефон", desktop: "Комп'ютер", tablet: "Планшет" };
const TYPE: Record<string, string> = { click: "клік", phone_click: "дзвінок", messenger_click: "месенджер" };
const ERR: Record<string, string> = { phone: "неправильний телефон", windows: "не вказані вікна", problem: "не вказана проблема", server: "помилка сервера" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d = "7" } = await searchParams;
  const days = [1, 7, 30, 90].includes(Number(d)) ? Number(d) : 7;
  if (!hasDb()) return <p className="flash bad">Підключіть базу даних (DATABASE_URL), щоб збирати аналітику.</p>;
  const a = await getAnalytics(days);
  const top = a.funnel[0].people || 1;
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h2">Аналітика</h1>
        <div className="chips">
          {[1, 7, 30, 90].map((n) => (
            <Link key={n} className="chip" href={`/admin/analytics?d=${n}`} style={n === days ? { borderColor: "var(--amber)" } : undefined}>
              {n === 1 ? "Сьогодні" : `${n} днів`}
            </Link>
          ))}
        </div>
      </div>

      <div className="stats">
        <div className="stat glass"><b>{a.kpi.visitors}</b><span>відвідувачів</span></div>
        <div className="stat glass"><b>{a.kpi.sessions}</b><span>візитів</span></div>
        <div className="stat glass"><b>{a.kpi.pageviews}</b><span>переглядів сторінок</span></div>
        <div className="stat glass"><b>{a.kpi.leads}</b><span>заявок</span></div>
        <div className="stat glass"><b>{a.kpi.cr}%</b><span>конверсія у заявку</span></div>
        <div className="stat glass"><b>{a.kpi.phoneVisitors}</b><span>натиснули на телефон</span></div>
      </div>

      <section className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 12 }}>
        <h2 className="h3">Що покращити</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>{a.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
      </section>

      <section className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 12 }}>
        <h2 className="h3">Воронка</h2>
        {a.funnel.map((s, i) => (
          <div key={s.key} style={{ display: "grid", gap: 4 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span>{s.label}</span>
              <span className="mono">{s.people} · {share(s.people, top)}{i > 0 ? ` · з попереднього ${share(s.people, a.funnel[i - 1].people)}` : ""}</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{ width: `${Math.max(1, (s.people / top) * 100)}%`, height: "100%", background: i === a.funnel.length - 1 ? "var(--ok)" : "var(--amber)" }} />
            </div>
          </div>
        ))}
      </section>

      <div className="split">
        <Table title="Джерела" head={["Звідки", "Людей", "Заявок", "Конверсія"]} rows={a.sources.map((r) => [r.source, r.visitors, r.leads, share(r.leads, r.visitors)])} />
        <Table title="Пристрої" head={["Пристрій", "Людей", "Заявок", "Конверсія"]} rows={a.devices.map((r) => [DEVICE[r.device] ?? r.device, r.visitors, r.leads, share(r.leads, r.visitors)])} />
      </div>
      <div className="split">
        <Table title="Сторінки входу" head={["Сторінка", "Входів", "Заявок", "Конверсія"]} rows={a.entries.map((r) => [r.path, r.sessions, r.leads, share(r.leads, r.sessions)])} />
        <Table title="Сторінки" head={["Сторінка", "Перегляди", "Сер. час", "До половини", "До кінця"]} rows={a.pages.map((r) => [r.path, r.views, r.avgTime != null ? `${r.avgTime} с` : "—", r.halfScroll != null ? `${Math.round(r.halfScroll * 100)}%` : "—", r.fullScroll != null ? `${Math.round(r.fullScroll * 100)}%` : "—"])} />
      </div>
      <div className="split">
        <Table title="Найчастіші кліки" head={["Що", "Тип", "Кліків", "Людей"]} rows={a.clicks.map((r) => [r.label, TYPE[r.type] ?? r.type, r.n, r.people])} />
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <Table title="Помилки форм" head={["Причина", "Разів"]} rows={a.errors.map((r) => [ERR[r.label] ?? r.label, r.n])} />
          <Table title="Поля, які заповнюють" head={["Поле", "Візитів"]} rows={a.fields.map((r) => [r.label, r.sessions])} />
        </div>
      </div>

      <Table
        title="Останні відвідувачі"
        head={["Хто", "Перший візит", "Останній", "Сторінок", "Пристрій", "Джерело", "Заявка"]}
        rows={a.visitors.map((r) => [
          <Link key={r.vid} href={`/admin/analytics/v/${r.vid}`} className="mono">{r.vid.slice(0, 8)}</Link>,
          new Date(r.first).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" }),
          new Date(r.last).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" }),
          r.pages,
          DEVICE[r.device] ?? r.device,
          r.source,
          r.converted ? <span key="c" className="pill sold">так</span> : "—",
        ])}
      />
      <p className="muted" style={{ fontSize: 13 }}>Відвідувачі знеособлені: випадковий ідентифікатор у браузері, без імен і телефонів. Боти не враховуються.</p>
    </>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: React.ReactNode[][] }) {
  return (
    <section className="glass" style={{ padding: 16, borderRadius: 20, display: "grid", gap: 10, alignContent: "start", minWidth: 0 }}>
      <h2 className="h3">{title}</h2>
      {rows.length === 0 ? <p className="muted">Поки немає даних.</p> : (
        <div className="atable-wrap">
          <table className="atable">
            <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={typeof c === "number" ? "mono" : undefined} style={j === 0 ? { maxWidth: 360, overflowWrap: "anywhere" } : undefined}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
