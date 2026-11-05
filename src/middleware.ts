import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // admin area
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();
    const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (ok) return NextResponse.next();
    if (pathname.startsWith("/api/")) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // language prefix
  const first = pathname.split("/")[1];
  if (first === "uk" || first === "ru") return NextResponse.next();
  const pref = req.cookies.get("lang")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const lang = pref === "ru" || pref === "uk" ? pref : /^ru\b/i.test(accept) ? "ru" : "uk";
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, pathname === "/" ? 307 : 308);
}

export const config = {
  matcher: ["/((?!_next|api(?!/admin)|favicon|icon|og|skyline|robots.txt|sitemap.xml|.*\\.[a-z0-9]+$).*)", "/api/admin/:path*"],
};
