import { sql } from "./db";

export interface Analytics {
  days: number;
  kpi: { visitors: number; sessions: number; pageviews: number; leads: number; phoneVisitors: number; cr: number };
  funnel: { key: string; label: string; people: number }[];
  devices: { device: string; visitors: number; leads: number }[];
  sources: { source: string; visitors: number; leads: number }[];
  entries: { path: string; sessions: number; leads: number }[];
  pages: { path: string; views: number; avgTime: number | null; fullScroll: number | null; halfScroll: number | null }[];
  clicks: { label: string; type: string; n: number; people: number }[];
  errors: { label: string; n: number }[];
  fields: { label: string; sessions: number }[];
  visitors: { vid: string; first: string; last: string; pages: number; device: string; source: string; converted: boolean }[];
  hints: string[];
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export async function getAnalytics(days: number): Promise<Analytics> {
  const db = await sql();
  const since = new Date(Date.now() - days * 864e5);

  const [k] = await db`
    select count(distinct vid)::int visitors, count(distinct sid)::int sessions,
      count(*) filter (where type = 'pageview')::int pageviews,
      count(distinct vid) filter (where type = 'phone_click')::int phone_visitors
    from events where ts >= ${since}`;
  const [l] = await db`select count(*)::int n from leads where created_at >= ${since}`;

  const f = await db`
    select type, count(distinct vid)::int people from events
    where ts >= ${since} and type in ('calc_interact','calc_step2','form_submit','repair_submit','lead')
    group by type`;
  const fm = Object.fromEntries(f.map((r) => [r.type as string, r.people as number]));

  const devices = await db`
    with v as (select vid, max(device) device from events where ts >= ${since} group by vid)
    select v.device, count(distinct v.vid)::int visitors, count(distinct l.vid)::int leads
    from v left join leads l on l.vid = v.vid and l.created_at >= ${since}
    group by v.device order by visitors desc`;

  const sources = await db`
    with s as (
      select distinct on (sid) sid, vid, coalesce(utm_source, ref, 'прямий захід') src
      from events where ts >= ${since} order by sid, ts)
    select src as source, count(distinct s.vid)::int visitors, count(distinct l.id)::int leads
    from s left join leads l on l.sid = s.sid
    group by src order by visitors desc limit 15`;

  const entries = await db`
    with s as (
      select distinct on (sid) sid, path from events
      where ts >= ${since} and type = 'pageview' order by sid, ts)
    select s.path, count(*)::int sessions, count(distinct l.id)::int leads
    from s left join leads l on l.sid = s.sid
    group by s.path order by sessions desc limit 20`;

  const pages = await db`
    select path,
      count(*) filter (where type = 'pageview')::int views,
      round(avg(value) filter (where type = 'leave'))::int avg_time,
      (count(*) filter (where type = 'scroll' and value >= 100))::float / nullif(count(*) filter (where type = 'pageview'), 0) full_scroll,
      (count(*) filter (where type = 'scroll' and value >= 50))::float / nullif(count(*) filter (where type = 'pageview'), 0) half_scroll
    from events where ts >= ${since}
    group by path having count(*) filter (where type = 'pageview') > 0
    order by views desc limit 20`;

  const clicks = await db`
    select label, type, count(*)::int n, count(distinct vid)::int people from events
    where ts >= ${since} and type in ('click','phone_click','messenger_click') and label is not null
    group by label, type order by n desc limit 25`;

  const errors = await db`
    select label, count(*)::int n from events where ts >= ${since} and type = 'form_error'
    group by label order by n desc`;

  const fields = await db`
    select label, count(distinct sid)::int sessions from events where ts >= ${since} and type = 'field'
    group by label order by sessions desc limit 15`;

  const visitors = await db`
    select vid, min(ts) first, max(ts) last, count(*) filter (where type = 'pageview')::int pages,
      max(device) device, coalesce(max(utm_source), max(ref), 'прямий захід') source,
      bool_or(type = 'lead') converted
    from events where ts >= ${since}
    group by vid order by max(ts) desc limit 60`;

  const kpi = {
    visitors: k?.visitors ?? 0,
    sessions: k?.sessions ?? 0,
    pageviews: k?.pageviews ?? 0,
    leads: l?.n ?? 0,
    phoneVisitors: k?.phone_visitors ?? 0,
    cr: 0,
  };
  kpi.cr = Math.min(100, pct(fm.lead ?? 0, kpi.visitors));
  const funnel = [
    { key: "visit", label: "Зайшли на сайт", people: kpi.visitors },
    { key: "calc_interact", label: "Почали рахувати", people: fm.calc_interact ?? 0 },
    { key: "calc_step2", label: "Перейшли до контактів", people: fm.calc_step2 ?? 0 },
    { key: "form_submit", label: "Натиснули «Надіслати»", people: (fm.form_submit ?? 0) + (fm.repair_submit ?? 0) },
    { key: "lead", label: "Заявку отримано", people: fm.lead ?? 0 },
  ];

  const a: Analytics = {
    days,
    kpi,
    funnel,
    devices: devices.map((r) => ({ device: r.device as string, visitors: r.visitors as number, leads: r.leads as number })),
    sources: sources.map((r) => ({ source: r.source as string, visitors: r.visitors as number, leads: r.leads as number })),
    entries: entries.map((r) => ({ path: r.path as string, sessions: r.sessions as number, leads: r.leads as number })),
    pages: pages.map((r) => ({ path: r.path as string, views: r.views as number, avgTime: (r.avg_time as number) ?? null, fullScroll: (r.full_scroll as number) ?? null, halfScroll: (r.half_scroll as number) ?? null })),
    clicks: clicks.map((r) => ({ label: r.label as string, type: r.type as string, n: r.n as number, people: r.people as number })),
    errors: errors.map((r) => ({ label: r.label as string, n: r.n as number })),
    fields: fields.map((r) => ({ label: r.label as string, sessions: r.sessions as number })),
    visitors: visitors.map((r) => ({
      vid: r.vid as string,
      first: new Date(r.first as string).toISOString(),
      last: new Date(r.last as string).toISOString(),
      pages: r.pages as number,
      device: r.device as string,
      source: r.source as string,
      converted: !!r.converted,
    })),
    hints: [],
  };
  a.hints = hints(a);
  return a;
}

function hints(a: Analytics): string[] {
  const out: string[] = [];
  const v = a.kpi.visitors;
  if (v < 20) return ["Поки мало даних. Підказки з'являться, коли на сайт зайде хоча б 20 людей."];
  const [visit, calc, step2, submit, lead] = a.funnel.map((x) => x.people);
  if (calc / visit < 0.25) out.push(`Лише ${pct(calc, visit)}% відвідувачів чіпають калькулятор. Підніміть його вище або зробіть кнопку «Розрахувати ціну» помітнішою на першому екрані.`);
  if (calc > 0 && step2 / calc < 0.4) out.push(`З тих, хто почав рахувати, до контактів переходять лише ${pct(step2, calc)}%. Покажіть ціну крупніше і додайте біля кнопки аргумент довіри: «безкоштовно, без передоплати».`);
  if (step2 > 0 && submit / step2 < 0.5) out.push(`На кроці контактів відпадає ${Math.round(100 - pct(submit, step2))}%. Скоротіть форму: залиште обов'язковими лише телефон і район.`);
  if (submit > 0 && lead / submit < 0.8) out.push(`Після натискання «Надіслати» заявку отримано лише в ${pct(lead, submit)}% випадків. Перегляньте помилки форм нижче.`);
  const phoneErr = a.errors.find((e) => e.label === "phone")?.n ?? 0;
  if (phoneErr >= 3) out.push(`Телефон вводять неправильно (${phoneErr} разів). Додайте маску +380 і підказку формату.`);
  const mob = a.devices.find((d) => d.device === "mobile");
  const desk = a.devices.find((d) => d.device === "desktop");
  if (mob && desk && mob.visitors >= 10 && desk.visitors >= 10) {
    const m = pct(mob.leads, mob.visitors), dk = pct(desk.leads, desk.visitors);
    if (m < dk * 0.6) out.push(`На телефонах конверсія ${m}% проти ${dk}% на комп'ютерах. Перевірте мобільну версію калькулятора і зробіть кнопку дзвінка закріпленою внизу екрана.`);
  }
  for (const e of a.entries) {
    if (e.sessions >= 30 && e.leads === 0) out.push(`Сторінка ${e.path} — ${e.sessions} входів і жодної заявки. Перевірте, чи відповідає заголовок запиту і чи видно калькулятор без прокрутки.`);
  }
  const home = a.pages.find((p) => /^\/(uk|ru)$/.test(p.path));
  if (home && home.views >= 20 && (home.halfScroll ?? 0) < 0.3) out.push(`Лише ${Math.round((home.halfScroll ?? 0) * 100)}% гортають головну хоча б до половини. Найважливіше має бути на першому екрані.`);
  if (a.kpi.phoneVisitors > 0) out.push(`${a.kpi.phoneVisitors} людей натиснули на номер телефону — ці дзвінки теж ваші заявки, рахуйте їх окремо.`);
  if (!out.length) out.push(`Воронка без явних провалів. Конверсія ${a.kpi.cr}%: тестуйте заголовки і тексти реклами, щоб привести більше цільових людей.`);
  return out;
}

export async function getJourney(vid: string) {
  const db = await sql();
  const events = await db`
    select ts, type, path, label, value, meta, device, browser, country, ref, utm_source, utm_campaign, sid
    from events where vid = ${vid} order by ts limit 1000`;
  const leads = await db`select id, created_at, service, price_low, price_high, status from leads where vid = ${vid} order by created_at`;
  return { events, leads };
}
