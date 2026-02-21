"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ChevronDown, Zap } from "lucide-react";
import type { SystemScan, AnalysisResult } from "@/lib/types";
import {
  gameBenchmarks,
  type GameBenchmark,
  type Resolution,
  type QualityPreset,
} from "@/data/game-benchmarks";
import { estimateFPS, type FPSResult } from "@/lib/fps-estimator";

interface GameFPSEstimatorProps {
  scan: SystemScan;
  analysis: AnalysisResult;
}

const RESOLUTIONS: Resolution[] = ["1080p", "1440p", "4K"];
const QUALITIES: QualityPreset[] = ["Low", "Medium", "High", "Ultra"];

const GENRE_COLORS: Record<string, string> = {
  AAA: "var(--purple)",
  Shooter: "var(--red)",
  Esports: "var(--cyan)",
  "Open World": "var(--amber)",
  Racing: "var(--green)",
  Coop: "var(--amber)",
  Sandbox: "var(--green)",
};

function FPSGauge({ result }: { result: FPSResult }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background ring */}
        <svg className="absolute inset-0" viewBox="0 0 144 144">
          <circle
            cx="72"
            cy="72"
            r="64"
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <motion.circle
            cx="72"
            cy="72"
            r="64"
            fill="none"
            stroke={result.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 64}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
            animate={{
              strokeDashoffset:
                2 * Math.PI * 64 * (1 - Math.min(result.estimated / 200, 1)),
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            transform="rotate(-90 72 72)"
            style={{ filter: `drop-shadow(0 0 6px ${result.color})` }}
          />
        </svg>
        <div className="text-center z-10">
          <span
            className="text-3xl font-bold font-mono"
            style={{ color: result.color }}
          >
            {result.estimated}
          </span>
          <span className="block text-xs text-text-secondary">FPS</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-sm font-medium" style={{ color: result.color }}>
          {result.verdictLabel}
        </span>
        <p className="text-xs text-text-secondary mt-0.5">
          Range: {result.low}–{result.high} FPS
        </p>
      </div>
    </motion.div>
  );
}

export function GameFPSEstimator({ scan, analysis }: GameFPSEstimatorProps) {
  const [selectedGame, setSelectedGame] = useState<GameBenchmark | null>(null);
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [quality, setQuality] = useState<QualityPreset>("High");

  const result = useMemo(() => {
    if (!selectedGame) return null;
    return estimateFPS(scan, analysis, selectedGame, resolution, quality);
  }, [scan, analysis, selectedGame, resolution, quality]);

  // Compute all game results for the grid preview
  const allResults = useMemo(() => {
    return gameBenchmarks.map((game) => ({
      game,
      result: estimateFPS(scan, analysis, game, resolution, quality),
    }));
  }, [scan, analysis, resolution, quality]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Game FPS Estimator
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Estimated performance based on your{" "}
          <strong className="text-foreground">{scan.cpu.model_name}</strong> +{" "}
          <strong className="text-foreground">{scan.gpu.model_name}</strong>
        </p>
      </div>

      {/* Resolution & Quality Selectors */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Resolution:</span>
          <div className="flex gap-1">
            {RESOLUTIONS.map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  resolution === res
                    ? "bg-cyan/10 border border-cyan/30 text-cyan"
                    : "border border-border text-text-secondary hover:text-foreground"
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Quality:</span>
          <div className="flex gap-1">
            {QUALITIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  quality === q
                    ? "bg-cyan/10 border border-cyan/30 text-cyan"
                    : "border border-border text-text-secondary hover:text-foreground"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {allResults.map(({ game, result: gameResult }, i) => (
          <motion.button
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className={`text-left bg-surface border rounded-xl p-3 transition-colors ${
              selectedGame?.id === game.id
                ? "border-cyan/50 bg-cyan/5"
                : "border-border hover:border-cyan/30"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: GENRE_COLORS[game.genre] ?? "var(--text-secondary)",
                  background: `color-mix(in srgb, ${GENRE_COLORS[game.genre] ?? "var(--text-secondary)"} 15%, transparent)`,
                }}
              >
                {game.genre}
              </span>
              <span
                className="text-xs font-bold font-mono"
                style={{ color: gameResult.color }}
              >
                {gameResult.estimated}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground leading-tight truncate">
              {game.title}
            </p>
            <p
              className="text-[10px] font-mono mt-1"
              style={{ color: gameResult.color }}
            >
              {gameResult.low}–{gameResult.high} FPS
            </p>
          </motion.button>
        ))}
      </div>

      {/* Selected Game Detail */}
      <AnimatePresence mode="wait">
        {selectedGame && result && (
          <motion.div
            key={selectedGame.id}
            className="bg-surface border border-border rounded-2xl p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* FPS Gauge */}
              <FPSGauge result={result} />

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedGame.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {resolution} &middot; {quality} &middot; {selectedGame.genre}
                  </p>
                </div>

                {/* Quick info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-raised border border-border rounded-lg p-3 text-center">
                    <span className="text-xs text-text-secondary block">Min</span>
                    <span className="text-lg font-bold font-mono" style={{ color: result.color }}>
                      {result.low}
                    </span>
                  </div>
                  <div className="bg-surface-raised border border-border rounded-lg p-3 text-center">
                    <span className="text-xs text-text-secondary block">Avg</span>
                    <span className="text-lg font-bold font-mono" style={{ color: result.color }}>
                      {result.estimated}
                    </span>
                  </div>
                  <div className="bg-surface-raised border border-border rounded-lg p-3 text-center">
                    <span className="text-xs text-text-secondary block">Max</span>
                    <span className="text-lg font-bold font-mono" style={{ color: result.color }}>
                      {result.high}
                    </span>
                  </div>
                </div>

                {/* Tips */}
                {result.verdict !== "smooth" && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-dim border border-amber/30 rounded-xl">
                    <Zap size={14} className="text-amber mt-0.5 shrink-0" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {result.verdict === "playable"
                        ? `Try lowering quality to ${quality === "Ultra" ? "High" : "Medium"} or switching to ${resolution === "4K" ? "1440p" : "1080p"} for smoother gameplay.`
                        : "This game is too demanding for your current hardware at these settings. Try Low quality at 1080p, or consider a GPU upgrade."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedGame && (
        <motion.div
          className="flex items-center justify-center gap-2 py-8 text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ChevronDown size={16} />
          <span className="text-sm">Select a game above to see detailed FPS estimate</span>
        </motion.div>
      )}
    </div>
  );
}
