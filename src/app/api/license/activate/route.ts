import { NextResponse, type NextRequest } from "next/server";
import { activateOrValidateLicense } from "@/lib/license";

/**
 * POST /api/license/activate
 * Body: { licenseKey: string }
 *
 * Validates a Lemon Squeezy license key server-side (store + product
 * checked) so a buyer can restore Pro on any device from the key in
 * their receipt email.
 */
export async function POST(req: NextRequest) {
  let body: { licenseKey?: unknown };
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

  const result = await activateOrValidateLicense(key);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, instanceId: result.instanceId });
}
