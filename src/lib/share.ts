import type { SystemScan } from "@/lib/types";

const SHARE_VERSION = 1;
const MAX_URL_LENGTH = 8000;

/**
 * Encode scan data into a URL-safe base64 string.
 * Returns null if the encoded result exceeds MAX_URL_LENGTH.
 */
export function encodeScanForURL(scan: SystemScan): string | null {
  try {
    const payload = JSON.stringify({ v: SHARE_VERSION, scan });
    // encodeURIComponent handles non-ASCII; btoa produces base64
    const encoded = btoa(encodeURIComponent(payload));
    if (encoded.length > MAX_URL_LENGTH) return null;
    return encoded;
  } catch {
    return null;
  }
}

/**
 * Decode a share hash back into a SystemScan.
 * Expects the fragment after "#share=", e.g. "v1:base64data".
 * Returns null on any error or invalid shape.
 */
export function decodeScanFromURL(fragment: string): SystemScan | null {
  try {
    // Strip version prefix "v1:"
    const encoded = fragment.replace(/^v\d+:/, "");
    const json = decodeURIComponent(atob(encoded));
    const payload = JSON.parse(json);

    if (
      payload &&
      typeof payload === "object" &&
      payload.scan &&
      typeof payload.scan.cpu === "object" &&
      typeof payload.scan.gpu === "object" &&
      typeof payload.scan.ram === "object"
    ) {
      return payload.scan as SystemScan;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the current URL contains share data in the hash.
 */
export function isShareURL(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash.startsWith("#share=");
}

/**
 * Extract the fragment portion (after "#share=") from the current URL.
 */
export function getShareFragment(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#share=/, "");
}

/**
 * Build the full shareable URL for the given encoded data.
 */
export function getShareURL(encodedData: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}#share=v${SHARE_VERSION}:${encodedData}`;
}
