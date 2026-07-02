"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { generateBlueprint, type Blueprint, type BlueprintPickerInput } from "@/lib/blueprint";
import {
  getSavedBlueprintInput,
  saveBlueprintInput,
  hasBlueprintAccess,
} from "@/lib/blueprint-access";
import { BlueprintPicker } from "./BlueprintPicker";
import { BlueprintPaywall } from "./BlueprintPaywall";
import { BlueprintReport } from "./BlueprintReport";

/**
 * Client-side orchestrator for /blueprint: picker -> paywall -> report.
 * Stateless fulfillment — the pick lives in localStorage and the report is
 * regenerated from it on every load; only the license key is validated
 * server-side.
 */
export function BlueprintApp() {
  const [input, setInput] = useState<BlueprintPickerInput | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = getSavedBlueprintInput();
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BlueprintPickerInput;
        setInput(parsed);
        setBlueprint(generateBlueprint(parsed));
      } catch {
        // Corrupt/old localStorage value — fall through to the picker
      }
    }
    setUnlocked(hasBlueprintAccess());
    setHydrated(true);
  }, []);

  function handlePickerSubmit(newInput: BlueprintPickerInput) {
    saveBlueprintInput(JSON.stringify(newInput));
    setInput(newInput);
    setBlueprint(generateBlueprint(newInput));
  }

  // Avoid a flash of the picker before we've checked localStorage.
  if (!hydrated) return null;

  if (!blueprint) {
    return <BlueprintPicker onSubmit={handlePickerSubmit} defaultValue={input} />;
  }

  if (!unlocked) {
    return <BlueprintPaywall blueprint={blueprint} onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setBlueprint(null)}
        className="print-hidden inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
      >
        <ArrowLeft size={12} /> Edit my picks
      </button>
      <BlueprintReport blueprint={blueprint} source="unlocked" />
    </div>
  );
}
