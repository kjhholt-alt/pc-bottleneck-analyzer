import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { resolvedMatchups } from "@/lib/compare";

export const metadata: Metadata = {
  title: "GPU & CPU Comparisons — Head-to-Head (2026)",
  description:
    "Side-by-side GPU and CPU comparisons from real benchmark data. See which graphics card or processor is the better buy in every popular matchup.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/compare" },
};

export default function CompareIndex() {
  const matchups = resolvedMatchups();

  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
          <GitCompareArrows size={14} />
          HEAD-TO-HEAD, FROM BENCHMARK DATA
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          GPU &amp; CPU Comparisons
        </h1>
        <p className="text-text-secondary max-w-2xl mb-12">
          Picking between two parts? These side-by-side breakdowns rank
          performance, price, and value from our database so you know which one
          to buy.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {matchups.map((m) => (
            <Link key={m.slug} href={`/compare/${m.slug}`} className="group">
              <article className="bg-surface border border-border rounded-2xl p-5 hover:border-cyan/40 transition-colors">
                <div className="text-xs font-mono text-text-secondary mb-2">
                  {m.component === "gpu" ? "GPU" : "CPU"}
                </div>
                <h2 className="text-base font-semibold mb-3 group-hover:text-cyan transition-colors">
                  {m.a} <span className="text-text-secondary">vs</span> {m.b}
                </h2>
                <span className="text-cyan text-sm flex items-center gap-1">
                  Compare <ArrowRight size={14} />
                </span>
              </article>
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
