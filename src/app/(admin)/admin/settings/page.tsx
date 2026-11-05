import { hasDb } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "../actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSettings();
  const field = (name: string, label: string, value: string | number, attrs: Record<string, string> = {}) => (
    <label className="f"><span>{label}</span><input className="input" name={name} defaultValue={value} {...attrs} /></label>
  );
  return (
    <>
      <h1 className="h2">Налаштування сайту</h1>
      {!hasDb() && <p className="flash bad">Без бази даних налаштування не зберігаються: сайт показує значення за замовчуванням.</p>}
      {saved && <p className="flash">Збережено. Сайт оновиться протягом хвилини.</p>}
      <form action={saveSettingsAction} style={{ display: "grid", gap: 16 }}>
        <section className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 12 }}>
          <h2 className="h3">Контакти</h2>
          <div className="grid2">
            {field("phone", "Телефон диспетчера", s.phone, { placeholder: "+380 67 000 00 00" })}
            {field("telegram", "Telegram (username)", s.telegram)}
            {field("viber", "Viber", s.viber)}
            {field("email", "Email", s.email)}
            {field("measureDays", "Строк заміру, днів", s.measureDays)}
          </div>
        </section>
        <section className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 12 }}>
          <h2 className="h3">Калькулятор</h2>
          <div className="grid2">
            {field("price_econom", "Економ, ₴/м²", s.prices.econom, { inputMode: "numeric" })}
            {field("price_standard", "Стандарт, ₴/м²", s.prices.standard, { inputMode: "numeric" })}
            {field("price_energy", "Енергозберігаючий, ₴/м²", s.prices.energy, { inputMode: "numeric" })}
            {field("installPct", "Монтаж, % від ціни вікон", Math.round(s.installShare * 100), { inputMode: "numeric" })}
            {field("ex_removal", "Демонтаж, ₴/вікно", s.extras.removal, { inputMode: "numeric" })}
            {field("ex_sill", "Підвіконня, ₴/вікно", s.extras.sill, { inputMode: "numeric" })}
            {field("ex_drip", "Відлив, ₴/вікно", s.extras.drip, { inputMode: "numeric" })}
            {field("ex_net", "Москітна сітка, ₴/вікно", s.extras.net, { inputMode: "numeric" })}
          </div>
        </section>
        <section className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 12 }}>
          <h2 className="h3">Ціни на ремонт (сторінка «Ціни»)</h2>
          {s.repairPrices.map((r, i) => (
            <div key={i} className="grid2" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr" }}>
              {field(`rp_name_uk_${i}`, "Назва (UA)", r.name.uk)}
              {field(`rp_name_ru_${i}`, "Назва (RU)", r.name.ru)}
              {field(`rp_price_uk_${i}`, "Ціна (UA)", r.price.uk)}
              {field(`rp_price_ru_${i}`, "Ціна (RU)", r.price.ru)}
            </div>
          ))}
        </section>
        <div><button className="btn btn-amber" disabled={!hasDb()}>Зберегти</button></div>
      </form>
    </>
  );
}
