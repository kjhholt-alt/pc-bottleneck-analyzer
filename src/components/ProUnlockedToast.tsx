"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { consumeJustUnlocked } from "./LemonSqueezyProvider";

/**
 * One-time "Pro unlocked" confirmation shown on the first page load after
 * a successful checkout. Auto-dismisses after 8 seconds.
 */
export function ProUnlockedToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (consumeJustUnlocked()) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
                     bg-surface border border-cyan/40 rounded-2xl px-5 py-3.5 shadow-lg shadow-cyan/10"
          role="status"
        >
          <div className="w-8 h-8 rounded-full bg-cyan/15 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-cyan" />
          </div>
          <div className="pr-2">
            <p className="text-sm font-semibold text-foreground">Pro unlocked</p>
            <p className="text-xs text-text-secondary">
              Thanks for supporting PCopti — your license key is in your receipt email.
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="text-text-secondary/60 hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
