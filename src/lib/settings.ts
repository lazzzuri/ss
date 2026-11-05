import { unstable_cache, revalidateTag } from "next/cache";
import { DEFAULT_SETTINGS, type Settings } from "@/config/site";
import { hasDb, sql } from "./db";

function merge(raw: Partial<Settings> | null | undefined): Settings {
  const r = raw ?? {};
  return {
    ...DEFAULT_SETTINGS,
    ...r,
    prices: { ...DEFAULT_SETTINGS.prices, ...(r.prices ?? {}) },
    extras: { ...DEFAULT_SETTINGS.extras, ...(r.extras ?? {}) },
    repairPrices: Array.isArray(r.repairPrices) && r.repairPrices.length ? r.repairPrices : DEFAULT_SETTINGS.repairPrices,
  };
}

async function load(): Promise<Settings> {
  if (!hasDb()) return DEFAULT_SETTINGS;
  try {
    const db = await sql();
    const rows = await db`select value from settings where key = 'site'`;
    return merge(rows[0]?.value as Partial<Settings> | undefined);
  } catch (e) {
    console.error("settings: falling back to defaults", e);
    return DEFAULT_SETTINGS;
  }
}

export const getSettings = unstable_cache(load, ["settings-v1"], { tags: ["settings"], revalidate: 3600 });

export async function saveSettings(next: Settings): Promise<void> {
  const db = await sql();
  const value = merge(next);
  await db`
    insert into settings (key, value, updated_at) values ('site', ${db.json(value as never)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
  revalidateTag("settings");
}
