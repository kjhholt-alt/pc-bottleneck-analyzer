import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { createHmac } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Analytics writes are mocked — we assert the receipt event shape without a DB.
const insertEvent = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/supabase", () => ({
  insertEvent: (...args: unknown[]) => insertEvent(...args),
}));

import { POST as checkoutPOST } from "../checkout/route";
import { GET as statusGET } from "../status/route";
import { POST as webhookPOST } from "../../webhook/lemonsqueezy/route";
import { getReportStore, __resetReportStore } from "@/lib/deepdive/store";

const SECRET = "test-webhook-secret";
const CHECKOUT_BASE = "https://pcopti.lemonsqueezy.com/checkout/buy/deep-dive-test-123";
const DIR = path.join(os.tmpdir(), "pcopti-report-orders-e2e");

const BUYER = {
  cpuName: "AMD Ryzen 5 5600",
  gpuName: "NVIDIA GeForce RTX 3060",
  ramGb: 16,
  resolution: "1080p",
  storageType: "NVMe SSD",
  gameIds: ["cyberpunk", "cs2"],
  notes: "want a steady 144 in cs2",
};

function checkoutReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/report/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function orderPayload(token: string, testMode = true): string {
  return JSON.stringify({
    meta: { event_name: "order_created", custom_data: { report_token: token } },
    data: {
      id: "111",
      attributes: {
        order_number: 4242,
        total_formatted: "$29.00",
        test_mode: testMode,
        user_email: "buyer@example.com",
        first_order_item: { product_name: "PC Deep-Dive Report" },
      },
    },
  });
}

function signedWebhook(body: string, secret = SECRET): NextRequest {
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  return new NextRequest("http://localhost/api/webhook/lemonsqueezy", {
    method: "POST",
    body,
    headers: { "x-signature": signature },
  });
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED = "true";
  process.env.DEEPDIVE_STORE = "file";
  process.env.DEEPDIVE_DATA_DIR = DIR;
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = SECRET;
  process.env.DEEPDIVE_FULFILLMENT_ENABLED = "true";
  process.env.NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL = CHECKOUT_BASE;
  __resetReportStore();
});

afterAll(async () => {
  await fs.rm(DIR, { recursive: true, force: true }).catch(() => {});
  delete process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED;
  delete process.env.DEEPDIVE_STORE;
  delete process.env.DEEPDIVE_DATA_DIR;
  delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  delete process.env.DEEPDIVE_FULFILLMENT_ENABLED;
  delete process.env.NEXT_PUBLIC_LS_DEEPDIVE_CHECKOUT_URL;
  __resetReportStore();
});

beforeEach(() => {
  insertEvent.mockClear();
  process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED = "true";
  process.env.DEEPDIVE_FULFILLMENT_ENABLED = "true";
});

describe("Deep-Dive Report — full test-mode E2E", () => {
  it("purchase → generate → deliver → receipt all green", async () => {
    // 1. Checkout stages a PENDING order and returns a tokenized checkout URL.
    const cres = await checkoutPOST(checkoutReq(BUYER));
    expect(cres.status).toBe(200);
    const cdata = await cres.json();
    const token: string = cdata.token;
    expect(typeof token).toBe("string");
    expect(cdata.deliveryPath).toBe(`/report/r/${token}`);
    expect(cdata.checkoutUrl).toContain("pcopti.lemonsqueezy.com");
    expect(cdata.checkoutUrl).toContain("report_token");
    expect(cdata.checkoutUrl).toContain(token); // token is url-safe, passes through unescaped

    const pending = await getReportStore().get(token);
    expect(pending?.status).toBe("pending");
    expect(pending?.html).toBeUndefined();

    // 2. The signed order_created webhook (the receipt) fulfills the order.
    const wres = await webhookPOST(signedWebhook(orderPayload(token, true)));
    expect(wres.status).toBe(200);

    // Receipt recorded as a test purchase — and never leaks the buyer email.
    expect(insertEvent).toHaveBeenCalled();
    const ev = insertEvent.mock.calls.at(-1)?.[0];
    expect(ev.event_type).toBe("purchase_test");
    expect(JSON.stringify(ev)).not.toContain("buyer@example.com");

    // 3. The report was generated server-side and stored against the token.
    const fulfilled = await getReportStore().get(token);
    expect(fulfilled?.status).toBe("fulfilled");
    expect(fulfilled?.testMode).toBe(true);
    expect(fulfilled?.html).toContain("Ryzen 5 5600");
    expect(fulfilled?.html).toContain("RTX 3060");
    expect(fulfilled?.html).toContain("Cyberpunk");
    expect(fulfilled?.html).toContain("<!doctype html>");

    // 4. The delivery status poll reports ready.
    const sres = await statusGET(
      new NextRequest(`http://localhost/api/report/status?token=${token}`),
    );
    expect(sres.status).toBe(200);
    const sdata = await sres.json();
    expect(sdata.status).toBe("fulfilled");
    expect(sdata.ready).toBe(true);
  });

  it("is idempotent — a repeated receipt does not error or regenerate", async () => {
    const cdata = await (await checkoutPOST(checkoutReq(BUYER))).json();
    const token = cdata.token;
    await webhookPOST(signedWebhook(orderPayload(token)));
    const first = await getReportStore().get(token);
    const wres2 = await webhookPOST(signedWebhook(orderPayload(token)));
    expect(wres2.status).toBe(200);
    const second = await getReportStore().get(token);
    expect(second?.status).toBe("fulfilled");
    expect(second?.fulfilledAt).toBe(first?.fulfilledAt);
  });

  it("rejects a forged receipt and never fulfills", async () => {
    const cdata = await (await checkoutPOST(checkoutReq(BUYER))).json();
    const token = cdata.token;
    const wres = await webhookPOST(signedWebhook(orderPayload(token), "wrong-secret"));
    expect(wres.status).toBe(401);
    const order = await getReportStore().get(token);
    expect(order?.status).toBe("pending");
  });

  it("records the sale but does NOT generate when fulfillment is disabled", async () => {
    const cdata = await (await checkoutPOST(checkoutReq(BUYER))).json();
    const token = cdata.token;
    delete process.env.DEEPDIVE_FULFILLMENT_ENABLED;
    const wres = await webhookPOST(signedWebhook(orderPayload(token, true)));
    expect(wres.status).toBe(200);
    expect(insertEvent).toHaveBeenCalled(); // sale still recorded
    const order = await getReportStore().get(token);
    expect(order?.status).toBe("pending"); // but not generated
  });

  it("checkout is dormant (404) when the product flag is off", async () => {
    delete process.env.NEXT_PUBLIC_DEEPDIVE_ENABLED;
    const cres = await checkoutPOST(checkoutReq(BUYER));
    expect(cres.status).toBe(404);
  });

  it("checkout rejects invalid specs (400)", async () => {
    const cres = await checkoutPOST(
      checkoutReq({ cpuName: "x", gpuName: "", ramGb: 16, resolution: "1080p", gameIds: ["cyberpunk"] }),
    );
    expect(cres.status).toBe(400);
  });

  it("status is 400 for a malformed token", async () => {
    const sres = await statusGET(new NextRequest("http://localhost/api/report/status?token=bad token"));
    expect(sres.status).toBe(400);
  });
});
