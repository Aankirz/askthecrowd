# Changelog

## 2026-06-28 — AskTheCrowd MVP (open-source AnswerThePublic)
- Scaffolded Next.js 15 / React 19 app (App Router, JS, zero non-framework deps).
- Engine: query expansion (`expand`), Google Autocomplete fetch, pure dedupe/group, Reddit question panel.
- In-memory 24h cache + per-IP rate limiter.
- UI: server-rendered shareable `/?q=` pages, SVG question wheel with PNG export + watermark, grouped columns, Reddit panel.
- JSON API at `/api/suggest`. Node test for pure functions. README with deploy + caveats.
