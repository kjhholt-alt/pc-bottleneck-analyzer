// ─── Upgrade Compatibility Checker ───────────────────────────────────────────
//
// Analyzes the user's current system scan and returns compatibility checks
// relevant to a specific upgrade category.

import type { SystemScan, UpgradeCategory, CompatibilityCheck } from "@/lib/types";

// ─── Chipset → Socket Map ────────────────────────────────────────────────────

const CHIPSET_SOCKET: Record<string, string> = {
  // AMD AM5
  B650: "AM5", B650E: "AM5", X670: "AM5", X670E: "AM5",
  B850: "AM5", B850E: "AM5", X870: "AM5", X870E: "AM5",
  // AMD AM4
  B450: "AM4", X470: "AM4", B550: "AM4", X570: "AM4",
  A520: "AM4", B350: "AM4", X370: "AM4",
  // Intel LGA1851 (Arrow Lake)
  Z890: "LGA1851", B860: "LGA1851", H810: "LGA1851",
  // Intel LGA1700 (12th–14th gen)
  Z690: "LGA1700", B660: "LGA1700", H670: "LGA1700", H610: "LGA1700",
  Z790: "LGA1700", B760: "LGA1700", H770: "LGA1700",
  // Intel LGA1200 (10th–11th gen)
  Z490: "LGA1200", B460: "LGA1200", H470: "LGA1200", H410: "LGA1200",
  Z590: "LGA1200", B560: "LGA1200", H570: "LGA1200", H510: "LGA1200",
};

// ─── DDR Gen from Chipset ────────────────────────────────────────────────────

const DDR5_CHIPSETS = new Set([
  "B650", "B650E", "X670", "X670E", "B850", "B850E", "X870", "X870E",
  "Z690", "B660", "H670", "H610", "Z790", "B760", "H770",
  "Z890", "B860", "H810",
]);

// ─── GPU Power Requirements ──────────────────────────────────────────────────

function estimateGPUPower(gpuName: string): { wattage: number; connector: string } {
  const n = gpuName.toLowerCase();
  if (n.includes("5090") || n.includes("4090"))
    return { wattage: 750, connector: "16-pin 12VHPWR" };
  if (n.includes("5080") || n.includes("4080"))
    return { wattage: 700, connector: "16-pin 12VHPWR" };
  if (n.includes("5070 ti") || n.includes("4070 ti"))
    return { wattage: 650, connector: "1× 16-pin or 2× 8-pin" };
  if (n.includes("7900"))
    return { wattage: 700, connector: "2× 8-pin" };
  if (n.includes("5070") || n.includes("4070") || n.includes("7800"))
    return { wattage: 550, connector: "1× 8-pin" };
  if (n.includes("4060") || n.includes("7600") || n.includes("5060"))
    return { wattage: 450, connector: "1× 8-pin" };
  if (n.includes("3090") || n.includes("3080"))
    return { wattage: 750, connector: "2× 8-pin (or 3× for FE)" };
  if (n.includes("3070"))
    return { wattage: 550, connector: "1× 8-pin (or 2× for FE)" };
  if (n.includes("3060"))
    return { wattage: 450, connector: "1× 8-pin" };
  // Default mid-range
  return { wattage: 500, connector: "1× 8-pin" };
}

// ─── Main Checker ────────────────────────────────────────────────────────────

export function checkCompatibility(
  scan: SystemScan,
  category: UpgradeCategory,
  targetHardwareName?: string,
): CompatibilityCheck[] {
  switch (category) {
    case "cpu":
      return checkCPUCompat(scan);
    case "gpu":
      return checkGPUCompat(scan, targetHardwareName);
    case "ram":
      return checkRAMCompat(scan);
    case "storage":
      return checkStorageCompat(scan);
  }
}

// ─── CPU Checks ──────────────────────────────────────────────────────────────

