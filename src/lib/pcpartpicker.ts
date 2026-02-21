import type {
  SystemScan,
  CPUInfo,
  GPUInfo,
  RAMInfo,
  StorageInfo,
  MotherboardInfo,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Extract a number from a string like "3600 MHz" → 3600, "32 GB" → 32 */
function parseNum(s: string): number {
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

// ─── CPU Parser ───────────────────────────────────────────────────────────────

interface RawPart {
  component: string;
  name: string;
}

function parseCPU(name: string): CPUInfo {
  // e.g. "AMD Ryzen 5 7600X 4.7 GHz 6-Core Processor"
  // e.g. "Intel Core i9-13900K 3 GHz 24-Core Processor"
  const baseClockM = name.match(/([\d.]+)\s*GHz/i);
  const baseClock = baseClockM ? parseFloat(baseClockM[1]) : 3.0;

  const coresM = name.match(/(\d+)-Core/i);
  const physCores = coresM ? parseInt(coresM[1]) : 4;

  // Logical cores: assume HT/SMT doubles cores for Intel/AMD (rough estimate)
  const hasHT = /i[5-9]|Core Ultra|Ryzen [5-9]|Threadripper/i.test(name);
  const logCores = hasHT ? physCores * 2 : physCores;

  return {
    model_name: name,
    architecture: detectCPUArch(name),
    physical_cores: physCores,
    logical_cores: logCores,
    base_clock_ghz: baseClock,
    max_boost_clock_ghz: baseClock + 0.8, // typical boost headroom
    current_clock_ghz: 0,
    cache_l1: null,
    cache_l2: null,
    cache_l3: null,
    current_temp_c: null,
    usage_per_core: Array(logCores).fill(0),
    power_draw_w: null,
  };
}

function detectCPUArch(name: string): string {
  if (/AM5|Ryzen 7[0-9]{3}[0-9]/i.test(name)) return "x86_64 (Zen 4)";
  if (/AM4|Ryzen [3-9][0-9]{3}[^0-9]/i.test(name)) return "x86_64 (Zen 3)";
  if (/14th|13th|12th Gen/i.test(name)) return "x86_64 (Raptor Lake)";
  if (/11th|10th Gen/i.test(name)) return "x86_64 (Rocket Lake)";
  if (/Core Ultra/i.test(name)) return "x86_64 (Arrow Lake)";
  return "x86_64";
}

// ─── GPU Parser ───────────────────────────────────────────────────────────────

function parseGPU(name: string): GPUInfo {
  // e.g. "MSI GeForce RTX 4070 GAMING X TRIO 12 GB Video Card"
  // e.g. "Sapphire Radeon RX 7900 XTX 24 GB Video Card"
  const vramM = name.match(/(\d+)\s*GB/i);
  const vram = vramM ? parseInt(vramM[1]) : 8;

  const cleanName = normalizeGPUName(name);

  return {
    model_name: cleanName,
    vram_total_gb: vram,
    vram_used_gb: 0,
    gpu_clock_mhz: 0,
    memory_clock_mhz: 0,
    current_temp_c: null,
    fan_speed_pct: null,
    driver_version: "Unknown",
    gpu_utilization_pct: 0,
    pcie_generation: detectPCIeGen(name),
    pcie_link_width: 16,
  };
}

function normalizeGPUName(name: string): string {
  // Strip brand prefix & suffix noise, keep the model identifier
  // "MSI GeForce RTX 4070 GAMING X TRIO 12 GB Video Card" → "NVIDIA GeForce RTX 4070"
  // "Sapphire Radeon RX 7900 XTX 24 GB" → "AMD Radeon RX 7900 XTX"
  const nvidiaM = name.match(/(GeForce\s+(?:GTX|RTX)\s+[\d]+(?:\s+Ti|\s+Super|\s+SUPER)?)/i);
  if (nvidiaM) return `NVIDIA ${nvidiaM[1].replace(/\s+/g, " ").trim()}`;

  const amdM = name.match(/(Radeon\s+(?:RX\s+)?[\w\d]+(?:\s+XT|\s+XTX|\s+GRE)?)/i);
  if (amdM) return `AMD ${amdM[1].replace(/\s+/g, " ").trim()}`;

  const arcM = name.match(/(Arc\s+[A-Z]\d+)/i);
  if (arcM) return `Intel ${arcM[1]}`;

  return name;
}

function detectPCIeGen(name: string): number | null {
  // RTX 40xx, RX 7000 → PCIe 4.0+
  if (/RTX\s+40|RX\s+7[0-9]{3}|Arc\s+A[5-7]/i.test(name)) return 4;
  if (/RTX\s+30|RX\s+6[0-9]{3}/i.test(name)) return 4;
  if (/RTX\s+20|GTX\s+16|RX\s+5[0-9]{3}/i.test(name)) return 3;
  return null;
}

// ─── RAM Parser ───────────────────────────────────────────────────────────────

function parseRAM(parts: RawPart[]): RAMInfo {
  // e.g. "Corsair Vengeance 32 GB (2 x 16 GB) DDR4-3600 CL18 Memory"
  // e.g. "G.Skill Trident Z5 64 GB (2 x 32 GB) DDR5-6000 CL30 Memory"
  const ramParts = parts.filter((p) => p.component === "memory");

  let totalGb = 0;
  let speedMhz = 3200;
  let numSticks = 0;
  let timings: string | null = null;
  let formFactor = "DIMM";

  for (const p of ramParts) {
    const name = p.name;

    // Total GB: "32 GB" or "(2 x 16 GB)" — prefer total
    const totalM = name.match(/^[\w\s]+?(\d+)\s*GB/i);
    if (totalM) totalGb += parseInt(totalM[1]);

    // Sticks: "(2 x 16 GB)" → 2
    const sticksM = name.match(/\((\d+)\s*x/i);
    if (sticksM) numSticks += parseInt(sticksM[1]);

    // Speed: "DDR4-3600" or "DDR5-6000"
    const speedM = name.match(/DDR[45]-(\d+)/i);
    if (speedM) speedMhz = parseInt(speedM[1]);

    // Timings: "CL18" or "18-22-22-42"
    const clM = name.match(/CL(\d+)/i);
    if (clM) timings = `CL${clM[1]}`;

    // SO-DIMM for laptop RAM
    if (/SO-DIMM/i.test(name)) formFactor = "SO-DIMM";
  }

  if (numSticks === 0) numSticks = 2; // safe default

  const channelMode: RAMInfo["channel_mode"] =
    numSticks >= 4 ? "quad" : numSticks === 2 ? "dual" : "single";

  return {
    total_gb: totalGb,
    speed_mhz: speedMhz,
    num_sticks: numSticks,
    num_slots: 4,
    channel_mode: channelMode,
    form_factor: formFactor,
    timings,
    current_used_gb: 0,
    usage_percent: 0,
  };
}

// ─── Storage Parser ──────────────────────────────────────────────────────────

function parseStorage(parts: RawPart[]): StorageInfo[] {
  const storageParts = parts.filter(
    (p) =>
      p.component === "storage" ||
      p.component === "internal-hard-drive" ||
      p.component === "m2-ssd" ||
      p.component === "ssd"
  );

  if (storageParts.length === 0) return [];

  return storageParts.map((p, i) => {
    const name = p.name;
    const type = detectStorageType(name);

    // Capacity: "1 TB" → 1000, "500 GB" → 500
    let capacityGb = 0;
    const tbM = name.match(/([\d.]+)\s*TB/i);
    const gbM = name.match(/([\d.]+)\s*GB/i);
    if (tbM) capacityGb = Math.round(parseFloat(tbM[1]) * 1000);
    else if (gbM) capacityGb = Math.round(parseFloat(gbM[1]));

    const iface =
      type === "NVMe SSD" ? "NVMe PCIe" : type === "SATA SSD" ? "SATA III" : "SATA";

    return {
      model: name,
      type,
      capacity_gb: capacityGb,
      used_gb: 0,
      free_gb: capacityGb,
      interface: iface,
      health_status: null,
      is_boot_drive: i === 0,
    };
  });
}

function detectStorageType(name: string): StorageInfo["type"] {
  if (/NVMe|PCIe|M\.2|970 EVO|980 PRO|SN[0-9]|WD_BLACK/i.test(name))
    return "NVMe SSD";
  if (/SSD|Solid State|SATA SSD|860 EVO|870 EVO|MX[0-9]/i.test(name))
    return "SATA SSD";
  if (/RPM|HDD|Barracuda|WD Blue|Seagate|IronWolf|7200|5400/i.test(name))
    return "HDD";
  return "Unknown";
}

// ─── Motherboard Parser ───────────────────────────────────────────────────────

function parseMotherboard(parts: RawPart[]): MotherboardInfo {
  const mb = parts.find((p) => p.component === "motherboard");
  if (!mb) {
    return {
      model: "Unknown",
      chipset: null,
      bios_version: "Unknown",
      bios_date: null,
    };
  }

  // Detect chipset from model name
  const chipsetM = mb.name.match(/\b(Z[0-9]+|B[0-9]+|X[0-9]+|H[0-9]+|A[0-9]+)\b/);

  return {
    model: mb.name,
    chipset: chipsetM ? chipsetM[1] : null,
    bios_version: "Unknown",
    bios_date: null,
  };
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildScanFromParts(parts: RawPart[]): SystemScan {
  const cpuPart = parts.find((p) => p.component === "cpu");
  const gpuPart = parts.find((p) => p.component === "video-card");

  if (!cpuPart) throw new Error("No CPU found in build list.");
  if (!gpuPart) throw new Error("No GPU (Video Card) found in build list.");

  const cpu = parseCPU(cpuPart.name);
  const gpu = parseGPU(gpuPart.name);
  const ram = parseRAM(parts);
  const storage = parseStorage(parts);
  const motherboard = parseMotherboard(parts);

  if (ram.total_gb === 0) throw new Error("No Memory found in build list.");

  // Put a placeholder storage entry if none found
  const finalStorage: StorageInfo[] =
    storage.length > 0
      ? storage
      : [
          {
            model: "Unknown Storage",
            type: "Unknown",
            capacity_gb: 0,
            used_gb: 0,
            free_gb: 0,
            interface: "Unknown",
            health_status: null,
            is_boot_drive: true,
          },
        ];

  return {
    scan_id: `pcpp-${slugId()}`,
    timestamp: new Date().toISOString(),
    scan_duration_seconds: 0,
    cpu,
    gpu,
    ram,
    storage: finalStorage,
    motherboard,
    os: {
      windows_version: "Unknown (Build Plan)",
      build_number: "0",
      is_up_to_date: null,
      power_plan: "Balanced",
      game_mode: null,
      hw_accelerated_gpu_scheduling: null,
      virtual_memory_gb: null,
    },
    network: {
      connection_type: "Unknown",
      speed_mbps: null,
      latency_ms: null,
    },
    bios_settings: {
      xmp_enabled: null,
      resizable_bar: null,
      tpm_status: null,
      virtualization: null,
      secure_boot: null,
    },
  };
}

// ─── HTML Parser (runs server-side) ──────────────────────────────────────────

/**
 * Parse the raw HTML of a PCPartPicker build page and return an array of parts.
 * Each part row has a `data-component` attribute and a product link inside `td.td__name`.
 */
export function parsePCPartPickerHTML(html: string): RawPart[] {
  const parts: RawPart[] = [];

  // Match each component row: <tr data-component="cpu" ...>
  const rowRegex =
    /<tr[^>]+data-component="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const component = rowMatch[1];
    const rowHtml = rowMatch[2];

    // Product name is inside <td class="td__name ..."><a ...>NAME</a>
    // Could also be in an <a class="...xs-col-12..."> link text
    const nameRegex =
      /<td[^>]+class="[^"]*td__name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i;
    const nameMatch = nameRegex.exec(rowHtml);

    if (nameMatch) {
      const raw = nameMatch[1]
        .replace(/<[^>]+>/g, "") // strip inner tags
        .replace(/\s+/g, " ")
        .trim();

      if (raw && raw.length > 2) {
        parts.push({ component, name: raw });
      }
    }
  }

  return parts;
}

// ─── URL Validator ────────────────────────────────────────────────────────────

export function isPCPartPickerURL(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "pcpartpicker.com" ||
        u.hostname.endsWith(".pcpartpicker.com")) &&
      (u.pathname.startsWith("/list/") || u.pathname.startsWith("/user/"))
    );
  } catch {
    return false;
  }
}
