// TODO: Scan History - localStorage persistence for scan results
//
// This module handles saving, retrieving, and managing scan history
// in the browser's localStorage.

import type { SystemScan, AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "pc-bottleneck-history";
const MAX_HISTORY = 20;

export interface SavedScan {
  id: string;
  savedAt: string;
  scanId: string;
  totalScore: number;
  grade: string;
  cpuName: string;
  gpuName: string;
  scan: SystemScan;
}

/**
 * Save the current scan and analysis to localStorage history.
 */
export function saveToHistory(
  _scan: SystemScan,
  _analysis: AnalysisResult,
): SavedScan {
  // TODO: Implementation
  // 1. Create a SavedScan object with metadata
  // 2. Read existing history from localStorage
  // 3. Prepend new scan
  // 4. Trim to MAX_HISTORY
  // 5. Write back to localStorage
  // 6. Return the saved entry
  void STORAGE_KEY;
  void MAX_HISTORY;
  throw new Error("Not implemented yet — planned for a future session");
}

/**
 * Retrieve all saved scans from localStorage, sorted newest first.
 */
export function getHistory(): SavedScan[] {
  // TODO: Read and parse from localStorage
  return [];
}

/**
 * Delete a single scan from history by ID.
 */
export function deleteScan(_id: string): void {
  // TODO: Filter out the scan and write back
}

/**
 * Export entire history as a JSON string for backup.
 */
export function exportHistory(): string {
  // TODO: Return JSON.stringify of full history
  return "[]";
}

/**
 * Check if localStorage is available (not in private browsing, etc).
 */
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
