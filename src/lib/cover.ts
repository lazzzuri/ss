// Procedural blog cover in the site's "Kyiv at dusk" style. No text, deterministic per seed.
// Used for built-in posts and as a fallback when no image-generation key is configured.

function prng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  let s = h >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

const PALETTES = [
  ["#0c1d3a", "#2a3c66", "#a0627a", "#e39a6a"],
  ["#081428", "#173a5c", "#3f7f93", "#9fd0c8"],
  ["#1a1033", "#4b2a6b", "#c25d6e", "#f2a65a"],
  ["#0b1a2c", "#22456b", "#6f8fb8", "#e8c38e"],
];

export function coverSvg(seed: string, w = 1536, h = 1024): string {
  const r = prng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const p = pick(PALETTES);
  const parts: string[] = [];
  parts.push(`<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".45" stop-color="${p[1]}"/><stop offset=".78" stop-color="${p[2]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#ffb46a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient>
  <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${30 + r() * 30}"/></filter></defs>`);
  parts.push(`<rect width="${w}" height="${h}" fill="url(#sky)"/><rect width="${w}" height="${h}" fill="url(#glow)"/>`);
  parts.push(`<circle cx="${w * (0.15 + r() * 0.7)}" cy="${h * (0.18 + r() * 0.2)}" r="${40 + r() * 50}" fill="#ffe6b0" opacity=".5" filter="url(#blur)"/>`);
  // skyline
  let x = -10;
  while (x < w) {
    const bw = pick([70, 90, 110, 140]), bh = h * (0.18 + r() * 0.3);
    parts.push(`<rect x="${x}" y="${h - bh}" width="${bw}" height="${bh}" fill="#0b1626"/>`);
    for (let wy = h - bh + 14; wy < h - 10; wy += 22)
      for (let wx = x + 9; wx < x + bw - 10; wx += 17)
        if (r() < 0.22) parts.push(`<rect x="${wx}" y="${wy}" width="9" height="11" fill="${pick(["#ffcf6b", "#ffd98f", "#ffe7b5", "#9fd8ff"])}" opacity="${pick([0.6, 0.85, 1])}"/>`);
    x += bw + pick([4, 8, 14]);
  }
  // big window in front (frame + panes + glints)
  const fw = w * (0.36 + r() * 0.12), fh = h * (0.62 + r() * 0.1);
  const fx = w * (0.08 + r() * (0.84 - 0.36 - 0.12)), fy = h * 0.1;
  const sashes = pick([2, 2, 3]);
  parts.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="10" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.75)" stroke-width="10"/>`);
  for (let i = 1; i < sashes; i++) parts.push(`<rect x="${fx + (fw / sashes) * i - 5}" y="${fy}" width="10" height="${fh}" fill="rgba(255,255,255,.75)"/>`);
  for (let i = 0; i < sashes; i++) {
    const sx = fx + (fw / sashes) * i;
    parts.push(`<path d="M${sx + 30} ${fy + 60} l${50} ${-40} M${sx + 30} ${fy + 110} l${100} ${-80}" stroke="rgba(255,255,255,.45)" stroke-width="6" stroke-linecap="round"/>`);
  }
  parts.push(`<rect x="${fx + fw / sashes - 26}" y="${fy + fh / 2 - 40}" width="14" height="80" rx="7" fill="#f1f6fa"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${parts.join("")}</svg>`;
}
