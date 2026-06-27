# Changelog

## 2026-06-28 — AskTheCrowd MVP (open-source AnswerThePublic)
- Scaffolded Next.js 15 / React 19 app (App Router, JS, zero non-framework deps).
- Engine: query expansion (`expand`), Google Autocomplete fetch, pure dedupe/group, Reddit question panel.
- In-memory 24h cache + per-IP rate limiter.
- UI: server-rendered shareable `/?q=` pages, SVG question wheel with PNG export + watermark, grouped columns, Reddit panel.
- JSON API at `/api/suggest`. Node test for pure functions. README with deploy + caveats.

## 2026-06-28 — v1 production: architecture, virality, repo, QA
- Docs: ARCHITECTURE.md (CTO), GRILL.md (self-grill), PRD.md. LICENSE (MIT) + CONTRIBUTING.
- Refactored engine to pluggable source-adapter registry (`lib/sources/`, `aggregate.js`, `pipeline.js`); Google source + separate optional Reddit panel.
- Virality: per-keyword OG image (`/api/og`), SVG/CSV export, OG/Twitter meta on `/?q=` pages.
- Repo created + pushed: https://github.com/Aankirz/askthecrowd
- QA (2 parallel review agents + pixelbrowse visual): fixed wheel label clipping (viewBox padding, 3 leaves, wider spread), OG rate-limit bypass, unbounded rate-limiter map, CSV formula injection, Reddit NaN token TTL, suggest try/catch, LRU promotion; a11y: SVG role/title, focus-visible ring, reduced-motion, aria-labels, stable keys, conditional autofocus.
- Tests 4/4 green, production build green, all routes verified (home/result/og/api).
