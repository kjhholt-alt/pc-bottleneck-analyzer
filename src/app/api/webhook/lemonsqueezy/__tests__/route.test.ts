import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const insertEvent = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/supabase", () => ({
  insertEvent: (...args: unknown[]) => insertEvent(...args),
}));

import { POST } from "../route";

const SECRET = "test-webhook-secret";

function signedRequest(body: string, secret = SECRET): NextRequest {
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  return new NextRequest("http://localhost/api/webhook/lemonsqueezy", {
    method: "POST",
    body,
    headers: { "x-signature": signature },
  });
}

function orderPayload(testMode: boolean): string {
  return JSON.stringify({
    meta: { event_name: "order_created" },
    data: {
      id: "111",
      attributes: {
        order_number: 42,
        total_formatted: "$9.99",
        test_mode: testMode,
        user_email: "buyer@example.com",
        first_order_item: { product_name: "PCopti Tool" },
      },
    },
  });
}

beforeEach(() => {
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  insertEvent.mockClear();
});

describe("POST /api/webhook/lemonsqueezy", () => {
  it("records a signed order_created as a purchase analytics event", async () => {
    const res = await POST(signedRequest(orderPayload(false)));
    expect(res.status).toBe(200);

    expect(insertEvent).toHaveBeenCalledTimes(1);
    const event = insertEvent.mock.calls[0][0];
    expect(event.event_type).toBe("purchase");
    expect(event.vendor).toBe("lemonsqueezy");
    expect(event.hardware).toBe("PCopti Tool");
    expect(event.referrer).toContain("order:42");
    expect(event.referrer).toContain("$9.99");
    // No PII may reach analytics
    expect(JSON.stringify(event)).not.toContain("buyer@example.com");
  });

  it("tags test-mode orders as purchase_test", async () => {
    const res = await POST(signedRequest(orderPayload(true)));
    expect(res.status).toBe(200);
    expect(insertEvent.mock.calls[0][0].event_type).toBe("purchase_test");
  });

  it("rejects a bad signature without recording anything", async () => {
    const res = await POST(signedRequest(orderPayload(false), "wrong-secret"));
    expect(res.status).toBe(401);
    expect(insertEvent).not.toHaveBeenCalled();
  });

  it("rejects everything when the webhook secret is not configured", async () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const res = await POST(signedRequest(orderPayload(false)));
    expect(res.status).toBe(503);
    expect(insertEvent).not.toHaveBeenCalled();
  });

  it("ignores non-order events", async () => {
    const body = JSON.stringify({
      meta: { event_name: "subscription_created" },
      data: { id: "1", attributes: {} },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    expect(insertEvent).not.toHaveBeenCalled();
  });
});
