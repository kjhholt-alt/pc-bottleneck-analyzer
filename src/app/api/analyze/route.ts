import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an expert PC hardware analyst and gaming performance specialist. You receive raw system scan data and a rule-based analysis, then provide a personalized deep analysis.

Your response must be clear, specific to this exact hardware, and actionable. Write for a gamer who knows their components but may not know BIOS settings or optimization tricks.

Structure your response with these exact markdown headers:

## Quick Verdict
One-sentence summary of this system's health and biggest issue.

## Top Bottlenecks (Ranked by Impact)
Rank the detected bottlenecks by real-world gaming impact. For each:
- Explain WHY it matters for this specific CPU/GPU combo
- Estimate FPS impact in popular games (Cyberpunk, Valorant, etc.)
- Be specific — don't just say "performance loss", say "~15-20 FPS loss in CPU-heavy scenes"

## Free Fixes (Do These Now)
Settings, drivers, BIOS changes, and Windows tweaks that cost $0. Be specific:
- Give exact BIOS menu paths when possible (e.g., "Advanced → Overclocking → XMP Profile 1")
- Mention specific Windows settings by name
- Estimate the performance gain for each fix

## Upgrade Path
If upgrades are needed, suggest specific models with current street prices. Consider:
- Budget-friendly option vs best value option
- Compatibility with the current motherboard/PSU
- Whether the upgrade is worth the cost for this system's balance

## Compatibility Notes
Flag any potential issues: PSU wattage, physical clearance, slot availability, BIOS update requirements.

Keep the tone direct and helpful. No filler. Every sentence should be useful.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  let body: { scan: unknown; analysis: unknown; messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { scan, analysis, messages } = body;
  if (!scan || !analysis) {
    return NextResponse.json(
      { error: "Missing scan or analysis data" },
      { status: 400 },
    );
  }

  // Build the conversation messages
  const scanContext = `Here is the system scan data and rule-based analysis:\n\n**Scan Data:**\n${JSON.stringify(scan, null, 2)}\n\n**Rule-Based Analysis:**\n${JSON.stringify(analysis, null, 2)}`;

  const conversationMessages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: scanContext },
  ];

  // Append follow-up messages if this is a chat continuation
  if (messages && Array.isArray(messages)) {
    for (const msg of messages) {
      if (msg.role === "assistant" || msg.role === "user") {
        conversationMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }
  }

  try {
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: conversationMessages,
    });

    // Convert the Anthropic stream to a ReadableStream for the browser
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text),
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
