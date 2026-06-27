// Reddit — "real questions people actually asked." Side panel, not wheel data.
//
// Reddit now blocks the old unauth *.json scraping path (403/WAF), so this uses
// the sanctioned app-only OAuth flow. Set REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET
// (create a "script" app at https://www.reddit.com/prefs/apps — free, 2 min).
// No creds -> panel fails soft (returns []), the Google wheel is unaffected.
// ponytail: app-only OAuth + in-memory token cache; that's the floor Reddit allows.

const Q_WORDS = ["how", "what", "why", "when", "where", "who", "which", "is", "are", "can", "should", "does", "will"];
const UA = "AskTheCrowd/0.1 (open-source keyword tool)";

let token = null; // { value, expires }

async function getToken() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (token && Date.now() < token.expires) return token.value;

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const ttl = Number(data.expires_in) || 3600; // guard NaN -> avoids re-auth stampede
  token = { value: data.access_token, expires: Date.now() + (ttl - 60) * 1000 };
  return token.value;
}

export async function fetchRedditQuestions(seed) {
  try {
    const t = await getToken();
    if (!t) return [];
    const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(seed)}&sort=relevance&limit=25&raw_json=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${t}`, "User-Agent": UA },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const posts = (await res.json())?.data?.children ?? [];
    return posts
      .map((p) => ({
        title: p.data.title,
        url: "https://www.reddit.com" + p.data.permalink,
        subreddit: p.data.subreddit,
        ups: p.data.ups,
      }))
      .filter((p) => {
        const t2 = p.title.toLowerCase();
        return t2.endsWith("?") || Q_WORDS.some((w) => t2.startsWith(w + " "));
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}
