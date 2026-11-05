"use client";

// First-party anonymous analytics: a random visitor id (no names, no phones), sessions,
// pageviews, every click, scroll depth, time on page and form funnel events.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Ev = { t: string; p: string; l?: string; v?: number; m?: Record<string, unknown>; ts: number };

const queue: Ev[] = [];
const URGENT = new Set(["pageview", "calc_interact", "calc_step2", "form_submit", "repair_submit", "lead", "phone_click", "messenger_click", "form_error", "partner_lead"]);
let vid = "";
let sid = "";

function rid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function ensureIds() {
  if (vid && sid) return;
  try {
    vid = localStorage.getItem("yv_vid") || "";
    if (!vid) {
      vid = rid();
      localStorage.setItem("yv_vid", vid);
    }
  } catch {
    vid = vid || rid();
  }
  try {
    const last = Number(sessionStorage.getItem("yv_last") || 0);
    const cur = sessionStorage.getItem("yv_sid");
    if (cur && Date.now() - last < 30 * 60e3) sid = cur;
    else {
      sid = rid();
      sessionStorage.setItem("yv_sid", sid);
      sessionStorage.removeItem("yv_utm");
    }
  } catch {
    sid = sid || rid();
  }
}

function touch() {
  try {
    sessionStorage.setItem("yv_last", String(Date.now()));
  } catch {}
}

function utm(): Record<string, string> | null {
  try {
    const saved = sessionStorage.getItem("yv_utm");
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(location.search);
    const out: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]) {
      const v = q.get(k);
      if (v) out[k] = v.slice(0, 100);
    }
    sessionStorage.setItem("yv_utm", JSON.stringify(out));
    return out;
  } catch {
    return null;
  }
}

export function trackerIds(): { vid: string; sid: string } {
  if (typeof window !== "undefined") ensureIds();
  return { vid, sid };
}

export function track(t: string, l?: string, v?: number, m?: Record<string, unknown>, path?: string) {
  if (typeof window === "undefined") return;
  ensureIds();
  touch();
  queue.push({ t, p: path ?? location.pathname, l: l?.slice(0, 120), v: typeof v === "number" && Number.isFinite(v) ? v : undefined, m, ts: Date.now() });
  if (queue.length >= 25 || URGENT.has(t)) flush();
  // mirror key conversions to Google Analytics / Clarity when they are enabled
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; clarity?: (...a: unknown[]) => void };
  if (["lead", "calc_step2", "phone_click", "form_submit", "calc_interact"].includes(t)) {
    try { w.gtag?.("event", t === "lead" ? "generate_lead" : t, { value: v, currency: "UAH", label: l }); } catch {}
    try { w.clarity?.("event", t); } catch {}
  }
}

function flush(beacon = false) {
  if (!queue.length) return;
  const events = queue.splice(0, queue.length);
  const body = JSON.stringify({
    vid,
    sid,
    lang: document.documentElement.lang,
    ref: document.referrer,
    utm: utm(),
    w: window.innerWidth,
    events,
  });
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/t", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {}
  fetch("/api/t", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

function labelOf(el: Element): string {
  const h = el as HTMLElement;
  return (
    h.dataset?.track ||
    h.getAttribute("aria-label") ||
    (h as HTMLInputElement).name ||
    (h.innerText || h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80) ||
    h.tagName.toLowerCase()
  );
}

export function Tracker() {
  const path = usePathname();

  useEffect(() => {
    ensureIds();
    const iv = setInterval(() => flush(), 3000);
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest("[data-track],a,button,summary,label,input,select,textarea");
      if (!el) return;
      const tag = el.tagName;
      const href = el.getAttribute("href") || "";
      const sectionEl = el.closest("section[id],section[aria-labelledby],header,footer,aside");
      const section = sectionEl ? sectionEl.id || sectionEl.getAttribute("aria-labelledby") || sectionEl.tagName.toLowerCase() : "";
      const meta: Record<string, unknown> = { section, x: Math.round((e.clientX / window.innerWidth) * 100), y: Math.round(window.scrollY + e.clientY) };
      if (href) meta.href = href.slice(0, 200);
      if (href.startsWith("tel:")) return track("phone_click", href.slice(4), undefined, meta);
      if (/t\.me|viber:|wa\.me/.test(href)) return track("messenger_click", href, undefined, meta);
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return track("field", labelOf(el), undefined, meta);
      track("click", labelOf(el), undefined, meta);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => flush(true));
    return () => {
      clearInterval(iv);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    const started = Date.now();
    const here = window.location.pathname;
    let active = 0;
    let lastTick = Date.now();
    const seen = new Set<number>();
    track("pageview", document.title, undefined, { w: window.innerWidth, h: window.innerHeight });
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") active += Date.now() - lastTick;
      lastTick = Date.now();
    }, 1000);
    const onScroll = () => {
      const d = document.documentElement;
      const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / Math.max(1, d.scrollHeight)) * 100));
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !seen.has(m)) {
          seen.add(m);
          track("scroll", String(m), m);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const leave = () => track("leave", undefined, Math.round((active || Date.now() - started) / 1000), undefined, here);
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(tick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [path]);

  return null;
}
