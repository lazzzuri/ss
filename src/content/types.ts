export type Lang = "uk" | "ru";
export const LANGS: Lang[] = ["uk", "ru"];

/** A value per language. */
export type L<T = string> = Record<Lang, T>;

export type WindowType = "fixed" | "single" | "double" | "triple" | "balcony";

export interface WindowPreset {
  type: WindowType;
  /** width, cm */
  w: number;
  /** height, cm */
  h: number;
  qty: number;
}

/**
 * Content block. Text fields support inline markup:
 *   **bold**
 *   [anchor text](service:remont-vikon)   internal link by ref (see REFS in slugs.ts)
 */
export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; title?: string; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

export interface Faq {
  q: string;
  a: string;
}

export interface PageText {
  /** <title>, up to 60 characters */
  title: string;
  /** meta description, 130-160 characters */
  description: string;
  /** visible H1, differs from title */
  h1: string;
  /** 1-2 sentences under the H1 */
  lead: string;
  blocks: Block[];
  faq: Faq[];
}

export type EntryKind = "service" | "district" | "building";

export interface SeoEntry {
  kind: EntryKind;
  slug: string;
  /** short name for menus and cards */
  name: L;
  /** one sentence for cards, up to 140 characters */
  summary: L;
  /** which lead widget the page shows */
  form: "calculator" | "repair";
  /** calculator prefill */
  preset?: WindowPreset[];
  /** districts only: neighbourhoods / microdistricts */
  areas?: L<string[]>;
  /** refs like "service:remont-vikon", "district:obolonskyi", "building:stalinka", "page:tsiny" */
  related: string[];
  text: L<PageText>;
}

export interface SeedPost {
  slug: string;
  /** ISO date */
  date: string;
  tags: string[];
  title: L;
  description: L;
  /** Markdown body (## headings, lists, paragraphs, [links](service:slug) allowed) */
  body: L;
  /** prompt used to describe the cover; covers for seed posts are drawn locally */
  coverAlt: L;
}
