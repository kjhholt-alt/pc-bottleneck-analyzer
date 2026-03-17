import type { SystemScan, AnalysisResult } from "@/lib/types";
import { RESOLUTION_MULTIPLIERS, QUALITY_MULTIPLIERS, type GameBenchmark, type Resolution, type QualityPreset } from "@/data/game-benchmarks";
import { lookupCPU, lookupGPU } from "@/data/hardware-db";

// RTX 4070 = gaming_score 75 in our DB — the calibration reference card
const GPU_REFERENCE_SCORE = 75;
// Ryzen 7 5800X / i7-13700K class = ~80 in our DB
const CPU_REFERENCE_SCORE = 70;

export interface FPSResult {
  low: number;
  estimated: number;
  high: number;
  verdict: "smooth" | "playable" | "struggling";
  verdictLabel: string;
  color: string;
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

  const cpuScore = cpuEntry?.gaming_score ?? 50;
  const gpuScore = gpuEntry?.gaming_score ?? 50;

  // GPU is the primary driver of FPS
  const gpuFactor = gpuScore / GPU_REFERENCE_SCORE;

  // CPU caps FPS but doesn't inflate it beyond 1.0 (except for esports titles)
  const cpuCap = game.cpuHeavy ? 1.15 : 1.0;
  const cpuFactor = Math.min(cpuCap, cpuScore / CPU_REFERENCE_SCORE);

  const resMult = RESOLUTION_MULTIPLIERS[resolution];
  const qualMult = QUALITY_MULTIPLIERS[quality];

  let fps = game.baseFps * gpuFactor * cpuFactor * resMult * qualMult;

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
