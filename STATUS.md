# PC Bottleneck Analyzer — Status

## 2026-07-10: Audit — verified recent work is landing, not churning (gl-0452)

Greenlight flagged 44 commits/30d with zero matched Claude Code sessions as a
shipping-without-review-signal risk. Spot-checked instead of piling on more:

- **Commit mix** (57 commits across all branches, last 30d): 39 `autopilot`
  (automated SEO blog posts — low-risk content gen, not hand-reviewed by
  design), 10 `feat`, 3 `fix`, rest docs/chore. The volume is mostly the
  autopilot content lane, not untested feature churn.
- **`feat/upgrade-blueprint` branch** (Blueprint $19 + Deep-Dive Report $29,
  12 commits ahead of `main`, still unmerged): `vitest` 87/87 green, `tsc
  --noEmit` clean, `next build` succeeds (132 pages), `playwright test` 10/10
  green. Spot-read `src/lib/deepdive/report.ts` and the blueprint/report test
  suite — real invariant tests (determinism, monotonic FPS uplift, resale
  never exceeds price, forged-webhook-signature rejection, XSS escaping),
  not filler. This code works; it just hasn't been merged yet because go-live
  is gated on Kruz creating the Lemon Squeezy products (see "THE FLIP"
  entries below) — an intentional dormant-behind-flag state, not stalled work.
- **Live prod** (`pcbottleneck.buildkit.store`, deployed from `main`): loads
  clean, matches expected free-beta state (no paywall live yet, as intended).
  Sampled blog post (`is-my-gpu-bottlenecking-my-cpu-find-out-now`) has real,
  substantive content — not placeholder/spam.
- **Minor cruft noted, not touched**: 4 stray unmerged branches
  (`feat/portfolio-health-emitter`, `gl-0019-agent-workstation-content`,
  `qa/core-logic-tests-and-fixes`, `local-pre-pull-20260504`) dating back to
  April–July, 1-2 commits each, none in this audit's scope to clean up.

**Verdict: landing, not churning.** Tests are real and pass, builds are
green, prod is healthy. The unmerged feature branches are deliberately
parked behind revenue flags awaiting a business decision (Kruz), not
abandoned or broken work.
## 2026-07-06: PC Deep-Dive Report ($29) built — third paid artifact, server-generated, staged to test mode (gl-0199)

The site's first product with **server-side, post-purchase fulfillment**: buyer
pays → the Lemon Squeezy webhook generates the report → buyer collects it at a
private, unguessable link. Distinct from Blueprint (which is instant/client-side).
Ships **DORMANT** behind two OFF-by-default switches. Full test-mode E2E is green.
Spec: `specs/SPEC_DEEPDIVE_REPORT.md`. Go-live (Kruz-gated): `specs/DEEPDIVE_GOLIVE.md`.
Price memo: `specs/DEEPDIVE_PRICE_MEMO.md` (recommends $29).

**What shipped** (branch `feat/upgrade-blueprint`, built on top of the Blueprint work):
- `src/lib/deepdive/` — `report.ts` (deterministic generator, reuses
  analyzeScan + generateBlueprint + estFps + percentile), `render.ts`
  (self-contained dark-theme HTML artifact with print CSS, escapes buyer notes),
  `store.ts` (ReportStore: Supabase `report_orders.data` jsonb backend for prod,
  file backend for dev/test), `fulfillment.ts` (token gen, checkout-URL builder,
  idempotent `fulfillReportOrder`), `validate.ts`, `access.ts`, `types.ts`.
- Routes: `POST /api/report/checkout` (stages a pending order, returns tokenized
  LS checkout URL — never generates), `GET /api/report/status` (delivery poll),
  webhook extension (fulfills on `order_created` when `report_token` custom data
  present + fulfillment enabled — wrapped so it can never non-200 the webhook),
  `GET /report/r/[token]/download` (raw artifact).
- Pages: `/report` (dormant-aware landing + intake form), `/report/sample`
  (**canned** demo — fixed input, no live generation, satisfies the
  no-live-model-API-on-public-demos rail by construction), `/report/r/[token]`
  (private delivery, polls until ready, iframe-isolated render + Print/Download).
- Analytics: `report_view` + `report_purchase_click` via `/api/t`; sales land as
  `purchase_test`/`purchase` in `/stats` (existing webhook path, no PII).
- Tests: **vitest 87/87** (28 new: generator determinism + XSS escaping, file
  store lifecycle, input validation, and the full E2E — checkout → signed webhook
  → generate → deliver → receipt, plus forged-signature reject / fulfillment-off
  / dormant-404 / bad-input). `tsc` clean. `next build` green.

