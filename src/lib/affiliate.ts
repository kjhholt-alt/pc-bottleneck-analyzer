/**
 * Affiliate link generators for hardware upgrade recommendations.
 *
 * Links work as normal search URLs even without real affiliate tags.
 * Replace the placeholder constants below after signing up:
 *   - Amazon Associates: https://affiliate-program.amazon.com
 *   - Newegg Affiliate (Impact Radius): https://www.newegg.com/affiliates
 */

/** Amazon Associates tag — replace with real tag after approval. */
const AMAZON_TAG = "bottleneck-20";

/** Newegg Impact Radius campaign ID — leave empty until approved. */
const NEWEGG_AFF_ID = "";

/** Build an Amazon search URL with affiliate tag. */
export function getAmazonLink(hardwareName: string): string {
  const q = encodeURIComponent(hardwareName);
  return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}`;
}

/** Build a Newegg search URL (with optional affiliate ID). */
export function getNeweggLink(hardwareName: string): string {
  const q = encodeURIComponent(hardwareName);
  const base = `https://www.newegg.com/p/pl?d=${q}`;
  return NEWEGG_AFF_ID ? `${base}&cm_mmc=afc-${NEWEGG_AFF_ID}` : base;
}

/** Convenience: get both links at once. */
export function getAffiliateLinks(hardwareName: string) {
  return {
    amazon: getAmazonLink(hardwareName),
    newegg: getNeweggLink(hardwareName),
  };
}
