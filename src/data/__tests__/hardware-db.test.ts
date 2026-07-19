import { describe, it, expect } from "vitest";
import {
  lookupCPU,
  lookupGPU,
  tierIndex,
  getUpgrades,
  cpuDatabase,
  gpuDatabase,
  type HardwareEntry,
} from "@/data/hardware-db";

describe("tierIndex", () => {
  it("orders tiers from very_low (0) to very_high (4)", () => {
    expect(tierIndex("very_low")).toBe(0);
    expect(tierIndex("low")).toBe(1);
    expect(tierIndex("mid")).toBe(2);
    expect(tierIndex("high")).toBe(3);
    expect(tierIndex("very_high")).toBe(4);
  });
});

describe("lookupCPU — exact + normalization", () => {
  it("matches a clean model name directly", () => {
    expect(lookupCPU("AMD Ryzen 7 5800X")?.name).toBe("AMD Ryzen 7 5800X");
  });

  it("strips Intel (R)/(TM)/generation/@clock noise", () => {
    expect(
      lookupCPU("12th Gen Intel(R) Core(TM) i5-12400F @ 2.50GHz")?.name,
    ).toBe("Intel Core i5-12400F");
    expect(lookupCPU("Intel(R) Core(TM) i7-13700K")?.name).toBe(
      "Intel Core i7-13700K",
    );
  });

  // ── Regression: the real-world AMD bug ──────────────────────────────────
  // py-cpuinfo / WMI report AMD CPUs with an " N-Core Processor" suffix.
  // Before the normalization fix, the 60%-overlap guard rejected these and
  // every AMD Ryzen scan failed to match the DB.
  it("matches AMD names with the ' N-Core Processor' suffix WMI appends", () => {
    expect(lookupCPU("AMD Ryzen 7 5800X 8-Core Processor")?.name).toBe(
      "AMD Ryzen 7 5800X",
    );
    expect(lookupCPU("AMD Ryzen 5 5600X 6-Core Processor")?.name).toBe(
      "AMD Ryzen 5 5600X",
    );
    expect(lookupCPU("AMD Ryzen 9 7950X3D 16-Core Processor")?.name).toBe(
      "AMD Ryzen 9 7950X3D",
    );
  });

  it("matches AMD APU names with the 'with Radeon Graphics' suffix", () => {
    expect(lookupCPU("AMD Ryzen 5 5600G with Radeon Graphics")?.name).toBe(
      "AMD Ryzen 5 5600G",
    );
  });

  it("returns null for hardware not in the database", () => {
    expect(lookupCPU("Some Quantum CPU 9000")).toBeNull();
    expect(lookupCPU("")).toBeNull();
  });
});

describe("lookupGPU — specificity guard", () => {
  it("does not let 'RTX 3060' bleed into 'RTX 3060 Ti' (and vice versa)", () => {
    expect(lookupGPU("NVIDIA GeForce RTX 3060")?.name).toBe(
      "NVIDIA GeForce RTX 3060",
    );
    expect(lookupGPU("NVIDIA GeForce RTX 3060 Ti")?.name).toBe(
      "NVIDIA GeForce RTX 3060 Ti",
    );
  });

  it("matches AMD Radeon cards directly", () => {
    expect(lookupGPU("AMD Radeon RX 7800 XT")?.name).toBe(
      "AMD Radeon RX 7800 XT",
    );
  });
});

describe("getUpgrades", () => {
  const veryLowGpu: HardwareEntry = {
    name: "Test Potato GPU",
    tier: "very_low",
    gaming_score: 10,
    release_year: 2016,
    msrp: 100,
    current_price_approx: 50,
  };

  it("only returns parts in a strictly higher tier than the current part", () => {
    const current = cpuDatabase["amd ryzen 5 5600"]; // mid
    const upgrades = getUpgrades(current, cpuDatabase, 5);
    expect(upgrades.length).toBeGreaterThan(0);
    for (const u of upgrades) {
      expect(tierIndex(u.tier)).toBeGreaterThan(tierIndex(current.tier));
    }
  });

  it("respects the maxResults cap", () => {
    expect(getUpgrades(veryLowGpu, gpuDatabase, 2)).toHaveLength(2);
    expect(getUpgrades(veryLowGpu, gpuDatabase, 3)).toHaveLength(3);
  });

  it("sorts by value (gaming_score / price) descending", () => {
    const upgrades = getUpgrades(veryLowGpu, gpuDatabase, 5);
    const values = upgrades.map(
      (u) => u.gaming_score / (u.current_price_approx || 1),
    );
    const sorted = [...values].sort((a, b) => b - a);
    expect(values).toEqual(sorted);
  });

  it("returns an empty list when the part is already top-tier", () => {
    const top = cpuDatabase["amd ryzen 7 9800x3d"]; // very_high
    expect(getUpgrades(top, cpuDatabase)).toHaveLength(0);
  });
});

describe("database integrity", () => {
  const allEntries = [
    ...Object.entries(cpuDatabase),
    ...Object.entries(gpuDatabase),
  ];

  it("keys are lowercase-normalized (matchable)", () => {
    for (const [key] of allEntries) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it("every entry has sane numeric fields", () => {
    for (const [key, e] of allEntries) {
      expect(e.gaming_score, key).toBeGreaterThan(0);
      expect(e.gaming_score, key).toBeLessThanOrEqual(100);
      expect(e.current_price_approx, key).toBeGreaterThan(0);
      expect(e.release_year, key).toBeGreaterThanOrEqual(2016);
      expect(["very_low", "low", "mid", "high", "very_high"]).toContain(e.tier);
    }
  });
});
