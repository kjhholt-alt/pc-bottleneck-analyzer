"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Target, DollarSign, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { AnalysisResult, SystemScan } from "@/lib/types";
import { gameBenchmarks, type Resolution, type QualityPreset } from "@/data/game-benchmarks";
import { planGoalUpgrade } from "@/lib/goal-planner";

interface GoalUpgradePlannerProps {
  scan: SystemScan;
  analysis: AnalysisResult;
}

const RESOLUTIONS: Resolution[] = ["1080p", "1440p", "4K"];
const QUALITIES: QualityPreset[] = ["Low", "Medium", "High", "Ultra"];

export function GoalUpgradePlanner({ scan, analysis }: GoalUpgradePlannerProps) {
  const [gameId, setGameId] = useState("cyberpunk");
  const [targetFps, setTargetFps] = useState(60);
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [quality, setQuality] = useState<QualityPreset>("High");
  const [budget, setBudget] = useState<string>("");
  const [includeResale, setIncludeResale] = useState(true);
  const [usedDiscountPct, setUsedDiscountPct] = useState(0);

  const selectedGame = useMemo(
    () => gameBenchmarks.find((g) => g.id === gameId) ?? gameBenchmarks[0],
    [gameId],
  );

  const result = useMemo(() => {
    return planGoalUpgrade(scan, analysis, {
      game: selectedGame,
      resolution,
      quality,
      targetFps,
      maxBudget: budget.trim() ? Number(budget) : undefined,
    }, {
      includeResaleCredit: includeResale,
      usedMarketDiscountPct: usedDiscountPct,
    });
  }, [scan, analysis, selectedGame, resolution, quality, targetFps, budget, includeResale, usedDiscountPct]);

  const cheapest = result.paths.find((p) => p.id === result.cheapestPathId);
  const bestValue = result.paths.find((p) => p.id === result.bestValuePathId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Goal-Based Upgrade Planner</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Pick your target game and FPS, then see the cheapest upgrade path to hit it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Game</span>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
          >
            {gameBenchmarks.map((game) => (
              <option key={game.id} value={game.id}>{game.title}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Resolution</span>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
          >
            {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Quality</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as QualityPreset)}
            className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
          >
            {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Budget (optional)</span>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="No cap"
            className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Target FPS</span>
          <span className="text-sm font-mono text-cyan">{targetFps} FPS</span>
        </div>
        <input
          type="range"
          min={30}
          max={240}
          step={5}
          value={targetFps}
          onChange={(e) => setTargetFps(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <label className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-text-secondary">Resale Credit</p>
            <p className="text-xs text-text-secondary mt-0.5">Subtract estimated value of replaced parts</p>
          </div>
          <input
            type="checkbox"
            checked={includeResale}
            onChange={(e) => setIncludeResale(e.target.checked)}
            className="h-4 w-4"
          />
        </label>

        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-mono uppercase tracking-wider text-text-secondary">Used-Market Pricing</p>
            <p className="text-xs font-mono text-cyan">-{usedDiscountPct}%</p>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={5}
            value={usedDiscountPct}
            onChange={(e) => setUsedDiscountPct(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Current</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{result.baselineFps} FPS</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Target</p>
          <p className="text-2xl font-bold font-mono text-cyan mt-1">{targetFps} FPS</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Gap</p>
          <p className="text-2xl font-bold font-mono text-amber mt-1">{Math.max(0, targetFps - result.baselineFps)} FPS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PathCard
          title="Cheapest Path"
          icon={<DollarSign size={14} className="text-green" />}
          path={cheapest}
          featured
        />
        <PathCard
          title="Best Value Path"
          icon={<Target size={14} className="text-cyan" />}
          path={bestValue}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Top Paths</p>
        {result.paths.slice(0, 8).map((path, i) => (
          <motion.div
            key={path.id}
            className="rounded-xl border border-border bg-surface p-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{path.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {path.type === "gpu+cpu" ? "Two-step path" : path.type === "gpu" ? "GPU-first path" : path.type === "cpu" ? "CPU-first path" : "No upgrade"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono text-foreground">${path.totalCost.toLocaleString()}</p>
                <p className="text-xs font-mono text-text-secondary">{path.estimatedFps} FPS</p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs">
              {path.meetsTarget ? (
                <span className="inline-flex items-center gap-1 text-green"><CheckCircle2 size={12} />Meets target</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber"><AlertTriangle size={12} />Below target</span>
              )}
              <span className="text-text-secondary">Gain: +{path.fpsGain} FPS</span>
              <span className="text-text-secondary">${path.costPerFpsGain.toFixed(2)}/FPS</span>
              <span className="text-text-secondary">Confidence: {path.confidence}%</span>
              <span className={`uppercase ${path.riskLevel === "high" ? "text-red" : path.riskLevel === "medium" ? "text-amber" : "text-green"}`}>
                {path.riskLevel} risk
              </span>
            </div>

            <div className="mt-1 text-xs text-text-secondary">
              Net ${path.netTotalCost.toLocaleString()} | Gross ${path.grossTotalCost.toLocaleString()}
              {path.resaleCredit > 0 ? ` | Resale -$${path.resaleCredit.toLocaleString()}` : ""}
            </div>

            {path.steps.length > 0 && (
              <div className="mt-2 text-xs text-text-secondary">
                {path.steps.map((step, idx) => (
                  <div key={`${path.id}-${idx}`} className="flex items-center gap-2">
                    <ArrowRight size={10} className="text-cyan" />
                    <span>{step.title}</span>
                    <span className="font-mono">(${step.cost})</span>
                    {step.afterFps !== null ? <span className="font-mono text-cyan">{"->"}{step.afterFps} FPS</span> : null}
                  </div>
                ))}
              </div>
            )}

            {path.risks.length > 0 && (
              <div className="mt-2 rounded-md border border-amber/30 bg-amber/10 px-2 py-1.5 text-xs text-amber">
                {path.risks.join(" ")}
              </div>
            )}

            {path.milestones.length > 1 && (
              <div className="mt-2 rounded-md border border-border/70 bg-background/40 px-2 py-1.5">
                <p className="text-[11px] font-mono uppercase tracking-wide text-text-secondary">Milestones</p>
                <div className="mt-1 space-y-1 text-xs text-text-secondary">
                  {path.milestones.map((m, idx) => (
                    <p key={`${path.id}-m-${idx}`}>
                      {idx + 1}. {m.title}: {m.estimatedFps} FPS at ${m.cumulativeNetCost.toLocaleString()} net
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {result.nearMisses.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-sm font-semibold text-foreground mb-2">Closest Under-Target Paths</p>
          <div className="space-y-1.5 text-xs text-text-secondary">
            {result.nearMisses.map((path) => (
              <p key={`near-${path.id}`}>{path.label}: {path.estimatedFps} FPS for ${path.totalCost.toLocaleString()}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PathCard({
  title,
  icon,
  path,
  featured = false,
}: {
  title: string;
  icon: ReactNode;
  path?: ReturnType<typeof planGoalUpgrade>["paths"][number];
  featured?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${featured ? "border-green/40 bg-green/5" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
        {icon}
        {title}
      </div>
      {!path ? (
        <p className="text-sm text-text-secondary">No valid path for current constraints.</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">{path.label}</p>
          <p className="text-xs text-text-secondary mt-1">{path.estimatedFps} FPS estimated</p>
          <p className="text-xl font-bold font-mono text-foreground mt-2">${path.totalCost.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-1">${path.costPerFpsGain.toFixed(2)} per FPS gained</p>
          <p className="text-xs text-text-secondary mt-1">Confidence {path.confidence}% | {path.riskLevel} risk</p>
          <p className="text-xs text-text-secondary mt-1">
            Net ${path.netTotalCost.toLocaleString()} / Gross ${path.grossTotalCost.toLocaleString()}
            {path.resaleCredit > 0 ? ` (resale -$${path.resaleCredit.toLocaleString()})` : ""}
          </p>
        </>
      )}
    </div>
  );
}

