"use client";

import { motion } from "framer-motion";
import { X, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";
import { getScoreColor, getBreakdownColor, MAX_SCORES } from "@/lib/score-utils";
import type { SystemScan, AnalysisResult, Bottleneck } from "@/lib/types";

interface ScanCompareProps {
  scanA: SystemScan;
  analysisA: AnalysisResult;
  scanB: SystemScan;
  analysisB: AnalysisResult;
  onClose: () => void;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-text-secondary">
        <Minus className="w-3 h-3" />
        0{suffix}
      </span>
    );
  }

  const isPositive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${
        isPositive ? "text-green" : "text-red"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function BreakdownBar({
  label,
  scoreA,
  scoreB,
  category,
}: {
  label: string;
  scoreA: number;
  scoreB: number;
  category: string;
}) {
  const max = MAX_SCORES[category] ?? 25;
  const pctA = (scoreA / max) * 100;
  const pctB = (scoreB / max) * 100;
  const delta = scoreB - scoreA;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground capitalize">
          {label}
        </span>
        <DeltaBadge value={delta} suffix={`/${max}`} />
      </div>
      {/* Scan A bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-secondary font-mono w-6 shrink-0">
          A
        </span>
        <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getBreakdownColor(category, scoreA) }}
            initial={{ width: 0 }}
            animate={{ width: `${pctA}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-mono text-text-secondary w-8 text-right">
          {scoreA}
        </span>
      </div>
      {/* Scan B bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-secondary font-mono w-6 shrink-0">
          B
        </span>
        <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getBreakdownColor(category, scoreB) }}
            initial={{ width: 0 }}
            animate={{ width: `${pctB}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          />
        </div>
        <span className="text-xs font-mono text-text-secondary w-8 text-right">
          {scoreB}
        </span>
      </div>
    </div>
  );
}

function BottleneckDiff({
  bottlenecksA,
  bottlenecksB,
}: {
  bottlenecksA: Bottleneck[];
  bottlenecksB: Bottleneck[];
}) {
  const idsA = new Set(bottlenecksA.map((b) => b.id));
  const idsB = new Set(bottlenecksB.map((b) => b.id));

  const resolved = bottlenecksA.filter((b) => !idsB.has(b.id));
  const added = bottlenecksB.filter((b) => !idsA.has(b.id));
  const unchanged = bottlenecksA.filter((b) => idsB.has(b.id));

  if (resolved.length === 0 && added.length === 0 && unchanged.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4 text-center">
        No bottlenecks in either scan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {resolved.map((b) => (
        <div
          key={b.id}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-green/5 border border-green/20"
        >
          <span className="text-green text-xs font-semibold shrink-0 mt-0.5">
            RESOLVED
          </span>
          <span className="text-sm text-text-secondary line-through">
            {b.title}
          </span>
        </div>
      ))}
      {added.map((b) => (
        <div
          key={b.id}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-red/5 border border-red/20"
        >
          <span className="text-red text-xs font-semibold shrink-0 mt-0.5">
            NEW
          </span>
          <span className="text-sm text-foreground">{b.title}</span>
        </div>
      ))}
      {unchanged.map((b) => (
        <div
          key={b.id}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-surface/50 border border-border"
        >
          <span className="text-text-secondary text-xs font-semibold shrink-0 mt-0.5">
            SAME
          </span>
          <span className="text-sm text-text-secondary">{b.title}</span>
        </div>
      ))}
    </div>
  );
}

function HardwareSpec({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  const changed = valueA !== valueB;

  return (
    <div className="grid grid-cols-[120px_1fr_24px_1fr] items-center gap-2 py-1.5">
      <span className="text-xs text-text-secondary font-medium">{label}</span>
      <span className="text-sm text-foreground truncate">{valueA}</span>
      <ArrowRight className="w-3.5 h-3.5 text-text-secondary/40 mx-auto" />
      <span
        className={`text-sm truncate ${changed ? "text-amber font-medium" : "text-foreground"}`}
      >
        {valueB}
      </span>
    </div>
  );
}

export function ScanCompare({
  scanA,
  analysisA,
  scanB,
  analysisB,
  onClose,
}: ScanCompareProps) {
  const scoreDelta = analysisB.score.total - analysisA.score.total;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Scan Comparison
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {scanA.cpu.model_name} vs {scanB.cpu.model_name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors"
          aria-label="Close comparison"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Score Comparison */}
      <section className="rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
          Overall Score
        </h2>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* Scan A */}
          <div className="text-center">
            <p className="text-xs text-text-secondary font-mono mb-3">
              Scan A — {formatDate(scanA.timestamp)}
            </p>
            <ScoreGauge score={analysisA.score} />
          </div>

          {/* Delta */}
          <div className="flex flex-col items-center gap-2 px-4">
            <div
              className={`text-3xl font-bold font-mono ${
                scoreDelta > 0
                  ? "text-green"
                  : scoreDelta < 0
                    ? "text-red"
                    : "text-text-secondary"
              }`}
            >
              {scoreDelta > 0 ? "+" : ""}
              {scoreDelta}
            </div>
            <div className="text-xs text-text-secondary">points</div>
            {analysisA.score.grade !== analysisB.score.grade && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: getScoreColor(analysisA.score.total) }}
                >
                  {analysisA.score.grade}
                </span>
                <ArrowRight className="w-4 h-4 text-text-secondary" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: getScoreColor(analysisB.score.total) }}
                >
                  {analysisB.score.grade}
                </span>
              </div>
            )}
          </div>

          {/* Scan B */}
          <div className="text-center">
            <p className="text-xs text-text-secondary font-mono mb-3">
              Scan B — {formatDate(scanB.timestamp)}
            </p>
            <ScoreGauge score={analysisB.score} />
          </div>
        </div>
      </section>

      {/* Breakdown Comparison */}
      <section className="rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
          Category Breakdown
        </h2>
        <div className="space-y-5">
          {(
            ["cpu", "gpu", "ram", "storage", "settings"] as const
          ).map((key) => (
            <BreakdownBar
              key={key}
              label={key}
              scoreA={analysisA.score.breakdown[key]}
              scoreB={analysisB.score.breakdown[key]}
              category={key}
            />
          ))}
        </div>
      </section>

      {/* Bottleneck Diff */}
      <section className="rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Bottleneck Changes
        </h2>
        <BottleneckDiff
          bottlenecksA={analysisA.bottlenecks}
          bottlenecksB={analysisB.bottlenecks}
        />
      </section>

      {/* Hardware Changes */}
      <section className="rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Hardware Changes
        </h2>
        <div className="divide-y divide-border">
          <HardwareSpec
            label="CPU"
            valueA={scanA.cpu.model_name}
            valueB={scanB.cpu.model_name}
          />
          <HardwareSpec
            label="GPU"
            valueA={scanA.gpu.model_name}
            valueB={scanB.gpu.model_name}
          />
          <HardwareSpec
            label="RAM"
            valueA={`${scanA.ram.total_gb} GB ${scanA.ram.form_factor} @ ${scanA.ram.speed_mhz} MHz (${scanA.ram.channel_mode})`}
            valueB={`${scanB.ram.total_gb} GB ${scanB.ram.form_factor} @ ${scanB.ram.speed_mhz} MHz (${scanB.ram.channel_mode})`}
          />
          <HardwareSpec
            label="Boot Drive"
            valueA={
              scanA.storage.find((d) => d.is_boot_drive)?.model ?? "Unknown"
            }
            valueB={
              scanB.storage.find((d) => d.is_boot_drive)?.model ?? "Unknown"
            }
          />
          <HardwareSpec
            label="Power Plan"
            valueA={scanA.os.power_plan}
            valueB={scanB.os.power_plan}
          />
          <HardwareSpec
            label="XMP"
            valueA={
              scanA.bios_settings.xmp_enabled === null
                ? "Unknown"
                : scanA.bios_settings.xmp_enabled
                  ? "Enabled"
                  : "Disabled"
            }
            valueB={
              scanB.bios_settings.xmp_enabled === null
                ? "Unknown"
                : scanB.bios_settings.xmp_enabled
                  ? "Enabled"
                  : "Disabled"
            }
          />
        </div>
      </section>
    </motion.div>
  );
}
