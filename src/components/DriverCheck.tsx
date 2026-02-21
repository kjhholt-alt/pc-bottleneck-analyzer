"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ExternalLink, Shield } from "lucide-react";
import { checkDriverStatus, type DriverStatus } from "@/data/driver-versions";
import type { SystemScan } from "@/lib/types";

const STATUS_CONFIG: Record<
  DriverStatus,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  up_to_date: {
    icon: CheckCircle2,
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "rgba(16, 185, 129, 0.3)",
    label: "Up to Date",
  },
  outdated: {
    icon: AlertTriangle,
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(245, 158, 11, 0.3)",
    label: "Update Available",
  },
  very_outdated: {
    icon: XCircle,
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "rgba(239, 68, 68, 0.3)",
    label: "Outdated",
  },
  unknown: {
    icon: HelpCircle,
    color: "var(--text-secondary)",
    bg: "rgba(136, 136, 160, 0.1)",
    border: "var(--border)",
    label: "Unknown",
  },
};

export function DriverCheck({ scan }: { scan: SystemScan }) {
  const result = useMemo(
    () => checkDriverStatus(scan.gpu.model_name, scan.gpu.driver_version),
    [scan.gpu.model_name, scan.gpu.driver_version],
  );

  const config = STATUS_CONFIG[result.status];
  const Icon = config.icon;

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} className="text-text-secondary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Driver Status
        </h3>
      </div>

      <div
        className="flex items-start gap-3 px-3 py-3 rounded-xl"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <Icon size={18} style={{ color: config.color }} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            {result.message}
          </p>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-text-secondary">
            <span>
              Installed: <span className="text-foreground">{result.currentVersion}</span>
            </span>
            <span>
              Latest:{" "}
              <span className="text-foreground">{result.latestInfo.latestVersion}</span>
            </span>
          </div>
        </div>
      </div>

      {result.status !== "up_to_date" && result.status !== "unknown" && (
        <motion.a
          href={result.latestInfo.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 text-xs font-medium
                     border rounded-xl transition-colors"
          style={{
            color: config.color,
            borderColor: config.border,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <ExternalLink size={13} />
          Download {result.latestInfo.releaseName}
        </motion.a>
      )}
    </motion.div>
  );
}
