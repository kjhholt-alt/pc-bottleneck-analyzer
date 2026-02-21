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
 * Returns the saved entry (with generated ID and timestamp).
 */
export function saveToHistory(
  scan: SystemScan,
  analysis: AnalysisResult,
): SavedScan {
  if (!isStorageAvailable()) {
    throw new Error("localStorage is not available");
  }

  const entry: SavedScan = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    scanId: scan.scan_id ?? `scan-${Date.now()}`,
    totalScore: analysis.score.total,
    grade: analysis.score.grade,
    cpuName: scan.cpu.model_name,
    gpuName: scan.gpu.model_name,
    scan,
  };

  const history = getHistory();
  history.unshift(entry);

  // Cap at MAX_HISTORY (FIFO — oldest dropped)
  const trimmed = history.slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return entry;
}

/**
 * Retrieve all saved scans from localStorage, sorted newest first.
 */
export function getHistory(): SavedScan[] {
  if (!isStorageAvailable()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedScan[];
  } catch {
    return [];
  }
}

/**
 * Delete a single scan from history by ID.
 */
export function deleteScan(id: string): void {
  if (!isStorageAvailable()) return;

  const history = getHistory().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Export entire history as a JSON string for backup.
 */
export function exportHistory(): string {
  return JSON.stringify(getHistory(), null, 2);
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
