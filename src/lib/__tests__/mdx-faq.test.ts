import { describe, it, expect } from "vitest";
import { parseFaqsFromContent, getFaqsFromMdx } from "@/lib/mdx";

const FIXTURE = `# Some Guide

Intro prose that is not part of the FAQ.

## Why It Matters

Body text here.

## Frequently Asked Questions

### Will the Ryzen 7 9800X3D bottleneck the RTX 5090?

At 4K: no. GPU utilization stays at 99%. See our [pairing guide](/blog/x).

### Do I need <AffiliateLink name="DDR5-6000 CL30" /> RAM?

**DDR5-6000 CL30** is the sweet spot for AMD AM5 systems.

### Should I wait?

Unless you need 16 cores, there is \`no reason\` to wait.

## Related Guides

- Not part of the FAQ.
`;

describe("parseFaqsFromContent", () => {
  it("extracts every Q&A pair in the FAQ section", () => {
    const faqs = parseFaqsFromContent(FIXTURE);
    expect(faqs).toHaveLength(3);
    expect(faqs[0].question).toBe(
      "Will the Ryzen 7 9800X3D bottleneck the RTX 5090?"
    );
  });

  it("flattens answers to clean prose (no markdown/JSX left)", () => {
    const faqs = parseFaqsFromContent(FIXTURE);
    // markdown link -> its text only
    expect(faqs[0].answer).toBe(
      "At 4K: no. GPU utilization stays at 99%. See our pairing guide."
    );
    // <AffiliateLink> resolves to the product name in both Q and A
    expect(faqs[1].question).toBe("Do I need DDR5-6000 CL30 RAM?");
    expect(faqs[1].answer).toBe(
      "DDR5-6000 CL30 is the sweet spot for AMD AM5 systems."
    );
    // inline code markers stripped
    expect(faqs[2].answer).toBe("Unless you need 16 cores, there is no reason to wait.");
    // no residual markup anywhere
    for (const f of faqs) {
      expect(f.answer).not.toMatch(/[\[\]`*]|<\/?[A-Za-z]/);
      expect(f.answer).not.toContain("](");
    }
  });

  it("stops at the next H2 and never leaks non-FAQ content", () => {
    const faqs = parseFaqsFromContent(FIXTURE);
    for (const f of faqs) {
      expect(f.answer).not.toContain("Not part of the FAQ");
      expect(f.question).not.toContain("Related");
    }
  });

  it("returns [] when there is no FAQ section", () => {
    expect(parseFaqsFromContent("# Title\n\nJust body, no FAQ.")).toEqual([]);
  });

  it("handles alternate FAQ headers like '## FAQ: People Also Ask'", () => {
    const alt = "## FAQ: People Also Ask\n\n### Q one?\n\nAns one.\n\n### Q two?\n\nAns two.\n";
    const faqs = parseFaqsFromContent(alt);
    expect(faqs.map((f) => f.question)).toEqual(["Q one?", "Q two?"]);
  });

  it("reads bold questions, the lane's other convention", () => {
    const bold = `## Frequently Asked Questions

**Is the RX 9070 XT better than the RTX 5070 for 1440p?**
In pure rasterization, the RTX 5070 is 5-8% faster.

**Will a Ryzen 5 7600 bottleneck the RTX 5070?**
At 1080p, yes — expect 8-12% in CPU-heavy titles.
`;
    const faqs = parseFaqsFromContent(bold);
    expect(faqs).toHaveLength(2);
    expect(faqs[0].question).toBe(
      "Is the RX 9070 XT better than the RTX 5070 for 1440p?"
    );
    expect(faqs[0].answer).toBe("In pure rasterization, the RTX 5070 is 5-8% faster.");
    expect(faqs[1].question).toBe("Will a Ryzen 5 7600 bottleneck the RTX 5070?");
  });

  it("does not read a bold lead-in inside an answer as a question", () => {
    const mixed = `## FAQ

### Real question?

**Short answer:** it depends on resolution.
More prose here.
`;
    const faqs = parseFaqsFromContent(mixed);
    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toBe("Real question?");
    expect(faqs[0].answer).toBe("Short answer: it depends on resolution. More prose here.");
  });

  it("supports both question styles in one section", () => {
    const both = "## FAQ\n\n### H3 question?\n\nA one.\n\n**Bold question?**\nA two.\n";
    expect(parseFaqsFromContent(both).map((f) => f.question)).toEqual([
      "H3 question?",
      "Bold question?",
    ]);
  });
});

describe("getFaqsFromMdx", () => {
  it("returns [] for a slug with no .mdx file (component posts, unknown slugs)", () => {
    expect(getFaqsFromMdx("this-slug-does-not-exist-anywhere")).toEqual([]);
    expect(getFaqsFromMdx("gpu-bottlenecking-cpu")).toEqual([]); // component post
  });

  it("parses the real bold-question post the H3-only parser silently skipped", () => {
    const faqs = getFaqsFromMdx(
      "rx-9070-xt-vs-rtx-5070-gpu-comparison-bottleneck-2026"
    );
    expect(faqs.length).toBeGreaterThanOrEqual(2);
    for (const f of faqs) {
      expect(f.question).toMatch(/\?$/);
      expect(f.answer.length).toBeGreaterThan(0);
      expect(f.answer).not.toContain("**");
    }
  });

  it("parses a real shipped post with a FAQ section", () => {
    const faqs = getFaqsFromMdx(
      "best-cpu-for-rtx-5090-no-bottleneck-pairing-guide-2026"
    );
    expect(faqs.length).toBeGreaterThanOrEqual(2);
    for (const f of faqs) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
      // clean prose — no stray markdown link or JSX syntax survived
      expect(f.answer).not.toContain("](");
      expect(f.answer).not.toContain("<AffiliateLink");
    }
  });
});
