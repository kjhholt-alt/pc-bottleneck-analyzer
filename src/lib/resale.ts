// ─── Used-Market Resale Estimator ────────────────────────────────────────────
//
// Flat, conservative multipliers on top of a part's current approximate price
// to estimate what it could fetch used (eBay/Marketplace/r/hardwareswap-style
// pricing). These are clearly-labeled estimates, not live market data — no
// scraping, no per-listing lookups.

import type { HardwareEntry, HardwareTier } from "@/data/hardware-db";

/** Depreciation by age since release. Older parts hold less value. */
const AGE_BRACKETS: { maxAgeYears: number; multiplier: number }[] = [
  { maxAgeYears: 1, multiplier: 0.75 },
  { maxAgeYears: 2, multiplier: 0.6 },
  { maxAgeYears: 3, multiplier: 0.48 },
  { maxAgeYears: 4, multiplier: 0.38 },
  { maxAgeYears: 6, multiplier: 0.28 },
  { maxAgeYears: Infinity, multiplier: 0.18 },
];

/** Additional haircut for lower tiers — budget parts see thinner used demand. */
const TIER_MULTIPLIER: Record<HardwareTier, number> = {
  very_high: 1.0,
  high: 0.95,
  mid: 0.85,
  low: 0.75,
  very_low: 0.6,
};

/**
 * Estimate the resale value of a part being replaced. Always strictly less
 * than its current approximate price — this is a conservative "what you
 * could probably get for it used" number, not a guarantee.
 */
export function estimateResaleValue(
  entry: HardwareEntry,
  currentYear: number,
): number {
  const ageYears = Math.max(0, currentYear - entry.release_year);
  const bracket =
    AGE_BRACKETS.find((b) => ageYears <= b.maxAgeYears) ??
    AGE_BRACKETS[AGE_BRACKETS.length - 1];

  const basePrice = entry.current_price_approx || entry.msrp;
  const raw = basePrice * bracket.multiplier * TIER_MULTIPLIER[entry.tier];

  // Cap below the part's own price so "resale" can never exceed "worth".
  return Math.max(0, Math.round(Math.min(raw, basePrice * 0.8)));
}
