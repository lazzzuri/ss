import Link from "next/link";
import type { Block, EntryKind, Faq, L, Lang } from "@/content/types";
import { Inline } from "@/lib/inline";
import { href, entryPath, refPath } from "@/i18n/routes";
import { t } from "@/i18n/dict";
import { catalogItem } from "@/content/catalog";
import type { JsonLdObject } from "@/lib/seo";

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Crumbs({ lang, items }: { lang: Lang; items: { name: string; path?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="breadcrumbs">
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", gap: 6 }}>
          {i > 0 && <span aria-hidden>/</span>}
          {it.path ? <Link href={href(lang, it.path)}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Blocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i}><Inline text={b.text} lang={lang} /></p>;
          case "h2":
            return <h2 key={i} id={`s${i}`}><Inline text={b.text} lang={lang} /></h2>;
          case "h3":
            return <h3 key={i}><Inline text={b.text} lang={lang} /></h3>;
          case "ul":
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} lang={lang} /></li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} lang={lang} /></li>)}</ol>;
          case "note":
            return (
              <div key={i} className="note">
                {b.title && <b>{b.title}</b>}
                <p><Inline text={b.text} lang={lang} /></p>
              </div>
            );
          case "table":
            return (
              <div key={i} className="tbl">
                <table>
                  <thead><tr>{b.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Inline text={c} lang={lang} /></td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export function Toc({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  const items = blocks.map((b, i) => (b.t === "h2" ? { id: `s${i}`, text: b.text } : null)).filter(Boolean) as { id: string; text: string }[];
  if (items.length < 3) return null;
  return (
    <nav className="toc glass" aria-label={t(lang).page.contents}>
      <span className="eyebrow">{t(lang).page.contents}</span>
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`}>{it.text.replace(/\*\*|\[|\]\([^)]*\)/g, "")}</a>
      ))}
    </nav>
  );
}

export function FaqList({ faq, lang }: { faq: Faq[]; lang: Lang }) {
  return (
    <div className="faq">
      {faq.map((f, i) => (
        <details key={i} className="glass-flat">
          <summary><Inline text={f.q} lang={lang} /></summary>
          <p><Inline text={f.a} lang={lang} /></p>
        </details>
      ))}
    </div>
  );
}

const KIND_ICON: Record<string, string> = {
  service: "M4 4h16v16H4zM12 4v16M4 10h16",
  district: "M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  building: "M5 21V5l7-3 7 3v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4",
  page: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
};

const SERVICE_ICON: Record<string, string> = {
  "zamina-vikon": "M4 4h16v16H4zM12 4v16M4 11h16",
  "remont-vikon": "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  "regulyuvannya-vikon": "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4",
  "zamina-sklopaketiv": "M4 4h16v16H4zM9 4l2 6-3 4 2 6M11 10l5 2",
  "balkon-pid-klyuch": "M7 4h10v6H7zM3 10h18M5 10v10M9 10v10M15 10v10M19 10v10M3 20h18",
  "vikna-pislya-obstrilu": "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 8v5M12 16v.5",
  "energozberigayuchi-vikna": "M10 13V5a2 2 0 1 1 4 0v8a4 4 0 1 1-4 0zM12 9v6",
  "vikna-v-pryvatnyi-budynok": "M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5",
};

export function EntryCard({ entry, lang }: { entry: { kind: EntryKind; slug: string; name: L; summary: L }; lang: Lang }) {
  return (
    <Link className="card glass" href={href(lang, entryPath(entry.kind, entry.slug))}>
      <span className="card-icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5fd0d8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={entry.kind === "service" ? SERVICE_ICON[entry.slug] ?? KIND_ICON.service : KIND_ICON[entry.kind]} />
        </svg>
      </span>
      <span className="card-title">{entry.name[lang]}</span>
      <p>{entry.summary[lang]}</p>
      <span className="more">{t(lang).cta.more} →</span>
    </Link>
  );
}

export function Related({ refs, lang }: { refs: string[]; lang: Lang }) {
  const items = refs
    .map((r) => { const [k, sl] = r.split(":"); return { r, e: k === "page" ? undefined : catalogItem(k as EntryKind, sl), p: refPath(r) }; })
    .filter((x) => x.p);
  if (!items.length) return null;
  return (
    <div className="chips">
      {items.map(({ r, e, p }) => (
        <Link key={r} className="chip" href={href(lang, p!)}>
          {e ? e.name[lang] : r.startsWith("page:tsiny") ? t(lang).nav.prices : r.startsWith("page:maistram") ? t(lang).nav.masters : t(lang).nav.how}
        </Link>
      ))}
    </div>
  );
}

export function WindowIcon({ fill = "rgba(255,207,107,.2)", accent = "#ffd27a", size = 56 }: { fill?: string; accent?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="#f1f6fa" strokeWidth="2.4" aria-hidden="true">
      <rect x="10" y="8" width="100" height="104" rx="3" />
      <rect x="14" y="12" width="44" height="96" fill={fill} strokeOpacity=".7" />
      <rect x="62" y="12" width="44" height="96" fill={fill} strokeOpacity=".7" />
      <polyline points="62,12 106,60 62,108" stroke={accent} strokeWidth="2" />
      <polyline points="62,108 84,12 106,108" stroke={accent} strokeWidth="1.8" strokeDasharray="5 4" />
    </svg>
  );
}
