#!/usr/bin/env node
/**
 * run-type-check.mjs -- run `tsc --noEmit` and emit status.
 *
 * Faster than `next build` for status-affirming the codebase.
 * Fail-closed-safe: emitter never blocks the type-check exit code.
 */
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { argv, exit, platform } from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const isWin = platform === "win32";
const npxCmd = isWin ? "npx.cmd" : "npx";

const t0 = Date.now();
const res = spawnSync(npxCmd, ["tsc", "--noEmit", ...argv.slice(2)], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: false,
});
const duration = Math.round((Date.now() - t0) / 1000);
const exitCode = res.status ?? (res.error ? 1 : 0);

const health = exitCode === 0 ? "green" : "red";
const summary = exitCode === 0
  ? `tsc --noEmit ok (${duration}s)`
  : `tsc --noEmit failed exit=${exitCode} duration=${duration}s`;

const emit = path.join(__dirname, "emit-status.mjs");
spawnSync(process.execPath, [
  emit,
  "--health", health,
  "--summary", summary,
  "--duration-sec", String(duration),
  "--exit-code", String(exitCode),
], { stdio: "inherit" });

exit(exitCode);
