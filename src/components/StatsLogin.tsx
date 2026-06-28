"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export function StatsLogin({ note }: { note?: string }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stats-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Wrong key");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8"
      >
        <div className="flex items-center gap-2 text-cyan mb-4">
          <Lock size={18} />
          <h1 className="text-lg font-semibold">View Tracker</h1>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          {note ?? "Enter the access key to view site analytics."}
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Access key"
          autoFocus
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-cyan/50"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !key}
          className="w-full bg-cyan text-background font-semibold rounded-xl py-2.5 text-sm hover:bg-cyan/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
