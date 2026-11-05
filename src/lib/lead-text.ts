import type { LeadInput } from "./leads";
import { catalogItem } from "@/content/catalog";
import { formatMoney } from "./calc";

const TYPE_UK: Record<string, string> = {
  fixed: "Глухе",
  single: "Одностулкове",
  double: "Двостулкове",
  triple: "Тристулкове",
  balcony: "Балконний блок",
};
const PROFILE_UK: Record<string, string> = { econom: "Економ", standard: "Стандарт", energy: "Енергозберігаючий" };
const EXTRA_UK: Record<string, string> = { removal: "демонтаж", sill: "підвіконня", drip: "відлив", net: "москітна сітка" };

/** Text of a lead as a master would receive it (always in Ukrainian). */
export function leadText(l: LeadInput & { id?: number }): string {
  const service = catalogItem("service", l.service)?.name.uk ?? l.service;
  const district = l.district === "other" ? "інший / область" : catalogItem("district", l.district)?.name.uk ?? (l.district || "—");
  const lines: string[] = [];
  lines.push(`ЗАЯВКА${l.id ? ` №${l.id}` : ""}: ${service} · Київ, ${district}`);
  if (l.urgent) lines.push("!!! ТЕРМІНОВО");
  if (l.damage) lines.push("!!! Пошкоджено обстрілом");
  lines.push("");
  lines.push(`Ім'я: ${l.name || "—"}`);
  lines.push(`Телефон: ${l.phone}`);
  lines.push(`Адреса / орієнтир: ${l.address || "—"}`);
  lines.push(`Житло: ${l.housing || "—"}${l.floor ? `, ${l.floor} поверх` : ""}`);
  if (l.windows.length) {
    lines.push("");
    lines.push("Вікна:");
    l.windows.forEach((w, i) => lines.push(`  ${i + 1}) ${TYPE_UK[w.type] ?? w.type}, ${w.w} × ${w.h} см, ${w.qty} шт`));
    if (l.profile) lines.push(`Профіль: ${PROFILE_UK[l.profile] ?? l.profile}`);
    lines.push(`Додатково: ${l.extras.length ? l.extras.map((e) => EXTRA_UK[e] ?? e).join(", ") : "—"}`);
    if (l.area != null) lines.push(`Площа: ${l.area.toFixed(1)} м²`);
    if (l.priceLow && l.priceHigh) lines.push(`Клієнт бачив ціну: ${formatMoney(l.priceLow)} – ${formatMoney(l.priceHigh)} грн`);
  }
  if (l.problems.length) {
    lines.push("");
    lines.push(`Проблема: ${l.problems.join("; ")}`);
  }
  lines.push("");
  lines.push(`Фото: ${l.photos ? "може надіслати в месенджер" : "ні"}`);
  if (l.comment) lines.push(`Коментар: ${l.comment}`);
  return lines.join("\n");
}
