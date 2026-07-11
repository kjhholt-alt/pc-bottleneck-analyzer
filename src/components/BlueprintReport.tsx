"use client";

import { useEffect } from "react";
import { Printer, CheckCircle2, AlertTriangle, HelpCircle, Gift } from "lucide-react";
import type { Blueprint } from "@/lib/blueprint";
import { trackAffiliateClick, trackBlueprintView } from "@/lib/track";

const STATUS_ICON = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  unknown: HelpCircle,
  error: AlertTriangle,
};

const STATUS_COLOR: Record<string, string> = {
  ok: "text-green",
  warning: "text-amber",
  unknown: "text-text-secondary",
  error: "text-red",
};

function fpsColor(fps: number): string {
  if (fps >= 144) return "text-emerald-400";
  if (fps >= 60) return "text-cyan";
  if (fps >= 30) return "text-amber-400";
  return "text-red-400";
}

export function BlueprintReport({
  blueprint,
  source,
}: {
  blueprint: Blueprint;
  source: string;
}) {
  useEffect(() => {
    trackBlueprintView(source);
    // Only fire once per mount — re-firing on every render would inflate counts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { verdict, ladder, orderOfOperations, freeWins, compatibility, cpuEntry, gpuEntry } = blueprint;

  return (
    <div className="blueprint-report space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your PC Upgrade Blueprint</h2>
          <p className="text-sm text-text-secondary mt-1">
            {cpuEntry.name} &middot; {gpuEntry.name}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print-hidden shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-surface-raised border border-border rounded-lg text-xs font-semibold hover:border-cyan/40 transition-colors"
        >
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      {/* Verdict */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold font-mono text-cyan">{verdict.score.grade}</div>
          <div>
            <p className="text-sm font-semibold">
              Performance score: {verdict.score.total}/100
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{verdict.score.grade_description}</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-4 border-t border-border/50 pt-4">
          {verdict.bottleneckCategory === "cpu"
            ? `Your CPU (${cpuEntry.name}) is the bigger limiter right now — it's a lower performance tier than your ${gpuEntry.name}.`
            : `Your GPU (${gpuEntry.name}) is the bigger limiter right now — the ladder below focuses on GPU upgrades.`}
        </p>
      </section>

      {/* Ladder */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Upgrade ladder</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {ladder.map((rung) => (
            <div key={rung.budget} className="bg-surface border border-border rounded-2xl p-5 flex flex-col">
              <div className="text-xs font-mono text-cyan mb-2">~${rung.budget} BUDGET</div>
              {rung.part ? (
                <>
                  <a
                    href={rung.affiliateLinks?.amazon}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackAffiliateClick("amazon", rung.part!.name)}
                    className="font-semibold hover:text-cyan transition-colors"
                  >
                    {rung.part.name}
                  </a>
                  <p className="text-xs text-text-secondary mt-1">
                    ${(rung.part.current_price_approx || rung.part.msrp).toLocaleString()}
                  </p>
                  <div className="mt-3 text-xs space-y-1">
                    <p className="text-text-secondary">
                      Sell your {gpuEntry.name}: <span className="text-foreground">~${rung.resaleOfCurrentGpu}</span>
                    </p>
                    <p className="font-semibold">
                      Net cost: ~${rung.netCost?.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-border/50 pt-3 space-y-1.5 flex-1">
                    {rung.fpsUplift.map((f) => (
                      <div key={f.gameId} className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary truncate">{f.gameTitle}</span>
                        <span className="font-mono">
                          <span className="text-text-secondary">{f.beforeFps}</span>
                          {" -> "}
                          <span className={fpsColor(f.afterFps)}>{f.afterFps}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-secondary flex-1">
                  Nothing in the database beats your current GPU at this budget — you&apos;re already
                  ahead of this price point.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Order of operations */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-3">Order of operations</h3>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          {orderOfOperations.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Free wins */}
      {freeWins.length > 0 && (
        <section className="bg-surface border border-green/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Gift size={16} className="text-green" /> Free wins checklist
          </h3>
          <ul className="space-y-2">
            {freeWins.map((rec) => (
              <li key={rec.id} className="text-sm">
                <span className="font-medium text-foreground">{rec.title}</span>
                <span className="text-text-secondary"> — {rec.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Compatibility */}
      {compatibility.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-3">Compatibility notes</h3>
          <ul className="space-y-2.5">
            {compatibility.map((c) => {
              const Icon = STATUS_ICON[c.status] ?? HelpCircle;
              return (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <Icon size={14} className={`${STATUS_COLOR[c.status] ?? "text-text-secondary"} mt-0.5 shrink-0`} />
                  <div>
                    <span className="font-medium text-foreground">{c.title}</span>
                    <p className="text-xs text-text-secondary">{c.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-xs text-text-secondary">
        Prices, FPS uplift, and resale values are estimates from our hardware and benchmark
        database, not live market data. Some links are affiliate links.
      </p>
    </div>
  );
}
