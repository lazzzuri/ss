import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, createSession, SESSION_COOKIE, adminEnabled } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const base = new URL(req.url);
  if (!adminEnabled() || !(await checkPassword(password))) {
    // small delay against brute force
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.redirect(new URL("/admin/login?e=1", base), { status: 303 });
  }
  const s = await createSession();
  const res = NextResponse.redirect(new URL("/admin", base), { status: 303 });
  res.cookies.set(SESSION_COOKIE, s.value, { httpOnly: true, secure: base.protocol === "https:", sameSite: "lax", path: "/", maxAge: s.maxAge });
  return res;
}
