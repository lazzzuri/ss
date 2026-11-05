import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/content/types";
import { href, refPath } from "@/i18n/routes";

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Renders inline content markup: **bold** and [text](ref) internal links. */
export function Inline({ text, lang }: { text: string; lang: Lang }) {
  const parts = text.split(TOKEN).filter(Boolean);
  const out: ReactNode[] = parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const path = refPath(m[2]);
      if (!path) return m[1];
      return (
        <Link key={i} href={href(lang, path)}>
          {m[1]}
        </Link>
      );
    }
    return p;
  });
  return <>{out}</>;
}

/** Plain text without markup (for meta tags and JSON-LD). */
export function plain(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
