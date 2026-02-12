// TODO: Score Comparison Component
//
// Side-by-side display of two performance scores (before/after upgrade sim).

"use client";

import type { PerformanceScore } from "@/lib/types";

interface ScoreComparisonProps {
  before: PerformanceScore;
  after: PerformanceScore;
}

export function ScoreComparison({
  before: _before,
  after: _after,
}: ScoreComparisonProps) {
  // TODO: Implementation
  // - Show two ScoreGauge components side by side
  // - Display delta prominently (e.g., "+12 points" in green, "-5 points" in red)
  // - Show per-component breakdown comparison
  return null;
}
