// TODO: Scan Comparison Component
//
// Side-by-side comparison of two saved scans showing score changes,
// bottleneck differences, and per-component deltas.

"use client";

import type { SystemScan, AnalysisResult } from "@/lib/types";

interface ScanCompareProps {
  scanA: SystemScan;
  analysisA: AnalysisResult;
  scanB: SystemScan;
  analysisB: AnalysisResult;
  onClose: () => void;
}

export function ScanCompare({
  scanA: _scanA,
  analysisA: _analysisA,
  scanB: _scanB,
  analysisB: _analysisB,
  onClose: _onClose,
}: ScanCompareProps) {
  // TODO: Implementation
  // - Two-column layout with scan A and scan B
  // - Score delta prominently displayed
  // - Per-component score comparison bars
  // - Bottleneck diff: removed (green), added (red), unchanged (gray)
  // - Hardware changes highlighted
  return null;
}
