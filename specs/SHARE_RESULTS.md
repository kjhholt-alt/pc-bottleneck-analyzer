# Feature: Share Results Link

## Description
Generate a shareable URL that encodes the scan results so users can share their analysis with friends, on forums, or in tech support threads without requiring the recipient to upload a file.

## User Story
As a PC user asking for help online, I want to share a link to my scan results so others can see my hardware config and bottlenecks without me having to screenshot everything.

## Acceptance Criteria

1. A "Share" button appears in the dashboard header when viewing scan results
2. Clicking it generates a URL with the scan data encoded in the URL hash (client-side only, no server storage needed)
3. The URL is automatically copied to clipboard with a "Copied!" confirmation
4. Opening the shared URL auto-loads the scan data and shows the dashboard
5. Shared links use URL-safe base64 encoding with gzip compression to keep URLs reasonable
6. If the URL is too long (> 8000 chars), fall back to showing a "Copy JSON" button instead
7. The share URL includes a version identifier for future compatibility
8. A shared view shows a subtle "Shared scan" badge so recipients know it's read-only
9. Invalid or corrupted share URLs show a user-friendly error message
10. Share URLs work without any backend -- purely client-side encoding/decoding

## Technical Design

### New Files
- `src/lib/share.ts` -- Encode/decode scan data for URL sharing
- `src/components/ShareButton.tsx` -- Share button with copy-to-clipboard

### Modifications
- `src/app/page.tsx` -- Check for share data in URL hash on mount, add share button
- `src/components/Dashboard.tsx` -- Pass share state for badge display

### Interfaces

```typescript
interface ShareData {
  version: number;
  scan: SystemScan;
}

interface ShareButtonProps {
  scan: SystemScan;
}
```

### Key Functions
```typescript
function encodeScanForURL(scan: SystemScan): string | null
function decodeScanFromURL(hash: string): SystemScan | null
function isShareURL(): boolean
```

### URL Format
```
https://pc-bottleneck.vercel.app/#share=v1:<base64-gzip-encoded-scan>
```

## Edge Cases
- Scan data too large for URL -- show fallback message with copy JSON option
- Corrupted or tampered URL data -- show clear error, offer to try demo instead
- Browser doesn't support CompressionStream API -- fall back to uncompressed base64
- User modifies URL manually -- validate decoded data shape before rendering
- Very old share format version -- show "This share link is from an older version" message
