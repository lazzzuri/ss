"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, WindowPreset, WindowType } from "@/content/types";
import type { Settings } from "@/config/site";
import { t, fill } from "@/i18n/dict";
import { EXTRAS, PROFILES, SASHES, WINDOW_TYPES, formatArea, formatMoney, quote, type Extra, type Profile } from "@/lib/calc";
import { track, trackerIds } from "./tracker";

type CalcSettings = Pick<Settings, "prices" | "installShare" | "extras" | "measureDays">;
export interface DistrictOpt { slug: string; name: string }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const n = (v: unknown) => {
  const x = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};

/* ---------------- window drawing ---------------- */

export function WindowDrawing({ w, h, type, label }: { w: number; h: number; type: WindowType; label: string }) {
  const W = clamp(n(w) || 100, 30, 400);
  const H = clamp(n(h) || 100, 30, 300);
  const box = { x: 26, y: 8, w: 116, h: 96 };
  const s = Math.min(box.w / W, box.h / H);
  const dw = W * s, dh = H * s;
  const x0 = box.x + (box.w - dw) / 2, y0 = box.y + (box.h - dh) / 2;
  const els: React.ReactNode[] = [];
  let k = 0;
  const sash = (x: number, y: number, sw: number, sh: number, open: boolean) => {
    const i = 3;
    els.push(<rect key={k++} className="pane" x={x + i} y={y + i} width={Math.max(1, sw - 2 * i)} height={Math.max(1, sh - 2 * i)} />);
    els.push(<path key={k++} className="glint" d={`M${x + i + 4} ${y + i + 10} l6 -6 M${x + i + 4} ${y + i + 17} l10 -10`} />);
    if (open) {
      els.push(<polyline key={k++} className="turn" points={`${x + i},${y + i} ${x + sw - i},${y + sh / 2} ${x + i},${y + sh - i}`} />);
      els.push(<polyline key={k++} className="tilt" points={`${x + i},${y + sh - i} ${x + sw / 2},${y + i} ${x + sw - i},${y + sh - i}`} />);
    }
  };
  if (type === "balcony") {
    const doorW = dw * 0.36, winH = dh * 0.62;
    els.push(<rect key={k++} className="frame" x={x0} y={y0} width={doorW} height={dh} />);
    els.push(<rect key={k++} className="frame" x={x0 + doorW} y={y0} width={dw - doorW} height={winH} />);
    els.push(<rect key={k++} className="wall" x={x0 + doorW + 1} y={y0 + winH + 1} width={dw - doorW - 2} height={dh - winH - 2} />);
    sash(x0, y0, doorW, dh, true);
    sash(x0 + doorW, y0, dw - doorW, winH, true);
  } else {
    els.push(<rect key={k++} className="frame" x={x0} y={y0} width={dw} height={dh} />);
    const list = SASHES[type];
    const sw = dw / list.length;
    list.forEach((open, j) => sash(x0 + j * sw, y0, sw, dh, open === 1));
  }
  const yd = y0 + dh + 9, xd = x0 - 9;
  return (
    <svg className="wdraw" viewBox="0 0 150 128" role="img" aria-label={label}>
      {els}
      <line className="dim" x1={x0} y1={yd} x2={x0 + dw} y2={yd} />
      <line className="dim" x1={x0} y1={yd - 3} x2={x0} y2={yd + 3} />
      <line className="dim" x1={x0 + dw} y1={yd - 3} x2={x0 + dw} y2={yd + 3} />
      <text className="dimtext" x={x0 + dw / 2} y={yd + 12} textAnchor="middle">{Math.round(n(w)) || "?"}</text>
      <line className="dim" x1={xd} y1={y0} x2={xd} y2={y0 + dh} />
      <line className="dim" x1={xd - 3} y1={y0} x2={xd + 3} y2={y0} />
      <line className="dim" x1={xd - 3} y1={y0 + dh} x2={xd + 3} y2={y0 + dh} />
      <text className="dimtext" x={xd - 4} y={y0 + dh / 2} textAnchor="middle" transform={`rotate(-90 ${xd - 4} ${y0 + dh / 2})`}>{Math.round(n(h)) || "?"}</text>
    </svg>
  );
}

/* ---------------- shared contact fields ---------------- */

