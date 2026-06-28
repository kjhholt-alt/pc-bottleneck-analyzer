"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Recommendation } from "@/lib/types";

/**
 * Funnel closer: route analyzer users into the data-backed buying guides
 * (tier lists / comparisons / best-GPU-for-game) based on their bottleneck.
 */
export function RelatedGuides({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const ids = new Set(recommendations.map((r) => r.id));
  const wantsGpu = ids.has("rec-gpu-upgrade");
  const wantsCpu = ids.has("rec-cpu-upgrade");

  const links: { href: string; label: string }[] = [];
  if (wantsGpu) {
    links.push({
      href: "/blog/best-graphics-cards-2026-ranked",
      label: "Best graphics cards in 2026, ranked",
    });
    links.push({
      href: "/best-gpu-for",
      label: "Best GPU for the game you play",
    });
  }
  if (wantsCpu) {
    links.push({
      href: "/blog/best-gaming-cpus-2026-ranked",
      label: "Best gaming CPUs in 2026, ranked",
    });
  }
  // Always useful.
  links.push({
    href: "/compare",
    label: "Head-to-head GPU & CPU comparisons",
  });
  if (!wantsGpu && !wantsCpu) {
    links.push({ href: "/tier-lists", label: "All PC hardware tier lists" });
  }

  // De-dupe by href.
  const seen = new Set<string>();
  const unique = links.filter((l) =>
    seen.has(l.href) ? false : (seen.add(l.href), true)
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={15} className="text-cyan" />
        <h3 className="font-semibold text-sm">Before you buy</h3>
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Data-backed picks to spend your upgrade budget wisely.
      </p>
      <div className="space-y-1">
        {unique.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between gap-3 text-sm text-text-secondary hover:text-cyan transition-colors py-1.5"
          >
            <span>{l.label}</span>
            <ArrowRight size={14} className="shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
