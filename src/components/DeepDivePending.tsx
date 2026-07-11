"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Shown on the private delivery page while the webhook is still generating the
 * report. Polls /api/report/status and reloads the page once it's ready.
 */
export function DeepDivePending({ token }: { token: string }) {
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/report/status?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setChecks((c) => c + 1);
          if (data?.ready) {
            window.location.reload();
          }
        }
      } catch {
        // keep polling
      }
    }, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  return (
    <div className="bg-surface border border-border rounded-2xl p-10 text-center">
      <Loader2 size={28} className="text-cyan animate-spin mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">Building your report…</h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        We&apos;re generating your personalized deep-dive from your specs. This usually takes a few
        seconds after your payment clears. This page will refresh automatically when it&apos;s ready.
      </p>
      <p className="text-[11px] text-text-secondary/60 mt-4 font-mono">
        Checked {checks} time{checks === 1 ? "" : "s"} · you can safely bookmark this page
      </p>
    </div>
  );
}
