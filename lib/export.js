// Pure export builders. CSV is used client-side; kept pure so it's testable.
// Guards against spreadsheet formula injection (=,+,-,@ prefixes) by prefixing
// a single quote — the de-facto safe escape across Excel / Sheets.
function csvCell(v) {
  const s = String(v);
  const dangerous = /^[=+\-@\t\r]/.test(s);
  const body = dangerous ? "'" + s : s;
  return dangerous || /[",\n]/.test(s) ? '"' + body.replace(/"/g, '""') + '"' : s;
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

// Sample questions for previews/OG — round-robin across question words so the
// card shows variety (how / what / why …) instead of five "how …" in a row.
export function topQuestions(result, n = 5) {
  const buckets = Object.values(result.groups.questions);
  const out = [];
  for (let i = 0; out.length < n; i++) {
    let added = false;
    for (const b of buckets) {
      if (b[i]) {
        out.push(b[i]);
        added = true;
        if (out.length >= n) break;
      }
    }
    if (!added) break;
  }
  return out;
}
