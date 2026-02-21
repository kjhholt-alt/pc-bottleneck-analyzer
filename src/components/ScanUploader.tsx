"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileJson, Play, AlertCircle, List, Download, Terminal, ArrowRight } from "lucide-react";
import type { SystemScan } from "@/lib/types";
import { sampleScan } from "@/data/sample-scan";
import { PCPartPickerImporter } from "./PCPartPickerImporter";

interface ScanUploaderProps {
  onScanLoaded: (scan: SystemScan, isBuildPlan?: boolean) => void;
}

function validateScan(data: unknown): data is SystemScan {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.cpu === "object" &&
    obj.cpu !== null &&
    typeof obj.gpu === "object" &&
    obj.gpu !== null &&
    typeof obj.ram === "object" &&
    obj.ram !== null
  );
}

export function ScanUploader({ onScanLoaded }: ScanUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPCPP, setShowPCPP] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);

      // Guard against excessively large files (max 2 MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("File is too large. Maximum size is 2 MB.");
        setIsLoading(false);
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!validateScan(data)) {
          setError(
            "Invalid scan file. JSON must contain cpu, gpu, and ram fields."
          );
          setIsLoading(false);
          return;
        }

        // Short delay for visual feedback
        await new Promise((r) => setTimeout(r, 300));
        onScanLoaded(data);
      } catch {
        setError("Failed to parse JSON. Make sure the file is valid JSON.");
      } finally {
        setIsLoading(false);
      }
    },
    [onScanLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".json")) {
        processFile(file);
      } else {
        setError("Please drop a .json file.");
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDemoClick = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Brief loading state for visual feedback
    setTimeout(() => {
      onScanLoaded(sampleScan);
    }, 400);
  }, [onScanLoaded]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Scanner download + how-it-works */}
      <motion.div
        className="w-full max-w-lg mb-8 rounded-2xl border border-border bg-surface p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="text-xs font-mono text-text-secondary uppercase tracking-widest mb-4">
          How it works
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              n: "1",
              active: true,
              title: "Download scanner",
              desc: "Windows · no install · runs locally",
            },
            {
              n: "2",
              active: false,
              title: "Run as Admin",
              desc: <>Outputs <code className="text-cyan font-mono">system_scan.json</code></>,
            },
            {
              n: "3",
              active: false,
              title: "Upload below",
              desc: "Get score + recommendations",
            },
          ].map((step) => (
            <div key={step.n} className="flex flex-col gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  step.active
                    ? "bg-cyan/10 border-cyan/30"
                    : "bg-surface-raised border-border"
                }`}
              >
                <span
                  className={`text-xs font-bold ${step.active ? "text-cyan" : "text-text-secondary"}`}
                >
                  {step.n}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-tight">
                {step.title}
              </p>
              <p className="text-xs text-text-secondary leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/kjhholt-alt/pc-bottleneck-analyzer/releases/latest/download/scanner.exe"
          download
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl
                     bg-cyan/10 border border-cyan/30 text-cyan font-medium text-sm
                     hover:bg-cyan/20 hover:border-cyan/50 transition-all duration-200"
        >
          <Download size={15} />
          Download scanner.exe
          <ArrowRight size={13} className="ml-auto opacity-60" />
        </a>

        <div className="flex items-center gap-1.5 mt-3">
          <Terminal size={11} className="text-text-secondary shrink-0" />
          <p className="text-[11px] text-text-secondary font-mono">
            Right-click → Run as administrator → check desktop for{" "}
            <span className="text-cyan">system_scan.json</span>
          </p>
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed
          p-12 text-center transition-all duration-300
          ${
            isDragOver
              ? "border-cyan bg-cyan-dim shadow-[0_0_40px_rgba(34,209,238,0.15)]"
              : "border-border hover:border-cyan/50 hover:bg-surface"
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload system scan JSON file"
        />

        <motion.div
          className="flex flex-col items-center gap-4"
          animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <motion.div
              className="w-12 h-12 border-3 border-cyan/30 border-t-cyan rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <div
              className={`rounded-xl p-3 transition-colors duration-300 ${
                isDragOver ? "bg-cyan/20" : "bg-surface-raised"
              }`}
            >
              {isDragOver ? (
                <FileJson size={32} className="text-cyan" />
              ) : (
                <Upload size={32} className="text-text-secondary" />
              )}
            </div>
          )}

          <div>
            <p className="text-foreground font-semibold text-lg">
              {isDragOver
                ? "Drop to analyze"
                : isLoading
                  ? "Reading scan data..."
                  : "Drop system_scan.json here"}
            </p>
            {!isDragOver && !isLoading && (
              <p className="text-text-secondary text-sm mt-1">
                or click to browse files
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Separator */}
      <div className="flex items-center gap-4 my-6 w-full max-w-lg">
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-secondary text-sm font-medium">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Actions row: PCPartPicker + Demo */}
      <AnimatePresence mode="wait">
        {showPCPP ? (
          <PCPartPickerImporter
            key="pcpp"
            onScanLoaded={(scan) => onScanLoaded(scan, true)}
            onCancel={() => setShowPCPP(false)}
          />
        ) : (
          <motion.div
            key="buttons"
            className="flex flex-col items-center gap-3 w-full max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.button
              onClick={() => setShowPCPP(true)}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 py-3 w-full justify-center
                         bg-surface border border-border rounded-xl
                         text-foreground font-medium transition-all duration-200
                         hover:border-cyan/50 hover:bg-surface-raised hover:shadow-[0_0_20px_rgba(34,209,238,0.1)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <List size={16} className="text-cyan" />
              Import PCPartPicker Build
            </motion.button>

            <motion.button
              onClick={handleDemoClick}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 py-3 bg-surface border border-border rounded-xl
                         text-foreground font-medium transition-all duration-200
                         hover:border-cyan/50 hover:bg-surface-raised hover:shadow-[0_0_20px_rgba(34,209,238,0.1)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={16} className="text-cyan" />
              Try Demo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-6 flex items-center gap-2 px-4 py-3 bg-red-dim border border-red/30 rounded-xl text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle size={16} className="text-red shrink-0" />
            <span className="text-red">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
