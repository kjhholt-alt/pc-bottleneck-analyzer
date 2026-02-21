/**
 * Supabase client for server-side analytics tracking.
 * Uses the service role key (server only — never expose to client).
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

interface AnalyticsEvent {
  site?: string;
  page: string;
  event_type: string;
  country?: string;
  referrer?: string;
  vendor?: string;
  hardware?: string;
  ip_hash?: string;
}

/** Insert a tracking event into the analytics_events table. */
export async function insertEvent(event: AnalyticsEvent): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ site: "pcbottleneck", ...event }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Query analytics events for a given date range. */
export async function queryEvents(
  since: string,
  until?: string,
): Promise<AnalyticsEvent[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return [];

  try {
    let url = `${SUPABASE_URL}/rest/v1/analytics_events?site=eq.pcbottleneck&created_at=gte.${since}&order=created_at.desc&limit=10000`;
    if (until) url += `&created_at=lt.${until}`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Get total event count for milestone tracking. */
export async function getTotalPageviews(): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return 0;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_events?site=eq.pcbottleneck&event_type=eq.pageview&select=id`,
      {
        method: "HEAD",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "count=exact",
        },
      },
    );
    const count = res.headers.get("content-range");
    if (!count) return 0;
    // Format: "*/123" or "0-99/123"
    const total = count.split("/")[1];
    return parseInt(total ?? "0", 10);
  } catch {
    return 0;
  }
}
