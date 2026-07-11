# Deep-Dive Report — Price Recommendation Memo

**Date:** 2026-07-06 · **Product:** PC Deep-Dive Report (server-generated,
private-link delivery) · **Decision owner:** Kruz

## TL;DR

**Recommend $29 (Option B).** It sits one clear step above the $19 self-serve
Blueprint and the $9.99 Pro unlock, matches the "done-for-you, delivered
artifact" feel of the product, and is still a rounding error against the
$300–600 GPU decision the buyer is actually weighing. Ship at $29; the price is a
single env var (`DEEPDIVE_PRICE` + the LS product), so it's cheap to A/B later.

---

## What the view-tracker tells us (grounding)

Exact live counts live in the Vercel-only Supabase analytics (`/stats`, gated by
`STATS_SECRET`), so confirm the split there before finalizing. But the **shape**
of the traffic is well established from the content/SEO build and is what matters
for pricing:

- The site's organic traffic is dominated by **high-purchase-intent
  bottleneck/upgrade queries** — the exact pages the SEO autopilot targets:
  - `is-my-gpu-bottlenecking-my-cpu` / `cpu-vs-gpu-bottleneck` (core intent)
  - `should-i-upgrade-cpu-or-gpu-first` (a literal buying decision)
  - `best-gpu-for-<game>` and `best-graphics-cards-2026-ranked` (mid-purchase)
  - `low-fps-with-good-gpu-and-cpu` (troubleshooting, high frustration)
- These visitors are **already about to spend $300–$600 on a GPU/CPU.** The free
  tool and blog answer the question generically; the Deep-Dive is the paid,
  *personalized* answer — "for YOUR exact parts, here's the bottleneck, the
  per-game FPS you'll get, and the cheapest upgrade that clears your target."
- **What a report is worth here** is anchored to the *upgrade it de-risks*, not
  to the cost of generating it (which is ~$0 — deterministic, no LLM). Spending
  $29 to avoid buying the wrong $400 card, or to confirm the $300 one is enough,
  is obvious value. That framing supports a price *above* an impulse buy.

## The existing product ladder (internal anchors)

| Product | Price | What it is | Fulfillment |
|---|---|---|---|
| Pro | $9.99 | Unlock the tool's Pro tabs | Instant, client-side |
| Upgrade Blueprint | $19 | Self-serve upgrade plan | Instant, client-side |
| **Deep-Dive Report** | **?** | Full personalized report, **delivered** | **Server-generated, private link** |

The Deep-Dive is deliberately the *most* finished, most "done-for-you" artifact
of the three (it arrives as a standalone, printable document at a private link,
not a page you assemble yourself). Its price should read as the top of this
ladder, not a peer of Blueprint.

---

## Option A — $19 (match Blueprint, volume/low-friction)

- **Rationale:** Same price as Blueprint = zero pricing hesitation; lean on
  conversion volume from the high-traffic SEO pages. Simple story: "$19 gets you
  a report."
- **Pros:** Lowest friction; easiest impulse buy off a blog CTA; one price point
  across both artifact products is simple to explain.
- **Cons:** **Cannibalizes Blueprint** — two $19 products with overlapping value
  confuses the ladder and gives no reason to prefer one. Leaves money on the
  table given the buyer's $300+ context. Signals "same tier" for a product that
  is genuinely more finished.
- **Best if:** the goal is raw units / list-building and Blueprint is retired or
  merged into this.

## Option B — $29 (premium personalized artifact) — **RECOMMENDED**

- **Rationale:** Prices the Deep-Dive as the top of the ladder: +50% over
  Blueprint reflects the delivered-artifact fulfillment and the fuller report
  (full bottleneck list, percentile, per-game table, ordered plan). Still trivial
  vs. the upgrade being decided.
- **Pros:** Clean ladder ($9.99 → $19 → $29); higher revenue per conversion on
  traffic that's already purchase-intent; "delivered to a private link" justifies
  the step up; round, friendly number.
- **Cons:** ~$10 more friction than Blueprint; needs the landing/sample to
  clearly show the extra value (the sample report does this).
- **Best if:** we keep a real product ladder and want ARPU, not just units.
  **This is the default the code ships with.**

### Not recommended: $39+
Defensible on value (it de-risks a $400 buy), but it's a bigger ask from a
cold SEO visitor with no brand trust yet, and the sample has to carry a lot. Revisit
only after there's conversion data at $29.

---

## Recommendation & next step

Ship **$29**. After it's live and there's a few weeks of `/stats` data
(conversion rate by source page), test **$19 vs $29** by swapping the LS product
/ `NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL` — the traffic mix (which SEO pages
convert) will say whether the low-friction or premium framing wins on revenue,
not just units.
