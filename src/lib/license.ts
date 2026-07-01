/**
 * Lemon Squeezy license API helpers (server-side).
 *
 * The `/v1/licenses/*` endpoints are public — no API key required — the
 * license key itself is the credential. We still verify the key belongs
 * to OUR store + product so keys from other Lemon Squeezy stores can't
 * unlock Pro here.
 */

const LS_API = "https://api.lemonsqueezy.com/v1/licenses";

/** PCopti store + product on Lemon Squeezy. */
export const LS_STORE_ID = 298278;
export const LS_PRODUCT_ID = 845012;

/** Name recorded against the activation instance in Lemon Squeezy. */
const INSTANCE_NAME = "pcopti-web";

export type LicenseResult =
  | { ok: true; instanceId: string | null }
  | { ok: false; error: string; status: number };

interface LsLicenseMeta {
  store_id?: number;
  product_id?: number;
}

interface LsActivateResponse {
  activated?: boolean;
  valid?: boolean;
  error?: string | null;
  license_key?: { status?: string };
  instance?: { id?: string };
  meta?: LsLicenseMeta;
}

function belongsToUs(meta: LsLicenseMeta | undefined): boolean {
  return meta?.store_id === LS_STORE_ID && meta?.product_id === LS_PRODUCT_ID;
}

async function callLicenseApi(
  endpoint: "activate" | "validate",
  body: Record<string, string>,
): Promise<LsActivateResponse | null> {
  try {
    const res = await fetch(`${LS_API}/${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return (await res.json()) as LsActivateResponse;
  } catch {
    return null;
  }
}

/**
 * Activate a license key, falling back to plain validation when the key
 * is already activated up to its limit (so buyers can restore Pro on a
 * second device without burning an activation).
 */
export async function activateOrValidateLicense(
  key: string,
): Promise<LicenseResult> {
  const activation = await callLicenseApi("activate", {
    license_key: key,
    instance_name: INSTANCE_NAME,
  });

  if (activation === null) {
    return {
      ok: false,
      error: "Could not reach the license server. Please try again.",
      status: 502,
    };
  }

  if (activation.activated === true) {
    if (!belongsToUs(activation.meta)) {
      return {
        ok: false,
        error: "That license key is for a different product.",
        status: 400,
      };
    }
    return { ok: true, instanceId: activation.instance?.id ?? null };
  }

  const errorText = (activation.error ?? "").toLowerCase();

  // Already activated elsewhere — accept if the key itself is still valid.
  if (errorText.includes("activation limit")) {
    const validation = await callLicenseApi("validate", { license_key: key });
    if (
      validation?.valid === true &&
      validation.license_key?.status === "active" &&
      belongsToUs(validation.meta)
    ) {
      return { ok: true, instanceId: null };
    }
  }

  if (errorText.includes("not found")) {
    return {
      ok: false,
      error:
        "License key not found. Check for typos — it's in your purchase receipt email.",
      status: 404,
    };
  }

  if (errorText.includes("disabled") || errorText.includes("expired")) {
    return {
      ok: false,
      error: "This license key is no longer active.",
      status: 403,
    };
  }

  return {
    ok: false,
    error: activation.error || "License activation failed. Please try again.",
    status: 400,
  };
}
