import { describe, it, expect } from "vitest";
import { getPercentiles } from "@/lib/percentile";
import { analyzeScan } from "@/lib/analysis";
import { optimalScan, cloneScan } from "@/lib/__tests__/_fixtures";

function percentiles(mutate: (s: ReturnType<typeof optimalScan>) => void = () => {}) {
  const scan = cloneScan(optimalScan());
  mutate(scan);
  return getPercentiles(scan, analyzeScan(scan));
}

describe("getPercentiles — bounds", () => {
  it("keeps every percentile within 0..100", () => {
    const p = percentiles();
    for (const v of [p.overall, p.cpu, p.gpu, p.ram]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("caps overall at 99 even for a top-end rig", () => {
    expect(percentiles().overall).toBeLessThanOrEqual(99);
  });
});

describe("getPercentiles — ordering", () => {
  it("ranks a high-end GPU above a low-end one", () => {
    const high = percentiles((s) => (s.gpu.model_name = "NVIDIA GeForce RTX 5090")).gpu;
    const low = percentiles((s) => (s.gpu.model_name = "NVIDIA GeForce GTX 1050")).gpu;
    expect(high).toBeGreaterThan(low);
  });

  it("ranks a high-end CPU above a low-end one", () => {
    const high = percentiles((s) => (s.cpu.model_name = "AMD Ryzen 7 9800X3D")).cpu;
    const low = percentiles((s) => (s.cpu.model_name = "Intel Core i3-10100F")).cpu;
    expect(high).toBeGreaterThan(low);
  });

  it("ranks a beefy RAM config above a weak one", () => {
    const big = percentiles((s) => {
      s.ram.total_gb = 64;
      s.ram.speed_mhz = 7200;
      s.ram.channel_mode = "quad";
    }).ram;
    const small = percentiles((s) => {
      s.ram.total_gb = 8;
      s.ram.speed_mhz = 2133;
      s.ram.channel_mode = "single";
    }).ram;
    expect(big).toBeGreaterThan(small);
  });
});

describe("getPercentiles — unknown hardware fallback", () => {
  it("defaults unknown CPU/GPU to the 50th percentile", () => {
    const p = percentiles((s) => {
      s.cpu.model_name = "Mystery CPU";
      s.gpu.model_name = "Mystery GPU";
    });
    expect(p.cpu).toBe(50);
    expect(p.gpu).toBe(50);
  });
});
