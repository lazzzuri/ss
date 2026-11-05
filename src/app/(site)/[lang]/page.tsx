import Link from "next/link";
import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { t, fill } from "@/i18n/dict";
import { href, entryPath } from "@/i18n/routes";
import { getSettings } from "@/lib/settings";
import { catalogOf } from "@/content/catalog";
import { homeFaq, homeMeta } from "@/content/pages";
import { Calculator } from "@/components/forms";
import { EntryCard, FaqList, JsonLd } from "@/components/content";
import { faqLd, orgLd, pageMeta, websiteLd } from "@/lib/seo";
import { formatMoney } from "@/lib/calc";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta({ lang, path: "/", title: homeMeta[lang].title, description: homeMeta[lang].description });
}

export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const settings = await getSettings();
  const services = catalogOf("service");
  const districts = catalogOf("district");
  const buildings = catalogOf("building");
  const districtOpts = districts.map((x) => ({ slug: x.slug, name: x.name[lang] }));
  const pct = Math.round(settings.installShare * 100);

  return (
    <>
      <JsonLd data={[orgLd(lang, settings.phone), websiteLd(lang), faqLd(homeFaq[lang])]} />

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy glass">
            <span className="eyebrow">{d.home.eyebrow}</span>
            <h1 className="h1">{d.home.h1}</h1>
            <p className="lead">{d.home.lead}</p>
            <div className="hero-actions">
              <a className="btn btn-amber" href="#calc">{d.cta.calc}</a>
              <Link className="btn btn-glass" href={href(lang, entryPath("service", "remont-vikon"))}>{d.cta.repair}</Link>
            </div>
            <ul className="facts">
              {d.home.facts.map((f, i) => (
                <li key={i}>
                  <b>{fill(f.b, { days: settings.measureDays })}</b>
                  <span>{f.s}</span>
                </li>
              ))}
            </ul>
          </div>
          <Calculator
            lang={lang}
            service="zamina-vikon"
            settings={settings}
            districts={districtOpts}
            phone={settings.phone}
          />
        </div>
      </section>

      <section className="wrap section" aria-labelledby="h-services">
        <div className="section-head">
          <h2 className="h2" id="h-services">{d.home.servicesTitle}</h2>
          <p>{d.home.servicesLead}</p>
        </div>
        <div className="cards">
          {services.map((e) => <EntryCard key={e.slug} entry={e} lang={lang} />)}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="h-how">
        <div className="section-head">
          <h2 className="h2" id="h-how">{d.home.howTitle}</h2>
        </div>
        <ol className="steps">
          {d.steps.map((s, i) => (
            <li key={i} className="glass">
              <b>{s.b}</b>
              <p>{s.s}</p>
            </li>
          ))}
        </ol>
        <div className="banner warn glass">
          <div className="stack">
            <h3 className="h2" style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}>{d.home.damageTitle}</h3>
            <p className="muted" style={{ color: "var(--ink-2)", maxWidth: "70ch" }}>{d.home.damageText}</p>
          </div>
          <Link className="btn btn-glass" href={href(lang, entryPath("service", "vikna-pislya-obstrilu"))}>{d.home.damageCta} →</Link>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="h-prices">
        <div className="section-head">
          <h2 className="h2" id="h-prices">{d.home.pricesTitle}</h2>
          <p>{d.home.pricesLead}</p>
        </div>
        <div className="split">
          <div className="table-wrap glass">
            <table className="prices">
              <thead>
                <tr><th>{d.calc.profile}</th><th>{d.prices.perM2}</th></tr>
              </thead>
              <tbody>
                {(["econom", "standard", "energy"] as const).map((p) => (
                  <tr key={p}>
                    <td><b>{d.calc.profiles[p].name}</b><br /><span className="muted" style={{ fontSize: 13.5 }}>{d.calc.profiles[p].note}</span></td>
                    <td className="num">{formatMoney(settings.prices[p], lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-wrap glass">
            <table className="prices">
              <thead>
                <tr><th>{d.prices.extrasTitle}</th><th>₴</th></tr>
              </thead>
              <tbody>
                {(["removal", "sill", "drip", "net"] as const).map((x) => (
                  <tr key={x}><td>{d.calc.extraNames[x]}</td><td className="num">{formatMoney(settings.extras[x], lang)}</td></tr>
                ))}
                <tr><td colSpan={2} className="muted" style={{ fontSize: 13.5 }}>{fill(d.prices.installNote, { pct })}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div><Link className="btn btn-glass" href={href(lang, "/tsiny")}>{d.cta.all} {d.nav.prices.toLowerCase()} →</Link></div>
      </section>

      <section className="wrap section" aria-labelledby="h-districts">
        <div className="section-head">
          <h2 className="h2" id="h-districts">{d.home.districtsTitle}</h2>
        </div>
        <div className="chips">
          {districts.map((x) => (
            <Link key={x.slug} className="chip" href={href(lang, entryPath("district", x.slug))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fd0d8" strokeWidth="2" aria-hidden><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" /></svg>
              {x.name[lang]}
            </Link>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: 18 }}>
          <h2 className="h2">{d.home.buildingsTitle}</h2>
        </div>
        <div className="cards c3">
          {buildings.map((e) => <EntryCard key={e.slug} entry={e} lang={lang} />)}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="h-faq">
        <div className="split" style={{ alignItems: "start" }}>
          <div className="stack">
            <h2 className="h2" id="h-faq">{d.home.faqTitle}</h2>
            <FaqList faq={homeFaq[lang]} lang={lang} />
          </div>
          <div className="banner glass" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
            <span className="eyebrow">{d.nav.masters}</span>
            <h3 className="h2" style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}>{d.home.mastersTitle}</h3>
            <p style={{ color: "var(--ink-2)" }}>{d.home.mastersText}</p>
            <div><Link className="btn btn-amber" href={href(lang, "/maistram")}>{d.partner.submit} →</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
