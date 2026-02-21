"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { getAffiliateLinks } from "@/lib/affiliate";
import { trackAffiliateClick } from "@/lib/track";
import type { SystemScan } from "@/lib/types";
import type { GameBenchmark, Resolution, QualityPreset } from "@/data/game-benchmarks";
import { estimateFPS } from "@/lib/fps-estimator";
import { gpuDatabase, lookupGPU } from "@/data/hardware-db";
import { simulateUpgrade } from "@/lib/simulate";

interface CostPerFPSProps {
  scan: SystemScan;
  game: GameBenchmark;
  resolution: Resolution;
  quality: QualityPreset;
  currentFPS: number;
}

interface UpgradeOption {
  name: string;
  price: number;
  estimatedFPS: number;
  fpsGain: number;
  costPerFPS: number;
  tier: string;
}

export function CostPerFPS({
  scan,
  game,
  resolution,
  quality,
  currentFPS,
}: CostPerFPSProps) {
  const options = useMemo(() => {
    const currentGPU = lookupGPU(scan.gpu.model_name);
    const currentScore = currentGPU?.gaming_score ?? 50;

    const candidates: UpgradeOption[] = [];

    for (const entry of Object.values(gpuDatabase)) {
      if (entry.gaming_score <= currentScore) continue;
      if (entry.current_price_approx <= 0) continue;

      const simAnalysis = simulateUpgrade(scan, undefined, entry.name);
      const result = estimateFPS(
        { ...scan, gpu: { ...scan.gpu, model_name: entry.name } },
        simAnalysis,
        game,
        resolution,
        quality,
      );

      const fpsGain = result.estimated - currentFPS;
      if (fpsGain <= 0) continue;

      candidates.push({
        name: entry.name,
        price: entry.current_price_approx,
        estimatedFPS: result.estimated,
        fpsGain,
        costPerFPS: Math.round((entry.current_price_approx / fpsGain) * 100) / 100,
        tier: entry.tier,
      });
    }

    return candidates.sort((a, b) => a.costPerFPS - b.costPerFPS).slice(0, 5);
  }, [scan, game, resolution, quality, currentFPS]);

  if (options.length === 0) return null;

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <DollarSign size={14} className="text-cyan" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Best Value GPU Upgrades for {game.title}
        </h3>
      </div>

      <p className="text-xs text-text-secondary mb-3">
        Cost per extra FPS at {resolution} {quality} — lower is better value.
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isTop = i === 0;
          return (
            <motion.div
              key={opt.name}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                isTop ? "bg-cyan/5 border-cyan/30" : "bg-surface-raised border-border"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <span
                className="text-xs font-bold font-mono w-5 text-center"
                style={{ color: isTop ? "var(--cyan)" : "var(--text-secondary)" }}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{opt.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-text-secondary">{currentFPS} FPS</span>
                  <ArrowRight size={10} className="text-text-secondary" />
                  <span className="text-xs font-mono" style={{ color: "var(--green)" }}>
                    {opt.estimatedFPS} FPS
                  </span>
                  <span className="text-[10px] text-text-secondary ml-1">(+{opt.fpsGain})</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <ExternalLink size={9} className="text-text-secondary/60" />
                  <a
                    href={getAffiliateLinks(opt.name).amazon}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAffiliateClick("amazon", opt.name)}
                    className="text-[10px] font-mono text-text-secondary hover:text-cyan transition-colors"
                  >
                    Amazon
                  </a>
                  <span className="text-[10px] text-text-secondary/40">&middot;</span>
                  <a
                    href={getAffiliateLinks(opt.name).newegg}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAffiliateClick("newegg", opt.name)}
                    className="text-[10px] font-mono text-text-secondary hover:text-cyan transition-colors"
                  >
                    Newegg
                  </a>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-mono text-foreground">~${opt.price.toLocaleString()}</p>
                <p
                  className="text-[10px] font-mono"
                  style={{ color: isTop ? "var(--cyan)" : "var(--text-secondary)" }}
                >
                  ${opt.costPerFPS.toFixed(2)}/FPS
                </p>
              </div>

              {isTop && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan/10 border border-cyan/30 rounded-md">
                  <TrendingUp size={10} className="text-cyan" />
                  <span className="text-[10px] font-mono text-cyan">BEST</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
