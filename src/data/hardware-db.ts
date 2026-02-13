// ─── Hardware Performance Database ───────────────────────────────────────────
//
// Relative gaming scores (1-100) for common CPUs and GPUs from the last ~5 years.
// Scores are approximate composites based on 1080p/1440p gaming benchmarks.
// Keys are lowercase-normalized model names used for fuzzy matching.

export type HardwareTier = "very_high" | "high" | "mid" | "low" | "very_low";

export interface HardwareEntry {
  name: string;
  tier: HardwareTier;
  gaming_score: number;
  release_year: number;
  msrp: number;
  current_price_approx: number;
}

// ─── CPU Database ────────────────────────────────────────────────────────────

export const cpuDatabase: Record<string, HardwareEntry> = {
  // AMD — Zen 5 X3D
  "amd ryzen 9 9950x3d": {
    name: "AMD Ryzen 9 9950X3D",
    tier: "very_high",
    gaming_score: 97,
    release_year: 2025,
    msrp: 699,
    current_price_approx: 699,
  },
  "amd ryzen 9 9900x3d": {
    name: "AMD Ryzen 9 9900X3D",
    tier: "very_high",
    gaming_score: 96,
    release_year: 2025,
    msrp: 599,
    current_price_approx: 599,
  },
  "amd ryzen 7 9850x3d": {
    name: "AMD Ryzen 7 9850X3D",
    tier: "very_high",
    gaming_score: 99,
    release_year: 2026,
    msrp: 499,
    current_price_approx: 499,
  },
  "amd ryzen 7 9800x3d": {
    name: "AMD Ryzen 7 9800X3D",
    tier: "very_high",
    gaming_score: 98,
    release_year: 2024,
    msrp: 479,
    current_price_approx: 449,
  },

  // AMD — Zen 5
  "amd ryzen 9 9950x": {
    name: "AMD Ryzen 9 9950X",
    tier: "very_high",
    gaming_score: 97,
    release_year: 2024,
    msrp: 649,
    current_price_approx: 549,
  },
  "amd ryzen 9 9900x": {
    name: "AMD Ryzen 9 9900X",
    tier: "very_high",
    gaming_score: 94,
    release_year: 2024,
    msrp: 499,
    current_price_approx: 399,
  },
  "amd ryzen 7 9700x": {
    name: "AMD Ryzen 7 9700X",
    tier: "high",
    gaming_score: 90,
    release_year: 2024,
    msrp: 359,
    current_price_approx: 299,
  },
  "amd ryzen 5 9600x": {
    name: "AMD Ryzen 5 9600X",
    tier: "high",
    gaming_score: 86,
    release_year: 2024,
    msrp: 279,
    current_price_approx: 229,
  },
  "amd ryzen 9 7950x": {
    name: "AMD Ryzen 9 7950X",
    tier: "very_high",
    gaming_score: 93,
    release_year: 2022,
    msrp: 699,
    current_price_approx: 449,
  },
  "amd ryzen 9 7900x": {
    name: "AMD Ryzen 9 7900X",
    tier: "very_high",
    gaming_score: 91,
    release_year: 2022,
    msrp: 549,
    current_price_approx: 349,
  },
  "amd ryzen 7 7800x3d": {
    name: "AMD Ryzen 7 7800X3D",
    tier: "very_high",
    gaming_score: 96,
    release_year: 2023,
    msrp: 449,
    current_price_approx: 339,
  },
  "amd ryzen 7 7700x": {
    name: "AMD Ryzen 7 7700X",
    tier: "high",
    gaming_score: 87,
    release_year: 2022,
    msrp: 399,
    current_price_approx: 249,
  },
  "amd ryzen 5 7600x": {
    name: "AMD Ryzen 5 7600X",
    tier: "high",
    gaming_score: 84,
    release_year: 2022,
    msrp: 299,
    current_price_approx: 199,
  },
  "amd ryzen 5 7600": {
    name: "AMD Ryzen 5 7600",
    tier: "high",
    gaming_score: 82,
    release_year: 2023,
    msrp: 229,
    current_price_approx: 179,
  },

  // AMD — Zen 3 / Zen 3 X3D
  "amd ryzen 7 5700x3d": {
    name: "AMD Ryzen 7 5700X3D",
    tier: "high",
    gaming_score: 83,
    release_year: 2024,
    msrp: 249,
    current_price_approx: 189,
  },
  "amd ryzen 7 5700x": {
    name: "AMD Ryzen 7 5700X",
    tier: "high",
    gaming_score: 75,
    release_year: 2022,
    msrp: 299,
    current_price_approx: 149,
  },
  "amd ryzen 9 5950x": {
    name: "AMD Ryzen 9 5950X",
    tier: "high",
    gaming_score: 82,
    release_year: 2020,
    msrp: 799,
    current_price_approx: 349,
  },
  "amd ryzen 9 5900x": {
    name: "AMD Ryzen 9 5900X",
    tier: "high",
    gaming_score: 81,
    release_year: 2020,
    msrp: 549,
    current_price_approx: 249,
  },
  "amd ryzen 7 5800x": {
    name: "AMD Ryzen 7 5800X",
    tier: "high",
    gaming_score: 78,
    release_year: 2020,
    msrp: 449,
    current_price_approx: 169,
  },
  "amd ryzen 7 5800x3d": {
    name: "AMD Ryzen 7 5800X3D",
    tier: "high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 449,
    current_price_approx: 249,
  },
  "amd ryzen 5 5600x": {
    name: "AMD Ryzen 5 5600X",
    tier: "mid",
    gaming_score: 72,
    release_year: 2020,
    msrp: 299,
    current_price_approx: 119,
  },

  // Intel — Arrow Lake (Core Ultra 200)
  "intel core ultra 9 285k": {
    name: "Intel Core Ultra 9 285K",
    tier: "very_high",
    gaming_score: 90,
    release_year: 2024,
    msrp: 589,
    current_price_approx: 449,
  },
  "intel core ultra 7 265k": {
    name: "Intel Core Ultra 7 265K",
    tier: "high",
    gaming_score: 86,
    release_year: 2024,
    msrp: 394,
    current_price_approx: 249,
  },
  "intel core ultra 5 245k": {
    name: "Intel Core Ultra 5 245K",
    tier: "high",
    gaming_score: 82,
    release_year: 2024,
    msrp: 309,
    current_price_approx: 209,
  },

  // Intel — 14th Gen
  "intel core i9-14900k": {
    name: "Intel Core i9-14900K",
    tier: "very_high",
    gaming_score: 95,
    release_year: 2023,
    msrp: 589,
    current_price_approx: 439,
  },
  "intel core i7-14700k": {
    name: "Intel Core i7-14700K",
    tier: "very_high",
    gaming_score: 92,
    release_year: 2023,
    msrp: 419,
    current_price_approx: 329,
  },
  "intel core i5-14600k": {
    name: "Intel Core i5-14600K",
    tier: "high",
    gaming_score: 87,
    release_year: 2023,
    msrp: 319,
    current_price_approx: 249,
  },
  "intel core i5-14400f": {
    name: "Intel Core i5-14400F",
    tier: "mid",
    gaming_score: 75,
    release_year: 2024,
    msrp: 199,
    current_price_approx: 159,
  },

  // Intel — 13th Gen
  "intel core i9-13900k": {
    name: "Intel Core i9-13900K",
    tier: "very_high",
    gaming_score: 93,
    release_year: 2022,
    msrp: 589,
    current_price_approx: 379,
  },
  "intel core i7-13700k": {
    name: "Intel Core i7-13700K",
    tier: "high",
    gaming_score: 89,
    release_year: 2022,
    msrp: 419,
    current_price_approx: 289,
  },
  "intel core i5-13600k": {
    name: "Intel Core i5-13600K",
    tier: "high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 319,
    current_price_approx: 219,
  },
  "intel core i5-13400f": {
    name: "Intel Core i5-13400F",
    tier: "mid",
    gaming_score: 72,
    release_year: 2023,
    msrp: 199,
    current_price_approx: 149,
  },

  // Intel — 12th Gen
  "intel core i9-12900k": {
    name: "Intel Core i9-12900K",
    tier: "high",
    gaming_score: 84,
    release_year: 2021,
    msrp: 589,
    current_price_approx: 269,
  },
  "intel core i7-12700k": {
    name: "Intel Core i7-12700K",
    tier: "high",
    gaming_score: 82,
    release_year: 2021,
    msrp: 409,
    current_price_approx: 219,
  },
  "intel core i5-12600k": {
    name: "Intel Core i5-12600K",
    tier: "mid",
    gaming_score: 76,
    release_year: 2021,
    msrp: 289,
    current_price_approx: 169,
  },
  "intel core i5-12400f": {
    name: "Intel Core i5-12400F",
    tier: "mid",
    gaming_score: 68,
    release_year: 2022,
    msrp: 179,
    current_price_approx: 109,
  },

  // Budget / older
  "intel core i3-14100f": {
    name: "Intel Core i3-14100F",
    tier: "low",
    gaming_score: 60,
    release_year: 2024,
    msrp: 110,
    current_price_approx: 89,
  },
  "amd ryzen 5 5500": {
    name: "AMD Ryzen 5 5500",
    tier: "low",
    gaming_score: 58,
    release_year: 2022,
    msrp: 159,
    current_price_approx: 89,
  },
  "intel core i3-12100f": {
    name: "Intel Core i3-12100F",
    tier: "low",
    gaming_score: 55,
    release_year: 2022,
    msrp: 109,
    current_price_approx: 79,
  },
  "amd ryzen 5 3600": {
    name: "AMD Ryzen 5 3600",
    tier: "low",
    gaming_score: 52,
    release_year: 2019,
    msrp: 199,
    current_price_approx: 79,
  },
};

