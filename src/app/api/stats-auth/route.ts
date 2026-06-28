import { type NextRequest, NextResponse } from "next/server";

/**
 * Gate for the home-brewed /stats dashboard. POST { key } — if it matches
 * STATS_SECRET, set an httpOnly cookie so the dashboard renders. Keeps the
 * secret out of the URL/history.
 */
export async function POST(req: NextRequest) {
  // Prefer a dedicated STATS_SECRET; fall back to CRON_SECRET (already set in
  // Vercel) so the dashboard works without adding a new env var.
  const secret = process.env.STATS_SECRET || process.env.CRON_SECRET || "";
  if (!secret) {
    return NextResponse.json(
      { error: "STATS_SECRET not configured" },
      { status: 500 }
    );
  }

  let key = "";
  try {
    key = (await req.json())?.key ?? "";
  } catch {
    /* ignore */
  }

  if (key !== secret) {
    return NextResponse.json({ error: "Wrong key" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("stats_auth", secret, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
