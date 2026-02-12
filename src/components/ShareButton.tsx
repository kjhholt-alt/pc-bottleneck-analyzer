// TODO: Share Button Component
//
// Button that generates a shareable URL with encoded scan data
// and copies it to the clipboard.

"use client";

import type { SystemScan } from "@/lib/types";

interface ShareButtonProps {
  scan: SystemScan;
}

export function ShareButton({ scan: _scan }: ShareButtonProps) {
  // TODO: Implementation
  // - Button with Share2 icon from lucide-react
  // - On click: encode scan with encodeScanForURL()
  // - If successful: copy share URL to clipboard, show "Copied!" toast
  // - If too large: show fallback message "Scan data too large to share via URL"
  //   with a "Copy JSON" button instead
  // - Loading state while encoding
  return null;
}
