# Deep-Dive Report ($29) — Checkout Runbook

**Status: everything is staged and dormant.** Code, tests, the order table's
migration file, and the webhook are all built and merged to `main` already
(see `STATUS.md`, 2026-07-26). Nothing here is armed — every flag defaults
off, no product exists yet on Lemon Squeezy, and no money has moved. This is
the exact, ordered, click-by-click list to take it live. Follow it in order;
each step says what to click and what to check before moving to the next one.

Background: `specs/DEEPDIVE_GOLIVE.md` (the original go-live recipe this
runbook supersedes with more click-level detail), `specs/SPEC_DEEPDIVE_REPORT.md`
(what the product is), `specs/DEEPDIVE_PRICE_MEMO.md` (why $29).

---

## Step 1 — Provision the `report_orders` table (Supabase)

The order needs to survive three separate serverless requests (checkout →
webhook → delivery), so it lives in Supabase, not a file. The exact SQL is
already written at `supabase/migrations/0001_report_orders.sql` — you never
need to write or paste SQL by hand. Two ways to run it:

**Option A — ask Claude to run it (preferred, zero manual steps):**
In a Claude Code session where the Supabase MCP is connected and
authenticated (first use in a session may prompt an OAuth login in your
browser — approve it), say: *"apply the migration in
`pc-bottleneck-analyzer/supabase/migrations/0001_report_orders.sql`"*. Claude
runs it via the `apply_migration` MCP tool directly against the pcbottleneck
Supabase project. Nothing for you to type.