/** Formats Ukrainian numbers as you type: 067 123 45 67 or +380 67 123 45 67. */
export function formatPhone(raw: string): string {
  const plus = raw.trim().startsWith("+");
  const d = raw.replace(/\D/g, "").slice(0, 12);
  if (plus || d.startsWith("380")) {
    const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
    return "+" + p.join(" ");
  }
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean);
  return p.join(" ");
}

function ContactFields({ lang, districts, defaultDistrict, days, prefix }: { lang: Lang; districts: DistrictOpt[]; defaultDistrict?: string; days: string; prefix: string }) {
  const d = t(lang).form;
  return (
    <>
      <div className="grid2">
        <label className="f"><span>{d.name}</span><input className="input" id={`${prefix}-name`} name="name" autoComplete="name" placeholder={d.namePh} maxLength={80} /></label>
        <label className="f"><span>{d.phone}</span><input className="input" id={`${prefix}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder={d.phonePh} maxLength={24} required onInput={(e) => { e.currentTarget.value = formatPhone(e.currentTarget.value); }} /></label>
        <label className="f">
          <span>{d.district}</span>
          <select className="select" id={`${prefix}-district`} name="district" defaultValue={defaultDistrict ?? ""}>
            <option value="">—</option>
            {districts.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
            <option value="other">{d.districtOther}</option>
          </select>
        </label>
        <label className="f"><span>{d.address}</span><input className="input" id={`${prefix}-address`} name="address" autoComplete="street-address" placeholder={d.addressPh} maxLength={160} /></label>
        <label className="f">
          <span>{d.housing}</span>
          <select className="select" id={`${prefix}-housing`} name="housing">
            {d.housingOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="f"><span>{d.floor}</span><input className="input" id={`${prefix}-floor`} name="floor" type="number" min={1} max={60} inputMode="numeric" placeholder="5" /></label>
      </div>
      <fieldset>
        <legend>{d.urgency}</legend>
        <div className="choices">
          <label className="choice"><input type="radio" name="urgency" value="normal" defaultChecked /><b>{d.normal}</b><small>{fill(d.normalHint, { days })}</small></label>
          <label className="choice warn"><input type="radio" name="urgency" value="urgent" /><b>{d.urgent}</b><small>{d.urgentHint}</small></label>
        </div>
      </fieldset>
      <div className="choices">
        <label className="choice warn"><input type="checkbox" name="damage" /><b>{d.damage}</b><small>{d.damageHint}</small></label>
        <label className="choice"><input type="checkbox" name="photos" defaultChecked /><b>{d.photos}</b><small>{d.photosHint}</small></label>
      </div>
      <label className="f"><span>{d.comment}</span><textarea className="textarea" id={`${prefix}-comment`} name="comment" placeholder={d.commentPh} maxLength={1000} /></label>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} aria-hidden="true" />
    </>
  );
}

function readContact(form: HTMLFormElement) {
  const fd = new FormData(form);
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  return {
    name: s("name"),
    phone: s("phone"),
    district: s("district"),
    address: s("address"),
    housing: s("housing"),
    floor: s("floor") ? Number(s("floor")) : null,
    urgent: s("urgency") === "urgent",
    damage: fd.get("damage") != null,
    photos: fd.get("photos") != null,
    comment: s("comment"),
    website: s("website"),
  };
}

function utm(): Record<string, string> | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]) {
      const v = p.get(k);
      if (v) out[k] = v.slice(0, 120);
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

async function sendLead(body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ...trackerIds() }) });
    return res.ok;
  } catch {
    return false;
  }
}

function Success({ lang, onAgain, phone }: { lang: Lang; onAgain: () => void; phone?: string }) {
  const d = t(lang).form;
  return (
    <div className="result" role="status">
      <h3>{d.okTitle}</h3>
      <p>{d.okText}</p>
      {phone ? <p className="mono">{phone}</p> : null}
      <div><button type="button" className="btn btn-glass" onClick={onAgain}>{d.again}</button></div>
    </div>
  );
}

/* ---------------- calculator ---------------- */

const FALLBACK: WindowPreset[] = [
  { type: "double", w: 130, h: 140, qty: 2 },
  { type: "balcony", w: 200, h: 210, qty: 1 },
];

export function Calculator(props: {
  lang: Lang;
  service: string;
  settings: CalcSettings;
  districts: DistrictOpt[];
  preset?: WindowPreset[];
  defaultDistrict?: string;
  phone?: string;
  title?: string;
  id?: string;
}) {
  const { lang, settings } = props;
  const d = t(lang);
  const [rows, setRows] = useState<WindowPreset[]>(() => (props.preset?.length ? props.preset : FALLBACK).map((r) => ({ ...r })));
  const [touched, setTouched] = useState(false);
  const [profile, setProfile] = useState<Profile>("standard");
  const [extras, setExtras] = useState<Extra[]>(["removal", "sill"]);
  const [urgent, setUrgent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);

  const q = useMemo(() => quote(rows, profile, extras, settings), [rows, profile, extras, settings]);
  const money = (v: number) => `${formatMoney(v, lang)} ₴`;
  const interacted = useRef(false);
  const mark = () => {
    if (!interacted.current) {
      interacted.current = true;
      track("calc_interact", props.service);
    }
  };

  const setRow = (i: number, patch: Partial<WindowPreset>) => {
    mark();
    setTouched(true);
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = readContact(e.currentTarget);
    const digits = c.phone.replace(/\D/g, "");
    if (!q.count) { track("form_error", "windows"); return setErr(d.form.errWindows); }
    if (digits.length < 10 || digits.length > 12) { track("form_error", "phone", digits.length); return setErr(d.form.errPhone); }
    setErr("");
    setBusy(true);
    track("form_submit", props.service, q.high);
    const ok = await sendLead({
      ...c, lang, service: props.service, windows: rows, profile, extras, problems: [],
      page: window.location.pathname, utm: utm(), elapsed: Date.now() - started.current,
    });
    setBusy(false);
    if (ok) { track("lead", props.service, q.high, { area: q.area, count: q.count }); setDone(true); }
    else { track("form_error", "server"); setErr(d.form.errServer); }
  }

  return (
    <section className="calc glass" id={props.id ?? "calc"} aria-label={d.calc.title}>
      <div className="calc-head">
        <h2 className="h3">{props.title ?? d.calc.title}</h2>
        {!touched && <span className="sample">{d.calc.sample}</span>}
      </div>
      {done ? (
        <div className="calc-body"><Success lang={lang} phone={props.phone} onAgain={() => { setDone(false); setStep(1); }} /></div>
      ) : (
        <form className="calc-body" onSubmit={onSubmit} noValidate>
          <div className="stack" hidden={step !== 1} style={{ gap: 16 }}>
          <div className="stack">
            <p className="fine">{d.calc.hint}</p>
            <div className="wrows">
              {rows.map((r, i) => (
                <div className="wrow" key={i}>
                  <WindowDrawing w={r.w} h={r.h} type={r.type} label={`${d.calc.types[r.type]} ${r.w}×${r.h}`} />
                  <div className="wfields">
                    <label className="f f-type"><span>{d.calc.type}</span>
                      <select className="select" id={`t-${i}`} value={r.type} onChange={(e) => setRow(i, { type: e.target.value as WindowType })}>
                        {WINDOW_TYPES.map((wt) => <option key={wt} value={wt}>{d.calc.types[wt]}</option>)}
                      </select>
                    </label>
                    <label className="f"><span>{d.calc.width}</span><input className="input" id={`w-${i}`} type="number" inputMode="numeric" min={30} max={400} value={r.w || ""} onChange={(e) => setRow(i, { w: n(e.target.value) })} /></label>
                    <label className="f"><span>{d.calc.height}</span><input className="input" id={`h-${i}`} type="number" inputMode="numeric" min={30} max={300} value={r.h || ""} onChange={(e) => setRow(i, { h: n(e.target.value) })} /></label>
                    <label className="f f-qty"><span>{d.calc.qty}</span><input className="input" id={`q-${i}`} type="number" inputMode="numeric" min={1} max={50} value={r.qty || ""} onChange={(e) => setRow(i, { qty: n(e.target.value) })} /></label>
                  </div>
                  <button type="button" className="icon-btn" aria-label={`${d.calc.remove} ${i + 1}`} hidden={rows.length < 2}
                    onClick={() => { mark(); setTouched(true); setRows((rs) => rs.filter((_, j) => j !== i)); }}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="add" onClick={() => { mark(); track("calc_add_window", props.service); setTouched(true); setRows((rs) => [...rs, { type: "double", w: 130, h: 140, qty: 1 }]); }}>{d.calc.add}</button>
          </div>

          <fieldset>
            <legend className="mini-legend">{d.calc.profile}</legend>
            <div className="seg">
              {PROFILES.map((p) => (
                <label key={p} title={d.calc.profiles[p].note}>
                  <input type="radio" name="profile" value={p} checked={profile === p} onChange={() => { mark(); track("calc_profile", p); setProfile(p); }} />
                  <b>{d.calc.profiles[p].name}</b>
                  <small>{formatMoney(settings.prices[p], lang)} ₴/м²</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mini-legend">{d.calc.extras}</legend>
            <div className="toggles">
              {EXTRAS.map((x) => (
                <label className="tog" key={x}>
                  <input type="checkbox" checked={extras.includes(x)} onChange={(e) => { mark(); setExtras((xs) => (e.target.checked ? [...xs, x] : xs.filter((y) => y !== x))); }} />
                  {d.calc.extraNames[x]} <small>+{formatMoney(settings.extras[x], lang)}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="quote" aria-live="polite">
            <div className="ruler" aria-hidden="true" />
            <div className="quote-in">
              <dl>
                <div><dt>{d.calc.count}</dt><dd>{q.count}</dd></div>
                <div><dt>{d.calc.area}</dt><dd>{formatArea(q.area, lang)} м²</dd></div>
                <div><dt>{d.calc.profiles[profile].name}</dt><dd>{money(q.base)}</dd></div>
                <div><dt>{d.calc.install}, ~{Math.round(settings.installShare * 100)}%</dt><dd>{money(q.install)}</dd></div>
                <div><dt>{d.calc.extrasSum}</dt><dd>{money(q.extras)}</dd></div>
              </dl>
              <div className="total">
                <span>{d.calc.approx}</span>
                <output>{q.count ? `${formatMoney(q.low, lang)} – ${formatMoney(q.high, lang)} ₴` : d.calc.sizesNeeded}</output>
              </div>
              <p className="when">{urgent ? d.calc.measureUrgent : fill(d.calc.measure, { days: settings.measureDays })}</p>
              <p className="note">{d.calc.note}</p>
            </div>
          </div>

          {err && step === 1 && <p className="err" role="alert">{err}</p>}
          <div className="row">
            <button type="button" className="btn btn-amber" onClick={() => { if (!q.count) { track("form_error", "windows"); return setErr(d.form.errWindows); } setErr(""); track("calc_step2", props.service, q.high, { area: q.area, count: q.count, profile }); setStep(2); }}>{d.calc.next}</button>
          </div>
          </div>

          <div className="stack" hidden={step !== 2} style={{ gap: 16 }}>
          <div className="summary-line">
            <span>{fill(d.calc.summary, { count: q.count, area: formatArea(q.area, lang), price: q.count ? `${formatMoney(q.low, lang)} – ${formatMoney(q.high, lang)} ₴` : "—" })}</span>
            <button type="button" className="linklike" onClick={() => { setErr(""); track("calc_back", props.service); setStep(1); }}>{d.calc.back}</button>
          </div>
          <div className="stack" onChange={(e) => { const el = e.target as HTMLInputElement; if (el.name === "urgency") setUrgent(el.value === "urgent"); }}>
            <h3 className="h3">{d.form.contacts}</h3>
            <p className="fine">{d.form.contactsHint}</p>
            <ContactFields lang={lang} districts={props.districts} defaultDistrict={props.defaultDistrict} days={settings.measureDays} prefix={`c-${props.service}`} />
          </div>
          {err && step === 2 && <p className="err" role="alert">{err}</p>}
          <div className="row">
            <button type="submit" className="btn btn-amber" disabled={busy}>{busy ? d.form.sending : d.form.submit}</button>
          </div>
          <p className="fine">{d.form.consent}</p>
          </div>
        </form>
      )}
    </section>
  );
}

/* ---------------- repair form ---------------- */

export function RepairForm(props: { lang: Lang; service: string; measureDays: string; districts: DistrictOpt[]; defaultDistrict?: string; phone?: string; title?: string; id?: string }) {
  const { lang } = props;
  const d = t(lang);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const c = readContact(form);
    const fd = new FormData(form);
    const problems = fd.getAll("problem").map(String);
    const count = Number(fd.get("count") || 1);
    const digits = c.phone.replace(/\D/g, "");
    if (!problems.length && !c.comment) { track("form_error", "problem"); return setErr(d.form.errProblem); }
    if (digits.length < 10 || digits.length > 12) { track("form_error", "phone", digits.length); return setErr(d.form.errPhone); }
    setErr("");
    setBusy(true);
    track("repair_submit", props.service, problems.length);
    const ok = await sendLead({
      ...c, lang, service: props.service, problems, windows: [], profile: null, extras: [], windowsCount: count,
      page: window.location.pathname, utm: utm(), elapsed: Date.now() - started.current,
    });
    setBusy(false);
    if (ok) { track("lead", props.service, undefined, { problems }); setDone(true); }
    else { track("form_error", "server"); setErr(d.form.errServer); }
  }

  return (
    <section className="calc glass" id={props.id ?? "calc"} aria-label={props.title ?? d.cta.repair}>
      <div className="calc-head"><h2 className="h3">{props.title ?? d.cta.repair}</h2></div>
      {done ? (
        <div className="calc-body"><Success lang={lang} phone={props.phone} onAgain={() => setDone(false)} /></div>
      ) : (
        <form className="calc-body" onSubmit={onSubmit} noValidate>
          <fieldset>
            <legend>{d.form.repairTitle}</legend>
            <div className="choices">
              {d.form.problems.map((p) => (
                <label className="choice" key={p}><input type="checkbox" name="problem" value={p} /><b>{p}</b></label>
              ))}
            </div>
          </fieldset>
          <label className="f" style={{ maxWidth: 220 }}><span>{d.form.windowsCount}</span><input className="input" name="count" type="number" min={1} max={50} defaultValue={1} inputMode="numeric" /></label>
          <ContactFields lang={lang} districts={props.districts} defaultDistrict={props.defaultDistrict} days={props.measureDays} prefix={`r-${props.service}`} />
          {err && <p className="err" role="alert">{err}</p>}
          <div className="row"><button type="submit" className="btn btn-amber" disabled={busy}>{busy ? d.form.sending : d.form.submit}</button></div>
          <p className="fine">{d.form.consent}</p>
        </form>
      )}
    </section>
  );
}

/* ---------------- partner application ---------------- */

export function PartnerForm({ lang, districts }: { lang: Lang; districts: DistrictOpt[] }) {
  const d = t(lang);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();
    const digits = s("phone").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 12) return setErr(d.form.errPhone);
    setErr("");
    setBusy(true);
    track("partner_submit");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, name: s("name"), phone: s("phone"), telegram: s("telegram"), districts: fd.getAll("districts").map(String), services: fd.getAll("services").map(String), comment: s("comment"), website: s("website") }),
      });
      if (!res.ok) throw new Error();
      track("partner_lead");
      setDone(true);
    } catch {
      setErr(d.form.errServer);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div className="result" role="status"><h3>{d.partner.okTitle}</h3><p>{d.partner.okText}</p></div>;
  return (
    <form className="calc glass calc-body" onSubmit={onSubmit} noValidate id="partner">
      <h2 className="h3">{d.partner.title}</h2>
      <div className="grid2">
        <label className="f"><span>{d.partner.company}</span><input className="input" name="name" maxLength={120} required /></label>
        <label className="f"><span>{d.form.phone}</span><input className="input" name="phone" type="tel" inputMode="tel" maxLength={24} required placeholder={d.form.phonePh} /></label>
        <label className="f"><span>{d.partner.telegram}</span><input className="input" name="telegram" maxLength={60} /></label>
      </div>
      <fieldset>
        <legend>{d.partner.services}</legend>
        <div className="choices">{d.partner.servicesOptions.map((o) => <label className="choice" key={o}><input type="checkbox" name="services" value={o} /><b>{o}</b></label>)}</div>
      </fieldset>
      <fieldset>
        <legend>{d.partner.districts}</legend>
        <div className="choices">{districts.map((x) => <label className="choice" key={x.slug}><input type="checkbox" name="districts" value={x.slug} /><b>{x.name}</b></label>)}</div>
      </fieldset>
      <label className="f"><span>{d.form.comment}</span><textarea className="textarea" name="comment" maxLength={1000} /></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} aria-hidden="true" />
      {err && <p className="err" role="alert">{err}</p>}
      <div className="row"><button type="submit" className="btn btn-amber" disabled={busy}>{busy ? d.form.sending : d.partner.submit}</button></div>
    </form>
  );
}
