import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";
import { insertEvent } from "@/lib/supabase";
import { isFulfillmentEnabled, fulfillReportOrder } from "@/lib/deepdive/fulfillment";

// ─── Lemon Squeezy Webhook Handler ──────────────────────────────────────────
// Receives events from Lemon Squeezy (order_created, etc.).
// Verifies the webhook signature, logs the event, and records purchases
// as analytics events so they show up in /stats and the daily Discord
// digest (server-side sales record — no PII stored).
//
// Since Pro status is localStorage-based (no user accounts), the actual
// Pro unlock happens client-side via the checkout overlay's success
// event; buyers restore access with their license key.

function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret || !signature) return false;

  const hmac = createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");

  // Constant-time comparison
  if (digest.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < digest.length; i++) {
    mismatch |= digest.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

  // Without a secret we can't verify anything — and unverified payloads
  // must never become purchase records. Configure the secret first.
  if (!secret) {
    console.error("[LS Webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set — rejecting");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.error("[LS Webhook] Invalid signature — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventName: string = payload?.meta?.event_name ?? "unknown";

    // Log the event for analytics
    console.log(
      `[LS Webhook] ${eventName}`,
      JSON.stringify({
        order_id: payload?.data?.id,
        email: payload?.data?.attributes?.user_email,
        total: payload?.data?.attributes?.total_formatted,
        product: payload?.data?.attributes?.first_order_item?.product_name,
        timestamp: new Date().toISOString(),
      }),
    );

    if (eventName === "order_created") {
      const attrs = payload?.data?.attributes ?? {};
      const orderNumber = attrs.order_number ?? payload?.data?.id ?? "?";
      const total = attrs.total_formatted ?? "?";
      const testMode = attrs.test_mode === true;

      // Recorded in the existing analytics_events table (same class of
      // write the site already does for pageviews) — no email/PII stored.
      await insertEvent({
        page: "/api/webhook/lemonsqueezy",
        event_type: testMode ? "purchase_test" : "purchase",
        vendor: "lemonsqueezy",
        hardware: String(
          attrs.first_order_item?.product_name ?? "PCopti Tool",
        ).slice(0, 100),
        referrer: `order:${orderNumber} total:${total}`,
      });

      // Deep-Dive Report fulfillment: if this order carries a report_token in
      // its checkout custom data and server-side fulfillment is enabled, run the
      // (deterministic) generator and store the rendered artifact against the
      // token so the buyer's private link goes live. Wrapped so a fulfillment
      // hiccup can never turn the webhook into a non-200 (which would make Lemon
      // Squeezy retry-storm) — the buyer's poll and a manual re-fire recover it.
      const reportToken = payload?.meta?.custom_data?.report_token;
      if (typeof reportToken === "string" && reportToken && isFulfillmentEnabled()) {
        try {
          const result = await fulfillReportOrder(reportToken, {
            orderRef: String(orderNumber),
            testMode,
          });
          if (!result.ok) {
            console.error(`[LS Webhook] report fulfillment failed: ${result.reason}`);
          }
        } catch (err) {
          console.error("[LS Webhook] report fulfillment threw", err);
        }
      }
    }

    return NextResponse.json({ ok: true, event: eventName });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse webhook payload" },
      { status: 400 },
    );
  }
}
