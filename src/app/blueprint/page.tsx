import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { BlueprintApp } from "@/components/BlueprintApp";
import { BLUEPRINT_ENABLED, BLUEPRINT_PRICE } from "@/lib/blueprint-access";

export const metadata: Metadata = {
  title: "PC Upgrade Blueprint — Your Personalized Upgrade Plan",
  description:
    "Turn your PC's specs into a personalized upgrade plan: a 3-budget upgrade ladder, FPS uplift for your games, resale-adjusted net cost, and the exact order to buy things in.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/blueprint" },
};

function ComingSoon() {
  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="flex items-center justify-center gap-2 text-cyan text-xs font-mono mb-4">
          <FileText size={14} />
          COMING SOON
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          PC Upgrade Blueprint
        </h1>
        <p className="text-text-secondary mb-8">
          A personalized, permanent upgrade plan — 3 budgets, FPS uplift for your games,
          and net cost after selling your old parts. Not live yet.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
        >
          Analyze My PC Free <ArrowRight size={14} />
        </Link>
      </section>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by Claude
        </div>
      </footer>
    </main>
  );
}

export default function BlueprintPage() {
  if (!BLUEPRINT_ENABLED) return <ComingSoon />;

  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="print-hidden">
          <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
            <FileText size={14} />
            {BLUEPRINT_PRICE} ONE-TIME &middot; NO SUBSCRIPTION
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Your PC Upgrade Blueprint
          </h1>
          <p className="text-text-secondary mb-10">
            Pick your CPU, GPU, RAM, target resolution, and the 3 games you actually play.
            We&apos;ll build a permanent, printable upgrade plan from our hardware and
            benchmark database — no scanner install required.
          </p>
        </div>

        <BlueprintApp />
      </section>
      <footer className="border-t border-border print-hidden">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by Claude
        </div>
      </footer>
    </main>
  );
}
