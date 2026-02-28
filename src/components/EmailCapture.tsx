"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export function EmailCapture({ source = "blog" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-surface border border-green/30 rounded-2xl p-6 text-center">
        <Check className="w-8 h-8 text-green mx-auto mb-2" />
        <p className="text-sm text-foreground font-semibold">You&apos;re in.</p>
        <p className="text-xs text-text-secondary">
          We&apos;ll email you when we publish new guides.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-cyan" />
        <span className="text-sm font-semibold text-foreground">
          Get hardware tips in your inbox
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-4">
        New guides, upgrade deals, and optimization tips. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground
                     placeholder:text-text-secondary focus:outline-none focus:border-cyan/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 bg-cyan text-background text-sm font-semibold rounded-xl
                     hover:bg-cyan/90 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
