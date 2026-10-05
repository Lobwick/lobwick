import { computeStats } from "./lib/stats.mjs";
import { generateRadio } from "./generate-radio.mjs";
import { generateStage } from "./generate-stage.mjs";
import { generateRoute } from "./generate-route.mjs";
import { generateJerseys } from "./generate-jerseys.mjs";
import { generateFeed } from "./generate-feed.mjs";

const login = process.env.GITHUB_LOGIN ?? "Lobwick";
const token = process.env.GH_PAT ?? process.env.GITHUB_TOKEN;

async function main() {
  console.log(`Fetching GitHub stats for @${login}…`);
  const stats = await computeStats(login, token);

  await Promise.all([
    generateRadio(stats),
    generateStage(stats),
    generateRoute(stats),
    generateJerseys(stats),
  ]);
  console.log("SVG assets regenerated.");

  await generateFeed(login, token);
  console.log("README feed block updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
