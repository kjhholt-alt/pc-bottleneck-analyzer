import { describe, expect, it } from "vitest";
import { lookupCPU, lookupGPU } from "@/data/hardware-db";
import { analyzeScan } from "../analysis";
import type { SystemScan } from "@/lib/types";

// ─── gl-0489 regression tests ────────────────────────────────────────────────
//
// Root cause from the 2026-07-17 live audit (gl-0481): real scanner CPU names
// carry WMI noise suffixes ("AMD Ryzen 7 5700X3D 8-Core Processor") that made
// the normalized name fail lookupHardware's 60% length-ratio guard. The CPU
// was silently treated as unknown, scored a perfect 25/25, and the Upgrade
// Simulator offered the user's own CPU back as a "+66% upgrade".

describe("lookupCPU resolves real scanner-reported names (gl-0489 fix 1)", () => {
  it("strips the WMI 'N-Core Processor' suffix", () => {
    const entry = lookupCPU("AMD Ryzen 7 5700X3D 8-Core Processor");
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe("AMD Ryzen 7 5700X3D");
  });

  it("handles other core counts and AMD models", () => {
    expect(lookupCPU("AMD Ryzen 9 5900X 12-Core Processor")?.name).toBe("AMD Ryzen 9 5900X");
    expect(lookupCPU("AMD Ryzen 5 3600 6-Core Processor")?.name).toBe("AMD Ryzen 5 3600");
  });

  it("strips the APU 'with Radeon Graphics' suffix", () => {
    // 5700G isn't in the DB, but the suffix strip must not break names that
    // are. Use a model that exists: Ryzen 7 8700G is in hardware-db.
    expect(lookupCPU("AMD Ryzen 7 8700G with Radeon Graphics")?.name).toBe("AMD Ryzen 7 8700G");
  });

  it("still resolves Intel WMI names (existing behavior preserved)", () => {
    expect(lookupCPU("12th Gen Intel(R) Core(TM) i5-12400F @ 2.50GHz")?.name).toBe("Intel Core i5-12400F");
  });

  it("does not regress plain DB-style names", () => {
    expect(lookupCPU("AMD Ryzen 7 5700X3D")?.name).toBe("AMD Ryzen 7 5700X3D");
    expect(lookupGPU("NVIDIA GeForce RTX 3090")?.name).toBe("NVIDIA GeForce RTX 3090");
  });

  it("genuinely unknown names still return null", () => {
    expect(lookupCPU("Totally Made Up CPU 9000 128-Core Processor")).toBeNull();
  });
});

// ─── Unknown hardware must not score perfect marks (gl-0489 fix 2) ───────────

function buildScan(cpuName: string, gpuName: string): SystemScan {
  return {
    scan_id: `lookup-test-${cpuName}`.toLowerCase().replace(/\s+/g, "-"),
    timestamp: new Date(0).toISOString(),
    scan_duration_seconds: 0,
    cpu: {
      model_name: cpuName,
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
      usage_per_core: Array(16).fill(65),
      power_draw_w: null,
    },
    gpu: {
      model_name: gpuName,
      vram_total_gb: 16,
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
      total_gb: 32,
      speed_mhz: 6000,
      num_sticks: 2,
      num_slots: 4,
      channel_mode: "dual",
      form_factor: "DDR5",
      timings: null,
      current_used_gb: 16,
      usage_percent: 50,
    },
    storage: [
      {
        model: "NVMe SSD (test)",
        type: "NVMe SSD",
        capacity_gb: 1000,
        used_gb: 500,
        free_gb: 500,
        interface: "NVMe",
        health_status: "good",
        is_boot_drive: true,
      },
    ],
    motherboard: { model: "test board", chipset: "Z790", bios_version: "current", bios_date: null },
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
    bios_settings: { xmp_enabled: true, resizable_bar: true, tpm_status: null, virtualization: null, secure_boot: null },
  };
}

describe("unknown hardware scores an honest neutral, never a perfect 25/25", () => {
  it("an unrecognized CPU gets the mid-tier default, below every very_high-tier CPU", () => {
    const unknown = analyzeScan(buildScan("Totally Made Up CPU 9000", "NVIDIA GeForce RTX 3090"));
    const known = analyzeScan(buildScan("AMD Ryzen 9 9950X3D", "NVIDIA GeForce RTX 3090"));
    expect(unknown.score.breakdown.cpu).toBeLessThan(25);
    expect(unknown.score.breakdown.cpu).toBeLessThan(known.score.breakdown.cpu);
  });

  it("a real scanner-style CPU name now scores from its actual tier, not the unknown default", () => {
    const scannerName = analyzeScan(buildScan("AMD Ryzen 7 5700X3D 8-Core Processor", "NVIDIA GeForce RTX 3090"));
    const dbName = analyzeScan(buildScan("AMD Ryzen 7 5700X3D", "NVIDIA GeForce RTX 3090"));
    expect(scannerName.score.breakdown.cpu).toBe(dbName.score.breakdown.cpu);
  });

  it("an unrecognized GPU also gets the mid-tier default, not perfect marks", () => {
    const unknown = analyzeScan(buildScan("AMD Ryzen 7 5700X3D", "Imaginary GPU XT 9999"));
    expect(unknown.score.breakdown.gpu).toBeLessThan(25);
  });
});
