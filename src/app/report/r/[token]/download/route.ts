import { NextResponse, type NextRequest } from "next/server";
import { getReportStore, isValidToken } from "@/lib/deepdive/store";

// ─── Deep-Dive Report — raw artifact ─────────────────────────────────────────
//
// Serves the stored, self-contained report HTML for a fulfilled order. Opening
// it in a new tab gives the buyer a clean, printable page (Ctrl/Cmd-P → Save as
// PDF); the same URL with a Content-Disposition prompt downloads the .html.

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!isValidToken(token)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const order = await getReportStore().get(token);
  if (!order || order.status !== "fulfilled" || !order.html) {
    return new NextResponse("Report not ready", { status: 404 });
  }

  return new NextResponse(order.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "private, no-store",
    },
  });
}
