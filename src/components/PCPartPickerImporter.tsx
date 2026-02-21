"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import type { SystemScan } from "@/lib/types";

interface PCPartPickerImporterProps {
  onScanLoaded: (scan: SystemScan) => void;
  onCancel: () => void;
}

export function PCPartPickerImporter({
  onScanLoaded,
  onCancel,
}: PCPartPickerImporterProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a PCPartPicker build URL first.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/pcpartpicker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to import build list.");
        return;
      }

      onScanLoaded(data.scan as SystemScan);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [url, onScanLoaded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleImport();
    if (e.key === "Escape") onCancel();
  };

  return (
    <motion.div
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Label */}
      <p className="text-sm text-text-secondary mb-3 text-center">
        Paste your{" "}
        <span className="text-cyan font-medium">PCPartPicker</span> build list
        URL
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://pcpartpicker.com/list/..."
            disabled={isLoading}
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl
                       text-sm text-foreground placeholder:text-text-secondary/60
                       focus:outline-none focus:border-cyan/60 focus:bg-surface-raised
                       disabled:opacity-50 transition-colors duration-150"
          />
        </div>

        <motion.button
          onClick={handleImport}
          disabled={isLoading || !url.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan text-background
                     font-semibold text-sm rounded-xl
                     hover:bg-cyan/90 active:bg-cyan/80
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150"
          whileTap={{ scale: 0.97 }}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              Analyze
              <ChevronRight size={14} />
            </>
          )}
        </motion.button>
      </div>

      {/* Helper text */}
      {!error && (
        <p className="text-xs text-text-secondary/60 mt-2 text-center">
          e.g. pcpartpicker.com/list/XXXXXX or pcpartpicker.com/user/name/saved/#view
        </p>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-dim border border-red/30 rounded-xl text-sm"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <AlertCircle size={15} className="text-red shrink-0 mt-0.5" />
            <span className="text-red">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel */}
      <div className="mt-3 text-center">
        <button
          onClick={onCancel}
          className="text-xs text-text-secondary hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
    </motion.div>
  );
}
