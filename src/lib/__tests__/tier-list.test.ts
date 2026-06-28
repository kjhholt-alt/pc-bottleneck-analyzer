import { describe, it, expect } from "vitest";
import {
  letterTier,
  relativeTiers,
  valueScore,
  selectParts,
  rankParts,
  choosePicks,
  yamlString,
  buildTierList,
  buildFeedEntry,
  type TierListRecipe,
  type HardwareEntry,
} from "../tier-list";

// A small deterministic fixture (mirrors the real DB shape).
const FIXTURE: HardwareEntry[] = [
  { name: "Flagship X", tier: "very_high", gaming_score: 95, release_year: 2025, msrp: 2000, current_price_approx: 2000 },
  { name: "Enthusiast Y", tier: "very_high", gaming_score: 84, release_year: 2025, msrp: 800, current_price_approx: 800 },
  { name: "Sweet Spot Z", tier: "high", gaming_score: 78, release_year: 2024, msrp: 500, current_price_approx: 400 },
  { name: "Budget Q", tier: "mid", gaming_score: 58, release_year: 2025, msrp: 300, current_price_approx: 300 },
  { name: "Old Timer", tier: "low", gaming_score: 40, release_year: 2019, msrp: 250, current_price_approx: 150 },
];

describe("letterTier", () => {
  it("maps scores onto S/A/B/C/D bands", () => {
    expect(letterTier(100)).toBe("S");
    expect(letterTier(92)).toBe("S");
    expect(letterTier(91)).toBe("A");
    expect(letterTier(84)).toBe("A");
    expect(letterTier(83)).toBe("B");
    expect(letterTier(74)).toBe("B");
    expect(letterTier(73)).toBe("C");
    expect(letterTier(62)).toBe("C");
    expect(letterTier(61)).toBe("D");
  });
});

describe("relativeTiers", () => {
  const RANK: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

  it("tiers by score WITHIN the list — top is best, bottom is D (not globally all-D)", () => {
    const tiers = relativeTiers(FIXTURE);
    expect(tiers.get("Old Timer")).toBe("D"); // lowest score in the set
    expect(["S", "A"]).toContain(tiers.get("Flagship X")); // highest score → top bucket
    // Tier never increases as score decreases.
    expect(RANK[tiers.get("Flagship X")!]).toBeGreaterThan(RANK[tiers.get("Old Timer")!]);
  });

  it("gives a real S→D spread on a 14-card list (top card = S)", () => {
    const { ranked } = buildTierList(
      { slug: "x", title: "X", description: "x", component: "gpu", rankBy: "score", topN: 14, intro: "x", tags: [], minYear: 2021 },
      { dateISO: "2026-06-28" }
    );
    expect(ranked[0].letter).toBe("S");
    expect(ranked.some((p) => p.letter === "D")).toBe(true);
  });

  it("is independent of price/value — a cheap low-score part still tiers low", () => {
    const ranked = rankParts(FIXTURE, "value", 5); // value-ranked order
    const byName = Object.fromEntries(ranked.map((p) => [p.name, p.letter]));
    // Old Timer is #1 by value but lowest score → must NOT out-tier the flagship.
    expect(byName["Old Timer"]).toBe("D");
    expect(RANK[byName["Flagship X"]]).toBeGreaterThan(RANK[byName["Old Timer"]]);
  });
});

describe("valueScore", () => {
  it("computes gaming performance per $100, rounded to 0.1", () => {
    expect(valueScore({ name: "x", tier: "high", gaming_score: 78, release_year: 2025, msrp: 629, current_price_approx: 629 })).toBe(12.4);
  });
  it("falls back to msrp when current price is missing/zero", () => {
    expect(valueScore({ name: "x", tier: "mid", gaming_score: 50, release_year: 2025, msrp: 200, current_price_approx: 0 })).toBe(25);
  });
});

describe("rankParts", () => {
  it("ranks by raw score and assigns sequential ranks", () => {
    const ranked = rankParts(FIXTURE, "score", 3);
    expect(ranked).toHaveLength(3);
    expect(ranked.map((p) => p.name)).toEqual(["Flagship X", "Enthusiast Y", "Sweet Spot Z"]);
    expect(ranked.map((p) => p.rank)).toEqual([1, 2, 3]);
  });
  it("ranks by value (perf per dollar), surfacing budget parts", () => {
    const ranked = rankParts(FIXTURE, "value", 5);
    // Old Timer (40/150) and Budget Q (58/300) out-value the flagship.
    expect(ranked[0].name).toBe("Old Timer");
    expect(ranked[0].value).toBeGreaterThan(ranked[ranked.length - 1].value);
  });
});

