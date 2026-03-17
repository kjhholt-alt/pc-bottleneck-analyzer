import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";

// ─── Lemon Squeezy Webhook Handler ──────────────────────────────────────────
// Receives events from Lemon Squeezy (order_created, etc.).
// Verifies the webhook signature, then logs the event.
//
// Since Pro status is localStorage-based (no user accounts), the webhook
// is primarily for analytics/auditing — the actual Pro unlock happens
// client-side via the checkout overlay's success event.

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

function verifySignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;

  const hmac = createHmac("sha256", WEBHOOK_SECRET);
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
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  // Skip verification if no secret is configured (dev mode)
  if (WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
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

    return NextResponse.json({ ok: true, event: eventName });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse webhook payload" },
      { status: 400 },
    );
  }
}
