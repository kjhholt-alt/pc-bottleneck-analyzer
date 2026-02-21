/**
 * Client-side tracking helpers.
 * Uses sendBeacon for reliability — doesn't block navigation.
 */

let lastTrackedPage = "";
let lastTrackedAt = 0;

/** Track a page view. Debounces duplicate calls within 5 seconds. */
export function trackPageView(page: string): void {
  const now = Date.now();
  if (page === lastTrackedPage && now - lastTrackedAt < 5000) return;

  lastTrackedPage = page;
  lastTrackedAt = now;

  const payload = JSON.stringify({
    page,
    type: "pageview",
    referrer: document.referrer || undefined,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/t", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/t", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}

/** Track an affiliate link click. */
export function trackAffiliateClick(vendor: "amazon" | "newegg", hardware: string): void {
  const payload = JSON.stringify({
    page: window.location.pathname,
    type: "affiliate_click",
    vendor,
    hardware,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/t", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/t", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}
