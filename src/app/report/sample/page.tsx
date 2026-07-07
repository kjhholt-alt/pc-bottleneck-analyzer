import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { ReportFrame } from "@/components/ReportFrame";
import { generateSampleReport } from "@/lib/deepdive/report";
import { renderReportHtml } from "@/lib/deepdive/render";
import { DEEPDIVE_ENABLED, DEEPDIVE_PRICE } from "@/lib/deepdive/access";

export const metadata: Metadata = {
  title: "Sample PC Deep-Dive Report",
  description:
    "See exactly what you get: a full sample PC Deep-Dive Report on an example 1080p rig — bottleneck deep-dive, per-game FPS, and a resale-adjusted upgrade ladder.",
  alternates: { canonical: "https://pcbottleneck.buildkit.store/report/sample" },
};

// The sample is CANNED: it renders a fixed example rig through the deterministic
// generator. No buyer input is ever accepted here, so the public demo can never
// be turned into a free report generator (no-live-model-API-on-public-demos rail).
export default function SampleReportPage() {
  const report = generateSampleReport();
  const html = renderReportHtml(report, { sample: true });

  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-2">
              <FileSearch size={14} /> SAMPLE REPORT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              A real report, on an example rig
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              This is the exact artifact you receive — built from a fixed sample build. Yours is
              generated from your specs.
            </p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors shrink-0"
          >
            {DEEPDIVE_ENABLED ? `Get Mine — ${DEEPDIVE_PRICE}` : "Learn more"} <ArrowRight size={14} />
          </Link>
        </div>

        <ReportFrame html={html} />
      </section>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js
        </div>
      </footer>
    </main>
  );
}
