import { isStorageAvailable } from "./history";

/**
 * Master kill switch for Pro feature gates — env-driven so arming the
 * paywall is a Vercel config flip + redeploy, not a code change.
 *
 * `NEXT_PUBLIC_GATES_ENABLED=true` locks Pro features behind the one-time
 * purchase. Unset (current prod default), every feature is accessible and
 * the gates are invisible.
 */
export const GATES_ENABLED = process.env.NEXT_PUBLIC_GATES_ENABLED === "true";

/**
 * Whether the AI Insights tab is offered at all. The AI analysis runs
 * through a local `claude -p` subprocess which does not exist on Vercel,
 * so the tab must stay hidden in prod until it has a real backend —
 * never sell what can't fulfill.
 */
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

/** Display price of the one-time Pro unlock. Keep in sync with the Lemon Squeezy product. */
export const PRO_PRICE = "$9.99";

const STORAGE_KEY = "pc-pro-status";
const LICENSE_STORAGE_KEY = "pc-pro-license";

/**
 * Lemon Squeezy checkout URL for the Pro product ("PCopti Tool").
 * This URL is public by design — it's the page buyers open — so the
 * production value is baked in as the default and the env var only
 * overrides it. `?embed=1` lets lemon.js open it as an overlay.
 */
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ||
  "https://pcopti.lemonsqueezy.com/checkout/buy/a7cf2484-67fe-468c-872c-fd2f0b6a7d16?embed=1";

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
 * With gates on, Pro is granted by either the instant post-checkout flag
 * or a stored (server-validated) license key.
 */
export function isProUser(): boolean {
  if (!GATES_ENABLED) return true;

  if (!isStorageAvailable()) return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && JSON.parse(raw)?.isPro === true) return true;
  } catch {
    // fall through to license check
  }

  return getStoredLicense() !== null;
}

/** A license key activation persisted after server-side validation. */
export interface StoredLicense {
  key: string;
  instanceId: string | null;
  activatedAt: string;
}

/** Persist a validated license key so Pro survives storage of the flag alone. */
export function storeLicense(key: string, instanceId: string | null): void {
  if (!isStorageAvailable()) return;

  try {
    const record: StoredLicense = {
      key,
      instanceId,
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Silently fail — the isPro flag still unlocks this session
  }
}

/** Read the stored license record, if any. */
export function getStoredLicense(): StoredLicense | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data?.key === "string" && data.key.length > 0) {
      return data as StoredLicense;
    }
    return null;
  } catch {
    return null;
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

