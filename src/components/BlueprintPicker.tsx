"use client";

import { useMemo, useState } from "react";
import { Cpu, MonitorCog, MemoryStick, Gauge, Gamepad2 } from "lucide-react";
import { cpuDatabase, gpuDatabase, tierIndex, type HardwareEntry } from "@/data/hardware-db";
import { gameBenchmarks } from "@/data/game-benchmarks";
import type { Res } from "@/lib/gpu-for-game";
import type { BlueprintPickerInput } from "@/lib/blueprint";

const RAM_OPTIONS = [8, 16, 32, 64];
const RESOLUTION_OPTIONS: Res[] = ["1080p", "1440p", "4K"];

function sortedNames(database: Record<string, HardwareEntry>): string[] {
  return Object.values(database)
    .sort((a, b) => tierIndex(b.tier) - tierIndex(a.tier) || a.name.localeCompare(b.name))
    .map((e) => e.name);
}

interface BlueprintPickerProps {
  onSubmit: (input: BlueprintPickerInput) => void;
  defaultValue?: BlueprintPickerInput | null;
}

export function BlueprintPicker({ onSubmit, defaultValue }: BlueprintPickerProps) {
  const cpuOptions = useMemo(() => sortedNames(cpuDatabase), []);
  const gpuOptions = useMemo(() => sortedNames(gpuDatabase), []);
  const gameOptions = useMemo(
    () => [...gameBenchmarks].sort((a, b) => a.title.localeCompare(b.title)),
    [],
  );

  const [cpuName, setCpuName] = useState(defaultValue?.cpuName ?? cpuOptions[0]);
  const [gpuName, setGpuName] = useState(defaultValue?.gpuName ?? gpuOptions[0]);
  const [ramGb, setRamGb] = useState(defaultValue?.ramGb ?? 16);
  const [resolution, setResolution] = useState<Res>(defaultValue?.resolution ?? "1080p");
  const [gameIds, setGameIds] = useState<string[]>(
    defaultValue?.gameIds ?? [gameOptions[0]?.id, gameOptions[1]?.id, gameOptions[2]?.id].filter(Boolean) as string[],
  );

  function setGameAt(index: number, id: string) {
    setGameIds((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      cpuName,
      gpuName,
      ramGb,
      resolution,
      gameIds: gameIds.filter(Boolean),
    });
  }

  const selectClass =
    "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-cyan/60";
  const labelClass = "flex items-center gap-1.5 text-xs text-text-secondary mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <Cpu size={12} className="text-cyan" /> Your CPU
          </label>
          <select value={cpuName} onChange={(e) => setCpuName(e.target.value)} className={selectClass}>
            {cpuOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <MonitorCog size={12} className="text-cyan" /> Your GPU
          </label>
          <select value={gpuName} onChange={(e) => setGpuName(e.target.value)} className={selectClass}>
            {gpuOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <MemoryStick size={12} className="text-cyan" /> RAM
          </label>
          <select
            value={ramGb}
            onChange={(e) => setRamGb(Number(e.target.value))}
            className={selectClass}
          >
            {RAM_OPTIONS.map((gb) => (
              <option key={gb} value={gb}>
                {gb} GB
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <Gauge size={12} className="text-cyan" /> Target resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Res)}
            className={selectClass}
          >
            {RESOLUTION_OPTIONS.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <Gamepad2 size={12} className="text-cyan" /> 3 games you actually play
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <select
              key={i}
              value={gameIds[i] ?? ""}
              onChange={(e) => setGameAt(i, e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>
                Pick a game
              </option>
              {gameOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
      >
        Build My Blueprint
      </button>
    </form>
  );
}
