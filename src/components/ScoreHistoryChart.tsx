"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";
import { getHistory } from "@/lib/history";

interface DataPoint {
  date: string;
  score: number;
  label: string;
  cpu: string;
  gpu: string;
}

export function ScoreHistoryChart({ currentScore }: { currentScore: number }) {
  const data = useMemo(() => {
    const history = getHistory();
    if (history.length < 2) return null;

    // Oldest first for the chart
    const reversed = [...history].reverse();

    return reversed.map((entry): DataPoint => {
      const d = new Date(entry.savedAt);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: entry.totalScore,
        label: `${entry.cpuName} + ${entry.gpuName}`,
        cpu: entry.cpuName,
        gpu: entry.gpuName,
      };
    });
  }, []);

  if (!data) return null;

  const first = data[0].score;
  const last = data[data.length - 1].score;
  const diff = last - first;

  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--text-secondary)";
  const trendText =
    diff > 0
      ? `+${diff} pts since first scan`
      : diff < 0
        ? `${diff} pts since first scan`
        : "No change since first scan";

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Score History
        </h3>
        <div className="flex items-center gap-1.5" style={{ color: trendColor }}>
          <TrendIcon size={14} />
          <span className="text-xs font-mono">{trendText}</span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="var(--text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as DataPoint;
                return (
                  <div className="bg-surface-raised border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-sm font-bold font-mono" style={{ color: "var(--cyan)" }}>
                      {d.score} / 100
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{d.date}</p>
                    <p className="text-[10px] text-text-secondary mt-1 max-w-[180px] truncate">
                      {d.label}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              fill="url(#scoreGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--cyan)"
              strokeWidth={2}
              dot={{ fill: "var(--cyan)", r: 3, strokeWidth: 0 }}
              activeDot={{ fill: "var(--cyan)", r: 5, strokeWidth: 2, stroke: "var(--background)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-text-secondary/60 text-center mt-2">
        Based on {data.length} saved scans
      </p>
    </motion.div>
  );
}
