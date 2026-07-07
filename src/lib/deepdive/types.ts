// ─── PC Deep-Dive Report — shared types ──────────────────────────────────────
//
// The Deep-Dive Report is the site's third paid artifact. Unlike the Blueprint
// ($19, generated instantly client-side and unlocked with a license key), the
// Deep-Dive is generated SERVER-SIDE and ASYNCHRONOUSLY after a purchase, then
// delivered to the buyer at a private, unguessable link. That fulfillment model
// is why this product needs server storage (ReportOrder) and a webhook-driven
// generation step — see src/lib/deepdive/store.ts and the Lemon Squeezy webhook.

import type { Res } from "@/lib/gpu-for-game";
import type {
  HardwareEntry,
} from "@/data/hardware-db";
import type {
  PerformanceScore,
  Bottleneck,
  Recommendation,
  CompatibilityCheck,
} from "@/lib/types";
import type { LadderRung } from "@/lib/blueprint";

/** Storage class the buyer reports for their boot drive. */
export type StorageKind = "NVMe SSD" | "SATA SSD" | "HDD";

/**
 * Everything the buyer tells us about their rig. A superset of the Blueprint
 * picker input — same CPU/GPU/RAM/resolution/games, plus a storage class and an
 * optional free-text note about what feels slow (used verbatim, never sent to
 * any model — the generator is fully deterministic).
 */
export interface DeepDiveInput {
  cpuName: string;
  gpuName: string;
  ramGb: number;
  resolution: Res;
  /** Up to 5 `GameBenchmark.id` values (the report shows a per-game FPS table). */
  gameIds: string[];
  storageType?: StorageKind;
  /** Optional buyer context ("stutters in BG3", "want 144fps"). Sanitized, ≤280 chars. */
  notes?: string;
}

/** One row of the per-game FPS table in the report. */
export interface GameFpsRow {
  gameId: string;
  title: string;
  /** Estimated average FPS today at the buyer's resolution (GPU + CPU ceiling). */
  currentFps: number;
  /** Estimated FPS after the top affordable ladder upgrade (same res). */
  bestUpgradeFps: number;
  /** Human label: Struggling / Playable / Smooth / High-refresh / Competitive. */
  rating: string;
}

/** The fully-computed report, before it's rendered to HTML. Deterministic. */
export interface DeepDiveReport {
  input: DeepDiveInput;
  generatedAtISO: string;
  cpu: HardwareEntry;
  gpu: HardwareEntry;
  score: PerformanceScore;
  bottleneckCategory: "cpu" | "gpu";
  bottlenecks: Bottleneck[];
  recommendations: {
    free: Recommendation[];
    cheap: Recommendation[];
    upgrade: Recommendation[];
  };
  percentile: { overall: number; cpu: number; gpu: number; ram: number };
  games: GameFpsRow[];
  ladder: LadderRung[];
  orderOfOperations: string[];
  compatibility: CompatibilityCheck[];
  verdictProse: string;
  summaryBullets: string[];
}

// ─── Fulfillment (server-side) ───────────────────────────────────────────────

export type OrderStatus = "pending" | "fulfilled" | "failed";

/**
 * A persisted report order. Created (status "pending") when the buyer starts
 * checkout; transitioned to "fulfilled" (with rendered `html`) by the Lemon
 * Squeezy webhook once the `order_created` event arrives for its token.
 */
export interface ReportOrder {
  /** Unguessable delivery token — the credential for /report/r/[token]. */
  token: string;
  input: DeepDiveInput;
  status: OrderStatus;
  createdAt: string;
  fulfilledAt?: string;
  /** The rendered standalone HTML artifact (present when status === "fulfilled"). */
  html?: string;
  /** Lemon Squeezy order number, for buyer support. Never any PII/email. */
  orderRef?: string;
  /** Whether the fulfilling order was a Lemon Squeezy test-mode purchase. */
  testMode?: boolean;
  error?: string;
}
