// TODO: Upgrade Simulator Modal Component
//
// Allows users to pick a different CPU/GPU from the hardware database
// and see how their performance score and bottleneck analysis would change.

"use client";

import type { SystemScan, AnalysisResult } from "@/lib/types";

interface UpgradeSimulatorProps {
  scan: SystemScan;
  currentAnalysis: AnalysisResult;
  onClose: () => void;
}

export function UpgradeSimulator({
  scan: _scan,
  currentAnalysis: _currentAnalysis,
  onClose: _onClose,
}: UpgradeSimulatorProps) {
  // TODO: Implementation
  // - Two dropdown selects (CPU, GPU) populated from hardware-db
  // - Pre-select current CPU/GPU with "(Current)" label
  // - On change, call simulateUpgrade() and show ScoreComparison
  // - Show bottleneck diff (removed/added)
  // - Reset button to return to original
  return null;
}
