import type { SystemScan } from "@/lib/types";

/**
 * Sample scan data representing a mid-range gaming PC with several
 * intentional bottlenecks:
 *
 *   - RAM running at 2133 MHz (XMP not enabled on DDR4-3600 kit)
 *   - Power plan set to "Balanced" instead of High Performance
 *   - Resizable BAR disabled
 *   - Secondary storage is a spinning HDD
 *   - BIOS slightly outdated
 */
export const sampleScan: SystemScan = {
  scan_id: "demo-001",
  timestamp: "2026-02-12T14:30:00Z",
  scan_duration_seconds: 4.2,

  // ── CPU ──────────────────────────────────────────────────────────────────
  cpu: {
    model_name: "AMD Ryzen 7 5800X",
    architecture: "Zen 3",
    physical_cores: 8,
    logical_cores: 16,
    base_clock_ghz: 3.8,
    max_boost_clock_ghz: 4.7,
    current_clock_ghz: 4.45,
    cache_l1: 512,       // KB
    cache_l2: 4096,      // KB
    cache_l3: 32768,     // KB (32 MB)
    current_temp_c: 62,
    usage_per_core: [
      45, 52, 38, 61, 55, 42, 48, 50,
      30, 35, 28, 40, 33, 29, 31, 36,
    ],
    power_draw_w: 95,
  },

  // ── GPU ──────────────────────────────────────────────────────────────────
  gpu: {
    model_name: "NVIDIA GeForce RTX 4070 Ti",
    vram_total_gb: 12,
    vram_used_gb: 7.8,
    gpu_clock_mhz: 2310,
    memory_clock_mhz: 10504,
    current_temp_c: 68,
    fan_speed_pct: 55,
    driver_version: "566.14",
    gpu_utilization_pct: 88,
    pcie_generation: 4,
    pcie_link_width: 16,
  },

  // ── RAM ──────────────────────────────────────────────────────────────────
  // 32 GB kit rated for 3600 MHz, but XMP is off so it runs at JEDEC 2133 MHz
  ram: {
    total_gb: 32,
    speed_mhz: 2133,
    num_sticks: 2,
    num_slots: 4,
    channel_mode: "dual",
    form_factor: "DIMM DDR4",
    timings: "15-15-15-36",
    current_used_gb: 14.2,
    usage_percent: 44,
  },

  // ── Storage ──────────────────────────────────────────────────────────────
  storage: [
    {
      model: "Samsung 980 Pro 1TB",
      type: "NVMe SSD",
      capacity_gb: 953,
      used_gb: 612,
      free_gb: 341,
      interface: "PCIe 4.0 x4",
      health_status: "Good",
      is_boot_drive: true,
    },
    {
      model: "Seagate Barracuda 2TB",
      type: "HDD",
      capacity_gb: 1863,
      used_gb: 1240,
      free_gb: 623,
      interface: "SATA III",
      health_status: "Good",
      is_boot_drive: false,
    },
  ],

  // ── Motherboard ──────────────────────────────────────────────────────────
  motherboard: {
    model: "MSI MAG B550 TOMAHAWK",
    chipset: "AMD B550",
    bios_version: "7C91v1A",
    bios_date: "2024-03-15",
  },

  // ── OS ───────────────────────────────────────────────────────────────────
  os: {
    windows_version: "Windows 11 23H2",
    build_number: "22631.4037",
    is_up_to_date: true,
    power_plan: "Balanced",
    game_mode: true,
    hw_accelerated_gpu_scheduling: false,
    virtual_memory_gb: 16,
  },

  // ── Network ──────────────────────────────────────────────────────────────
  network: {
    connection_type: "Ethernet",
    speed_mbps: 940,
    latency_ms: 8,
  },

  // ── BIOS Settings ───────────────────────────────────────────────────────
  bios_settings: {
    xmp_enabled: false,
    resizable_bar: false,
    tpm_status: true,
    virtualization: true,
    secure_boot: true,
  },
};
