// Pure: take flat [{ text, group, modifier }] from all sources, dedupe globally,
// bucket by modifier. No network — fully unit-testable.
export function groupSuggestions(suggestions) {
  const seen = new Set();
  const groups = { questions: {}, prepositions: {}, comparisons: {}, alphabetical: {}, related: [] };
  for (const { text, group, modifier } of suggestions) {
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (group === "plain" || group === "related") {
      groups.related.push(text);
      continue;
    }
    if (!groups[group]) continue;
    (groups[group][modifier] ||= []).push(text);
  }
  return groups;
}

export function countSuggestions(groups) {
  let n = groups.related.length;
  for (const key of ["questions", "prepositions", "comparisons", "alphabetical"])
    for (const arr of Object.values(groups[key])) n += arr.length;
  return n;
}
