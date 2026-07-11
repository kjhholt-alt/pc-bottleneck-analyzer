import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getReportStore, isValidToken, __resetReportStore } from "../store";
import type { ReportOrder } from "../types";

const DIR = path.join(os.tmpdir(), "pcopti-report-orders-test");

function order(token: string): ReportOrder {
  return {
    token,
    input: {
      cpuName: "AMD Ryzen 5 5600",
      gpuName: "NVIDIA GeForce RTX 3060",
      ramGb: 16,
      resolution: "1080p",
      gameIds: ["cyberpunk"],
    },
    status: "pending",
    createdAt: "2026-07-01T00:00:00.000Z",
  };
}

beforeAll(() => {
  process.env.DEEPDIVE_STORE = "file";
  process.env.DEEPDIVE_DATA_DIR = DIR;
  __resetReportStore();
});

afterAll(async () => {
  await fs.rm(DIR, { recursive: true, force: true }).catch(() => {});
  delete process.env.DEEPDIVE_STORE;
  delete process.env.DEEPDIVE_DATA_DIR;
  __resetReportStore();
});

describe("isValidToken", () => {
  it("accepts url-safe tokens of the right length and rejects the rest", () => {
    expect(isValidToken("a".repeat(24))).toBe(true);
    expect(isValidToken("has spaces here in it....")).toBe(false);
    expect(isValidToken("short")).toBe(false);
    expect(isValidToken("../etc/passwd")).toBe(false);
  });
});

describe("file report store", () => {
  it("selects the file backend when DEEPDIVE_STORE=file", () => {
    expect(getReportStore().kind).toBe("file");
  });

  it("creates, reads, updates and fulfills an order", async () => {
    const store = getReportStore();
    const token = "tok_" + "A".repeat(20);

    expect(await store.createPending(order(token))).toBe(true);

    const pending = await store.get(token);
    expect(pending?.status).toBe("pending");

    expect(
      await store.update(token, {
        status: "fulfilled",
        html: "<!doctype html><html></html>",
        fulfilledAt: "2026-07-01T00:00:05.000Z",
      }),
    ).toBe(true);

    const done = await store.get(token);
    expect(done?.status).toBe("fulfilled");
    expect(done?.html).toContain("doctype");
  });

  it("returns null for unknown or invalid tokens", async () => {
    const store = getReportStore();
    expect(await store.get("does_not_exist_" + "x".repeat(10))).toBeNull();
    expect(await store.get("bad token")).toBeNull();
    expect(await store.update("bad token", { status: "failed" })).toBe(false);
  });

  it("rejects createPending for an invalid token", async () => {
    expect(await getReportStore().createPending(order("nope"))).toBe(false);
  });
});
