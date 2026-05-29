import type { SystemScan } from "@/lib/types";

/**
 * A fully-optimized reference system that triggers ZERO bottlenecks.
 * Tests start from this and flip one variable at a time so each assertion
 * isolates a single rule. Known very-high-tier CPU + GPU so lookups resolve.
 *
 * Expected baseline score: 94 (A) — see analysis.test.ts.
 */
export function optimalScan(): SystemScan {
  return {
    scan_id: "test-optimal",
    timestamp: "2026-05-28T00:00:00Z",
    scan_duration_seconds: 1,
    cpu: {
      model_name: "AMD Ryzen 7 9800X3D",
      architecture: "Zen 5",
      physical_cores: 8,
      logical_cores: 16,
      base_clock_ghz: 4.7,
      max_boost_clock_ghz: 5.2,
      current_clock_ghz: 5.0,
      cache_l1: 512,
      cache_l2: 8192,
      cache_l3: 98304,
      current_temp_c: 55,
      usage_per_core: [30, 25, 35, 20, 28, 22, 31, 26],
      power_draw_w: 90,
    },
    gpu: {
      model_name: "NVIDIA GeForce RTX 4090",
      vram_total_gb: 24,
      vram_used_gb: 10,
      gpu_clock_mhz: 2520,
      memory_clock_mhz: 10501,
      current_temp_c: 62,
      fan_speed_pct: 45,
      driver_version: "566.36",
      gpu_utilization_pct: 70,
      pcie_generation: 4,
      pcie_link_width: 16,
    },
    ram: {
      total_gb: 32,
      speed_mhz: 6000,
      num_sticks: 2,
      num_slots: 4,
      channel_mode: "dual",
      form_factor: "DIMM DDR5",
      timings: "30-38-38-96",
      current_used_gb: 12,
      usage_percent: 38,
    },
    storage: [
      {
        model: "Samsung 990 Pro 2TB",
        type: "NVMe SSD",
        capacity_gb: 1863,
        used_gb: 900,
        free_gb: 963,
        interface: "PCIe 4.0 x4",
        health_status: "Good",
        is_boot_drive: true,
      },
    ],
    motherboard: {
      model: "MSI MAG B650 TOMAHAWK",
      chipset: "AMD B650",
      bios_version: "1.A0",
      bios_date: "2025-01-10",
    },
    os: {
      windows_version: "Windows 11 24H2",
      build_number: "26100.0",
      is_up_to_date: true,
      power_plan: "High Performance",
      game_mode: true,
      hw_accelerated_gpu_scheduling: true,
      virtual_memory_gb: 32,
    },
    network: {
      connection_type: "Ethernet",
      speed_mbps: 940,
      latency_ms: 6,
    },
    bios_settings: {
      xmp_enabled: true,
      resizable_bar: true,
      tpm_status: true,
      virtualization: true,
      secure_boot: true,
    },
  };
}

/** Deep clone so per-test mutations never leak between tests. */
export function cloneScan(scan: SystemScan): SystemScan {
  return structuredClone(scan);
}
