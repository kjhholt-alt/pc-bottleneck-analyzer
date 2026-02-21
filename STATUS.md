# PC Bottleneck Analyzer — Status

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
