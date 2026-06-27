// Query expansion — the core of the product. Turns one seed keyword into the
// ~49 autocomplete queries that surface what people actually search.

const QUESTIONS = ["how", "what", "why", "when", "where", "who", "which", "are", "can", "will", "does", "is", "should"];
const PREPOSITIONS = ["for", "with", "without", "to", "near", "like", "versus"];
const COMPARISONS = ["vs", "versus", "and", "or", "like"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// Returns [{ q, group, modifier }] — group drives bucketing, modifier is the spoke label.
export function expand(seed) {
  const k = seed.trim();
  const queries = [{ q: k, group: "plain", modifier: "" }];
  for (const w of QUESTIONS) queries.push({ q: `${w} ${k}`, group: "questions", modifier: w });
  for (const p of PREPOSITIONS) queries.push({ q: `${k} ${p}`, group: "prepositions", modifier: p });
  for (const c of COMPARISONS) queries.push({ q: `${k} ${c}`, group: "comparisons", modifier: c });
  for (const a of ALPHABET) queries.push({ q: `${k} ${a}`, group: "alphabetical", modifier: a });
  return queries;
}
