import { isStorageAvailable } from "./history";

/**
 * Master switch for the PC Upgrade Blueprint product. Unset (default), the
 * route shows "coming soon" and every funnel CTA stays hidden — ships
 * dormant until Kruz flips this in Vercel alongside creating the Lemon
 * Squeezy product.
 */
export const BLUEPRINT_ENABLED =
  process.env.NEXT_PUBLIC_BLUEPRINT_ENABLED === "true";

/** Display price of the one-time Blueprint purchase. */
export const BLUEPRINT_PRICE = "$19";

/**
 * Lemon Squeezy checkout URL for the Blueprint product. Public by design —
 * it's the page buyers open. Empty until Kruz creates the product and sets
 * the env var; callers should treat an empty string as "not orderable yet".
 */
export const BLUEPRINT_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LS_BLUEPRINT_CHECKOUT_URL || "";

const LICENSE_STORAGE_KEY = "pc-blueprint-license";
const INPUT_STORAGE_KEY = "pc-blueprint-input";

/** A Blueprint license key activation persisted after server-side validation. */
export interface StoredBlueprintLicense {
  key: string;
  instanceId: string | null;
  activatedAt: string;
}

/** Persist a validated Blueprint license key. */
export function storeBlueprintLicense(
  key: string,
  instanceId: string | null,
): void {
  if (!isStorageAvailable()) return;

  try {
    const record: StoredBlueprintLicense = {
      key,
      instanceId,
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Non-fatal — the session that just activated still has the report open
  }
}

/** Read the stored Blueprint license record, if any. */
export function getStoredBlueprintLicense(): StoredBlueprintLicense | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data?.key === "string" && data.key.length > 0) {
      return data as StoredBlueprintLicense;
    }
    return null;
  } catch {
    return null;
  }
}

/** Whether the visitor has an activated Blueprint license this browser. */
export function hasBlueprintAccess(): boolean {
  return getStoredBlueprintLicense() !== null;
}

/**
 * Persist the visitor's last picker input (CPU/GPU/RAM/resolution/games) so
 * the report is regenerable anytime without re-entering it — stateless
 * fulfillment, no server-side storage of the pick itself.
 */
export function saveBlueprintInput(inputJson: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(INPUT_STORAGE_KEY, inputJson);
  } catch {
    // Non-fatal — the in-memory state for this session still has it
  }
}

export function getSavedBlueprintInput(): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(INPUT_STORAGE_KEY);
  } catch {
    return null;
  }
}
