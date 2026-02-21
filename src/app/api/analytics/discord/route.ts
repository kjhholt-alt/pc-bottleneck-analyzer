import { type NextRequest, NextResponse } from "next/server";
import { queryEvents, getTotalPageviews } from "@/lib/supabase";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

const MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

/**
 * Daily analytics digest → Discord webhook.
 * Called by Vercel Cron at midnight UTC.
 */
export async function GET(req: NextRequest) {
  // Auth: Vercel cron sends this header, or we check query param for manual triggers
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ error: "DISCORD_WEBHOOK_URL not configured" }, { status: 500 });
  }

  // Query yesterday's events (or today's if triggered manually during the day)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const sinceDate = yesterday.toISOString().slice(0, 10) + "T00:00:00Z";
  const untilDate = now.toISOString().slice(0, 10) + "T00:00:00Z";

  const events = await queryEvents(sinceDate, untilDate);

  // Aggregate stats
  const pageviews = events.filter((e) => e.event_type === "pageview");
  const affiliateClicks = events.filter((e) => e.event_type === "affiliate_click");

  const uniqueIPs = new Set(pageviews.map((e) => e.ip_hash).filter(Boolean));

  // Top countries
  const countryCounts = new Map<string, number>();
  for (const e of pageviews) {
    if (e.country) countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);
  }
  const topCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => `${code} (${count})`)
    .join(", ");

  // Top pages
  const pageCounts = new Map<string, number>();
  for (const e of pageviews) {
    pageCounts.set(e.page, (pageCounts.get(e.page) ?? 0) + 1);
  }
  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([page, count]) => `${page} (${count})`)
    .join(", ");

  // Affiliate click breakdown
  const vendorCounts = new Map<string, number>();
  for (const e of affiliateClicks) {
    if (e.vendor) vendorCounts.set(e.vendor, (vendorCounts.get(e.vendor) ?? 0) + 1);
  }
  const affiliateBreakdown = [...vendorCounts.entries()]
    .map(([vendor, count]) => `${vendor.charAt(0).toUpperCase() + vendor.slice(1)} (${count})`)
    .join(", ");

  // Top clicked hardware
  const hwCounts = new Map<string, number>();
  for (const e of affiliateClicks) {
    if (e.hardware) hwCounts.set(e.hardware, (hwCounts.get(e.hardware) ?? 0) + 1);
  }
  const topHardware = [...hwCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hw, count]) => `${hw} (${count})`)
    .join(", ");

  // Top referrers
  const refCounts = new Map<string, number>();
  for (const e of pageviews) {
    if (e.referrer) {
      try {
        const host = new URL(e.referrer).hostname;
        refCounts.set(host, (refCounts.get(host) ?? 0) + 1);
      } catch { /* skip bad URLs */ }
    }
  }
  const topReferrers = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([host, count]) => `${host} (${count})`)
    .join(", ");

  // Milestone check
  const totalAllTime = await getTotalPageviews();
  const previousTotal = totalAllTime - pageviews.length;
  const milestone = MILESTONES.find((m) => previousTotal < m && totalAllTime >= m);

  const dateStr = yesterday.toISOString().slice(0, 10);

  // Build Discord embed fields
  const fields = [
    { name: "Visitors", value: `${pageviews.length} total, ${uniqueIPs.size} unique`, inline: true },
    { name: "Affiliate Clicks", value: affiliateBreakdown || "None", inline: true },
    { name: "Top Pages", value: topPages || "None", inline: false },
    { name: "Countries", value: topCountries || "None", inline: false },
  ];

  if (topReferrers) {
    fields.push({ name: "Top Referrers", value: topReferrers, inline: false });
  }
  if (topHardware) {
    fields.push({ name: "Top Clicked Hardware", value: topHardware, inline: false });
  }

  const embed: Record<string, unknown> = {
    title: `PC Bottleneck Analyzer — ${dateStr}`,
    color: 0x22d3ee, // cyan
    fields,
    footer: { text: `All-time: ${totalAllTime.toLocaleString()} pageviews` },
    timestamp: now.toISOString(),
  };

  if (milestone) {
    embed.description = `**Milestone reached: ${milestone.toLocaleString()} total visitors!**`;
  }

  // Send to Discord
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "PC Bottleneck Analyzer",
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Discord returned ${res.status}` },
        { status: 502 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Discord webhook failed: ${err}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    date: dateStr,
    visitors: pageviews.length,
    unique: uniqueIPs.size,
    affiliate_clicks: affiliateClicks.length,
    milestone: milestone ?? null,
  });
}
