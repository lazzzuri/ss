import { adminEnabled } from "@/lib/auth";
import { LogoMark } from "@/components/chrome";

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
      <form action="/api/admin/login" method="post" className="glass" style={{ padding: 28, borderRadius: 24, width: "min(380px, 100%)", display: "grid", gap: 14 }}>
        <span className="logo" style={{ display: "flex", gap: 10, alignItems: "center" }}><LogoMark /> <b>Ясне вікно · адмінка</b></span>
        {!adminEnabled() ? (
          <p className="flash bad">Адмінку вимкнено: задайте змінну середовища ADMIN_PASSWORD і перезапустіть сайт.</p>
        ) : (
          <>
            <label className="f"><span>Пароль</span><input className="input" type="password" name="password" autoComplete="current-password" required autoFocus /></label>
            {e && <p className="err">Неправильний пароль.</p>}
            <button className="btn btn-amber" type="submit">Увійти</button>
          </>
        )}
      </form>
    </div>
  );
}
