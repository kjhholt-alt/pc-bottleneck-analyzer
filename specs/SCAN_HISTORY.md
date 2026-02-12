# Feature: Scan History & Comparison

## Description
Save multiple scan results to the browser's localStorage so users can track their system's performance over time. Show a history list with timestamps and scores, and allow comparing two scans side-by-side to see what improved or regressed.

## User Story
As a PC enthusiast who tweaks settings regularly, I want to save and compare my scan results over time so I can see which changes actually improved performance.

## Acceptance Criteria

1. After a scan is loaded, a "Save to History" button appears in the dashboard header
2. Saved scans are stored in localStorage with scan_id, timestamp, total score, and the full scan data
3. A "History" button in the header opens a sidebar/panel showing all saved scans
4. Each history entry shows: date, score, grade, and a brief summary (CPU + GPU names)
5. Users can select two scans and click "Compare" to see a side-by-side comparison
6. Comparison view shows: score delta, bottleneck changes (added/removed), and per-component score changes
7. Users can delete individual scans from history
8. Maximum of 20 saved scans (oldest auto-removed when limit exceeded)
9. History persists across browser sessions via localStorage
10. Export history as JSON backup

## Technical Design

### New Files
- `src/components/ScanHistory.tsx` -- History sidebar/panel component
- `src/components/ScanCompare.tsx` -- Side-by-side comparison view
- `src/lib/history.ts` -- localStorage read/write/delete logic

### Modifications
- `src/app/page.tsx` -- Add history button and state management
- `src/components/Dashboard.tsx` -- Add "Save to History" button

### Interfaces

```typescript
interface SavedScan {
  id: string;
  savedAt: string;
  scanId: string;
  totalScore: number;
  grade: string;
  cpuName: string;
  gpuName: string;
  scan: SystemScan;
}

interface ScanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScan: (scan: SystemScan) => void;
  currentScanId?: string;
}
```

### Key Functions
```typescript
function saveToHistory(scan: SystemScan, analysis: AnalysisResult): SavedScan
function getHistory(): SavedScan[]
function deleteScan(id: string): void
function exportHistory(): string
```

## Edge Cases
- localStorage is full -- show error message and suggest deleting old scans
- localStorage is disabled (private browsing) -- show warning, disable save
- Comparing scans with different hardware -- still allow it, highlight differences
- Very old scan format from a previous version -- handle gracefully with fallback
