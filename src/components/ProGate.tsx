"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { isFeatureLocked } from "@/lib/pro";

interface ProGateProps {
  feature: string;
  children: ReactNode;
}

const FEATURE_LABELS: Record<string, string> = {
  ai: "AI Deep Analysis",
  fps: "Game FPS Estimator",
  simulate: "Upgrade Simulator",
  monitor: "Real-time Monitor",
  "pdf-export": "PDF Report Export",
};

export function ProGate({ feature, children }: ProGateProps) {
  if (!isFeatureLocked(feature)) {
    return <>{children}</>;
  }

  const label = FEATURE_LABELS[feature] ?? "This feature";

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-surface/95 backdrop-blur-md border border-cyan/30 rounded-2xl p-8 max-w-sm text-center shadow-lg shadow-cyan/5">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan/10 flex items-center justify-center">
            <Lock size={22} className="text-cyan" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">{label}</h3>

          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Unlock this feature and get the full picture of your PC&apos;s performance with a one-time Pro upgrade.
          </p>

          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan text-background rounded-xl text-sm font-semibold hover:bg-cyan/90 transition-colors"
          >
            <Sparkles size={14} />
            Upgrade to Pro &mdash; $4.99
          </Link>

          <p className="text-xs text-text-secondary/60 mt-3">One-time payment &middot; Instant access</p>
        </div>
      </motion.div>
    </div>
  );
}
