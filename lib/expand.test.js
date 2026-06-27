import { test } from "node:test";
import assert from "node:assert";
import { expand } from "./expand.js";
import { groupSuggestions, countSuggestions } from "./group.js";
import { toCSV } from "./export.js";

test("expand produces plain + question + 26 alphabet queries", () => {
  const qs = expand("coffee");
  assert.ok(qs.some((q) => q.q === "coffee" && q.group === "plain"));
  assert.ok(qs.some((q) => q.q === "how coffee" && q.group === "questions"));
  assert.equal(qs.filter((q) => q.group === "alphabetical").length, 26);
});

test("groupSuggestions dedupes globally and buckets by modifier", () => {
  const flat = [
    { text: "coffee near me", group: "plain", modifier: "" },
    { text: "how coffee is made", group: "questions", modifier: "how" },
    { text: "coffee near me", group: "questions", modifier: "how" }, // dup -> dropped
    { text: "what coffee has most caffeine", group: "questions", modifier: "what" },
    { text: "coffee vs tea", group: "comparisons", modifier: "vs" },
  ];
  const g = groupSuggestions(flat);
  assert.deepEqual(g.related, ["coffee near me"]);
  assert.deepEqual(g.questions.how, ["how coffee is made"]);
  assert.deepEqual(g.questions.what, ["what coffee has most caffeine"]);
  assert.deepEqual(g.comparisons.vs, ["coffee vs tea"]);
});

test("countSuggestions totals all buckets", () => {
  const g = groupSuggestions([
    { text: "a", group: "plain", modifier: "" },
    { text: "how b", group: "questions", modifier: "how" },
    { text: "c for", group: "prepositions", modifier: "for" },
  ]);
  assert.equal(countSuggestions(g), 3);
});

test("toCSV escapes commas/quotes and includes header", () => {
  const g = groupSuggestions([
    { text: 'best "cheap" coffee, ranked', group: "questions", modifier: "best" },
  ]);
  const csv = toCSV({ seed: "coffee", groups: g });
  assert.ok(csv.startsWith("group,modifier,suggestion"));
  assert.ok(csv.includes('"best ""cheap"" coffee, ranked"'));
});
