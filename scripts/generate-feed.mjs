import { readFile, writeFile } from "node:fs/promises";
import { getPublicEvents } from "./lib/github.mjs";

const ICONS = {
  PushEvent: "📻",
  PullRequestEvent: "🔀",
  IssuesEvent: "🚩",
  ReleaseEvent: "🏁",
  CreateEvent: "🆕",
  ForkEvent: "🍴",
  IssueCommentEvent: "💬",
};

function formatDate(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

function describe(event) {
  const repo = event.repo.name;
  const repoUrl = `https://github.com/${repo}`;
  const icon = ICONS[event.type] ?? "📡";

  switch (event.type) {
    case "PushEvent": {
      const head = event.payload.head ?? event.payload.before ?? "";
      const url = head ? `${repoUrl}/commit/${head}` : repoUrl;
      return { icon, text: `Push sur <a href="${url}">${repo}</a>`, url };
    }
    case "PullRequestEvent": {
      const pr = event.payload.pull_request;
      return {
        icon,
        text: `PR ${esc(event.payload.action)} — <a href="${pr.html_url}">${esc(pr.title)}</a> (${repo})`,
        url: pr.html_url,
      };
    }
    case "ReleaseEvent": {
      const rel = event.payload.release;
      return { icon, text: `Release <a href="${rel.html_url}">${esc(rel.tag_name)}</a> sur ${repo}`, url: rel.html_url };
    }
    case "IssuesEvent": {
      const issue = event.payload.issue;
      return {
        icon,
        text: `Issue ${esc(event.payload.action)} — <a href="${issue.html_url}">${esc(issue.title)}</a> (${repo})`,
        url: issue.html_url,
      };
    }
    case "CreateEvent": {
      return { icon, text: `Nouvelle branche/tag sur <a href="${repoUrl}">${repo}</a>`, url: repoUrl };
    }
    default:
      return { icon, text: `Activité sur <a href="${repoUrl}">${repo}</a>`, url: repoUrl };
  }
}

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildFeedBlock(events) {
  const relevant = events.filter((e) => ICONS[e.type]).slice(0, 8);
  if (relevant.length === 0) {
    return "<i>Pas d'activité publique récente — en reconnaissance avant la prochaine étape.</i>";
  }
  const lines = relevant.map((e) => {
    const { icon, text } = describe(e);
    return `${icon} <b>${formatDate(e.created_at)}</b> ${text}`;
  });
  return `<pre>\n${lines.join("\n")}\n</pre>`;
}

export async function generateFeed(login, token) {
  const events = await getPublicEvents(login, token);
  const block = buildFeedBlock(events);

  const readme = await readFile("README.md", "utf8");
  const updated = readme.replace(
    /<!-- FEED:START -->[\s\S]*<!-- FEED:END -->/,
    `<!-- FEED:START -->\n${block}\n<!-- FEED:END -->`
  );
  await writeFile("README.md", updated, "utf8");
}
