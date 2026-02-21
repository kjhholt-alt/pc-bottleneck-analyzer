import type { AnalysisResult, SystemScan } from "@/lib/types";
import type { GameBenchmark, Resolution, QualityPreset } from "@/data/game-benchmarks";
import { estimateFPS } from "@/lib/fps-estimator";
import { simulateUpgrade, getCPUOptions, getGPUOptions } from "@/lib/simulate";

export interface PlannerTarget {
  game: GameBenchmark;
  resolution: Resolution;
  quality: QualityPreset;
  targetFps: number;
  maxBudget?: number;
}

export interface PlannerOptions {
  includeResaleCredit?: boolean;
  usedMarketDiscountPct?: number;
}

export interface UpgradePathStep {
  part: "gpu" | "cpu" | "platform";
  title: string;
  cost: number;
  reason: string;
  afterFps?: number;
}

export interface UpgradeMilestone {
  title: string;
  part: UpgradePathStep["part"];
  estimatedFps: number;
  cumulativeGrossCost: number;
  cumulativeNetCost: number;
}

export interface UpgradePath {
  id: string;
  label: string;
  type: "none" | "gpu" | "cpu" | "gpu+cpu";
  cpuName: string;
  gpuName: string;
  steps: UpgradePathStep[];
  milestones: UpgradeMilestone[];
  estimatedFps: number;
  fpsGain: number;
  totalCost: number;
  grossTotalCost: number;
  resaleCredit: number;
  netTotalCost: number;
  costPerFpsGain: number;
  meetsTarget: boolean;
  withinBudget: boolean;
  risks: string[];
  riskLevel: "low" | "medium" | "high";
  confidence: number;
}

export interface PlannerResult {
  baselineFps: number;
  target: PlannerTarget;
  options: Required<PlannerOptions>;
  cheapestPathId?: string;
  bestValuePathId?: string;
  paths: UpgradePath[];
  nearMisses: UpgradePath[];
}

interface PlatformAdjustment {
  extraCost: number;
  steps: UpgradePathStep[];
  risks: string[];
}

interface PathBuildArgs {
  id: string;
  label: string;
  type: UpgradePath["type"];
  scan: SystemScan;
  currentAnalysis: AnalysisResult;
  baselineFps: number;
  target: PlannerTarget;
  options: Required<PlannerOptions>;
  cpuName: string;
  gpuName: string;
  cpuCost: number;
  gpuCost: number;
  currentCpuPrice: number;
  currentGpuPrice: number;
  platform: PlatformAdjustment;
}

