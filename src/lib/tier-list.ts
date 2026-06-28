// ─── Data-backed tier-list / ranking engine ─────────────────────────────────
//
// Generates ranked buying guides ("Best Value GPUs 2026", "Best Gaming CPUs",
// etc.) DIRECTLY from the hardware database, so every list is accurate to the
// same data that powers the bottleneck analyzer and can be regenerated on
// demand when prices or the DB change.
//
// The engine is pure (no fs, no network) so it is unit-testable; the runner in
// scripts/generate-tier-list.ts handles reading recipes and writing .mdx.

import { cpuDatabase, gpuDatabase, type HardwareEntry } from "../data/hardware-db";

export type { HardwareEntry } from "../data/hardware-db";

export type Component = "gpu" | "cpu";

/** How to order the list. `value` = gaming performance per dollar. */
export type RankBy = "score" | "value";

export interface TierListRecipe {
  /** URL slug + .mdx filename (no extension). */
  slug: string;
  title: string;
  /** SEO meta description (avoid double quotes — kept YAML-safe on render). */
  description: string;
  component: Component;
  rankBy: RankBy;
  /** How many ranked parts to include in the body. */
  topN: number;
  /** 1–2 paragraph intro, plain markdown. */
  intro: string;
  tags: string[];
  /** Only include parts released in this year or later (freshness filter). */
  minYear?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Drop parts below this gaming score (keeps obsolete e-waste off the list). */
  minScore?: number;
  /** Price ceiling that defines the "best budget" pick. */
  budgetCap?: number;
  author?: string;
}

export interface RankedPart extends HardwareEntry {
  /** Gaming performance per $100 of street price (higher = better value). */
  value: number;
  /** S / A / B / C / D, derived from gaming_score. */
  letter: TierLetter;
  /** 1-based position in the list. */
  rank: number;
}

export type TierLetter = "S" | "A" | "B" | "C" | "D";

const DB: Record<Component, Record<string, HardwareEntry>> = {
  gpu: gpuDatabase,
  cpu: cpuDatabase,
};

const DEFAULT_BUDGET_CAP: Record<Component, number> = {
  gpu: 350,
  cpu: 250,
};

/** Map a 1–100 gaming score onto an S/A/B/C/D letter tier. */
export function letterTier(gamingScore: number): TierLetter {
  if (gamingScore >= 92) return "S";
  if (gamingScore >= 84) return "A";
  if (gamingScore >= 74) return "B";
  if (gamingScore >= 62) return "C";
  return "D";
}

/** Gaming performance per $100 of current street price, rounded to 0.1. */
export function valueScore(entry: HardwareEntry): number {
  const price = entry.current_price_approx || entry.msrp || 1;
  return Math.round((entry.gaming_score / price) * 1000) / 10;
}

/** Apply a recipe's selection filters to the relevant database. */
export function selectParts(recipe: TierListRecipe): HardwareEntry[] {
  return Object.values(DB[recipe.component]).filter((e) => {
    if (recipe.minYear !== undefined && e.release_year < recipe.minYear) return false;
    if (recipe.minScore !== undefined && e.gaming_score < recipe.minScore) return false;
    const price = e.current_price_approx || e.msrp;
    if (recipe.minPrice !== undefined && price < recipe.minPrice) return false;
    if (recipe.maxPrice !== undefined && price > recipe.maxPrice) return false;
    return true;
  });
}

/** Rank the selected parts and take the top N. */
export function rankParts(
  entries: HardwareEntry[],
  rankBy: RankBy,
  topN: number
): RankedPart[] {
  const scored = entries.map((e) => ({
    ...e,
    value: valueScore(e),
    letter: letterTier(e.gaming_score),
    rank: 0,
  }));

  scored.sort((a, b) => {
    const primary =
      rankBy === "value" ? b.value - a.value : b.gaming_score - a.gaming_score;
    if (primary !== 0) return primary;
    // Tie-break on the other metric so order is always deterministic.
    return rankBy === "value"
      ? b.gaming_score - a.gaming_score
      : b.value - a.value;
  });

  return scored.slice(0, topN).map((e, i) => ({ ...e, rank: i + 1 }));
}

export interface TierListPicks {
  bestOverall: RankedPart;
  bestValue: RankedPart;
  bestBudget: RankedPart | null;
}

