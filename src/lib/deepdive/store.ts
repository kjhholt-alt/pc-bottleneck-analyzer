// ─── PC Deep-Dive Report — order store (server-only) ─────────────────────────
//
// Pending/fulfilled report orders need durable server storage because the
// fulfillment flow spans three separate requests on (potentially) three
// different serverless instances:
//   1. checkout  — buyer submits specs → we createPending(token, input)
//   2. webhook   — Lemon Squeezy order_created → we generate + update(fulfilled)
//   3. delivery  — buyer opens /report/r/[token] → we get(token) and serve html
//
// Two backends:
//   • Supabase (prod)  — a `report_orders` table, same REST client style as
//     src/lib/supabase.ts. This is the ONLY backend that survives across
//     serverless instances, so it's required before go-live (migration SQL in
//     specs/DEEPDIVE_GOLIVE.md). Fails closed (returns null/false) if unset.
//   • File (dev/test)  — JSON files under a temp dir. Single-process only, so
//     it's for local dev + the vitest E2E, never prod.
//
// Selection: Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY are set AND
// DEEPDIVE_STORE !== "file"; otherwise the file backend.

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { ReportOrder } from "./types";

export interface ReportStore {
  createPending(order: ReportOrder): Promise<boolean>;
  get(token: string): Promise<ReportOrder | null>;
  update(token: string, patch: Partial<ReportOrder>): Promise<boolean>;
  /** Backend name, for diagnostics. */
  readonly kind: "supabase" | "file";
}

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

/** Tokens are the delivery credential and become filenames — validate strictly. */
export function isValidToken(token: string): boolean {
  return TOKEN_RE.test(token);
}

// ─── File backend (dev/test) ─────────────────────────────────────────────────

function dataDir(): string {
  return process.env.DEEPDIVE_DATA_DIR || path.join(os.tmpdir(), "pcopti-report-orders");
}

class FileReportStore implements ReportStore {
  readonly kind = "file" as const;

  private file(token: string): string {
    return path.join(dataDir(), `${token}.json`);
  }

  async createPending(order: ReportOrder): Promise<boolean> {
    if (!isValidToken(order.token)) return false;
    try {
      await fs.mkdir(dataDir(), { recursive: true });
      await fs.writeFile(this.file(order.token), JSON.stringify(order), "utf8");
      return true;
    } catch {
      return false;
    }
  }

  async get(token: string): Promise<ReportOrder | null> {
    if (!isValidToken(token)) return null;
    try {
      const raw = await fs.readFile(this.file(token), "utf8");
      return JSON.parse(raw) as ReportOrder;
    } catch {
      return null;
    }
  }

  async update(token: string, patch: Partial<ReportOrder>): Promise<boolean> {
    const existing = await this.get(token);
    if (!existing) return false;
    try {
      const merged = { ...existing, ...patch };
      await fs.writeFile(this.file(token), JSON.stringify(merged), "utf8");
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Supabase backend (prod) ─────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TABLE = "report_orders";

class SupabaseReportStore implements ReportStore {
  readonly kind = "supabase" as const;

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...extra,
    };
  }

  // The full ReportOrder lives in a single `data` jsonb column (with a `token`
  // column for lookup), so partial updates are a read-modify-write of `data` —
  // avoids per-field snake_case column mapping and jsonb deep-merge over REST.
  async createPending(order: ReportOrder): Promise<boolean> {
    if (!isValidToken(order.token)) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
        method: "POST",
        headers: this.headers({ Prefer: "return=minimal" }),
        body: JSON.stringify({ site: "pcbottleneck", token: order.token, data: order }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async get(token: string): Promise<ReportOrder | null> {
    if (!isValidToken(token)) return null;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?token=eq.${encodeURIComponent(token)}&select=data&limit=1`,
        { headers: this.headers() },
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as { data: ReportOrder }[];
      return rows[0]?.data ?? null;
    } catch {
      return null;
    }
  }

  async update(token: string, patch: Partial<ReportOrder>): Promise<boolean> {
    if (!isValidToken(token)) return false;
    const existing = await this.get(token);
    if (!existing) return false;
    try {
      const merged = { ...existing, ...patch };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?token=eq.${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: this.headers({ Prefer: "return=minimal" }),
          body: JSON.stringify({ data: merged }),
        },
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

// ─── Selection ───────────────────────────────────────────────────────────────

let cached: ReportStore | null = null;

export function getReportStore(): ReportStore {
  const forceFile = process.env.DEEPDIVE_STORE === "file";
  const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY) && !forceFile;
  const wantKind = supabaseReady ? "supabase" : "file";
  if (cached && cached.kind === wantKind) return cached;
  cached = supabaseReady ? new SupabaseReportStore() : new FileReportStore();
  return cached;
}

/** Test hook — drop the cached singleton so env changes take effect. */
export function __resetReportStore(): void {
  cached = null;
}
