import "@fontsource/onest/cyrillic-400.css";
import "@fontsource/onest/latin-400.css";
import "@fontsource/onest/cyrillic-600.css";
import "@fontsource/onest/latin-600.css";
import "@fontsource/unbounded/cyrillic-700.css";
import "@fontsource/unbounded/latin-700.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "../../globals.css";

import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { LogoMark } from "@/components/chrome";

export const metadata: Metadata = { title: "Адмінка · Ясне вікно", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Огляд" },
  { href: "/admin/analytics", label: "Аналітика" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/partners", label: "Майстри" },
  { href: "/admin/posts", label: "Статті" },
  { href: "/admin/settings", label: "Налаштування" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return (
    <html lang="uk">
      <body className="admin">
        <div className="wrap">
          {authed && (
            <header className="admin-top glass">
              <Link className="logo" href="/admin"><LogoMark size={22} /><span>адмінка</span></Link>
              <nav>{NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}</nav>
              <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Link className="btn btn-glass" href="/uk" target="_blank" style={{ minHeight: 36, padding: "8px 14px" }}>Сайт ↗</Link>
                <form action="/api/admin/logout" method="post"><button className="btn btn-glass" style={{ minHeight: 36, padding: "8px 14px" }}>Вийти</button></form>
              </span>
            </header>
          )}
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