// ─── GPU Database (30 entries) ───────────────────────────────────────────────

export const gpuDatabase: Record<string, HardwareEntry> = {
  // NVIDIA — RTX 50-series
  "nvidia geforce rtx 5090": {
    name: "NVIDIA GeForce RTX 5090",
    tier: "very_high",
    gaming_score: 100,
    release_year: 2025,
    msrp: 1999,
    current_price_approx: 2199,
  },
  "nvidia geforce rtx 5080": {
    name: "NVIDIA GeForce RTX 5080",
    tier: "very_high",
    gaming_score: 90,
    release_year: 2025,
    msrp: 999,
    current_price_approx: 1099,
  },
  "nvidia geforce rtx 5070 ti": {
    name: "NVIDIA GeForce RTX 5070 Ti",
    tier: "very_high",
    gaming_score: 84,
    release_year: 2025,
    msrp: 749,
    current_price_approx: 849,
  },
  "nvidia geforce rtx 5070": {
    name: "NVIDIA GeForce RTX 5070",
    tier: "high",
    gaming_score: 78,
    release_year: 2025,
    msrp: 549,
    current_price_approx: 629,
  },
  "nvidia geforce rtx 5060 ti": {
    name: "NVIDIA GeForce RTX 5060 Ti",
    tier: "high",
    gaming_score: 70,
    release_year: 2025,
    msrp: 429,
    current_price_approx: 429,
  },
  "nvidia geforce rtx 5060": {
    name: "NVIDIA GeForce RTX 5060",
    tier: "mid",
    gaming_score: 58,
    release_year: 2025,
    msrp: 299,
    current_price_approx: 299,
  },

  // NVIDIA — RTX 40-series
  "nvidia geforce rtx 4090": {
    name: "NVIDIA GeForce RTX 4090",
    tier: "very_high",
    gaming_score: 96,
    release_year: 2022,
    msrp: 1599,
    current_price_approx: 1799,
  },
  "nvidia geforce rtx 4080 super": {
    name: "NVIDIA GeForce RTX 4080 SUPER",
    tier: "very_high",
    gaming_score: 86,
    release_year: 2024,
    msrp: 999,
    current_price_approx: 949,
  },
  "nvidia geforce rtx 4080": {
    name: "NVIDIA GeForce RTX 4080",
    tier: "very_high",
    gaming_score: 84,
    release_year: 2022,
    msrp: 1199,
    current_price_approx: 899,
  },
  "nvidia geforce rtx 4070 ti super": {
    name: "NVIDIA GeForce RTX 4070 Ti SUPER",
    tier: "high",
    gaming_score: 80,
    release_year: 2024,
    msrp: 799,
    current_price_approx: 749,
  },
  "nvidia geforce rtx 4070 ti": {
    name: "NVIDIA GeForce RTX 4070 Ti",
    tier: "high",
    gaming_score: 76,
    release_year: 2023,
    msrp: 799,
    current_price_approx: 649,
  },
  "nvidia geforce rtx 4070 super": {
    name: "NVIDIA GeForce RTX 4070 SUPER",
    tier: "high",
    gaming_score: 73,
    release_year: 2024,
    msrp: 599,
    current_price_approx: 569,
  },
  "nvidia geforce rtx 4070": {
    name: "NVIDIA GeForce RTX 4070",
    tier: "high",
    gaming_score: 68,
    release_year: 2023,
    msrp: 599,
    current_price_approx: 499,
  },
  "nvidia geforce rtx 4060 ti": {
    name: "NVIDIA GeForce RTX 4060 Ti",
    tier: "mid",
    gaming_score: 58,
    release_year: 2023,
    msrp: 399,
    current_price_approx: 369,
  },
  "nvidia geforce rtx 4060": {
    name: "NVIDIA GeForce RTX 4060",
    tier: "mid",
    gaming_score: 50,
    release_year: 2023,
    msrp: 299,
    current_price_approx: 279,
  },

  // NVIDIA — RTX 30-series
  "nvidia geforce rtx 3090 ti": {
    name: "NVIDIA GeForce RTX 3090 Ti",
    tier: "high",
    gaming_score: 75,
    release_year: 2022,
    msrp: 1999,
    current_price_approx: 899,
  },
  "nvidia geforce rtx 3090": {
    name: "NVIDIA GeForce RTX 3090",
    tier: "high",
    gaming_score: 72,
    release_year: 2020,
    msrp: 1499,
    current_price_approx: 799,
  },
  "nvidia geforce rtx 3080 ti": {
    name: "NVIDIA GeForce RTX 3080 Ti",
    tier: "high",
    gaming_score: 70,
    release_year: 2021,
    msrp: 1199,
    current_price_approx: 549,
  },
  "nvidia geforce rtx 3080": {
    name: "NVIDIA GeForce RTX 3080",
    tier: "high",
    gaming_score: 67,
    release_year: 2020,
    msrp: 699,
    current_price_approx: 499,
  },
  "nvidia geforce rtx 3070 ti": {
    name: "NVIDIA GeForce RTX 3070 Ti",
    tier: "mid",
    gaming_score: 62,
    release_year: 2021,
    msrp: 599,
    current_price_approx: 369,
  },
  "nvidia geforce rtx 3070": {
    name: "NVIDIA GeForce RTX 3070",
    tier: "mid",
    gaming_score: 58,
    release_year: 2020,
    msrp: 499,
    current_price_approx: 329,
  },
  "nvidia geforce rtx 3060 ti": {
    name: "NVIDIA GeForce RTX 3060 Ti",
    tier: "mid",
    gaming_score: 52,
    release_year: 2020,
    msrp: 399,
    current_price_approx: 269,
  },
  "nvidia geforce rtx 3060": {
    name: "NVIDIA GeForce RTX 3060",
    tier: "mid",
    gaming_score: 44,
    release_year: 2021,
    msrp: 329,
    current_price_approx: 229,
  },
  "nvidia geforce gtx 1660 super": {
    name: "NVIDIA GeForce GTX 1660 SUPER",
    tier: "low",
    gaming_score: 30,
    release_year: 2019,
    msrp: 229,
    current_price_approx: 139,
  },
  "nvidia geforce gtx 1650": {
    name: "NVIDIA GeForce GTX 1650",
    tier: "very_low",
    gaming_score: 20,
    release_year: 2019,
    msrp: 149,
    current_price_approx: 99,
  },

  // Intel Arc
  "intel arc b580": {
    name: "Intel Arc B580",
    tier: "mid",
    gaming_score: 46,
    release_year: 2024,
    msrp: 249,
    current_price_approx: 249,
  },
  "intel arc b570": {
    name: "Intel Arc B570",
    tier: "mid",
    gaming_score: 42,
    release_year: 2025,
    msrp: 219,
    current_price_approx: 219,
  },
  "intel arc a770": {
    name: "Intel Arc A770",
    tier: "mid",
    gaming_score: 42,
    release_year: 2022,
    msrp: 349,
    current_price_approx: 219,
  },

  // AMD — RX 9000-series
  "amd radeon rx 9070 xt": {
    name: "AMD Radeon RX 9070 XT",
    tier: "high",
    gaming_score: 76,
    release_year: 2025,
    msrp: 549,
    current_price_approx: 579,
  },
  "amd radeon rx 9070": {
    name: "AMD Radeon RX 9070",
    tier: "high",
    gaming_score: 68,
    release_year: 2025,
    msrp: 449,
    current_price_approx: 479,
  },
  "amd radeon rx 9060 xt": {
    name: "AMD Radeon RX 9060 XT",
    tier: "mid",
    gaming_score: 55,
    release_year: 2025,
    msrp: 349,
    current_price_approx: 349,
  },

  // AMD — RX 7000-series
  "amd radeon rx 7900 xtx": {
    name: "AMD Radeon RX 7900 XTX",
    tier: "very_high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 999,
    current_price_approx: 849,
  },
  "amd radeon rx 7900 xt": {
    name: "AMD Radeon RX 7900 XT",
    tier: "high",
    gaming_score: 78,
    release_year: 2022,
    msrp: 899,
    current_price_approx: 699,
  },
  "amd radeon rx 7800 xt": {
    name: "AMD Radeon RX 7800 XT",
    tier: "high",
    gaming_score: 65,
    release_year: 2023,
    msrp: 499,
    current_price_approx: 429,
  },
  "amd radeon rx 7700 xt": {
    name: "AMD Radeon RX 7700 XT",
    tier: "mid",
    gaming_score: 58,
    release_year: 2023,
    msrp: 449,
    current_price_approx: 379,
  },
  "amd radeon rx 7600": {
    name: "AMD Radeon RX 7600",
    tier: "mid",
    gaming_score: 45,
    release_year: 2023,
    msrp: 269,
    current_price_approx: 239,
  },

  // AMD — RX 6000-series
  "amd radeon rx 6950 xt": {
    name: "AMD Radeon RX 6950 XT",
    tier: "high",
    gaming_score: 70,
    release_year: 2022,
    msrp: 1099,
    current_price_approx: 499,
  },
  "amd radeon rx 6800 xt": {
    name: "AMD Radeon RX 6800 XT",
    tier: "high",
    gaming_score: 65,
    release_year: 2020,
    msrp: 649,
    current_price_approx: 389,
  },
  "amd radeon rx 6700 xt": {
    name: "AMD Radeon RX 6700 XT",
    tier: "mid",
    gaming_score: 48,
    release_year: 2021,
    msrp: 479,
    current_price_approx: 249,
  },
  "amd radeon rx 6600": {
    name: "AMD Radeon RX 6600",
    tier: "low",
    gaming_score: 35,
    release_year: 2021,
    msrp: 329,
    current_price_approx: 169,
  },
};

