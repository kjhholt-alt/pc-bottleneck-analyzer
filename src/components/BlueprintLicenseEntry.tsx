"use client";

import { useState } from "react";
import { KeyRound, Loader2, Check } from "lucide-react";
import { storeBlueprintLicense } from "@/lib/blueprint-access";

/**
 * License-key entry for the Blueprint product. Unlike Pro's checkout overlay
 * (which grants access instantly via a shared postMessage handler), Blueprint
 * buyers always come back and paste their key — the shared overlay handler
 * is hardcoded to grant Pro, so reusing it here would incorrectly unlock Pro
 * instead of Blueprint. Keeping checkout as a plain link (see BlueprintPaywall)
 * and unlocking only via this validated key entry keeps the two products'
 * entitlements fully separate.
 */
export function BlueprintLicenseEntry({ onUnlocked }: { onUnlocked: () => void }) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function activate() {
    const trimmed = key.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: trimmed, product: "blueprint" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error ?? "Activation failed. Please try again.");
        return;
      }

      storeBlueprintLicense(trimmed, data?.instanceId ?? null);
      setStatus("success");
      onUnlocked();
    } catch {
      setStatus("idle");
      setError("Could not reach the server. Please try again.");
    }
  }

  return (
    <div className="text-left">
      <label className="flex items-center gap-1.5 text-xs text-text-secondary mb-1.5">
        <KeyRound size={12} className="text-cyan" />
        License key from your receipt email
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && activate()}
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          spellCheck={false}
          className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono
                     text-foreground placeholder:text-text-secondary/40 focus:outline-none focus:border-cyan/60"
        />
        <button
          type="button"
          onClick={activate}
          disabled={status === "loading" || !key.trim()}
          className="px-4 py-2 bg-cyan/15 border border-cyan/40 text-cyan rounded-lg text-xs font-semibold
                     hover:bg-cyan/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     inline-flex items-center gap-1.5 shrink-0"
        >
          {status === "loading" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : status === "success" ? (
            <Check size={12} />
          ) : null}
          {status === "success" ? "Unlocked!" : "Activate"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}
