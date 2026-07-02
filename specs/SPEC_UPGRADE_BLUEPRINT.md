# SPEC: PC Upgrade Blueprint — second paid artifact on the armed PCopti lane

> **How to run this spec (Kruz):** open a Claude Code session in
> `C:\Users\Kruz\Desktop\Projects\pc-bottleneck-analyzer` and paste:
> *"Read specs/SPEC_UPGRADE_BLUEPRINT.md and execute it exactly. Work on a
> branch, verify everything it lists, open a PR when green."*

**Spec author:** Fable (designed 2026-07-01). **Executor:** any capable coding
agent (written for Sonnet). Decisions are made; build, don't relitigate.

---

## Mission

The $9.99 Pro lane is armed (see STATUS.md 2026-07-01). This spec adds the
**higher-ticket artifact**: a personalized **PC Upgrade Blueprint** — a
one-time **$19** purchase that turns a visitor's scan (or manual part pick)
into a permanent, printable upgrade plan. Deterministic generation, zero
per-unit cost, no LLM anywhere on the route. Ship dormant behind
`NEXT_PUBLIC_BLUEPRINT_ENABLED`.

## Why this product

- The site's traffic is buying-intent SEO (tier lists, "X vs Y", best-GPU-for
  pages). Those visitors want exactly one thing: "what should *I* buy?"
- Every data asset already exists in-repo: hardware DB with tiers/prices/
  gaming scores (`src/data/hardware-db.ts`, ~80 CPUs + ~85 GPUs), per-game FPS
  data powering `/best-gpu-for` (20 games), the analysis engine
  (`src/lib/analysis.ts`), compatibility checker, upgrade walkthroughs, and
  affiliate links (`src/lib/affiliate.ts`, real Amazon tag `bottleneck20-20`).
- Blueprint = a curated composition of those assets per-user. Artifact lane,
  not SaaS.

## The artifact (exact contents)

Input: an uploaded scan JSON **or** a manual picker (CPU + GPU + RAM +
resolution + 3 target games) for the majority who won't run the .exe scanner.

Output: one hosted page (print-to-PDF friendly, reuse `src/lib/pdf-report.ts`
patterns) containing:
1. **Verdict** — current bottleneck summary + performance score (existing engine).
2. **Upgrade ladder at 3 budgets (~$150 / ~$300 / ~$600)** — exact part picks
   from the hardware DB, chosen for compatibility (socket, DDR gen, PSU
   headroom — reuse the compatibility checker) and best score-per-dollar.
3. **Per-game FPS uplift estimates** for their target games at their
   resolution, before → after each ladder rung (reuse the best-gpu-for FPS
   dataset + Game FPS Estimator logic).
4. **Order of operations** — what to buy first and why.
5. **Sell-your-old-parts estimates** — flat resale multipliers on DB prices by
   tier/age (define a small `resale.ts` table; conservative, clearly labeled
   estimates) → "net cost" per rung.
6. **Free wins checklist** — XMP/ReBAR/driver/power-plan items from the
   existing settings rules.
7. Affiliate links on every recommended part (existing `getAmazonLink`).

## Decisions already made

1. **$19, one-time, separate Lemon Squeezy product** in the existing PCopti
   store. Kruz creates the product at flip time; build against
   `NEXT_PUBLIC_LS_BLUEPRINT_CHECKOUT_URL` + `LS_BLUEPRINT_PRODUCT_ID` env
   vars. Same store ID (298278) as `src/lib/license.ts`.
2. **Entitlement = license key per purchase** (LS generates one per order).
   Buyer lands on `/blueprint`, enters key (or arrives via success redirect),
   server validates via the existing `activateOrValidateLicense` pattern —
   generalize `src/lib/license.ts` to accept a product ID parameter instead of
   the single hardcoded one. Pro purchasers do NOT get Blueprint (different
   product), and vice versa.
3. **Stateless fulfillment.** The scan/pick lives in the browser
   (localStorage, existing history lib); the report is derived data =
   regenerable anytime the license validates. No new Supabase tables, no PII.
4. **No LLM.** Every sentence in the artifact is template + data. The rail
   about Anthropic API on public routes stays absolute.
5. **Funnel entries:** a "Get your Upgrade Blueprint" CTA block on the
   analyzer results (Recommendations tab), on `/best-gpu-for/[game]` pages,
   and on tier-list pages (there is an existing CTA component pattern in the
   MDX pipeline — extend, don't invent).

## Scope

**In:** `/blueprint` route (landing + picker + paywalled report),
`src/lib/blueprint.ts` pure generator (unit-test it hard — this is the
product), license generalization, gates-aware CTAs, print styling, analytics
events (`blueprint_view`, `blueprint_purchase_click` via existing `/api/t`),
Playwright spec mirroring `tests/e2e/pro-gate.spec.ts` (dormant + armed
modes), STATUS.md update.

**Out:** touching the $9.99 Pro lane's behavior; live LS keys / leaving test
mode; email delivery (v2); any LLM call; new DB tables.

## Verification & Definition of Done

- `npx vitest run` green including new `blueprint.test.ts` (ladder respects
  budgets, never recommends incompatible parts, FPS uplift monotonic per rung,
  resale never exceeds price); `tsc` clean; `next build` green;
  `py scripts/lint-blog-content.py` clean if any MDX touched.
- Playwright: dormant run (flag unset → no CTAs, `/blueprint` shows
  coming-soon or 404) and armed run (picker → paywall → simulated unlock →
  full artifact renders, print CSS sane).
- Manual browser pass with the preview tools on 2 contrasting inputs (a
  low-end and a high-end rig): the ladder must be *sensible* — eyeball it and
  paste both artifacts' verdict sections into the PR.
- Ships dormant: env unset ⇒ zero prod change. Commits authored
  `kjh.holt@gmail.com`. **Heads-up:** pushing to `main` deploys prod — merge
  only when green.

## The flip (list at the end of your PR)

1. Kruz creates "PC Upgrade Blueprint — $19" in the PCopti LS store (license
   keys ON), pastes checkout URL + product ID into Vercel env.
2. Set `NEXT_PUBLIC_BLUEPRINT_ENABLED=true` + redeploy; rehearse with test
   card while the store is still in test mode.
3. Store leaves test mode together with the Pro lane (one toggle, both
   products live).
