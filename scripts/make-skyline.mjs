// Generates public/skyline.svg: Kyiv panel blocks at dusk with lit windows and the TV tower.
import { writeFileSync } from "node:fs";
let seed = 20261105;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const W = 1600, H = 620;
const out = [];
// back layer: distant blocks, dim windows
let x = -20;
while (x < W) {
  const w = pick([60, 80, 100, 120]), h = pick([220, 260, 300, 340, 380]);
  out.push(`<rect x="${x}" y="${H - h}" width="${w}" height="${h}" fill="#1a2846"/>`);
  for (let wy = H - h + 12; wy < H - 6; wy += 11) for (let wx = x + 6; wx < x + w - 6; wx += 10)
    if (rnd() < 0.1) out.push(`<rect x="${wx}" y="${wy}" width="4" height="5" fill="#ffd98f" opacity="${pick([0.35, 0.5, 0.65])}"/>`);
  x += w + pick([0, 6, 12]);
}
// TV tower silhouette with warning lights
const tx = 1210;
out.push(`<path d="M${tx - 26} ${H} L${tx - 7} 120 L${tx + 7} 120 L${tx + 26} ${H} Z" fill="#1a2846"/>`);
for (const y of [200, 300, 400, 500]) out.push(`<path d="M${tx - 26 + (H - y) * 0.0} ${y}h${52 - (H - y) * 0.06}" stroke="#24345a" stroke-width="3"/>`);
out.push(`<rect x="${tx - 9}" y="100" width="18" height="26" fill="#1a2846"/><rect x="${tx - 2}" y="30" width="4" height="72" fill="#1a2846"/>`);
for (const y of [32, 104, 210]) out.push(`<circle cx="${tx}" cy="${y}" r="3.2" fill="#ff5a4e"/><circle cx="${tx}" cy="${y}" r="9" fill="#ff5a4e" opacity=".18"/>`);
// front layer: panel blocks with lit windows
x = -10;
while (x < W) {
  const w = pick([70, 90, 110, 130, 150]), h = pick([150, 190, 230, 270, 320, 360]);
  out.push(`<rect x="${x}" y="${H - h}" width="${w}" height="${h}" fill="#0b1626"/>`);
  for (let wy = H - h + 14; wy < H - 10; wy += 20) for (let wx = x + 8; wx < x + w - 10; wx += 16)
    if (rnd() < 0.23) out.push(`<rect x="${wx}" y="${wy}" width="8" height="10" fill="${pick(["#ffcf6b", "#ffd98f", "#ffe7b5", "#ffcf6b", "#9fd8ff"])}" opacity="${pick([0.6, 0.8, 1])}"/>`);
  x += w + pick([4, 8, 14]);
}
writeFileSync(new URL("../public/skyline.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${out.join("")}</svg>`);
console.log("skyline.svg", out.length, "shapes");
