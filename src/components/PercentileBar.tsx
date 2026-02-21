"use client";

import { motion } from "framer-motion";
import { TrendingUp, Cpu, Monitor, MemoryStick } from "lucide-react";
import type { PercentileResult } from "@/lib/percentile";

interface PercentileBarProps {
  percentiles: PercentileResult;
}

function BarRow({
  label,
  icon: Icon,
  value,
  delay,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  delay: number;
}) {
  const color =
    value >= 70 ? "var(--green)" : value >= 40 ? "var(--amber)" : "var(--red)";
  const bgColor =
    value >= 70
      ? "var(--green-dim)"
      : value >= 40
        ? "var(--amber-dim)"
        : "var(--red-dim)";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-16 shrink-0">
        <Icon size={13} style={{ color }} />
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: bgColor }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export function PercentileBar({ percentiles }: PercentileBarProps) {
  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-cyan" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Percentile Ranking
        </h3>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold font-mono text-foreground">
          Top {100 - percentiles.overall}%
        </span>
        <span className="text-sm text-text-secondary">
          — better than{" "}
          <strong className="text-foreground">{percentiles.overall}%</strong> of
          systems
        </span>
      </div>

      <div className="space-y-2.5">
        <BarRow icon={Monitor} label="GPU" value={percentiles.gpu} delay={0.4} />
        <BarRow icon={Cpu} label="CPU" value={percentiles.cpu} delay={0.5} />
        <BarRow icon={MemoryStick} label="RAM" value={percentiles.ram} delay={0.6} />
      </div>
    </motion.div>
  );
}
