import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Gauge } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { EmailCapture } from "@/components/EmailCapture";
import { BlueprintCTA } from "@/components/BlueprintCTA";
import { getAmazonLink } from "@/lib/affiliate";
import {
  allGames,
  gameSlug,
  pickGpus,
  rankGpus,
  resolveGame,
  type GpuFps,
} from "@/lib/gpu-for-game";

export function generateStaticParams() {
  return allGames().map((g) => ({ game: gameSlug(g) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const g = resolveGame(game);
  if (!g) return {};
  const title = `Best GPU for ${g.title} (2026) — FPS at 1080p & 1440p`;
  const description = `The best graphics cards for ${g.title} in 2026, ranked by estimated FPS at 1080p and 1440p Ultra. Find the right GPU for 60 FPS, 144 FPS, or max settings.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://pcbottleneck.buildkit.store/best-gpu-for/${game}`,
    },
    openGraph: { title, description, type: "article" },
  };
}

function fpsColor(fps: number): string {
  if (fps >= 144) return "text-emerald-400";
  if (fps >= 60) return "text-cyan";
  if (fps >= 30) return "text-amber-400";
  return "text-red-400";
}

function PickCard({
  emoji,
  label,
  row,
  sub,
}: {
  emoji: string;
  label: string;
  row: GpuFps | null;
  sub: string;
}) {
  if (!row) return null;
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="text-xs font-mono text-text-secondary mb-2">
        {emoji} {label}
      </div>
      <a
        href={getAmazonLink(row.entry.name)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="font-semibold hover:text-cyan transition-colors"
      >
        {row.entry.name}
      </a>
      <p className="text-xs text-text-secondary mt-1">{sub}</p>
    </div>
  );
}

export default async function BestGpuForGame({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  const g = resolveGame(game);
  if (!g) notFound();

  const rows = rankGpus(g, { topN: 10 });
  const picks = pickGpus(g);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Best GPU for ${g.title} (2026)`,
    description: `Graphics cards ranked by estimated FPS in ${g.title}.`,
    publisher: { "@type": "Organization", name: "PC Bottleneck Analyzer" },
  };

  return (
    <main className="min-h-screen">
      <NavHeader />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-cyan text-xs font-mono mb-3">
          <Gauge size={14} />
          ESTIMATED FPS · ULTRA SETTINGS
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Best GPU for {g.title} in 2026
        </h1>
        <p className="text-text-secondary mb-10">
          Graphics cards ranked by estimated average FPS in {g.title} at Ultra
          settings, from our benchmark database. Numbers are estimates to guide a
          buying decision, not exact benchmarks.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <PickCard
            emoji="🎯"
            label="Smooth 1440p"
            row={picks.smooth1440}
            sub="Cheapest card that clears 60 FPS at 1440p Ultra."
          />
          <PickCard
            emoji="⚡"
            label="High-refresh 1080p"
            row={picks.highRefresh1080}
            sub="Cheapest card that clears 144 FPS at 1080p Ultra."
          />
          <PickCard
            emoji="👑"
            label="Max settings"
            row={picks.max}
            sub="The fastest card for this game, period."
          />
        </div>

        <h2 className="text-lg font-semibold mb-3">
          GPUs ranked for {g.title}
        </h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-text-secondary border-b border-border">
                <th className="text-left font-medium px-4 py-2.5">GPU</th>
                <th className="text-right font-medium px-3 py-2.5">1080p</th>
                <th className="text-right font-medium px-3 py-2.5">1440p</th>
                <th className="text-right font-medium px-4 py-2.5">Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <a
                      href={getAmazonLink(r.entry.name)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-text-secondary hover:text-cyan transition-colors"
                    >
                      {r.entry.name}
                    </a>
                  </td>
                  <td className={`text-right px-3 py-2.5 font-mono ${fpsColor(r.fps1080)}`}>
                    {r.fps1080}
                  </td>
                  <td className={`text-right px-3 py-2.5 font-mono ${fpsColor(r.fps1440)}`}>
                    {r.fps1440}
                  </td>
                  <td className="text-right px-4 py-2.5 font-mono text-text-secondary">
                    ${(r.entry.current_price_approx || r.entry.msrp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-secondary mb-10">
          FPS is estimated from each GPU&apos;s benchmark score relative to {g.title}
          &apos;s measured performance, scaled by resolution. Real numbers vary with
          your CPU, RAM, drivers, and in-game scene. Some links are affiliate links.
        </p>

        <div className="bg-surface border border-cyan/30 rounded-2xl p-6 text-center mb-8">
          <h3 className="text-lg font-semibold mb-2">
            Will your CPU keep up?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            A great GPU can still be held back by your CPU or RAM. Run the free
            analyzer to find your real bottleneck before you buy.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
          >
            Analyze My PC <ArrowRight size={14} />
          </Link>
        </div>

        <BlueprintCTA className="mb-8" />

        <p className="text-sm text-text-secondary mb-8">
          More buying help:{" "}
          <Link href="/tier-lists" className="text-cyan hover:underline">
            GPU tier lists
          </Link>{" "}
          ·{" "}
          <Link href="/compare" className="text-cyan hover:underline">
            head-to-head comparisons
          </Link>
        </p>

        <EmailCapture source="best-gpu-for-game" />
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
