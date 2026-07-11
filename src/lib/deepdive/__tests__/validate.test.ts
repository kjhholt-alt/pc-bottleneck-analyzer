import { describe, expect, it } from "vitest";
import { parseDeepDiveInput } from "../validate";

const GOOD = {
  cpuName: "AMD Ryzen 5 5600",
  gpuName: "NVIDIA GeForce RTX 3060",
  ramGb: 16,
  resolution: "1080p",
  gameIds: ["cyberpunk", "cs2"],
  storageType: "NVMe SSD",
  notes: "stutters in bg3",
};

describe("parseDeepDiveInput", () => {
  it("accepts a valid payload", () => {
    const r = parseDeepDiveInput(GOOD);
    expect(r).not.toBeNull();
    expect(r?.cpuName).toBe("AMD Ryzen 5 5600");
    expect(r?.gameIds).toEqual(["cyberpunk", "cs2"]);
  });

  it("rejects missing CPU or GPU", () => {
    expect(parseDeepDiveInput({ ...GOOD, cpuName: "" })).toBeNull();
    expect(parseDeepDiveInput({ ...GOOD, gpuName: undefined })).toBeNull();
  });

  it("rejects an out-of-range RAM value", () => {
    expect(parseDeepDiveInput({ ...GOOD, ramGb: 2 })).toBeNull();
    expect(parseDeepDiveInput({ ...GOOD, ramGb: 999 })).toBeNull();
  });

  it("rejects an invalid resolution", () => {
    expect(parseDeepDiveInput({ ...GOOD, resolution: "8K" })).toBeNull();
  });

  it("requires at least one recognized game and drops unknown ids", () => {
    expect(parseDeepDiveInput({ ...GOOD, gameIds: ["not-a-game"] })).toBeNull();
    const r = parseDeepDiveInput({ ...GOOD, gameIds: ["cyberpunk", "not-a-game"] });
    expect(r?.gameIds).toEqual(["cyberpunk"]);
  });

  it("caps games at the maximum and de-dupes", () => {
    const many = ["cyberpunk", "cs2", "valorant", "fortnite", "apex", "gta5", "cyberpunk"];
    const r = parseDeepDiveInput({ ...GOOD, gameIds: many });
    expect(r?.gameIds.length).toBe(5);
    expect(new Set(r?.gameIds).size).toBe(5);
  });

  it("truncates overly long notes and drops empty ones", () => {
    const long = "a".repeat(500);
    expect(parseDeepDiveInput({ ...GOOD, notes: long })?.notes?.length).toBe(280);
    expect(parseDeepDiveInput({ ...GOOD, notes: "   " })?.notes).toBeUndefined();
  });

  it("ignores an unknown storage type", () => {
    expect(parseDeepDiveInput({ ...GOOD, storageType: "tape" })?.storageType).toBeUndefined();
  });
});
