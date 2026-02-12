"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardTabs } from "./DashboardTabs";
import { SystemOverview } from "./SystemOverview";
import { BottleneckCard } from "./BottleneckCard";
import { RecommendationList } from "./RecommendationList";
import { RawDataViewer } from "./RawDataViewer";
import type { SystemScan, AnalysisResult } from "@/lib/types";

interface DashboardProps {
  scan: SystemScan;
  analysis: AnalysisResult;
}

const tabTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
};

export function Dashboard({ scan, analysis }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" {...tabTransition}>
            <SystemOverview scan={scan} score={analysis.score} />
          </motion.div>
        )}

        {activeTab === "bottlenecks" && (
          <motion.div key="bottlenecks" {...tabTransition}>
            <div className="space-y-3">
              {analysis.bottlenecks.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      Detected Bottlenecks
                    </h2>
                    <span className="text-sm text-text-secondary font-mono">
                      {analysis.bottlenecks.length} found
                    </span>
                  </div>
                  {analysis.bottlenecks.map((bottleneck, i) => (
                    <BottleneckCard
                      key={bottleneck.id}
                      bottleneck={bottleneck}
                      index={i}
                    />
                  ))}
                </>
              ) : (
                <motion.div
                  className="text-center py-16 text-text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-lg font-medium">No bottlenecks detected</p>
                  <p className="text-sm mt-1">
                    Your system is running smoothly
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "recommendations" && (
          <motion.div key="recommendations" {...tabTransition}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recommendations
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Prioritized actions to improve performance
              </p>
            </div>
            <RecommendationList recommendations={analysis.recommendations} />
          </motion.div>
        )}

        {activeTab === "raw" && (
          <motion.div key="raw" {...tabTransition}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Raw Scan Data
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Full system scan output
              </p>
            </div>
            <RawDataViewer scan={scan} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