/** Choose the editorial highlight picks from a ranked list. */
export function choosePicks(
  ranked: RankedPart[],
  budgetCap: number
): TierListPicks {
  const byScore = [...ranked].sort((a, b) => b.gaming_score - a.gaming_score);
  const byValue = [...ranked].sort((a, b) => b.value - a.value);
  const budgetField = ranked.filter(
    (p) => (p.current_price_approx || p.msrp) <= budgetCap
  );
  // Best you can get under the cap = highest gaming score within budget.
  const bestBudget =
    budgetField.sort((a, b) => b.gaming_score - a.gaming_score)[0] ?? null;

  return {
    bestOverall: byScore[0],
    bestValue: byValue[0],
    bestBudget,
  };
}

// ─── Rendering ──────────────────────────────────────────────────────────────

/** Quote a string for YAML frontmatter without the embedded-quote bug. */
export function yamlString(value: string): string {
  if (value.includes('"')) {
    // Single-quote style: escape internal single quotes by doubling them.
    return `'${value.replace(/'/g, "''")}'`;
  }
  return `"${value}"`;
}

function priceStr(entry: HardwareEntry): string {
  return `$${(entry.current_price_approx || entry.msrp).toLocaleString("en-US")}`;
}

function estimateReadingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const TIER_ORDER: TierLetter[] = ["S", "A", "B", "C", "D"];
const TIER_BLURB: Record<TierLetter, string> = {
  S: "Flagship — maximum performance, premium price",
  A: "Enthusiast — high-refresh / high-detail without the flagship tax",
  B: "Sweet spot — where most gamers should shop",
  C: "Budget — solid 1080p and entry 1440p performance",
  D: "Entry — older or low-end, buy only on a deep discount",
};

export interface RenderOptions {
  /** ISO date (YYYY-MM-DD) used for the price-freshness note + updatedAt. */
  dateISO: string;
  /** Preserve an original publish date across regenerations. */
  publishedAt?: string;
}

/**
 * Render a full .mdx document (frontmatter + body) for a recipe and its ranked
 * parts. Output is YAML-safe and free of raw `<digit` so it passes the blog
 * linter and the production MDX build by construction.
 */
