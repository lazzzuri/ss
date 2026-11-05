// Admin session: a signed, expiring token in an httpOnly cookie.
// Works in both the Edge (middleware) and Node runtimes via Web Crypto.

export const SESSION_COOKIE = "yv_admin";
const DAYS = 14;

function secret(): string | null {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function adminEnabled(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

async function hmac(data: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const exp = Date.now() + DAYS * 864e5;
  const payload = `v1.${exp}`;
  return { value: `${payload}.${await hmac(payload, key)}`, maxAge: DAYS * 86400 };
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  const key = secret();
  if (!key || !token || !adminEnabled()) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return safeEqual(parts[2], await hmac(`${parts[0]}.${parts[1]}`, key));
}

export async function checkPassword(input: string): Promise<boolean> {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  // compare digests so timing does not depend on the password length
  const key = "pw-compare";
  return safeEqual(await hmac(input, key), await hmac(pass, key));
}
