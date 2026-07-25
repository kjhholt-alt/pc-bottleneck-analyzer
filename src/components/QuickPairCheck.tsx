"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Cpu, MonitorCog, ArrowRight } from "lucide-react";
import { cpuDatabase, gpuDatabase, tierIndex, type HardwareEntry } from "@/data/hardware-db";
import { generateBlueprint } from "@/lib/blueprint";
import { gameBenchmarks } from "@/data/game-benchmarks";

/**
 * The front-door answer.
 *
 * Every visitor previously hit the same wall: download an unsigned .exe and run
 * it as administrator, before learning anything at all. On a phone -- where most
 * of this site's audience arrives -- that is not a high bar, it is a dead end,
 * because you cannot run a Windows executable on a phone.
 *
 * This delivers a real answer from two dropdowns, then offers the scanner as the
 * way to get the *measured* version. Value first, download second.
 *
 * It reuses generateBlueprint() rather than reimplementing the maths, so this
 * widget and /blueprint can never disagree.
 *
 * HONESTY BOUNDARY, and it is the whole reason this component is careful:
 * a dropdown knows your PARTS, not your PC. The real analyzer reads live
 * telemetry (per-core utilisation, GPU utilisation, thermals) that no dropdown
 * can supply. So this reports how well two components are MATCHED -- which is
 * genuinely answerable from static data -- and never claims to have measured a
 * live bottleneck. Saying otherwise would be inventing a number, which is the
 * one thing this codebase must not do.
 */

const DEFAULT_RAM_GB = 16;
const DEFAULT_RES = "1080p" as const;

function sortedNames(db: Record<string, HardwareEntry>): string[] {
  return Object.values(db)
    .sort((a, b) => tierIndex(b.tier) - tierIndex(a.tier) || a.name.localeCompare(b.name))
    .map((e) => e.name);
}

export function QuickPairCheck() {
  const cpuOptions = useMemo(() => sortedNames(cpuDatabase), []);
  const gpuOptions = useMemo(() => sortedNames(gpuDatabase), []);
  const defaultGames = useMemo(
    () => gameBenchmarks.slice(0, 3).map((g) => g.id),
    [],
  );

  const [cpuName, setCpuName] = useState("");
  const [gpuName, setGpuName] = useState("");

  const result = useMemo(() => {
    if (!cpuName || !gpuName) return null;
    try {
      return generateBlueprint({
        cpuName,
        gpuName,
        ramGb: DEFAULT_RAM_GB,
        resolution: DEFAULT_RES,
        gameIds: defaultGames,
      });
    } catch {
      // A part the DB cannot resolve should degrade to "pick again", never to
      // a confident wrong answer.
      return null;
    }
  }, [cpuName, gpuName, defaultGames]);

  const limiter = result?.verdict.bottleneckCategory;
  const score = result?.verdict.score;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-100">
        Check your pairing in five seconds
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Pick your two main parts. No download, no account.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <Cpu size={13} aria-hidden /> Processor
          </span>
          <select
            value={cpuName}
            onChange={(e) => setCpuName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100
                       focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">Select a CPU…</option>
            {cpuOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <MonitorCog size={13} aria-hidden /> Graphics card
          </span>
          <select
            value={gpuName}
            onChange={(e) => setGpuName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100
                       focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">Select a GPU…</option>
            {gpuOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite">
        {result && score && (
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-zinc-100">{score.total}</span>
              <span className="text-sm text-zinc-500">/ 100</span>
              <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs font-semibold text-zinc-200">
                {score.grade}
              </span>
              <span className="ml-auto rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                {limiter === "cpu" ? "CPU is the limiter" : "GPU is the limiter"}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-zinc-500">
              <span>CPU {score.breakdown.cpu}</span>
              <span>GPU {score.breakdown.gpu}</span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Between these two, your <strong>{limiter === "cpu" ? "processor" : "graphics card"}</strong>{" "}
              holds the pair back. Upgrading the other one first would buy you
              less than you would expect.
            </p>

            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              This compares the two parts against each other. It cannot see how
              your actual machine behaves — real bottlenecks depend on live
              utilisation, thermals and settings, which only a scan can measure.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/blueprint"
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
              >
                Full upgrade plan <ArrowRight size={14} aria-hidden />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
              >
                Measure my actual PC
              </Link>
            </div>
          </div>
        )}

        {cpuName && gpuName && !result && (
          <p className="mt-5 border-t border-zinc-800 pt-5 text-sm text-zinc-400">
            We don&apos;t have data for that combination yet. Try a different pair.
          </p>
        )}
      </div>
    </div>
  );
}