**THE FLIP (Kruz — see `specs/DEEPDIVE_GOLIVE.md`):** provision the Supabase
`report_orders` table (SQL in that doc), create the "$29 Deep-Dive" LS product,
set `NEXT_PUBLIC_DEEPDIVE_ENABLED` + `NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL` +
`DEEPDIVE_FULFILLMENT_ENABLED` in Vercel, rehearse with the test card, then leave
LS test mode. Two OFF-by-default switches; nothing sells or generates until then.

**Known gaps (acceptable v1):** file store is dev/test only (prod needs the
Supabase table — documented); no automated email of the private link yet (buyer
keeps it in localStorage as `pc-deepdive-receipt` and via the post-checkout link
— an LS email template is a go-live nicety); entitlement is the unguessable token
(same pragmatic tradeoff as the other lanes).

## 2026-07-01: PC Upgrade Blueprint ($19) built — one flip from second revenue lane

Second paid artifact on the PCopti lane, per `specs/SPEC_UPGRADE_BLUEPRINT.md`
(Fable-designed, Sonnet-executed). Personalized upgrade plan: pick your
CPU/GPU/RAM/resolution/3 games (no scanner install required), get a
permanent, printable report — verdict, 3-budget GPU upgrade ladder with
per-game FPS uplift, resale-adjusted net cost, order of operations, free
wins, compatibility notes. Deterministic, no LLM, zero per-unit cost.
Shipped **dormant** behind `NEXT_PUBLIC_BLUEPRINT_ENABLED` (branch
`feat/upgrade-blueprint`).

**What shipped:**
- `src/lib/blueprint.ts` — pure generator. Synthesizes a "settings-optimal"
  `SystemScan` from the picker input so `analyzeScan`/`checkCompatibility`
  (the existing engine) produce a verdict driven purely by CPU/GPU tier, not
  invented bad luck. Upgrade ladder always targets the **GPU** (reuses
  `estFps`/`rankGpus` from the best-gpu-for pipeline exactly) even when the
  CPU is the detected bottleneck — the verdict and order-of-operations text
  say so explicitly in that case. `src/lib/resale.ts` — flat age/tier
  depreciation table for the old-part resale estimate.
