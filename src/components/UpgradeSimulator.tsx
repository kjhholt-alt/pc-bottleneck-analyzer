"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Monitor, RotateCcw, DollarSign, CheckCircle2, XCircle, Wrench, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { getAffiliateLinks } from "@/lib/affiliate";
import { trackAffiliateClick } from "@/lib/track";
import type { SystemScan, AnalysisResult, Bottleneck, UpgradeCategory } from "@/lib/types";
import { simulateUpgrade, getCPUOptions, getGPUOptions, TIER_LABELS } from "@/lib/simulate";
import { lookupCPU, lookupGPU } from "@/data/hardware-db";
import { ScoreComparison } from "./ScoreComparison";

interface UpgradeSimulatorProps {
  scan: SystemScan;
  currentAnalysis: AnalysisResult;
  onStartWalkthrough?: (category: UpgradeCategory, targetHardware?: string) => void;
}

// ─── Styled select ────────────────────────────────────────────────────────────

function HardwareSelect({
  icon: Icon,
  label,
  currentName,
  currentScore,
  value,
  onChange,
  options,
}: {
  icon: React.ElementType;
  label: string;
  currentName: string;
  currentScore: number;
  value: string;
  onChange: (v: string) => void;
  options: ReturnType<typeof getCPUOptions>;
}) {
  // Group options by tier
  const groups = useMemo(() => {
    const map = new Map<string, typeof options>();
    for (const o of options) {
      if (!map.has(o.tier)) map.set(o.tier, []);
      map.get(o.tier)!.push(o);
    }
    return map;
  }, [options]);

  const tierOrder = ["very_high", "high", "mid", "low", "very_low"];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-mono text-text-secondary uppercase tracking-wider">
        <Icon size={12} />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm
                   text-foreground focus:outline-none focus:border-cyan/60 focus:bg-surface-raised
                   transition-colors duration-150"
      >
        <option value="">— Keep current ({currentName}) —</option>
        {tierOrder.map((tier) => {
          const items = groups.get(tier);
          if (!items?.length) return null;
          return (
            <optgroup key={tier} label={TIER_LABELS[tier] ?? tier}>
              {items.map((o) => {
                const pct = currentScore > 0 ? Math.round(((o.score - currentScore) / currentScore) * 100) : 0;
                const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "—";
                const pctStr = pct > 0 ? `+${pct}%` : pct < 0 ? `${pct}%` : "0%";
                return (
                  <option key={o.name} value={o.name}>
                    {o.name} — ${o.price} ({arrow} {pctStr})
                  </option>
                );
              })}
            </optgroup>
          );
        })}
      </select>
      {value && (() => {
        const selected = options.find((o) => o.name === value);
        const pct = selected && currentScore > 0
          ? Math.round(((selected.score - currentScore) / currentScore) * 100)
          : 0;
        const isUpgrade = pct > 0;

        return (
        <motion.div
          className="text-xs text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <p>
              Selected:{" "}
              <span className="text-cyan font-medium">{value}</span>
            </p>
            {pct !== 0 && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${
                  isUpgrade
                    ? "text-green-400 bg-green-400/10 border border-green-400/30 shadow-[0_0_8px_rgba(74,222,128,0.15)]"
                    : "text-red-400 bg-red-400/10 border border-red-400/30 shadow-[0_0_8px_rgba(248,113,113,0.15)]"
                }`}
              >
                {isUpgrade ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isUpgrade ? "+" : ""}{pct}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <ExternalLink size={9} className="text-text-secondary/60" />
            <a
              href={getAffiliateLinks(value).amazon}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("amazon", value)}
              className="text-[10px] font-mono text-text-secondary hover:text-cyan transition-colors"
            >
              Amazon
            </a>
            <span className="text-[10px] text-text-secondary/40">&middot;</span>
            <a
              href={getAffiliateLinks(value).newegg}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("newegg", value)}
              className="text-[10px] font-mono text-text-secondary hover:text-cyan transition-colors"
            >
              Newegg
            </a>
          </div>
        </motion.div>
      );
      })()}
    </div>
  );
}

// ─── Bottleneck diff ──────────────────────────────────────────────────────────

function BottleneckDiff({
  before,
  after,
}: {
  before: Bottleneck[];
  after: Bottleneck[];
}) {
  const beforeIds = new Set(before.map((b) => b.id));
  const afterIds = new Set(after.map((b) => b.id));

  const resolved = before.filter((b) => !afterIds.has(b.id));
  const added = after.filter((b) => !beforeIds.has(b.id));

  if (resolved.length === 0 && added.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-3">
        No change in detected bottlenecks.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {resolved.map((b) => (
        <motion.div
          key={`resolved-${b.id}`}
          className="flex items-start gap-2.5 px-3 py-2 bg-green-900/20 border border-green-800/30 rounded-lg"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CheckCircle2 size={15} className="text-green-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono text-green-400 uppercase mr-2">RESOLVED</span>
            <span className="text-sm text-foreground">{b.title}</span>
          </div>
        </motion.div>
      ))}
      {added.map((b) => (
        <motion.div
          key={`added-${b.id}`}
          className="flex items-start gap-2.5 px-3 py-2 bg-red-900/20 border border-red-800/30 rounded-lg"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono text-red-400 uppercase mr-2">NEW</span>
            <span className="text-sm text-foreground">{b.title}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UpgradeSimulator({ scan, currentAnalysis, onStartWalkthrough }: UpgradeSimulatorProps) {
  const [selectedCPU, setSelectedCPU] = useState("");
  const [selectedGPU, setSelectedGPU] = useState("");

  const cpuOptions = useMemo(() => getCPUOptions(), []);
  const gpuOptions = useMemo(() => getGPUOptions(), []);

  const hasChanges = selectedCPU !== "" || selectedGPU !== "";

  // Run simulation whenever selections change
  const simResult: AnalysisResult | null = useMemo(() => {
    if (!hasChanges) return null;
    return simulateUpgrade(
      scan,
      selectedCPU || undefined,
      selectedGPU || undefined,
    );
  }, [scan, selectedCPU, selectedGPU, hasChanges]);

  // Upgrade cost estimate
  const upgradeCost = useMemo(() => {
    let total = 0;
    if (selectedCPU) {
      const found = cpuOptions.find((c) => c.name === selectedCPU);
      if (found) total += found.price;
    }
    if (selectedGPU) {
      const found = gpuOptions.find((g) => g.name === selectedGPU);
      if (found) total += found.price;
    }
    return total;
  }, [selectedCPU, selectedGPU, cpuOptions, gpuOptions]);

  function handleReset() {
    setSelectedCPU("");
    setSelectedGPU("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What-If Upgrade Simulator
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Swap CPU or GPU and see how your score changes instantly.
          </p>
        </div>
        {hasChanges && (
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-mono text-text-secondary
                       hover:text-cyan transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={13} />
            Reset
          </motion.button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HardwareSelect
          icon={Cpu}
          label="CPU"
          currentName={scan.cpu.model_name}
          currentScore={lookupCPU(scan.cpu.model_name)?.gaming_score ?? 50}
          value={selectedCPU}
          onChange={setSelectedCPU}
          options={cpuOptions}
        />
        <HardwareSelect
          icon={Monitor}
          label="GPU"
          currentName={scan.gpu.model_name}
          currentScore={lookupGPU(scan.gpu.model_name)?.gaming_score ?? 50}
          value={selectedGPU}
          onChange={setSelectedGPU}
          options={gpuOptions}
        />
      </div>

      {/* Note */}
      <p className="text-xs text-text-secondary/60">
        Note: simulated scores reflect hardware tier and configuration changes. Live metrics
        (temps, usage) are not simulated.
      </p>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!hasChanges ? (
          <motion.div
            key="placeholder"
            className="flex flex-col items-center justify-center py-16 text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm">Select a CPU or GPU above to simulate an upgrade.</p>
          </motion.div>
        ) : simResult ? (
          <motion.div
            key={`results-${selectedCPU}-${selectedGPU}`}
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Score comparison */}
            <ScoreComparison
              before={currentAnalysis.score}
              after={simResult.score}
            />

            {/* Upgrade cost */}
            {upgradeCost > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl">
                <DollarSign size={15} className="text-cyan shrink-0" />
                <span className="text-sm text-text-secondary">
                  Estimated upgrade cost:{" "}
                  <span className="text-foreground font-semibold">
                    ~${upgradeCost.toLocaleString()}
                  </span>
                </span>
              </div>
            )}

            {/* Bottleneck diff */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                Bottleneck Changes
              </p>
              <BottleneckDiff
                before={currentAnalysis.bottlenecks}
                after={simResult.bottlenecks}
              />
            </div>

            {/* Upgrade walkthrough CTA */}
            {onStartWalkthrough && (
              <div className="flex flex-col sm:flex-row gap-2">
                {selectedCPU && (
                  <motion.button
                    onClick={() => onStartWalkthrough("cpu", selectedCPU)}
                    className="flex items-center gap-2 px-4 py-3 bg-cyan/10 border border-cyan/30
                               rounded-xl text-sm font-medium text-cyan hover:bg-cyan/20 transition-colors flex-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wrench size={15} />
                    CPU Upgrade Guide
                  </motion.button>
                )}
                {selectedGPU && (
                  <motion.button
                    onClick={() => onStartWalkthrough("gpu", selectedGPU)}
                    className="flex items-center gap-2 px-4 py-3 bg-cyan/10 border border-cyan/30
                               rounded-xl text-sm font-medium text-cyan hover:bg-cyan/20 transition-colors flex-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wrench size={15} />
                    GPU Upgrade Guide
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
