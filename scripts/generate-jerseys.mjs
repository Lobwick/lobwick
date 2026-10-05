import { writeThemedPair, esc, PALETTE } from "./lib/svg.mjs";

const W = 1000;
const H = 300;
const COL_W = W / 4;

const JERSEY_PATH =
  "M30,10 L40,0 L60,0 L70,10 L95,22 L83,42 L75,34 L75,96 L25,96 L25,34 L17,42 L5,22 Z";

function jerseyBlock({ cx, fill, pattern, title, holder, stat, ink, sub }) {
  const scale = 1.3;
  const w = 100 * scale;
  const h = 100 * scale;
  const x = cx - w / 2;
  const y = 36;
  return `
    <g transform="translate(${x.toFixed(1)}, ${y}) scale(${scale})">
      <path d="${JERSEY_PATH}" fill="${pattern ?? fill}" stroke="${PALETTE.road}" stroke-width="1.5"/>
    </g>
    <text x="${cx}" y="${y + h + 26}" text-anchor="middle" class="jtitle" fill="${ink}">${esc(title)}</text>
    <text x="${cx}" y="${y + h + 46}" text-anchor="middle" class="jholder" fill="${ink}">${esc(holder)}</text>
    <text x="${cx}" y="${y + h + 64}" text-anchor="middle" class="jstat" fill="${sub}">${esc(stat)}</text>
  `;
}

export function renderJerseys(stats, theme) {
  const p = PALETTE[theme];
  const name = stats.user.name ?? stats.login;

  const best = stats.bestRepo;
  const newest = stats.newestActiveRepo;

  const cols = [
    jerseyBlock({
      cx: COL_W * 0.5,
      fill: PALETTE.jaune,
      title: "MAILLOT JAUNE",
      holder: "Classement général",
      stat: `${stats.user.public_repos} repos · ${stats.user.followers} abonnés`,
      ink: p.ink,
      sub: p.sub,
    }),
    jerseyBlock({
      cx: COL_W * 1.5,
      fill: PALETTE.vert,
      title: "MAILLOT VERT",
      holder: "Régularité (points)",
      stat:
        stats.totalContributions != null
          ? `${stats.totalContributions} contributions / an`
          : "n/a",
      ink: p.ink,
      sub: p.sub,
    }),
    jerseyBlock({
      cx: COL_W * 2.5,
      fill: "url(#pois)",
      title: "MAILLOT À POIS",
      holder: "Meilleur grimpeur",
      stat: best ? `★ ${best.stargazers_count} — ${best.name}` : "n/a",
      ink: p.ink,
      sub: p.sub,
    }),
    jerseyBlock({
      cx: COL_W * 3.5,
      fill: PALETTE.blanc,
      title: "MAILLOT BLANC",
      holder: "Meilleur jeune projet",
      stat: newest ? newest.name : "aucun cette saison",
      ink: p.ink,
      sub: p.sub,
    }),
  ].join("");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maillots distinctifs: classements GitHub de ${esc(name)}">
  <style>
    .jtitle { font: 800 13px "Segoe UI", Helvetica, Arial, sans-serif; letter-spacing: 0.04em; }
    .jholder { font: 600 12px "Segoe UI", Helvetica, Arial, sans-serif; }
    .jstat { font: 500 11px "Segoe UI", Helvetica, Arial, sans-serif; }
  </style>
  <defs>
    <pattern id="pois" width="22" height="22" patternUnits="userSpaceOnUse">
      <rect width="22" height="22" fill="${PALETTE.pois}"/>
      <circle cx="11" cy="11" r="4.5" fill="${PALETTE.poisDot}"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${p.panel}" stroke="${p.grid}" stroke-width="1.5"/>
  <line x1="${COL_W}" y1="20" x2="${COL_W}" y2="${H - 20}" stroke="${p.grid}" stroke-width="1"/>
  <line x1="${COL_W * 2}" y1="20" x2="${COL_W * 2}" y2="${H - 20}" stroke="${p.grid}" stroke-width="1"/>
  <line x1="${COL_W * 3}" y1="20" x2="${COL_W * 3}" y2="${H - 20}" stroke="${p.grid}" stroke-width="1"/>
  ${cols}
</svg>`;
}

export async function generateJerseys(stats) {
  await writeThemedPair("assets/jerseys", "jerseys", (theme) => renderJerseys(stats, theme));
}
