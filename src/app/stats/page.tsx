import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Eye, Users, MousePointerClick, TrendingUp } from "lucide-react";
import { queryEvents, type AnalyticsEvent } from "@/lib/supabase";
import { StatsLogin } from "@/components/StatsLogin";
import { ViewsOverTime, type DailyPoint } from "@/components/StatsCharts";

export const metadata: Metadata = {
  title: "View Tracker",
  robots: { index: false, follow: false },
};

// Auth + live data are per-request — never prerender/cache this page.
export const dynamic = "force-dynamic";

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
  { days: 3650, label: "All" },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return `${d.toISOString().slice(0, 10)}T00:00:00Z`;
}

function countBy(
  events: AnalyticsEvent[],
  key: (e: AnalyticsEvent) => string | undefined
): { label: string; n: number }[] {
  const m = new Map<string, number>();
  for (const e of events) {
    const k = key(e);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);
}

function dailySeries(views: AnalyticsEvent[], days: number): DailyPoint[] {
  const span = Math.min(days, 90); // cap the x-axis so it stays readable
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const e of views) {
    const day = (e.created_at ?? "").slice(0, 10);
    if (!day) continue;
    const slot = byDay.get(day) ?? { views: 0, visitors: new Set<string>() };
    slot.views += 1;
    if (e.ip_hash) slot.visitors.add(e.ip_hash);
    byDay.set(day, slot);
  }
  const out: DailyPoint[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const day = isoDaysAgo(i).slice(0, 10);
    const slot = byDay.get(day);
    out.push({ date: day, views: slot?.views ?? 0, visitors: slot?.visitors.size ?? 0 });
  }
  return out;
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 text-text-secondary text-xs mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Table({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; n: number }[];
  empty: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-text-secondary">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-text-secondary" title={r.label}>
                {r.label}
              </span>
              <span className="font-mono text-foreground shrink-0">{r.n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  // Dedicated STATS_SECRET, else fall back to CRON_SECRET (already in Vercel).
  const secret = process.env.STATS_SECRET || process.env.CRON_SECRET || "";
  const authed = secret && (await cookies()).get("stats_auth")?.value === secret;

  if (!authed) {
    return (
      <StatsLogin
        note={
          secret
            ? "Enter the access key to view site analytics."
            : "Set STATS_SECRET in the environment to enable this dashboard."
        }
      />
    );
  }

  const days = Math.max(1, parseInt((await searchParams).days ?? "30", 10) || 30);
  const events = await queryEvents(isoDaysAgo(days));

  const views = events.filter((e) => e.event_type === "pageview");
  const clicks = events.filter((e) => e.event_type === "affiliate_click");
  const uniques = new Set(views.map((e) => e.ip_hash).filter(Boolean)).size;
  const ctr = views.length ? ((clicks.length / views.length) * 100).toFixed(2) : "0.00";

  const topPages = countBy(views, (e) => e.page).slice(0, 12);
  const topClicks = countBy(clicks, (e) =>
    e.hardware ? `${e.hardware}${e.vendor ? ` (${e.vendor})` : ""}` : undefined
  ).slice(0, 12);
  const topReferrers = countBy(views, (e) => {
    const r = e.referrer;
    if (!r || r.includes("pcbottleneck.buildkit.store")) return undefined;
    try {
      return new URL(r).hostname;
    } catch {
      return r.slice(0, 40);
    }
  }).slice(0, 10);
  const topCountries = countBy(views, (e) => e.country).slice(0, 10);
  const series = dailySeries(views, days);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">View Tracker</h1>
            <p className="text-xs text-text-secondary mt-1">
              Home-brewed analytics · pcbottleneck.buildkit.store ·{" "}
              <Link href="/" className="text-cyan hover:underline">
                back to site
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono">
            {RANGES.map((r) => (
              <Link
                key={r.days}
                href={`/stats?days=${r.days}`}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  r.days === days
                    ? "bg-cyan text-background font-semibold"
                    : "text-text-secondary hover:text-cyan"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Kpi icon={<Eye size={13} />} label="Page views" value={views.length.toLocaleString()} />
          <Kpi icon={<Users size={13} />} label="Unique visitors" value={uniques.toLocaleString()} />
          <Kpi icon={<MousePointerClick size={13} />} label="Affiliate clicks" value={clicks.length.toLocaleString()} />
          <Kpi icon={<TrendingUp size={13} />} label="Click-through" value={`${ctr}%`} />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4">Views over time</h3>
          <ViewsOverTime data={series} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Table title="Top pages" rows={topPages} empty="No views yet in this range." />
          <Table title="Affiliate clicks" rows={topClicks} empty="No affiliate clicks yet." />
          <Table title="Top referrers" rows={topReferrers} empty="No external referrers yet." />
          <Table title="Countries" rows={topCountries} empty="No country data yet." />
        </div>
      </div>
    </main>
  );
}
