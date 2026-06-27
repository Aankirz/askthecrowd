# PRD — AskTheCrowd

**Owner:** (you) · **Status:** v1 build · **Date:** 2026-06-28
**One-liner:** Free, open-source, unlimited AnswerThePublic — type a keyword, get a
beautiful, shareable map of what the internet is asking.

## 1. Problem & opportunity

Keyword/question research is gated behind ATP's paywall (≈$99/mo). No free,
unlimited, *shareable-quality* open alternative exists. The paywall throttles ATP's
own virality — a free tool that produces the same screenshot-worthy artifact can
out-distribute it.

## 2. Goals / non-goals

**Goals (v1)**
- Type a keyword → grouped suggestions (questions, prepositions, comparisons, A–Z).
- Signature **question wheel**, beautiful enough to screenshot and share.
- Every result is a **shareable, SEO-indexable URL** with an **auto OG image**.
- Export PNG / SVG / CSV. Reddit "real questions" panel (optional).
- Free, no login, fast (LCP < 2.5s on cache hit).

**Non-goals (v1):** accounts, billing, saved history, DB-backed search, search
volume, i18n, browser extension.

## 3. Success metrics

- **North star:** weekly searches that yield a share or an indexed page.
- Guardrails: source success rate > 90% (logged), p75 result render < 2.5s,
  zero-result rate < 5% on real keywords.

## 4. Users & top stories

1. *Marketer:* "Enter a keyword, see questions people ask, download the wheel for my deck."
2. *SEO:* "Get the long-tail question list as CSV to build content briefs."
3. *Sharer:* "Paste the link in Slack/Twitter and have it preview the wheel."
4. *Dev (OSS):* "Hit `/api/suggest?q=` and self-host."

## 5. Functional requirements

| # | Requirement | Priority |
|---|-------------|----------|
| F1 | Keyword → ~49 expanded Google Autocomplete queries, parallel, fail-soft | P0 |
| F2 | Dedupe + group by modifier (questions / prepositions / comparisons / A–Z / related) | P0 |
| F3 | Question wheel (SVG), center=keyword, spokes=question words, leaves=suggestions | P0 |
| F4 | SSR result page at `/?q=` with per-keyword `<title>`/meta | P0 |
| F5 | Auto OG image per keyword at `/api/og?q=` | P0 |
| F6 | Export: PNG (client) + SVG + CSV, watermarked | P0 |
| F7 | JSON API `/api/suggest?q=` | P0 |
| F8 | Per-IP rate limit + 24h result cache | P0 |
| F9 | Reddit "real questions" panel via app-only OAuth, optional/fail-soft | P1 |
| F10 | Pluggable source adapter registry (Google, Reddit; YouTube/Bing-ready) | P1 |
| F11 | Trending / recently-searched page | P2 |

## 6. Non-functional

- **Resilience:** no single failure breaks search; partial > error.
- **Design quality (P0):** must not look like a template — it gets shared or it dies.
- **Privacy:** no login, no PII, no third-party trackers.
- **Accessibility:** semantic HTML, keyboard, contrast, reduced-motion.
- **Observability:** cache-hit + per-source latency/failure counters in logs.

## 7. Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md). Next.js/Vercel monolith; source adapter
layer; memory cache with Redis seam; SSR + server-rendered OG for the share loop.

## 8. Component build order (each QA'd before the next)

1. **Engine** — expand · sources/google · pipeline (dedupe/group) · cache/ratelimit. Unit-tested.
2. **API** — `/api/suggest`. Contract + rate-limit verified.
3. **Wheel** — SVG component + PNG/SVG export. Visual QA via browser.
4. **Result page** — SSR, columns, meta, search box. Visual + a11y QA.
5. **OG image** — `/api/og`. Rendered + visually checked.
6. **Reddit panel** — adapter + UI, optional. Fail-soft verified.
7. **CSV export + polish** — exports, empty/error states, responsive.

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Google blocks datacenter IPs | hard cache, bounded concurrency, fetch/proxy seam, logged success rate |
| Autocomplete endpoint changes | adapter isolation, CI smoke-warn, swap to paid suggest API |
| Looks generic → no shares | design quality as P0, OG card server-rendered, component-by-component visual QA |
| Abuse / cost spikes | per-IP limit, fan-out cap, aggressive cache |
| Reddit OAuth friction | optional/fail-soft; product complete without it |

## 10. Definition of done (v1)

Deployed on Vercel. `/?q=` returns a grouped, wheel-rendered, shareable page with a
working OG image and exports. Tests green, build green, each component visually QA'd.
README + LICENSE + CONTRIBUTING for OSS launch.
