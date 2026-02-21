"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  CheckCircle2,
  Clock,
  Gauge,
} from "lucide-react";
import type { SystemScan, UpgradeCategory, UpgradePhase } from "@/lib/types";
import { getUpgradeGuide, buildBIOSPhase } from "@/data/upgrade-guides";
import { checkCompatibility } from "@/lib/compatibility";
import { WalkthroughStep } from "./WalkthroughStep";
import { CompatibilityPanel } from "./CompatibilityPanel";

interface UpgradeWalkthroughProps {
  scan: SystemScan;
  category?: UpgradeCategory;
  targetHardware?: string;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<UpgradeCategory, typeof Cpu> = {
  cpu: Cpu,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
};

const CATEGORY_CURRENT: Record<UpgradeCategory, (scan: SystemScan) => string> = {
  cpu: (s) => s.cpu.model_name,
  gpu: (s) => s.gpu.model_name,
  ram: (s) => `${s.ram.total_gb} GB ${s.ram.form_factor} @ ${s.ram.speed_mhz} MHz`,
  storage: (s) => {
    const boot = s.storage.find((d) => d.is_boot_drive);
    return boot ? `${boot.model} (${boot.type})` : "Unknown";
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-green-400 bg-green-900/20 border-green-800/30",
  Intermediate: "text-amber-400 bg-amber-900/20 border-amber-800/30",
  Advanced: "text-red-400 bg-red-900/20 border-red-800/30",
};

// ─── Category Picker ─────────────────────────────────────────────────────────

function CategoryPicker({
  scan,
  onSelect,
}: {
  scan: SystemScan;
  onSelect: (cat: UpgradeCategory) => void;
}) {
  const categories: UpgradeCategory[] = ["cpu", "gpu", "ram", "storage"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Upgrade Walkthrough
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Choose a component to get step-by-step upgrade instructions
          personalized to your system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat, i) => {
          const Icon = CATEGORY_ICONS[cat];
          const guide = getUpgradeGuide(cat);
          const current = CATEGORY_CURRENT[cat](scan);

          return (
            <motion.button
              key={cat}
              onClick={() => onSelect(cat)}
              className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl
                         text-left hover:border-cyan/40 hover:bg-surface-raised/50 transition-colors duration-200"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="shrink-0 p-2 bg-cyan-900/20 border border-cyan-800/30 rounded-lg">
                <Icon size={20} className="text-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {guide.title}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  Current: {current}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-text-secondary/70 flex items-center gap-1">
                    <Clock size={11} />
                    {guide.estimatedTime}
                  </span>
                  <span className="text-xs text-text-secondary/70 flex items-center gap-1">
                    <Gauge size={11} />
                    {guide.difficulty}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Stepper ────────────────────────────────────────────────────────

function ProgressStepper({
  phases,
  currentPhase,
  completedSteps,
  onPhaseClick,
}: {
  phases: UpgradePhase[];
  currentPhase: number;
  completedSteps: Set<string>;
  onPhaseClick: (index: number) => void;
}) {
  function isPhaseComplete(phase: UpgradePhase): boolean {
    return phase.steps.length > 0 && phase.steps.every((s) => completedSteps.has(s.id));
  }

  return (
    <div className="flex items-center justify-between w-full py-3 px-2">
      {phases.map((phase, i) => {
        const isActive = i === currentPhase;
        const isComplete = isPhaseComplete(phase);
        const isPast = i < currentPhase;

        return (
          <div key={phase.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <button
              onClick={() => onPhaseClick(i)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                  isComplete
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                      ? "bg-cyan border-cyan text-background"
                      : isPast
                        ? "bg-surface-raised border-cyan/40 text-cyan"
                        : "bg-surface-raised border-border text-text-secondary"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isComplete ? (
                  <CheckCircle2 size={16} />
                ) : (
                  i + 1
                )}
              </motion.div>
              <span
                className={`text-[10px] font-mono hidden sm:block max-w-[80px] text-center leading-tight ${
                  isActive ? "text-cyan" : "text-text-secondary/60"
                }`}
              >
                {phase.title}
              </span>
            </button>

            {/* Connecting line */}
            {i < phases.length - 1 && (
              <div className="flex-1 mx-1.5">
                <div
                  className={`h-0.5 rounded-full transition-colors duration-300 ${
                    i < currentPhase ? "bg-cyan/60" : "bg-border"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function UpgradeWalkthrough({
  scan,
  category: initialCategory,
  targetHardware,
  onClose,
}: UpgradeWalkthroughProps) {
  const [category, setCategory] = useState<UpgradeCategory | null>(
    initialCategory ?? null,
  );
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Build the full guide with dynamic BIOS phase
  const { guide, phases, compatChecks } = useMemo(() => {
    if (!category) return { guide: null, phases: [], compatChecks: [] };

    const g = getUpgradeGuide(category);
    const biosPhase = buildBIOSPhase(category, scan.motherboard.model);
    const allPhases = [...g.phases, biosPhase];
    const checks = checkCompatibility(scan, category, targetHardware);

    return { guide: g, phases: allPhases, compatChecks: checks };
  }, [category, scan, targetHardware]);

  const totalSteps = phases.reduce((sum, p) => sum + p.steps.length, 0);
  const progress = totalSteps > 0
    ? Math.round((completedSteps.size / totalSteps) * 100)
    : 0;

  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }, []);

  // Category picker screen
  if (!category || !guide) {
    return (
      <div className="space-y-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
        <CategoryPicker scan={scan} onSelect={setCategory} />
      </div>
    );
  }

  const currentPhaseData = phases[currentPhase];
  const Icon = CATEGORY_ICONS[category];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onClose}
            className="shrink-0 mt-1 p-1.5 rounded-lg hover:bg-surface-raised transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} className="text-text-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-cyan" />
              <h2 className="text-lg font-semibold text-foreground">
                {guide.title}
              </h2>
            </div>
            {targetHardware && (
              <p className="text-sm text-cyan mt-0.5 ml-[26px]">
                Target: {targetHardware}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 ml-[26px]">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Clock size={11} />
                {guide.estimatedTime}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  DIFFICULTY_COLORS[guide.difficulty]
                }`}
              >
                {guide.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-foreground">{progress}%</span>
          <p className="text-xs text-text-secondary">
            {completedSteps.size}/{totalSteps} steps
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-surface border border-border rounded-xl px-2 py-1">
        <ProgressStepper
          phases={phases}
          currentPhase={currentPhase}
          completedSteps={completedSteps}
          onPhaseClick={setCurrentPhase}
        />
      </div>

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {currentPhaseData && (
          <motion.div
            key={currentPhaseData.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Phase header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Phase {currentPhase + 1}: {currentPhaseData.title}
              </h3>
              <span className="text-xs font-mono text-text-secondary">
                {currentPhaseData.steps.filter((s) => completedSteps.has(s.id)).length}/
                {currentPhaseData.steps.length} done
              </span>
            </div>

            {/* Compatibility panel on first phase */}
            {currentPhase === 0 && compatChecks.length > 0 && (
              <CompatibilityPanel checks={compatChecks} />
            )}

            {/* Steps */}
            <div className="space-y-3">
              {currentPhaseData.steps.map((step, i) => (
                <WalkthroughStep
                  key={step.id}
                  step={step}
                  index={i}
                  isCompleted={completedSteps.has(step.id)}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={() => setCurrentPhase((p) => Math.max(0, p - 1))}
          disabled={currentPhase === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
            currentPhase === 0
              ? "text-text-secondary/40 cursor-not-allowed"
              : "text-text-secondary hover:text-foreground hover:bg-surface-raised"
          }`}
        >
          <ArrowLeft size={15} />
          Previous
        </button>

        {currentPhase < phases.length - 1 ? (
          <button
            onClick={() => setCurrentPhase((p) => Math.min(phases.length - 1, p + 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-cyan
                       bg-cyan/10 border border-cyan/30 rounded-xl
                       hover:bg-cyan/20 transition-colors"
          >
            Next Phase
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-green-400
                       bg-green-900/20 border border-green-800/30 rounded-xl
                       hover:bg-green-900/30 transition-colors"
          >
            <CheckCircle2 size={15} />
            Complete Guide
          </button>
        )}
      </div>
    </div>
  );
}
