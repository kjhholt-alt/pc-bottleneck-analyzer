// ─── PC Deep-Dive Report — generator (pure, deterministic) ───────────────────
//
// Composes the site's existing rule-based engine into a single, richer report:
//   • verdict + component scores        ← analyzeScan (buildSyntheticScan)
//   • percentile ("better than X%")     ← getPercentiles
//   • full bottleneck list + all recs   ← analyzeScan (not just the top 3)
//   • per-game FPS table + ratings      ← estFps (best-gpu-for model)
//   • 3-budget upgrade ladder + compat  ← generateBlueprint (reused wholesale)
//
// No LLM, no network — the same input always produces the same output, which is
// what makes server-side fulfillment safe to run headlessly on a webhook and
// what keeps the public sample route honestly "canned" (it just renders a fixed
// input through this function; the no-live-model-API-on-public-demos rail is
// satisfied by construction).

import { analyzeScan } from "@/lib/analysis";
import { getPercentiles } from "@/lib/percentile";
import { estFps } from "@/lib/gpu-for-game";
import {
  generateBlueprint,
  buildSyntheticScan,
  type LadderRung,
} from "@/lib/blueprint";
import { gameBenchmarks, type GameBenchmark } from "@/data/game-benchmarks";
import type { Recommendation } from "@/lib/types";
import type { DeepDiveInput, DeepDiveReport, GameFpsRow } from "./types";

/** FPS → smoothness label, aligned with common monitor refresh tiers. */
function fpsRating(fps: number): string {
  if (fps < 30) return "Struggling";
  if (fps < 60) return "Playable";
  if (fps < 100) return "Smooth";
  if (fps < 144) return "High-refresh";
  return "Competitive";
}

function resolveGames(gameIds: string[]): GameBenchmark[] {
  return gameIds
    .map((id) => gameBenchmarks.find((g) => g.id === id))
    .filter((g): g is GameBenchmark => Boolean(g));
}

/** The best (highest-FPS) part across the ladder, for the per-game upgrade column. */
function topLadderPart(ladder: LadderRung[]) {
  return [...ladder].reverse().find((r) => r.part)?.part ?? null;
}

function buildSummary(
  score: number,
  grade: string,
  bottleneckCategory: "cpu" | "gpu",
  cpuName: string,
  gpuName: string,
  freeWinCount: number,
): { prose: string; bullets: string[] } {
  const limiter = bottleneckCategory === "cpu" ? cpuName : gpuName;
  const other = bottleneckCategory === "cpu" ? gpuName : cpuName;

  let prose: string;
  if (score >= 90) {
    prose =
      `Your system scores ${score}/100 (grade ${grade}) — this is a well-matched, high-end build. ` +
      `Your ${cpuName} and ${gpuName} are paired sensibly, so there's no obvious weak link dragging the rest down. ` +
      `The wins from here are about tuning and settings, not spending.`;
  } else if (score >= 75) {
    prose =
      `Your system scores ${score}/100 (grade ${grade}) — a strong, balanced build with a little headroom left. ` +
      `Your ${limiter} is the first component that will hold you back as you push higher settings or refresh rates, ` +
      `but you're not leaving a large amount of performance on the table today.`;
  } else if (score >= 60) {
    prose =
      `Your system scores ${score}/100 (grade ${grade}). Your ${limiter} is the clearest limiter right now, ` +
      `and your ${other} is waiting on it in the most demanding titles. The upgrade ladder below is ordered so ` +
      `you fix the actual bottleneck first instead of overspending on the part that isn't holding you back.`;
  } else {
    prose =
      `Your system scores ${score}/100 (grade ${grade}). There's meaningful performance to recover here — your ${limiter} ` +
      `is bottlenecking the build, and settings/telemetry gains stack on top of any hardware upgrade. ` +
      `Start with the free wins, then take the lowest ladder rung that clears your FPS target.`;
  }

  const bullets = [
    `Overall performance score: ${score}/100 (grade ${grade}).`,
    `Primary limiter: your ${limiter} (${bottleneckCategory.toUpperCase()}).`,
    freeWinCount > 0
      ? `${freeWinCount} zero-cost win${freeWinCount === 1 ? "" : "s"} available before you spend a dollar.`
      : `Your settings already look optimal — no zero-cost wins outstanding.`,
    `A 3-budget upgrade ladder ($150 / $300 / $600) with per-game FPS uplift and resale-adjusted net cost is below.`,
  ];

  return { prose, bullets };
}

