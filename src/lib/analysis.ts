import type {
  SystemScan,
  AnalysisResult,
  Bottleneck,
  Recommendation,
  PerformanceScore,
  Severity,
} from "@/lib/types";
import {
  lookupCPU,
  lookupGPU,
  tierIndex,
  getUpgrades,
  cpuDatabase,
  gpuDatabase,
} from "@/data/hardware-db";

// ─── Main Entry Point ────────────────────────────────────────────────────────

export function analyzeScan(scan: SystemScan): AnalysisResult {
  const bottlenecks: Bottleneck[] = [];
  const recommendations: Recommendation[] = [];

  const cpuEntry = lookupCPU(scan.cpu.model_name);
  const gpuEntry = lookupGPU(scan.gpu.model_name);

  // Run all detection rules
  detectCPUBottlenecks(scan, bottlenecks, cpuEntry, gpuEntry);
  detectGPUBottlenecks(scan, bottlenecks, cpuEntry, gpuEntry);
  detectRAMBottlenecks(scan, bottlenecks);
  detectStorageBottlenecks(scan, bottlenecks);
  detectThermalBottlenecks(scan, bottlenecks);
  detectSettingsBottlenecks(scan, bottlenecks);

  // Build recommendations from the bottlenecks we found
  buildRecommendations(scan, bottlenecks, recommendations, cpuEntry, gpuEntry);

  // Sort: critical first, then warning, info, good
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    good: 3,
  };
  bottlenecks.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  // Sort recommendations: free first, then cheap, then upgrade; within tiers, by priority
  const tierOrder: Record<string, number> = { free: 0, cheap: 1, upgrade: 2 };
  recommendations.sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.priority - b.priority;
  });

  const score = calculateScore(scan, bottlenecks, cpuEntry, gpuEntry);

  return { score, bottlenecks, recommendations };
}

// ─── CPU Bottleneck Detection ────────────────────────────────────────────────

function detectCPUBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
  cpuEntry: ReturnType<typeof lookupCPU>,
  gpuEntry: ReturnType<typeof lookupGPU>,
): void {
  const avgCpuUsage = average(scan.cpu.usage_per_core);
  const gpuUtil = scan.gpu.gpu_utilization_pct;

  // High CPU usage + low GPU usage = CPU-bound
  if (avgCpuUsage > 90 && gpuUtil < 60) {
    bottlenecks.push({
      id: "cpu-high-usage",
      category: "cpu",
      severity: "critical",
      title: "CPU Bottleneck Detected",
      description:
        `Your CPU is running at ${Math.round(avgCpuUsage)}% average utilization ` +
        `while your GPU is only at ${gpuUtil}%. Your processor can't keep up ` +
        `with your graphics card, which means your GPU is sitting idle waiting for work.`,
      impact:
        "You could be losing 20-40% of your potential frame rate in CPU-heavy games.",
      fix:
        "Close background applications, lower CPU-intensive settings (draw distance, " +
        "NPC counts, physics), or consider a CPU upgrade.",
      difficulty: "Medium",
      estimated_cost: "$0 - $400",
    });
  } else if (avgCpuUsage > 80 && gpuUtil < 70) {
    bottlenecks.push({
      id: "cpu-moderate-usage",
      category: "cpu",
      severity: "warning",
      title: "CPU Running Hot on Utilization",
      description:
        `Your CPU is averaging ${Math.round(avgCpuUsage)}% usage while your GPU ` +
        `sits at ${gpuUtil}%. This suggests your CPU is struggling to keep your GPU fully fed.`,
      impact: "You might see occasional stutters or frame drops in demanding scenes.",
      fix: "Try closing browser tabs and background apps. Disable unnecessary startup programs.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // Tier mismatch: CPU much weaker than GPU
  if (cpuEntry && gpuEntry) {
    const cpuTier = tierIndex(cpuEntry.tier);
    const gpuTier = tierIndex(gpuEntry.tier);
    if (gpuTier - cpuTier >= 2) {
      bottlenecks.push({
        id: "cpu-gpu-tier-mismatch",
        category: "cpu",
        severity: "warning",
        title: "CPU/GPU Tier Mismatch",
        description:
          `Your ${cpuEntry.name} is ${gpuTier - cpuTier} performance tier(s) ` +
          `below your ${gpuEntry.name}. Your CPU is holding back your graphics card.`,
        impact:
          "Your GPU can't reach its full potential, especially at lower resolutions " +
          "where the CPU matters more.",
        fix: `Consider upgrading to a CPU in the "${gpuEntry.tier}" tier to match your GPU.`,
        difficulty: "Hard",
        estimated_cost: "$200 - $500+",
      });
    }
  }

  // CPU not boosting to expected clocks
  if (
    scan.cpu.current_clock_ghz > 0 &&
    scan.cpu.max_boost_clock_ghz > 0 &&
    scan.cpu.current_clock_ghz < scan.cpu.max_boost_clock_ghz * 0.85 &&
    avgCpuUsage > 50
  ) {
    bottlenecks.push({
      id: "cpu-not-boosting",
      category: "cpu",
      severity: "warning",
      title: "CPU Not Reaching Boost Clocks",
      description:
        `Your CPU is running at ${scan.cpu.current_clock_ghz.toFixed(2)} GHz but should ` +
        `be boosting up to ${scan.cpu.max_boost_clock_ghz} GHz. Something is preventing ` +
        `it from reaching full speed.`,
      impact: "You are leaving 5-15% performance on the table.",
      fix:
        "Check your power plan (set to High Performance), ensure adequate cooling, " +
        "and verify no power limits are set in BIOS.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }
}

// ─── GPU Bottleneck Detection ────────────────────────────────────────────────

function detectGPUBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
  cpuEntry: ReturnType<typeof lookupCPU>,
  gpuEntry: ReturnType<typeof lookupGPU>,
): void {
  const avgCpuUsage = average(scan.cpu.usage_per_core);
  const gpuUtil = scan.gpu.gpu_utilization_pct;

  // GPU pegged while CPU is relaxed — this is generally good for gaming
  if (gpuUtil > 95 && avgCpuUsage < 60) {
    bottlenecks.push({
      id: "gpu-limited",
      category: "gpu",
      severity: "info",
      title: "GPU-Limited (Working as Intended)",
      description:
        `Your GPU is running at ${gpuUtil}% utilization while your CPU is only at ` +
        `${Math.round(avgCpuUsage)}%. This is actually the ideal scenario for gaming ` +
        `— your GPU is the limiting factor, not your CPU.`,
      impact:
        "To get more FPS, you would need a faster GPU or lower graphical settings.",
      fix:
        "No fix needed. If you want more frames, lower resolution/quality settings " +
        "or consider a GPU upgrade.",
      difficulty: "Easy",
      estimated_cost: "$0 - $800+",
    });
  }

  // VRAM nearly full
  if (
    scan.gpu.vram_total_gb > 0 &&
    scan.gpu.vram_used_gb / scan.gpu.vram_total_gb > 0.9
  ) {
    bottlenecks.push({
      id: "gpu-vram-full",
      category: "gpu",
      severity: "warning",
      title: "VRAM Nearly Full",
      description:
        `You're using ${scan.gpu.vram_used_gb.toFixed(1)} GB out of ` +
        `${scan.gpu.vram_total_gb} GB VRAM (${Math.round((scan.gpu.vram_used_gb / scan.gpu.vram_total_gb) * 100)}%). ` +
        `When VRAM overflows, textures get swapped to system RAM which causes massive stutters.`,
      impact: "Expect stuttering and texture pop-in at current settings.",
      fix:
        "Lower texture quality, reduce resolution scale, or close other GPU-using apps. " +
        "A GPU with more VRAM would eliminate this issue.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // Tier mismatch: GPU much weaker than CPU
  if (cpuEntry && gpuEntry) {
    const cpuTier = tierIndex(cpuEntry.tier);
    const gpuTier = tierIndex(gpuEntry.tier);
    if (cpuTier - gpuTier >= 2) {
      bottlenecks.push({
        id: "gpu-cpu-tier-mismatch",
        category: "gpu",
        severity: "warning",
        title: "GPU Holding Back Your CPU",
        description:
          `Your ${gpuEntry.name} is ${cpuTier - gpuTier} tier(s) below your ` +
          `${cpuEntry.name}. Your powerful CPU is being wasted because your GPU ` +
          `can't render frames fast enough.`,
        impact: "A GPU upgrade would give you the biggest FPS improvement.",
        fix: `Upgrade to a GPU in the "${cpuEntry.tier}" tier to match your CPU.`,
        difficulty: "Hard",
        estimated_cost: "$300 - $800+",
      });
    }
  }
}

// ─── RAM Bottleneck Detection ────────────────────────────────────────────────

function detectRAMBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
): void {
  // Single-channel RAM
  if (scan.ram.channel_mode === "single") {
    bottlenecks.push({
      id: "ram-single-channel",
      category: "ram",
      severity: "critical",
      title: "Single-Channel RAM — Huge Performance Loss",
      description:
        "You're running your RAM in single-channel mode. This literally cuts your memory " +
        "bandwidth in half. On AMD Ryzen CPUs especially, this can cost you 20-30% FPS.",
      impact: "Massive. This is one of the biggest easy-to-fix performance killers.",
      fix:
        "Install a second RAM stick in the correct slot (check your motherboard manual " +
        "for which slots to use — usually slots 2 and 4). Make sure both sticks match in " +
        "speed and capacity.",
      difficulty: "Medium",
      estimated_cost: "$25 - $60",
    });
  }

  // Low total RAM
  if (scan.ram.total_gb < 16) {
    bottlenecks.push({
      id: "ram-low-capacity",
      category: "ram",
      severity: "warning",
      title: "Low RAM Capacity",
      description:
        `You only have ${scan.ram.total_gb} GB of RAM. Modern games regularly use 12-16 GB, ` +
        `and having Chrome open alongside a game can easily push you over the limit.`,
      impact: "Games may stutter or crash when RAM is exhausted. Windows will use slow disk swap.",
      fix: "Upgrade to at least 16 GB (32 GB is ideal for 2025+).",
      difficulty: "Medium",
      estimated_cost: "$30 - $80",
    });
  }

  // High RAM usage
  if (scan.ram.usage_percent > 85) {
    bottlenecks.push({
      id: "ram-high-usage",
      category: "ram",
      severity: "warning",
      title: "RAM Usage Is Very High",
      description:
        `You're using ${scan.ram.usage_percent}% of your RAM ` +
        `(${scan.ram.current_used_gb.toFixed(1)} / ${scan.ram.total_gb} GB). ` +
        `When you run out, Windows starts using your disk as overflow memory, ` +
        `which is orders of magnitude slower.`,
      impact: "Stutters, freezes, and potential crashes in memory-heavy workloads.",
      fix: "Close unnecessary background programs. If this happens regularly, add more RAM.",
      difficulty: "Easy",
      estimated_cost: "$0 - $60",
    });
  }

  // Slow RAM speed (likely XMP off)
  const isDDR4 = scan.ram.form_factor.toLowerCase().includes("ddr4");
  const isDDR5 = scan.ram.form_factor.toLowerCase().includes("ddr5");

  if (isDDR4 && scan.ram.speed_mhz < 3000) {
    bottlenecks.push({
      id: "ram-slow-speed",
      category: "ram",
      severity: "critical",
      title: "RAM Running Way Below Rated Speed — XMP Probably Off!",
      description:
        `Your DDR4 RAM is running at ${scan.ram.speed_mhz} MHz. Most DDR4 kits are ` +
        `rated for 3200-3600 MHz, but they default to a slow 2133 MHz unless you enable ` +
        `XMP/DOCP in your BIOS. This is the single most common free performance fix.`,
      impact:
        "You're losing 10-20% FPS in games, especially on AMD Ryzen CPUs where the " +
        "Infinity Fabric speed is tied to RAM speed.",
      fix:
        "Restart your PC, enter BIOS (usually Delete or F2 at boot), find the XMP or " +
        "DOCP setting, and enable it. It's one toggle and takes 30 seconds. This is " +
        "genuinely free performance you paid for but aren't getting.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  if (isDDR5 && scan.ram.speed_mhz < 4800) {
    bottlenecks.push({
      id: "ram-slow-speed-ddr5",
      category: "ram",
      severity: "critical",
      title: "DDR5 Running Below Base Speed — Check BIOS",
      description:
        `Your DDR5 RAM is clocked at ${scan.ram.speed_mhz} MHz. DDR5 base spec starts ` +
        `at 4800 MHz, and most kits are rated for 5600-6000+ MHz with XMP/EXPO enabled.`,
      impact: "Significant performance left on the table, especially in CPU-limited scenarios.",
      fix: "Enable XMP or EXPO in your BIOS to run your RAM at its rated speed.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }
}

// ─── Storage Bottleneck Detection ────────────────────────────────────────────

function detectStorageBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
): void {
  const bootDrive = scan.storage.find((d) => d.is_boot_drive);

  // Boot drive is HDD
  if (bootDrive && bootDrive.type === "HDD") {
    bottlenecks.push({
      id: "storage-hdd-boot",
      category: "storage",
      severity: "critical",
      title: "Windows Is Running on a Hard Drive",
      description:
        "Your operating system is installed on a mechanical hard drive. This is the " +
        "single biggest thing slowing down your everyday PC experience. Boot times, " +
        "app launches, and game loading will all be painfully slow.",
      impact:
        "Everything feels sluggish. Boot time is 2-5x longer. Game load times can be " +
        "3-10x slower compared to an SSD.",
      fix:
        "Install a SATA SSD ($25-50 for 500 GB) or NVMe SSD ($40-70 for 1 TB) and " +
        "clone or reinstall Windows on it. This is the single best upgrade for perceived speed.",
      difficulty: "Medium",
      estimated_cost: "$25 - $70",
    });
  }

  // Boot drive running low on space
  if (bootDrive && bootDrive.capacity_gb > 0) {
    const usagePct = bootDrive.used_gb / bootDrive.capacity_gb;
    if (usagePct > 0.9) {
      bottlenecks.push({
        id: "storage-boot-almost-full",
        category: "storage",
        severity: "warning",
        title: "Boot Drive Almost Full",
        description:
          `Your boot drive only has ${bootDrive.free_gb} GB free out of ` +
          `${bootDrive.capacity_gb} GB. Windows needs free space for virtual memory, ` +
          `updates, and temp files. SSDs also slow down significantly when nearly full.`,
        impact: "System slowdowns, failed Windows updates, and potential crashes.",
        fix: "Free up space by moving games/files to another drive, running Disk Cleanup, or upgrading to a larger drive.",
        difficulty: "Easy",
        estimated_cost: "$0 - $80",
      });
    } else if (usagePct > 0.8) {
      bottlenecks.push({
        id: "storage-boot-getting-full",
        category: "storage",
        severity: "info",
        title: "Boot Drive Getting Full",
        description:
          `Your boot drive has ${bootDrive.free_gb} GB free. Consider keeping at ` +
          `least 20% free for optimal performance.`,
        impact: "Minor performance degradation as the drive fills up.",
        fix: "Move large files and games to a secondary drive.",
        difficulty: "Easy",
        estimated_cost: "$0",
      });
    }
  }

  // No NVMe drive at all
  const hasNVMe = scan.storage.some((d) => d.type === "NVMe SSD");
  if (!hasNVMe) {
    bottlenecks.push({
      id: "storage-no-nvme",
      category: "storage",
      severity: "info",
      title: "No NVMe SSD Detected",
      description:
        "You don't have an NVMe drive. While SATA SSDs are fine for most tasks, " +
        "NVMe drives are 3-7x faster for sequential reads and noticeably speed up " +
        "game loading with DirectStorage.",
      impact: "Slightly longer load times compared to NVMe.",
      fix: "An NVMe SSD is a nice upgrade but not urgent if you already have a SATA SSD.",
      difficulty: "Medium",
      estimated_cost: "$40 - $100",
    });
  }

  // Check for unhealthy drives
  for (const drive of scan.storage) {
    if (
      drive.health_status &&
      !["good", "ok", "healthy"].includes(drive.health_status.toLowerCase())
    ) {
      bottlenecks.push({
        id: `storage-health-${drive.model.replace(/\s+/g, "-").toLowerCase()}`,
        category: "storage",
        severity: "critical",
        title: `Drive Health Warning: ${drive.model}`,
        description:
          `Your ${drive.model} is reporting health status: "${drive.health_status}". ` +
          `This drive may be failing. Back up your data immediately.`,
        impact: "Risk of data loss if the drive fails.",
        fix: "Back up all important data NOW and replace the drive as soon as possible.",
        difficulty: "Medium",
        estimated_cost: "$40 - $150",
      });
    }
  }
}

// ─── Thermal Bottleneck Detection ────────────────────────────────────────────

function detectThermalBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
): void {
  const cpuTemp = scan.cpu.current_temp_c;
  const gpuTemp = scan.gpu.current_temp_c;

  if (cpuTemp !== null) {
    if (cpuTemp > 85) {
      bottlenecks.push({
        id: "thermal-cpu-critical",
        category: "thermal",
        severity: "critical",
        title: "CPU Thermal Throttling",
        description:
          `Your CPU is at ${cpuTemp}°C, which is in the thermal throttling zone. ` +
          `When a CPU gets too hot, it automatically slows itself down to prevent ` +
          `damage. This means you're losing performance right now.`,
        impact: "Active performance loss. CPU is running below its potential.",
        fix:
          "Re-apply thermal paste (if it's been over 2 years), clean dust from heatsink " +
          "and fans, improve case airflow, or upgrade your CPU cooler.",
        difficulty: "Medium",
        estimated_cost: "$5 - $80",
      });
    } else if (cpuTemp > 75) {
      bottlenecks.push({
        id: "thermal-cpu-warm",
        category: "thermal",
        severity: "info",
        title: "CPU Temperature Is Warm",
        description:
          `Your CPU is at ${cpuTemp}°C. Not critical, but getting warm. ` +
          `Under sustained heavy loads, it might start throttling.`,
        impact: "No immediate impact, but limited thermal headroom for boost clocks.",
        fix: "Clean dust filters, ensure good case airflow, consider adding a case fan.",
        difficulty: "Easy",
        estimated_cost: "$0 - $20",
      });
    }
  }

  if (gpuTemp !== null) {
    if (gpuTemp > 85) {
      bottlenecks.push({
        id: "thermal-gpu-hot",
        category: "thermal",
        severity: "warning",
        title: "GPU Running Hot",
        description:
          `Your GPU is at ${gpuTemp}°C. Most GPUs start throttling around 83-90°C. ` +
          `The card is likely reducing its clock speeds to stay within safe limits.`,
        impact: "GPU boost clocks are reduced, costing you FPS.",
        fix:
          "Improve case airflow, set a more aggressive fan curve in MSI Afterburner, " +
          "or re-paste the GPU thermal compound (advanced).",
        difficulty: "Medium",
        estimated_cost: "$0 - $15",
      });
    } else if (gpuTemp > 80) {
      bottlenecks.push({
        id: "thermal-gpu-warm",
        category: "thermal",
        severity: "info",
        title: "GPU Temperature Getting Warm",
        description:
          `Your GPU is at ${gpuTemp}°C. It's within spec but on the warmer side. ` +
          `A bit more airflow could help maintain higher boost clocks.`,
        impact: "Minor — the card may not sustain its highest boost clock.",
        fix: "Add a case fan or adjust your GPU fan curve.",
        difficulty: "Easy",
        estimated_cost: "$0 - $20",
      });
    }
  }
}

// ─── Settings Bottleneck Detection ───────────────────────────────────────────

function detectSettingsBottlenecks(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
): void {
  // Power plan
  const powerPlan = scan.os.power_plan.toLowerCase();
  if (
    !powerPlan.includes("high performance") &&
    !powerPlan.includes("ultimate")
  ) {
    bottlenecks.push({
      id: "settings-power-plan",
      category: "settings",
      severity: "warning",
      title: `Power Plan Set to "${scan.os.power_plan}"`,
      description:
        `Your Windows power plan is set to "${scan.os.power_plan}". The Balanced ` +
        `plan throttles your CPU to save power, which is great for laptops on battery ` +
        `but costs you performance on a desktop.`,
      impact: "5-10% performance loss in some games due to slower CPU response times.",
      fix:
        'Open Windows Settings > System > Power > set to "High Performance". ' +
        "On desktops, there's no downside to this.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // XMP / DOCP
  if (scan.bios_settings.xmp_enabled === false) {
    bottlenecks.push({
      id: "settings-xmp-off",
      category: "settings",
      severity: "critical",
      title: "XMP/DOCP Is Disabled — Free Performance Waiting!",
      description:
        "XMP (Intel) or DOCP (AMD) is not enabled in your BIOS. Your RAM kit is " +
        "rated for higher speeds, but without this profile enabled, it runs at the " +
        "slow default JEDEC speed. This is the #1 most common free performance fix.",
      impact:
        "10-20% FPS loss in games. Even bigger impact on AMD Ryzen systems where " +
        "the Infinity Fabric clock is linked to memory speed.",
      fix:
        "Restart → enter BIOS (Del or F2) → find XMP/DOCP/EXPO → Enable → Save & Exit. " +
        "Takes 30 seconds. You already paid for this speed.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // Resizable BAR
  if (scan.bios_settings.resizable_bar === false) {
    bottlenecks.push({
      id: "settings-rebar-off",
      category: "settings",
      severity: "info",
      title: "Resizable BAR Is Disabled",
      description:
        "Resizable BAR (AMD SAM) lets your CPU access the full GPU VRAM at once " +
        "instead of in small 256 MB chunks. It's a free BIOS toggle that helps in some games.",
      impact: "0-10% FPS improvement depending on the game. Some titles see no difference.",
      fix:
        "Enable in BIOS (look for Resizable BAR, Above 4G Decoding, or AMD SAM). " +
        "Also make sure it's enabled in your GPU driver.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // GPU scheduling
  if (scan.os.hw_accelerated_gpu_scheduling === false) {
    bottlenecks.push({
      id: "settings-gpu-scheduling",
      category: "settings",
      severity: "info",
      title: "Hardware-Accelerated GPU Scheduling Is Off",
      description:
        "This Windows feature lets your GPU manage its own memory scheduling, " +
        "reducing CPU overhead and potentially lowering input latency.",
      impact: "Small improvement in input latency and minor FPS gains in some games.",
      fix:
        "Settings > System > Display > Graphics > Change default graphics settings > " +
        "Turn on Hardware-Accelerated GPU Scheduling. Requires a restart.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }

  // Game Mode already on is good — flag if off
  if (scan.os.game_mode === false) {
    bottlenecks.push({
      id: "settings-game-mode-off",
      category: "settings",
      severity: "info",
      title: "Windows Game Mode Is Disabled",
      description:
        "Game Mode prevents Windows Update from installing drivers and blocks " +
        "restart notifications during games. It also helps allocate resources to your game.",
      impact: "Minor. Prevents annoying interruptions and provides slight prioritization.",
      fix: "Settings > Gaming > Game Mode > Turn on.",
      difficulty: "Easy",
      estimated_cost: "$0",
    });
  }
}

// ─── Recommendation Builder ──────────────────────────────────────────────────

function buildRecommendations(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
  recommendations: Recommendation[],
  cpuEntry: ReturnType<typeof lookupCPU>,
  gpuEntry: ReturnType<typeof lookupGPU>,
): void {
  let priority = 1;
  const hasCritical = (id: string) =>
    bottlenecks.some((b) => b.id === id && b.severity === "critical");
  const has = (id: string) => bottlenecks.some((b) => b.id === id);

  // ── Free Fixes ───────────────────────────────────────────────────────────

  if (has("settings-xmp-off") || hasCritical("ram-slow-speed") || hasCritical("ram-slow-speed-ddr5")) {
    recommendations.push({
      id: "rec-enable-xmp",
      tier: "free",
      title: "Enable XMP/DOCP in BIOS",
      description:
        "This is the single biggest free performance boost available. Your RAM is running " +
        "way below its rated speed. Enter BIOS at boot, enable XMP (Intel) or DOCP/EXPO " +
        "(AMD), and enjoy 10-20% more FPS instantly.",
      impact: "+10-20% FPS in games, faster app loading, snappier overall feel",
      estimated_cost: "$0",
      priority: priority++,
    });
  }

  if (has("settings-power-plan")) {
    recommendations.push({
      id: "rec-power-plan",
      tier: "free",
      title: "Switch to High Performance Power Plan",
      description:
        "Your CPU is being held back by the Balanced power plan. Switch to High Performance " +
        "in Windows power settings to let your CPU run at full speed whenever it needs to.",
      impact: "+5-10% FPS in CPU-limited scenarios, snappier system response",
      estimated_cost: "$0",
      priority: priority++,
    });
  }

  if (has("settings-rebar-off")) {
    recommendations.push({
      id: "rec-enable-rebar",
      tier: "free",
      title: "Enable Resizable BAR in BIOS",
      description:
        "Turn on Resizable BAR (or AMD SAM) in your BIOS. This lets the CPU access " +
        "your full GPU VRAM at once. Free toggle, helps in many newer games.",
      impact: "+0-10% FPS depending on the game",
      estimated_cost: "$0",
      priority: priority++,
    });
  }

  if (has("settings-gpu-scheduling")) {
    recommendations.push({
      id: "rec-gpu-scheduling",
      tier: "free",
      title: "Enable Hardware-Accelerated GPU Scheduling",
      description:
        "Turn on HAGS in Windows graphics settings. Reduces CPU overhead for GPU " +
        "scheduling and can lower input latency.",
      impact: "Lower input latency, minor FPS improvement",
      estimated_cost: "$0",
      priority: priority++,
    });
  }

  if (has("cpu-not-boosting")) {
    recommendations.push({
      id: "rec-check-boost",
      tier: "free",
      title: "Investigate Why CPU Isn't Boosting",
      description:
        "Your CPU isn't reaching its advertised boost clock. Check your power plan " +
        "(High Performance), ensure the CPU cooler is properly seated, and verify no " +
        "power limits are set in BIOS (like PBO or power limit throttling).",
      impact: "+5-15% in single-threaded workloads",
      estimated_cost: "$0",
      priority: priority++,
    });
  }

  // ── Cheap Fixes ($0-50) ──────────────────────────────────────────────────

  if (has("thermal-cpu-critical")) {
    recommendations.push({
      id: "rec-cpu-cooling",
      tier: "cheap",
      title: "Fix CPU Cooling",
      description:
        "Your CPU is thermal throttling. Start with re-applying thermal paste ($5-10), " +
        "cleaning dust from your heatsink, and ensuring all fans are working. If that " +
        "doesn't help, a better cooler like the Thermalright Peerless Assassin 120 ($35) " +
        "is one of the best value upgrades you can make.",
      impact: "Eliminates thermal throttling — could recover 10-20% lost performance",
      estimated_cost: "$5 - $45",
      priority: priority++,
    });
  }

  if (has("ram-single-channel")) {
    recommendations.push({
      id: "rec-second-ram-stick",
      tier: "cheap",
      title: "Add a Second RAM Stick for Dual-Channel",
      description:
        "Buy an identical stick to what you already have (same speed, capacity, and " +
        "ideally same model) and install it in the correct slot. This doubles your " +
        "memory bandwidth.",
      impact: "+20-30% FPS on AMD Ryzen, +10-15% on Intel",
      estimated_cost: "$25 - $60",
      priority: priority++,
    });
  }

  if (has("ram-low-capacity")) {
    recommendations.push({
      id: "rec-more-ram",
      tier: "cheap",
      title: "Upgrade to 16 GB+ RAM",
      description:
        "16 GB is the minimum for modern gaming. Consider a 2x8 GB DDR4-3600 kit " +
        "for around $35-50. Make sure to enable XMP after installing!",
      impact: "Eliminates RAM-related stutters and crashes",
      estimated_cost: "$35 - $50",
      priority: priority++,
    });
  }

  if (has("storage-hdd-boot")) {
    recommendations.push({
      id: "rec-ssd-boot",
      tier: "cheap",
      title: "Move Windows to an SSD",
      description:
        "This is hands down the most impactful upgrade for everyday PC speed. " +
        "A basic 500 GB SATA SSD is around $25, or a 1 TB NVMe like the WD SN580 " +
        "is around $50. Clone your existing drive or do a fresh Windows install.",
      impact: "Transformative. Everything feels 3-10x faster.",
      estimated_cost: "$25 - $60",
      priority: priority++,
    });
  }

  // ── Upgrade Recommendations ──────────────────────────────────────────────

  if (cpuEntry && (has("cpu-high-usage") || has("cpu-gpu-tier-mismatch"))) {
    const upgrades = getUpgrades(cpuEntry, cpuDatabase, 2);
    if (upgrades.length > 0) {
      const topPick = upgrades[0];
      const altPick = upgrades.length > 1 ? upgrades[1] : null;
      let desc =
        `Your ${cpuEntry.name} is holding back your system. The best value upgrade ` +
        `would be the ${topPick.name} (~$${topPick.current_price_approx}).`;
      if (altPick) {
        desc += ` If budget allows, the ${altPick.name} (~$${altPick.current_price_approx}) is also excellent.`;
      }
      desc += " Note: make sure the new CPU is compatible with your motherboard socket and chipset.";

      recommendations.push({
        id: "rec-cpu-upgrade",
        tier: "upgrade",
        title: "CPU Upgrade",
        description: desc,
        impact: "Major FPS improvement in CPU-limited games",
        estimated_cost: `$${Math.min(...upgrades.map((u) => u.current_price_approx))} - $${Math.max(...upgrades.map((u) => u.current_price_approx))}`,
        priority: priority++,
      });
    }
  }

  if (gpuEntry && (has("gpu-limited") || has("gpu-cpu-tier-mismatch"))) {
    const upgrades = getUpgrades(gpuEntry, gpuDatabase, 2);
    if (upgrades.length > 0) {
      const topPick = upgrades[0];
      const altPick = upgrades.length > 1 ? upgrades[1] : null;
      let desc =
        `For a meaningful jump in gaming performance, consider the ${topPick.name} ` +
        `(~$${topPick.current_price_approx}).`;
      if (altPick) {
        desc += ` The ${altPick.name} (~$${altPick.current_price_approx}) offers even more headroom.`;
      }

      recommendations.push({
        id: "rec-gpu-upgrade",
        tier: "upgrade",
        title: "GPU Upgrade",
        description: desc,
        impact: "The most direct way to increase gaming FPS",
        estimated_cost: `$${Math.min(...upgrades.map((u) => u.current_price_approx))} - $${Math.max(...upgrades.map((u) => u.current_price_approx))}`,
        priority: priority++,
      });
    }
  }
}

// ─── Performance Score Calculation ───────────────────────────────────────────

function calculateScore(
  scan: SystemScan,
  bottlenecks: Bottleneck[],
  cpuEntry: ReturnType<typeof lookupCPU>,
  gpuEntry: ReturnType<typeof lookupGPU>,
): PerformanceScore {
  let cpuScore = 25;
  let gpuScore = 25;
  let ramScore = 20;
  let storageScore = 15;
  let settingsScore = 15;

  // ── CPU Score (/25) ────────────────────────────────────────────────────

  // Base from tier
  if (cpuEntry) {
    const tierScores: Record<string, number> = {
      very_high: 22,
      high: 18,
      mid: 14,
      low: 10,
      very_low: 6,
    };
    cpuScore = tierScores[cpuEntry.tier] ?? 14;
  }

  // Thermal penalty
  if (scan.cpu.current_temp_c !== null && scan.cpu.current_temp_c > 85) {
    cpuScore -= 5;
  } else if (scan.cpu.current_temp_c !== null && scan.cpu.current_temp_c > 75) {
    cpuScore -= 2;
  }

  // Boost clock penalty
  if (
    scan.cpu.current_clock_ghz > 0 &&
    scan.cpu.max_boost_clock_ghz > 0 &&
    scan.cpu.current_clock_ghz < scan.cpu.max_boost_clock_ghz * 0.85
  ) {
    cpuScore -= 3;
  }

  cpuScore = clamp(cpuScore, 0, 25);

  // ── GPU Score (/25) ────────────────────────────────────────────────────

  if (gpuEntry) {
    const tierScores: Record<string, number> = {
      very_high: 22,
      high: 18,
      mid: 14,
      low: 10,
      very_low: 6,
    };
    gpuScore = tierScores[gpuEntry.tier] ?? 14;
  }

  // Thermal penalty
  if (scan.gpu.current_temp_c !== null && scan.gpu.current_temp_c > 85) {
    gpuScore -= 4;
  } else if (scan.gpu.current_temp_c !== null && scan.gpu.current_temp_c > 80) {
    gpuScore -= 2;
  }

  // VRAM pressure
  if (
    scan.gpu.vram_total_gb > 0 &&
    scan.gpu.vram_used_gb / scan.gpu.vram_total_gb > 0.9
  ) {
    gpuScore -= 3;
  }

  gpuScore = clamp(gpuScore, 0, 25);

  // ── RAM Score (/20) ────────────────────────────────────────────────────

  // Start with full marks and deduct
  ramScore = 20;

  // Speed check
  const isDDR4 = scan.ram.form_factor.toLowerCase().includes("ddr4");
  const isDDR5 = scan.ram.form_factor.toLowerCase().includes("ddr5");

  if (isDDR4 && scan.ram.speed_mhz < 3000) {
    ramScore -= 8; // Major penalty for running without XMP
  } else if (isDDR4 && scan.ram.speed_mhz < 3200) {
    ramScore -= 3;
  }

  if (isDDR5 && scan.ram.speed_mhz < 4800) {
    ramScore -= 8;
  } else if (isDDR5 && scan.ram.speed_mhz < 5600) {
    ramScore -= 3;
  }

  // Single channel
  if (scan.ram.channel_mode === "single") {
    ramScore -= 10;
  }

  // Capacity
  if (scan.ram.total_gb < 16) {
    ramScore -= 5;
  } else if (scan.ram.total_gb < 32) {
    ramScore -= 1;
  }

  // High usage
  if (scan.ram.usage_percent > 85) {
    ramScore -= 3;
  }

  ramScore = clamp(ramScore, 0, 20);

  // ── Storage Score (/15) ────────────────────────────────────────────────

  const bootDrive = scan.storage.find((d) => d.is_boot_drive);
  if (bootDrive) {
    if (bootDrive.type === "NVMe SSD") {
      storageScore = 15;
    } else if (bootDrive.type === "SATA SSD") {
      storageScore = 10;
    } else if (bootDrive.type === "HDD") {
      storageScore = 5;
    } else {
      storageScore = 8;
    }

    // Free space penalty
    if (bootDrive.capacity_gb > 0) {
      const usagePct = bootDrive.used_gb / bootDrive.capacity_gb;
      if (usagePct > 0.9) storageScore -= 3;
      else if (usagePct > 0.8) storageScore -= 1;
    }

    // Health penalty
    if (
      bootDrive.health_status &&
      !["good", "ok", "healthy"].includes(bootDrive.health_status.toLowerCase())
    ) {
      storageScore -= 5;
    }
  }

  storageScore = clamp(storageScore, 0, 15);

  // ── Settings Score (/15) ───────────────────────────────────────────────

  settingsScore = 0;

  // Power plan (3 pts)
  const plan = scan.os.power_plan.toLowerCase();
  if (plan.includes("ultimate")) {
    settingsScore += 3;
  } else if (plan.includes("high performance")) {
    settingsScore += 3;
  } else if (plan.includes("balanced")) {
    settingsScore += 1;
  }
  // Power saver = 0

  // XMP (5 pts) — the big one
  if (scan.bios_settings.xmp_enabled === true) {
    settingsScore += 5;
  } else if (scan.bios_settings.xmp_enabled === null) {
    settingsScore += 2; // Unknown, give partial credit
  }
  // false = 0

  // GPU drivers (2 pts) — we give credit if driver_version is present
  if (scan.gpu.driver_version && scan.gpu.driver_version.length > 0) {
    settingsScore += 2; // We can't verify version freshness without a DB, so partial
  }

  // Resizable BAR (2 pts)
  if (scan.bios_settings.resizable_bar === true) {
    settingsScore += 2;
  }

  // Game Mode (1 pt)
  if (scan.os.game_mode === true) {
    settingsScore += 1;
  }

  // HW-accelerated GPU scheduling (2 pts)
  if (scan.os.hw_accelerated_gpu_scheduling === true) {
    settingsScore += 2;
  }

  settingsScore = clamp(settingsScore, 0, 15);

  // ── Total & Grade ──────────────────────────────────────────────────────

  const total = cpuScore + gpuScore + ramScore + storageScore + settingsScore;
  const { grade, grade_description } = getGrade(total);

  return {
    total,
    grade,
    grade_description,
    breakdown: {
      cpu: cpuScore,
      gpu: gpuScore,
      ram: ramScore,
      storage: storageScore,
      settings: settingsScore,
    },
  };
}

// ─── Grading ─────────────────────────────────────────────────────────────────

function getGrade(total: number): {
  grade: string;
  grade_description: string;
} {
  if (total >= 90) {
    return {
      grade: "A",
      grade_description: "Your system is optimized. Nice work.",
    };
  }
  if (total >= 80) {
    return {
      grade: "A-",
      grade_description:
        "Great setup. A few tweaks could squeeze out more performance.",
    };
  }
  if (total >= 70) {
    return {
      grade: "B",
      grade_description:
        "Good, but you're leaving performance on the table.",
    };
  }
  if (total >= 60) {
    return {
      grade: "C",
      grade_description:
        "Several bottlenecks detected. Easy fixes available.",
    };
  }
  return {
    grade: "D",
    grade_description:
      "Significant issues found. Major free performance gains possible.",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
