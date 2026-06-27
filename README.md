# AskTheCrowd

Open-source [AnswerThePublic](https://answerthepublic.com). Type a keyword → see the
questions, prepositions, comparisons and A–Z searches people actually type, as a
shareable **question wheel**, plus real questions from Reddit. No login, no tracking.

## How it works

```
keyword → expand into ~49 queries → Google Autocomplete (parallel) → dedupe & group → wheel + columns
                                   ↘ Reddit search.json → "real questions" panel
```

- `lib/expand.js` — turns one seed into question / preposition / comparison / A–Z queries
- `lib/sources/` — pluggable source adapters (`google` now; YouTube/Bing-ready). Add one = one file.
- `lib/aggregate.js` — runs enabled sources in parallel, merges, fails soft
- `lib/group.js` — pure dedupe + bucket-by-modifier
- `lib/pipeline.js` — top-level: aggregate + group + Reddit + cache
- `lib/reddit.js` — Reddit "real questions" panel via app-only OAuth (optional)
- `lib/cache.js` — 24h in-memory result cache + per-IP rate limit
- `components/Wheel.jsx` — SVG radial wheel + PNG/SVG export (watermarked)
- `app/api/og/route.jsx` — per-keyword social card (server-rendered) for share previews

**Virality built in:** SSR shareable `/?q=` pages (SEO) · auto OG image per keyword ·
PNG / SVG / CSV export · zero login. See [docs/](./docs) for architecture, grill & PRD.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # pure-function checks (offline)
npm run build    # production build
```

Search is a plain `GET /?q=keyword`, server-rendered — so every result is a
shareable, SEO-indexable URL. JSON API: `GET /api/suggest?q=keyword`.

### Reddit panel (optional)

Reddit blocks the old unauth JSON path, so the panel uses app-only OAuth. Without
creds the wheel still works and the panel just hides. To enable it:

1. Create a **script** app at https://www.reddit.com/prefs/apps (free, 2 min).
2. Copy `.env.example` → `.env.local` and set `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`.

## Deploy

Push to GitHub → import on [Vercel](https://vercel.com) → done. Zero config.

## Caveats

- **Google may rate-limit/​block datacenter IPs.** Works reliably locally and on
  many hosts; on Vercel some queries may come back empty under load. Results fail
  soft (partial wheel beats no wheel). Add a proxy or the official suggest API if
  this bites in production.
- Cache and rate-limit are in-memory — fine for one instance. For multi-instance,
  swap `lib/cache.js` for Upstash/Redis.

## Roadmap (Phase 2+)

Accounts & saved searches · CSV export · region/language · YouTube + Bing sources ·
search-volume enrichment · trend-over-time.

MIT.
