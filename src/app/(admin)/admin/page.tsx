import Link from "next/link";
import { hasDb } from "@/lib/db";
import { leadStats, listLeads } from "@/lib/leads";
import { imageProvider } from "@/lib/images";
import { leadText } from "@/lib/lead-text";
import { generateNowAction } from "./actions";

function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <tr>
      <td><span className={`pill ${ok ? "active" : "urgent"}`}>{ok ? "готово" : "немає"}</span></td>
      <td><b>{label}</b></td>
      <td className="muted">{hint}</td>
    </tr>
  );
}

export default async function Dashboard() {
  const db = hasDb();
  let stats = null as Awaited<ReturnType<typeof leadStats>> | null;
  let recent: Awaited<ReturnType<typeof listLeads>> = [];
  let dbError = "";
  if (db) {
    try {
      stats = await leadStats();
      recent = await listLeads("new", 5);
    } catch (e) {
      dbError = e instanceof Error ? e.message : "error";
    }
  }
  const img = imageProvider();
  return (
    <>
      <h1 className="h2">Огляд</h1>
      {stats && (
        <div className="stats">
          <div className="stat glass"><b>{stats.today}</b><span>заявок сьогодні</span></div>
          <div className="stat glass"><b>{stats.week}</b><span>за 7 днів</span></div>
          <div className="stat glass"><b>{stats.newCount}</b><span>нових, не передано</span></div>
          <div className="stat glass"><b>{stats.total}</b><span>усього</span></div>
          <div className="stat glass"><b>{stats.soldSum.toLocaleString("uk-UA")} ₴</b><span>продано заявок на суму</span></div>
        </div>
      )}
      {dbError && <p className="flash bad">База даних недоступна: {dbError}</p>}

      <section className="glass" style={{ padding: 18, borderRadius: 20, display: "grid", gap: 10 }}>
        <h2 className="h3">Підключення</h2>
        <div className="atable-wrap">
          <table className="atable">
            <tbody>
              <Check ok={db && !dbError} label="База даних" hint="DATABASE_URL — Neon або Supabase. Таблиці створюються самі." />
              <Check ok={!!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID} label="Telegram-сповіщення" hint="TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID — кожна заявка приходить у чат." />
              <Check ok={!!process.env.ANTHROPIC_API_KEY} label="Тексти статей (Claude)" hint="ANTHROPIC_API_KEY — щоденний автопост." />
              <Check ok={img !== "procedural"} label="Генерація картинок" hint={img === "procedural" ? "OPENAI_API_KEY або REPLICATE_API_TOKEN. Без них малюється абстрактна обкладинка." : `Провайдер: ${img}`} />
              <Check ok={!!process.env.BLOB_READ_WRITE_TOKEN} label="Сховище картинок" hint="BLOB_READ_WRITE_TOKEN (Vercel Blob). Без нього картинки зберігаються в базі." />
              <Check ok={!!process.env.CRON_SECRET} label="Захист автопосту" hint="CRON_SECRET — Vercel сам передає його в щоденний запуск." />
            </tbody>
          </table>
        </div>
        <form action={generateNowAction}><button className="btn btn-amber" type="submit">Згенерувати статтю зараз</button></form>
      </section>

      {recent.length > 0 && (
        <section style={{ display: "grid", gap: 10 }}>
          <div className="row"><h2 className="h3">Нові заявки</h2><Link href="/admin/leads">усі →</Link></div>
          {recent.map((l) => <div key={l.id} className="lead-card glass"><pre>{leadText(l)}</pre></div>)}
        </section>
      )}
    </>
  );
}
