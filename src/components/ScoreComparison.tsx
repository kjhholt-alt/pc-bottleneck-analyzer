"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getScoreColor } from "@/lib/score-utils";
import type { PerformanceScore } from "@/lib/types";

// ─── Mini circular gauge (sized for side-by-side layout) ─────────────────────

function MiniGauge({
  score,
  label,
}: {
  score: PerformanceScore;
  label: string;
}) {
  const size = 130;
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score.total / 100) * circ;
  const color = getScoreColor(score.total);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">
        {label}
      </p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={sw}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold font-mono tabular-nums"
            style={{ color }}
          >
            {score.total}
          </span>
          <span className="text-sm font-semibold" style={{ color }}>
            {score.grade}
          </span>
        </div>
      </div>
      <p className="text-xs text-text-secondary text-center max-w-[120px]">
        {score.grade_description}
      </p>
    </div>
  );
}

// ─── Category bar row ─────────────────────────────────────────────────────────

function CategoryRow({
  label,
  before,
  after,
  max,
}: {
  label: string;
  before: number;
  after: number;
  max: number;
}) {
  const delta = after - before;
  const deltaColor =
    delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-text-secondary";

  return (
    <div className="grid grid-cols-[80px_1fr_40px_1fr_44px] items-center gap-2 text-xs">
      <span className="text-text-secondary text-right">{label}</span>
      {/* Before bar */}
      <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-text-secondary/40"
          initial={{ width: 0 }}
          animate={{ width: `${(before / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {/* Delta */}
      <span className={`font-mono text-center ${deltaColor}`}>
        {delta > 0 ? `+${delta}` : delta}
      </span>
      {/* After bar */}
      <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getScoreColor(after * (100 / max)) }}
          initial={{ width: 0 }}
          animate={{ width: `${(after / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />
      </div>
      <span className="font-mono text-text-secondary text-right">
        {after}/{max}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ScoreComparisonProps {
  before: PerformanceScore;
  after: PerformanceScore;
}

export function ScoreComparison({ before, after }: ScoreComparisonProps) {
  const delta = after.total - before.total;
  const deltaColor =
    delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-text-secondary";
  const DeltaIcon =
    delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gauge row */}
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <MiniGauge score={before} label="Current" />

        {/* Arrow + delta */}
        <div className="flex flex-col items-center gap-1">
          <DeltaIcon size={22} className={deltaColor} />
          <span className={`text-2xl font-bold font-mono tabular-nums ${deltaColor}`}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
          <span className="text-xs text-text-secondary">pts</span>
        </div>

        <MiniGauge score={after} label="Simulated" />
      </div>

      {/* Category breakdown */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
          Score Breakdown
        </p>
        <CategoryRow
          label="CPU"
          before={before.breakdown.cpu}
          after={after.breakdown.cpu}
          max={25}
        />
        <CategoryRow
          label="GPU"
          before={before.breakdown.gpu}
          after={after.breakdown.gpu}
          max={25}
        />
        <CategoryRow
          label="RAM"
          before={before.breakdown.ram}
          after={after.breakdown.ram}
          max={20}
        />
        <CategoryRow
          label="Storage"
          before={before.breakdown.storage}
          after={after.breakdown.storage}
          max={15}
        />
        <CategoryRow
          label="Settings"
          before={before.breakdown.settings}
          after={after.breakdown.settings}
          max={15}
        />
      </div>
    </motion.div>
  );
}
