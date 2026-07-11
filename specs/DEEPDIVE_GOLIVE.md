# Deep-Dive Report — Go-Live Recipe (PARKED, Kruz-gated)

**Status: NOT LIVE. Ships dormant.** Nothing generates, nothing sells until
Kruz runs the steps below. This is the one hard gate — do not flip any of these
flags autonomously. (Rail: nothing goes live until fully tested and Kruz clears
it; real-money listings need explicit Kruz yes.)

The product is fully built and verified in test mode (see the E2E suite
`src/app/api/report/__tests__/e2e.test.ts` and `STATUS.md`). Turning it on is a
short, ordered checklist.

---

## What "live" means here

Two independent switches, both OFF by default:

1. **`NEXT_PUBLIC_DEEPDIVE_ENABLED`** — the *storefront*. On → `/report` shows
   the pitch + intake form and starts creating pending orders. Off → "coming
   soon". (The `/report/sample` canned demo is always viewable.)
2. **`DEEPDIVE_FULFILLMENT_ENABLED`** — the *live generation switch*. On → the
   Lemon Squeezy webhook actually generates + stores the report for a paid
   order. Off → sales are still recorded to `/stats`, but no report is produced.

Keeping them separate means you can put the storefront up in test mode first,
rehearse a full purchase, and only then arm real fulfillment.

---

## Step 0 — Provision the durable order store (Supabase)

Report orders MUST live in Supabase in prod (Vercel functions are stateless, so
the file backend can't carry an order across the checkout→webhook→delivery
hops). Run this once in the pcbottleneck Supabase project (SQL editor):

```sql
create table if not exists public.report_orders (
  id          bigint generated always as identity primary key,
  site        text        not null default 'pcbottleneck',
  token       text        not null,
  data        jsonb       not null,
  created_at  timestamptz not null default now()
);

create unique index if not exists report_orders_token_key
  on public.report_orders (token);

-- Service-role only. RLS on with no policies = no anon/public access; the
-- server writes with SUPABASE_SERVICE_KEY, which bypasses RLS.
alter table public.report_orders enable row level security;
```

Then in Vercel set `DEEPDIVE_STORE=supabase` (or leave it unset — it defaults to
Supabase whenever `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` are present, which they
already are for analytics).

## Step 1 — Create the Lemon Squeezy product

In the existing **PCopti** store (298278), still in **test mode**:
- New product: **"PC Deep-Dive Report" — $29** one-time. License keys not
  required (delivery is via the private link, not a key).
- Copy its **hosted checkout URL** (the plain share link, NOT `?embed=1`).
- Confirm the webhook already added for Pro/Blueprint
  (`https://pcbottleneck.buildkit.store/api/webhook/lemonsqueezy`, event
  `order_created`) is active, and `LEMONSQUEEZY_WEBHOOK_SECRET` is set in Vercel.

## Step 2 — Set the storefront live (still test mode) + rehearse

In Vercel env (Production), then redeploy:
- `NEXT_PUBLIC_DEEPDIVE_ENABLED=true`
- `NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL=<hosted checkout URL from step 1>`
- `DEEPDIVE_FULFILLMENT_ENABLED=true`

Rehearse the whole loop on the live site while LS is still in test mode:
1. Open `/report`, fill specs, click buy.
2. Pay with the LS test card `4242 4242 4242 4242` (any future expiry/CVC).
3. Return to the private link (kept in localStorage as `pc-deepdive-receipt`, or
   `/report/r/<token>`); confirm the report renders, downloads, and prints.
4. Confirm a `purchase_test` row appears in `/stats`.

If anything is off, unset `NEXT_PUBLIC_DEEPDIVE_ENABLED` and fix before going on.

## Step 3 — Leave test mode (THE real-money step — explicit Kruz yes)

In Lemon Squeezy: **leave Test Mode** (finish store activation / payout details
if prompted). From that moment `/report` sells for real. Nothing else changes.

---

## The one-line enable (after Step 0 + 1 are done once)

> In Vercel set `NEXT_PUBLIC_DEEPDIVE_ENABLED=true`,
> `NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL=<url>`, `DEEPDIVE_FULFILLMENT_ENABLED=true`
> → redeploy → rehearse with the test card → then leave LS test mode.

## Kill switch

Unset `NEXT_PUBLIC_DEEPDIVE_ENABLED` (storefront off) and/or
`DEEPDIVE_FULFILLMENT_ENABLED` (generation off) and redeploy. Existing delivered
reports keep working; no new orders are taken.
