import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Shared palette. "dark"/"light" pick background + ink; jersey colors are
// fixed (they're the actual UCI/ASO classification colors).
export const PALETTE = {
  dark: { bg: "#0d1117", panel: "#161b22", ink: "#e6edf3", sub: "#8b949e", grid: "#30363d", road: "#484f58" },
  light: { bg: "#ffffff", panel: "#f6f8fa", ink: "#1f2328", sub: "#57606a", grid: "#d0d7de", road: "#8c959f" },
  jaune: "#FFD700",
  jauneInk: "#3a2e00",
  vert: "#2ecc40",
  pois: "#ffffff",
  poisDot: "#e8384f",
  blanc: "#ffffff",
  blancInk: "#1f2328",
  asphalt: "#2f81f7",
};

export async function writeThemedPair(dir, name, render) {
  await mkdir(dir, { recursive: true });
  const dark = render("dark");
  const light = render("light");
  await writeFile(path.join(dir, `${name}-dark.svg`), dark, "utf8");
  await writeFile(path.join(dir, `${name}-light.svg`), light, "utf8");
}
