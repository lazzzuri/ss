import type { EntryKind, SeoEntry } from "./types";
import { services } from "./services";
import { districts } from "./districts";
import { buildings } from "./buildings";

export const ENTRIES: SeoEntry[] = [...services, ...districts, ...buildings];

export function entriesOf(kind: EntryKind): SeoEntry[] {
  return ENTRIES.filter((e) => e.kind === kind);
}

export function getEntry(kind: EntryKind, slug: string): SeoEntry | undefined {
  return ENTRIES.find((e) => e.kind === kind && e.slug === slug);
}

export function entryByRef(ref: string): SeoEntry | undefined {
  const [kind, slug] = ref.split(":");
  if (kind !== "service" && kind !== "district" && kind !== "building") return undefined;
  return getEntry(kind, slug);
}
