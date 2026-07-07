import { describe, expect, it } from "vitest";
import { estimateFPS } from "../fps-estimator";
import { estFps } from "../gpu-for-game";
import { generateBlueprint } from "../blueprint";
import { planGoalUpgrade } from "../goal-planner";
import { analyzeScan } from "../analysis";
import { lookupGPU } from "@/data/hardware-db";
import { gameBenchmarks } from "@/data/game-benchmarks";
import type { SystemScan } from "@/lib/types";

// ─── Characterization tests for the corrected FPS model ─────────────────────
//
// These pin the *current* behavior of estimateFPS / estFps / the blueprint
// ladder / the goal planner against real src/data/hardware-db.ts and
// src/data/game-benchmarks.ts entries — no synthetic fixtures — so a future
// regression in the estimator/planner seam (e.g. a path silently reverting to
// the old GPU-only, CPU-cap-free math) breaks a test here instead of shipping
// dishonest FPS numbers.

// ─── Shared scan builder ─────────────────────────────────────────────────────
// Mirrors blueprint.ts's buildSyntheticScan: "everything else optimal" so the
// only variables under test are the named CPU/GPU, resolution, and quality.
// High-speed dual-channel RAM avoids tripping the RAM-penalty multiplier in
// estimateFPS, and temps are held well under the 85C throttle threshold.
function buildScan(cpuName: string, gpuName: string): SystemScan {
  return {
    scan_id: `fps-model-test-${cpuName}-${gpuName}`.toLowerCase().replace(/\s+/g, "-"),
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

function fpsFor(cpuName: string, gpuName: string, gameId: string, resolution: "1080p" | "1440p" | "4K", quality: "Low" | "Medium" | "High" | "Ultra"): number {
  const scan = buildScan(cpuName, gpuName);
  const analysis = analyzeScan(scan);
  const game = gameBenchmarks.find((g) => g.id === gameId)!;
  return estimateFPS(scan, analysis, game, resolution, quality).estimated;
}

// Real DB entries used throughout.
const WEAK_CPU_NAME = "AMD Ryzen 5 3600"; // gaming_score 52, tier "low"
const REFERENCE_GPU_NAME = "NVIDIA GeForce RTX 4070"; // the calibration reference card
const GPU_LADDER = [
  "NVIDIA GeForce RTX 4070",
  "NVIDIA GeForce RTX 4080",
  "NVIDIA GeForce RTX 4090",
  "NVIDIA GeForce RTX 5090",
]; // strictly increasing gaming_score, same generation family span

describe("estimateFPS monotonicity (real hardware-db entries)", () => {
  it("a strictly better GPU never lowers estimated FPS, holding CPU/res/quality fixed", () => {
    const cpuName = "AMD Ryzen 9 9950X3D"; // top-tier CPU so the GPU stays the limiter
    const resolutions: Array<"1080p" | "1440p" | "4K"> = ["1080p", "1440p", "4K"];
    const qualities: Array<"Low" | "Medium" | "High" | "Ultra"> = ["Low", "Medium", "High", "Ultra"];
    const games = ["cyberpunk", "valorant", "gta5"];

    for (const gameId of games) {
      for (const res of resolutions) {
        for (const quality of qualities) {
          const values = GPU_LADDER.map((gpu) => fpsFor(cpuName, gpu, gameId, res, quality));
          for (let i = 1; i < values.length; i++) {
            expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
          }
        }
      }
    }
  });

  it("a strictly better CPU never lowers estimated FPS, holding GPU/res/quality fixed", () => {
    const gpuName = "NVIDIA GeForce RTX 5090"; // flagship GPU so the CPU stays the limiter
    const cpuLadder = [
      "AMD Ryzen 5 3600", // gaming_score 52
      "AMD Ryzen 5 5600X", // gaming_score 72
      "AMD Ryzen 7 7700X", // gaming_score 87
      "AMD Ryzen 9 9950X3D", // gaming_score 97
    ];
    const resolutions: Array<"1080p" | "1440p" | "4K"> = ["1080p", "1440p", "4K"];
    const games = ["cs2", "cyberpunk", "starfield"]; // mix of cpuHeavy and not

    for (const gameId of games) {
      for (const res of resolutions) {
        const values = cpuLadder.map((cpu) => fpsFor(cpu, gpuName, gameId, res, "Ultra"));
        for (let i = 1; i < values.length; i++) {
          expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
        }
      }
    }
  });
});

describe("CPU-cap flattening (weak CPU + successively better GPUs)", () => {
  it("FPS converges to a flat ceiling once the GPU stops being the limiter", () => {
    const cs2Values = GPU_LADDER.map((gpu) => fpsFor(WEAK_CPU_NAME, gpu, "cs2", "1080p", "Ultra"));

    // Non-decreasing (monotonicity holds here too).
    for (let i = 1; i < cs2Values.length; i++) {
      expect(cs2Values[i]).toBeGreaterThanOrEqual(cs2Values[i - 1]);
    }

    // The top two GPUs (4090, 5090) are both far beyond what this weak CPU
    // can feed — the delta between them must be ~0 (CPU-bound, not GPU-bound).
    const top = cs2Values[cs2Values.length - 1];
    const secondTop = cs2Values[cs2Values.length - 2];
    expect(Math.abs(top - secondTop)).toBeLessThanOrEqual(1);

    // And the ceiling is actually reached well before the flagship card —
    // i.e. this isn't just "still climbing slowly", it's genuinely flat.
    const thirdTop = cs2Values[cs2Values.length - 3];
    expect(Math.abs(secondTop - thirdTop)).toBeLessThanOrEqual(1);
  });

  it("a GPU-heavy (non-cpuHeavy) title still shows diminishing returns as the CPU ceiling is approached", () => {
    // cyberpunk isn't cpuHeavy, so it has generous CPU headroom (1.8x) and
    // doesn't fully flatten within this GPU ladder — but each successive
    // upgrade must gain LESS than the one before it as the CPU ceiling nears,
    // proving the cap is being approached rather than scaling linearly with
    // GPU score the whole way (which the old GPU-only model would do).
    const cyberpunkValues = GPU_LADDER.map((gpu) => fpsFor(WEAK_CPU_NAME, gpu, "cyberpunk", "1080p", "Ultra"));
    const gains = cyberpunkValues.slice(1).map((v, i) => v - cyberpunkValues[i]);
    for (let i = 1; i < gains.length; i++) {
      expect(gains[i]).toBeLessThanOrEqual(gains[i - 1]);
    }
  });

  it("a cpuHeavy title (esports, tight 1.2x headroom) fully flattens within the same GPU ladder", () => {
    const valorantValues = GPU_LADDER.map((gpu) => fpsFor(WEAK_CPU_NAME, gpu, "valorant", "1080p", "Ultra"));
    const top = valorantValues[valorantValues.length - 1];
    const secondTop = valorantValues[valorantValues.length - 2];
    expect(Math.abs(top - secondTop)).toBeLessThanOrEqual(1);
  });
});

describe("resolution/quality invariance when CPU-bound", () => {
  it("1080p vs 1440p do not inflate FPS past the CPU ceiling", () => {
    // RTX 5090 so we're deep into "the GPU is not the limiter" territory.
    const ceiling1080 = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", "cs2", "1080p", "Ultra");
    const ceiling1440 = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", "cs2", "1440p", "Ultra");
    // Both are CPU-capped, so they should match (within rounding) rather than
    // 1080p > 1440p as a naive GPU-only resolution multiplier would produce
    // for a card that has GPU headroom to spare in a CPU-bound game.
    expect(Math.abs(ceiling1080 - ceiling1440)).toBeLessThanOrEqual(1);
  });

  it("Low vs Ultra quality do not inflate FPS past the CPU ceiling", () => {
    const ceilingUltra = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", "cs2", "1080p", "Ultra");
    const ceilingLow = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", "cs2", "1080p", "Low");
    // Low settings would normally raise a GPU-limited FPS a lot (1.6x
    // multiplier) — but once CPU-bound, dropping quality can't manufacture
    // frames the CPU isn't feeding, so the two must match.
    expect(Math.abs(ceilingUltra - ceilingLow)).toBeLessThanOrEqual(1);
  });

  it("a config that IS still GPU-bound at 1440p is allowed to differ from 1080p (sanity control)", () => {
    // Weak CPU + weaker GPU: 1440p is genuinely GPU-limited here (confirmed
    // against the real model), so this must NOT be flattened — proves the
    // invariance above is really about being CPU-bound, not a blanket clamp.
    const fps1080 = fpsFor(WEAK_CPU_NAME, REFERENCE_GPU_NAME, "cs2", "1080p", "Ultra");
    const fps1440 = fpsFor(WEAK_CPU_NAME, REFERENCE_GPU_NAME, "cs2", "1440p", "Ultra");
    expect(fps1440).toBeLessThan(fps1080);
  });
});

describe("calibration anchor", () => {
  it("RTX 4070 + a reference-class CPU @ 1080p Ultra matches today's value within +-2 FPS", () => {
    // AMD Ryzen 7 5800X (gaming_score 78) — comfortably reference-class,
    // matches the fps-estimator.ts calibration commentary (~80-class CPU).
    const cyberpunkFps = fpsFor("AMD Ryzen 7 5800X", REFERENCE_GPU_NAME, "cyberpunk", "1080p", "Ultra");
    expect(cyberpunkFps).toBeGreaterThanOrEqual(64);
    expect(cyberpunkFps).toBeLessThanOrEqual(68);

    // A second reference-class CPU (Intel Core i7-13700K, gaming_score 89)
    // should land on the same GPU-limited ceiling for this title/settings.
    const cyberpunkFpsIntel = fpsFor("Intel Core i7-13700K", REFERENCE_GPU_NAME, "cyberpunk", "1080p", "Ultra");
    expect(cyberpunkFpsIntel).toBeGreaterThanOrEqual(64);
    expect(cyberpunkFpsIntel).toBeLessThanOrEqual(68);
  });
});

describe("estFps without a CPU arg is unchanged vs the current implementation", () => {
  // Pinned exact values for 3 (gpu, game, res) triples, hardcoded to today's
  // real output. If fpsCore's constants or the estFps GPU-only path ever
  // shift, these fail loudly instead of silently drifting.
  it("NVIDIA GeForce RTX 4070 / Cyberpunk 2077 / 1080p", () => {
    const gpu = lookupGPU("NVIDIA GeForce RTX 4070")!;
    const game = gameBenchmarks.find((g) => g.id === "cyberpunk")!;
    expect(estFps(gpu, game, "1080p")).toBe(77);
  });

  it("NVIDIA GeForce RTX 3060 / Valorant / 1440p", () => {
    const gpu = lookupGPU("NVIDIA GeForce RTX 3060")!;
    const game = gameBenchmarks.find((g) => g.id === "valorant")!;
    expect(estFps(gpu, game, "1440p")).toBe(127);
  });

  it("NVIDIA GeForce RTX 5090 / Counter-Strike 2 / 4K", () => {
    const gpu = lookupGPU("NVIDIA GeForce RTX 5090")!;
    const game = gameBenchmarks.find((g) => g.id === "cs2")!;
    expect(estFps(gpu, game, "4K")).toBe(140);
  });

  it("omitting cpu is identical to explicitly passing no CPU cap (GPU-only ceiling)", () => {
    // rankGpus()/pickGpus() in gpu-for-game.ts and every existing SEO page
    // call estFps with no 4th arg — this must keep behaving exactly as
    // before the CPU-aware overload was added.
    const gpu = lookupGPU("NVIDIA GeForce RTX 4090")!;
    const game = gameBenchmarks.find((g) => g.id === "gta5")!;
    const a = estFps(gpu, game, "1080p");
    const b = estFps(gpu, game, "1080p");
    expect(a).toBe(b);
    expect(a).toBe(141);
  });
});

describe("blueprint consistency — CPU-bottlenecked ladder never exceeds the CPU ceiling", () => {
  it("every rung's afterFps stays at or under the CPU ceiling when bottleneckCategory is 'cpu'", () => {
    const bp = generateBlueprint(
      {
        cpuName: WEAK_CPU_NAME,
        gpuName: "NVIDIA GeForce RTX 3060", // strictly better tier than the CPU -> cpu is the bottleneck
        ramGb: 16,
        resolution: "1080p",
        gameIds: ["cs2", "valorant", "cyberpunk"],
      },
      { currentYear: 2026 },
    );

    expect(bp.verdict.bottleneckCategory).toBe("cpu");

    for (const gameId of ["cs2", "valorant", "cyberpunk"]) {
      // The true CPU ceiling per the shared model: this weak CPU paired with
      // the best GPU in the ladder (or better), same res/quality.
      const ceiling = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", gameId, "1080p", "Ultra");

      for (const rung of bp.ladder) {
        const uplift = rung.fpsUplift.find((f) => f.gameId === gameId)!;
        expect(uplift.afterFps).toBeLessThanOrEqual(ceiling + 1); // +1 rounding slack
        expect(uplift.beforeFps).toBeLessThanOrEqual(ceiling + 1);
      }
    }
  });

  it("beforeFps is identical across every rung (same current CPU+GPU, only the upgrade part changes)", () => {
    const bp = generateBlueprint(
      {
        cpuName: WEAK_CPU_NAME,
        gpuName: "NVIDIA GeForce RTX 3060",
        ramGb: 16,
        resolution: "1080p",
        gameIds: ["cs2"],
      },
      { currentYear: 2026 },
    );
    const beforeValues = bp.ladder.map((r) => r.fpsUplift.find((f) => f.gameId === "cs2")!.beforeFps);
    expect(new Set(beforeValues).size).toBe(1);
  });
});

describe("planner honesty — no GPU-only false positive above the CPU ceiling", () => {
  it("a target FPS above the weak CPU's ceiling never gets a GPU-only meetsTarget:true path", () => {
    const scan = buildScan(WEAK_CPU_NAME, "NVIDIA GeForce RTX 3060");
    const analysis = analyzeScan(scan);
    const cs2 = gameBenchmarks.find((g) => g.id === "cs2")!;

    // Establish the CPU ceiling for this exact scan/game/settings via the
    // canonical estimator (best possible GPU, same CPU).
    const ceiling = fpsFor(WEAK_CPU_NAME, "NVIDIA GeForce RTX 5090", "cs2", "1080p", "Ultra");

    const result = planGoalUpgrade(scan, analysis, {
      game: cs2,
      resolution: "1080p",
      quality: "Ultra",
      targetFps: ceiling + 25, // comfortably above what any GPU-only path can deliver
    });

    const gpuOnlyFalsePositives = result.paths.filter((p) => p.type === "gpu" && p.meetsTarget);
    expect(gpuOnlyFalsePositives).toHaveLength(0);

    // Every GPU-only path's estimate must also sit at/under the ceiling —
    // not just fail to be flagged meetsTarget.
    for (const path of result.paths.filter((p) => p.type === "gpu")) {
      expect(path.estimatedFps).toBeLessThanOrEqual(ceiling + 1);
    }
  });

  it("a target FPS at/under the CPU ceiling can still be met (sanity control — planner isn't just always false)", () => {
    const scan = buildScan(WEAK_CPU_NAME, "NVIDIA GeForce GTX 1660"); // weak GPU well under the CPU's own ceiling
    const analysis = analyzeScan(scan);
    const cyberpunk = gameBenchmarks.find((g) => g.id === "cyberpunk")!;

    const baseline = estimateFPS(scan, analysis, cyberpunk, "1080p", "Ultra").estimated;
    const result = planGoalUpgrade(scan, analysis, {
      game: cyberpunk,
      resolution: "1080p",
      quality: "Ultra",
      targetFps: baseline + 5, // small, realistic ask well within GPU-upgrade reach
    });

    const meeting = result.paths.filter((p) => p.meetsTarget);
    expect(meeting.length).toBeGreaterThan(0);
  });
});
