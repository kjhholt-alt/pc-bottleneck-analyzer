// ─── Head-to-head hardware comparison ("X vs Y") ─────────────────────────────
//
// Powers /compare/<a>-vs-<b> pages — high-intent, long-tail SEO ("rtx 5070 vs
// rx 9070 xt") generated straight from the hardware database.

import {
  cpuDatabase,
  gpuDatabase,
  type HardwareEntry,
} from "@/data/hardware-db";
import { valueScore } from "@/lib/tier-list";

export type Component = "gpu" | "cpu";

export interface ResolvedPart {
  entry: HardwareEntry;
  component: Component;
  slug: string;
}

/** Brand-stripped, kebab-cased slug for a part name (e.g. "rtx-5070"). */
export function slugifyPart(name: string): string {
  return name
    .replace(/NVIDIA GeForce |AMD Radeon |Intel Core |AMD |Intel /gi, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let _index: Map<string, ResolvedPart> | null = null;

function index(): Map<string, ResolvedPart> {
  if (_index) return _index;
  const m = new Map<string, ResolvedPart>();
  const add = (db: Record<string, HardwareEntry>, component: Component) => {
    for (const entry of Object.values(db)) {
      const slug = slugifyPart(entry.name);
      if (!m.has(slug)) m.set(slug, { entry, component, slug });
    }
  };
  add(gpuDatabase, "gpu");
  add(cpuDatabase, "cpu");
  _index = m;
  return m;
}

export function resolvePart(slug: string): ResolvedPart | null {
  return index().get(slug) ?? null;
}

/** Parse a "<a>-vs-<b>" matchup slug into its two part slugs. */
export function parseMatchup(slug: string): [string, string] | null {
  const i = slug.indexOf("-vs-");
  if (i === -1) return null;
  return [slug.slice(0, i), slug.slice(i + 4)];
}

export function matchupSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}

export interface Comparison {
  a: ResolvedPart;
  b: ResolvedPart;
  fasterName: string; // higher gaming score
  pctFaster: number; // how much faster, %
  betterValueName: string; // higher perf-per-$
  cheaperName: string;
  sameComponent: boolean;
  /** Plain-language overall recommendation. */
  verdict: string;
}

export function compare(a: ResolvedPart, b: ResolvedPart): Comparison {
  const av = valueScore(a.entry);
  const bv = valueScore(b.entry);
  const faster = a.entry.gaming_score >= b.entry.gaming_score ? a : b;
  const slower = faster === a ? b : a;
  const pctFaster =
    slower.entry.gaming_score > 0
      ? Math.round(
          ((faster.entry.gaming_score - slower.entry.gaming_score) /
            slower.entry.gaming_score) *
            100
        )
      : 0;
  const betterValue = av >= bv ? a : b;
  const cheaper =
    (a.entry.current_price_approx || a.entry.msrp) <=
    (b.entry.current_price_approx || b.entry.msrp)
      ? a
      : b;

  let verdict: string;
  if (pctFaster <= 2) {
    verdict =
      `The ${faster.entry.name} and ${slower.entry.name} are nearly identical ` +
      `in performance, so buy whichever is cheaper — currently the ` +
      `${cheaper.entry.name}.`;
  } else if (betterValue.entry.name === faster.entry.name) {
    verdict =
      `The ${faster.entry.name} wins outright — it's about ${pctFaster}% faster ` +
      `AND the better value. Get it unless you find the ${slower.entry.name} at a ` +
      `steep discount.`;
  } else {
    verdict =
      `The ${faster.entry.name} is about ${pctFaster}% faster, but the ` +
      `${betterValue.entry.name} gives you more performance per dollar. Go ` +
      `${faster.entry.name} for max frames, ${betterValue.entry.name} for value.`;
  }

  return {
    a,
    b,
    fasterName: faster.entry.name,
    pctFaster,
    betterValueName: betterValue.entry.name,
    cheaperName: cheaper.entry.name,
    sameComponent: a.component === b.component,
    verdict,
  };
}

/** Curated popular matchups. generateStaticParams filters to resolvable pairs. */
export const MATCHUPS: [string, string][] = [
  // GPUs
  ["rtx-5070", "rx-9070-xt"],
  ["rtx-5070-ti", "rx-7900-xtx"],
  ["rtx-5080", "rx-7900-xtx"],
  ["rtx-4070-super", "rx-7800-xt"],
  ["rtx-4070", "rx-7800-xt"],
  ["rtx-5060", "rx-9060-xt"],
  ["rtx-5090", "rtx-4090"],
  ["rtx-4070-ti-super", "rx-7900-xt"],
  ["rtx-3060", "rx-6600"],
  ["arc-b580", "rtx-4060"],
  ["rtx-5070", "rtx-4070-super"],
  ["rx-9070-xt", "rx-7900-xt"],
  // CPUs
  ["ryzen-7-9800x3d", "ryzen-9-9950x3d"],
  ["ryzen-7-7800x3d", "ryzen-7-9800x3d"],
  ["ryzen-5-9600x", "ryzen-5-7600x"],
  ["ryzen-7-9700x", "ryzen-7-7700x"],
];

export interface MatchupCard {
  slug: string;
  a: string;
  b: string;
  component: Component;
}

/** The matchups whose BOTH parts resolve, with display names — for the index. */
export function resolvedMatchups(): MatchupCard[] {
  const out: MatchupCard[] = [];
  for (const [a, b] of MATCHUPS) {
    const ra = resolvePart(a);
    const rb = resolvePart(b);
    if (ra && rb) {
      out.push({
        slug: matchupSlug(a, b),
        a: ra.entry.name,
        b: rb.entry.name,
        component: ra.component,
      });
    }
  }
  return out;
}