function checkCPUCompat(scan: SystemScan): CompatibilityCheck[] {
  const checks: CompatibilityCheck[] = [];
  const chipset = scan.motherboard.chipset?.replace(/[^A-Za-z0-9]/g, "").toUpperCase() ?? "";

  // Socket detection
  const socket = resolveSocket(chipset);
  if (socket) {
    checks.push({
      id: "cpu-socket",
      status: "ok",
      title: `Socket: ${socket}`,
      description: `Your ${scan.motherboard.model} uses a ${chipset} chipset (${socket} socket). Make sure your new CPU matches this socket.`,
    });
  } else {
    checks.push({
      id: "cpu-socket",
      status: "unknown",
      title: "Socket: Could not detect",
      description: `Could not determine socket type from chipset "${scan.motherboard.chipset ?? "unknown"}". Check your motherboard's spec page to find the socket type before buying a CPU.`,
    });
  }

  // BIOS update warning
  checks.push({
    id: "cpu-bios-update",
    status: "warning",
    title: "BIOS update may be required",
    description: "Newer CPUs on the same socket sometimes need a BIOS update. Check your motherboard's CPU support list on the manufacturer's website before purchasing.",
  });

  // Cooler bracket
  checks.push({
    id: "cpu-cooler",
    status: "warning",
    title: "Check cooler compatibility",
    description: "If switching between Intel and AMD (or between socket generations), your existing cooler may need a different mounting bracket. Most cooler manufacturers offer free bracket kits.",
  });

  return checks;
}

// ─── GPU Checks ──────────────────────────────────────────────────────────────

function checkGPUCompat(scan: SystemScan, targetName?: string): CompatibilityCheck[] {
  const checks: CompatibilityCheck[] = [];

  // PCIe generation
  const pcie = scan.gpu.pcie_generation;
  if (pcie !== null && pcie <= 3) {
    checks.push({
      id: "gpu-pcie",
      status: "warning",
      title: `PCIe Gen ${pcie} detected`,
      description: `Your current system runs PCIe Gen ${pcie}. Newer GPUs are designed for Gen 4/5 but are fully backward compatible. You may lose 1-3% performance on PCIe 3.0 with very high-end GPUs — negligible for most cards.`,
    });
  } else {
    checks.push({
      id: "gpu-pcie",
      status: "ok",
      title: `PCIe Gen ${pcie ?? "4+"} — compatible`,
      description: "Your PCIe slot is modern enough for any current GPU.",
    });
  }

  // PSU & power connectors
  if (targetName) {
    const power = estimateGPUPower(targetName);
    checks.push({
      id: "gpu-psu",
      status: "warning",
      title: `Recommended PSU: ${power.wattage}W+`,
      description: `The ${targetName} recommends a ${power.wattage}W PSU with ${power.connector} connector(s). Check your PSU label to verify wattage and available connectors.`,
    });
  } else {
    checks.push({
      id: "gpu-psu",
      status: "warning",
      title: "Check PSU wattage",
      description: "Verify your power supply has enough wattage and the right PCIe power connectors for your target GPU. Check the GPU's product page for recommended PSU wattage.",
    });
  }

  // Physical size
  checks.push({
    id: "gpu-size",
    status: "warning",
    title: "Measure case clearance",
    description: "Modern GPUs can be 300-350mm long and 2.5-3.5 slots thick. Measure the distance from your PCIe slot to the front of your case. Check the GPU's dimensions on its product page.",
  });

  return checks;
}

// ─── RAM Checks ──────────────────────────────────────────────────────────────

function checkRAMCompat(scan: SystemScan): CompatibilityCheck[] {
  const checks: CompatibilityCheck[] = [];

  // DDR generation
  const currentDDR = scan.ram.form_factor.toLowerCase();
  const isDDR5 = currentDDR.includes("ddr5");
  const isDDR4 = currentDDR.includes("ddr4");

  if (isDDR5) {
    checks.push({
      id: "ram-ddr",
      status: "ok",
      title: "DDR5 system — buy DDR5 RAM",
      description: "Your system uses DDR5 memory. Only DDR5 sticks are compatible. DDR4 will not physically fit in DDR5 slots.",
    });
  } else if (isDDR4) {
    checks.push({
      id: "ram-ddr",
      status: "ok",
      title: "DDR4 system — buy DDR4 RAM",
      description: "Your system uses DDR4 memory. Only DDR4 sticks are compatible. Do not buy DDR5 — it will not fit.",
    });
  } else {
    checks.push({
      id: "ram-ddr",
      status: "unknown",
      title: "DDR generation unclear",
      description: `Your RAM reports as "${scan.ram.form_factor}". Check your motherboard specs to confirm DDR4 or DDR5 before purchasing.`,
    });
  }

  // Slot availability
  const freeSlots = scan.ram.num_slots - scan.ram.num_sticks;
  if (freeSlots > 0) {
    checks.push({
      id: "ram-slots",
      status: "ok",
      title: `${freeSlots} empty RAM slot${freeSlots > 1 ? "s" : ""} available`,
      description: `You have ${scan.ram.num_sticks} of ${scan.ram.num_slots} RAM slots in use. You can add ${freeSlots} more stick${freeSlots > 1 ? "s" : ""} without removing any.`,
    });
  } else {
    checks.push({
      id: "ram-slots",
      status: "warning",
      title: "All RAM slots are full",
      description: `All ${scan.ram.num_slots} RAM slots are occupied (${scan.ram.num_sticks} sticks). To upgrade, you'll need to replace existing sticks with higher-capacity ones.`,
    });
  }

  // Current speed
  checks.push({
    id: "ram-speed",
    status: "ok",
    title: `Current speed: ${scan.ram.speed_mhz} MHz`,
    description: `Your RAM is running at ${scan.ram.speed_mhz} MHz. When adding sticks, match this speed or faster. If mixing speeds, all sticks will run at the slowest stick's speed.`,
  });

  return checks;
}

