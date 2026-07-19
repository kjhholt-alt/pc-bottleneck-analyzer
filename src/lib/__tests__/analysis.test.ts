import { describe, it, expect } from "vitest";
import { analyzeScan } from "@/lib/analysis";
import { sampleScan } from "@/data/sample-scan";
import { optimalScan, cloneScan } from "@/lib/__tests__/_fixtures";
import type { Bottleneck } from "@/lib/types";

const ids = (bs: Bottleneck[]) => bs.map((b) => b.id);

describe("analyzeScan — optimal baseline", () => {
  const result = analyzeScan(optimalScan());

  it("produces zero bottlenecks for a fully-optimized system", () => {
    expect(result.bottlenecks).toHaveLength(0);
  });

  it("scores 94/100 with grade A and the expected breakdown", () => {
    expect(result.score.breakdown).toEqual({
      cpu: 22,
      gpu: 22,
      ram: 20,
      storage: 15,
      settings: 15,
    });
    expect(result.score.total).toBe(94);
    expect(result.score.grade).toBe("A");
  });

  it("sub-scores always sum to the total", () => {
    const b = result.score.breakdown;
    expect(b.cpu + b.gpu + b.ram + b.storage + b.settings).toBe(
      result.score.total,
    );
  });
});

describe("CPU detection rules", () => {
  it("flags a CPU bottleneck when CPU is pegged and GPU is idle", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.usage_per_core = Array(8).fill(95);
    scan.gpu.gpu_utilization_pct = 50;
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("cpu-high-usage");
  });

  it("flags a CPU/GPU tier mismatch when the CPU is 2+ tiers below the GPU", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.model_name = "AMD Ryzen 5 5600"; // mid
    // GPU stays RTX 4090 (very_high) → 2-tier gap
    const result = analyzeScan(scan);
    expect(ids(result.bottlenecks)).toContain("cpu-gpu-tier-mismatch");
    // and a CPU upgrade recommendation should follow
    expect(result.recommendations.map((r) => r.id)).toContain(
      "rec-cpu-upgrade",
    );
  });

  it("flags a CPU that is not reaching its boost clock", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.current_clock_ghz = 4.0; // < 5.2 * 0.85
    scan.cpu.usage_per_core = Array(8).fill(60); // > 50
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("cpu-not-boosting");
  });
});

describe("RAM detection rules", () => {
  it("flags single-channel RAM as critical", () => {
    const scan = cloneScan(optimalScan());
    scan.ram.channel_mode = "single";
    const bn = analyzeScan(scan).bottlenecks.find(
      (b) => b.id === "ram-single-channel",
    );
    expect(bn?.severity).toBe("critical");
  });

  it("flags DDR4 running below 3000 MHz (XMP off)", () => {
    const scan = cloneScan(optimalScan());
    scan.ram.form_factor = "DIMM DDR4";
    scan.ram.speed_mhz = 2133;
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("ram-slow-speed");
  });

  it("flags DDR5 running below its 4800 MHz base spec", () => {
    const scan = cloneScan(optimalScan());
    scan.ram.speed_mhz = 4000; // form_factor already DDR5
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("ram-slow-speed-ddr5");
  });

  it("flags low total RAM capacity", () => {
    const scan = cloneScan(optimalScan());
    scan.ram.total_gb = 8;
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("ram-low-capacity");
  });
});

describe("storage detection rules", () => {
  it("flags an HDD boot drive as critical", () => {
    const scan = cloneScan(optimalScan());
    scan.storage[0].type = "HDD";
    const bn = analyzeScan(scan).bottlenecks.find(
      (b) => b.id === "storage-hdd-boot",
    );
    expect(bn?.severity).toBe("critical");
  });

  it("flags an unhealthy drive", () => {
    const scan = cloneScan(optimalScan());
    scan.storage[0].health_status = "Caution";
    expect(
      analyzeScan(scan).bottlenecks.some((b) =>
        b.id.startsWith("storage-health-"),
      ),
    ).toBe(true);
  });
});

describe("thermal detection rules", () => {
  it("flags CPU thermal throttling above 85C", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.current_temp_c = 92;
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("thermal-cpu-critical");
  });

  it("does not flag thermals when the temperature is null (unknown)", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.current_temp_c = null;
    scan.gpu.current_temp_c = null;
    expect(
      analyzeScan(scan).bottlenecks.some((b) => b.category === "thermal"),
    ).toBe(false);
  });
});

