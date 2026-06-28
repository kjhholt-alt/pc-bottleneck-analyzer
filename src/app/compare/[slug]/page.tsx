import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { EmailCapture } from "@/components/EmailCapture";
import { getAmazonLink } from "@/lib/affiliate";
import { valueScore } from "@/lib/tier-list";
import {
  compare,
  parseMatchup,
  resolvePart,
  resolvedMatchups,
  type ResolvedPart,
} from "@/lib/compare";

export function generateStaticParams() {
  return resolvedMatchups().map((m) => ({ slug: m.slug }));
}

function resolveBoth(
  slug: string
): { a: ResolvedPart; b: ResolvedPart } | null {
  const pair = parseMatchup(slug);
  if (!pair) return null;
  const a = resolvePart(pair[0]);
  const b = resolvePart(pair[1]);
  if (!a || !b) return null;
  return { a, b };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const both = resolveBoth(slug);
  if (!both) return {};
  const title = `${both.a.entry.name} vs ${both.b.entry.name}: Which Should You Buy? (2026)`;
  const description = `${both.a.entry.name} vs ${both.b.entry.name} — performance, price, and value compared from real benchmark data. See which is the better buy in 2026.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://pcbottleneck.buildkit.store/compare/${slug}`,
    },
    openGraph: { title, description, type: "article" },
  };
}

function MetricRow({
  label,
  aWin,
  bWin,
  aText,
  bText,
}: {
  label: string;
  aWin: boolean;
  bWin: boolean;
  aText: string;
  bText: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className={`text-right text-sm ${aWin ? "text-cyan font-semibold" : "text-text-secondary"}`}>
        {aText}
        {aWin && <Check size={13} className="inline ml-1.5 -mt-0.5" />}
      </div>
      <div className="text-[11px] font-mono uppercase tracking-wide text-text-secondary px-2">
        {label}
      </div>
      <div className={`text-left text-sm ${bWin ? "text-cyan font-semibold" : "text-text-secondary"}`}>
        {bWin && <Check size={13} className="inline mr-1.5 -mt-0.5" />}
        {bText}
      </div>
    </div>
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const both = resolveBoth(slug);
  if (!both) notFound();

  const { a, b } = both;
  const cmp = compare(a, b);
  const av = valueScore(a.entry);
  const bv = valueScore(b.entry);
  const aPrice = a.entry.current_price_approx || a.entry.msrp;
  const bPrice = b.entry.current_price_approx || b.entry.msrp;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.entry.name} vs ${b.entry.name}`,
    description: cmp.verdict,
    publisher: { "@type": "Organization", name: "PC Bottleneck Analyzer" },
  };

  return (
    <main className="min-h-screen">
      <NavHeader />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/compare"
          className="text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
        >
          ← All comparisons
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-6 mb-2">
          {a.entry.name} <span className="text-text-secondary">vs</span>{" "}
          {b.entry.name}
        </h1>
        <p className="text-text-secondary mb-10">
          Performance, price, and value compared from our benchmark database —
          updated for 2026.
        </p>

        {/* Two headline cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[a, b].map((p) => (
            <div
              key={p.slug}
              className="bg-surface border border-border rounded-2xl p-5 text-center"
            >
              <div className="text-xs font-mono text-text-secondary mb-1">
                {p.component === "gpu" ? "GPU" : "CPU"}
              </div>
              <div className="font-semibold mb-3">{p.entry.name}</div>
              <div className="text-3xl font-bold text-cyan">
                {p.entry.gaming_score}
                <span className="text-sm text-text-secondary font-normal">
                  /100
                </span>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                gaming score
              </div>
            </div>
          ))}
        </div>

        {/* Metric comparison */}
        <div className="bg-surface border border-border rounded-2xl px-5 py-3 mb-8">
          <MetricRow
            label="Performance"
            aWin={a.entry.gaming_score >= b.entry.gaming_score}
            bWin={b.entry.gaming_score > a.entry.gaming_score}
            aText={`${a.entry.gaming_score}/100`}
            bText={`${b.entry.gaming_score}/100`}
          />
          <MetricRow
            label="Price"
            aWin={aPrice <= bPrice}
            bWin={bPrice < aPrice}
            aText={`$${aPrice.toLocaleString()}`}
            bText={`$${bPrice.toLocaleString()}`}
          />
          <MetricRow
            label="Value / $100"
            aWin={av >= bv}
            bWin={bv > av}
            aText={av.toFixed(1)}
            bText={bv.toFixed(1)}
          />
          <MetricRow
            label="Released"
            aWin={a.entry.release_year >= b.entry.release_year}
            bWin={b.entry.release_year > a.entry.release_year}
            aText={String(a.entry.release_year)}
            bText={String(b.entry.release_year)}
          />
        </div>

        {/* Verdict */}
        <div className="bg-surface border border-cyan/30 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">The verdict</h2>
          <p className="text-sm text-text-secondary">{cmp.verdict}</p>
        </div>

        {/* Buy links */}
        <h2 className="text-lg font-semibold mb-3">Check current prices</h2>
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[a, b].map((p) => (
            <a
              key={p.slug}
              href={getAmazonLink(p.entry.name)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="bg-surface border border-border rounded-xl p-4 text-center hover:border-cyan/40 transition-colors"
            >
              <div className="text-sm font-semibold mb-1">{p.entry.name}</div>
              <span className="text-cyan text-sm">View on Amazon →</span>
            </a>
          ))}
        </div>
        <p className="text-xs text-text-secondary mb-10">
          Some links are affiliate links — we may earn a commission at no extra
          cost to you. Comparisons are generated from benchmark data, not
          sponsorships.
        </p>

        {/* CTA */}
        <div className="bg-surface border border-cyan/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Will it bottleneck your build?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Run your PC through the free analyzer to see if your CPU, GPU, or RAM
            is the real limit before you buy.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
          >
            Analyze My PC <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8">
          <EmailCapture source="compare" />
        </div>
      </article>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by Claude
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
