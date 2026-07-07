// ─── "Best GPU for <game>" ranking ───────────────────────────────────────────
//
// High buyer-intent SEO ("best graphics card for cyberpunk 2077"), generated
// from the game-benchmark + GPU databases. Estimates, clearly labelled.

import { gpuDatabase, type HardwareEntry } from "@/data/hardware-db";
import { gameBenchmarks, type GameBenchmark } from "@/data/game-benchmarks";
import { slugifyPart } from "@/lib/compare";
import { fpsCore } from "@/lib/fps-estimator";

// "4K" is included because RESOLUTION_MULTIPLIERS defines it — used by
// src/lib/blueprint.ts, which lets buyers pick 4K as their target resolution.
// rankGpus()/pickGpus() below always pass "1080p"/"1440p" literals explicitly,
// so this widening doesn't change their behavior.
export type Res = "1080p" | "1440p" | "4K";

export function gameSlug(g: GameBenchmark): string {
  return g.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveGame(slug: string): GameBenchmark | null {
  return gameBenchmarks.find((g) => gameSlug(g) === slug) ?? null;
}

export function allGames(): GameBenchmark[] {
  return [...gameBenchmarks].sort((a, b) => b.year - a.year);
}

/**
 * Estimated average FPS for a GPU in a game at Ultra settings + resolution.
 *
 * `cpu` is optional. Omitted (the default): GPU-limited only, matching the
 * historical behavior of this function byte-for-byte — every existing
 * best-gpu-for/compare/tier-list SEO page and rankGpus()/pickGpus() call
 * this way, and their output must not change.
 *
 * Passed: applies the CPU ceiling from the shared fpsCore() model, so a
 * CPU-bottlenecked buyer sees FPS estimates that flatten out once the GPU
 * stops being the limiter — used by blueprint.ts's upgrade ladder.
 *
 * Quality is fixed at "High" (fpsCore's neutral 1.0x multiplier), not
 * "Ultra" (0.85x) — game.baseFps in the DB is already Ultra-calibrated, so
 * "High" avoids double-applying an Ultra discount on top of that baseline.
 */
export function estFps(
  gpu: HardwareEntry,
  game: GameBenchmark,
  res: Res,
  cpu?: HardwareEntry,
): number {
  return Math.round(
    fpsCore(cpu ? cpu.gaming_score : null, gpu.gaming_score, game, res, "High"),
  );
}

export interface GpuFps {
  entry: HardwareEntry;
  slug: string;
  fps1080: number;
  fps1440: number;
}

export function rankGpus(
  game: GameBenchmark,
  opts: { minScore?: number; minYear?: number; topN?: number } = {}
): GpuFps[] {
  const { minScore = 55, minYear = 2021, topN = 10 } = opts;
  return Object.values(gpuDatabase)
    .filter((g) => g.gaming_score >= minScore && g.release_year >= minYear)
    .map((entry) => ({
      entry,
      slug: slugifyPart(entry.name),
      fps1080: estFps(entry, game, "1080p"),
      fps1440: estFps(entry, game, "1440p"),
    }))
    .sort((a, b) => b.fps1080 - a.fps1080)
    .slice(0, topN);
}

export interface GamePicks {
  /** Cheapest GPU that clears 60 FPS at 1440p Ultra. */
  smooth1440: GpuFps | null;
  /** Cheapest GPU that clears 144 FPS at 1080p Ultra (high-refresh). */
  highRefresh1080: GpuFps | null;
  /** Highest-performing GPU. */
  max: GpuFps;
}

export function pickGpus(game: GameBenchmark): GamePicks {
  // Rank a wider pool for the picks than we show in the table.
  const pool = rankGpus(game, { topN: 999 });
  const price = (g: GpuFps) => g.entry.current_price_approx || g.entry.msrp;
  const cheapest = (rows: GpuFps[]) =>
    rows.length ? rows.reduce((a, b) => (price(a) <= price(b) ? a : b)) : null;

  return {
    smooth1440: cheapest(pool.filter((g) => g.fps1440 >= 60)),
    highRefresh1080: cheapest(pool.filter((g) => g.fps1080 >= 144)),
    max: pool[0],
  };
}
