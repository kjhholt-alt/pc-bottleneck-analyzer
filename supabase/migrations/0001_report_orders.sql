-- PC Deep-Dive Report ($29) — durable order store
--
-- Report orders must live in Supabase in prod: Vercel functions are
-- stateless, so the file-backed ReportStore (src/lib/deepdive/store.ts)
-- can't carry a pending order across the checkout -> webhook -> delivery
-- hops. This table is the ONLY backend that survives that.
--
-- Idempotent: safe to run more than once (create-if-not-exists throughout).
--
-- Apply with EITHER:
--   1. The Supabase MCP `apply_migration` tool (preferred — no manual SQL,
--      no dashboard click-through), once it's authenticated for a session, or
--   2. `node scripts/apply-report-orders-migration.mjs` — a self-serve
--      fallback that runs this exact file via the Supabase Management API.
-- See RUNBOOK-CHECKOUT.md, Step 1.

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
