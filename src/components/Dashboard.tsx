"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List } from "lucide-react";
import { DashboardTabs } from "./DashboardTabs";
import { SystemOverview } from "./SystemOverview";
import { BottleneckCard } from "./BottleneckCard";
import { RecommendationList } from "./RecommendationList";
import { RawDataViewer } from "./RawDataViewer";
import { MonitorView } from "./MonitorView";
import { UpgradeSimulator } from "./UpgradeSimulator";
import { UpgradeWalkthrough } from "./UpgradeWalkthrough";
import { AIAnalysis } from "./AIAnalysis";
import type { SystemScan, AnalysisResult, UpgradeCategory } from "@/lib/types";

interface DashboardProps {
  scan: SystemScan;
  analysis: AnalysisResult;
  isBuildPlan?: boolean;
}

interface WalkthroughState {
  category?: UpgradeCategory;
  targetHardware?: string;
}

const tabTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
};

export function Dashboard({ scan, analysis, isBuildPlan }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [walkthroughState, setWalkthroughState] = useState<WalkthroughState | null>(null);

  const handleStartWalkthrough = useCallback(
    (category: UpgradeCategory, targetHardware?: string) => {
      setWalkthroughState({ category, targetHardware });
    },
    [],
  );

  const handleCloseWalkthrough = useCallback(() => {
    setWalkthroughState(null);
  }, []);

  // Walkthrough overlay — replaces dashboard content when active
  if (walkthroughState) {
    return (
      <UpgradeWalkthrough
        scan={scan}
        category={walkthroughState.category}
        targetHardware={walkthroughState.targetHardware}
        onClose={handleCloseWalkthrough}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Build plan banner */}
      {isBuildPlan && (
        <motion.div
          className="flex items-center gap-3 px-4 py-3 bg-cyan-dim border border-cyan/30 rounded-xl"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <List size={16} className="text-cyan shrink-0" />
          <div>
            <span className="text-cyan font-semibold text-sm">Build Plan Analysis</span>
            <span className="text-text-secondary text-sm ml-2">
              Imported from PCPartPicker — live usage data is unavailable; scores reflect expected hardware balance.
            </span>
          </div>
        </motion.div>
      )}

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview" {...tabTransition}>
            <SystemOverview scan={scan} score={analysis.score} />
          </motion.div>
        )}

        {activeTab === "bottlenecks" && (
          <motion.div key="bottlenecks" role="tabpanel" id="tabpanel-bottlenecks" aria-labelledby="tab-bottlenecks" {...tabTransition}>
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
          <motion.div key="recommendations" role="tabpanel" id="tabpanel-recommendations" aria-labelledby="tab-recommendations" {...tabTransition}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recommendations
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Prioritized actions to improve performance
              </p>
            </div>
            <RecommendationList recommendations={analysis.recommendations} onStartWalkthrough={handleStartWalkthrough} />
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div key="ai" role="tabpanel" id="tabpanel-ai" aria-labelledby="tab-ai" {...tabTransition}>
            <AIAnalysis scan={scan} analysis={analysis} />
          </motion.div>
        )}

        {activeTab === "simulate" && (
          <motion.div key="simulate" role="tabpanel" id="tabpanel-simulate" aria-labelledby="tab-simulate" {...tabTransition}>
            <UpgradeSimulator scan={scan} currentAnalysis={analysis} onStartWalkthrough={handleStartWalkthrough} />
          </motion.div>
        )}

        {activeTab === "monitor" && (
          <motion.div key="monitor" role="tabpanel" id="tabpanel-monitor" aria-labelledby="tab-monitor" {...tabTransition}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Live Monitor
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Real-time hardware stats from your scanner
              </p>
            </div>
            <MonitorView />
          </motion.div>
        )}

        {activeTab === "raw" && (
          <motion.div key="raw" role="tabpanel" id="tabpanel-raw" aria-labelledby="tab-raw" {...tabTransition}>
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
