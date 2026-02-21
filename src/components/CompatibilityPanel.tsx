"use client";

import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type { CompatibilityCheck } from "@/lib/types";

interface CompatibilityPanelProps {
  checks: CompatibilityCheck[];
}

const STATUS_CONFIG = {
  ok: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-800/30",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-900/20",
    border: "border-amber-800/30",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-800/30",
  },
  unknown: {
    icon: HelpCircle,
    color: "text-text-secondary",
    bg: "bg-surface-raised/50",
    border: "border-border",
  },
};

export function CompatibilityPanel({ checks }: CompatibilityPanelProps) {
  const hasIssues = checks.some(
    (c) => c.status === "warning" || c.status === "error",
  );

  return (
    <motion.div
      className="bg-surface border border-border rounded-xl p-4 space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield
          size={16}
          className={hasIssues ? "text-amber-400" : "text-green-400"}
        />
        <h3 className="text-sm font-semibold text-foreground">
          Compatibility Check
        </h3>
        <span className="text-xs text-text-secondary font-mono ml-auto">
          {checks.filter((c) => c.status === "ok").length}/{checks.length} clear
        </span>
      </div>

      {/* Checks list */}
      <div className="space-y-2">
        {checks.map((check, i) => {
          const config = STATUS_CONFIG[check.status];
          const Icon = config.icon;

          return (
            <motion.div
              key={check.id}
              className={`flex items-start gap-2.5 px-3 py-2.5 ${config.bg} border ${config.border} rounded-lg`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Icon size={15} className={`${config.color} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${config.color}`}>
                  {check.title}
                </span>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {check.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
