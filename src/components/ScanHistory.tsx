// TODO: Scan History Sidebar Component
//
// Shows a list of previously saved scans with timestamps, scores, and
// hardware summaries. Allows loading, comparing, and deleting scans.

"use client";

import type { SystemScan } from "@/lib/types";

interface ScanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScan: (scan: SystemScan) => void;
  currentScanId?: string;
}

export function ScanHistory({
  isOpen: _isOpen,
  onClose: _onClose,
  onLoadScan: _onLoadScan,
  currentScanId: _currentScanId,
}: ScanHistoryProps) {
  // TODO: Implementation
  // - Slide-in sidebar panel from the right
  // - List all saved scans from getHistory()
  // - Each entry: date, score badge, CPU name, GPU name
  // - Click to load, trash icon to delete
  // - "Compare" mode: select two and show ScanCompare
  // - "Export All" button at the bottom
  // - Show empty state if no history
  return null;
}
