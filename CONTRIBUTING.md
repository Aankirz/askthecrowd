# Contributing to AskTheCrowd

Thanks for helping! This is a free, open-source AnswerThePublic alternative.

## Dev setup

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # pure-function tests (offline)
npm run build  # production build
```

## Adding a data source (the common contribution)

Sources are pluggable. Create `lib/sources/<name>.js` exporting a `source` object:

```js
export const source = {
  id: "youtube",
  enabled: () => true,                 // gate behind env if it needs keys
  async fetch(seed) {
    // return [{ text, group, modifier }]
    // groups: "questions" | "prepositions" | "comparisons" | "alphabetical" | "related"
    // fail soft — return [] on any error, never throw
  },
};
```

Register it in `lib/sources/index.js`. That's it — the pipeline picks it up.

## Ground rules

- **Fail soft.** Network code returns `[]` on error; never crash the request.
- **Keep files small** (< 400 lines) and focused.
- **Conventional commits** (`feat:`, `fix:`, `refactor:`…).
- Add/keep tests for pure logic. Run `npm test` and `npm run build` before a PR.
- Good first issues: TypeScript migration, new sources (YouTube/Bing/Amazon),
  i18n, the trending page.
