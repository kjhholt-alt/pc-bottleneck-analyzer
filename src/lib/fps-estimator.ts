import type { SystemScan, AnalysisResult } from "@/lib/types";
import { RESOLUTION_MULTIPLIERS, QUALITY_MULTIPLIERS, type GameBenchmark, type Resolution, type QualityPreset } from "@/data/game-benchmarks";
import { lookupCPU, lookupGPU } from "@/data/hardware-db";

// RTX 4070 = gaming_score 68 in hardware-db.ts — the calibration reference card
const GPU_REFERENCE_SCORE = 68;

// The gaming_score scale is a compressed *rank* scale at the top end: score
// deltas understate real throughput deltas (RTX 5090 = 100 vs RTX 4070 = 68
// is ~2.5x real-world 4K raster performance, not 100/68 = 1.47x). A linear
// score ratio therefore crushed flagship FPS estimates — a 5090 was predicted
// at ~40 FPS in Cyberpunk 4K Ultra (real: ~65-75) and the UI told 5090 owners
// to drop to 1440p (gl-0489 fix 4). Model relative GPU throughput as
// exponential in score instead: every +24 gaming_score points ≈ 2x real FPS.
// Calibrated against published 4K raster geomeans (RTX 4070 = 1.0):
//   4060 (50) ≈ 0.6× · 4070S (73) ≈ 1.15× · 4080 (84) ≈ 1.6× ·
//   4090 (96) ≈ 2.2× · 5090 (100) ≈ 2.5×
const GPU_SCORE_DOUBLING = 24;

/** Relative GPU throughput vs the reference card (RTX 4070 = 1.0). */
export function gpuThroughputRatio(gpuScore: number): number {
  return Math.pow(2, (gpuScore - GPU_REFERENCE_SCORE) / GPU_SCORE_DOUBLING);
}
// Ryzen 7 5800X (78) / i7-13700K (89) class = ~80 in our DB (hardware-db.ts)
const CPU_REFERENCE_SCORE = 80;

// A reference-class CPU's headroom over baseFps in a GPU-bound title vs a
// CPU-bound one. baseFps is calibrated GPU-bound: RTX 4070 @ 1080p Ultra, fed
// by a CPU fast enough to not be the bottleneck at that calibration point. In
// GPU-heavy titles a reference CPU can feed frames well above baseFps (the
// GPU is what's holding things back), so headroom is generous. In cpuHeavy
// titles (esports/sim titles that lean on single-thread/engine throughput)
// the reference CPU is much closer to its own ceiling, so headroom is tight.
const CPU_HEADROOM_CPU_HEAVY = 1.2;
const CPU_HEADROOM_GPU_HEAVY = 1.8;

export interface FPSResult {
  low: number;
  estimated: number;
  high: number;
  verdict: "smooth" | "playable" | "struggling";
  verdictLabel: string;
  color: string;
}

/**
 * Pure FPS core model: min(cpuLimitedFps, gpuLimitedFps).
 *
 * gpuLimitedFps scales with GPU score, resolution, and quality — this is the
 * ceiling the GPU can push frames to.
 *
 * cpuLimitedFps scales with CPU score only (resolution/quality-independent,
 * since the CPU does the same simulation/draw-call work regardless of pixel
 * count) — this is the ceiling the CPU can feed frames at.
 *
 * The engine is bottlenecked by whichever is lower, matching how real
 * CPU/GPU-bound rendering behaves (unlike a multiplicative model, where a
 * weak CPU could still throttle FPS down even in a heavily GPU-bound,
 * high-resolution scenario where the CPU was never actually the constraint).
 *
 * `cpuScore = null` means no CPU cap (unknown/omitted CPU) — GPU-limited only.
 */
export function fpsCore(
  cpuScore: number | null,
  gpuScore: number,
  game: GameBenchmark,
  resolution: Resolution,
  quality: QualityPreset,
): number {
  const resMult = RESOLUTION_MULTIPLIERS[resolution];
  const qualMult = QUALITY_MULTIPLIERS[quality];

  const gpuLimitedFps = game.baseFps * gpuThroughputRatio(gpuScore) * resMult * qualMult;

  if (cpuScore === null) return gpuLimitedFps;

  const cpuHeadroom = game.cpuHeavy ? CPU_HEADROOM_CPU_HEAVY : CPU_HEADROOM_GPU_HEAVY;
  const cpuLimitedFps = game.baseFps * cpuHeadroom * (cpuScore / CPU_REFERENCE_SCORE);

  return Math.min(cpuLimitedFps, gpuLimitedFps);
}

export function estimateFPS(
  scan: SystemScan,
  analysis: AnalysisResult,
  game: GameBenchmark,
  resolution: Resolution,
  quality: QualityPreset,
): FPSResult {
  const cpuEntry = lookupCPU(scan.cpu.model_name);
  const gpuEntry = lookupGPU(scan.gpu.model_name);

  // Unknown CPU → no CPU cap (honest: we can't invent a ceiling from a name
  // we don't recognize; gl-0489 fix 2 — the old fallback of 50 fabricated a
  // mid-tier cap). Unknown GPU keeps a mid prior since the GPU term is the
  // core of the estimate and 50 ≈ mid-range.
  const cpuScore = cpuEntry?.gaming_score ?? null;
  const gpuScore = gpuEntry?.gaming_score ?? 50;

  let fps = fpsCore(cpuScore, gpuScore, game, resolution, quality);

  // RAM penalties
  if (analysis.score.breakdown.ram < 12) {
    // XMP likely off or single-channel
    const xmpOff = scan.ram.speed_mhz < 3000;
    const singleChannel = scan.ram.channel_mode === "single";
    if (xmpOff) fps *= 0.85;
    if (singleChannel) fps *= 0.90;
  }

  // Thermal throttling penalty
  const cpuHot = (scan.cpu.current_temp_c ?? 0) > 85;
  const gpuHot = (scan.gpu.current_temp_c ?? 0) > 85;
  if (cpuHot || gpuHot) fps *= 0.90;

  const estimated = Math.round(fps);
  const low = Math.round(fps * 0.85);
  const high = Math.round(fps * 1.12);

  let verdict: FPSResult["verdict"];
  let verdictLabel: string;
  let color: string;

  if (estimated >= 60) {
    verdict = "smooth";
    verdictLabel = estimated >= 144 ? "Buttery Smooth (144+ FPS)" : "Smooth (60+ FPS)";
    color = "var(--green)";
  } else if (estimated >= 30) {
    verdict = "playable";
    verdictLabel = "Playable (30-60 FPS)";
    color = "var(--amber)";
  } else {
    verdict = "struggling";
    verdictLabel = "Struggling (<30 FPS)";
    color = "var(--red)";
  }

  return { low, estimated, high, verdict, verdictLabel, color };
}