**Option B — self-serve script (if the MCP isn't available):**
1. Go to https://supabase.com/dashboard/account/tokens → click **Generate
   new token** → name it anything (e.g. "pcbottleneck-migrations") → copy
   the token.
2. In `pc-bottleneck-analyzer/.env.local`, add one line:
   `SUPABASE_ACCESS_TOKEN=<the token you just copied>`
   (`.env.local` is gitignored — this never gets committed.)
3. In a terminal, `cd` into `pc-bottleneck-analyzer` and run:
   `node scripts/apply-report-orders-migration.mjs --dry-run` — confirms it
   resolved your project ref correctly and shows you the exact SQL about to
   run, with **no network call yet**.
4. If that looks right, run it for real:
   `node scripts/apply-report-orders-migration.mjs`
   You should see `[apply-migration] applied OK (HTTP 200).`

**Verify (either option):** Supabase dashboard → your pcbottleneck project →
left sidebar **Table Editor** → confirm a `report_orders` table now exists
(columns: `id`, `site`, `token`, `data`, `created_at`) and is empty. If it's
there, this step is done — do not proceed until you see it.

---

## Step 2 — Create the $29 Deep-Dive product in Lemon Squeezy (test mode)

1. Go to https://app.lemonsqueezy.com → make sure you're in the **PCopti**
   store (store ID 298278 — same store as the existing Pro and Blueprint
   products) → confirm the **Test Mode** toggle (top right) is **ON**.
2. Left sidebar → **Products** → **New Product** (top right button).
3. Fill in:
   - **Name**: `PC Deep-Dive Report`
   - **Price**: `$29.00`, one-time (not a subscription)
   - **Description**: optional, can reuse the "What's included" list from
     `pc-bottleneck-analyzer/src/app/report/page.tsx` (the `INCLUDES` array).
   - **Generate license keys**: leave **OFF** — this product delivers via a
     private link (the webhook), not a license key, unlike Pro/Blueprint.
4. Click **Save** / **Publish**.
5. Open the new product → find its **hosted checkout link** (button usually
   labeled **Share** or **Checkout Link** on the product page) → copy the
   **plain URL** (looks like
   `https://pcopti.lemonsqueezy.com/checkout/buy/<some-id>`). **Do not** copy
   an embed/overlay variant or append `?embed=1` — this product uses a plain
   hosted checkout page, not the overlay used by Pro.
6. Left sidebar → **Settings → Webhooks** → confirm the webhook pointed at
   `https://pcbottleneck.buildkit.store/api/webhook/lemonsqueezy` (event:
   `order_created`) already exists and shows **Active** — it was set up for
   the Pro/Blueprint lanes and is reused here, nothing new to add. Confirm
   `LEMONSQUEEZY_WEBHOOK_SECRET` is already set in Vercel (Step 3 checks
   this too).

**Verify:** you have the hosted checkout URL copied somewhere for Step 3.

---

## Step 3 — Set the Vercel flags (still test mode) and redeploy

1. Go to https://vercel.com → **pc-bottleneck-analyzer** project → **Settings
   → Environment Variables**.
2. Add/confirm these three, all scoped to **Production**:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_DEEPDIVE_ENABLED` | `true` |
   | `NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL` | the hosted checkout URL from Step 2.5 |
   | `DEEPDIVE_FULFILLMENT_ENABLED` | `true` |
3. Confirm `LEMONSQUEEZY_WEBHOOK_SECRET` and `SUPABASE_URL` /
   `SUPABASE_SERVICE_KEY` are already set (Production) — they should be,
   shared with the Pro/analytics lanes. If any are missing, this is a hard
   stop — the webhook returns 503 without the secret and the store falls
   back to the file backend (which doesn't survive across requests on
   Vercel) without the Supabase pair.
4. **Deployments** tab → find the latest `main` deploy → **⋯ → Redeploy**
   (or just push anything to `main` — either triggers a fresh build with the
   new env vars baked in).

**Verify:** once the deploy finishes, visit
`https://pcbottleneck.buildkit.store/report` — it should show the real
pitch page + intake form, not "Coming Soon."

---

## Step 4 — Rehearse one full test-card purchase

Do this before touching Step 5. Everything here is still Lemon Squeezy test
mode — no real card, no real charge.

1. On `/report`, fill in a CPU, GPU, RAM, resolution, and at least one game
   → submit.
2. You're sent to the Lemon Squeezy hosted checkout page. Pay with the test
   card `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC, any
   name/zip.
3. After payment, Lemon Squeezy redirects back — find your private report
   link (it's saved to your browser's localStorage under
   `pc-deepdive-receipt`, and/or shown on the post-checkout page). Open it —
   it's `https://pcbottleneck.buildkit.store/report/r/<token>`.
4. **Verify** on that page: the report renders with your entered CPU/GPU
   names, a per-game FPS table, and the upgrade ladder. Try **Print** (or
   Ctrl/Cmd+P → Save as PDF) — it should render cleanly.
5. **Verify the sale recorded:** go to
   `https://pcbottleneck.buildkit.store/stats` (enter the `STATS_SECRET`
   value from Vercel env when prompted) → confirm a new `purchase_test` row
   appears for this order.

If any of these don't check out, **stop here** — unset
`NEXT_PUBLIC_DEEPDIVE_ENABLED` in Vercel, redeploy, and fix before touching
Step 5. Nothing in Steps 1–4 costs real money or is a one-way door — you can
flip any flag back off and re-rehearse as many times as you want.

---

## Step 5 — Leave test mode (THE real-money step)

**This is the one step that makes the product sell for real. Do not do this
until Step 4 rehearsed clean.**

1. https://app.lemonsqueezy.com → PCopti store → **Settings → General** (or
   the banner shown while in test mode) → **Leave Test Mode** (also called
   "Activate store" / complete payout + tax details if prompted — Lemon
   Squeezy will walk you through connecting a payout method).
2. From that moment, `/report` sells for $29 for real, alongside the
   existing Pro ($9.99) and Blueprint ($19) lanes if those are already live
   in the same store.

**Verify:** the test-mode banner in the Lemon Squeezy dashboard is gone.
Nothing else changes — same checkout URL, same webhook, same site.

---

## Kill switch (any time, no data loss)

Vercel → Environment Variables → unset `NEXT_PUBLIC_DEEPDIVE_ENABLED` (takes
the storefront down, shows "Coming Soon" again) and/or
`DEEPDIVE_FULFILLMENT_ENABLED` (stops new reports from generating; sales
still get recorded to `/stats`) → redeploy. Already-delivered reports at
their `/report/r/[token]` links keep working. No data is lost or deleted by
flipping either flag off.
