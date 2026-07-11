# SPEC — PC Deep-Dive Report ($29, server-generated, private-link delivery)

Greenlight item **gl-0199**. The site's third paid artifact and the first with
**server-side, post-purchase fulfillment**: the buyer pays, we generate the
report on the webhook, and they collect it at a private link.

## Why this is different from Blueprint

| | Blueprint ($19) | Deep-Dive ($29) |
|---|---|---|
| Generation | Client-side, instant | **Server-side, after payment** |
| Unlock | License key from email | **Private tokenized link** |
| Storage | None (localStorage) | **Server store (Supabase/prod)** |
| Artifact | A page you assemble | **A delivered standalone HTML doc** |

The doctrine hook: *the artifact IS the product.* A personalized deep-dive behind
one low-friction purchase link is a path where a first dollar can arrive while
Kruz sleeps — generation is fully deterministic (no LLM, ~$0/unit), so it runs
headlessly on a webhook with no per-order babysitting.

## Flow

```
/report (intake form)
   │  POST /api/report/checkout  → creates PENDING order {token, specs}
   ▼                               returns hosted LS checkout URL (token in custom data)
Lemon Squeezy hosted checkout  ── buyer pays (test card in test mode) ──┐
   │                                                                    │
   ▼  order_created webhook (signed)                                    │
/api/webhook/lemonsqueezy ── verify sig ─→ record sale (/stats) ────────┘
   │  meta.custom_data.report_token present + DEEPDIVE_FULFILLMENT_ENABLED
   ▼  generate (deterministic) + render HTML → store FULFILLED against token
/report/r/[token]  ── polls /api/report/status → renders artifact when ready
   └─ /report/r/[token]/download → raw self-contained HTML (print / Save as PDF)
```

## Components

- **Generator** `src/lib/deepdive/report.ts` — `generateDeepDiveReport(input)`.
  Reuses `analyzeScan` + `generateBlueprint` + `estFps` + `getPercentiles`.
  Deterministic. `generateSampleReport()` is the canned public demo.
- **Renderer** `src/lib/deepdive/render.ts` — `renderReportHtml(report)` → a
  self-contained dark-theme HTML doc with print CSS. Escapes buyer notes.
- **Store** `src/lib/deepdive/store.ts` — `ReportStore` with a Supabase backend
  (prod, single `report_orders.data` jsonb column) and a file backend (dev/test).
- **Fulfillment** `src/lib/deepdive/fulfillment.ts` — token gen, checkout-URL
  builder, `fulfillReportOrder()` (idempotent, never throws).
- **Validation** `src/lib/deepdive/validate.ts` — `parseDeepDiveInput()`.
- **Routes** — `POST /api/report/checkout`, `GET /api/report/status`, webhook
  extension, `GET /report/r/[token]/download`.
- **Pages** — `/report` (dormant-aware landing + intake), `/report/sample`
  (canned demo), `/report/r/[token]` (private delivery).

## Rails honored

- **Nothing live until Kruz clears it** — two OFF-by-default switches
  (`NEXT_PUBLIC_DEEPDIVE_ENABLED`, `DEEPDIVE_FULFILLMENT_ENABLED`). Go-live is a
  parked, Kruz-gated recipe (`DEEPDIVE_GOLIVE.md`).
- **No live model API on public demos** — the generator has no model call at all;
  the public `/report/sample` renders a fixed canned input and never accepts
  buyer input. Live generation only runs behind a verified paid webhook.
- **No PII to analytics** — the webhook records only order number + total +
  product name (unchanged from the existing Pro/Blueprint behavior).
- **Merchant-of-record** — Lemon Squeezy hosted checkout (it's the MoR, handles
  tax/receipts); integrated in TEST MODE only for this item.

## Verification

`src/app/api/report/__tests__/e2e.test.ts` drives the full test-mode loop
through the real route handlers: checkout → signed `order_created` webhook →
server-side generation → stored artifact naming the buyer's parts → status ready;
plus forged-signature rejection, fulfillment-disabled, dormant-404, and
bad-input cases. Unit tests cover the generator (determinism, escaping), store
lifecycle, and input validation.
