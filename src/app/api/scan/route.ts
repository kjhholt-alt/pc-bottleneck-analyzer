import { NextRequest, NextResponse } from "next/server";
import type { SystemScan } from "@/lib/types";

// In-memory store — will be replaced with persistence later.
// Note: On serverless (Vercel), this is ephemeral per instance. A future
// session will add proper persistence (e.g. KV store or database).
let latestScan: SystemScan | null = null;

// Maximum request body size (2 MB) to prevent abuse
const MAX_BODY_SIZE = 2 * 1024 * 1024;

// ─── POST /api/scan ──────────────────────────────────────────────────────────
// Accepts a system scan JSON payload, validates its shape, stores it, and
// returns the scan_id.

export async function POST(req: NextRequest) {
  try {
    // Guard against oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large. Maximum size is 2 MB." },
        { status: 413 },
      );
    }

    const body = await req.json();

    // Basic shape validation
    const errors = validateScanShape(body);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid scan data",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Sanitize string fields to prevent XSS in case data is rendered elsewhere
    const sanitized = sanitizeObject(body);
    const scan = sanitized as SystemScan;

    // Assign a scan_id if missing
    if (!scan.scan_id) {
      scan.scan_id = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    // Set timestamp if missing
    if (!scan.timestamp) {
      scan.timestamp = new Date().toISOString();
    }

    latestScan = scan;

    return NextResponse.json(
      {
        ok: true,
        scan_id: scan.scan_id,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request body. Expected valid JSON." },
      { status: 400 },
    );
  }
}

// ─── GET /api/scan ───────────────────────────────────────────────────────────
// Returns the latest stored scan, or 404 if none exists.

export async function GET() {
  if (!latestScan) {
    return NextResponse.json(
      { error: "No scan data available. Submit a scan first via POST." },
      { status: 404 },
    );
  }

  return NextResponse.json(latestScan);
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateScanShape(data: unknown): string[] {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    errors.push("Request body must be a JSON object.");
    return errors;
  }

  const scan = data as Record<string, unknown>;

  // Required top-level sections
  const requiredSections = [
    "cpu",
    "gpu",
    "ram",
    "storage",
    "motherboard",
    "os",
  ] as const;

  for (const section of requiredSections) {
    if (!(section in scan)) {
      errors.push(`Missing required field: "${section}".`);
    } else if (section === "storage") {
      if (!Array.isArray(scan[section])) {
        errors.push(`"storage" must be an array.`);
      } else if ((scan[section] as unknown[]).length === 0) {
        errors.push(`"storage" must contain at least one drive.`);
      }
    } else if (typeof scan[section] !== "object" || scan[section] === null) {
      errors.push(`"${section}" must be a JSON object.`);
    }
  }

  // Validate CPU has a model name
  if (
    typeof scan.cpu === "object" &&
    scan.cpu !== null &&
    typeof (scan.cpu as Record<string, unknown>).model_name !== "string"
  ) {
    errors.push(`"cpu.model_name" is required and must be a string.`);
  }

  // Validate GPU has a model name
  if (
    typeof scan.gpu === "object" &&
    scan.gpu !== null &&
    typeof (scan.gpu as Record<string, unknown>).model_name !== "string"
  ) {
    errors.push(`"gpu.model_name" is required and must be a string.`);
  }

  // Validate RAM has total_gb
  if (
    typeof scan.ram === "object" &&
    scan.ram !== null &&
    typeof (scan.ram as Record<string, unknown>).total_gb !== "number"
  ) {
    errors.push(`"ram.total_gb" is required and must be a number.`);
  }

  // Reject prototype-pollution keys
  if ("__proto__" in scan || "constructor" in scan || "prototype" in scan) {
    errors.push("Request contains disallowed keys.");
  }

  return errors;
}

// ─── Sanitization ───────────────────────────────────────────────────────────

/**
 * Recursively sanitize an object: strip HTML from all string values
 * and limit nesting depth to prevent stack overflow.
 */
function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 10) return undefined;

  if (typeof obj === "string") {
    return obj.replace(/[<>]/g, "");
  }
  if (typeof obj === "number" || typeof obj === "boolean" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip prototype-pollution keys
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      result[key] = sanitizeObject(value, depth + 1);
    }
    return result;
  }
  return undefined;
}
