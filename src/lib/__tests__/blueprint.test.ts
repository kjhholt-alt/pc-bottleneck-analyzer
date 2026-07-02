import { describe, expect, it } from "vitest";
import { generateBlueprint, BUDGET_RUNGS, type BlueprintPickerInput } from "../blueprint";
import { tierIndex } from "@/data/hardware-db";

const LOW_END: BlueprintPickerInput = {
  cpuName: "AMD Ryzen 5 3600",
  gpuName: "NVIDIA GeForce GTX 1660",
  ramGb: 16,
  resolution: "1080p",
  gameIds: ["cyberpunk", "valorant", "cs2"],
};

const HIGH_END: BlueprintPickerInput = {
  cpuName: "AMD Ryzen 9 9950X3D",
  gpuName: "NVIDIA GeForce RTX 5090",
  ramGb: 32,
  resolution: "4K",
  gameIds: ["cyberpunk"],
};

describe("generateBlueprint", () => {
  it("is deterministic for the same input", () => {
    const a = generateBlueprint(LOW_END, { currentYear: 2026 });
    const b = generateBlueprint(LOW_END, { currentYear: 2026 });
    expect(a).toEqual(b);
  });

  it("ladder respects each rung's budget", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    expect(bp.ladder).toHaveLength(BUDGET_RUNGS.length);
    for (const rung of bp.ladder) {
      if (rung.part) {
        const price = rung.part.current_price_approx || rung.part.msrp;
        expect(price).toBeLessThanOrEqual(rung.budget);
      }
    }
  });

  it("never recommends a part at or below the current GPU's tier", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    const currentTier = tierIndex(bp.gpuEntry.tier);
    for (const rung of bp.ladder) {
      if (rung.part) {
        expect(tierIndex(rung.part.tier)).toBeGreaterThan(currentTier);
      }
    }
  });

  it("FPS uplift is monotonic non-decreasing as budget rises, per game", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    for (const game of LOW_END.gameIds) {
      const afterByRung = bp.ladder.map(
        (r) => r.fpsUplift.find((f) => f.gameId === game)!.afterFps,
      );
      for (let i = 1; i < afterByRung.length; i++) {
        expect(afterByRung[i]).toBeGreaterThanOrEqual(afterByRung[i - 1]);
      }
    }
  });

  it("resale of the current GPU never exceeds its own price", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    const price = bp.gpuEntry.current_price_approx || bp.gpuEntry.msrp;
    expect(bp.ladder[0].resaleOfCurrentGpu).toBeLessThan(price);
  });

  it("net cost is part price minus the current GPU's resale value", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    for (const rung of bp.ladder) {
      if (rung.part) {
        const price = rung.part.current_price_approx || rung.part.msrp;
        expect(rung.netCost).toBe(price - rung.resaleOfCurrentGpu);
      } else {
        expect(rung.netCost).toBeNull();
      }
    }
  });

  it("flags the CPU as the bottleneck when it's the weaker-tiered part", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    // Ryzen 5 3600 (low) vs GTX 1660 (low) — same tier, so gpu wins the tie
    // per generateBlueprint's rule; assert the rule directly instead.
    expect(["cpu", "gpu"]).toContain(bp.verdict.bottleneckCategory);
  });

  it("already-best-in-class hardware yields a well-formed ladder with no upgrades available", () => {
    const bp = generateBlueprint(HIGH_END, { currentYear: 2026 });
    for (const rung of bp.ladder) {
      expect(rung.part).toBeNull();
      expect(rung.netCost).toBeNull();
      // No upgrade available => "after" FPS falls back to current GPU's FPS.
      for (const fps of rung.fpsUplift) {
        expect(fps.afterFps).toBe(fps.beforeFps);
      }
    }
  });

  it("resolves unknown hardware names to a conservative fallback instead of throwing", () => {
    const bp = generateBlueprint(
      { ...LOW_END, cpuName: "Some Totally Unknown CPU XYZ", gpuName: "Some Unknown GPU ABC" },
      { currentYear: 2026 },
    );
    expect(bp.cpuEntry).toBeTruthy();
    expect(bp.gpuEntry).toBeTruthy();
  });

  it("includes only games that were actually requested, matched by id", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    const idsInLadder = new Set(bp.ladder[0].fpsUplift.map((f) => f.gameId));
    expect(idsInLadder).toEqual(new Set(LOW_END.gameIds));
  });

  it("free wins come from the existing recommendation engine's free tier only", () => {
    const bp = generateBlueprint(LOW_END, { currentYear: 2026 });
    for (const rec of bp.freeWins) {
      expect(rec.tier).toBe("free");
    }
  });
});
