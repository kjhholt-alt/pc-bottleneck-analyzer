import type { SystemScan, AnalysisResult } from "@/lib/types";
import { analyzeScan } from "@/lib/analysis";
import { cpuDatabase, gpuDatabase, tierIndex } from "@/data/hardware-db";

// ─── VRAM Estimates ───────────────────────────────────────────────────────────

const VRAM_MAP: Array<[RegExp, number]> = [
  [/rtx\s*5090/i, 32],
  [/rtx\s*5080/i, 16],
  [/rtx\s*5070\s*ti/i, 16],
  [/rtx\s*5070/i, 12],
  [/rtx\s*5060/i, 8],
  [/rtx\s*4090/i, 24],
  [/rtx\s*4080/i, 16],
  [/rtx\s*4070\s*ti/i, 12],
  [/rtx\s*4070/i, 12],
  [/rtx\s*4060\s*ti\s*16/i, 16],
  [/rtx\s*4060\s*ti/i, 8],
  [/rtx\s*4060/i, 8],
  [/rtx\s*3090/i, 24],
  [/rtx\s*3080\s*12/i, 12],
  [/rtx\s*3080/i, 10],
  [/rtx\s*3070/i, 8],
  [/rtx\s*3060\s*ti/i, 8],
  [/rtx\s*3060/i, 12],
  [/rtx\s*3050/i, 8],
  [/rtx\s*2080\s*ti/i, 11],
  [/rtx\s*2080/i, 8],
  [/rtx\s*2070/i, 8],
  [/rtx\s*2060/i, 6],
  [/rx\s*9070\s*xt/i, 16],
  [/rx\s*9070/i, 16],
  [/rx\s*9060/i, 16],
  [/rx\s*7900\s*xtx/i, 24],
  [/rx\s*7900\s*xt/i, 20],
  [/rx\s*7900\s*gre/i, 16],
  [/rx\s*7800/i, 16],
  [/rx\s*7700/i, 12],
  [/rx\s*7600\s*xt/i, 16],
  [/rx\s*7600/i, 8],
  [/rx\s*6950\s*xt/i, 16],
  [/rx\s*6900\s*xt/i, 16],
  [/rx\s*6800/i, 16],
  [/rx\s*6700\s*xt/i, 12],
  [/rx\s*6650\s*xt/i, 8],
  [/rx\s*6600/i, 8],
  [/arc\s*b580/i, 12],
  [/arc\s*b570/i, 10],
  [/arc\s*a770/i, 16],
  [/arc\s*a750/i, 8],
];

function estimateVRAM(gpuName: string): number {
  for (const [pattern, vram] of VRAM_MAP) {
    if (pattern.test(gpuName)) return vram;
  }
  return 8;
}

// ─── Core Simulator ───────────────────────────────────────────────────────────

/**
 * Simulate replacing the CPU and/or GPU in a scan and return updated analysis.
 * Clones the scan, swaps model names (and estimates specs where possible),
 * then re-runs the full analysis engine.
 */
export function simulateUpgrade(
  scan: SystemScan,
  newCpuName?: string,
  newGpuName?: string,
): AnalysisResult {
  const modified: SystemScan = JSON.parse(JSON.stringify(scan));

  if (newCpuName) {
    modified.cpu.model_name = newCpuName;
    // Try to pull clock/core hints from the name string itself
    const coresM = newCpuName.match(/(\d+)-Core/i);
    if (coresM) {
      modified.cpu.physical_cores = parseInt(coresM[1]);
      const hasHT = /i[5-9]|Core Ultra|Ryzen [5-9]|Threadripper/i.test(newCpuName);
      modified.cpu.logical_cores = hasHT ? parseInt(coresM[1]) * 2 : parseInt(coresM[1]);
    }
    const clockM = newCpuName.match(/([\d.]+)\s*GHz/i);
    if (clockM) {
      modified.cpu.base_clock_ghz = parseFloat(clockM[1]);
      modified.cpu.current_clock_ghz = 0; // unknown at idle
    }
    // Zero out live metrics so analysis doesn't flag phantom thermals
    modified.cpu.current_temp_c = null;
    modified.cpu.power_draw_w = null;
    modified.cpu.usage_per_core = Array(modified.cpu.logical_cores).fill(0);
  }

  if (newGpuName) {
    modified.gpu.model_name = newGpuName;
    modified.gpu.vram_total_gb = estimateVRAM(newGpuName);
    modified.gpu.vram_used_gb = 0;
    modified.gpu.current_temp_c = null;
    modified.gpu.fan_speed_pct = null;
    modified.gpu.gpu_utilization_pct = 0;
  }

  return analyzeScan(modified);
}

// ─── Hardware Option Lists ────────────────────────────────────────────────────

export interface HardwareOption {
  name: string;
  tier: string;
  score: number;
  price: number;
}

export function getCPUOptions(): HardwareOption[] {
  return Object.values(cpuDatabase)
    .sort((a, b) => {
      const td = tierIndex(b.tier) - tierIndex(a.tier);
      return td !== 0 ? td : b.gaming_score - a.gaming_score;
    })
    .map((e) => ({
      name: e.name,
      tier: e.tier,
      score: e.gaming_score,
      price: e.current_price_approx,
    }));
}

export function getGPUOptions(): HardwareOption[] {
  return Object.values(gpuDatabase)
    .sort((a, b) => {
      const td = tierIndex(b.tier) - tierIndex(a.tier);
      return td !== 0 ? td : b.gaming_score - a.gaming_score;
    })
    .map((e) => ({
      name: e.name,
      tier: e.tier,
      score: e.gaming_score,
      price: e.current_price_approx,
    }));
}

export const TIER_LABELS: Record<string, string> = {
  very_high: "Flagship",
  high: "High-End",
  mid: "Mid-Range",
  low: "Entry-Level",
  very_low: "Budget",
};
