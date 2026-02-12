// TODO: Upgrade Simulator - Clone scan data with swapped CPU/GPU and re-run analysis
//
// This module provides the logic for the "What If?" upgrade simulator.
// It takes existing scan data and a replacement CPU or GPU name, creates
// a modified copy of the scan, and runs the analysis engine on it.

import type { SystemScan, AnalysisResult } from "@/lib/types";

/**
 * Simulate replacing the CPU and/or GPU in a scan and return updated analysis.
 *
 * @param scan - The original system scan data
 * @param newCpuName - Optional new CPU model name (from hardware-db)
 * @param newGpuName - Optional new GPU model name (from hardware-db)
 * @returns New analysis result with the simulated hardware swap
 */
export function simulateUpgrade(
  _scan: SystemScan,
  _newCpuName?: string,
  _newGpuName?: string,
): AnalysisResult {
  // TODO: Implementation
  // 1. Deep-clone the scan object
  // 2. If newCpuName provided, replace scan.cpu.model_name
  // 3. If newGpuName provided, replace scan.gpu.model_name
  // 4. Call analyzeScan() on the modified scan
  // 5. Return the new AnalysisResult
  throw new Error("Not implemented yet — planned for a future session");
}

/**
 * Get all available CPU options from the hardware database,
 * sorted by tier (highest first) then gaming score.
 */
export function getCPUOptions(): Array<{ name: string; tier: string; score: number }> {
  // TODO: Read from cpuDatabase and return sorted list
  return [];
}

/**
 * Get all available GPU options from the hardware database,
 * sorted by tier (highest first) then gaming score.
 */
export function getGPUOptions(): Array<{ name: string; tier: string; score: number }> {
  // TODO: Read from gpuDatabase and return sorted list
  return [];
}
