# AskTheCrowd — Technical Architecture

> Decided as CTO / principal engineer. North star: **users**. Architecture exists to
> serve growth loops, not to be impressive. Every decision below is justified by
> "does this win or retain a user?" — if not, it's deferred (YAGNI).

## 1. The one insight that drives everything

AnswerThePublic didn't grow on features. It grew on a **content + share loop**:
every search produces a screenshot-worthy artifact (the wheel) on a URL Google
indexes. So the architecture's #1 job is to make that loop fast, beautiful, and
frictionless. The data engine is necessary but commodity; the loop is the moat.

```
            ┌─────────────────────── GROWTH LOOP ───────────────────────┐
            │                                                            │
 user → /?q=K (SSR, indexable) → wheel + auto OG image → user shares →  │
            │   ↑                                            ↓           │
            └── Google indexes the page ←── new users land ─┘           │
```

## 2. System shape

Single **Next.js (App Router) app on Vercel**. SSR pages, edge-friendly API
routes, OG image generation, and static assets in one deploy. No microservices —
at this scale they'd add ops cost and latency for zero user benefit.

```
app/
  page.jsx            server: /?q= → render result (indexable, shareable)
  api/suggest/route   JSON API (programmatic + future clients)
  api/og/route        per-keyword social preview image (virality)
  trending/page       recently/most searched (engagement + SEO surface)  [1.5]
components/           Wheel (client island), Results, SearchBox, exports
lib/
  pipeline.js         expand → fan-out → normalize → dedupe → group → cache
  sources/            adapter per data source (see §4)
  cache.js            Cache + RateLimiter interfaces (memory now, Redis-ready)
  export.js           PNG / SVG / CSV builders
```

## 3. Request pipeline

```
GET /?q=K
  → rateLimit(ip)                 reject abuse early, cheap
  → cache.get(norm(K))            24h; hard cache = low egress + instant repeat
  → MISS: aggregate(sources, K)   run enabled sources in parallel, fail-soft
      → normalize + global dedupe
      → group by modifier (questions / prepositions / comparisons / a–z)
  → cache.set
  → render: wheel + columns + reddit panel; export + OG available
```

Wall-clock = slowest single source, not the sum. Bounded concurrency (8) on the
Google fan-out so we don't trip rate limits.

## 4. Source adapter layer (the extensibility bet)

Multi-source is the roadmap differentiator ("better than ATP"). So sources are
pluggable behind one interface — **adding a source is one file, zero pipeline
changes**:

```js
// lib/sources/<name>.js
export const source = {
  id: "google",
  enabled: () => true,            // env/feature-gated
  async fetch(seed) { return [/* {text, group, modifier} */] },
};
```

- `google` — Autocomplete, the core wheel data. Free, no key. Always on.
- `reddit` — app-only OAuth, "real questions" panel. Optional (env creds), fails soft.
- *roadmap:* `youtube`, `bing`, `amazon` — same interface, flip a flag.

The aggregator imports the registry, filters `enabled()`, runs `fetch` in
parallel, and merges. One source dying never breaks the response.

## 5. Cross-cutting concerns

| Concern        | Decision                                                                 |
|----------------|--------------------------------------------------------------------------|
| Resilience     | Every source/IO fails soft. Partial wheel > error page. Always.          |
| Caching        | `Cache` interface; `MemoryCache` default, `RedisCache` (Upstash) by env. |
| Abuse          | Per-IP token bucket; fan-out capped. Same store as cache.                |
| Performance    | Parallel fetch + hard cache + edge OG. Target LCP < 2.5s.                |
| Privacy        | No login, no PII, no third-party trackers. Trust → shareability.         |
| Observability  | Structured logs + counters: cache hit rate, per-source latency/failure.  |
| Cost           | Free endpoints + aggressive cache. Scales on Vercel's free/hobby tier.   |

## 6. Virality engineering (first-class, not afterthought)

1. **SSR keyword pages** → long-tail SEO (ATP's actual growth engine).
2. **Auto OG image per keyword** (`/api/og?q=`) → shared links render the wheel as
   a card → higher CTR → compounding.
3. **PNG / SVG / CSV export** with watermark → every export is a referral.
4. **Trending / recently searched** page [1.5] → engagement + more indexable URLs.
5. **Zero friction** — no signup, instant result.

## 7. Deliberately deferred (YAGNI until a user asks)

Accounts, saved history, billing, a database for core search, multi-region,
search-volume enrichment, i18n. The *seams* exist (cache interface, source
registry, optional KV) so these slot in without a rewrite — but none ship in v1.

## 8. Stack rationale (one line each)

- **Next.js + Vercel** — SSR + OG + API + static in one deploy; the share loop needs SSR.
- **JavaScript, not TypeScript (v1)** — ship the growth loop now; TS is a clean Phase-2
  PR that moves no user metric today. Seams are typed via JSDoc where it pays.
- **No DB in core** — search is stateless + cached; a DB is pure liability until the
  trending surface needs it.
- **Hand-rolled SVG wheel** — ~150 lines vs a D3 dependency; the wheel is the brand,
  worth owning.
