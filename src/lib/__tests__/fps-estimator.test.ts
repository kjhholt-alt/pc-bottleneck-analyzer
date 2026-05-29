import { describe, it, expect } from "vitest";
import { estimateFPS } from "@/lib/fps-estimator";
import { analyzeScan } from "@/lib/analysis";
import { optimalScan, cloneScan } from "@/lib/__tests__/_fixtures";
import type { GameBenchmark } from "@/data/game-benchmarks";

const game = (over: Partial<GameBenchmark> = {}): GameBenchmark => ({
  id: "test",
  title: "Test Game",
  genre: "AAA",
  baseFps: 100,
  year: 2024,
  ...over,
});

const scan = optimalScan();
const analysis = analyzeScan(scan);

describe("estimateFPS — bracket sanity", () => {
  it("returns low <= estimated <= high", () => {
    const r = estimateFPS(scan, analysis, game(), "1080p", "High");
    expect(r.low).toBeLessThanOrEqual(r.estimated);
    expect(r.estimated).toBeLessThanOrEqual(r.high);
  });
});

describe("estimateFPS — resolution & quality scaling", () => {
  it("FPS decreases as resolution increases", () => {
    const g = game();
    const at1080 = estimateFPS(scan, analysis, g, "1080p", "High").estimated;
    const at1440 = estimateFPS(scan, analysis, g, "1440p", "High").estimated;
    const at4k = estimateFPS(scan, analysis, g, "4K", "High").estimated;
    expect(at1080).toBeGreaterThan(at1440);
    expect(at1440).toBeGreaterThan(at4k);
  });

  it("FPS increases as quality drops", () => {
    const g = game();
    const low = estimateFPS(scan, analysis, g, "1080p", "Low").estimated;
    const ultra = estimateFPS(scan, analysis, g, "1080p", "Ultra").estimated;
    expect(low).toBeGreaterThan(ultra);
  });
});

describe("estimateFPS — CPU-heavy headroom", () => {
  it("a CPU-heavy game gets a small boost from a strong CPU vs a non-CPU-heavy one", () => {
    const heavy = estimateFPS(scan, analysis, game({ cpuHeavy: true }), "1080p", "High").estimated;
    const normal = estimateFPS(scan, analysis, game({ cpuHeavy: false }), "1080p", "High").estimated;
    expect(heavy).toBeGreaterThan(normal);
  });
});

describe("estimateFPS — verdict bands", () => {
  it("labels very low FPS as struggling", () => {
    const r = estimateFPS(scan, analysis, game({ baseFps: 40 }), "4K", "Ultra");
    expect(r.verdict).toBe("struggling");
  });

  it("labels a mid result as playable", () => {
    const r = estimateFPS(scan, analysis, game({ baseFps: 60 }), "1440p", "Ultra");
    expect(r.verdict).toBe("playable");
  });

  it("labels a high result as smooth/buttery", () => {
    const r = estimateFPS(scan, analysis, game({ baseFps: 200 }), "1080p", "Low");
    expect(r.verdict).toBe("smooth");
    expect(r.verdictLabel).toContain("144");
  });
});

describe("estimateFPS — penalties", () => {
  it("applies a RAM penalty for single-channel + slow memory", () => {
    const bad = cloneScan(optimalScan());
    bad.ram.channel_mode = "single";
    bad.ram.form_factor = "DIMM DDR4";
    bad.ram.speed_mhz = 2133;
    const badAnalysis = analyzeScan(bad);
    const penalized = estimateFPS(bad, badAnalysis, game(), "1080p", "High").estimated;
    const clean = estimateFPS(scan, analysis, game(), "1080p", "High").estimated;
    expect(penalized).toBeLessThan(clean);
  });

  it("does not throw for unknown hardware (falls back to neutral scores)", () => {
    const unk = cloneScan(optimalScan());
    unk.gpu.model_name = "Mystery GPU";
    unk.cpu.model_name = "Mystery CPU";
    const r = estimateFPS(unk, analyzeScan(unk), game(), "1080p", "High");
    expect(r.estimated).toBeGreaterThan(0);
    expect(Number.isFinite(r.estimated)).toBe(true);
  });
});
