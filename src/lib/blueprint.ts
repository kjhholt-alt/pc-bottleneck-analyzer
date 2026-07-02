// ─── PC Upgrade Blueprint — pure generator ───────────────────────────────────
//
// Turns a manual hardware pick (CPU + GPU + RAM + resolution + up to 3 target
// games) into a deterministic upgrade plan: a verdict (reusing the bottleneck
// analysis engine), a 3-budget GPU upgrade ladder with per-game FPS uplift
// (reusing the best-gpu-for FPS estimator), compatibility notes (reusing the
// compatibility checker), resale-adjusted net cost per rung, and the existing
// free/cheap recommendations. No LLM, no network calls — everything here is
// template + data, so the same input always produces the same output.
//
// The picker doesn't collect live telemetry (usage %, temps, driver freshness),
// so we synthesize a scan that assumes "everything else is optimal" (XMP on,
// high-performance power plan, NVMe boot drive, healthy). That isolates the
// verdict's score/grade to what the picked CPU/GPU tiers actually support,
// which is the honest thing to show someone who hasn't run the real scanner.

import { analyzeScan } from "@/lib/analysis";
import { checkCompatibility } from "@/lib/compatibility";
import { estFps, type Res } from "@/lib/gpu-for-game";
import { estimateResaleValue } from "@/lib/resale";
import { getAffiliateLinks } from "@/lib/affiliate";
import {
  cpuDatabase,
  gpuDatabase,
  lookupCPU,
  lookupGPU,
  tierIndex,
  type HardwareEntry,
} from "@/data/hardware-db";
import { gameBenchmarks, type GameBenchmark } from "@/data/game-benchmarks";
import type {
  SystemScan,
  PerformanceScore,
  Recommendation,
  CompatibilityCheck,
} from "@/lib/types";

export const BUDGET_RUNGS = [150, 300, 600] as const;
export type BudgetRung = (typeof BUDGET_RUNGS)[number];

export interface BlueprintPickerInput {
  /** Display name or DB key of the current CPU (fuzzy-matched via lookupCPU). */
  cpuName: string;
  /** Display name or DB key of the current GPU (fuzzy-matched via lookupGPU). */
  gpuName: string;
  ramGb: number;
  resolution: Res;
  /** Up to 3 `GameBenchmark.id` values. */
  gameIds: string[];
}

export interface FpsUplift {
  gameId: string;
  gameTitle: string;
  beforeFps: number;
  afterFps: number;
}

export interface LadderRung {
  budget: BudgetRung;
  /** The GPU pick for this budget, or null if nothing in the DB fits. */
  part: HardwareEntry | null;
  /** part price - resale of the current GPU. Null when part is null. */
  netCost: number | null;
  resaleOfCurrentGpu: number;
  fpsUplift: FpsUplift[];
  affiliateLinks: { amazon: string; newegg: string } | null;
}

export interface Blueprint {
  input: BlueprintPickerInput;
  cpuEntry: HardwareEntry;
  gpuEntry: HardwareEntry;
  verdict: {
    score: PerformanceScore;
    /** Whichever of cpu/gpu is the bigger limiter right now. */
    bottleneckCategory: "cpu" | "gpu";
  };
  ladder: LadderRung[];
  orderOfOperations: string[];
  freeWins: Recommendation[];
  compatibility: CompatibilityCheck[];
}

const DEFAULT_CURRENT_YEAR = new Date().getFullYear();

/** Resolve a picker's free-text hardware name against the DB, with a safe fallback. */
function resolveEntry(
  name: string,
  lookup: (n: string) => HardwareEntry | null,
  database: Record<string, HardwareEntry>,
): HardwareEntry {
  const found = lookup(name);
  if (found) return found;
  // Fall back to the lowest-tier entry so an unrecognized pick still produces
  // a (very conservative) plan instead of throwing.
  return Object.values(database).reduce((worst, e) =>
    tierIndex(e.tier) < tierIndex(worst.tier) ? e : worst,
  );
}

function guessChipset(cpu: HardwareEntry): string {
  const isAMD = cpu.name.toLowerCase().includes("ryzen");
  if (isAMD) return cpu.release_year >= 2022 ? "X670" : "B550";
  if (cpu.release_year >= 2024) return "Z890";
  if (cpu.release_year >= 2021) return "Z790";
  return "Z490";
}

/**
 * Build a SystemScan that assumes every setting/telemetry field we didn't
 * collect is "optimal" so the resulting score reflects the picked CPU/GPU
 * tiers, not made-up bad luck.
 */
