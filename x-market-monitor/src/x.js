const API = "https://api.x.com/2";
const TWEET_PARAMS = {
  "tweet.fields": "created_at,author_id,public_metrics,lang",
  expansions: "author_id",
  "user.fields": "username,name,verified",
};

async function getJson(url, bearerToken) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearerToken}` } });
  if (res.status === 429) {
    const reset = Number(res.headers.get("x-rate-limit-reset")) * 1000;
    const waitMs = reset ? Math.max(reset - Date.now(), 1000) : 60_000;
    const err = new Error(`X rate limit hit; retry in ${Math.ceil(waitMs / 1000)}s`);
    err.retryAfterMs = waitMs;
    throw err;
  }
  if (!res.ok) throw new Error(`X API ${res.status}: ${await res.text()}`);
  return res.json();
}

function normalize(body) {
  const users = new Map((body.includes?.users || []).map((u) => [u.id, u]));
  return (body.data || []).map((t) => {
    const user = users.get(t.author_id) || {};
    return {
      id: t.id,
      text: t.text,
      createdAt: t.created_at,
      username: user.username || "unknown",
      name: user.name || "",
      metrics: t.public_metrics || {},
      url: `https://x.com/${user.username || "i"}/status/${t.id}`,
    };
  });
}

// Returns new posts, oldest first, plus the newest id seen.
export async function fetchNewPosts({ bearerToken, query, listId, maxResults }, sinceId) {
  let url;
  if (listId) {
    // List timelines don't support since_id; callers dedupe with the seen set.
    url = new URL(`${API}/lists/${listId}/tweets`);
    url.search = new URLSearchParams({ ...TWEET_PARAMS, max_results: String(Math.min(maxResults, 100)) });
  } else {
    url = new URL(`${API}/tweets/search/recent`);
    const params = {
      ...TWEET_PARAMS,
      query,
      max_results: String(Math.min(Math.max(maxResults, 10), 100)),
    };
    if (sinceId) params.since_id = sinceId;
    url.search = new URLSearchParams(params);
  }

  const body = await getJson(url, bearerToken);
  const posts = normalize(body).reverse();
  return { posts, newestId: body.meta?.newest_id || sinceId };
}