describe("settings detection rules", () => {
  it("flags XMP/DOCP disabled as critical", () => {
    const scan = cloneScan(optimalScan());
    scan.bios_settings.xmp_enabled = false;
    const bn = analyzeScan(scan).bottlenecks.find(
      (b) => b.id === "settings-xmp-off",
    );
    expect(bn?.severity).toBe("critical");
  });

  it("flags a non-performance power plan", () => {
    const scan = cloneScan(optimalScan());
    scan.os.power_plan = "Balanced";
    expect(ids(analyzeScan(scan).bottlenecks)).toContain("settings-power-plan");
  });
});

describe("sorting & recommendations", () => {
  it("sorts bottlenecks critical → warning → info", () => {
    const scan = cloneScan(optimalScan());
    scan.ram.channel_mode = "single"; // critical
    scan.os.power_plan = "Balanced"; // warning
    scan.bios_settings.resizable_bar = false; // info
    const order = { critical: 0, warning: 1, info: 2, good: 3 } as const;
    const sevs = analyzeScan(scan).bottlenecks.map((b) => order[b.severity]);
    const sorted = [...sevs].sort((a, b) => a - b);
    expect(sevs).toEqual(sorted);
  });

  it("orders recommendations free → cheap → upgrade", () => {
    const scan = cloneScan(optimalScan());
    scan.bios_settings.xmp_enabled = false; // free: enable XMP
    scan.ram.channel_mode = "single"; // cheap: 2nd stick
    scan.cpu.model_name = "AMD Ryzen 5 5600"; // upgrade: CPU tier mismatch vs 4090
    const tierRank = { free: 0, cheap: 1, upgrade: 2 } as const;
    const tiers = analyzeScan(scan).recommendations.map((r) => tierRank[r.tier]);
    const sorted = [...tiers].sort((a, b) => a - b);
    expect(tiers).toEqual(sorted);
    // sanity: all three tiers represented
    expect(new Set(tiers)).toEqual(new Set([0, 1, 2]));
  });
});

describe("regression — unknown hardware scores neutral mid (not perfect)", () => {
  it("defaults unrecognized CPU/GPU to 14, not 25", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.model_name = "Mystery CPU XYZ";
    scan.gpu.model_name = "Mystery GPU XYZ";
    const b = analyzeScan(scan).score.breakdown;
    expect(b.cpu).toBe(14);
    expect(b.gpu).toBe(14);
  });
});

describe("regression — sample/demo scan output is stable", () => {
  const result = analyzeScan(sampleScan);

  it("scores the demo system at 67/100, grade C", () => {
    expect(result.score.total).toBe(67);
    expect(result.score.grade).toBe("C");
  });

  it("surfaces the demo's two headline critical fixes", () => {
    const critical = result.bottlenecks
      .filter((b) => b.severity === "critical")
      .map((b) => b.id);
    expect(critical).toContain("settings-xmp-off");
    expect(critical).toContain("ram-slow-speed");
  });

  it("recommends enabling XMP first (highest-priority free fix)", () => {
    expect(result.recommendations[0].id).toBe("rec-enable-xmp");
  });
});

describe("grade mapping follows total score bands", () => {
  function expectedGrade(total: number): string {
    if (total >= 90) return "A";
    if (total >= 80) return "A-";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    return "D";
  }

  it("agrees with the band table across varied systems", () => {
    const scans = [optimalScan(), sampleScan];
    for (const s of scans) {
      const r = analyzeScan(s);
      expect(r.score.grade).toBe(expectedGrade(r.score.total));
    }
  });

  it("assigns grade D to a thoroughly broken system", () => {
    const scan = cloneScan(optimalScan());
    scan.cpu.model_name = "Unknown"; // 14
    scan.gpu.model_name = "Unknown"; // 14
    scan.ram.channel_mode = "single";
    scan.ram.form_factor = "DIMM DDR4";
    scan.ram.speed_mhz = 2133;
    scan.storage[0].type = "HDD";
    scan.os.power_plan = "Power saver";
    scan.bios_settings.xmp_enabled = false;
    scan.bios_settings.resizable_bar = false;
    scan.os.game_mode = false;
    scan.os.hw_accelerated_gpu_scheduling = false;
    scan.gpu.driver_version = "";
    const r = analyzeScan(scan);
    expect(r.score.total).toBeLessThan(60);
    expect(r.score.grade).toBe("D");
  });
});
