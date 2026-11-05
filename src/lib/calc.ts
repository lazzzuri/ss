import type { WindowPreset, WindowType } from "@/content/types";
import type { Settings } from "@/config/site";

export type Profile = "econom" | "standard" | "energy";
export type Extra = "removal" | "sill" | "drip" | "net";

export const WINDOW_TYPES: WindowType[] = ["fixed", "single", "double", "triple", "balcony"];
export const PROFILES: Profile[] = ["econom", "standard", "energy"];
export const EXTRAS: Extra[] = ["removal", "sill", "drip", "net"];

/** Sash layout per type: 1 = opening sash, 0 = fixed pane. */
export const SASHES: Record<Exclude<WindowType, "balcony">, number[]> = {
  fixed: [0],
  single: [1],
  double: [0, 1],
  triple: [1, 0, 1],
};

export interface Quote {
  area: number;
  count: number;
  base: number;
  install: number;
  extras: number;
  low: number;
  high: number;
}

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function cleanWindows(list: unknown): WindowPreset[] {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, 30)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const type = WINDOW_TYPES.includes(o.type as WindowType) ? (o.type as WindowType) : "double";
      return {
        type,
        w: Math.round(Math.min(400, Math.max(0, num(o.w)))),
        h: Math.round(Math.min(300, Math.max(0, num(o.h)))),
        qty: Math.round(Math.min(50, Math.max(0, num(o.qty)))),
      };
    })
    .filter((r) => r.w >= 20 && r.h >= 20 && r.qty >= 1);
}

const r100 = (v: number) => Math.round(v / 100) * 100;

export function quote(
  windows: WindowPreset[],
  profile: Profile,
  extras: Extra[],
  s: Pick<Settings, "prices" | "installShare" | "extras">,
): Quote {
  let area = 0;
  let count = 0;
  for (const r of windows) {
    const w = num(r.w), h = num(r.h), q = Math.max(0, Math.round(num(r.qty)));
    if (!w || !h || !q) continue;
    // a balcony block is a door plus a window above a wall section
    area += (w / 100) * (h / 100) * (r.type === "balcony" ? 0.8 : 1) * q;
    count += q;
  }
  const perM2 = s.prices[profile] ?? s.prices.standard;
  const base = area * perM2;
  const install = base * s.installShare;
  const extrasSum = extras.reduce((acc, e) => acc + (s.extras[e] ?? 0) * count, 0);
  const total = base + install + extrasSum;
  return {
    area,
    count,
    base: Math.round(base),
    install: Math.round(install),
    extras: Math.round(extrasSum),
    low: r100(total * 0.9),
    high: r100(total * 1.15),
  };
}

export function formatMoney(n: number, lang: "uk" | "ru" = "uk"): string {
  return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "uk-UA", { maximumFractionDigits: 0 }).format(n);
}

export function formatArea(n: number, lang: "uk" | "ru" = "uk"): string {
  return n.toLocaleString(lang === "ru" ? "ru-RU" : "uk-UA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