export interface GenerateOptions {
  /** Injected clock for deterministic tests / canned samples. */
  now?: Date;
}

export function generateDeepDiveReport(
  input: DeepDiveInput,
  opts: GenerateOptions = {},
): DeepDiveReport {
  const now = opts.now ?? new Date();

  // Reuse the Blueprint generator wholesale for the ladder / compatibility /
  // verdict-category, then rebuild the SAME synthetic scan it used so the fuller
  // bottleneck list and percentile stay consistent with that ladder.
  const blueprint = generateBlueprint(input, { currentYear: now.getFullYear() });
  const cpu = blueprint.cpuEntry;
  const gpu = blueprint.gpuEntry;

  const scan = buildSyntheticScan(input, cpu, gpu);
  const analysis = analyzeScan(scan);
  const percentile = getPercentiles(scan, analysis);

  const games = resolveGames(input.gameIds);
  const upgradePart = topLadderPart(blueprint.ladder);
  const gameRows: GameFpsRow[] = games.map((game) => {
    const currentFps = estFps(gpu, game, input.resolution, cpu);
    const bestUpgradeFps = estFps(upgradePart ?? gpu, game, input.resolution, cpu);
    return {
      gameId: game.id,
      title: game.title,
      currentFps,
      bestUpgradeFps,
      rating: fpsRating(currentFps),
    };
  });

  const recommendations = {
    free: analysis.recommendations.filter((r: Recommendation) => r.tier === "free"),
    cheap: analysis.recommendations.filter((r: Recommendation) => r.tier === "cheap"),
    upgrade: analysis.recommendations.filter((r: Recommendation) => r.tier === "upgrade"),
  };

  const { prose, bullets } = buildSummary(
    analysis.score.total,
    analysis.score.grade,
    blueprint.verdict.bottleneckCategory,
    cpu.name,
    gpu.name,
    recommendations.free.length,
  );

  return {
    input,
    generatedAtISO: now.toISOString(),
    cpu,
    gpu,
    score: analysis.score,
    bottleneckCategory: blueprint.verdict.bottleneckCategory,
    bottlenecks: analysis.bottlenecks,
    recommendations,
    percentile,
    games: gameRows,
    ladder: blueprint.ladder,
    orderOfOperations: blueprint.orderOfOperations,
    compatibility: blueprint.compatibility,
    verdictProse: prose,
    summaryBullets: bullets,
  };
}

/**
 * The canned sample used by the PUBLIC /report/sample demo and the landing
 * preview. A fixed, mid-range rig — never live buyer input — so the demo route
 * can't be turned into a free generator. Deterministic date so the sample HTML
 * is stable across builds.
 */
export const SAMPLE_INPUT: DeepDiveInput = {
  cpuName: "AMD Ryzen 5 5600",
  gpuName: "NVIDIA GeForce RTX 3060",
  ramGb: 16,
  resolution: "1080p",
  gameIds: ["cyberpunk", "cs2", "bg3", "fortnite"],
  storageType: "NVMe SSD",
  notes: "Sample report — a representative 1080p build.",
};

export function generateSampleReport(): DeepDiveReport {
  // Fixed clock keeps the sample byte-stable (deterministic prerender).
  return generateDeepDiveReport(SAMPLE_INPUT, { now: new Date("2026-07-01T00:00:00Z") });
}