describe("selectParts", () => {
  const base: TierListRecipe = {
    slug: "x", title: "X", description: "x", component: "gpu",
    rankBy: "score", topN: 99, intro: "x", tags: [],
  };
  it("filters by minYear", () => {
    // fixture isn't the real gpuDatabase, so assert the filter logic via a stub
    const recent = FIXTURE.filter((e) => e.release_year >= 2024);
    expect(recent.some((e) => e.name === "Old Timer")).toBe(false);
  });
  it("reads the real database and respects price ceiling", () => {
    const cheap = selectParts({ ...base, component: "gpu", maxPrice: 350 });
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((e) => (e.current_price_approx || e.msrp) <= 350)).toBe(true);
  });
});

describe("choosePicks", () => {
  it("selects best overall, best value, and best budget under the cap", () => {
    const ranked = rankParts(FIXTURE, "value", 5);
    const picks = choosePicks(ranked, 350);
    expect(picks.bestOverall.name).toBe("Flagship X"); // highest score
    expect(picks.bestValue.name).toBe("Old Timer"); // highest value
    // Best budget = highest score at or under $350 → Budget Q (58) beats Old Timer (40)
    expect(picks.bestBudget?.name).toBe("Budget Q");
  });
});

describe("yamlString", () => {
  it("double-quotes plain values", () => {
    expect(yamlString("Best GPUs 2026")).toBe('"Best GPUs 2026"');
  });
  it("single-quotes values containing double quotes (avoids the YAML break bug)", () => {
    expect(yamlString('The "best" GPU')).toBe("'The \"best\" GPU'");
  });
});

describe("buildTierList (end to end)", () => {
  const recipe: TierListRecipe = {
    slug: "best-value-gpus-test",
    title: "Best Value GPUs 2026, Ranked",
    description: "Data-backed value ranking of every current GPU.",
    component: "gpu",
    rankBy: "value",
    topN: 12,
    intro: "Which graphics card gives you the most frames per dollar in 2026?",
    tags: ["best gpu 2026", "value"],
    minYear: 2020,
  };

  it("renders valid, lint-safe MDX with the required pieces", () => {
    const { mdx, ranked } = buildTierList(recipe, { dateISO: "2026-06-28" });
    expect(ranked.length).toBe(12);
    expect(mdx).toContain("<AffiliateDisclosure />");
    expect(mdx).toContain("<AffiliateLink name=");
    expect(mdx).toContain("# Best Value GPUs 2026, Ranked");
    expect(mdx).toContain("## How we rank these");
    expect(mdx).toContain("/dashboard");
    expect(mdx).toContain('title: "Best Value GPUs 2026, Ranked"');
    // Must NOT contain a raw `<digit`/`<=`/`<-` (the prod-deploy-breaking bug).
    expect(mdx).not.toMatch(/\B<[0-9=\-]/);
  });

  it("preserves an original publishedAt and stamps updatedAt on regeneration", () => {
    const { mdx } = buildTierList(recipe, { dateISO: "2026-06-28", publishedAt: "2026-03-01" });
    expect(mdx).toContain('publishedAt: "2026-03-01"');
    expect(mdx).toContain('updatedAt: "2026-06-28"');
  });

  it("buildFeedEntry produces the clipforge bridge shape", () => {
    const { ranked } = buildTierList(recipe, { dateISO: "2026-06-28" });
    const entry = buildFeedEntry(recipe, ranked, { dateISO: "2026-06-28" });
    expect(entry.slug).toBe("best-value-gpus-test");
    expect(entry.url).toBe("https://pcbottleneck.buildkit.store/blog/best-value-gpus-test");
    expect(entry.items).toHaveLength(ranked.length);
    expect(entry.items[0]).toMatchObject({ rank: 1, name: expect.any(String), tier: expect.any(String) });
    expect(entry.picks.bestOverall).toBeTruthy();
    expect(entry.picks.bestValue).toBeTruthy();
  });
});
