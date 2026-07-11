import { NextResponse, type NextRequest } from "next/server";
import { isDeepDiveEnabled, deliveryPath } from "@/lib/deepdive/access";
import { parseDeepDiveInput } from "@/lib/deepdive/validate";
import { generateToken, buildCheckoutUrl } from "@/lib/deepdive/fulfillment";
import { getReportStore } from "@/lib/deepdive/store";
import type { ReportOrder } from "@/lib/deepdive/types";

// ─── Deep-Dive Report — start a purchase ─────────────────────────────────────
//
// The buyer submits their specs. We do NOT generate a report here — generation
// is server-side and happens only after payment (the Lemon Squeezy webhook).
// This endpoint just records a PENDING order keyed to an unguessable token and
// hands back the hosted checkout URL (with the token attached as custom data)
// plus the private delivery path the buyer will poll once paid.

export async function POST(req: NextRequest) {
  if (!isDeepDiveEnabled()) {
    return NextResponse.json({ error: "Not available yet." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = parseDeepDiveInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Fill in your CPU, GPU, RAM, target resolution, and at least one game." },
      { status: 400 },
    );
  }

  const token = generateToken();
  const order: ReportOrder = {
    token,
    input,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const created = await getReportStore().createPending(order);
  if (!created) {
    return NextResponse.json(
      { error: "Could not start your order. Please try again in a moment." },
      { status: 503 },
    );
  }

  const base = process.env.NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL || "";
  const checkoutUrl = buildCheckoutUrl(base, token);

  return NextResponse.json({
    token,
    deliveryPath: deliveryPath(token),
    checkoutUrl: checkoutUrl || null,
  });
}