function buildSyntheticScan(
  input: BlueprintPickerInput,
  cpuEntry: HardwareEntry,
  gpuEntry: HardwareEntry,
): SystemScan {
  const isDDR5 = cpuEntry.release_year >= 2023;
  const ramSpeedMhz = isDDR5 ? 6000 : 3600;

  return {
    scan_id: `blueprint-${cpuEntry.name}-${gpuEntry.name}`
      .toLowerCase()
      .replace(/\s+/g, "-"),
    timestamp: new Date(0).toISOString(),
    scan_duration_seconds: 0,
    cpu: {
      model_name: cpuEntry.name,
      architecture: "unknown",
      physical_cores: 8,
      logical_cores: 16,
      base_clock_ghz: 3.5,
      max_boost_clock_ghz: 5.0,
      current_clock_ghz: 4.8,
      cache_l1: null,
      cache_l2: null,
      cache_l3: null,
      current_temp_c: 65,
      usage_per_core: [65, 65, 65, 65, 65, 65, 65, 65],
      power_draw_w: null,
    },
    gpu: {
      model_name: gpuEntry.name,
      vram_total_gb: 12,
      vram_used_gb: 6,
      gpu_clock_mhz: 0,
      memory_clock_mhz: 0,
      current_temp_c: 68,
      fan_speed_pct: null,
      driver_version: "current",
      gpu_utilization_pct: 92,
      pcie_generation: 4,
      pcie_link_width: 16,
    },
    ram: {
      total_gb: input.ramGb,
      speed_mhz: ramSpeedMhz,
      num_sticks: 2,
      num_slots: 4,
      channel_mode: "dual",
      form_factor: isDDR5 ? "DDR5" : "DDR4",
      timings: null,
      current_used_gb: input.ramGb / 2,
      usage_percent: 50,
    },
    storage: [
      {
        model: "NVMe SSD (assumed)",
        type: "NVMe SSD",
        capacity_gb: 1000,
        used_gb: 500,
        free_gb: 500,
        interface: "NVMe",
        health_status: "good",
        is_boot_drive: true,
      },
    ],
    motherboard: {
      model: "Assumed motherboard",
      chipset: guessChipset(cpuEntry),
      bios_version: "current",
      bios_date: null,
    },
    os: {
      windows_version: "Windows 11",
      build_number: "unknown",
      is_up_to_date: true,
      power_plan: "High performance",
      game_mode: true,
      hw_accelerated_gpu_scheduling: true,
      virtual_memory_gb: null,
    },
    network: { connection_type: "unknown", speed_mbps: null, latency_ms: null },
    bios_settings: {
      xmp_enabled: true,
      resizable_bar: true,
      tpm_status: null,
      virtualization: null,
      secure_boot: null,
    },
  };
}

/** GPUs strictly better-tiered than `current` and priced at or under `maxPrice`. */
function candidatesWithinBudget(
  current: HardwareEntry,
  maxPrice: number,
): HardwareEntry[] {
  const currentTier = tierIndex(current.tier);
  return Object.values(gpuDatabase).filter(
    (e) =>
      tierIndex(e.tier) > currentTier &&
      (e.current_price_approx || e.msrp) <= maxPrice,
  );
}

/**
 * Best pick within a budget: highest raw gaming_score that fits, not just
 * best score-per-dollar — someone with $600 to spend wants the best card
 * that fits, not the most "efficient" cheap one.
 */
function pickBestUpgrade(
  current: HardwareEntry,
  maxPrice: number,
): HardwareEntry | null {
  const pool = candidatesWithinBudget(current, maxPrice);
  if (pool.length === 0) return null;
  return pool.reduce((best, e) =>
    e.gaming_score > best.gaming_score ? e : best,
  );
}

function resolveGames(gameIds: string[]): GameBenchmark[] {
  return gameIds
    .map((id) => gameBenchmarks.find((g) => g.id === id))
    .filter((g): g is GameBenchmark => Boolean(g));
}

export function generateBlueprint(
  input: BlueprintPickerInput,
  opts: { currentYear?: number } = {},
): Blueprint {
  const currentYear = opts.currentYear ?? DEFAULT_CURRENT_YEAR;

  const cpuEntry = resolveEntry(input.cpuName, lookupCPU, cpuDatabase);
  const gpuEntry = resolveEntry(input.gpuName, lookupGPU, gpuDatabase);
  const games = resolveGames(input.gameIds);

  const scan = buildSyntheticScan(input, cpuEntry, gpuEntry);
  const analysis = analyzeScan(scan);

  const cpuTier = tierIndex(cpuEntry.tier);
  const gpuTier = tierIndex(gpuEntry.tier);
  const bottleneckCategory: "cpu" | "gpu" = cpuTier < gpuTier ? "cpu" : "gpu";

  const resaleOfCurrentGpu = estimateResaleValue(gpuEntry, currentYear);

  const ladder: LadderRung[] = BUDGET_RUNGS.map((budget) => {
    const part = pickBestUpgrade(gpuEntry, budget);
    const netCost = part ? (part.current_price_approx || part.msrp) - resaleOfCurrentGpu : null;

    const fpsUplift: FpsUplift[] = games.map((game) => ({
      gameId: game.id,
      gameTitle: game.title,
      beforeFps: estFps(gpuEntry, game, input.resolution),
      afterFps: estFps(part ?? gpuEntry, game, input.resolution),
    }));

    return {
      budget,
      part,
      netCost,
      resaleOfCurrentGpu,
      fpsUplift,
      affiliateLinks: part ? getAffiliateLinks(part.name) : null,
    };
  });

  const topPart = [...ladder].reverse().find((r) => r.part)?.part ?? null;
  const compatibility = checkCompatibility(
    scan,
    "gpu",
    topPart?.name ?? gpuEntry.name,
  );

  const freeWins = analysis.recommendations.filter((r) => r.tier === "free");

  const orderOfOperations: string[] = [];
  orderOfOperations.push(
    freeWins.length > 0
      ? "Do the free wins first (below) — zero cost, and they compound with any hardware upgrade."
      : "Your free-tier settings already look solid — no zero-cost wins to grab first.",
  );
  if (bottleneckCategory === "cpu") {
    orderOfOperations.push(
      `Your ${cpuEntry.name} is the bigger limiter right now, not your ${gpuEntry.name}. ` +
        "A GPU upgrade alone will under-deliver in CPU-heavy titles until the CPU is addressed too.",
    );
  }
  orderOfOperations.push(
    "Buy the lowest-budget ladder rung that clears your target FPS in your most-played game — going bigger than that mostly buys headroom, not smoothness.",
  );
  orderOfOperations.push(
    "Sell your current GPU using the resale estimate below to offset the net cost of the upgrade.",
  );

  return {
    input,
    cpuEntry,
    gpuEntry,
    verdict: { score: analysis.score, bottleneckCategory },
    ladder,
    orderOfOperations,
    freeWins,
    compatibility,
  };
}
