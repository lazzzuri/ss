// Validates SEO content files. Usage: node scripts/check-content.mjs [services|districts|buildings|posts ...]
// Node 22 strips TypeScript types on import, so the .ts content files load directly.
import { REFS, SERVICE_SLUGS, DISTRICT_SLUGS, BUILDING_SLUGS } from "../src/content/slugs.ts";

const which = process.argv.slice(2);
const want = (n) => which.length === 0 || which.includes(n);
const errors = [];
const warns = [];
const sentences = new Map(); // normalized sentence -> first location

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function checkInline(text, where) {
  if (typeof text !== "string" || !text.trim()) errors.push(`${where}: empty text`);
  for (const m of String(text).matchAll(LINK)) {
    if (!REFS.includes(m[2])) errors.push(`${where}: unknown link ref "${m[2]}"`);
  }
  for (const s of String(text).replace(LINK, "$1").split(/(?<=[.!?])\s+/)) {
    const n = s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
    if (n.split(" ").length < 9) continue;
    const prev = sentences.get(n);
    if (prev && prev !== where.split(" ")[0]) warns.push(`${where}: sentence repeats ${prev}: "${s.slice(0, 80)}…"`);
    else sentences.set(n, where.split(" ")[0]);
  }
}

function words(t) {
  return String(t).replace(LINK, "$1").split(/\s+/).filter(Boolean).length;
}

function checkEntry(e, kind, slugs) {
  const id = `${kind}:${e.slug}`;
  if (e.kind !== kind) errors.push(`${id}: kind must be "${kind}"`);
  if (!slugs.includes(e.slug)) errors.push(`${id}: slug not in slugs.ts`);
  for (const r of e.related ?? []) if (!REFS.includes(r)) errors.push(`${id}: related ref "${r}" unknown`);
  if (!["calculator", "repair"].includes(e.form)) errors.push(`${id}: form must be calculator|repair`);
  if (kind === "district" && (!e.areas?.uk?.length || !e.areas?.ru?.length)) errors.push(`${id}: areas required`);
  for (const p of e.preset ?? []) {
    if (!["fixed", "single", "double", "triple", "balcony"].includes(p.type)) errors.push(`${id}: bad preset type`);
    if (!(p.w >= 30 && p.w <= 400 && p.h >= 30 && p.h <= 300 && p.qty >= 1)) errors.push(`${id}: preset size out of range`);
  }
  for (const lang of ["uk", "ru"]) {
    const where = `${id}/${lang}`;
    const t = e.text?.[lang];
    if (!t) { errors.push(`${where}: missing text`); continue; }
    if (!e.name?.[lang]) errors.push(`${where}: missing name`);
    if (!e.summary?.[lang] || e.summary[lang].length > 140) errors.push(`${where}: summary missing or > 140 chars (${e.summary?.[lang]?.length})`);
    if (!t.title || t.title.length > 60) errors.push(`${where}: title missing or > 60 chars (${t.title?.length}): ${t.title}`);
    if (!t.description || t.description.length < 110 || t.description.length > 165) errors.push(`${where}: description should be 110-165 chars (${t.description?.length})`);
    if (!t.h1 || t.h1 === t.title) errors.push(`${where}: h1 missing or equal to title`);
    checkInline(t.lead, `${where} lead`);
    let total = words(t.lead);
    let h2 = 0;
    for (const [i, b] of (t.blocks ?? []).entries()) {
      const w = `${where} block${i}`;
      if (b.t === "h2") h2++;
      if (["p", "h2", "h3"].includes(b.t)) { checkInline(b.text, w); total += words(b.text); }
      else if (b.t === "note") { checkInline(b.text, w); total += words(b.text); }
      else if (b.t === "ul" || b.t === "ol") { if (!b.items?.length) errors.push(`${w}: empty list`); for (const it of b.items ?? []) { checkInline(it, w); total += words(it); } }
      else if (b.t === "table") { if (!b.head?.length || !b.rows?.length) errors.push(`${w}: empty table`); for (const r of b.rows ?? []) if (r.length !== b.head.length) errors.push(`${w}: row width != head`); }
      else errors.push(`${w}: unknown block type ${b.t}`);
    }
    if (h2 < 3) errors.push(`${where}: needs at least 3 h2 blocks (has ${h2})`);
    if ((t.faq ?? []).length < 4) errors.push(`${where}: needs at least 4 FAQ items`);
    for (const [i, f] of (t.faq ?? []).entries()) { checkInline(f.q, `${where} faq${i}q`); checkInline(f.a, `${where} faq${i}a`); total += words(f.a); }
    if (total < 420) errors.push(`${where}: too short (${total} words, need 420+)`);
    if (total > 1400) warns.push(`${where}: long (${total} words)`);
  }
}

async function run() {
  const sets = [
    ["services", "service", SERVICE_SLUGS],
    ["districts", "district", DISTRICT_SLUGS],
    ["buildings", "building", BUILDING_SLUGS],
  ];
  for (const [file, kind, slugs] of sets) {
    if (!want(file)) continue;
    let mod;
    try { mod = await import(`../src/content/${file}.ts`); } catch (e) { errors.push(`${file}.ts: cannot import: ${e.message}`); continue; }
    const list = mod[file];
    if (!Array.isArray(list)) { errors.push(`${file}.ts must export const ${file}: SeoEntry[]`); continue; }
    const seen = new Set();
    for (const e of list) { if (seen.has(e.slug)) errors.push(`${file}: duplicate ${e.slug}`); seen.add(e.slug); checkEntry(e, kind, [...slugs]); }
    for (const s of slugs) if (!seen.has(s)) errors.push(`${file}: missing entry for ${s}`);
  }
  if (want("posts")) {
    try {
      const { seedPosts } = await import("../src/content/seed-posts.ts");
      for (const p of seedPosts) {
        for (const lang of ["uk", "ru"]) {
          if (!p.title?.[lang] || p.title[lang].length > 70) errors.push(`post ${p.slug}/${lang}: title missing or > 70`);
          if (!p.description?.[lang]) errors.push(`post ${p.slug}/${lang}: description missing`);
          const w = words(p.body?.[lang] ?? "");
          if (w < 500) errors.push(`post ${p.slug}/${lang}: body too short (${w})`);
          for (const m of String(p.body?.[lang] ?? "").matchAll(LINK)) if (!REFS.includes(m[2])) errors.push(`post ${p.slug}/${lang}: unknown ref ${m[2]}`);
        }
      }
    } catch (e) { errors.push(`seed-posts.ts: ${e.message}`); }
  }
  for (const w of warns) console.log("WARN", w);
  for (const e of errors) console.log("ERROR", e);
  console.log(errors.length ? `\n${errors.length} errors` : "\nOK: no errors");
  process.exit(errors.length ? 1 : 0);
}
run();
