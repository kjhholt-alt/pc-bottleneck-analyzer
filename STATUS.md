# PC Bottleneck Analyzer — Status

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
