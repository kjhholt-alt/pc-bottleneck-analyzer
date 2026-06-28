/**
 * Tier-list generator — turns the hardware database into ranked, affiliate-ready
 * buying guides under src/content/blog.
 *
 *   npm run gen:tierlist              # regenerate every ACTIVE recipe
 *   npm run gen:tierlist -- --slug X  # regenerate a single recipe
 *   npm run gen:tierlist -- --list    # list available recipes
 *   npm run gen:tierlist -- --all     # generate every defined recipe
 *
 * Publish dates are preserved across regenerations: an existing post keeps its
 * original `publishedAt` and gets an `updatedAt` stamp, so refreshing prices
 * never resets SEO dates.
 *
 * Runs via tsx (see package.json). Pure-data engine lives in src/lib/tier-list.ts.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { buildTierList, type TierListRecipe } from "../src/lib/tier-list";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(HERE, "..", "src", "content", "blog");

// ── Recipes ──────────────────────────────────────────────────────────────────
// `active` recipes regenerate on a bare `npm run gen:tierlist`. Flip a recipe to
// active (or add a new one) to scale content — no engine changes needed.

interface Recipe extends TierListRecipe {
  active: boolean;
}

const RECIPES: Recipe[] = [
  {
    active: true,
    slug: "best-graphics-cards-2026-ranked",
    title: "Best Graphics Cards for Gaming in 2026, Ranked",
    description:
      "Every graphics card worth buying in 2026, ranked by benchmark performance with a price-to-performance value score for each. Find the right GPU for your budget.",
    component: "gpu",
    rankBy: "score",
    topN: 14,
    minYear: 2021,
    minScore: 55,
    budgetCap: 350,
    tags: [
      "best gpu 2026",
      "best graphics card",
      "gpu tier list",
      "graphics card ranking",
      "price to performance",
      "PC hardware",
    ],
    intro:
      "Picking a graphics card in 2026 comes down to two questions: how much " +
      "raw performance do you need, and how much value does each card give you " +
      "for the money? This list ranks every GPU worth buying by benchmark " +
      "performance, then shows you the price-to-performance value of each so " +
      "you can spot the smart-money picks — not just the most expensive ones.",
  },
  // ── Defined and ready, not yet active (flip `active: true` to scale) ──
  {
    active: true,
    slug: "best-gaming-cpus-2026-ranked",
    title: "Best Gaming CPUs in 2026, Ranked",
    description:
      "Every current gaming CPU ranked by performance and value from our benchmark database. Find the best processor for your gaming build in 2026.",
    component: "cpu",
    rankBy: "score",
    topN: 14,
    minYear: 2022,
    minScore: 60,
    budgetCap: 250,
    tags: [
      "best cpu 2026",
      "best gaming cpu",
      "processor",
      "cpu tier list",
      "PC hardware",
    ],
    intro:
      "Your CPU sets the frame-rate ceiling — especially at 1080p and on " +
      "high-refresh monitors. Here is every current gaming processor ranked " +
      "from our benchmark database, with the best value and budget picks called out.",
  },
  {
    active: true,
    slug: "best-budget-graphics-cards-2026-under-350",
    title: "Best Budget Graphics Cards in 2026 (Under $350)",
    description:
      "The best cheap graphics cards in 2026, ranked by value from our benchmark database. Great 1080p and entry 1440p gaming without overspending.",
    component: "gpu",
    rankBy: "value",
    topN: 10,
    minYear: 2021,
    minScore: 45,
    maxPrice: 350,
    budgetCap: 250,
    tags: [
      "best budget gpu",
      "cheap graphics card",
      "gpu under 350",
      "1080p gaming",
      "PC hardware",
    ],
    intro:
      "You do not need to spend a fortune for great 1080p — and even entry " +
      "1440p — gaming. These are the best graphics cards under $350 in 2026, " +
      "ranked by value straight from our benchmark database.",
  },
];

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function existingPublishedAt(slug: string): string | undefined {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return undefined;
  try {
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    return typeof data.publishedAt === "string" ? data.publishedAt : undefined;
  } catch {
    return undefined;
  }
}

function generate(recipe: Recipe): void {
  const dateISO = todayISO();
  const publishedAt = existingPublishedAt(recipe.slug);
  const { mdx, ranked } = buildTierList(recipe, { dateISO, publishedAt });

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const file = path.join(BLOG_DIR, `${recipe.slug}.mdx`);
  fs.writeFileSync(file, mdx, "utf-8");

  const top = ranked
    .slice(0, 3)
    .map((p) => `${p.rank}. ${p.name} (${p.letter}, value ${p.value})`)
    .join("  ");
  console.log(
    `[gen] ${recipe.slug}.mdx — ${ranked.length} ranked` +
      `${publishedAt ? " (kept publishedAt " + publishedAt + ")" : " (new)"}\n` +
      `      top: ${top}`
  );
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    for (const r of RECIPES) {
      console.log(`${r.active ? "[active]" : "[ready ]"} ${r.slug} — ${r.title}`);
    }
    return;
  }

  const slugArg = args.indexOf("--slug");
  let toGen: Recipe[];
  if (slugArg !== -1) {
    const slug = args[slugArg + 1];
    const r = RECIPES.find((x) => x.slug === slug);
    if (!r) {
      console.error(`No recipe with slug "${slug}". Try --list.`);
      process.exit(1);
    }
    toGen = [r];
  } else if (args.includes("--all")) {
    toGen = RECIPES;
  } else {
    toGen = RECIPES.filter((r) => r.active);
  }

  console.log(`Generating ${toGen.length} tier list(s) into ${BLOG_DIR}\n`);
  for (const r of toGen) generate(r);
  console.log(`\nDone. Run the blog linter + build to verify.`);
}

main();
