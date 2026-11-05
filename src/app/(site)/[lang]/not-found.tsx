import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap section" style={{ minHeight: "60vh", alignContent: "center" }}>
      <div className="page-head glass" style={{ maxWidth: 720 }}>
        <span className="eyebrow">404</span>
        <h1 className="h1" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>Сторінку не знайдено</h1>
        <p className="lead">Можливо, її перенесли. Почніть з головної або розрахуйте ціну вікон.</p>
        <div className="hero-actions">
          <Link className="btn btn-amber" href="/uk#calc">Розрахувати ціну</Link>
          <Link className="btn btn-glass" href="/uk">На головну</Link>
        </div>
      </div>
    </section>
  );
}