- `src/lib/license.ts` generalized: `activateOrValidateLicense(key, productId)`
  now takes a product ID (defaults to Pro's `LS_PRODUCT_ID`); added
  `LS_BLUEPRINT_PRODUCT_ID` (env-driven, `0` until Kruz creates the LS
  product, so validation fails closed by default). `/api/license/activate`
  accepts `{ product: "pro" | "blueprint" }`.
- `/blueprint` route: picker → paywall (verdict shown free, ladder blurred)
  → license-key unlock → full report. **Deliberately does not reuse the
  Lemon Squeezy checkout overlay** — the sitewide `Checkout.Success` handler
  in `LemonSqueezyProvider` is hardcoded to grant *Pro*, so routing a
  Blueprint purchase through it would incorrectly unlock Pro for free.
  Blueprint's buy button is a plain link to the LS hosted checkout page;
  unlock is always via pasting the license key from the receipt email
  (`BlueprintLicenseEntry`, validated against `product: "blueprint"`).
- CTAs (dormant-aware, render nothing when the flag is off): analyzer
  Recommendations tab, `/best-gpu-for/[game]` pages, `/tier-lists` hub.
  Analytics: `blueprint_view` (report shown, preview or unlocked) and
  `blueprint_purchase_click` via the existing `/api/t`.
- Tests: vitest 42/42 (blueprint ladder respects budgets, never recommends
  a same-or-lower-tier part, FPS uplift monotonic per rung, resale never
  exceeds price, deterministic output, best-in-class-hardware edge case;
  resale depreciation; license generalization incl. cross-product rejection).
  `tsc` clean. `next build` green (128 pages incl. `/blueprint`). Playwright
  `tests/e2e/blueprint.spec.ts` covers both modes (dormant 4/4, armed 5/5);
  existing `pro-gate.spec.ts` re-verified green (no regression).
- Manual pass (preview tools) on 2 contrasting rigs — ladder is sensible:
  - **Low-end** (Ryzen 5 3600 + GTX 1660, 16GB, 1080p): Grade C, 69/100.
    "Your GPU (NVIDIA GeForce GTX 1660) is the bigger limiter right now."
    $150 → no upgrade fits; $300 → RTX 5060 ($299, net ~$283, Cyberpunk
    28→66 / Valorant 100→232 / CS2 83→193 fps); $600 → RX 9070 XT ($579,
    net ~$563, Cyberpunk 28→86 / Valorant 100→304 / CS2 83→253 fps).
    FPS uplift strictly increases rung-over-rung as expected.
  - **High-end** (Ryzen 9 9950X3D + RTX 5090, 32GB, 4K): Grade A, 94/100.
    "Your system is optimized. Nice work." All 3 ladder rungs correctly
    report no upgrade available (RTX 5090 is top-of-DB) — an honest
    "you're already at the top" result rather than a manufactured upsell.

**Known gaps / future polish (flagged, not blocking):**
- CPU-bottleneck cases still get a GPU-only ladder (see design note above)
  — a real CPU-upgrade ladder with its own FPS model would be a good v2.
- Report print styling uses `window.print()` + scoped `@media print` CSS,
  not the imperative jsPDF approach in `src/lib/pdf-report.ts` (that lib
  draws a fixed-layout Pro report; duplicating it for Blueprint's richer,
  variable-length artifact wasn't worth it for v1 — print-to-PDF via the
  browser is standard for hosted report pages).
- CTA added to the `/tier-lists` hub only, not to individual generated
  tier-list posts under `/blog/[slug]` (they share the generic blog
  template) — low effort follow-up if Kruz wants it.
- Entitlement is client-side (localStorage + license key), same acceptable
  tradeoff as the Pro lane at this price point.

**THE FLIP (Kruz):**
1. Create "PC Upgrade Blueprint — $19" in the PCopti Lemon Squeezy store
   (license keys ON, same store 298278). Set `LS_BLUEPRINT_PRODUCT_ID` and
   `NEXT_PUBLIC_LS_BLUEPRINT_CHECKOUT_URL` in Vercel.
2. Set `NEXT_PUBLIC_BLUEPRINT_ENABLED=true` → redeploy. Rehearse with a
   test-mode purchase before leaving test mode.
3. Store leaves test mode together with the Pro lane (one toggle, both
   products go live).

## 2026-07-01: Pro purchase lane ARMED (dormant) — one flip from first revenue

The complete self-serve $9.99 Pro funnel is built, verified end-to-end in
Lemon Squeezy TEST MODE, and shipped **disarmed** (prod unchanged until the
flip). Store "PCopti" + product "PCopti Tool" ($9.99 one-time) already existed
on Lemon Squeezy in test mode — this work connected the last mile.

**What shipped** (branch `revenue/arm-pro-lane`):
- `NEXT_PUBLIC_GATES_ENABLED=true` (build-time) arms the paywall: free tabs
  (Overview/Bottlenecks/Recommendations/Compare/Raw) stay free; Pro tabs
  (Goal Planner, Game FPS, Upgrade Sim, Live Monitor) + PDF export gate at
  $9.99 one-time via the Lemon Squeezy overlay.
- **Fixed a blocking bug**: lemon.js was never initialized
  (`createLemonSqueezy()` was never called) → overlay could not open and the
  Checkout.Success instant-unlock event could never fire.
- Durable entitlement: `/api/license/activate` validates license keys against
  the LS public license API (store 298278 / product 845012 checked,
  activation-limit fallback) + "Restore your purchase" UI in every gate and
  the pricing card.
- Webhook hardened: rejects unsigned/unverified payloads outright; verified
  `order_created` events become `purchase` / `purchase_test` analytics rows
  (no PII) → visible in /stats + daily Discord digest.
- Honest storefront: gates-aware pricing section (Free vs Pro), AI tab hidden
  on Vercel (claudex can't run there — never sell what can't fulfill), all
  "AI-powered" landing/SEO copy made engine-truthful.
- Tests: vitest 27/27 (license logic + webhook signature/PII), Playwright
  repaired (was stale/failing on main) + `pro-gate.spec.ts` covering both
  modes — gates-off 25/25, gates-on 3/3. `tsc` clean, build 124 pages.

**THE FLIP (Kruz, ~10 min, in order):**
1. *(rehearsal, recommended)* Vercel → pc-bottleneck-analyzer → Env Vars →
   add `NEXT_PUBLIC_GATES_ENABLED=true` (Production) → Redeploy. Store is
   still in test mode: buy Pro once on the live site with test card
   `4242 4242 4242 4242` (any future expiry/CVC) — the full loop fires for $0.
2. app.lemonsqueezy.com → PCopti Tool product → **enable "Generate license
   keys"** (makes Restore-purchase work; keys arrive in receipt emails).
3. app.lemonsqueezy.com → Settings → Webhooks → add
   `https://pcbottleneck.buildkit.store/api/webhook/lemonsqueezy` for
   `order_created`; put the signing secret in Vercel as
   `LEMONSQUEEZY_WEBHOOK_SECRET` (sales then appear in /stats + Discord).
4. app.lemonsqueezy.com → **leave Test Mode** (complete store activation /
   payout details if prompted). From that moment the site sells for real.

**Known gaps (acceptable v1):** entitlement is client-side (localStorage +
license key) — a technical user could self-unlock via console; acceptable at
$9.99. AI Insights tab is local-dev only until it gets a real backend.

## 2026-06-28: content engine — data-backed tier-list generator (Phase 1, LIVE)
Started turning the site from an abandoned freemium tool into an **AI PC-parts /
gaming content + affiliate engine** (the "niche content + affiliate" lane). Tier
lists/buying guides are now **generated from the hardware DB** instead of
hand-written, so specs/prices can't drift and lists are regenerable.
- **`src/lib/tier-list.ts`** — pure, tested ranking + MDX-render engine. Ranks
  gpu/cpu by `score` or `value` (perf-per-$100), S–D tiers, performance floor,
  best overall/value/budget picks. Output is YAML-safe + free of raw `<digit` so it
  can't break the prod MDX build.
- **`scripts/generate-tier-list.ts`** (`npm run gen:tierlist`, via tsx) — recipe
  driven; preserves `publishedAt` across regens + stamps `updatedAt`. CPU + budget-GPU
  recipes are defined and one flag from active.
- **`<AffiliateDisclosure />`** MDX component (FTC compliance).
- **First live post**: `/blog/best-graphics-cards-2026-ranked` — 14 GPUs, tier table
  + ranking with a value column + picks + tool CTA. Verified live on prod.
- **Brought vitest to main** (was stranded on `qa/core-logic-tests-and-fixes`): 12
  unit tests + scoped `vitest.config.ts`.
- Verify: `tsc` clean · `vitest` 12/12 · `lint-blog-content.py` 59 files clean ·
  `next build` OK (post statically generated) · live HTML renders disclosure +
  affiliate links + value column. Shipped via PR #3, merged to main, deploy READY.
- **Next**: swap the placeholder Amazon tag (`bottleneck20-20`) for a real Associates
  tag; per-row affiliate links in the ranking table; flip CPU + budget-GPU recipes
  active; wire the clipforge cross-post (tier list → GambaTime Short).

## Quick Status
- **Project:** PC Bottleneck Analyzer
- **Last updated:** 2026-02-21
- **Overall health:** 🟢 Feature-complete for Reddit launch — needs Stripe + EXE packaging
- **Live URL:** https://pcbottleneck.buildkit.store (Vercel, kruz-holts-projects)
- **GitHub:** kjhholt-alt/pc-bottleneck-analyzer

## What's Working
- Next.js 16 project with Tailwind v4, dark theme, Framer Motion animations
- Python system scanner (`scanner/scanner.py`) — detects CPU, GPU, RAM, storage, motherboard, OS, network, BIOS settings
- Scanner `--monitor` mode for continuous live data posting
- Marketing landing page at `/` with hero, how-it-works, feature grid, pricing, FAQ
- Dashboard at `/dashboard` with full analysis suite
- Web dashboard with drag-and-drop JSON upload + demo mode
- Rule-based bottleneck analysis engine (15+ detection rules)
- Performance scoring system (/100 with letter grade)
- Hardware comparison database (~80 CPUs, ~85 GPUs with tiers, pricing, gaming scores)
- Prioritized recommendations (free fixes → cheap fixes → upgrades)
- **AI Analysis tab** — Claude Haiku streaming, cached in localStorage
- **PDF Report Export** — Professional client-side PDF (jsPDF + jspdf-autotable), Pro feature
- **Game FPS Estimator** — 20 popular games, resolution/quality selectors, FPS gauge, upgrade suggestions
- **Percentile Ranking** — "Better than X% of systems" with animated bar, per-component breakdowns
- **Score History Chart** — Recharts LineChart showing score trend across saved scans
- **Driver Check** — Flags outdated GPU drivers (NVIDIA/AMD/Intel) with download links
- **Cost-per-FPS Calculator** — Shows $/FPS for top 5 GPU upgrades per game
- **Real-time Monitor** — Live CPU/GPU temps + usage via polling, with Demo Mode (simulated gaming session)
- Dashboard tabs: Overview, Bottlenecks, Recommendations, Simulate, Game FPS, AI Analysis, Monitor, Raw Data
- POST /api/scan endpoint with validation + sanitization
- Scan history + comparison (localStorage, max 20)
- Share via URL (base64-encoded)
- PCPartPicker build import
- Upgrade Simulator (what-if CPU/GPU swap)
- Upgrade Walkthrough (step-by-step guides for CPU/GPU/RAM/Storage)
- Compatibility checker (socket, DDR gen, PSU)
- Per-motherboard BIOS optimization guides (7 brands + generic)
- PyInstaller packaging (.exe build spec exists)
- Deployed on Vercel

## What's NOT Working / Incomplete
- **Stripe payments** — No paywall yet. All Pro features are accessible for free during beta.
- **PyInstaller EXE distribution** — Build spec exists but no hosted .exe download on the site
- ~~**Custom domain**~~ — ✅ Live at pcbottleneck.buildkit.store
- **Reddit launch** — Content drafted but not posted

## Feature Tiers (Pro vs Free)

### Free Tier
- Run scanner + upload scan
- Basic score + letter grade
- Top 3 bottlenecks
- Top 3 recommendations
- Raw data viewer
- Demo mode

### Pro Tier ($4.99 one-time — NOT YET GATED)
- AI Deep Analysis (Claude Haiku streaming)
- PDF Report Export ("Download Full Report")
- Game FPS Estimator (20 games)
- Percentile Ranking
- Score History Chart
- Driver Check
- Cost-per-FPS Calculator
- Real-time Monitor
- Upgrade Simulator
- Full recommendations list

## Last Session Summary
**Date:** 2026-02-21
**What got done:**
- Built 3 medium-impact features: Score History Chart, Driver Check, Cost-per-FPS Calculator
- Wired up Real-time Monitor: scanner `--monitor` mode + Demo Mode with simulated gaming session
- Saved marketing gameplan to Obsidian notes
- Updated all project notes

## What's Left Before Reddit Launch
1. **Stripe integration** — Checkout + webhook, gate Pro features behind payment
2. **PyInstaller EXE** — Host on GitHub Releases, add download button on landing page
3. ~~**Custom domain**~~ — ✅ Done (pcbottleneck.buildkit.store)
4. **Reddit launch** — Post on r/buildapc, r/pcmasterrace, r/hardware

## Architecture Decisions Log
| Date | Decision | Why | Alternative |
|------|----------|-----|-------------|
| 2026-02-12 | Lightweight agent + web dashboard | Plays to Next.js strengths, faster to ship | Full Electron app |
| 2026-02-12 | Tailwind v4 with CSS variables | Comes with create-next-app, modern approach | Tailwind v3 config |
| 2026-02-12 | Rule-based analysis first, AI later | Works offline, instant results, no API costs | AI-only analysis |
| 2026-02-21 | HTTP polling for monitor (not WebSocket) | Works on Vercel serverless, simpler | WebSocket (needs persistent server) |
| 2026-02-21 | Client-side PDF (jsPDF) | No API route needed, instant generation | Server-side PDF or html2canvas |
| 2026-02-21 | FPS estimation from hardware DB scores | No external API, instant, works offline | External benchmark API |
| 2026-02-21 | Percentile from hardware DB distribution | No database needed, realistic curve | User-submitted data (needs scale) |

## Environment Notes
- OS: Windows 11 Enterprise
- Node: v24.13.0
- Next.js: 16.1.6
- Deploy: Vercel (kruz-holts-projects)
- GitHub: kjhholt-alt/pc-bottleneck-analyzer
- Local path: C:\Users\Kruz\Desktop\Projects\pc-bottleneck-analyzer

## Session History
| # | Date | Goal | Result | Notes |
|---|------|------|--------|-------|
| 1 | 2026-02-12 | Scanner + Dashboard | ✅ Complete | Sessions 1 & 2 combined |
| 2 | 2026-02-21 | AI Analysis + Landing Page | ✅ Complete | Claude Haiku streaming, marketing landing page |
| 3 | 2026-02-21 | Pro Features (PDF, FPS, Percentile) | ✅ Complete | 3 high-impact Pro features |
| 4 | 2026-02-21 | Medium Features + Monitor | ✅ Complete | Score history, driver check, cost/FPS, monitor wiring |
