import { writeThemedPair, esc, PALETTE } from "./lib/svg.mjs";

const W = 900;
const H = 320;

function row(y, label, value, accent) {
  return `
    <text x="40" y="${y}" class="label">${esc(label)}</text>
    <text x="${W - 40}" y="${y}" text-anchor="end" class="value" fill="${accent}">${esc(value)}</text>`;
}

export function renderRadio(stats, theme) {
  const p = PALETTE[theme];
  const since = new Date(stats.user.created_at).getFullYear();
  const name = stats.user.name ?? stats.login;
  const bio = stats.user.bio ?? "Senior Software Engineer @ Decathlon Digital";

  const rows = [
    row(118, "COUREUR", `${name} (@${stats.login})`, p.ink),
    row(150, "DOSSARD", "#1 — DEC", PALETTE.asphalt),
    row(182, "CLASSEMENT (repos publics)", String(stats.user.public_repos), p.ink),
    row(214, "ÉTOILES CUMULÉES", String(stats.totalStars), PALETTE.jaune),
    row(
      246,
      "CONTRIBUTIONS (saison)",
      stats.totalContributions != null ? String(stats.totalContributions) : "n/a",
      PALETTE.vert
    ),
    row(278, "SPÉCIALITÉ", stats.topLanguage, PALETTE.asphalt),
  ].join("");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Radio Tour: stats GitHub en direct">
  <style>
    .label { font: 600 14px "Segoe UI", Helvetica, Arial, sans-serif; fill: ${p.sub}; letter-spacing: 0.06em; }
    .value { font: 700 16px "Segoe UI", Helvetica, Arial, sans-serif; }
    .title { font: 800 18px "Segoe UI", Helvetica, Arial, sans-serif; fill: #ffffff; letter-spacing: 0.04em; }
    .sub { font: 500 12px "Segoe UI", Helvetica, Arial, sans-serif; fill: #ffffffcc; }
    .dot { animation: pulse 1.6s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${p.panel}" stroke="${p.grid}" stroke-width="1.5"/>
  <rect x="0" y="0" width="${W}" height="56" rx="14" fill="${PALETTE.asphalt}"/>
  <rect x="0" y="40" width="${W}" height="16" fill="${PALETTE.asphalt}"/>
  <circle class="dot" cx="32" cy="28" r="6" fill="#ff4136"/>
  <text x="52" y="24" class="title">RADIO TOUR — DIRECT</text>
  <text x="52" y="42" class="sub">${esc(bio)}</text>
  ${rows}
  <line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${p.grid}" stroke-width="1"/>
</svg>`;
}

export async function generateRadio(stats) {
  await writeThemedPair("assets/radio", "radio", (theme) => renderRadio(stats, theme));
}
