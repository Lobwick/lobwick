import { writeThemedPair, esc, PALETTE } from "./lib/svg.mjs";

const W = 1000;
const H = 320;
const PAD_L = 70;
const PAD_R = 70;
const ROAD_Y = 230;
const MAX_SPIKE = 120;
const MIN_SPIKE = 24;
const TOP_N = 8;
const MIN_GAP = 108;

// Simple two-pass collision resolver: push overlapping points apart left-to-right,
// then pull back into bounds right-to-left if the forward pass overflowed.
function spreadPositions(xs, lo, hi, minGap) {
  const out = [...xs];
  for (let i = 1; i < out.length; i++) {
    if (out[i] < out[i - 1] + minGap) out[i] = out[i - 1] + minGap;
  }
  if (out[out.length - 1] > hi) {
    out[out.length - 1] = hi;
    for (let i = out.length - 2; i >= 0; i--) {
      if (out[i] > out[i + 1] - minGap) out[i] = out[i + 1] - minGap;
    }
  }
  if (out[0] < lo) {
    out[0] = lo;
    for (let i = 1; i < out.length; i++) {
      if (out[i] < out[i - 1] + minGap) out[i] = out[i - 1] + minGap;
    }
  }
  return out;
}

export function renderRoute(stats, theme) {
  const p = PALETTE[theme];
  const repos = [...stats.repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, TOP_N)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const dates = repos.map((r) => new Date(r.created_at).getTime());
  const minT = Math.min(...dates, Date.now());
  const maxT = Math.max(...dates, Date.now());
  const span = Math.max(maxT - minT, 1);
  const maxStars = Math.max(...repos.map((r) => r.stargazers_count), 1);

  const xFor = (t) => PAD_L + ((t - minT) / span) * (W - PAD_L - PAD_R);
  const rawXs = repos.map((r) => xFor(new Date(r.created_at).getTime()));
  const xs = spreadPositions(rawXs, PAD_L, W - PAD_R, MIN_GAP);

  const towns = repos
    .map((r, i) => {
      const x = xs[i];
      const spike = MIN_SPIKE + (r.stargazers_count / maxStars) * (MAX_SPIKE - MIN_SPIKE);
      const topY = ROAD_Y - spike;
      const label = r.name.length > 14 ? `${r.name.slice(0, 13)}…` : r.name;
      // Alternate a second label tier so neighboring high spikes don't collide.
      const tierOffset = i % 2 === 0 ? 0 : 16;
      const labelY = topY - 14 - tierOffset;
      return `
        <line x1="${x.toFixed(1)}" y1="${ROAD_Y}" x2="${x.toFixed(1)}" y2="${topY.toFixed(1)}" stroke="${p.road}" stroke-width="2"/>
        <circle cx="${x.toFixed(1)}" cy="${topY.toFixed(1)}" r="7" fill="${PALETTE.jaune}" stroke="${p.panel}" stroke-width="2"/>
        <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" class="town" text-anchor="middle">${esc(label)}</text>
        <text x="${x.toFixed(1)}" y="${(labelY - 14).toFixed(1)}" class="star" text-anchor="middle">★ ${r.stargazers_count}</text>
      `;
    })
    .join("");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte du Tour: repositories places le long de la route">
  <style>
    .title { font: 800 18px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.ink}; }
    .sub { font: 500 13px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.sub}; }
    .town { font: 700 12px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.ink}; }
    .star { font: 600 11px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${PALETTE.jaune}; }
    .dash { stroke-dasharray: 10 10; animation: drive 2.2s linear infinite; }
    @keyframes drive { to { stroke-dashoffset: -40; } }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${p.panel}" stroke="${p.grid}" stroke-width="1.5"/>
  <text x="26" y="28" class="title">LA CARTE DU TOUR</text>
  <text x="26" y="48" class="sub">${esc(`${stats.repos.length} repositories publics — top ${repos.length} villes-etapes par etoiles`)}</text>
  <rect x="${PAD_L - 10}" y="${ROAD_Y - 5}" width="${W - PAD_L - PAD_R + 20}" height="10" rx="5" fill="${p.road}"/>
  <line x1="${PAD_L - 10}" y1="${ROAD_Y}" x2="${W - PAD_R + 10}" y2="${ROAD_Y}" stroke="#ffffff" stroke-width="1.5" class="dash" opacity="0.8"/>
  <text x="${PAD_L - 10}" y="${ROAD_Y + 26}" class="sub">🏁 ${esc(new Date(minT).getFullYear())}</text>
  <text x="${W - PAD_R + 10}" y="${ROAD_Y + 26}" text-anchor="end" class="sub">${esc(new Date(maxT).getFullYear())} 🚴</text>
  ${towns}
</svg>`;
}

export async function generateRoute(stats) {
  await writeThemedPair("assets/route", "route", (theme) => renderRoute(stats, theme));
}
