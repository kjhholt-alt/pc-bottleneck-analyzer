"use client";

import { useState } from "react";
import { KeyRound, Loader2, Check } from "lucide-react";
import { setProUser, storeLicense } from "@/lib/pro";

/**
 * "Already bought?" license-key entry. Collapsed to a text link; expands
 * to an inline form that validates the key server-side and unlocks Pro.
 */
export function RestorePurchase({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
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
        body: JSON.stringify({ licenseKey: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error ?? "Activation failed. Please try again.");
        return;
      }

      storeLicense(trimmed, data?.instanceId ?? null);
      setProUser(true);
      setStatus("success");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setStatus("idle");
      setError("Could not reach the server. Please try again.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`text-xs text-text-secondary/70 hover:text-cyan underline underline-offset-2 transition-colors ${className}`}
      >
        Already bought? Restore your purchase
      </button>
    );
  }

  return (
    <div className={`text-left ${className}`}>
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
