import { writeThemedPair, esc, PALETTE } from "./lib/svg.mjs";

const W = 1000;
const H = 320;
const PAD_L = 50;
const PAD_R = 30;
const PLOT_W = W - PAD_L - PAD_R;
const MOUNTAIN_TOP = 50;
const MOUNTAIN_BOTTOM = 230;
const STRIP_Y = 246;
const STRIP_H = 14;

function categoryColor(count) {
  if (count <= 0) return { color: "#8c959f", label: "plat" };
  if (count <= 2) return { color: "#2ecc40", label: "cat. 4" };
  if (count <= 5) return { color: "#2f81f7", label: "cat. 3" };
  if (count <= 9) return { color: "#ff8c00", label: "cat. 2" };
  if (count <= 14) return { color: "#e8384f", label: "cat. 1" };
  return { color: "#FFD700", label: "HC" };
}

function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
}

export function renderStage(stats, theme) {
  const p = PALETTE[theme];
  const days = stats.days.length ? stats.days : [{ date: new Date().toISOString(), contributionCount: 0 }];
  const n = days.length;
  const stepX = PLOT_W / Math.max(n - 1, 1);

  let cumulative = 0;
  const cumArr = days.map((d) => {
    cumulative += d.contributionCount;
    return cumulative;
  });
  const max = Math.max(cumulative, 1);

  const pointsFor = (x0, y0, yRange) =>
    cumArr.map((v, i) => {
      const x = x0 + i * stepX;
      const y = y0 - (v / max) * yRange;
      return [x, y];
    });

  const pts = pointsFor(PAD_L, MOUNTAIN_BOTTOM, MOUNTAIN_BOTTOM - MOUNTAIN_TOP);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${(PAD_L + PLOT_W).toFixed(1)},${MOUNTAIN_BOTTOM} L${PAD_L},${MOUNTAIN_BOTTOM} Z`;

  // Climb-category strip: one thin rect per day, colored by that day's effort.
  const strip = days
    .map((d, i) => {
      const { color } = categoryColor(d.contributionCount);
      const x = PAD_L + i * stepX;
      return `<rect x="${x.toFixed(1)}" y="${STRIP_Y}" width="${Math.max(stepX, 1).toFixed(1)}" height="${STRIP_H}" fill="${color}"/>`;
    })
    .join("");

  // Month tick labels: first day seen for each month.
  const seenMonths = new Set();
  const ticks = [];
  days.forEach((d, i) => {
    const key = d.date.slice(0, 7);
    if (seenMonths.has(key)) return;
    seenMonths.add(key);
    const x = PAD_L + i * stepX;
    ticks.push(`<text x="${x.toFixed(1)}" y="${STRIP_Y + STRIP_H + 16}" class="tick">${esc(monthLabel(d.date))}</text>`);
  });

  // KOM marker: steepest single-day effort.
  let komIdx = 0;
  days.forEach((d, i) => {
    if (d.contributionCount > days[komIdx].contributionCount) komIdx = i;
  });
  const komX = PAD_L + komIdx * stepX;
  const komY = MOUNTAIN_BOTTOM - (cumArr[komIdx] / max) * (MOUNTAIN_BOTTOM - MOUNTAIN_TOP);
  const komCount = days[komIdx].contributionCount;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Profil d'etape: contributions GitHub de l'annee">
  <style>
    .title { font: 800 18px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.ink}; }
    .sub { font: 500 13px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.sub}; }
    .tick { font: 600 11px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.sub}; text-anchor: middle; }
    .kom { font: 700 12px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${PALETTE.poisDot}; }
    .grid-line { stroke: ${p.grid}; stroke-width: 1; stroke-dasharray: 3 4; }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${p.panel}" stroke="${p.grid}" stroke-width="1.5"/>
  <text x="26" y="28" class="title">PROFIL DE LA SAISON</text>
  <text x="26" y="${H - 14}" class="sub">${esc(
    stats.totalContributions != null ? `${stats.totalContributions} contributions cumulees sur l'annee` : ""
  )}</text>
  <line x1="${PAD_L}" y1="${MOUNTAIN_BOTTOM}" x2="${PAD_L + PLOT_W}" y2="${MOUNTAIN_BOTTOM}" class="grid-line"/>
  <defs>
    <linearGradient id="fill-${theme}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.asphalt}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${PALETTE.asphalt}" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <path d="${areaPath}" fill="url(#fill-${theme})"/>
  <path d="${linePath}" fill="none" stroke="${PALETTE.asphalt}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${komX.toFixed(1)}" cy="${komY.toFixed(1)}" r="4.5" fill="${PALETTE.poisDot}" stroke="${p.panel}" stroke-width="1.5"/>
  <text x="${Math.min(Math.max(komX, 60), W - 100).toFixed(1)}" y="${(komY - 12).toFixed(1)}" class="kom" text-anchor="middle">⛰ KOM · ${komCount}</text>
  ${strip}
  ${ticks.join("")}
</svg>`;
}

export async function generateStage(stats) {
  await writeThemedPair("assets/stage", "stage", (theme) => renderStage(stats, theme));
}
