import { describe, expect, it } from "vitest";
import { estimateResaleValue } from "../resale";
import { cpuDatabase, gpuDatabase } from "@/data/hardware-db";

describe("estimateResaleValue", () => {
  it("never exceeds the part's own current price, for every part in the DB", () => {
    const currentYear = 2026;
    for (const entry of [
      ...Object.values(cpuDatabase),
      ...Object.values(gpuDatabase),
    ]) {
      const resale = estimateResaleValue(entry, currentYear);
      const price = entry.current_price_approx || entry.msrp;
      expect(resale).toBeLessThan(price);
      expect(resale).toBeGreaterThanOrEqual(0);
    }
  });

  it("depreciates older parts more than newer ones of the same tier", () => {
    const newer = gpuDatabase["nvidia geforce rtx 5070"]; // 2025, high tier
    const older = gpuDatabase["nvidia geforce rtx 3060"]; // older, low tier
    expect(estimateResaleValue(newer, 2026)).toBeGreaterThan(
      estimateResaleValue(older, 2026),
    );
  });
});
