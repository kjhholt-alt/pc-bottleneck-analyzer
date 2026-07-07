"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, MonitorCog, MemoryStick, Gauge, Gamepad2, HardDrive, Loader2, ArrowRight } from "lucide-react";
import { cpuDatabase, gpuDatabase, tierIndex, type HardwareEntry } from "@/data/hardware-db";
import { gameBenchmarks } from "@/data/game-benchmarks";
import type { Res } from "@/lib/gpu-for-game";
import {
  DEEPDIVE_PRICE,
  DEEPDIVE_MAX_GAMES,
  DEEPDIVE_RECEIPT_KEY,
} from "@/lib/deepdive/access";
import type { StorageKind } from "@/lib/deepdive/types";
import { trackReportPurchaseClick, trackReportView } from "@/lib/track";

const RAM_OPTIONS = [8, 16, 32, 64, 128];
const RESOLUTION_OPTIONS: Res[] = ["1080p", "1440p", "4K"];
const STORAGE_OPTIONS: StorageKind[] = ["NVMe SSD", "SATA SSD", "HDD"];

function sortedNames(database: Record<string, HardwareEntry>): string[] {
  return Object.values(database)
    .sort((a, b) => tierIndex(b.tier) - tierIndex(a.tier) || a.name.localeCompare(b.name))
    .map((e) => e.name);
}

export function DeepDiveIntake() {
  const cpuOptions = useMemo(() => sortedNames(cpuDatabase), []);
  const gpuOptions = useMemo(() => sortedNames(gpuDatabase), []);
  const gameOptions = useMemo(
    () => [...gameBenchmarks].sort((a, b) => a.title.localeCompare(b.title)),
    [],
  );

  const [cpuName, setCpuName] = useState(cpuOptions[0]);
  const [gpuName, setGpuName] = useState(gpuOptions[0]);
  const [ramGb, setRamGb] = useState(16);
  const [resolution, setResolution] = useState<Res>("1080p");
  const [storageType, setStorageType] = useState<StorageKind>("NVMe SSD");
  const [gameIds, setGameIds] = useState<string[]>(() =>
    gameOptions.slice(0, 3).map((g) => g.id),
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<string | null>(null);

  useEffect(() => {
    trackReportView("landing");
  }, []);

  function toggleGame(id: string) {
    setGameIds((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= DEEPDIVE_MAX_GAMES) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (gameIds.length === 0) {
      setError("Pick at least one game you play.");
      return;
    }
    setBusy(true);
    trackReportPurchaseClick("intake");
    try {
      const res = await fetch("/api/report/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpuName,
          gpuName,
          ramGb,
          resolution,
          storageType,
          gameIds,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }

      // Keep the private link so the buyer can re-find their report after paying.
      try {
        localStorage.setItem(
          DEEPDIVE_RECEIPT_KEY,
          JSON.stringify({ token: data.token, deliveryPath: data.deliveryPath, at: Date.now() }),
        );
      } catch {
        // Non-fatal
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // Checkout not configured yet (dormant/test) — surface the delivery link.
      setDelivery(data.deliveryPath);
      setBusy(false);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  const selectClass =
    "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-cyan/60";
  const labelClass = "flex items-center gap-1.5 text-xs text-text-secondary mb-1.5";

  if (delivery) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary mb-3">
          Your order is staged. Checkout isn&apos;t live in this environment, but your private
          report link is ready to preview:
        </p>
        <a href={delivery} className="text-cyan font-mono text-sm hover:underline break-all">
          {delivery}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}><Cpu size={12} className="text-cyan" /> Your CPU</label>
          <select value={cpuName} onChange={(e) => setCpuName(e.target.value)} className={selectClass}>
            {cpuOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}><MonitorCog size={12} className="text-cyan" /> Your GPU</label>
          <select value={gpuName} onChange={(e) => setGpuName(e.target.value)} className={selectClass}>
            {gpuOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}><MemoryStick size={12} className="text-cyan" /> RAM</label>
          <select value={ramGb} onChange={(e) => setRamGb(Number(e.target.value))} className={selectClass}>
            {RAM_OPTIONS.map((gb) => <option key={gb} value={gb}>{gb} GB</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}><Gauge size={12} className="text-cyan" /> Target resolution</label>
          <select value={resolution} onChange={(e) => setResolution(e.target.value as Res)} className={selectClass}>
            {RESOLUTION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}><HardDrive size={12} className="text-cyan" /> Boot drive</label>
          <select value={storageType} onChange={(e) => setStorageType(e.target.value as StorageKind)} className={selectClass}>
            {STORAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <Gamepad2 size={12} className="text-cyan" /> Games you play
          <span className="ml-auto font-mono text-text-secondary/70">{gameIds.length}/{DEEPDIVE_MAX_GAMES}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {gameOptions.map((g) => {
            const on = gameIds.includes(g.id);
            const disabled = !on && gameIds.length >= DEEPDIVE_MAX_GAMES;
            return (
              <button
                type="button"
                key={g.id}
                onClick={() => toggleGame(g.id)}
                disabled={disabled}
                className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                  on
                    ? "bg-cyan/10 border-cyan/50 text-foreground"
                    : disabled
                      ? "bg-background border-border text-text-secondary/40 cursor-not-allowed"
                      : "bg-background border-border text-text-secondary hover:border-cyan/40"
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>What feels slow? (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 280))}
          rows={2}
          placeholder="e.g. stutters in Baldur's Gate 3, want a steady 144fps in CS2"
          className={`${selectClass} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {busy ? (
          <><Loader2 size={14} className="animate-spin" /> Starting your order…</>
        ) : (
          <>Get My Deep-Dive Report — {DEEPDIVE_PRICE} <ArrowRight size={14} /></>
        )}
      </button>
      <p className="text-center text-[11px] text-text-secondary/70">
        One-time purchase. Your report is generated after checkout and delivered to a private link.
      </p>
    </form>
  );
}
