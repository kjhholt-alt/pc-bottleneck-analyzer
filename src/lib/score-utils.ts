// ─── Shared Score Utilities ──────────────────────────────────────────────────
// Single source of truth for score-to-color mapping and max score constants.

/**
 * Max points per sub-score category.
 * Must match the scoring logic in analysis.ts.
 */
export const MAX_SCORES: Record<string, number> = {
  cpu: 25,
  gpu: 25,
  ram: 20,
  storage: 15,
  settings: 15,
};

/**
 * Unified score-to-color mapping.
 * Uses consistent thresholds: >= 80 green, >= 60 amber, else red.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--green)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

/**
 * Score-to-glow mapping for the gauge SVG.
 */
export function getScoreGlow(score: number): string {
  if (score >= 80) return "0 0 40px rgba(16, 185, 129, 0.3)";
  if (score >= 60) return "0 0 40px rgba(245, 158, 11, 0.3)";
  return "0 0 40px rgba(239, 68, 68, 0.3)";
}

/**
 * Breakdown sub-score to color.
 * Converts a raw sub-score to a percentage using MAX_SCORES, then maps to color.
 */
export function getBreakdownColor(key: string, value: number): string {
  const max = MAX_SCORES[key] ?? 25;
  const pct = Math.round((value / max) * 100);
  return getScoreColor(pct);
}
