import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { blogMeta } from "@/content/pages";
import { listPublishedPosts } from "@/lib/posts";
import { t } from "@/i18n/dict";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { Crumbs, JsonLd } from "@/components/content";
import { PostCard } from "@/components/post-card";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta({ lang, path: "/blog", title: blogMeta[lang].title, description: blogMeta[lang].description });
}

export default async function Blog({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const posts = await listPublishedPosts();
  const crumbs = [{ name: d.page.home, path: "/" }, { name: d.nav.blog, path: "/blog" }];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs, lang)} />
      <div className="wrap"><Crumbs lang={lang} items={[crumbs[0], { name: d.nav.blog }]} /></div>
      <section className="wrap section" style={{ paddingTop: 18 }}>
        <header className="page-head glass">
          <span className="eyebrow">{d.nav.blog}</span>
          <h1 className="h1" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>{blogMeta[lang].title}</h1>
          <p className="lead">{d.page.blogLead}</p>
        </header>
        {posts.length === 0 ? <p className="muted">{d.page.noPosts}</p> : (
          <div className="posts">
            {posts.map((p) => <PostCard key={p.slug} lang={lang} post={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
