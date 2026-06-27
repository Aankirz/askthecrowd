import { aggregate } from "./aggregate.js";
import { groupSuggestions, countSuggestions } from "./group.js";
import { fetchRedditQuestions } from "./reddit.js";
import { cacheGet, cacheSet } from "./cache.js";

const DAY = 24 * 60 * 60 * 1000;

// Top-level: cached, normalized keyword. Suggestion sources + Reddit run in
// parallel; grouping is pure. Fails soft end-to-end.
export async function getResults(seed) {
  const key = seed.trim().toLowerCase();
  if (!key) return null;

  const cached = cacheGet(key);
  if (cached) return cached;

  const [suggestions, reddit] = await Promise.all([aggregate(key), fetchRedditQuestions(key)]);
  const groups = groupSuggestions(suggestions);
  const result = { seed: key, groups, reddit, total: countSuggestions(groups) };
  cacheSet(key, result, DAY);
  return result;
}
