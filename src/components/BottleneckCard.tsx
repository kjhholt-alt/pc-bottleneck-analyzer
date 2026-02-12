"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import type { Bottleneck, Severity } from "@/lib/types";

interface BottleneckCardProps {
  bottleneck: Bottleneck;
  index?: number;
}

function getSeverityConfig(severity: Severity) {
  switch (severity) {
    case "critical":
      return {
        color: "var(--red)",
        bg: "bg-red-dim",
        border: "border-red/30",
        label: "Critical",
        icon: AlertCircle,
      };
    case "warning":
      return {
        color: "var(--amber)",
        bg: "bg-amber-dim",
        border: "border-amber/30",
        label: "Warning",
        icon: AlertTriangle,
      };
    case "info":
      return {
        color: "var(--cyan)",
        bg: "bg-cyan-dim",
        border: "border-cyan/30",
        label: "Info",
        icon: Info,
      };
    case "good":
      return {
        color: "var(--green)",
        bg: "bg-green-dim",
        border: "border-green/30",
        label: "Good",
        icon: CheckCircle,
      };
  }
}

function getDifficultyColor(difficulty: "Easy" | "Medium" | "Hard"): string {
  switch (difficulty) {
    case "Easy":
      return "text-green bg-green-dim border-green/30";
    case "Medium":
      return "text-amber bg-amber-dim border-amber/30";
    case "Hard":
      return "text-red bg-red-dim border-red/30";
  }
}

export function BottleneckCard({ bottleneck, index = 0 }: BottleneckCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = getSeverityConfig(bottleneck.severity);
  const SeverityIcon = severity.icon;

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl overflow-hidden transition-colors duration-200 hover:border-cyan/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-surface-raised/50"
      >
        {/* Severity icon */}
        <div
          className={`shrink-0 rounded-lg p-1.5 ${severity.bg} ${severity.border} border`}
        >
          <SeverityIcon size={16} style={{ color: severity.color }} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-sm leading-snug truncate">
            {bottleneck.title}
          </h3>
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: severity.color }}
          >
            {severity.label}
          </span>
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-text-secondary"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed">
                {bottleneck.description}
              </p>

              {/* Impact */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Impact
                </span>
                <p className="text-sm text-foreground/80 italic mt-1">
                  {bottleneck.impact}
                </p>
              </div>

              {/* How to fix */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  How to Fix
                </span>
                <p className="text-sm text-foreground mt-1">
                  {bottleneck.fix}
                </p>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 pt-1">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(bottleneck.difficulty)}`}
                >
                  {bottleneck.difficulty}
                </span>
                <span className="text-xs text-text-secondary font-mono">
                  {bottleneck.estimated_cost}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
