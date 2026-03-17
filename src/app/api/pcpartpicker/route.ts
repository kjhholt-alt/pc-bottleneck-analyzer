import { NextResponse, type NextRequest } from "next/server";
import { parsePCPartPickerHTML, buildScanFromParts, isPCPartPickerURL } from "@/lib/pcpartpicker";

export async function POST(req: NextRequest) {
  let url: string;

  try {
    const body = await req.json();
    url = body.url as string;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  if (!isPCPartPickerURL(url)) {
    return NextResponse.json(
      { error: "URL must be a PCPartPicker build list (pcpartpicker.com/list/...)." },
      { status: 400 }
    );
  }

  // Fetch the PCPartPicker page server-side (avoids CORS)
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        // Polite user-agent so PCPartPicker doesn't block us
        "User-Agent":
          "Mozilla/5.0 (compatible; PCBottleneckAnalyzer/1.0; +https://pcbottleneck.buildkit.store)",
        Accept: "text/html,application/xhtml+xml",
      },
      // 10-second timeout
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch build list (HTTP ${res.status}).` },
        { status: 502 }
      );
    }

    html = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Could not reach PCPartPicker: ${msg}` },
      { status: 502 }
    );
  }

  // Parse parts from HTML
  const parts = parsePCPartPickerHTML(html);

  if (parts.length === 0) {
    return NextResponse.json(
      {
        error:
          "No parts found. Make sure the URL is a saved PCPartPicker build list with at least a CPU, GPU, and RAM.",
      },
      { status: 422 }
    );
  }

  // Build a SystemScan from the parts
  try {
    const scan = buildScanFromParts(parts);
    return NextResponse.json({ scan, parts_found: parts.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse error";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
