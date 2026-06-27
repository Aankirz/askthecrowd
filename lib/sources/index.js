import { source as google } from "./google.js";

// Suggestion-source registry. Each returns flat [{ text, group, modifier }] and
// feeds the wheel. Add a source = add a file + one line here.
// (Reddit is a separate optional panel — see lib/reddit.js — because its output
// shape is rich items, not autocomplete suggestions.)
export const sources = [google];
