"use client";

import { useEffect } from "react";
import { Lock, Sparkles } from "lucide-react";
import type { Blueprint } from "@/lib/blueprint";
import { BLUEPRINT_CHECKOUT_URL, BLUEPRINT_PRICE } from "@/lib/blueprint-access";
import { trackBlueprintPurchaseClick, trackBlueprintView } from "@/lib/track";
import { BlueprintLicenseEntry } from "./BlueprintLicenseEntry";

export function BlueprintPaywall({
  blueprint,
  onUnlocked,
}: {
  blueprint: Blueprint;
  onUnlocked: () => void;
}) {
  useEffect(() => {
    trackBlueprintView("paywall-preview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { verdict, cpuEntry, gpuEntry } = blueprint;

  return (
    <div className="space-y-6">
      {/* Verdict is shown free — it builds trust in the data before asking to pay. */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold font-mono text-cyan">{verdict.score.grade}</div>
          <div>
            <p className="text-sm font-semibold">Performance score: {verdict.score.total}/100</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {cpuEntry.name} &middot; {gpuEntry.name}
            </p>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="blur-sm pointer-events-none select-none grid sm:grid-cols-3 gap-4" aria-hidden="true">
          {[150, 300, 600].map((budget) => (
            <div key={budget} className="bg-surface border border-border rounded-2xl p-5 h-48">
              <div className="text-xs font-mono text-cyan mb-2">~${budget} BUDGET</div>
              <div className="h-4 w-3/4 bg-surface-raised rounded mb-2" />
              <div className="h-3 w-1/2 bg-surface-raised rounded mb-4" />
              <div className="h-3 w-full bg-surface-raised rounded mb-1.5" />
              <div className="h-3 w-full bg-surface-raised rounded mb-1.5" />
              <div className="h-3 w-2/3 bg-surface-raised rounded" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-surface/95 backdrop-blur-md border border-cyan/30 rounded-2xl p-8 max-w-sm text-center shadow-lg shadow-cyan/5">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan/10 flex items-center justify-center">
              <Lock size={22} className="text-cyan" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Unlock Your Full Blueprint</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Upgrade ladder at 3 budgets, FPS uplift for your games, resale-adjusted net cost,
              and the exact order to buy things in.
            </p>

            {BLUEPRINT_CHECKOUT_URL ? (
              <a
                href={BLUEPRINT_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBlueprintPurchaseClick("paywall")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan text-background rounded-xl text-sm font-semibold hover:bg-cyan/90 transition-colors"
              >
                <Sparkles size={14} />
                Get My Blueprint &mdash; {BLUEPRINT_PRICE}
              </a>
            ) : (
              <p className="text-xs text-text-secondary/70">Checkout isn&apos;t live yet.</p>
            )}

            <p className="text-xs text-text-secondary/60 mt-3 mb-4">
              One-time payment &middot; Instant access after activation
            </p>

            <BlueprintLicenseEntry onUnlocked={onUnlocked} />
          </div>
        </div>
      </div>
    </div>
  );
}
