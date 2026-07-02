import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activateOrValidateLicense,
  LS_PRODUCT_ID,
  LS_STORE_ID,
} from "../license";

function mockFetchOnce(json: unknown) {
  return vi.fn().mockResolvedValueOnce({ json: async () => json });
}

const OUR_META = { store_id: LS_STORE_ID, product_id: LS_PRODUCT_ID };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("activateOrValidateLicense", () => {
  it("accepts a fresh activation for our store + product", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({
        activated: true,
        instance: { id: "inst-123" },
        meta: OUR_META,
      }),
    );

    const result = await activateOrValidateLicense("GOOD-KEY");
    expect(result).toEqual({ ok: true, instanceId: "inst-123" });
  });

  it("rejects keys from a different store or product", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({
        activated: true,
        instance: { id: "inst-999" },
        meta: { store_id: 1, product_id: 2 },
      }),
    );

    const result = await activateOrValidateLicense("OTHER-STORE-KEY");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/different product/i);
    }
  });

  it("maps 'not found' to a friendly 404", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({ activated: false, error: "license_key not found." }),
    );

    const result = await activateOrValidateLicense("TYPO-KEY");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
  });

  it("falls back to validate when the activation limit is reached", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          activated: false,
          error: "This license key has reached the activation limit.",
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          valid: true,
          license_key: { status: "active" },
          meta: OUR_META,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateOrValidateLicense("SECOND-DEVICE-KEY");
    expect(result).toEqual({ ok: true, instanceId: null });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/validate");
  });

  it("rejects the validate fallback when the key is disabled", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          activated: false,
          error: "This license key has reached the activation limit.",
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          valid: false,
          license_key: { status: "disabled" },
          meta: OUR_META,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateOrValidateLicense("DISABLED-KEY");
    expect(result.ok).toBe(false);
  });

  it("returns 502 when the license server is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await activateOrValidateLicense("ANY-KEY");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(502);
  });

  it("validates against a different product ID when one is passed (Blueprint vs Pro)", async () => {
    const BLUEPRINT_PRODUCT_ID = 999888;
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({
        activated: true,
        instance: { id: "inst-bp" },
        meta: { store_id: LS_STORE_ID, product_id: BLUEPRINT_PRODUCT_ID },
      }),
    );

    const result = await activateOrValidateLicense("BP-KEY", BLUEPRINT_PRODUCT_ID);
    expect(result).toEqual({ ok: true, instanceId: "inst-bp" });
  });

  it("rejects a Pro key when validating against the Blueprint product ID", async () => {
    const BLUEPRINT_PRODUCT_ID = 999888;
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({
        activated: true,
        instance: { id: "inst-pro" },
        meta: OUR_META, // this key belongs to Pro (LS_PRODUCT_ID), not Blueprint
      }),
    );

    const result = await activateOrValidateLicense("PRO-KEY", BLUEPRINT_PRODUCT_ID);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });
});
