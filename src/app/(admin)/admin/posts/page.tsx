import Link from "next/link";
import { hasDb } from "@/lib/db";
import { listAllPosts } from "@/lib/posts";
import { deletePostAction, generateNowAction, materializeSeedAction, setPostStatusAction } from "../actions";

export default async function Posts({ searchParams }: { searchParams: Promise<{ gen?: string }> }) {
  const { gen } = await searchParams;
  const posts = await listAllPosts();
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h2">Статті</h1>
        <form action={generateNowAction}><button className="btn btn-amber" disabled={!hasDb()}>Згенерувати зараз</button></form>
      </div>
      {gen && (
        <p className={`flash ${gen.startsWith("ok") ? "" : "bad"}`}>
          {gen.startsWith("ok") ? "Статтю створено." : gen.startsWith("skip") ? `Пропущено: ${gen.slice(5)}` : `Помилка: ${gen.slice(4)}`}
        </p>
      )}
      <p className="muted">Автопост виходить щодня о 09:17 за Києвом (Vercel Cron). Вбудовані статті можна скопіювати в базу, щоб редагувати.</p>
      <div className="atable-wrap glass">
        <table className="atable">
          <thead><tr><th>Дата</th><th>Заголовок</th><th>Статус</th><th>Джерело</th><th></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td className="mono" style={{ whiteSpace: "nowrap" }}>{new Date(p.publishedAt).toLocaleDateString("uk-UA", { timeZone: "Europe/Kyiv" })}</td>
                <td><a href={`/uk/blog/${p.slug}`} target="_blank" rel="noopener">{p.title.uk}</a></td>
                <td><span className={`pill ${p.status}`}>{p.status === "published" ? "опубліковано" : "чернетка"}</span></td>
                <td className="muted">{p.source === "seed" ? "вбудована" : p.source === "auto" ? "автопост" : "вручну"}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    {p.id ? (
                      <>
                        <Link className="btn btn-glass" style={{ minHeight: 32, padding: "6px 12px" }} href={`/admin/posts/${p.id}`}>Редагувати</Link>
                        <form action={setPostStatusAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} /><button className="btn btn-glass" style={{ minHeight: 32, padding: "6px 12px" }}>{p.status === "published" ? "Сховати" : "Опублікувати"}</button></form>
                        <form action={deletePostAction}><input type="hidden" name="id" value={p.id} /><button className="btn btn-glass" style={{ minHeight: 32, padding: "6px 12px" }}>Видалити</button></form>
                      </>
                    ) : hasDb() ? (
                      <form action={materializeSeedAction}><input type="hidden" name="slug" value={p.slug} /><button className="btn btn-glass" style={{ minHeight: 32, padding: "6px 12px" }}>Копіювати для редагування</button></form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
