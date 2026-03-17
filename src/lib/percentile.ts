import { cpuDatabase, gpuDatabase, lookupCPU, lookupGPU } from "@/data/hardware-db";
import type { SystemScan, AnalysisResult } from "@/lib/types";

export interface PercentileResult {
  overall: number;
  cpu: number;
  gpu: number;
  ram: number;
}

/** Compute percentile: what % of entries score <= the given value */
function scorePercentile(
  userScore: number,
  database: Record<string, { gaming_score: number }>,
): number {
  const scores = Object.values(database).map((e) => e.gaming_score);
  const below = scores.filter((s) => s <= userScore).length;
  return Math.round((below / scores.length) * 100);
}

/** RAM "score" for percentile: capacity × speed weighting */
function ramScore(scan: SystemScan): number {
  const capacityScore = Math.min(scan.ram.total_gb / 64, 1) * 50;
  const speedScore = Math.min(scan.ram.speed_mhz / 7200, 1) * 30;
  const channelBonus = scan.ram.channel_mode === "dual" ? 15 : scan.ram.channel_mode === "quad" ? 20 : 0;
  return Math.round(capacityScore + speedScore + channelBonus);
}

// Predefined RAM percentile curve (based on Steam Hardware Survey distribution)
const RAM_CURVE = [
  { score: 10, pct: 5 },
  { score: 25, pct: 15 },
  { score: 40, pct: 35 },
  { score: 55, pct: 55 },
  { score: 65, pct: 70 },
  { score: 75, pct: 82 },
  { score: 85, pct: 92 },
  { score: 95, pct: 98 },
];

function ramPercentile(score: number): number {
  for (let i = RAM_CURVE.length - 1; i >= 0; i--) {
    if (score >= RAM_CURVE[i].score) return RAM_CURVE[i].pct;
  }
  return 2;
}

export function getPercentiles(
  scan: SystemScan,
  analysis: AnalysisResult,
): PercentileResult {
  const cpuEntry = lookupCPU(scan.cpu.model_name);
  const gpuEntry = lookupGPU(scan.gpu.model_name);

  const cpuPct = cpuEntry ? scorePercentile(cpuEntry.gaming_score, cpuDatabase) : 50;
  const gpuPct = gpuEntry ? scorePercentile(gpuEntry.gaming_score, gpuDatabase) : 50;
  const ramPct = ramPercentile(ramScore(scan));

  // Overall: weighted by gaming impact
  const settingsStoragePct = Math.round((analysis.score.breakdown.settings + analysis.score.breakdown.storage) / 30 * 100);
  const overall = Math.round(
    gpuPct * 0.35 + cpuPct * 0.30 + ramPct * 0.20 + settingsStoragePct * 0.15,
  );

  return {
    overall: Math.min(overall, 99),
    cpu: cpuPct,
    gpu: gpuPct,
    ram: ramPct,
  };
}
