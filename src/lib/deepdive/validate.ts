// ─── PC Deep-Dive Report — input validation (isomorphic, pure) ───────────────
//
// Parses/sanitizes untrusted buyer input from the checkout POST into a strict
// DeepDiveInput, or null if it can't be trusted. CPU/GPU names are fuzzy-matched
// downstream (unrecognized names fall back safely in the generator), so we only
// bound their length here; games are validated against the real benchmark DB.

import { gameBenchmarks } from "@/data/game-benchmarks";
import type { Res } from "@/lib/gpu-for-game";
import { DEEPDIVE_MAX_GAMES } from "./access";
import type { DeepDiveInput, StorageKind } from "./types";

const RESOLUTIONS: Res[] = ["1080p", "1440p", "4K"];
const STORAGE: StorageKind[] = ["NVMe SSD", "SATA SSD", "HDD"];

export function parseDeepDiveInput(raw: unknown): DeepDiveInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const cpuName = typeof o.cpuName === "string" ? o.cpuName.trim().slice(0, 80) : "";
  const gpuName = typeof o.gpuName === "string" ? o.gpuName.trim().slice(0, 80) : "";
  if (!cpuName || !gpuName) return null;

  const ramGb = Number(o.ramGb);
  if (!Number.isFinite(ramGb) || ramGb < 4 || ramGb > 256) return null;

  const resolution = RESOLUTIONS.includes(o.resolution as Res) ? (o.resolution as Res) : null;
  if (!resolution) return null;

  const validIds = new Set(gameBenchmarks.map((g) => g.id));
  const gameIds = Array.isArray(o.gameIds)
    ? Array.from(
        new Set(
          o.gameIds.filter(
            (id): id is string => typeof id === "string" && validIds.has(id),
          ),
        ),
      ).slice(0, DEEPDIVE_MAX_GAMES)
    : [];
  if (gameIds.length === 0) return null;

  const storageType = STORAGE.includes(o.storageType as StorageKind)
    ? (o.storageType as StorageKind)
    : undefined;

  const notesRaw = typeof o.notes === "string" ? o.notes.trim().slice(0, 280) : "";
  const notes = notesRaw.length > 0 ? notesRaw : undefined;

  return {
    cpuName,
    gpuName,
    ramGb: Math.round(ramGb),
    resolution,
    gameIds,
    storageType,
    notes,
  };
}
