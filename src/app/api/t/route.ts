import { type NextRequest, NextResponse } from "next/server";
import { insertEvent } from "@/lib/supabase";

/**
 * Lightweight tracking endpoint.
 * POST { page, type, referrer?, vendor?, hardware? }
 *
 * Reads country from Vercel's x-vercel-ip-country header (injected automatically).
 * Hashes IP with daily salt for unique visitor counting without storing raw IPs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page = body.page;
    const eventType = body.type;

    // Require at minimum a page and event type
    if (!page || !eventType) {
      return new NextResponse(null, { status: 400 });
    }

    // Country from Vercel edge header (free, automatic)
    const country = req.headers.get("x-vercel-ip-country") ?? undefined;

    // Hash IP + daily salt for unique visitor counting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const daySalt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const ipHash = await hashString(`${ip}:${daySalt}`);

    await insertEvent({
      page: String(page).slice(0, 200),
      event_type: String(eventType).slice(0, 30),
      country: country?.slice(0, 5),
      referrer: body.referrer ? String(body.referrer).slice(0, 500) : undefined,
      vendor: body.vendor ? String(body.vendor).slice(0, 20) : undefined,
      hardware: body.hardware ? String(body.hardware).slice(0, 100) : undefined,
      ip_hash: ipHash,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 }); // Fail silently — tracking should never break UX
  }
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
