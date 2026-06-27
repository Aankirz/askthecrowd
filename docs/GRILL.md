# Grill Session — AskTheCrowd

> Format: relentless questions, answered as **CTO** and **Product Head**. The point
> is to surface the decision tree and resolve every branch before building.

## Product

**Q: Why does this need to exist? ATP already exists and is good.**
ATP is paywalled hard (≈$99/mo, 1–3 free searches then a wall). There is no
credible free, open, unlimited alternative that also looks good enough to share.
The wedge is *free + unlimited + beautiful + open-source*. We don't out-feature
ATP; we out-distribute it by removing the paywall that throttles its own virality.

**Q: What's the single metric?**
Weekly searches that produce a share or an indexed page. That's the loop turning.
Vanity metrics (visits) don't count unless they feed the loop.

**Q: Who is the user?**
SEO folks, content marketers, students, founders doing keyword/topic research.
They already screenshot ATP. We make that screenshot free and prettier.

**Q: What makes them come back vs one-and-done?**
Honestly, a research tool is partly transactional — and that's fine, because the
loop is *acquisition*, not retention: their shares + our indexed pages bring the
*next* user. Retention upside (trending page, saved searches) is Phase 2; we don't
pretend it's v1.

**Q: First growth move on day one?**
Ship 50–100 pre-rendered popular-keyword pages so Google has something to index
immediately, and a Product Hunt / Reddit / Twitter launch with a wheel screenshot.
The OG image makes the launch tweet carry itself.

**Q: What kills this?**
(1) Google blocks our autocomplete calls at scale. (2) We look like a template and
nobody shares. Mitigations: cache hard + proxy seam for (1); design quality as a
P0, not P2, for (2).

## Technical

**Q: Google Autocomplete is undocumented and could break or block us. Bet the
product on it?**
We bet the *core* on it, eyes open. It's been stable for 15+ years and powers many
tools. Risk controls: fail-soft per query, 24h cache (most load never hits Google),
and a `fetch` seam so we can route through a proxy or swap to the paid suggest API
without touching the pipeline. If Google fully closes it, the adapter layer means
we pivot the primary source, not rewrite the app.

**Q: Datacenter IPs (Vercel) get throttled. Then the flagship feature is empty.**
True and the top operational risk. v1 mitigations: hard cache (a popular keyword is
fetched once per day globally), bounded concurrency, realistic UA. v1.5: optional
proxy pool via env. We log per-source success rate so we *see* it degrade instead
of guessing. We never show an error — partial or cached wheel always.

**Q: Why no TypeScript for a project you want contributors to join?**
Product Head: TS converts zero searches to shares today. CTO: the codebase is ~12
small, cohesive files; the type surface is trivial and JSDoc'd at the seams. TS is a
mechanical, low-risk Phase-2 PR (great first contribution, even). Shipping the
growth loop this week beats a typed codebase next week. I'll defend this and revisit
the moment a type bug actually costs us.

**Q: Why the adapter pattern now — isn't that speculative generality you'd normally cut?**
It would be, except multi-source is the *stated* differentiation and we already have
two sources (Google, Reddit) with different shapes. The pattern earns its keep at
n=2 and turns "add YouTube" into a one-file PR. That's a real, near-term need, not
speculation.

**Q: In-memory cache means cold starts and no sharing across Vercel instances.**
Correct, and acceptable for v1: worst case is a duplicate fetch, which fails soft
and is cheap. The `Cache` interface makes Upstash a config swap when traffic makes
cross-instance hits worth it. Premature Redis is just ops cost today.

**Q: No tests on the network adapters?**
Pure logic (expand, group, export) is unit-tested — that's where bugs hide. Adapters
are thin IO wrappers tested via one mocked-response integration; mocking live Google
in CI is brittle theater. We add a smoke check in CI that hits the real endpoint and
*warns* (not fails) so we notice breakage without a flaky red build.

**Q: PNG export client-side — fonts/labels clip, looks bad on the exact thing people share.**
Known sharp edge. v1: clip long labels, keep wheel within frame, watermark in-frame.
The shareable artifact that matters most (the OG card) is rendered *server-side* with
controlled layout, so the highest-leverage share isn't at the mercy of the browser
canvas. Client PNG is the secondary path.

**Q: Reddit needs OAuth and you don't control the user's Reddit app. Is the panel vapor?**
The panel is **optional by design**: env creds → it works; no creds → it hides and
the product is unaffected. We ship the OAuth code + 2-minute setup doc. We do not
block the product on a secondary source. Honest > impressive.

**Q: What's the blast radius if a component fails in prod?**
Source fails → that section hides. Cache fails → direct fetch. Rate-limit store
fails → fall open (availability > strict limiting for a free tool). OG route fails →
default static card. No single failure takes down search.

## Scope cut line (what we are NOT building in v1)

Accounts, billing, DB-backed search, search volume, i18n, comparison-over-time,
browser extension. Each has a seam; none has v1 code. If pushed, the answer is "show
me the user pulling for it" — until then it's deferred.