// ─── Storage Checks ──────────────────────────────────────────────────────────

function checkStorageCompat(scan: SystemScan): CompatibilityCheck[] {
  const checks: CompatibilityCheck[] = [];

  // Check for existing NVMe drives to infer M.2 slot usage
  const nvmeDrives = scan.storage.filter((d) => d.type === "NVMe SSD");
  const sataDrives = scan.storage.filter((d) => d.type === "SATA SSD" || d.type === "HDD");

  if (nvmeDrives.length === 0) {
    checks.push({
      id: "stor-m2",
      status: "ok",
      title: "No M.2 drives detected — slot likely free",
      description: "You don't currently have an NVMe drive. Your motherboard likely has at least one free M.2 slot. An NVMe SSD would be a great addition.",
    });
  } else if (nvmeDrives.length === 1) {
    checks.push({
      id: "stor-m2",
      status: "ok",
      title: "1 M.2 drive installed",
      description: `You have 1 NVMe drive (${nvmeDrives[0].model}). Most motherboards have 2-3 M.2 slots, so you likely have room for another.`,
    });
  } else {
    checks.push({
      id: "stor-m2",
      status: "warning",
      title: `${nvmeDrives.length} M.2 drives installed`,
      description: `You already have ${nvmeDrives.length} NVMe drives. Check if your motherboard has additional M.2 slots available. If not, consider a SATA SSD or replacing an existing drive.`,
    });
  }

  // Boot drive status
  const bootDrive = scan.storage.find((d) => d.is_boot_drive);
  if (bootDrive && bootDrive.type === "HDD") {
    checks.push({
      id: "stor-boot-hdd",
      status: "warning",
      title: "Boot drive is an HDD",
      description: "Your Windows installation is on a hard drive. Moving it to an SSD is the single biggest quality-of-life upgrade you can make. Plan to either clone or fresh install Windows on the new drive.",
    });
  } else if (bootDrive && bootDrive.type === "SATA SSD") {
    checks.push({
      id: "stor-boot-sata",
      status: "ok",
      title: "Boot drive is a SATA SSD",
      description: "You're already on an SSD. Upgrading to NVMe will improve load times but the difference is less dramatic than HDD → SSD. Still worth it if you have a free M.2 slot.",
    });
  } else if (bootDrive && bootDrive.type === "NVMe SSD") {
    checks.push({
      id: "stor-boot-nvme",
      status: "ok",
      title: "Boot drive is already NVMe",
      description: "Your Windows drive is already NVMe — nice. If adding storage for games, another NVMe or SATA SSD both work great.",
    });
  }

  // SATA availability
  if (sataDrives.length > 0) {
    checks.push({
      id: "stor-sata",
      status: "ok",
      title: `${sataDrives.length} SATA drive${sataDrives.length > 1 ? "s" : ""} connected`,
      description: "Most motherboards have 4-6 SATA ports. You likely have room for more SATA devices. Note: some M.2 slots share bandwidth with SATA ports — check your manual.",
    });
  }

  return checks;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveSocket(chipset: string): string | null {
  // Try exact match first
  if (CHIPSET_SOCKET[chipset]) return CHIPSET_SOCKET[chipset];

  // Try removing trailing suffixes (E, X, etc.)
  const base = chipset.replace(/[EX]$/, "");
  if (CHIPSET_SOCKET[base]) return CHIPSET_SOCKET[base];

  return null;
}
