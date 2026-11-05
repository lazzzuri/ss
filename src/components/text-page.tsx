import type { ReactNode } from "react";
import type { Lang, PageText } from "@/content/types";
import { t } from "@/i18n/dict";
import { breadcrumbLd, faqLd } from "@/lib/seo";
import { Inline } from "@/lib/inline";
import { Blocks, Crumbs, FaqList, JsonLd } from "./content";

/** Generic page: glass head, prose body, optional extra block, FAQ. */
export function TextPage({ lang, path, text, children, before }: { lang: Lang; path: string; text: PageText; children?: ReactNode; before?: ReactNode }) {
  const d = t(lang);
  const crumbs = [{ name: d.page.home, path: "/" }, { name: text.h1, path }];
  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs, lang), faqLd(text.faq)]} />
      <div className="wrap"><Crumbs lang={lang} items={[crumbs[0], { name: text.h1 }]} /></div>
      <section className="wrap section" style={{ paddingTop: 18 }}>
        <header className="page-head glass">
          <span className="eyebrow">{lang === "uk" ? "Київ" : "Киев"}</span>
          <h1 className="h1" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>{text.h1}</h1>
          <p className="lead"><Inline text={text.lead} lang={lang} /></p>
        </header>
        {before}
        <article className="prose glass">
          <Blocks blocks={text.blocks} lang={lang} />
        </article>
        {children}
        <div className="stack">
          <h2 className="h2">{d.page.faq}</h2>
          <FaqList faq={text.faq} lang={lang} />
        </div>
      </section>
    </>
  );
}
