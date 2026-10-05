import { getUser, getAllRepos, getContributionCalendar } from "./github.mjs";

export async function computeStats(login, token) {
  const [user, repos, calendar] = await Promise.all([
    getUser(login, token),
    getAllRepos(login, token),
    getContributionCalendar(login, token).catch(() => null),
  ]);

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  const languageCounts = new Map();
  for (const r of repos) {
    if (!r.language) continue;
    languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
  }
  const topLanguage = [...languageCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const bestRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] ?? null;

  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const newestActiveRepo =
    [...repos]
      .filter((r) => new Date(r.created_at).getTime() >= oneYearAgo)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] ?? null;

  const totalContributions = calendar?.totalContributions ?? null;
  const days = calendar ? calendar.weeks.flatMap((w) => w.contributionDays) : [];

  return {
    login,
    user,
    repos,
    totalStars,
    topLanguage,
    languageCounts,
    bestRepo,
    newestActiveRepo,
    totalContributions,
    days,
  };
}
