import { NextResponse, type NextRequest } from "next/server";
import { runAutopost } from "@/lib/autopost";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function authorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const result = await runAutopost({ force: req.nextUrl.searchParams.get("force") === "1" });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("autopost failed", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
