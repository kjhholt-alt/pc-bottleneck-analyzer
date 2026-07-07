import { describe, expect, it } from "vitest";
import { generateDeepDiveReport, generateSampleReport } from "../report";
import { renderReportHtml } from "../render";
import type { DeepDiveInput } from "../types";

const FIXED = new Date("2026-07-01T00:00:00Z");

const LOW: DeepDiveInput = {
  cpuName: "AMD Ryzen 5 3600",
  gpuName: "NVIDIA GeForce GTX 1660",
  ramGb: 16,
  resolution: "1080p",
  gameIds: ["cyberpunk", "cs2", "valorant"],
  storageType: "SATA SSD",
};

const HIGH: DeepDiveInput = {
  cpuName: "AMD Ryzen 9 9950X3D",
  gpuName: "NVIDIA GeForce RTX 5090",
  ramGb: 64,
  resolution: "4K",
  gameIds: ["cyberpunk", "alan-wake-2"],
  storageType: "NVMe SSD",
};

describe("generateDeepDiveReport", () => {
  it("is fully deterministic for the same input + clock", () => {
    const a = generateDeepDiveReport(LOW, { now: FIXED });
    const b = generateDeepDiveReport(LOW, { now: FIXED });
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("produces a 3-rung ladder and one game row per requested game", () => {
    const r = generateDeepDiveReport(LOW, { now: FIXED });
    expect(r.ladder).toHaveLength(3);
    expect(r.games).toHaveLength(LOW.gameIds.length);
    expect(r.score.total).toBeGreaterThanOrEqual(0);
    expect(r.score.total).toBeLessThanOrEqual(100);
    expect(r.percentile.overall).toBeGreaterThanOrEqual(0);
    expect(r.percentile.overall).toBeLessThanOrEqual(99);
  });

  it("scores a top-tier rig higher than a budget rig", () => {
    const low = generateDeepDiveReport(LOW, { now: FIXED });
    const high = generateDeepDiveReport(HIGH, { now: FIXED });
    expect(high.score.total).toBeGreaterThan(low.score.total);
  });

  it("gives a top-tier rig no upgrade ladder parts (already best-in-class)", () => {
    const high = generateDeepDiveReport(HIGH, { now: FIXED });
    expect(high.ladder.every((r) => r.part === null)).toBe(true);
  });

  it("rates game FPS with a smoothness label", () => {
    const r = generateDeepDiveReport(LOW, { now: FIXED });
    for (const g of r.games) {
      expect(g.currentFps).toBeGreaterThan(0);
      expect(["Struggling", "Playable", "Smooth", "High-refresh", "Competitive"]).toContain(g.rating);
    }
  });
});

describe("renderReportHtml", () => {
  it("is a self-contained HTML document naming the buyer's parts", () => {
    const r = generateDeepDiveReport(LOW, { now: FIXED });
    const html = renderReportHtml(r);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Ryzen 5 3600");
    expect(html).toContain("GTX 1660");
    expect(html).toContain("Deep-Dive Report");
    expect(html).toContain("noindex");
  });

  it("escapes buyer notes to prevent HTML injection", () => {
    const r = generateDeepDiveReport(
      { ...LOW, notes: "<script>alert('x')</script>" },
      { now: FIXED },
    );
    const html = renderReportHtml(r);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders the sample report with a sample banner", () => {
    const html = renderReportHtml(generateSampleReport(), { sample: true });
    expect(html).toContain("sample");
    expect(html).toContain("Ryzen 5 5600");
  });
});
