import type { L } from "@/content/types";

export const BRAND: L = { uk: "Ясне вікно", ru: "Ясное окно" };
export const CITY: L = { uk: "Київ", ru: "Киев" };
export const CITY_IN: L = { uk: "у Києві", ru: "в Киеве" };

export interface PriceItem {
  name: L;
  price: L;
}

export interface Settings {
  phone: string;
  telegram: string;
  viber: string;
  email: string;
  /** e.g. "3–7" */
  measureDays: string;
  /** UAH per m² by profile class */
  prices: { econom: number; standard: number; energy: number };
  /** installation as a share of window price */
  installShare: number;
  /** UAH per window */
  extras: { removal: number; sill: number; drip: number; net: number };
  /** repair price list shown on the prices page */
  repairPrices: PriceItem[];
}

export const DEFAULT_SETTINGS: Settings = {
  phone: "",
  telegram: "",
  viber: "",
  email: "",
  measureDays: "3–7",
  prices: { econom: 5200, standard: 6000, energy: 7200 },
  installShare: 0.15,
  extras: { removal: 350, sill: 900, drip: 450, net: 600 },
  repairPrices: [
    { name: { uk: "Виклик майстра і діагностика", ru: "Вызов мастера и диагностика" }, price: { uk: "від 400 ₴", ru: "от 400 ₴" } },
    { name: { uk: "Регулювання стулки, зимовий або літній режим", ru: "Регулировка створки, зимний или летний режим" }, price: { uk: "від 250 ₴ за стулку", ru: "от 250 ₴ за створку" } },
    { name: { uk: "Заміна ущільнювача", ru: "Замена уплотнителя" }, price: { uk: "від 90 ₴ за метр", ru: "от 90 ₴ за метр" } },
    { name: { uk: "Заміна віконної ручки", ru: "Замена оконной ручки" }, price: { uk: "від 300 ₴ + ручка", ru: "от 300 ₴ + ручка" } },
    { name: { uk: "Заміна фурнітури стулки", ru: "Замена фурнитуры створки" }, price: { uk: "від 1 500 ₴", ru: "от 1 500 ₴" } },
    { name: { uk: "Заміна склопакета", ru: "Замена стеклопакета" }, price: { uk: "від 2 800 ₴ за м²", ru: "от 2 800 ₴ за м²" } },
    { name: { uk: "Москітна сітка з установкою", ru: "Москитная сетка с установкой" }, price: { uk: "від 600 ₴", ru: "от 600 ₴" } },
  ],
};

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
