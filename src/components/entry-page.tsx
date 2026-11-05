import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { EntryKind, Lang } from "@/content/types";
import { getEntry, entryByRef } from "@/content";
import { catalogOf } from "@/content/catalog";
import { t } from "@/i18n/dict";
import { href, entryPath, SECTION } from "@/i18n/routes";
import { getSettings } from "@/lib/settings";
import { breadcrumbLd, faqLd, pageMeta, serviceLd } from "@/lib/seo";
import { Inline, plain } from "@/lib/inline";
import { Blocks, Crumbs, EntryCard, FaqList, JsonLd, Related, Toc } from "./content";
import { Calculator, RepairForm } from "./forms";

export function sectionLabel(kind: EntryKind, lang: Lang): string {
  const n = t(lang).nav;
  return kind === "service" ? n.services : kind === "district" ? n.districts : n.buildings;
}

export function entryMetadata(lang: Lang, kind: EntryKind, slug: string): Metadata {
  const e = getEntry(kind, slug);
  if (!e) return {};
  const tx = e.text[lang];
  return pageMeta({ lang, path: entryPath(kind, slug), title: tx.title, description: tx.description });
}

export async function EntryPage({ lang, kind, slug }: { lang: Lang; kind: EntryKind; slug: string }) {
  const e = getEntry(kind, slug);
  if (!e) notFound();
  const d = t(lang);
  const tx = e.text[lang];
  const settings = await getSettings();
  const districts = catalogOf("district").map((x) => ({ slug: x.slug, name: x.name[lang] }));
  const path = entryPath(kind, slug);
  const crumbs = [
    { name: d.page.home, path: "/" },
    { name: sectionLabel(kind, lang), path: `/${SECTION[kind]}` },
    { name: e.name[lang], path },
  ];
  const service = kind === "service" ? slug : "zamina-vikon";
  const relatedEntries = e.related.map(entryByRef).filter(Boolean).slice(0, 6);
  const ld = [breadcrumbLd(crumbs, lang), faqLd(tx.faq)];
  if (kind === "service") ld.push(serviceLd({ lang, name: tx.h1, description: plain(tx.description), path, priceFrom: e.form === "calculator" ? settings.prices.econom : undefined }));

  return (
    <>
      <JsonLd data={ld} />
      <div className="wrap">
        <Crumbs lang={lang} items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c))} />
      </div>

      <section className="wrap section" style={{ paddingTop: 18 }}>
        <header className="page-head glass">
          <span className="eyebrow">{sectionLabel(kind, lang)} · {lang === "uk" ? "Київ" : "Киев"}</span>
          <h1 className="h1" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>{tx.h1}</h1>
          <p className="lead"><Inline text={tx.lead} lang={lang} /></p>
          {e.areas && (
            <div className="chips">
              {e.areas[lang].map((a) => <span key={a} className="chip">{a}</span>)}
            </div>
          )}
          <div className="hero-actions">
            <a className="btn btn-amber" href="#calc">{e.form === "repair" ? d.cta.repair : d.cta.calc}</a>
            {settings.phone && <a className="btn btn-glass mono" href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a>}
          </div>
        </header>

        <div className="layout">
          <article className="prose glass">
            <Blocks blocks={tx.blocks} lang={lang} />
          </article>
          <aside>
            <Toc blocks={tx.blocks} lang={lang} />
            <div className="glass" style={{ padding: 18, borderRadius: "var(--r-l)", display: "grid", gap: 12 }}>
              <span className="eyebrow">{d.page.related}</span>
              <Related refs={e.related} lang={lang} />
            </div>
          </aside>
        </div>

        {e.form === "repair" ? (
          <RepairForm lang={lang} service={service} measureDays={settings.measureDays} districts={districts} defaultDistrict={kind === "district" ? slug : undefined} phone={settings.phone} />
        ) : (
          <Calculator lang={lang} service={service} settings={settings} districts={districts} preset={e.preset} defaultDistrict={kind === "district" ? slug : undefined} phone={settings.phone} />
        )}

        <div className="stack">
          <h2 className="h2">{d.page.faq}</h2>
          <FaqList faq={tx.faq} lang={lang} />
        </div>

        {relatedEntries.length > 0 && (
          <div className="stack">
            <h2 className="h2">{d.page.related}</h2>
            <div className="cards">
              {relatedEntries.map((r) => <EntryCard key={`${r!.kind}-${r!.slug}`} entry={r!} lang={lang} />)}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export async function SectionIndex({ lang, kind }: { lang: Lang; kind: EntryKind }) {
  const d = t(lang);
  const items = catalogOf(kind).map((c) => getEntry(kind, c.slug) ?? c);
  const lead = kind === "service" ? d.page.servicesLead : kind === "district" ? d.page.districtsLead : d.page.buildingsLead;
  const crumbs = [{ name: d.page.home, path: "/" }, { name: sectionLabel(kind, lang), path: `/${SECTION[kind]}` }];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs, lang)} />
      <div className="wrap"><Crumbs lang={lang} items={[crumbs[0], { name: crumbs[1].name }]} /></div>
      <section className="wrap section" style={{ paddingTop: 18 }}>
        <header className="page-head glass">
          <span className="eyebrow">{lang === "uk" ? "Київ" : "Киев"}</span>
          <h1 className="h1" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>{sectionLabel(kind, lang)}</h1>
          <p className="lead">{lead}</p>
        </header>
        <div className={kind === "building" ? "cards c3" : "cards"}>
          {items.map((e) => <EntryCard key={e.slug} entry={e} lang={lang} />)}
        </div>
        <div className="banner glass">
          <div className="stack">
            <h2 className="h2" style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}>{d.home.calcTitle}</h2>
            <p style={{ color: "var(--ink-2)" }}>{d.home.calcLead}</p>
          </div>
          <Link className="btn btn-amber" href={`${href(lang)}#calc`}>{d.cta.calc} →</Link>
        </div>
      </section>
    </>
  );
}

export function sectionMetadata(lang: Lang, kind: EntryKind): Metadata {
  const d = t(lang);
  const city = lang === "uk" ? "у Києві" : "в Киеве";
  const title =
    kind === "service" ? (lang === "uk" ? `Послуги з вікнами ${city}: заміна, ремонт, склопакети` : `Услуги по окнам ${city}: замена, ремонт, стеклопакеты`)
    : kind === "district" ? (lang === "uk" ? `Заміна і ремонт вікон по районах Києва` : `Замена и ремонт окон по районам Киева`)
    : (lang === "uk" ? `Вікна для хрущовки, панельки, сталінки і новобудови` : `Окна для хрущёвки, панельки, сталинки и новостройки`);
  const description = kind === "service" ? d.page.servicesLead : kind === "district" ? d.page.districtsLead : d.page.buildingsLead;
  return pageMeta({ lang, path: `/${SECTION[kind]}`, title, description });
}
