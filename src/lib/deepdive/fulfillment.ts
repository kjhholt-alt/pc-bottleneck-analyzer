// ─── PC Deep-Dive Report — fulfillment (server-only) ─────────────────────────
//
// Server-only helpers that must never be imported from a client component:
//   • generateToken   — the unguessable delivery credential
//   • buildCheckoutUrl — attaches the token to the Lemon Squeezy hosted checkout
//   • fulfillReportOrder — the webhook-driven generate + store step
//
// Fulfillment is guarded by its OWN server flag (DEEPDIVE_FULFILLMENT_ENABLED),
// separate from the public product flag. Even with the storefront live, the
// webhook will not generate a report until this is explicitly turned on AND a
// durable store is provisioned — the "live switch" that stays OFF until Kruz
// clears it (specs/DEEPDIVE_GOLIVE.md).

import { randomBytes } from "crypto";
import { generateDeepDiveReport } from "./report";
import { renderReportHtml } from "./render";
import { getReportStore } from "./store";
import type { ReportOrder } from "./types";

/** A 32-char URL-safe token (24 random bytes, base64url). */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

/** Whether the webhook may actually generate + fulfill report orders. */
export function isFulfillmentEnabled(): boolean {
  return process.env.DEEPDIVE_FULFILLMENT_ENABLED === "true";
}

/**
 * Build the hosted Lemon Squeezy checkout URL for a report order, tagging it
 * with the delivery token as checkout custom data. Lemon Squeezy echoes
 * `checkout[custom][report_token]` back to the webhook as
 * `meta.custom_data.report_token`, which is how the webhook matches the paid
 * order to the pending record.
 */
export function buildCheckoutUrl(base: string, token: string): string {
  if (!base) return "";
  try {
    const url = new URL(base);
    url.searchParams.set("checkout[custom][report_token]", token);
    return url.toString();
  } catch {
    return "";
  }
}

export interface FulfillMeta {
  orderRef?: string;
  testMode?: boolean;
  now?: Date;
}

export type FulfillResult =
  | { ok: true; already?: boolean }
  | { ok: false; reason: "not_found" | "generate_error" | "store_error" };

/**
 * Generate the report for a paid order and store the rendered HTML against its
 * token. Idempotent: a repeated webhook for an already-fulfilled order is a
 * no-op success. Never throws — the webhook must always return 200 to Lemon
 * Squeezy so it doesn't retry-storm.
 */
export async function fulfillReportOrder(
  token: string,
  meta: FulfillMeta = {},
): Promise<FulfillResult> {
  const store = getReportStore();
  const order = await store.get(token);
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "fulfilled" && order.html) return { ok: true, already: true };

  const now = meta.now ?? new Date();
  try {
    const report = generateDeepDiveReport(order.input, { now });
    const html = renderReportHtml(report);
    const patch: Partial<ReportOrder> = {
      status: "fulfilled",
      html,
      fulfilledAt: now.toISOString(),
      orderRef: meta.orderRef,
      testMode: meta.testMode,
    };
    const saved = await store.update(token, patch);
    return saved ? { ok: true } : { ok: false, reason: "store_error" };
  } catch {
    await store.update(token, { status: "failed", error: "generation failed" });
    return { ok: false, reason: "generate_error" };
  }
}
