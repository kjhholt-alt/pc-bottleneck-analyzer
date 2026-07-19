import { describe, it, expect } from "vitest";
import {
  MAX_SCORES,
  getScoreColor,
  getScoreGlow,
  getBreakdownColor,
} from "@/lib/score-utils";

describe("MAX_SCORES", () => {
  it("sums to 100", () => {
    const total = Object.values(MAX_SCORES).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

describe("getScoreColor — thresholds (>=80 green, >=60 amber, else red)", () => {
  it.each([
    [100, "var(--green)"],
    [80, "var(--green)"],
    [79, "var(--amber)"],
    [60, "var(--amber)"],
    [59, "var(--red)"],
    [0, "var(--red)"],
  ])("score %i -> %s", (score, color) => {
    expect(getScoreColor(score)).toBe(color);
  });
});

describe("getScoreGlow — matches the same bands", () => {
  it("green glow at 80+, amber at 60-79, red below", () => {
    expect(getScoreGlow(85)).toContain("16, 185, 129"); // green rgb
    expect(getScoreGlow(70)).toContain("245, 158, 11"); // amber rgb
    expect(getScoreGlow(40)).toContain("239, 68, 68"); // red rgb
  });
});

describe("getBreakdownColor — normalizes sub-score against its max", () => {
  it("treats a full sub-score as 100% (green)", () => {
    expect(getBreakdownColor("cpu", 25)).toBe("var(--green)"); // 25/25 = 100%
    expect(getBreakdownColor("ram", 20)).toBe("var(--green)"); // 20/20 = 100%
  });

  it("maps a 60% sub-score to amber and just below to red", () => {
    expect(getBreakdownColor("cpu", 15)).toBe("var(--amber)"); // 15/25 = 60%
    expect(getBreakdownColor("cpu", 14)).toBe("var(--red)"); // 14/25 = 56%
  });

  it("falls back to a max of 25 for an unknown key", () => {
    expect(getBreakdownColor("mystery", 25)).toBe("var(--green)");
  });
});