const CHIPSET_SOCKET: Record<string, string> = {
  B650: "AM5", B650E: "AM5", X670: "AM5", X670E: "AM5",
  B850: "AM5", B850E: "AM5", X870: "AM5", X870E: "AM5",
  B450: "AM4", X470: "AM4", B550: "AM4", X570: "AM4", A520: "AM4",
  B350: "AM4", X370: "AM4",
  Z890: "LGA1851", B860: "LGA1851", H810: "LGA1851",
  Z690: "LGA1700", B660: "LGA1700", H670: "LGA1700", H610: "LGA1700",
  Z790: "LGA1700", B760: "LGA1700", H770: "LGA1700",
  Z490: "LGA1200", B460: "LGA1200", H470: "LGA1200", H410: "LGA1200",
  Z590: "LGA1200", B560: "LGA1200", H570: "LGA1200", H510: "LGA1200",
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

function currentSocket(scan: SystemScan): string | null {
  const raw = scan.motherboard.chipset?.replace(/[^A-Za-z0-9]/g, "").toUpperCase() ?? "";
  if (!raw) return null;
  if (CHIPSET_SOCKET[raw]) return CHIPSET_SOCKET[raw];
  const base = raw.replace(/[EX]$/, "");
  return CHIPSET_SOCKET[base] ?? null;
}

function inferCpuSocket(cpuName: string): string | null {
  const n = cpuName.toLowerCase();

  if (n.includes("core ultra")) return "LGA1851";
  if (/i[3579]-1[234]00|i[3579]-14|i[3579]-13|i[3579]-12/.test(n)) return "LGA1700";
  if (/i[3579]-11|i[3579]-10/.test(n)) return "LGA1200";

  if (/ryzen\s+[3579]\s+9\d{3}|ryzen\s+[3579]\s+8\d{3}|ryzen\s+[3579]\s+7\d{3}/.test(n)) {
    return "AM5";
  }
  if (/ryzen\s+[3579]\s+5\d{3}|ryzen\s+[3579]\s+3\d{3}/.test(n)) {
    return "AM4";
  }

  return null;
}

function requiredDdr(socket: string | null, currentRamForm: string): "ddr4" | "ddr5" | null {
  const current = currentRamForm.toLowerCase();
  const currentDdr = current.includes("ddr5") ? "ddr5" : current.includes("ddr4") ? "ddr4" : null;

  if (socket === "AM5" || socket === "LGA1851") return "ddr5";
  if (socket === "AM4" || socket === "LGA1200") return "ddr4";
  if (socket === "LGA1700") return currentDdr ?? "ddr5";
  return null;
}

function platformAdjustment(scan: SystemScan, targetCpu: string): PlatformAdjustment {
  const current = currentSocket(scan);
  const next = inferCpuSocket(targetCpu);
  if (!next || !current || next === current) {
    return { extraCost: 0, steps: [], risks: [] };
  }

  const steps: UpgradePathStep[] = [];
  const risks: string[] = [];
  let extraCost = 0;

  const boardCost = next === "AM5" || next === "LGA1851" ? 180 : 130;
  extraCost += boardCost;
  steps.push({
    part: "platform",
    title: `Motherboard (${next})`,
    cost: boardCost,
    reason: `Current board socket ${current} does not support ${targetCpu}.`,
  });
  risks.push(`Platform change required (${current} -> ${next}).`);

  const targetDdr = requiredDdr(next, scan.ram.form_factor);
  const currentDdr = scan.ram.form_factor.toLowerCase().includes("ddr5")
    ? "ddr5"
    : scan.ram.form_factor.toLowerCase().includes("ddr4")
      ? "ddr4"
      : null;

  if (targetDdr && currentDdr && targetDdr !== currentDdr) {
    const ramCost = targetDdr === "ddr5" ? 95 : 55;
    extraCost += ramCost;
    steps.push({
      part: "platform",
      title: `${targetDdr.toUpperCase()} Memory Kit`,
      cost: ramCost,
      reason: `Target platform expects ${targetDdr.toUpperCase()} memory.`,
    });
    risks.push(`Memory generation mismatch (${currentDdr.toUpperCase()} -> ${targetDdr.toUpperCase()}).`);
  }

  return { extraCost, steps, risks };
}

function modifiedScan(scan: SystemScan, cpuName: string, gpuName: string): SystemScan {
  return {
    ...scan,
    cpu: {
      ...scan.cpu,
      model_name: cpuName,
      current_temp_c: null,
      current_clock_ghz: 0,
      power_draw_w: null,
    },
    gpu: {
      ...scan.gpu,
      model_name: gpuName,
      current_temp_c: null,
      gpu_utilization_pct: 0,
      fan_speed_pct: null,
      vram_used_gb: 0,
    },
  };
}

function estimateResaleCredit(basePrice: number, resaleRate: number, usedMarketDiscountPct: number): number {
  const marketSoftening = clamp(1 - usedMarketDiscountPct / 200, 0.75, 1);
  return roundTo2(basePrice * resaleRate * marketSoftening);
}

function applyUsedMarketDiscount(cost: number, usedMarketDiscountPct: number): number {
  const multiplier = clamp(1 - usedMarketDiscountPct / 100, 0.6, 1);
  return roundTo2(cost * multiplier);
}

function pathOrder(type: UpgradePath["type"], analysis: AnalysisResult, cpuHeavy: boolean): Array<"platform" | "cpu" | "gpu"> {
  if (type === "gpu") return ["gpu"];
  if (type === "cpu") return ["platform", "cpu"];
  if (type === "none") return [];

  const gpuPriority = analysis.bottlenecks.some((b) => b.category === "gpu" && (b.severity === "critical" || b.severity === "warning"));
  const cpuPriority = analysis.bottlenecks.some((b) => b.category === "cpu" && (b.severity === "critical" || b.severity === "warning"));

  if ((gpuPriority && !cpuPriority) || (!cpuHeavy && gpuPriority)) {
    return ["gpu", "platform", "cpu"];
  }
  return ["platform", "cpu", "gpu"];
}

function assessRiskAndConfidence(args: {
  pathType: UpgradePath["type"];
  risks: string[];
  meetsTarget: boolean;
  withinBudget: boolean;
  fpsGain: number;
  baselineFps: number;
  targetFps: number;
  totalCost: number;
  platformSteps: number;
}): { riskLevel: UpgradePath["riskLevel"]; confidence: number } {
  const {
    pathType,
    risks,
    meetsTarget,
    withinBudget,
    fpsGain,
    baselineFps,
    targetFps,
    totalCost,
    platformSteps,
  } = args;

  let riskPoints = risks.length + platformSteps;
  if (pathType === "gpu+cpu") riskPoints += 1;
  if (!withinBudget) riskPoints += 2;
  if (!meetsTarget) riskPoints += 2;
  if (fpsGain < 12 && targetFps > baselineFps) riskPoints += 1;
  if (totalCost > 1200) riskPoints += 1;

  const riskLevel: UpgradePath["riskLevel"] = riskPoints >= 5 ? "high" : riskPoints >= 3 ? "medium" : "low";

  const targetGap = Math.max(0, targetFps - baselineFps);
  const gainCoverage = targetGap > 0 ? clamp(fpsGain / targetGap, 0, 1.35) : 1;
  let confidence = 58 + gainCoverage * 24 - riskPoints * 6;
  if (meetsTarget) confidence += 10;
  if (withinBudget) confidence += 4;

  return {
    riskLevel,
    confidence: Math.round(clamp(confidence, 25, 98)),
  };
}

function buildPath(args: PathBuildArgs): UpgradePath {
  const {
    id,
    label,
    type,
    scan,
    currentAnalysis,
    baselineFps,
    target,
    options,
    cpuName,
    gpuName,
    cpuCost,
    gpuCost,
    currentCpuPrice,
    currentGpuPrice,
    platform,
  } = args;

  const cpuChanged = cpuName !== scan.cpu.model_name;
  const gpuChanged = gpuName !== scan.gpu.model_name;
  const order = pathOrder(type, currentAnalysis, Boolean(target.game.cpuHeavy));

  const stepByKind = new Map<"platform" | "cpu" | "gpu", UpgradePathStep[]>();
  if (gpuChanged) {
    stepByKind.set("gpu", [{
      part: "gpu",
      title: gpuName,
      cost: applyUsedMarketDiscount(gpuCost, options.usedMarketDiscountPct),
      reason: "Primary FPS leverage for most modern titles.",
    }]);
  }
  if (cpuChanged) {
    stepByKind.set("cpu", [{
      part: "cpu",
      title: cpuName,
      cost: applyUsedMarketDiscount(cpuCost, options.usedMarketDiscountPct),
      reason: target.game.cpuHeavy ? "CPU-heavy game profile benefits from stronger processor." : "Balances frame pacing and minimum FPS.",
    }]);
  }
  if (platform.steps.length > 0) {
    stepByKind.set("platform", platform.steps.map((s) => ({
      ...s,
      cost: applyUsedMarketDiscount(s.cost, options.usedMarketDiscountPct),
    })));
  }

  const orderedSteps: UpgradePathStep[] = [];
  for (const kind of order) {
    const list = stepByKind.get(kind);
    if (list) orderedSteps.push(...list);
  }

  let tempCpu = scan.cpu.model_name;
  let tempGpu = scan.gpu.model_name;
  let runningGross = 0;
  let runningNet = 0;
  const milestones: UpgradeMilestone[] = [];
  for (const step of orderedSteps) {
    runningGross += step.cost;
    runningNet += step.cost;

    if (step.part === "cpu") tempCpu = cpuName;
    if (step.part === "gpu") tempGpu = gpuName;

    const analysisAtStep = simulateUpgrade(
      scan,
      tempCpu !== scan.cpu.model_name ? tempCpu : undefined,
      tempGpu !== scan.gpu.model_name ? tempGpu : undefined,
    );
    const fpsAtStep = estimateFPS(
      modifiedScan(scan, tempCpu, tempGpu),
      analysisAtStep,
      target.game,
      target.resolution,
      target.quality,
    ).estimated;

    step.afterFps = fpsAtStep;
    milestones.push({
      title: step.title,
      part: step.part,
      estimatedFps: fpsAtStep,
      cumulativeGrossCost: roundTo2(runningGross),
      cumulativeNetCost: roundTo2(runningNet),
    });
  }

  const finalAnalysis = simulateUpgrade(
    scan,
    cpuChanged ? cpuName : undefined,
    gpuChanged ? gpuName : undefined,
  );
  const finalFps = estimateFPS(
    modifiedScan(scan, cpuName, gpuName),
    finalAnalysis,
    target.game,
    target.resolution,
    target.quality,
  ).estimated;

  const gpuResale = options.includeResaleCredit && gpuChanged
    ? estimateResaleCredit(currentGpuPrice, 0.46, options.usedMarketDiscountPct)
    : 0;
  const cpuResale = options.includeResaleCredit && cpuChanged
    ? estimateResaleCredit(currentCpuPrice, 0.34, options.usedMarketDiscountPct)
    : 0;
  const resaleCredit = roundTo2(gpuResale + cpuResale);

  const grossTotalCost = roundTo2(orderedSteps.reduce((sum, s) => sum + s.cost, 0));
  const netTotalCost = roundTo2(Math.max(0, grossTotalCost - resaleCredit));
  const fpsGain = Math.max(0, finalFps - baselineFps);
  const totalCost = netTotalCost;

  const risks = [...platform.risks];
  if (options.usedMarketDiscountPct >= 20) {
    risks.push("Aggressive used-part pricing may vary by local availability.");
  }
  if (!target.game.cpuHeavy && type === "cpu") {
    risks.push("CPU-only path may deliver limited gains in GPU-bound scenes.");
  }

  const meetsTarget = finalFps >= target.targetFps;
  const withinBudget = target.maxBudget == null ? true : totalCost <= target.maxBudget;

  const assessed = assessRiskAndConfidence({
    pathType: type,
    risks,
    meetsTarget,
    withinBudget,
    fpsGain,
    baselineFps,
    targetFps: target.targetFps,
    totalCost,
    platformSteps: platform.steps.length,
  });

  return {
    id,
    label,
    type,
    cpuName,
    gpuName,
    steps: orderedSteps,
    milestones,
    estimatedFps: finalFps,
    fpsGain,
    totalCost,
    grossTotalCost,
    resaleCredit,
    netTotalCost,
    costPerFpsGain: fpsGain > 0 ? roundTo2(totalCost / fpsGain) : totalCost,
    meetsTarget,
    withinBudget,
    risks,
    riskLevel: assessed.riskLevel,
    confidence: assessed.confidence,
  };
}

export function planGoalUpgrade(
  scan: SystemScan,
  currentAnalysis: AnalysisResult,
  target: PlannerTarget,
  options: PlannerOptions = {},
): PlannerResult {
  const normalizedOptions: Required<PlannerOptions> = {
    includeResaleCredit: options.includeResaleCredit ?? true,
    usedMarketDiscountPct: clamp(options.usedMarketDiscountPct ?? 0, 0, 40),
  };

  const baseline = estimateFPS(scan, currentAnalysis, target.game, target.resolution, target.quality).estimated;
  const cpuOptions = getCPUOptions();
  const gpuOptions = getGPUOptions();

  const currentCpu = cpuOptions.find((c) => c.name === scan.cpu.model_name);
  const currentGpu = gpuOptions.find((g) => g.name === scan.gpu.model_name);
  const currentCpuPrice = currentCpu?.price ?? 180;
  const currentGpuPrice = currentGpu?.price ?? 280;

  const cpuCandidates = cpuOptions
    .filter((c) => c.price > 0 && c.name !== scan.cpu.model_name && c.score > (currentCpu?.score ?? 0))
    .sort((a, b) => a.price - b.price)
    .slice(0, 24);

  const gpuCandidates = gpuOptions
    .filter((g) => g.price > 0 && g.name !== scan.gpu.model_name && g.score > (currentGpu?.score ?? 0))
    .sort((a, b) => a.price - b.price)
    .slice(0, 28);

  const paths: UpgradePath[] = [];

  paths.push(
    buildPath({
      id: "path-baseline",
      label: "Current Build",
      type: "none",
      scan,
      currentAnalysis,
      baselineFps: baseline,
      target,
      options: normalizedOptions,
      cpuName: scan.cpu.model_name,
      gpuName: scan.gpu.model_name,
      cpuCost: 0,
      gpuCost: 0,
      currentCpuPrice,
      currentGpuPrice,
      platform: { extraCost: 0, steps: [], risks: [] },
    }),
  );

  for (const gpu of gpuCandidates) {
    paths.push(
      buildPath({
        id: `path-gpu-${gpu.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label: `GPU Upgrade: ${gpu.name}`,
        type: "gpu",
        scan,
        currentAnalysis,
        baselineFps: baseline,
        target,
        options: normalizedOptions,
        cpuName: scan.cpu.model_name,
        gpuName: gpu.name,
        cpuCost: 0,
        gpuCost: gpu.price,
        currentCpuPrice,
        currentGpuPrice,
        platform: { extraCost: 0, steps: [], risks: [] },
      }),
    );
  }

  const cpuForSingle = target.game.cpuHeavy ? cpuCandidates : cpuCandidates.slice(0, 12);
  for (const cpu of cpuForSingle) {
    const platform = platformAdjustment(scan, cpu.name);
    paths.push(
      buildPath({
        id: `path-cpu-${cpu.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label: `CPU Upgrade: ${cpu.name}`,
        type: "cpu",
        scan,
        currentAnalysis,
        baselineFps: baseline,
        target,
        options: normalizedOptions,
        cpuName: cpu.name,
        gpuName: scan.gpu.model_name,
        cpuCost: cpu.price,
        gpuCost: 0,
        currentCpuPrice,
        currentGpuPrice,
        platform,
      }),
    );
  }

  const cpuForCombo = cpuCandidates.slice(0, target.game.cpuHeavy ? 12 : 8);
  const gpuForCombo = gpuCandidates.slice(0, 16);
  for (const cpu of cpuForCombo) {
    const platform = platformAdjustment(scan, cpu.name);
    for (const gpu of gpuForCombo) {
      paths.push(
        buildPath({
          id: `path-combo-${cpu.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${gpu.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          label: `CPU + GPU: ${cpu.name} + ${gpu.name}`,
          type: "gpu+cpu",
          scan,
          currentAnalysis,
          baselineFps: baseline,
          target,
          options: normalizedOptions,
          cpuName: cpu.name,
          gpuName: gpu.name,
          cpuCost: cpu.price,
          gpuCost: gpu.price,
          currentCpuPrice,
          currentGpuPrice,
          platform,
        }),
      );
    }
  }

  const deduped = new Map<string, UpgradePath>();
  for (const path of paths) {
    const key = `${path.cpuName}::${path.gpuName}::${path.netTotalCost}`;
    const existing = deduped.get(key);
    if (!existing || path.estimatedFps > existing.estimatedFps) {
      deduped.set(key, path);
    }
  }

  const all = [...deduped.values()]
    .sort((a, b) => {
      if (a.meetsTarget !== b.meetsTarget) return a.meetsTarget ? -1 : 1;
      if (a.withinBudget !== b.withinBudget) return a.withinBudget ? -1 : 1;
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      return b.estimatedFps - a.estimatedFps;
    });

  const valid = all.filter((p) => p.meetsTarget && p.withinBudget);
  const cheapest = valid[0];
  const bestValue = valid
    .slice()
    .sort((a, b) => {
      if (a.costPerFpsGain !== b.costPerFpsGain) return a.costPerFpsGain - b.costPerFpsGain;
      return b.confidence - a.confidence;
    })[0];

  const nearMisses = all
    .filter((p) => !p.meetsTarget && p.withinBudget)
    .sort((a, b) => {
      const da = Math.abs(target.targetFps - a.estimatedFps);
      const db = Math.abs(target.targetFps - b.estimatedFps);
      if (da !== db) return da - db;
      return a.totalCost - b.totalCost;
    })
    .slice(0, 5);

  return {
    baselineFps: baseline,
    target,
    options: normalizedOptions,
    cheapestPathId: cheapest?.id,
    bestValuePathId: bestValue?.id,
    paths: all.slice(0, 40),
    nearMisses,
  };
}
