// ─── System Scan Types ───────────────────────────────────────────────────────

export interface SystemScan {
  scan_id: string;
  timestamp: string;
  scan_duration_seconds: number;
  cpu: CPUInfo;
  gpu: GPUInfo;
  ram: RAMInfo;
  storage: StorageInfo[];
  motherboard: MotherboardInfo;
  os: OSInfo;
  network: NetworkInfo;
  bios_settings: BIOSSettings;
}

export interface CPUInfo {
  model_name: string;
  architecture: string;
  physical_cores: number;
  logical_cores: number;
  base_clock_ghz: number;
  max_boost_clock_ghz: number;
  current_clock_ghz: number;
  cache_l1: number | null;
  cache_l2: number | null;
  cache_l3: number | null;
  current_temp_c: number | null;
  usage_per_core: number[];
  power_draw_w: number | null;
}

export interface GPUInfo {
  model_name: string;
  vram_total_gb: number;
  vram_used_gb: number;
  gpu_clock_mhz: number;
  memory_clock_mhz: number;
  current_temp_c: number | null;
  fan_speed_pct: number | null;
  driver_version: string;
  gpu_utilization_pct: number;
  pcie_generation: number | null;
  pcie_link_width: number | null;
}

export interface RAMInfo {
  total_gb: number;
  speed_mhz: number;
  num_sticks: number;
  num_slots: number;
  channel_mode: "single" | "dual" | "quad" | "unknown";
  form_factor: string;
  timings: string | null;
  current_used_gb: number;
  usage_percent: number;
}

export interface StorageInfo {
  model: string;
  type: "NVMe SSD" | "SATA SSD" | "HDD" | "Unknown";
  capacity_gb: number;
  used_gb: number;
  free_gb: number;
  interface: string;
  health_status: string | null;
  is_boot_drive: boolean;
}

export interface MotherboardInfo {
  model: string;
  chipset: string | null;
  bios_version: string;
  bios_date: string | null;
}

export interface OSInfo {
  windows_version: string;
  build_number: string;
  is_up_to_date: boolean | null;
  power_plan: string;
  game_mode: boolean | null;
  hw_accelerated_gpu_scheduling: boolean | null;
  virtual_memory_gb: number | null;
}

export interface NetworkInfo {
  connection_type: string;
  speed_mbps: number | null;
  latency_ms: number | null;
}

export interface BIOSSettings {
  xmp_enabled: boolean | null;
  resizable_bar: boolean | null;
  tpm_status: boolean | null;
  virtualization: boolean | null;
  secure_boot: boolean | null;
}

// ─── Analysis Types ──────────────────────────────────────────────────────────

export type Severity = "critical" | "warning" | "info" | "good";

export interface Bottleneck {
  id: string;
  category: "cpu" | "gpu" | "ram" | "storage" | "thermal" | "settings";
  severity: Severity;
  title: string;
  description: string;
  impact: string;
  fix: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimated_cost: string;
}

export interface Recommendation {
  id: string;
  tier: "free" | "cheap" | "upgrade";
  title: string;
  description: string;
  impact: string;
  estimated_cost: string;
  priority: number;
}

export interface PerformanceScore {
  total: number;
  grade: string;
  grade_description: string;
  breakdown: {
    cpu: number;
    gpu: number;
    ram: number;
    storage: number;
    settings: number;
  };
}

export interface AnalysisResult {
  score: PerformanceScore;
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
}
