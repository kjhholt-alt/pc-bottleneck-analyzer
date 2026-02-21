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
  | "stopped";

const POLL_INTERVAL = 3000; // 3 seconds
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

export function useMonitor() {
  const [status, setStatus] = useState<MonitorStatus>("idle");
  const [latest, setLatest] = useState<MonitorSnapshot | null>(null);
  const [history, setHistory] = useState<MonitorSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorCount = useRef(0);
  const lastTimestamp = useRef<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/scan");
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
      setLatest(snapshot);
      setHistory((prev) => {
        const next = [...prev, snapshot];
        return next.length > MAX_SNAPSHOTS
          ? next.slice(next.length - MAX_SNAPSHOTS)
          : next;
      });
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
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    errorCount.current = 0;
    lastTimestamp.current = null;
    setStatus("waiting");
    setError(null);
    setHistory([]);
    setLatest(null);

    // Poll immediately, then on interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
  }, [poll]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("idle");
  }, []);

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
    stop,
  };
}
