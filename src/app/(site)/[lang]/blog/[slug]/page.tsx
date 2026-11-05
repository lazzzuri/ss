import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { getPublishedPost, listPublishedPosts, readingMinutes } from "@/lib/posts";
import { headings, renderMarkdown } from "@/lib/markdown";
import { t } from "@/i18n/dict";
import { href } from "@/i18n/routes";
import { articleLd, breadcrumbLd, pageMeta } from "@/lib/seo";
import { Crumbs, JsonLd } from "@/components/content";
import { PostCard } from "@/components/post-card";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await listPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getPublishedPost(slug);
  if (!p) return {};
  return pageMeta({ lang, path: `/blog/${slug}`, title: p.title[lang], description: p.description[lang], image: p.coverUrl, type: "article", publishedTime: p.publishedAt });
}

export default async function Post({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  const p = await getPublishedPost(slug);
  if (!p) notFound();
  const d = t(lang);
  const md = p.body[lang];
  const toc = headings(md);
  const date = new Date(p.publishedAt).toLocaleDateString(lang === "uk" ? "uk-UA" : "ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Kyiv" });
  const more = (await listPublishedPosts()).filter((x) => x.slug !== slug).slice(0, 3);
  const crumbs = [{ name: d.page.home, path: "/" }, { name: d.nav.blog, path: "/blog" }, { name: p.title[lang], path: `/blog/${slug}` }];
  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs, lang), articleLd({ lang, title: p.title[lang], description: p.description[lang], path: `/blog/${slug}`, image: p.coverUrl, published: p.publishedAt })]} />
      <div className="wrap"><Crumbs lang={lang} items={[crumbs[0], crumbs[1], { name: p.title[lang] }]} /></div>
      <section className="wrap section" style={{ paddingTop: 18 }}>
        <header className="page-head glass">
          <span className="eyebrow">{date} · {readingMinutes(md)} {d.page.minutes}</span>
          <h1 className="h1" style={{ fontSize: "clamp(26px, 3.6vw, 42px)" }}>{p.title[lang]}</h1>
          <p className="lead">{p.description[lang]}</p>
          {p.tags.length > 0 && <div className="chips">{p.tags.map((tg) => <span key={tg} className="chip">#{tg}</span>)}</div>}
        </header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="article-cover" src={p.coverUrl} alt={p.coverAlt[lang] || p.title[lang]} width={1536} height={1024} />
        <div className="layout">
          <article className="prose glass" dangerouslySetInnerHTML={{ __html: renderMarkdown(md, lang) }} />
          <aside>
            {toc.length > 2 && (
              <nav className="toc glass" aria-label={d.page.contents}>
                <span className="eyebrow">{d.page.contents}</span>
                {toc.map((h) => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
              </nav>
            )}
            <div className="glass" style={{ padding: 18, borderRadius: "var(--r-l)", display: "grid", gap: 12 }}>
              <b>{d.home.calcTitle}</b>
              <p className="muted" style={{ fontSize: 14 }}>{d.home.calcLead}</p>
              <Link className="btn btn-amber" href={`${href(lang)}#calc`}>{d.cta.calc}</Link>
            </div>
          </aside>
        </div>
        {more.length > 0 && (
          <div className="stack">
            <h2 className="h2">{d.page.related}</h2>
            <div className="posts">{more.map((x) => <PostCard key={x.slug} lang={lang} post={x} />)}</div>
          </div>
        )}
      </section>
    </>
  );
}
