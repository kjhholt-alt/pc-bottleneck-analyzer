import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cpu, MonitorCog, Trophy } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { EmailCapture } from "@/components/EmailCapture";
import { BlueprintCTA } from "@/components/BlueprintCTA";
import type { TierListFeedEntry } from "@/lib/tier-list";

export const metadata: Metadata = {
  title: "PC Hardware Tier Lists 2026 — Best GPUs & CPUs Ranked",
  description:
    "Data-backed PC hardware tier lists for 2026. Every GPU and CPU ranked by real benchmark performance and price-to-performance value, updated from our database.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/tier-lists" },
};

function getTierLists(): TierListFeedEntry[] {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public", "tier-lists.json"),
      "utf-8"
    );
    return (JSON.parse(raw).lists ?? []) as TierListFeedEntry[];
  } catch {
    return [];
  }
}

export default function TierListsPage() {
  const lists = getTierLists();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PC Hardware Tier Lists 2026",
    itemListElement: lists.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: l.title,
      url: l.url,
    })),
  };

  return (
    <main className="min-h-screen">
      <NavHeader />

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
          <Trophy size={14} />
          RANKED FROM REAL BENCHMARK DATA
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          PC Hardware Tier Lists
        </h1>
        <p className="text-text-secondary max-w-2xl mb-12">
          Every list below is generated straight from our hardware database — the
          same data that powers the free bottleneck analyzer — so the rankings
          reflect real performance and price-to-performance value, not
          sponsorships. Pick your part, then check your build.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {lists.map((list) => {
            const isGpu = list.component === "gpu";
            return (
              <Link key={list.slug} href={`/blog/${list.slug}`} className="group">
                <article className="h-full bg-surface border border-border rounded-2xl p-6 hover:border-cyan/40 transition-colors flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-secondary mb-3">
                    {isGpu ? <MonitorCog size={14} /> : <Cpu size={14} />}
                    <span>{isGpu ? "GPU" : "CPU"}</span>
                    <span>&middot;</span>
                    <span>{list.count} ranked</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-cyan transition-colors">
                    {list.title}
                  </h2>
                  <p className="text-sm text-text-secondary mb-4 flex-1">
                    {list.description}
                  </p>
                  {list.picks?.bestValue && (
                    <p className="text-xs text-text-secondary mb-4">
                      <span className="text-cyan font-semibold">
                        Best value:
                      </span>{" "}
                      {list.picks.bestValue}
                    </p>
                  )}
                  <span className="text-cyan text-sm flex items-center gap-1">
                    View the ranking <ArrowRight size={14} />
                  </span>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="bg-surface border border-cyan/30 rounded-2xl p-6 text-center mb-12">
          <h3 className="text-lg font-semibold mb-2">
            Not sure what to upgrade?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Run your PC through the free analyzer — it finds your real bottleneck
            and tells you exactly which part to buy first.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
          >
            Analyze My PC <ArrowRight size={14} />
          </Link>
        </div>

        <BlueprintCTA className="mb-12" />

        <EmailCapture source="tier-lists-hub" />
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by Claude
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </main>
  );
}
