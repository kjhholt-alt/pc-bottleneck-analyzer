"use client";

import { motion } from "framer-motion";

interface HardwareSpec {
  label: string;
  value: string;
  status?: "good" | "warning" | "critical";
}

interface HardwareCardProps {
  title: string;
  icon: React.ReactNode;
  model: string;
  specs: HardwareSpec[];
  index?: number;
}

function getStatusColor(status?: "good" | "warning" | "critical"): string {
  switch (status) {
    case "good":
      return "text-green";
    case "warning":
      return "text-amber";
    case "critical":
      return "text-red";
    default:
      return "text-foreground";
  }
}

export function HardwareCard({
  title,
  icon,
  model,
  specs,
  index = 0,
}: HardwareCardProps) {
  return (
    <motion.div
      className="group bg-surface border border-border rounded-2xl p-5 transition-all duration-300 hover:border-cyan/40 hover:shadow-[0_0_20px_rgba(34,209,238,0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-cyan shrink-0">{icon}</div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </h3>
      </div>

      {/* Model name */}
      <p className="text-foreground font-semibold text-base mb-4 leading-snug">
        {model}
      </p>

      {/* Specs */}
      <div className="space-y-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-secondary">{spec.label}</span>
            <span
              className={`font-mono text-sm ${getStatusColor(spec.status)}`}
            >
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
