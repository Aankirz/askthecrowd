// Pure export builders. CSV is used client-side; kept pure so it's testable.
function csvCell(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCSV(result) {
  const rows = [["group", "modifier", "suggestion"]];
  const g = result.groups;
  for (const grp of ["questions", "prepositions", "comparisons", "alphabetical"])
    for (const [mod, items] of Object.entries(g[grp]))
      for (const s of items) rows.push([grp, mod, s]);
  for (const s of g.related) rows.push(["related", "", s]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

// Flatten the question buckets into a short sample for previews/OG.
export function topQuestions(result, n = 5) {
  return Object.values(result.groups.questions).flat().slice(0, n);
}
