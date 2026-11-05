import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import { savePostAction } from "../../actions";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const p = await getPostById(Number(id));
  if (!p) notFound();
  return (
    <>
      <h1 className="h2">Редагування статті</h1>
      {saved && <p className="flash">Збережено.</p>}
      <form action={savePostAction} className="glass" style={{ padding: 20, borderRadius: 20, display: "grid", gap: 14 }}>
        <input type="hidden" name="id" value={p.id ?? ""} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.coverUrl} alt="" style={{ width: "min(420px, 100%)", borderRadius: 14 }} />
        <div className="grid2">
          <label className="f"><span>Статус</span><select className="select" name="status" defaultValue={p.status}><option value="published">опубліковано</option><option value="draft">чернетка</option></select></label>
          <label className="f"><span>Теги (через кому)</span><input className="input" name="tags" defaultValue={p.tags.join(", ")} /></label>
        </div>
        <div className="split">
          {(["uk", "ru"] as const).map((l) => (
            <div key={l} style={{ display: "grid", gap: 10 }}>
              <b>{l === "uk" ? "Українська" : "Русский"}</b>
              <label className="f"><span>Заголовок</span><input className="input" name={`title_${l}`} defaultValue={p.title[l]} /></label>
              <label className="f"><span>Опис для Google</span><textarea className="textarea" name={`description_${l}`} defaultValue={p.description[l]} style={{ minHeight: 70 }} /></label>
              <label className="f"><span>Alt картинки</span><input className="input" name={`alt_${l}`} defaultValue={p.coverAlt[l]} /></label>
              <label className="f"><span>Текст (Markdown)</span><textarea className="textarea mono" name={`body_${l}`} defaultValue={p.body[l]} style={{ minHeight: 420, fontSize: 13.5 }} /></label>
            </div>
          ))}
        </div>
        <div className="row"><button className="btn btn-amber">Зберегти</button><a className="btn btn-glass" href={`/uk/blog/${p.slug}`} target="_blank" rel="noopener">Відкрити на сайті ↗</a></div>
      </form>
    </>
  );
}
