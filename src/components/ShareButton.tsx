"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Check, Copy, AlertCircle } from "lucide-react";
import type { SystemScan } from "@/lib/types";
import { encodeScanForURL, getShareURL } from "@/lib/share";

interface ShareButtonProps {
  scan: SystemScan;
}

type State = "idle" | "copied" | "too_large" | "error";

export function ShareButton({ scan }: ShareButtonProps) {
  const [state, setState] = useState<State>("idle");

  const handleShare = useCallback(async () => {
    const encoded = encodeScanForURL(scan);

    if (encoded === null) {
      setState("too_large");
      setTimeout(() => setState("idle"), 4000);
      return;
    }

    const url = getShareURL(encoded);

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [scan]);

  const handleCopyJSON = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [scan]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === "too_large" ? (
          <motion.div
            key="too_large"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <span className="text-xs text-text-secondary">Scan too large —</span>
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1 text-xs text-cyan hover:text-cyan/80 transition-colors"
            >
              <Copy size={12} />
              Copy JSON
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
            aria-label="Share scan results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {state === "copied" ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : state === "error" ? (
              <>
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-red-400">Failed</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
