#!/usr/bin/env node
/**
 * apply-report-orders-migration.mjs -- self-serve fallback to provision the
 * Deep-Dive Report's `report_orders` table when the Supabase MCP isn't
 * authenticated for the session.
 *
 * Preferred path (no manual SQL, no dashboard click-through): once a Claude
 * Code session has the Supabase MCP authenticated, ask it to run
 * `apply_migration` against supabase/migrations/0001_report_orders.sql
 * directly -- that IS the self-serve path, this script is the fallback.
 *
 * This script needs no new npm dependency (native fetch, node stdlib only)
 * and talks to the Supabase Management API's SQL runner:
 *   POST https://api.supabase.com/v1/projects/{ref}/database/query
 * That endpoint executes arbitrary SQL against the project's Postgres
 * database, authenticated by a personal access token (NOT the anon/service
 * key already used elsewhere in this repo -- those can't run DDL over
 * PostgREST).
 *
 * Setup (one-time, Kruz):
 *   1. https://supabase.com/dashboard/account/tokens -> Generate new token
 *      -> copy it. Set it as SUPABASE_ACCESS_TOKEN (shell env or .env.local
 *      -- .env.local is gitignored, never committed).
 *   2. Project ref: Supabase dashboard -> Project Settings -> General ->
 *      "Reference ID". Set SUPABASE_PROJECT_REF, OR just leave it unset --
 *      this script derives it from SUPABASE_URL (https://<ref>.supabase.co)
 *      if that's already set, which it is for this project's analytics.
 *
 * Usage:
 *   node scripts/apply-report-orders-migration.mjs --dry-run   # print only, no network call
 *   node scripts/apply-report-orders-migration.mjs             # actually apply
 *
 * The migration is idempotent (create-if-not-exists throughout), so running
 * this more than once is safe and will not error or duplicate anything.
 *
 * This script has NOT been run against a live Supabase project in this
 * repo (no credentials available in the authoring session) -- read the SQL
 * with --dry-run and confirm the resolved project ref before the real run.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { argv, exit, env, stdout, stderr } from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_FILE = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "0001_report_orders.sql",
);

function deriveProjectRef() {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const url = env.SUPABASE_URL ?? "";
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match ? match[1] : null;
}

async function main() {
  const dryRun = argv.includes("--dry-run");

  let sql;
  try {
    sql = await fs.readFile(MIGRATION_FILE, "utf8");
  } catch (err) {
    stderr.write(`[apply-migration] could not read ${MIGRATION_FILE}: ${err}\n`);
    exit(1);
    return;
  }

  const ref = deriveProjectRef();
  const token = env.SUPABASE_ACCESS_TOKEN ?? "";

  stdout.write(`[apply-migration] file: ${MIGRATION_FILE}\n`);
  stdout.write(`[apply-migration] project ref: ${ref ?? "(not resolved)"}\n`);
  stdout.write(`[apply-migration] access token set: ${token ? "yes" : "no"}\n`);

  if (dryRun) {
    stdout.write("\n--- SQL (dry run -- not executed) ---\n");
    stdout.write(sql);
    stdout.write("\n--- end SQL ---\n");
    exit(0);
    return;
  }

  const missing = [];
  if (!ref) missing.push("SUPABASE_PROJECT_REF (or a SUPABASE_URL to derive it from)");
  if (!token) missing.push("SUPABASE_ACCESS_TOKEN");
  if (missing.length) {
    stderr.write(
      `[apply-migration] missing required env: ${missing.join(", ")}\n` +
        "See the setup steps in this file's header comment, or RUNBOOK-CHECKOUT.md Step 1.\n",
    );
    exit(1);
    return;
  }

  const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: sql }),
    });
  } catch (err) {
    stderr.write(`[apply-migration] request to Supabase Management API failed: ${err}\n`);
    exit(1);
    return;
  }

  const bodyText = await res.text();
  if (!res.ok) {
    stderr.write(`[apply-migration] Supabase returned ${res.status}: ${bodyText}\n`);
    exit(1);
    return;
  }

  stdout.write(`[apply-migration] applied OK (HTTP ${res.status}).\n`);
  stdout.write(
    "[apply-migration] verify in Supabase dashboard -> Table Editor -> " +
      "report_orders should now exist (empty).\n",
  );
  exit(0);
}

main();
