"use client";

import { useRef, useState } from "react";

/**
 * Renders a self-contained report HTML document in an isolated iframe (srcDoc),
 * auto-sizing to the report's content height. srcdoc iframes are same-origin,
 * so we can read the content height on load and grow the frame to fit — no
 * inner scrollbar, the report reads like part of the page.
 */
export function ReportFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1400);

  function fit() {
    const doc = ref.current?.contentWindow?.document;
    if (doc) {
      const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      if (h > 0) setHeight(h + 24);
    }
  }

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      title="Your PC Deep-Dive Report"
      onLoad={fit}
      className="w-full rounded-2xl border border-border bg-[#0a0e14]"
      style={{ height }}
    />
  );
}