// ─── Tier Utilities ──────────────────────────────────────────────────────────

const TIER_ORDER: HardwareTier[] = [
  "very_low",
  "low",
  "mid",
  "high",
  "very_high",
];

/**
 * Returns a numeric index for a tier (0 = very_low, 4 = very_high).
 */
export function tierIndex(tier: HardwareTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Attempts to look up a CPU in the database using a normalized, fuzzy match.
 * Strips common suffixes and tries substring matching as a fallback.
 */
export function lookupCPU(modelName: string): HardwareEntry | null {
  const key = modelName.toLowerCase().trim();

  // Direct match
  if (cpuDatabase[key]) return cpuDatabase[key];

  // Substring match — find entries whose key is contained in the input or vice-versa
  for (const [dbKey, entry] of Object.entries(cpuDatabase)) {
    if (key.includes(dbKey) || dbKey.includes(key)) return entry;
  }

  return null;
}

/**
 * Attempts to look up a GPU in the database using a normalized, fuzzy match.
 */
export function lookupGPU(modelName: string): HardwareEntry | null {
  const key = modelName.toLowerCase().trim();

  if (gpuDatabase[key]) return gpuDatabase[key];

  for (const [dbKey, entry] of Object.entries(gpuDatabase)) {
    if (key.includes(dbKey) || dbKey.includes(key)) return entry;
  }

  return null;
}

/**
 * Returns a list of upgrade recommendations from the database that are
 * in a higher tier than the given entry.
 */
export function getUpgrades(
  current: HardwareEntry,
  database: Record<string, HardwareEntry>,
  maxResults = 3,
): HardwareEntry[] {
  const currentTier = tierIndex(current.tier);

  return Object.values(database)
    .filter((entry) => tierIndex(entry.tier) > currentTier)
    .sort((a, b) => {
      // Sort by value: gaming_score / price ratio, descending
      const aValue = a.gaming_score / (a.current_price_approx || 1);
      const bValue = b.gaming_score / (b.current_price_approx || 1);
      return bValue - aValue;
    })
    .slice(0, maxResults);
}
