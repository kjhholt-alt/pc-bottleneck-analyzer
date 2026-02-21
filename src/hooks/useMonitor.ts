"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SystemScan } from "@/lib/types";

export interface MonitorSnapshot {
  timestamp: number;
  cpu: { temp: number | null; usage: number; clock: number };
  gpu: {
    temp: number | null;
    usage: number;
    clock: number;
    vramUsed: number;
    vramTotal: number;
  };
  ram: { usedGb: number; totalGb: number };
}

export type MonitorStatus =
  | "idle"
  | "waiting"
  | "live"
  | "error"
  | "stopped"
  | "demo";

const POLL_INTERVAL = 3000; // 3 seconds
const DEMO_INTERVAL = 2000; // 2 seconds for snappier demo
const MAX_SNAPSHOTS = 60; // ~3 minutes of data
const MAX_ERRORS = 10;

function scanToSnapshot(scan: SystemScan): MonitorSnapshot {
  const avgUsage =
    scan.cpu.usage_per_core.length > 0
      ? scan.cpu.usage_per_core.reduce((s, v) => s + v, 0) /
        scan.cpu.usage_per_core.length
      : 0;

  return {
    timestamp: Date.now(),
    cpu: {
      temp: scan.cpu.current_temp_c,
      usage: Math.round(avgUsage),
      clock: scan.cpu.current_clock_ghz,
    },
    gpu: {
      temp: scan.gpu.current_temp_c,
      usage: scan.gpu.gpu_utilization_pct,
      clock: scan.gpu.gpu_clock_mhz,
      vramUsed: scan.gpu.vram_used_gb,
      vramTotal: scan.gpu.vram_total_gb,
    },
    ram: {
      usedGb: scan.ram.current_used_gb,
      totalGb: scan.ram.total_gb,
    },
  };
}

// ─── Demo data generator ────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function drift(current: number, target: number, speed: number) {
  return current + (target - current) * speed + (Math.random() - 0.5) * 2;
}

/** Simulates a gaming session: idle → load ramp → sustained → cooldown */
function generateDemoSnapshot(cycle: number, prev: MonitorSnapshot | null): MonitorSnapshot {
  // Simulate a ~2 minute gaming load curve
  const phase = cycle % 60; // 60 cycles = 2 min at 2s interval
  let loadTarget: number;
  if (phase < 5) loadTarget = 20 + phase * 8; // ramp up
  else if (phase < 45) loadTarget = 55 + Math.sin(phase * 0.3) * 25; // sustained gaming
  else loadTarget = Math.max(10, 80 - (phase - 45) * 5); // cooldown

  const cpuLoad = clamp(
    prev ? drift(prev.cpu.usage, loadTarget * 0.7, 0.3) : 30,
    5, 100,
  );
  const gpuLoad = clamp(
    prev ? drift(prev.gpu.usage, loadTarget, 0.25) : 20,
    3, 99,
  );

  // Temps follow load with thermal inertia
  const cpuTemp = clamp(
    prev ? drift(prev.cpu.temp ?? 45, 40 + cpuLoad * 0.45, 0.15) : 45,
    32, 95,
  );
  const gpuTemp = clamp(
    prev ? drift(prev.gpu.temp ?? 42, 38 + gpuLoad * 0.48, 0.12) : 42,
    30, 92,
  );

  // VRAM scales with GPU load
  const vramTotal = 12;
  const vramUsed = clamp(
    prev ? drift(prev.gpu.vramUsed, 2 + gpuLoad * 0.08, 0.2) : 3,
    1.5, vramTotal * 0.95,
  );

  // RAM usage drifts slowly
  const ramTotal = 32;
  const ramUsed = clamp(
    prev ? drift(prev.ram.usedGb, 12 + cpuLoad * 0.08, 0.1) : 12,
    8, ramTotal * 0.9,
  );

  // CPU clock boosts under load
  const cpuClock = clamp(
    prev ? drift(prev.cpu.clock, cpuLoad > 50 ? 5.2 : 3.8, 0.2) : 4.0,
    2.5, 5.8,
  );

  return {
    timestamp: Date.now(),
    cpu: {
      temp: Math.round(cpuTemp * 10) / 10,
      usage: Math.round(cpuLoad),
      clock: Math.round(cpuClock * 100) / 100,
    },
    gpu: {
      temp: Math.round(gpuTemp * 10) / 10,
      usage: Math.round(gpuLoad),
      clock: Math.round(1800 + gpuLoad * 8),
      vramUsed: Math.round(vramUsed * 100) / 100,
      vramTotal,
    },
    ram: {
      usedGb: Math.round(ramUsed * 100) / 100,
      totalGb: ramTotal,
    },
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMonitor() {
  const [status, setStatus] = useState<MonitorStatus>("idle");
  const [latest, setLatest] = useState<MonitorSnapshot | null>(null);
  const [history, setHistory] = useState<MonitorSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorCount = useRef(0);
  const lastTimestamp = useRef<string | null>(null);
  const demoCycle = useRef(0);

  const addSnapshot = useCallback((snapshot: MonitorSnapshot) => {
    setLatest(snapshot);
    setHistory((prev) => {
      const next = [...prev, snapshot];
      return next.length > MAX_SNAPSHOTS
        ? next.slice(next.length - MAX_SNAPSHOTS)
        : next;
    });
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/scan");

      if (res.status === 404) {
        // No scan data posted yet — scanner hasn't run yet, not an error.
        // Stay in "waiting" and keep polling.
        return;
      }

      if (!res.ok) {
        errorCount.current++;
        if (errorCount.current >= MAX_ERRORS) {
          setStatus("stopped");
          setError("Scanner stopped responding after 10 attempts.");
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return;
      }

      const data = await res.json();

      // Check if the data has a scan field (new format) or is the scan itself
      const scan: SystemScan = data.scan ?? data;

      // Skip if same timestamp as last poll (no new data)
      const ts = data.timestamp ?? scan.timestamp;
      if (ts && ts === lastTimestamp.current) return;
      lastTimestamp.current = ts ?? null;

      const snapshot = scanToSnapshot(scan);
      addSnapshot(snapshot);
      setStatus("live");
      setError(null);
      errorCount.current = 0;
    } catch {
      errorCount.current++;
      if (errorCount.current >= MAX_ERRORS) {
        setStatus("stopped");
        setError("Connection lost. Is the scanner still running?");
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
  }, [addSnapshot]);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearInterval_();
    errorCount.current = 0;
    lastTimestamp.current = null;
    demoCycle.current = 0;
    setStatus("waiting");
    setError(null);
    setHistory([]);
    setLatest(null);

    // Poll immediately, then on interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
  }, [poll, clearInterval_]);

  const startDemo = useCallback(() => {
    clearInterval_();
    demoCycle.current = 0;
    setStatus("demo");
    setError(null);
    setHistory([]);
    setLatest(null);

    // Generate first snapshot immediately
    const first = generateDemoSnapshot(0, null);
    addSnapshot(first);

    intervalRef.current = setInterval(() => {
      demoCycle.current++;
      setLatest((prev) => {
        const snap = generateDemoSnapshot(demoCycle.current, prev);
        addSnapshot(snap);
        return snap;
      });
    }, DEMO_INTERVAL);
  }, [clearInterval_, addSnapshot]);

  const stop = useCallback(() => {
    clearInterval_();
    setStatus("idle");
  }, [clearInterval_]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    status,
    latest,
    history,
    error,
    snapshotCount: history.length,
    maxSnapshots: MAX_SNAPSHOTS,
    start,
    startDemo,
    stop,
  };
}
