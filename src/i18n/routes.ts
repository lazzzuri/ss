import type { EntryKind, Lang } from "@/content/types";
import { LANGS } from "@/content/types";

export const SECTION: Record<EntryKind, string> = {
  service: "poslugy",
  district: "rayony",
  building: "budynky",
};

export function isLang(v: string | undefined): v is Lang {
  return !!v && (LANGS as string[]).includes(v);
}

/** "/poslugy/remont-vikon" style path without the language prefix. */
export function entryPath(kind: EntryKind, slug: string): string {
  return `/${SECTION[kind]}/${slug}`;
}

/** Resolve a content ref ("service:slug", "page:tsiny") to a path without language. */
export function refPath(ref: string): string | null {
  const [kind, slug] = ref.split(":");
  if (!slug) return null;
  if (kind === "page") return `/${slug}`;
  if (kind === "service" || kind === "district" || kind === "building") return entryPath(kind, slug);
  if (kind === "post") return `/blog/${slug}`;
  return null;
}

/** Prefix a language-less path. */
export function href(lang: Lang, path = "/"): string {
  if (path === "/" || path === "") return `/${lang}`;
  return `/${lang}${path.startsWith("/") ? path : `/${path}`}`;
}
