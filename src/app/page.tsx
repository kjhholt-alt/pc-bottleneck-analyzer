"use client";

import { useState } from "react";
import type { SystemScan, AnalysisResult } from "@/lib/types";
import { analyzeScan } from "@/lib/analysis";
import { ScanUploader } from "@/components/ScanUploader";
import { Dashboard } from "@/components/Dashboard";
import { Monitor } from "lucide-react";

export default function Home() {
  const [scan, setScan] = useState<SystemScan | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  function handleScanLoaded(data: SystemScan) {
    setScan(data);
    setAnalysis(analyzeScan(data));
  }

  function handleReset() {
    setScan(null);
    setAnalysis(null);
  }

  return (
    <main className="min-h-screen">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan focus:text-background focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-cyan" aria-hidden="true" />
            <span className="font-semibold tracking-tight">
              PC Bottleneck Analyzer
            </span>
          </div>
          {scan && (
            <button
              onClick={handleReset}
              className="text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
            >
              New Scan
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {!scan || !analysis ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                Is Your PC Running at{" "}
                <span className="text-cyan">Full Speed</span>?
              </h1>
              <p className="text-text-secondary text-lg max-w-xl mx-auto">
                Upload your system scan to detect bottlenecks, get a performance
                score, and receive actionable recommendations.
              </p>
            </div>
            <ScanUploader onScanLoaded={handleScanLoaded} />
          </div>
        ) : (
          <Dashboard scan={scan} analysis={analysis} />
        )}
      </div>
    </main>
  );
}
