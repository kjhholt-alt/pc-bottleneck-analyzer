// ─── Hardware Performance Database ───────────────────────────────────────────
//
// Relative gaming scores (1-100) for CPUs and GPUs from the last ~8 years.
// Scores are approximate composites based on 1080p/1440p gaming benchmarks.
// Keys are lowercase-normalized model names used for fuzzy matching.
//
// Total: ~80 CPUs, ~85 GPUs

export type HardwareTier = "very_high" | "high" | "mid" | "low" | "very_low";

export interface HardwareEntry {
  name: string;
  tier: HardwareTier;
  gaming_score: number;
  release_year: number;
  msrp: number;
  current_price_approx: number;
}

// ─── CPU Database (~80 entries) ─────────────────────────────────────────────

export const cpuDatabase: Record<string, HardwareEntry> = {
  // ── AMD — Zen 5 X3D ─────────────────────────────────────────────────────
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

  // ── AMD — Zen 5 ─────────────────────────────────────────────────────────
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
  "amd ryzen 5 9600": {
    name: "AMD Ryzen 5 9600",
    tier: "high",
    gaming_score: 84,
    release_year: 2025,
    msrp: 229,
    current_price_approx: 199,
  },

  // ── AMD — Zen 4 / Zen 4 X3D ────────────────────────────────────────────
  "amd ryzen 9 7950x3d": {
    name: "AMD Ryzen 9 7950X3D",
    tier: "very_high",
    gaming_score: 97,
    release_year: 2023,
    msrp: 699,
    current_price_approx: 499,
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
  "amd ryzen 9 7900": {
    name: "AMD Ryzen 9 7900",
    tier: "very_high",
    gaming_score: 89,
    release_year: 2023,
    msrp: 429,
    current_price_approx: 319,
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
  "amd ryzen 7 7700": {
    name: "AMD Ryzen 7 7700",
    tier: "high",
    gaming_score: 85,
    release_year: 2023,
    msrp: 329,
    current_price_approx: 219,
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
  "amd ryzen 5 7500f": {
    name: "AMD Ryzen 5 7500F",
    tier: "high",
    gaming_score: 80,
    release_year: 2023,
    msrp: 179,
    current_price_approx: 159,
  },

  // ── AMD — Zen 4 APU (AM5) ──────────────────────────────────────────────
  "amd ryzen 7 8700g": {
    name: "AMD Ryzen 7 8700G",
    tier: "mid",
    gaming_score: 72,
    release_year: 2024,
    msrp: 329,
    current_price_approx: 279,
  },
  "amd ryzen 5 8600g": {
    name: "AMD Ryzen 5 8600G",
    tier: "mid",
    gaming_score: 66,
    release_year: 2024,
    msrp: 229,
    current_price_approx: 189,
  },
  "amd ryzen 5 8500g": {
    name: "AMD Ryzen 5 8500G",
    tier: "mid",
    gaming_score: 60,
    release_year: 2024,
    msrp: 179,
    current_price_approx: 149,
  },

  // ── AMD — Zen 3 / Zen 3 X3D ────────────────────────────────────────────
  "amd ryzen 7 5700x3d": {
    name: "AMD Ryzen 7 5700X3D",
    tier: "high",
    gaming_score: 83,
    release_year: 2024,
    msrp: 249,
    current_price_approx: 189,
  },
  "amd ryzen 7 5800x3d": {
    name: "AMD Ryzen 7 5800X3D",
    tier: "high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 449,
    current_price_approx: 249,
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
  "amd ryzen 7 5700x": {
    name: "AMD Ryzen 7 5700X",
    tier: "high",
    gaming_score: 75,
    release_year: 2022,
    msrp: 299,
    current_price_approx: 149,
  },
  "amd ryzen 5 5600x": {
    name: "AMD Ryzen 5 5600X",
    tier: "mid",
    gaming_score: 72,
    release_year: 2020,
    msrp: 299,
    current_price_approx: 119,
  },
  "amd ryzen 5 5600": {
    name: "AMD Ryzen 5 5600",
    tier: "mid",
    gaming_score: 70,
    release_year: 2022,
    msrp: 199,
    current_price_approx: 99,
  },
  "amd ryzen 7 5700g": {
    name: "AMD Ryzen 7 5700G",
    tier: "mid",
    gaming_score: 65,
    release_year: 2021,
    msrp: 359,
    current_price_approx: 149,
  },
  "amd ryzen 5 5600g": {
    name: "AMD Ryzen 5 5600G",
    tier: "mid",
    gaming_score: 60,
    release_year: 2021,
    msrp: 259,
    current_price_approx: 119,
  },
  "amd ryzen 5 5500": {
    name: "AMD Ryzen 5 5500",
    tier: "low",
    gaming_score: 58,
    release_year: 2022,
    msrp: 159,
    current_price_approx: 89,
  },

  // ── AMD — Zen 2 ─────────────────────────────────────────────────────────
  "amd ryzen 9 3950x": {
    name: "AMD Ryzen 9 3950X",
    tier: "mid",
    gaming_score: 62,
    release_year: 2019,
    msrp: 749,
    current_price_approx: 299,
  },
  "amd ryzen 9 3900x": {
    name: "AMD Ryzen 9 3900X",
    tier: "mid",
    gaming_score: 60,
    release_year: 2019,
    msrp: 499,
    current_price_approx: 219,
  },
  "amd ryzen 7 3700x": {
    name: "AMD Ryzen 7 3700X",
    tier: "low",
    gaming_score: 55,
    release_year: 2019,
    msrp: 329,
    current_price_approx: 139,
  },
  "amd ryzen 5 3600": {
    name: "AMD Ryzen 5 3600",
    tier: "low",
    gaming_score: 52,
    release_year: 2019,
    msrp: 199,
    current_price_approx: 79,
  },
  "amd ryzen 5 3600x": {
    name: "AMD Ryzen 5 3600X",
    tier: "low",
    gaming_score: 53,
    release_year: 2019,
    msrp: 249,
    current_price_approx: 89,
  },
  "amd ryzen 5 3500x": {
    name: "AMD Ryzen 5 3500X",
    tier: "very_low",
    gaming_score: 42,
    release_year: 2019,
    msrp: 149,
    current_price_approx: 69,
  },

  // ── Intel — Arrow Lake (Core Ultra 200S) ────────────────────────────────
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
  "intel core ultra 7 265kf": {
    name: "Intel Core Ultra 7 265KF",
    tier: "high",
    gaming_score: 86,
    release_year: 2024,
    msrp: 379,
    current_price_approx: 239,
  },
  "intel core ultra 5 245k": {
    name: "Intel Core Ultra 5 245K",
    tier: "high",
    gaming_score: 82,
    release_year: 2024,
    msrp: 309,
    current_price_approx: 209,
  },
  "intel core ultra 5 245kf": {
    name: "Intel Core Ultra 5 245KF",
    tier: "high",
    gaming_score: 82,
    release_year: 2024,
    msrp: 294,
    current_price_approx: 199,
  },
  "intel core ultra 7 265": {
    name: "Intel Core Ultra 7 265",
    tier: "high",
    gaming_score: 82,
    release_year: 2025,
    msrp: 329,
    current_price_approx: 229,
  },
  "intel core ultra 7 265f": {
    name: "Intel Core Ultra 7 265F",
    tier: "high",
    gaming_score: 80,
    release_year: 2025,
    msrp: 289,
    current_price_approx: 209,
  },
  "intel core ultra 5 245": {
    name: "Intel Core Ultra 5 245",
    tier: "mid",
    gaming_score: 78,
    release_year: 2025,
    msrp: 249,
    current_price_approx: 189,
  },
  "intel core ultra 5 245f": {
    name: "Intel Core Ultra 5 245F",
    tier: "mid",
    gaming_score: 76,
    release_year: 2025,
    msrp: 209,
    current_price_approx: 169,
  },
  "intel core ultra 5 225": {
    name: "Intel Core Ultra 5 225",
    tier: "mid",
    gaming_score: 72,
    release_year: 2025,
    msrp: 199,
    current_price_approx: 159,
  },
  "intel core ultra 5 225f": {
    name: "Intel Core Ultra 5 225F",
    tier: "mid",
    gaming_score: 72,
    release_year: 2025,
    msrp: 179,
    current_price_approx: 149,
  },

  // ── Intel — 14th Gen ────────────────────────────────────────────────────
  "intel core i9-14900k": {
    name: "Intel Core i9-14900K",
    tier: "very_high",
    gaming_score: 95,
    release_year: 2023,
    msrp: 589,
    current_price_approx: 439,
  },
  "intel core i9-14900kf": {
    name: "Intel Core i9-14900KF",
    tier: "very_high",
    gaming_score: 95,
    release_year: 2023,
    msrp: 564,
    current_price_approx: 419,
  },
  "intel core i7-14700k": {
    name: "Intel Core i7-14700K",
    tier: "very_high",
    gaming_score: 92,
    release_year: 2023,
    msrp: 419,
    current_price_approx: 329,
  },
  "intel core i7-14700kf": {
    name: "Intel Core i7-14700KF",
    tier: "very_high",
    gaming_score: 92,
    release_year: 2023,
    msrp: 394,
    current_price_approx: 309,
  },
  "intel core i7-14700f": {
    name: "Intel Core i7-14700F",
    tier: "high",
    gaming_score: 88,
    release_year: 2024,
    msrp: 329,
    current_price_approx: 269,
  },
  "intel core i7-14700": {
    name: "Intel Core i7-14700",
    tier: "high",
    gaming_score: 88,
    release_year: 2024,
    msrp: 349,
    current_price_approx: 289,
  },
  "intel core i5-14600k": {
    name: "Intel Core i5-14600K",
    tier: "high",
    gaming_score: 87,
    release_year: 2023,
    msrp: 319,
    current_price_approx: 249,
  },
  "intel core i5-14600kf": {
    name: "Intel Core i5-14600KF",
    tier: "high",
    gaming_score: 87,
    release_year: 2023,
    msrp: 294,
    current_price_approx: 229,
  },
  "intel core i5-14500": {
    name: "Intel Core i5-14500",
    tier: "mid",
    gaming_score: 78,
    release_year: 2024,
    msrp: 232,
    current_price_approx: 179,
  },
  "intel core i5-14400f": {
    name: "Intel Core i5-14400F",
    tier: "mid",
    gaming_score: 75,
    release_year: 2024,
    msrp: 199,
    current_price_approx: 159,
  },
  "intel core i5-14400": {
    name: "Intel Core i5-14400",
    tier: "mid",
    gaming_score: 75,
    release_year: 2024,
    msrp: 219,
    current_price_approx: 169,
  },
  "intel core i3-14100f": {
    name: "Intel Core i3-14100F",
    tier: "low",
    gaming_score: 60,
    release_year: 2024,
    msrp: 110,
    current_price_approx: 89,
  },
  "intel core i3-14100": {
    name: "Intel Core i3-14100",
    tier: "low",
    gaming_score: 60,
    release_year: 2024,
    msrp: 134,
    current_price_approx: 99,
  },

  // ── Intel — 13th Gen ────────────────────────────────────────────────────
  "intel core i9-13900k": {
    name: "Intel Core i9-13900K",
    tier: "very_high",
    gaming_score: 93,
    release_year: 2022,
    msrp: 589,
    current_price_approx: 379,
  },
  "intel core i9-13900kf": {
    name: "Intel Core i9-13900KF",
    tier: "very_high",
    gaming_score: 93,
    release_year: 2022,
    msrp: 564,
    current_price_approx: 359,
  },
  "intel core i7-13700k": {
    name: "Intel Core i7-13700K",
    tier: "high",
    gaming_score: 89,
    release_year: 2022,
    msrp: 419,
    current_price_approx: 289,
  },
  "intel core i7-13700kf": {
    name: "Intel Core i7-13700KF",
    tier: "high",
    gaming_score: 89,
    release_year: 2022,
    msrp: 394,
    current_price_approx: 269,
  },
  "intel core i7-13700f": {
    name: "Intel Core i7-13700F",
    tier: "high",
    gaming_score: 87,
    release_year: 2023,
    msrp: 329,
    current_price_approx: 249,
  },
  "intel core i5-13600k": {
    name: "Intel Core i5-13600K",
    tier: "high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 319,
    current_price_approx: 219,
  },
  "intel core i5-13600kf": {
    name: "Intel Core i5-13600KF",
    tier: "high",
    gaming_score: 85,
    release_year: 2022,
    msrp: 294,
    current_price_approx: 199,
  },
  "intel core i5-13500": {
    name: "Intel Core i5-13500",
    tier: "mid",
    gaming_score: 76,
    release_year: 2023,
    msrp: 232,
    current_price_approx: 169,
  },
  "intel core i5-13400f": {
    name: "Intel Core i5-13400F",
    tier: "mid",
    gaming_score: 72,
    release_year: 2023,
    msrp: 199,
    current_price_approx: 149,
  },
  "intel core i5-13400": {
    name: "Intel Core i5-13400",
    tier: "mid",
    gaming_score: 72,
    release_year: 2023,
    msrp: 219,
    current_price_approx: 159,
  },
  "intel core i3-13100f": {
    name: "Intel Core i3-13100F",
    tier: "low",
    gaming_score: 55,
    release_year: 2023,
    msrp: 109,
    current_price_approx: 79,
  },

  // ── Intel — 12th Gen ────────────────────────────────────────────────────
  "intel core i9-12900k": {
    name: "Intel Core i9-12900K",
    tier: "high",
    gaming_score: 84,
    release_year: 2021,
    msrp: 589,
    current_price_approx: 269,
  },
  "intel core i9-12900kf": {
    name: "Intel Core i9-12900KF",
    tier: "high",
    gaming_score: 84,
    release_year: 2021,
    msrp: 564,
    current_price_approx: 249,
  },
  "intel core i7-12700k": {
    name: "Intel Core i7-12700K",
    tier: "high",
    gaming_score: 82,
    release_year: 2021,
    msrp: 409,
    current_price_approx: 219,
  },
  "intel core i7-12700kf": {
    name: "Intel Core i7-12700KF",
    tier: "high",
    gaming_score: 82,
    release_year: 2021,
    msrp: 384,
    current_price_approx: 199,
  },
  "intel core i7-12700f": {
    name: "Intel Core i7-12700F",
    tier: "mid",
    gaming_score: 78,
    release_year: 2022,
    msrp: 329,
    current_price_approx: 179,
  },
  "intel core i5-12600k": {
    name: "Intel Core i5-12600K",
    tier: "mid",
    gaming_score: 76,
    release_year: 2021,
    msrp: 289,
    current_price_approx: 169,
  },
  "intel core i5-12600kf": {
    name: "Intel Core i5-12600KF",
    tier: "mid",
    gaming_score: 76,
    release_year: 2021,
    msrp: 264,
    current_price_approx: 149,
  },
  "intel core i5-12400f": {
    name: "Intel Core i5-12400F",
    tier: "mid",
    gaming_score: 68,
    release_year: 2022,
    msrp: 179,
    current_price_approx: 109,
  },
  "intel core i5-12400": {
    name: "Intel Core i5-12400",
    tier: "mid",
    gaming_score: 68,
    release_year: 2022,
    msrp: 192,
    current_price_approx: 119,
  },
  "intel core i3-12100f": {
    name: "Intel Core i3-12100F",
    tier: "low",
    gaming_score: 55,
    release_year: 2022,
    msrp: 109,
    current_price_approx: 79,
  },
  "intel core i3-12100": {
    name: "Intel Core i3-12100",
    tier: "low",
    gaming_score: 55,
    release_year: 2022,
    msrp: 122,
    current_price_approx: 89,
  },

  // ── Intel — 11th Gen ────────────────────────────────────────────────────
  "intel core i9-11900k": {
    name: "Intel Core i9-11900K",
    tier: "mid",
    gaming_score: 72,
    release_year: 2021,
    msrp: 539,
    current_price_approx: 199,
  },
  "intel core i7-11700k": {
    name: "Intel Core i7-11700K",
    tier: "mid",
    gaming_score: 68,
    release_year: 2021,
    msrp: 399,
    current_price_approx: 169,
  },
  "intel core i7-11700f": {
    name: "Intel Core i7-11700F",
    tier: "mid",
    gaming_score: 66,
    release_year: 2021,
    msrp: 329,
    current_price_approx: 149,
  },
  "intel core i5-11600k": {
    name: "Intel Core i5-11600K",
    tier: "mid",
    gaming_score: 64,
    release_year: 2021,
    msrp: 262,
    current_price_approx: 139,
  },
  "intel core i5-11400f": {
    name: "Intel Core i5-11400F",
    tier: "low",
    gaming_score: 58,
    release_year: 2021,
    msrp: 157,
    current_price_approx: 99,
  },
  "intel core i5-11400": {
    name: "Intel Core i5-11400",
    tier: "low",
    gaming_score: 58,
    release_year: 2021,
    msrp: 182,
    current_price_approx: 109,
  },

  // ── Intel — 10th Gen ────────────────────────────────────────────────────
  "intel core i9-10900k": {
    name: "Intel Core i9-10900K",
    tier: "mid",
    gaming_score: 68,
    release_year: 2020,
    msrp: 488,
    current_price_approx: 179,
  },
  "intel core i7-10700k": {
    name: "Intel Core i7-10700K",
    tier: "mid",
    gaming_score: 65,
    release_year: 2020,
    msrp: 374,
    current_price_approx: 149,
  },
  "intel core i5-10600k": {
    name: "Intel Core i5-10600K",
    tier: "low",
    gaming_score: 58,
    release_year: 2020,
    msrp: 262,
    current_price_approx: 119,
  },
  "intel core i5-10400f": {
    name: "Intel Core i5-10400F",
    tier: "low",
    gaming_score: 52,
    release_year: 2020,
    msrp: 157,
    current_price_approx: 89,
  },
  "intel core i3-10100f": {
    name: "Intel Core i3-10100F",
    tier: "very_low",
    gaming_score: 42,
    release_year: 2020,
    msrp: 97,
    current_price_approx: 59,
  },
};

// ─── GPU Database (~85 entries) ─────────────────────────────────────────────

export const gpuDatabase: Record<string, HardwareEntry> = {
  // ── NVIDIA — RTX 50-series (Blackwell) ──────────────────────────────────
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

  // ── NVIDIA — RTX 40-series (Ada Lovelace) ───────────────────────────────
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
  "nvidia geforce rtx 4060 ti 16gb": {
    name: "NVIDIA GeForce RTX 4060 Ti 16GB",
    tier: "mid",
    gaming_score: 60,
    release_year: 2023,
    msrp: 499,
    current_price_approx: 419,
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

  // ── NVIDIA — RTX 30-series (Ampere) ─────────────────────────────────────
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
  "nvidia geforce rtx 3080 12gb": {
    name: "NVIDIA GeForce RTX 3080 12GB",
    tier: "high",
    gaming_score: 69,
    release_year: 2022,
    msrp: 799,
    current_price_approx: 519,
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
  "nvidia geforce rtx 3050": {
    name: "NVIDIA GeForce RTX 3050",
    tier: "low",
    gaming_score: 32,
    release_year: 2022,
    msrp: 249,
    current_price_approx: 159,
  },

  // ── NVIDIA — RTX 20-series (Turing) ─────────────────────────────────────
  "nvidia geforce rtx 2080 ti": {
    name: "NVIDIA GeForce RTX 2080 Ti",
    tier: "mid",
    gaming_score: 48,
    release_year: 2018,
    msrp: 1199,
    current_price_approx: 349,
  },
  "nvidia geforce rtx 2080 super": {
    name: "NVIDIA GeForce RTX 2080 SUPER",
    tier: "mid",
    gaming_score: 44,
    release_year: 2019,
    msrp: 699,
    current_price_approx: 299,
  },
  "nvidia geforce rtx 2080": {
    name: "NVIDIA GeForce RTX 2080",
    tier: "mid",
    gaming_score: 42,
    release_year: 2018,
    msrp: 699,
    current_price_approx: 269,
  },
  "nvidia geforce rtx 2070 super": {
    name: "NVIDIA GeForce RTX 2070 SUPER",
    tier: "mid",
    gaming_score: 40,
    release_year: 2019,
    msrp: 499,
    current_price_approx: 249,
  },
  "nvidia geforce rtx 2070": {
    name: "NVIDIA GeForce RTX 2070",
    tier: "low",
    gaming_score: 36,
    release_year: 2018,
    msrp: 499,
    current_price_approx: 219,
  },
  "nvidia geforce rtx 2060 super": {
    name: "NVIDIA GeForce RTX 2060 SUPER",
    tier: "low",
    gaming_score: 34,
    release_year: 2019,
    msrp: 399,
    current_price_approx: 199,
  },
  "nvidia geforce rtx 2060": {
    name: "NVIDIA GeForce RTX 2060",
    tier: "low",
    gaming_score: 32,
    release_year: 2019,
    msrp: 349,
    current_price_approx: 169,
  },

  // ── NVIDIA — GTX 16-series (Turing) ─────────────────────────────────────
  "nvidia geforce gtx 1660 ti": {
    name: "NVIDIA GeForce GTX 1660 Ti",
    tier: "low",
    gaming_score: 28,
    release_year: 2019,
    msrp: 279,
    current_price_approx: 159,
  },
  "nvidia geforce gtx 1660 super": {
    name: "NVIDIA GeForce GTX 1660 SUPER",
    tier: "low",
    gaming_score: 28,
    release_year: 2019,
    msrp: 229,
    current_price_approx: 139,
  },
  "nvidia geforce gtx 1660": {
    name: "NVIDIA GeForce GTX 1660",
    tier: "low",
    gaming_score: 25,
    release_year: 2019,
    msrp: 219,
    current_price_approx: 119,
  },
  "nvidia geforce gtx 1650 super": {
    name: "NVIDIA GeForce GTX 1650 SUPER",
    tier: "low",
    gaming_score: 24,
    release_year: 2019,
    msrp: 159,
    current_price_approx: 109,
  },
  "nvidia geforce gtx 1650": {
    name: "NVIDIA GeForce GTX 1650",
    tier: "very_low",
    gaming_score: 20,
    release_year: 2019,
    msrp: 149,
    current_price_approx: 99,
  },

  // ── NVIDIA — GTX 10-series (Pascal) ─────────────────────────────────────
  "nvidia geforce gtx 1080 ti": {
    name: "NVIDIA GeForce GTX 1080 Ti",
    tier: "low",
    gaming_score: 35,
    release_year: 2017,
    msrp: 699,
    current_price_approx: 199,
  },
  "nvidia geforce gtx 1080": {
    name: "NVIDIA GeForce GTX 1080",
    tier: "low",
    gaming_score: 30,
    release_year: 2016,
    msrp: 599,
    current_price_approx: 149,
  },
  "nvidia geforce gtx 1070 ti": {
    name: "NVIDIA GeForce GTX 1070 Ti",
    tier: "low",
    gaming_score: 28,
    release_year: 2017,
    msrp: 449,
    current_price_approx: 139,
  },
  "nvidia geforce gtx 1070": {
    name: "NVIDIA GeForce GTX 1070",
    tier: "very_low",
    gaming_score: 25,
    release_year: 2016,
    msrp: 379,
    current_price_approx: 119,
  },
  "nvidia geforce gtx 1060 6gb": {
    name: "NVIDIA GeForce GTX 1060 6GB",
    tier: "very_low",
    gaming_score: 18,
    release_year: 2016,
    msrp: 249,
    current_price_approx: 89,
  },
  "nvidia geforce gtx 1060 3gb": {
    name: "NVIDIA GeForce GTX 1060 3GB",
    tier: "very_low",
    gaming_score: 15,
    release_year: 2016,
    msrp: 199,
    current_price_approx: 69,
  },
  "nvidia geforce gtx 1050 ti": {
    name: "NVIDIA GeForce GTX 1050 Ti",
    tier: "very_low",
    gaming_score: 14,
    release_year: 2016,
    msrp: 139,
    current_price_approx: 69,
  },
  "nvidia geforce gtx 1050": {
    name: "NVIDIA GeForce GTX 1050",
    tier: "very_low",
    gaming_score: 10,
    release_year: 2016,
    msrp: 109,
    current_price_approx: 49,
  },

  // ── Intel Arc ───────────────────────────────────────────────────────────
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
  "intel arc a750": {
    name: "Intel Arc A750",
    tier: "low",
    gaming_score: 38,
    release_year: 2022,
    msrp: 289,
    current_price_approx: 189,
  },
  "intel arc a580": {
    name: "Intel Arc A580",
    tier: "low",
    gaming_score: 32,
    release_year: 2023,
    msrp: 179,
    current_price_approx: 149,
  },
  "intel arc a380": {
    name: "Intel Arc A380",
    tier: "very_low",
    gaming_score: 12,
    release_year: 2022,
    msrp: 139,
    current_price_approx: 89,
  },

  // ── AMD — RX 9000-series (RDNA 4) ──────────────────────────────────────
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

  // ── AMD — RX 7000-series (RDNA 3) ──────────────────────────────────────
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
  "amd radeon rx 7900 gre": {
    name: "AMD Radeon RX 7900 GRE",
    tier: "high",
    gaming_score: 72,
    release_year: 2024,
    msrp: 549,
    current_price_approx: 449,
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
  "amd radeon rx 7600 xt": {
    name: "AMD Radeon RX 7600 XT",
    tier: "mid",
    gaming_score: 50,
    release_year: 2024,
    msrp: 329,
    current_price_approx: 289,
  },
  "amd radeon rx 7600": {
    name: "AMD Radeon RX 7600",
    tier: "mid",
    gaming_score: 45,
    release_year: 2023,
    msrp: 269,
    current_price_approx: 239,
  },

  // ── AMD — RX 6000-series (RDNA 2) ──────────────────────────────────────
  "amd radeon rx 6950 xt": {
    name: "AMD Radeon RX 6950 XT",
    tier: "high",
    gaming_score: 70,
    release_year: 2022,
    msrp: 1099,
    current_price_approx: 499,
  },
  "amd radeon rx 6900 xt": {
    name: "AMD Radeon RX 6900 XT",
    tier: "high",
    gaming_score: 68,
    release_year: 2020,
    msrp: 999,
    current_price_approx: 449,
  },
  "amd radeon rx 6800 xt": {
    name: "AMD Radeon RX 6800 XT",
    tier: "high",
    gaming_score: 65,
    release_year: 2020,
    msrp: 649,
    current_price_approx: 389,
  },
  "amd radeon rx 6800": {
    name: "AMD Radeon RX 6800",
    tier: "mid",
    gaming_score: 60,
    release_year: 2020,
    msrp: 579,
    current_price_approx: 349,
  },
  "amd radeon rx 6750 xt": {
    name: "AMD Radeon RX 6750 XT",
    tier: "mid",
    gaming_score: 52,
    release_year: 2022,
    msrp: 549,
    current_price_approx: 279,
  },
  "amd radeon rx 6700 xt": {
    name: "AMD Radeon RX 6700 XT",
    tier: "mid",
    gaming_score: 48,
    release_year: 2021,
    msrp: 479,
    current_price_approx: 249,
  },
  "amd radeon rx 6650 xt": {
    name: "AMD Radeon RX 6650 XT",
    tier: "mid",
    gaming_score: 45,
    release_year: 2022,
    msrp: 399,
    current_price_approx: 199,
  },
  "amd radeon rx 6600 xt": {
    name: "AMD Radeon RX 6600 XT",
    tier: "low",
    gaming_score: 40,
    release_year: 2021,
    msrp: 379,
    current_price_approx: 189,
  },
  "amd radeon rx 6600": {
    name: "AMD Radeon RX 6600",
    tier: "low",
    gaming_score: 35,
    release_year: 2021,
    msrp: 329,
    current_price_approx: 169,
  },
  "amd radeon rx 6500 xt": {
    name: "AMD Radeon RX 6500 XT",
    tier: "very_low",
    gaming_score: 18,
    release_year: 2022,
    msrp: 199,
    current_price_approx: 109,
  },
  "amd radeon rx 6400": {
    name: "AMD Radeon RX 6400",
    tier: "very_low",
    gaming_score: 14,
    release_year: 2022,
    msrp: 159,
    current_price_approx: 99,
  },

  // ── AMD — RX 5000-series (RDNA 1) ──────────────────────────────────────
  "amd radeon rx 5700 xt": {
    name: "AMD Radeon RX 5700 XT",
    tier: "low",
    gaming_score: 38,
    release_year: 2019,
    msrp: 399,
    current_price_approx: 159,
  },
  "amd radeon rx 5700": {
    name: "AMD Radeon RX 5700",
    tier: "low",
    gaming_score: 34,
    release_year: 2019,
    msrp: 349,
    current_price_approx: 139,
  },
  "amd radeon rx 5600 xt": {
    name: "AMD Radeon RX 5600 XT",
    tier: "low",
    gaming_score: 30,
    release_year: 2020,
    msrp: 279,
    current_price_approx: 119,
  },
  "amd radeon rx 5500 xt": {
    name: "AMD Radeon RX 5500 XT",
    tier: "very_low",
    gaming_score: 20,
    release_year: 2019,
    msrp: 199,
    current_price_approx: 89,
  },

  // ── AMD — RX Vega / RX 580 (still common) ──────────────────────────────
  "amd radeon rx 590": {
    name: "AMD Radeon RX 590",
    tier: "very_low",
    gaming_score: 18,
    release_year: 2018,
    msrp: 279,
    current_price_approx: 89,
  },
  "amd radeon rx 580": {
    name: "AMD Radeon RX 580",
    tier: "very_low",
    gaming_score: 16,
    release_year: 2017,
    msrp: 229,
    current_price_approx: 69,
  },
  "amd radeon rx 570": {
    name: "AMD Radeon RX 570",
    tier: "very_low",
    gaming_score: 13,
    release_year: 2017,
    msrp: 169,
    current_price_approx: 49,
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
 * Normalize a model name for matching by stripping common noise that Windows
 * and WMI inject into hardware names. For example:
 *   "12th Gen Intel(R) Core(TM) i5-12400F @ 2.50GHz" → "intel core i5-12400f"
 *   "NVIDIA GeForce RTX 4070 Founders Edition"        → "nvidia geforce rtx 4070 founders edition"
 */
function normalizeModelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(r\)/gi, "")
    .replace(/\(tm\)/gi, "")
    .replace(/\d+th gen\s*/gi, "")
    .replace(/\d+st gen\s*/gi, "")
    .replace(/\d+nd gen\s*/gi, "")
    .replace(/\d+rd gen\s*/gi, "")
    .replace(/@\s*[\d.]+\s*ghz/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generic hardware lookup with improved fuzzy matching.
 * 1. Normalize input (strip (R), (TM), generation prefix, @ clock speed)
 * 2. Direct match on normalized key
 * 3. Substring match with specificity guard (>= 60% overlap)
 *    to avoid false positives like "RTX 3060" matching "RTX 3060 Ti".
 */
function lookupHardware(
  modelName: string,
  database: Record<string, HardwareEntry>,
): HardwareEntry | null {
  const key = normalizeModelName(modelName);

  // Direct match
  if (database[key]) return database[key];

  // Substring match with specificity guard and longest-match-wins:
  let bestMatch: HardwareEntry | null = null;
  let bestLength = 0;

  for (const [dbKey, entry] of Object.entries(database)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      const shorter = Math.min(key.length, dbKey.length);
      const longer = Math.max(key.length, dbKey.length);
      if (shorter / longer >= 0.6 && dbKey.length > bestLength) {
        bestMatch = entry;
        bestLength = dbKey.length;
      }
    }
  }

  return bestMatch;
}

/**
 * Attempts to look up a CPU in the database using a normalized, fuzzy match.
 */
export function lookupCPU(modelName: string): HardwareEntry | null {
  return lookupHardware(modelName, cpuDatabase);
}

/**
 * Attempts to look up a GPU in the database using a normalized, fuzzy match.
 */
export function lookupGPU(modelName: string): HardwareEntry | null {
  return lookupHardware(modelName, gpuDatabase);
}

/**
 * Returns a list of upgrade recommendations from the given database that are
 * in a higher tier than the current entry.
 *
 * The `database` parameter should be the same type of database as the current
 * entry (i.e. pass cpuDatabase for a CPU entry, gpuDatabase for a GPU entry).
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
