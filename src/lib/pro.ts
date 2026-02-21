import { isStorageAvailable } from "./history";

/**
 * Master kill switch for Pro feature gates.
 *
 * Set to `true` when ready to monetize (after traffic justifies it).
 * While `false`, every feature is accessible — the gates are invisible.
 */
export const GATES_ENABLED = false;

const STORAGE_KEY = "pc-pro-status";

/** Tab IDs that require Pro when gates are enabled. */
const PRO_TABS = new Set(["ai", "fps", "simulate", "monitor", "planner"]);

/** Standalone Pro feature IDs (not tied to a tab). */
const PRO_FEATURES = new Set(["pdf-export"]);

/** Check if a given tab is a Pro-gated tab. */
export function isProTab(tabId: string): boolean {
  return PRO_TABS.has(tabId);
}

/** Check if any feature (tab or standalone) is Pro-gated. */
export function isProFeature(featureId: string): boolean {
  return PRO_TABS.has(featureId) || PRO_FEATURES.has(featureId);
}

/**
 * Check if the current user has Pro access.
 * Returns `true` when gates are off (everyone is "Pro" during beta).
 */
export function isProUser(): boolean {
  if (!GATES_ENABLED) return true;

  if (!isStorageAvailable()) return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.isPro === true;
  } catch {
    return false;
  }
}

/** Grant or revoke Pro access (persists in localStorage). */
export function setProUser(isPro: boolean): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isPro,
        grantedAt: isPro ? new Date().toISOString() : null,
      }),
    );
  } catch {
    // Silently fail — user just won't have Pro persisted
  }
}

/**
 * The single check used by UI components.
 * Returns `true` when this feature should be locked (blurred / inaccessible).
 *
 * Locked = gates are enabled AND user is not Pro.
 */
export function isFeatureLocked(featureId: string): boolean {
  if (!GATES_ENABLED) return false;
  if (!isProFeature(featureId)) return false;
  return !isProUser();
}

