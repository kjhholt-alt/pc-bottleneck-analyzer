import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, ArrowRight, Check, FileText, Lock } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { DeepDiveIntake } from "@/components/DeepDiveIntake";
import { DEEPDIVE_ENABLED, DEEPDIVE_PRICE } from "@/lib/deepdive/access";

export const metadata: Metadata = {
  title: "PC Deep-Dive Report — Your Personalized Performance Report",
  description:
    "A personalized, expert-grade PC performance report built from your exact specs: bottleneck deep-dive, per-game FPS, a 3-budget upgrade ladder with resale-adjusted net cost, and the exact order to fix things. Delivered to a private link.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/report" },
};

const INCLUDES = [
  "A full bottleneck deep-dive — every limiter, its impact, and the fix",
  "Your real games benchmarked at your resolution, with a smoothness rating",
  "A 3-budget upgrade ladder ($150 / $300 / $600) with per-game FPS uplift",
  "Resale-adjusted net cost so you know the true price of each upgrade",
  "The exact order to do things — free wins first, then the right hardware",
  "A permanent, private, printable report you can save as PDF",
];

function ComingSoon() {
  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="flex items-center justify-center gap-2 text-cyan text-xs font-mono mb-4">
          <FileSearch size={14} /> COMING SOON
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          PC Deep-Dive Report
        </h1>
        <p className="text-text-secondary mb-8">
          A personalized, expert-grade performance report built from your exact specs and delivered
          to a private link. Not live yet — but you can preview a sample.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/report/sample"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm hover:border-cyan/50 transition-colors"
          >
            <FileText size={14} /> See a sample report
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
          >
            Analyze My PC Free <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js
        </div>
      </footer>
    </main>
  );
}

export default function ReportPage() {
  if (!DEEPDIVE_ENABLED) return <ComingSoon />;

  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
          <FileSearch size={14} />
          {DEEPDIVE_PRICE} ONE-TIME &middot; DELIVERED TO A PRIVATE LINK
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Your PC Deep-Dive Report
        </h1>
        <p className="text-text-secondary mb-8">
          Tell us your CPU, GPU, RAM, resolution, and the games you actually play. After checkout we
          generate a personalized, expert-grade report from our hardware and benchmark database and
          deliver it to a private link — permanent, printable, yours to keep.
        </p>

        <div className="grid sm:grid-cols-2 gap-2 mb-8">
          {INCLUDES.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-text-secondary">
              <Check size={15} className="text-cyan shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/report/sample"
            className="inline-flex items-center gap-2 text-sm text-cyan hover:underline"
          >
            <FileText size={14} /> See a full sample report first
          </Link>
        </div>

        <DeepDiveIntake />

        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary/70 mt-6">
          <Lock size={12} /> Secure checkout via Lemon Squeezy · your report link is private and unindexed
        </div>
      </section>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js
        </div>
      </footer>
    </main>
  );
}
