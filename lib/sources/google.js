import { expand } from "../expand.js";
import { pool } from "../pool.js";

// Google Autocomplete source. client=firefox returns clean JSON: [query, [suggestions]].
// Core wheel data — always enabled, no key. Fails soft per query.
async function fetchOne(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AskTheCrowd/0.1)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = JSON.parse(await res.text());
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch {
    return [];
  }
}

export const source = {
  id: "google",
  enabled: () => true,
  // Returns flat [{ text, group, modifier }] — the pipeline dedupes + groups.
  async fetch(seed) {
    const queries = expand(seed);
    const lists = await pool(queries, 8, (q) => fetchOne(q.q));
    const out = [];
    queries.forEach((q, idx) => {
      for (const text of lists[idx] || []) out.push({ text, group: q.group, modifier: q.modifier });
    });
    return out;
  },
};
