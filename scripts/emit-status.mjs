#!/usr/bin/env node
/**
 * emit-status.mjs -- emit a status-spec/v1 doc for pc-bottleneck-analyzer.
 *
 * The portfolio_health recipe (operator-core) reads
 * ~/.operator/data/status/pc-bottleneck-analyzer.json.
 *
 * Fail-closed-safe:
 *  - All filesystem failures are caught and logged; the script exits 0
 *    so the build/test runner is not poisoned by a status-emit hiccup.
 *  - No external deps -- pure node stdlib.
 *
 * Usage (after build success):
 *   node scripts/emit-status.mjs --health green --summary "build ok"
 *   node scripts/emit-status.mjs --health red --summary "build failed exit=1"
 *
 * Slug must match TRACKED_PROJECTS in operator-core:
 *   {"name": "pc-bottleneck-analyzer", "dir": "portfolio", ...}
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { randomBytes } from "node:crypto";
import { argv, exit, env, stderr } from "node:process";

const PROJECT_SLUG = "pc-bottleneck-analyzer";
const SCHEMA_VERSION = "status-spec/v1";

function utcNow() {
  // status-spec/v1 ISO 8601 UTC with seconds precision.
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

function statusDir() {
  return env.OPERATOR_STATUS_DIR ?? path.join(os.homedir(), ".operator", "data", "status");
}

function parseArgs(args) {
  const opts = { health: "green", summary: null, durationSec: 0, exitCode: 0 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--health") opts.health = args[++i];
    else if (a === "--summary") opts.summary = args[++i];
    else if (a === "--duration-sec") opts.durationSec = parseInt(args[++i], 10) || 0;
    else if (a === "--exit-code") opts.exitCode = parseInt(args[++i], 10) || 0;
  }
  return opts;
}

async function writeAtomic(target, payload) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, payload, { encoding: "utf8" });
  await fs.rename(tmp, target);
}

async function main() {
  const opts = parseArgs(argv.slice(2));
  if (!["green", "yellow", "red"].includes(opts.health)) {
    stderr.write(`[emit-status] invalid --health '${opts.health}'\n`);
    exit(0);
  }

  const ts = utcNow();
  const summary = opts.summary || (
    opts.health === "green" ? `build ok (${opts.durationSec}s)` :
    `build exit=${opts.exitCode} duration=${opts.durationSec}s`
  );
  const doc = {
    schema_version: SCHEMA_VERSION,
    project: PROJECT_SLUG,
    ts,
    health: opts.health,
    summary,
    subsystems: [
      {
        name: "build",
        health: opts.health,
        detail: `exit=${opts.exitCode} duration=${opts.durationSec}s`,
      },
    ],
    counters: {
      build_duration_sec: opts.durationSec,
      build_exit_code: opts.exitCode,
    },
    last_event: {
      ts,
      type: "build.completed",
      summary,
    },
  };

  try {
    const dir = statusDir();
    const target = path.join(dir, `${PROJECT_SLUG}.json`);
    await writeAtomic(target, JSON.stringify(doc, null, 2));
    console.log(`[emit-status] wrote ${target} (${opts.health})`);
  } catch (err) {
    stderr.write(`[emit-status] write failed (non-fatal): ${err}\n`);
  }
  exit(0);
}

main();
