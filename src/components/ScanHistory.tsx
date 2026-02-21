"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Download,
  GitCompareArrows,
  Check,
  AlertCircle,
} from "lucide-react";
import { getHistory, deleteScan, exportHistory, type SavedScan } from "@/lib/history";
import { getScoreColor } from "@/lib/score-utils";

interface ScanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScan: (scan: SavedScan) => void;
  onCompare: (scans: [SavedScan, SavedScan]) => void;
  currentScanId?: string;
}

export function ScanHistory({
  isOpen,
  onClose,
  onLoadScan,
  onCompare,
  currentScanId,
}: ScanHistoryProps) {
  const [history, setHistory] = useState<SavedScan[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Load history when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setCompareMode(false);
      setSelected(new Set());
      setConfirmDelete(null);
    }
  }, [isOpen]);

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDelete === id) {
        deleteScan(id);
        setHistory((prev) => prev.filter((s) => s.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setConfirmDelete(null);
      } else {
        setConfirmDelete(id);
      }
    },
    [confirmDelete],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const json = exportHistory();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pc-scan-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleCompare = useCallback(() => {
    const selectedScans = history.filter((s) => selected.has(s.id));
    if (selectedScans.length === 2) {
      onCompare([selectedScans[0], selectedScans[1]]);
    }
  }, [history, selected, onCompare]);

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">Scan History</h2>
              <div className="flex items-center gap-2">
                {history.length >= 2 && (
                  <button
                    onClick={() => {
                      setCompareMode((prev) => !prev);
                      setSelected(new Set());
                    }}
                    className={`text-xs font-mono px-2.5 py-1.5 rounded-md transition-colors ${
                      compareMode
                        ? "bg-cyan/20 text-cyan"
                        : "text-text-secondary hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <GitCompareArrows className="w-3.5 h-3.5 inline mr-1" />
                    Compare
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-text-secondary hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Close history"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compare action bar */}
            <AnimatePresence>
              {compareMode && (
                <motion.div
                  className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between shrink-0"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <span className="text-xs text-text-secondary">
                    Select 2 scans to compare ({selected.size}/2)
                  </span>
                  <button
                    disabled={selected.size !== 2}
                    onClick={handleCompare}
                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-cyan text-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan/90 transition-colors"
                  >
                    Compare Selected
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan list */}
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <AlertCircle className="w-10 h-10 text-text-secondary/40 mb-3" />
                  <p className="text-text-secondary font-medium">
                    No saved scans yet
                  </p>
                  <p className="text-text-secondary/60 text-sm mt-1">
                    Upload a scan to get started. Scans are saved automatically.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {history.map((entry) => {
                    const isCurrent = entry.id === currentScanId;
                    const isSelected = selected.has(entry.id);

                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        className={`relative rounded-lg border transition-colors cursor-pointer ${
                          isCurrent
                            ? "border-cyan/40 bg-cyan/5"
                            : isSelected
                              ? "border-cyan/30 bg-cyan/5"
                              : "border-border hover:border-border/80 hover:bg-surface/50"
                        }`}
                        onClick={() => {
                          if (compareMode) {
                            toggleSelect(entry.id);
                          } else {
                            onLoadScan(entry);
                          }
                        }}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Score badge */}
                              <div className="flex items-center gap-2 mb-1.5">
                                {compareMode && (
                                  <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? "border-cyan bg-cyan"
                                        : "border-border"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="w-3 h-3 text-background" />
                                    )}
                                  </div>
                                )}
                                <span
                                  className="text-sm font-bold font-mono"
                                  style={{
                                    color: getScoreColor(entry.totalScore),
                                  }}
                                >
                                  {entry.totalScore}/100
                                </span>
                                <span
                                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                                  style={{
                                    color: getScoreColor(entry.totalScore),
                                    backgroundColor: `color-mix(in srgb, ${getScoreColor(entry.totalScore)} 15%, transparent)`,
                                  }}
                                >
                                  {entry.grade}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">
                                    CURRENT
                                  </span>
                                )}
                              </div>

                              {/* Hardware names */}
                              <p className="text-sm text-foreground truncate">
                                {entry.cpuName}
                              </p>
                              <p className="text-xs text-text-secondary truncate">
                                {entry.gpuName}
                              </p>
                            </div>

                            {/* Delete button */}
                            {!compareMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(entry.id);
                                }}
                                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                                  confirmDelete === entry.id
                                    ? "bg-red/20 text-red"
                                    : "text-text-secondary/40 hover:text-red hover:bg-red/10"
                                }`}
                                aria-label={
                                  confirmDelete === entry.id
                                    ? "Confirm delete"
                                    : "Delete scan"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Date */}
                          <p className="text-[11px] text-text-secondary/50 font-mono mt-1.5">
                            {formatDate(entry.savedAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="px-5 py-3 border-t border-border shrink-0">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-cyan transition-colors w-full justify-center py-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All ({history.length} scans)
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