export function renderTierListMdx(
  recipe: TierListRecipe,
  ranked: RankedPart[],
  opts: RenderOptions
): string {
  const picks = choosePicks(
    ranked,
    recipe.budgetCap ?? DEFAULT_BUDGET_CAP[recipe.component]
  );
  const componentWord = recipe.component === "gpu" ? "GPU" : "CPU";
  const author = recipe.author ?? "PC Bottleneck Analyzer Team";

  // ── Body ──
  const lines: string[] = [];

  const orderBasis =
    recipe.rankBy === "value"
      ? "real price-to-performance"
      : "real benchmark performance";

  lines.push(`# ${recipe.title}`, "");
  lines.push(recipe.intro.trim(), "");
  lines.push(
    `Every ${componentWord} on this page is ranked straight from our hardware ` +
      `database — the same data that powers our free bottleneck analyzer — so ` +
      `the order reflects ${orderBasis}, not sponsorships. Prices are ` +
      `approximate U.S. street prices as of ${opts.dateISO}.`,
    ""
  );
  lines.push("<AffiliateDisclosure />", "");

  // Tier table (S/A/B/C/D)
  lines.push("## The tier list at a glance", "");
  lines.push("| Tier | What it means | Cards |", "|---|---|---|");
  for (const t of TIER_ORDER) {
    const inTier = ranked.filter((p) => p.letter === t);
    if (inTier.length === 0) continue;
    const names = inTier.map((p) => p.name).join(", ");
    lines.push(`| **${t}** | ${TIER_BLURB[t]} | ${names} |`);
  }
  lines.push("");

  // Full ranking table (pure data — no JSX in cells, keeps the build safe)
  const rankWord = recipe.rankBy === "value" ? "value" : "raw performance";
  lines.push(`## Full ranking by ${rankWord}`, "");
  lines.push(
    "| # | " +
      componentWord +
      " | Tier | Gaming score | Price | Value (perf / $100) |",
    "|---|---|---|---|---|---|"
  );
  for (const p of ranked) {
    lines.push(
      `| ${p.rank} | ${p.name} | ${p.letter} | ${p.gaming_score} | ${priceStr(
        p
      )} | ${p.value.toFixed(1)} |`
    );
  }
  lines.push("");
  lines.push(
    `*Gaming score is a 0–100 composite of relative gaming performance. ` +
      `Value is that score divided by current street price (higher is better ` +
      `value per dollar).*`,
    ""
  );

  // Editorial picks
  lines.push("## Our top picks", "");

  const renderPick = (
    emoji: string,
    label: string,
    p: RankedPart,
    blurb: string
  ) => {
    lines.push(`### ${emoji} ${label}: ${p.name}`, "");
    lines.push(
      `**Tier ${p.letter}** &middot; gaming score ${p.gaming_score}/100 ` +
        `&middot; about ${priceStr(p)} &middot; released ${p.release_year} ` +
        `&middot; value ${p.value.toFixed(1)} perf per $100`,
      ""
    );
    lines.push(blurb, "");
    lines.push(
      `Check current pricing: <AffiliateLink name="${p.name}" />.`,
      ""
    );
  };

  renderPick(
    "🥇",
    "Best overall",
    picks.bestOverall,
    `The highest-performing ${componentWord} on this list. If you want the most ` +
      `frames and have the budget, this is the no-compromise choice.`
  );

  if (picks.bestValue.name !== picks.bestOverall.name) {
    renderPick(
      "💰",
      "Best value",
      picks.bestValue,
      `The best performance-per-dollar pick on the board. It is the smart-money ` +
        `buy for most builders — you give up some peak performance versus the ` +
        `flagship but keep far more cash in your pocket.`
    );
  }

  if (
    picks.bestBudget &&
    picks.bestBudget.name !== picks.bestOverall.name &&
    picks.bestBudget.name !== picks.bestValue.name
  ) {
    renderPick(
      "🛒",
      "Best on a budget",
      picks.bestBudget,
      `The most capable ${componentWord} you can grab without overspending. ` +
        `Ideal for a first build or a tight upgrade budget.`
    );
  }

  // Methodology (transparency = trust + Google E-E-A-T)
  lines.push("## How we rank these", "");
  lines.push(
    `We do not hand-pick favorites. Each ${componentWord} is scored on a 0–100 ` +
      `gaming-performance scale (a composite of 1080p and 1440p benchmark data), ` +
      `then ranked by ${
        recipe.rankBy === "value"
          ? "performance per dollar of current street price"
          : "raw gaming performance"
      }. The same numbers drive the upgrade advice inside our analyzer, so a ` +
      `card cannot rank well here and badly there. Prices are refreshed ` +
      `whenever the database updates; affiliate commissions never change the ` +
      `order.`,
    ""
  );

  // Tool CTA
  lines.push("## Check your PC before you buy", "");
  lines.push(
    `A great ${componentWord} paired with a weak partner part is wasted money. ` +
      `Before you upgrade, run your system through our ` +
      `**[free PC bottleneck analyzer](/)** — it scores your build out of 100, ` +
      `finds your real bottleneck, and tells you exactly which part to upgrade ` +
      `first.`,
    ""
  );
  lines.push(
    `👉 **[Analyze your PC for free](/dashboard)** — it takes about 30 seconds.`,
    ""
  );

  // Related reading (internal links help SEO + dwell time)
  lines.push("## Related guides", "");
  lines.push(
    `- [Best GPU for 1440p Gaming in 2026](/blog/best-gpu-for-1440p-gaming-2026-top-picks-ranked)`,
    `- [Is Your GPU Bottlenecking Your CPU?](/blog/gpu-bottlenecking-cpu)`,
    `- [Best Upgrades for Common PC Bottlenecks in 2026](/blog/best-upgrades-pc-bottlenecks-2026)`,
    ""
  );

  const body = lines.join("\n");

  // ── Frontmatter ──
  const publishedAt = opts.publishedAt ?? opts.dateISO;
  const fm: string[] = ["---"];
  fm.push(`title: ${yamlString(recipe.title)}`);
  fm.push(`description: ${yamlString(recipe.description)}`);
  fm.push(`publishedAt: ${yamlString(publishedAt)}`);
  if (publishedAt !== opts.dateISO) {
    fm.push(`updatedAt: ${yamlString(opts.dateISO)}`);
  }
  fm.push(`author: ${yamlString(author)}`);
  fm.push(`tags: [${recipe.tags.map((t) => yamlString(t)).join(", ")}]`);
  fm.push(`readingTime: ${yamlString(estimateReadingTime(body))}`);
  fm.push("---", "");

  return `${fm.join("\n")}\n${body}\n`;
}

/** End-to-end: select + rank + render a recipe into an .mdx string. */
export function buildTierList(
  recipe: TierListRecipe,
  opts: RenderOptions
): { mdx: string; ranked: RankedPart[] } {
  const ranked = rankParts(selectParts(recipe), recipe.rankBy, recipe.topN);
  const mdx = renderTierListMdx(recipe, ranked, opts);
  return { mdx, ranked };
}
