"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, AlertTriangle, Lightbulb } from "lucide-react";
import type { UpgradeStep } from "@/lib/types";

interface WalkthroughStepProps {
  step: UpgradeStep;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
}

export function WalkthroughStep({
  step,
  index,
  isCompleted,
  onToggle,
}: WalkthroughStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetail = Boolean(step.detail);

  return (
    <motion.div
      className={`bg-surface border border-border rounded-xl overflow-hidden transition-opacity duration-300 ${
        isCompleted ? "opacity-50" : ""
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isCompleted ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="shrink-0 mt-0.5"
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          <motion.div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
              isCompleted
                ? "bg-green-500 border-green-500"
                : "border-border hover:border-cyan/60"
            }`}
            whileTap={{ scale: 0.85 }}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Check size={14} className="text-white" />
              </motion.div>
            )}
          </motion.div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold text-foreground transition-all duration-200 ${
              isCompleted ? "line-through text-text-secondary" : ""
            }`}
          >
            {step.title}
          </h4>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {step.description}
          </p>

          {/* Warning callout */}
          {step.warning && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-amber-900/20 border border-amber-800/30 rounded-lg">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {step.warning}
              </p>
            </div>
          )}

          {/* Tip callout */}
          {step.tip && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-cyan-900/20 border border-cyan-800/30 rounded-lg">
              <Lightbulb size={14} className="text-cyan shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-200/90 leading-relaxed">
                {step.tip}
              </p>
            </div>
          )}

          {/* Expandable detail */}
          {hasDetail && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={13} />
                </motion.div>
                {isExpanded ? "Less detail" : "More detail"}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-text-secondary/80 mt-2 leading-relaxed pl-1 border-l-2 border-border">
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
