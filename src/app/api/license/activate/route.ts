import { NextResponse, type NextRequest } from "next/server";
import {
  activateOrValidateLicense,
  LS_PRODUCT_ID,
  LS_BLUEPRINT_PRODUCT_ID,
} from "@/lib/license";

/**
 * POST /api/license/activate
 * Body: { licenseKey: string, product?: "pro" | "blueprint" }
 *
 * Validates a Lemon Squeezy license key server-side (store + product
 * checked) so a buyer can restore access on any device from the key in
 * their receipt email. `product` defaults to "pro" for backward
 * compatibility with the existing Pro restore flow.
 */
export async function POST(req: NextRequest) {
  let body: { licenseKey?: unknown; product?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key =
    typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";

  if (!key || key.length > 64) {
    return NextResponse.json(
      { error: "Enter the license key from your receipt email." },
      { status: 400 },
    );
  }

  const productId =
    body.product === "blueprint" ? LS_BLUEPRINT_PRODUCT_ID : LS_PRODUCT_ID;

  const result = await activateOrValidateLicense(key, productId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, instanceId: result.instanceId });
}
