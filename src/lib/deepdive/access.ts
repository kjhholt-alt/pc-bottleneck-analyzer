// ─── PC Deep-Dive Report — access + dormancy (client-safe) ───────────────────
//
// Only NEXT_PUBLIC_* reads and pure helpers live here so this module is safe to
// import from client components (the intake form). Server-only helpers (token
// generation, checkout-URL signing, webhook fulfillment) live in
// src/lib/deepdive/fulfillment.ts.
//
// The product ships DORMANT: with the flag unset, /report shows "coming soon",
// every funnel CTA is hidden, and the checkout/webhook fulfillment paths refuse
// to run. Kruz flips it live in one step — see specs/DEEPDIVE_GOLIVE.md.

/** Master switch for the Deep-Dive Report product (build-time public flag). */
export const DEEPDIVE_ENABLED =
  process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED === "true";

/**
 * Runtime-evaluated form of the master switch, for server route handlers and
 * tests that toggle the env var at call time (the build-time const above is
 * inlined into client bundles and can't be flipped after build).
 */
export function isDeepDiveEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED === "true";
}

/** Display price of the one-time Deep-Dive Report purchase. */
export const DEEPDIVE_PRICE = "$29";

/** Lemon Squeezy hosted checkout URL for the Deep-Dive product. Empty until live. */
export const DEEPDIVE_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL || "";

/** How many target games the buyer may enter (the report renders a row per game). */
export const DEEPDIVE_MAX_GAMES = 5;

/** localStorage key holding the buyer's most recent {token, deliveryUrl} so they can re-find it. */
export const DEEPDIVE_RECEIPT_KEY = "pc-deepdive-receipt";

/** Delivery path for a given token — the private, unguessable link to the artifact. */
export function deliveryPath(token: string): string {
  return `/report/r/${token}`;
}
