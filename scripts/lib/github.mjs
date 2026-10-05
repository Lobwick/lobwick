const API = "https://api.github.com";

function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}`, "User-Agent": "lobwick-profile-bot" }
    : { "User-Agent": "lobwick-profile-bot" };
}

export async function restGet(path, token) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new Error(`GitHub REST ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function graphql(query, variables, token) {
  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

export async function getUser(login, token) {
  return restGet(`/users/${login}`, token);
}

export async function getAllRepos(login, token) {
  const repos = [];
  let page = 1;
  for (;;) {
    const batch = await restGet(
      `/users/${login}/repos?per_page=100&page=${page}&type=owner&sort=created&direction=asc`,
      token
    );
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return repos.filter((r) => !r.fork);
}

export async function getContributionCalendar(login, token) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
  const data = await graphql(query, { login }, token);
  return data.user.contributionsCollection.contributionCalendar;
}

export async function getPublicEvents(login, token) {
  return restGet(`/users/${login}/events/public?per_page=30`, token);
}
