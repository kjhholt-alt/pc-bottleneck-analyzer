import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { allGames, gameSlug } from "@/lib/gpu-for-game";

export const metadata: Metadata = {
  title: "Best GPU for Every Game (2026) — FPS-Ranked Picks",
  description:
    "Find the best graphics card for the game you actually play. GPUs ranked by estimated FPS at 1080p and 1440p for 20 popular titles.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/best-gpu-for" },
};

export default function BestGpuForIndex() {
  const games = allGames();
  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
          <Gauge size={14} />
          PICK THE CARD FOR YOUR GAME
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Best GPU for Every Game
        </h1>
        <p className="text-text-secondary max-w-2xl mb-12">
          Don&apos;t buy a card for benchmarks you&apos;ll never run. Pick the game
          you actually play and see which GPUs hit 60, 144, or max FPS — ranked
          from our benchmark data.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/best-gpu-for/${gameSlug(g)}`}
              className="group bg-surface border border-border rounded-xl px-4 py-3.5 hover:border-cyan/40 transition-colors flex items-center justify-between gap-2"
            >
              <span className="text-sm font-medium group-hover:text-cyan transition-colors">
                {g.title}
              </span>
              <ArrowRight size={14} className="text-text-secondary shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by Claude
        </div>
      </footer>
    </main>
  );
}
