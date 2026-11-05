import { Marked } from "marked";
import type { Lang } from "@/content/types";
import { href, refPath } from "@/i18n/routes";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function makeMarked(lang: Lang) {
  const m = new Marked({ gfm: true, breaks: false });
  m.use({
    renderer: {
      // never pass raw HTML through: posts are generated text
      html(token) {
        return esc(token.text);
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        const ref = refPath(token.href);
        if (ref) return `<a href="${href(lang, ref)}">${text}</a>`;
        if (/^https?:\/\//.test(token.href)) {
          return `<a href="${esc(token.href)}" rel="nofollow noopener" target="_blank">${text}</a>`;
        }
        return text;
      },
      image() {
        return "";
      },
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const level = Math.min(4, Math.max(2, token.depth));
        const id = token.text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60);
        return `<h${level} id="${esc(id)}">${text}</h${level}>`;
      },
    },
  });
  return m;
}

const cache: Partial<Record<Lang, Marked>> = {};

export function renderMarkdown(md: string, lang: Lang): string {
  const m = (cache[lang] ??= makeMarked(lang));
  return m.parse(md, { async: false }) as string;
}

/** Table of contents from ## headings. */
export function headings(md: string): { id: string; text: string }[] {
  return [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const text = m[1].replace(/\*\*|\[|\]\([^)]*\)/g, "").trim();
    return {
      text,
      id: text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60),
    };
  });
}
