import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { BLUEPRINT_ENABLED, BLUEPRINT_PRICE } from "@/lib/blueprint-access";

/**
 * Shared inline CTA box, matching the pattern already repeated across
 * best-gpu-for/[game], /tier-lists, and blog posts (bg-surface border
 * border-cyan/30 rounded-2xl p-6 text-center + heading + copy + button).
 * Renders nothing while the Blueprint product is dormant.
 */
export function BlueprintCTA({ className = "" }: { className?: string }) {
  if (!BLUEPRINT_ENABLED) return null;

  return (
    <div
      className={`bg-surface border border-cyan/30 rounded-2xl p-6 text-center ${className}`}
    >
      <div className="flex items-center justify-center gap-2 text-cyan text-xs font-mono mb-2">
        <FileText size={14} />
        NEW &middot; {BLUEPRINT_PRICE} ONE-TIME
      </div>
      <h3 className="text-lg font-semibold mb-2">Get Your Upgrade Blueprint</h3>
      <p className="text-sm text-text-secondary mb-4">
        A personalized upgrade ladder at 3 budgets, FPS uplift for your games,
        and net cost after selling your old parts — a permanent, printable
        plan built from your exact hardware.
      </p>
      <Link
        href="/blueprint"
        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
      >
        Build My Blueprint <ArrowRight size={14} />
      </Link>
    </div>
  );
}
