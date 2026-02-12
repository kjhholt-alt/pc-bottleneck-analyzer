"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Gift, DollarSign, ArrowUpCircle } from "lucide-react";
import type { Recommendation } from "@/lib/types";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

interface TierConfig {
  id: "free" | "cheap" | "upgrade";
  label: string;
  icon: typeof Gift;
  color: string;
  bg: string;
  border: string;
}

const tiers: TierConfig[] = [
  {
    id: "free",
    label: "Free Fixes",
    icon: Gift,
    color: "var(--green)",
    bg: "bg-green-dim",
    border: "border-green/30",
  },
  {
    id: "cheap",
    label: "Cheap Fixes",
    icon: DollarSign,
    color: "var(--amber)",
    bg: "bg-amber-dim",
    border: "border-amber/30",
  },
  {
    id: "upgrade",
    label: "Upgrades",
    icon: ArrowUpCircle,
    color: "var(--purple)",
    bg: "bg-purple-dim",
    border: "border-purple/30",
  },
];

function TierSection({
  config,
  items,
  defaultOpen,
  tierIndex,
}: {
  config: TierConfig;
  items: Recommendation[];
  defaultOpen: boolean;
  tierIndex: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = config.icon;

  if (items.length === 0) return null;

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: tierIndex * 0.1, ease: "easeOut" }}
    >
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-surface-raised/50"
      >
        <div
          className={`shrink-0 rounded-lg p-1.5 ${config.bg} ${config.border} border`}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm" style={{ color: config.color }}>
            {config.label}
          </h3>
          <span className="text-xs text-text-secondary">
            {items.length} recommendation{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-secondary"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50">
              {items.map((rec, i) => (
                <div
                  key={rec.id}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    i < items.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  {/* Priority number */}
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                      color: config.color,
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground text-sm font-medium">
                      {rec.title}
                    </h4>
                    <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                      {rec.impact}
                    </p>
                  </div>

                  {/* Cost */}
                  <span className="shrink-0 text-xs font-mono text-text-secondary">
                    {rec.estimated_cost}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RecommendationList({
  recommendations,
}: RecommendationListProps) {
  const grouped = tiers.map((tier) => ({
    config: tier,
    items: recommendations
      .filter((r) => r.tier === tier.id)
      .sort((a, b) => a.priority - b.priority),
  }));

  return (
    <div className="space-y-4">
      {grouped.map((group, i) => (
        <TierSection
          key={group.config.id}
          config={group.config}
          items={group.items}
          defaultOpen={i === 0}
          tierIndex={i}
        />
      ))}

      {recommendations.length === 0 && (
        <motion.div
          className="text-center py-12 text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg font-medium">No recommendations found</p>
          <p className="text-sm mt-1">Your system looks great!</p>
        </motion.div>
      )}
    </div>
  );
}
