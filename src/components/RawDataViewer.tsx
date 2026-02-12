"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Check,
  Download,
} from "lucide-react";
import type { SystemScan } from "@/lib/types";

interface RawDataViewerProps {
  scan: SystemScan;
}

// Key display names for top-level sections
const sectionLabels: Record<string, string> = {
  scan_id: "Scan ID",
  timestamp: "Timestamp",
  scan_duration_seconds: "Duration",
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  storage: "Storage",
  motherboard: "Motherboard",
  os: "Operating System",
  network: "Network",
  bios_settings: "BIOS Settings",
};

function JsonValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-text-secondary italic">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-green" : "text-red"}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-amber">{value}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-green">&quot;{value}&quot;</span>;
  }
  return null;
}

function JsonBlock({ data, indent = 0 }: { data: unknown; indent?: number }) {
  const pad = "  ".repeat(indent);

  if (Array.isArray(data)) {
    return (
      <div className="font-mono text-xs leading-relaxed">
        <span className="text-text-secondary">[</span>
        {data.map((item, i) => (
          <div key={i} style={{ paddingLeft: `${(indent + 1) * 16}px` }}>
            {typeof item === "object" && item !== null ? (
              <JsonBlock data={item} indent={indent + 1} />
            ) : (
              <JsonValue value={item} />
            )}
            {i < data.length - 1 && (
              <span className="text-text-secondary">,</span>
            )}
          </div>
        ))}
        <span className="text-text-secondary">{pad}]</span>
      </div>
    );
  }

  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);
    return (
      <div className="font-mono text-xs leading-relaxed">
        {entries.map(([key, val], i) => (
          <div
            key={key}
            style={{ paddingLeft: `${(indent + 1) * 16}px` }}
          >
            <span className="text-cyan">&quot;{key}&quot;</span>
            <span className="text-text-secondary">: </span>
            {typeof val === "object" && val !== null ? (
              <JsonBlock data={val} indent={indent + 1} />
            ) : (
              <JsonValue value={val} />
            )}
            {i < entries.length - 1 && (
              <span className="text-text-secondary">,</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <JsonValue value={data} />;
}

function CollapsibleSection({
  label,
  data,
  defaultOpen,
  index,
}: {
  label: string;
  data: unknown;
  defaultOpen: boolean;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Primitive values are shown inline, not collapsible
  if (typeof data !== "object" || data === null) {
    return (
      <motion.div
        className="flex items-center gap-2 px-4 py-2 font-mono text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.03 }}
      >
        <span className="text-purple font-semibold">{label}</span>
        <span className="text-text-secondary">:</span>
        <JsonValue value={data} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="border-b border-border/30 last:border-b-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-raised/50"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-secondary shrink-0"
        >
          <ChevronDown size={14} />
        </motion.div>
        <span className="text-purple font-mono text-sm font-semibold">
          {label}
        </span>
        <span className="text-text-secondary text-xs font-mono">
          {Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <JsonBlock data={data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RawDataViewer({ scan }: RawDataViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReddit = useCallback(() => {
    const formatted = JSON.stringify(scan, null, 2);
    const redditFormatted = formatted
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");
    navigator.clipboard.writeText(redditFormatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [scan]);

  const handleDownload = useCallback(() => {
    const formatted = JSON.stringify(scan, null, 2);
    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bottleneck-report-${scan.scan_id || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scan]);

  const entries = Object.entries(scan);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyReddit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surface border border-border rounded-xl
                     transition-all duration-200 hover:border-cyan/50 hover:bg-surface-raised"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green" />
              <span className="text-green">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-text-secondary" />
              <span className="text-foreground">Copy for Reddit</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surface border border-border rounded-xl
                     transition-all duration-200 hover:border-cyan/50 hover:bg-surface-raised"
        >
          <Download size={14} className="text-text-secondary" />
          <span className="text-foreground">Download Report</span>
        </button>
      </div>

      {/* JSON viewer */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {entries.map(([key, value], i) => (
          <CollapsibleSection
            key={key}
            label={sectionLabels[key] || key}
            data={value}
            defaultOpen={false}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
