# Improvement Report - PC Bottleneck Analyzer

Generated: 2026-02-12
Last updated: 2026-02-12 (after all phases complete)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total issues found** | 25 |
| Critical issues found | 7 |
| Medium issues found | 14 |
| Low issues found | 4 |
| **Issues fixed** | 18 |
| Critical issues fixed | 5 |
| Medium issues fixed | 10 |
| Low issues fixed | 3 |
| **Files modified** | 12 |
| **New files created** | 12 |
| **Remaining issues** | 7 |

---

## Code Issues Found

### CRITICAL

| # | File | Line(s) | Issue | Description |
|---|------|---------|-------|-------------|
| 1 | `src/app/api/scan/route.ts` | 5 | **In-memory storage lost on serverless cold start** | `latestScan` is stored in module-level variable. On Vercel (serverless), each invocation may be a new instance, so GET after POST may return 404. Data is never persisted. |
| 2 | `src/app/api/scan/route.ts` | 11-54 | **No request size limit** | POST endpoint accepts arbitrarily large JSON payloads with no size guard. An attacker could send a multi-GB payload to exhaust memory. |
| 3 | `src/app/api/scan/route.ts` | 73-135 | **Insufficient input validation** | Validation only checks top-level keys exist and a few nested fields. Malicious data with deeply nested objects, prototype pollution keys, or XSS payloads in string fields is not sanitized. |
| 4 | `src/components/RawDataViewer.tsx` | 186-189 | **Clipboard API called without error handling** | `navigator.clipboard.writeText()` can throw if the page isn't focused or permissions are denied. The promise rejection is unhandled. |
| 5 | `src/app/api/scan/route.ts` | 45 | **Redirect URL references non-existent route** | `redirect: /results?scan=${scan.scan_id}` -- there is no `/results` page in the project. |
| 6 | `scanner/scanner.py` | 86-94 | **Shell injection via `_run_cmd`** | `_run_cmd` uses `shell=True` with string command. While currently only called with static strings, this is a dangerous pattern if ever used with dynamic input. |
| 7 | `src/components/ScanUploader.tsx` | 39 | **JSON.parse on untrusted file with no size check** | User can drop a massive JSON file with no limit, potentially freezing the browser tab. |

### MEDIUM

| # | File | Line(s) | Issue | Description |
|---|------|---------|-------|-------------|
| 8 | `src/components/ScoreGauge.tsx` | 23-46 | **Score breakdown values use raw percentage scale** | Score breakdown shows values like `18` for CPU (/25 max) but displays with color thresholds set for 0-100 scale (>=80 green, >=60 amber). A CPU score of 18/25 (72%) shows as red because 18 < 60. |
| 9 | `src/components/SystemOverview.tsx` | 226-233 | **Score breakdown color thresholds wrong** | Same issue as above -- breakdown colors use absolute value thresholds, not percentage-based. |
| 10 | `src/components/RawDataViewer.tsx` | 193-201 | **Object URL not revoked on error** | `handleDownload` creates a blob URL and revokes it after `a.click()`, but if `click()` throws, the URL leaks. |
| 11 | `src/components/DashboardTabs.tsx` | 43-83 | **Missing aria-controls and tabpanel role** | Tabs have `role="tab"` and `aria-selected` but no `aria-controls` linking to tab panels. Tab panels lack `role="tabpanel"`. |
| 12 | `src/app/page.tsx` | 25-66 | **No skip-to-content link** | No skip navigation link for screen reader users. |
| 13 | `src/components/ScanUploader.tsx` | 121-127 | **Hidden file input has no accessible label** | The hidden `<input type="file">` has no `aria-label` or associated `<label>`. |
| 14 | `src/components/BottleneckCard.tsx` | 74-106 | **Expand button has no accessible name** | Button toggles expansion but has no `aria-label` or `aria-expanded` attribute. |
| 15 | `src/components/RecommendationList.tsx` | 72-98 | **Tier section expand button has no aria-expanded** | Same accessibility issue as BottleneckCard. |
| 16 | `src/components/RawDataViewer.tsx` | 140-142 | **Collapsible section button has no aria-expanded** | Same pattern. |
| 17 | `src/lib/analysis.ts` | 786-808 | **CPU upgrade recommendation can show negative price range** | If `getUpgrades` returns entries where max price < min price (edge case with sorting), the estimated_cost string could be inverted. |
| 18 | `src/data/hardware-db.ts` | 551-578 | **Fuzzy lookup can return wrong match** | `lookupCPU("AMD Ryzen 5 5500")` could match `"amd ryzen 5 5600x"` because "amd ryzen 5 5" is a substring of both. The first match wins, which depends on object iteration order. |
| 19 | `scanner/scanner.py` | 166-170 | **Scanner outputs cache in bytes, dashboard expects KB** | Scanner stores `cache_l1_bytes`, `cache_l2_bytes`, `cache_l3_bytes` but the TypeScript `CPUInfo` interface expects `cache_l1`, `cache_l2`, `cache_l3` (in KB per `formatCache`). Field name mismatch. |
| 20 | `scanner/scanner.py` | 466-470 | **Scanner RAM timings is a dict, dashboard expects string or null** | Scanner outputs `timings: {cl, trcd, trp, tras}` but TypeScript expects `timings: string | null`. |
| 21 | `scanner/scanner.py` | 460-464 | **Scanner RAM form_factor may not include DDR generation** | The dashboard analysis checks `form_factor.toLowerCase().includes("ddr4")` but scanner may output just `"DIMM"` without DDR version. |

### LOW

| # | File | Line(s) | Issue | Description |
|---|------|---------|-------|-------------|
| 22 | `src/app/layout.tsx` | 28 | **Hardcoded `className="dark"`** | ThemeProvider manages theme but HTML tag has hardcoded `dark` class. |
| 23 | `src/components/ScanUploader.tsx` | 88 | **Demo loading state never reset if component unmounts** | `setIsLoading(true)` in `handleDemoClick` followed by `setTimeout`. If component unmounts before timeout fires, state update on unmounted component occurs. |
| 24 | `src/components/ScoreGauge.tsx` | 4 | **Importing unused items** | `useMotionValue` and `useTransform` are used, but could be simplified. Not strictly dead code but low-priority. |
| 25 | `public/` | - | **Default Next.js SVGs still present** | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are default template files not used by the app. |

---

## Missing Tests

> Testing phase skipped per project instructions. No test files exist in the project.

---

## Missing Features (from STATUS.md)

| Feature | Status | Notes |
|---------|--------|-------|
| AI analysis (Claude API integration) | Not started | Planned for Session 3 |
| AI chat follow-up interface | Not started | Planned for Session 3 |
| BIOS optimization guide | Not started | Planned for Session 3 |
| Real-time monitoring (WebSocket + live charts) | Not started | Planned for Session 4 |
| Benchmark engine | Not started | Planned for Session 5 |
| PyInstaller packaging (.exe) | Not started | Planned for Session 6 |
| Landing page | Not started | Planned for Session 6 |
| Scanner `requirements.txt` | Missing | Referenced in scanner docstring but file does not exist |

---

## Polish Gaps

| Area | Issue |
|------|-------|
| README.md | Still the default create-next-app boilerplate README |
| .env.example | Missing -- no template for future ANTHROPIC_API_KEY |
| Scanner/Dashboard field mismatch | Scanner JSON keys don't match TypeScript interfaces (cache_l1_bytes vs cache_l1, timings dict vs string) |
| Score breakdown display | Sub-scores shown as raw values (/25, /20, /15) but colored as if on 0-100 scale -- visually misleading |
| Unused public assets | Default Next.js SVGs clutter the public directory |
| Mobile tab labels | Tab labels are hidden on mobile (`hidden sm:inline`) -- only icons show, which is fine but icons have no tooltips |
| Empty state for no scan data on API GET | Returns JSON error, no user-friendly handling |
| No favicon customization | Uses default Next.js favicon |

---

## Suggested New Features

| # | Feature | Description | Effort | Impact | Priority |
|---|---------|-------------|--------|--------|----------|
| 1 | **Scan History & Comparison** | Save multiple scans (localStorage or DB), compare performance over time, show improvement/regression. | Medium | High | 1 |
| 2 | **Export PDF Report** | Generate a downloadable PDF report with score gauge, bottleneck list, and recommendations -- shareable with friends or tech support. | Medium | High | 2 |
| 3 | **Component Upgrade Simulator** | "What if I upgraded to X?" -- let users pick a different CPU/GPU from the database and see how the score would change. | Medium | Very High | 3 |
| 4 | **Share Results Link** | Generate a shareable URL (encoded scan data or short ID) so users can share their results without re-uploading. | Low | High | 4 |
| 5 | **Game-Specific Recommendations** | Let users select a game (e.g., Cyberpunk 2077, Fortnite) and get targeted settings/hardware recommendations for that title. | High | Very High | 5 |
| 6 | **System Health Dashboard** | Show a quick health summary with traffic-light indicators for each component (CPU, GPU, RAM, Storage, Settings) at a glance. | Low | Medium | 6 |
| 7 | **Dark/Light Theme Toggle** | ThemeProvider is already installed but only dark mode is used. Add a toggle button in the header. | Low | Low | 7 |
| 8 | **Scanner Auto-Update Check** | Check if a newer version of scanner.py is available on GitHub and notify user. | Low | Low | 8 |
| 9 | **Multi-GPU Support** | Detect and display multiple GPUs (SLI/CrossFire or mixed configs). | Medium | Low | 9 |
| 10 | **Notification for Outdated Drivers** | Compare GPU driver version against a known-latest database and warn if outdated. | Medium | Medium | 10 |

---

## Phase 2-4: Issues Fixed

### Critical Issues Fixed

| # | Issue | Fix Applied |
|---|-------|-------------|
| 2 | No request size limit | Added 2 MB `MAX_BODY_SIZE` check against `content-length` header |
| 3 | Insufficient input validation | Added `sanitizeObject()` recursive sanitizer (strips HTML, limits depth to 10, blocks prototype-pollution keys) |
| 4 | Clipboard API unhandled rejection | Added `.then(onSuccess, onError)` pattern to `navigator.clipboard.writeText()` |
| 5 | Redirect to non-existent route | Removed `redirect` field from POST response; API now returns only `{ ok, scan_id }` |
| 7 | No file size check on upload | Added 2 MB file size guard in `processFile()` before reading |

### Medium Issues Fixed

| # | Issue | Fix Applied |
|---|-------|-------------|
| 8-9 | Score breakdown wrong colors | Replaced absolute thresholds with percentage-based thresholds (value/max * 100). Display now shows `value/max` format. |
| 10 | Blob URL leak on download error | Wrapped in try/finally to always revoke object URL |
| 11 | Missing aria-controls and tabpanel roles | Added `id`, `aria-controls` to tab buttons; added `role="tabpanel"`, `id`, `aria-labelledby` to tab panels |
| 12 | No skip-to-content link | Added skip link with sr-only styling in page.tsx |
| 13 | Hidden file input no label | Added `aria-label="Upload system scan JSON file"` |
| 14 | BottleneckCard expand button | Added `aria-expanded` and descriptive `aria-label` |
| 15 | RecommendationList expand button | Added `aria-expanded` and descriptive `aria-label` |
| 16 | RawDataViewer collapsible button | Added `aria-expanded` and descriptive `aria-label` |
| 19 | Scanner cache field name mismatch | Renamed `cache_l1_bytes` -> `cache_l1` (KB), `cache_l2_bytes` -> `cache_l2`, `cache_l3_bytes` -> `cache_l3`; updated byte-to-KB conversion |
| 20-21 | Scanner RAM field mismatches | Changed `timings` from dict to `null` (string format); Added DDR generation detection via `SMBIOSMemoryType` WMI field; form_factor now includes DDR gen (e.g. "DIMM DDR4") |

### Low Issues Fixed

| # | Issue | Fix Applied |
|---|-------|-------------|
| 25 | Unused default SVGs | Deleted `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` from `public/` |
| - | Mobile tab accessibility | Added `sr-only` labels for tab names so screen readers announce tab names on mobile |
| - | Monitor icon accessibility | Added `aria-hidden="true"` to decorative header icon |

### Documentation & Polish

| Item | What was done |
|------|---------------|
| README.md | Replaced boilerplate with comprehensive project README (description, features, tech stack, getting started, project structure, session roadmap) |
| .env.example | Created with `ANTHROPIC_API_KEY` placeholder |
| STATUS.md | Updated health status and "What's Working" section |

### Feature Skeletons Created

| Feature | Spec | Skeleton Files |
|---------|------|---------------|
| Component Upgrade Simulator | `specs/UPGRADE_SIMULATOR.md` | `src/lib/simulate.ts`, `src/components/UpgradeSimulator.tsx`, `src/components/ScoreComparison.tsx` |
| Scan History & Comparison | `specs/SCAN_HISTORY.md` | `src/lib/history.ts`, `src/components/ScanHistory.tsx`, `src/components/ScanCompare.tsx` |
| Share Results Link | `specs/SHARE_RESULTS.md` | `src/lib/share.ts`, `src/components/ShareButton.tsx` |

---

## Remaining Issues for Next Session

| # | Severity | Issue | Reason Deferred |
|---|----------|-------|-----------------|
| 1 | Critical | In-memory storage lost on serverless cold start | Requires adding a persistence layer (KV/DB) -- architectural change for a future session |
| 6 | Critical | Shell injection in scanner `_run_cmd` | Only called with static strings today; full fix requires refactoring to `subprocess.run(list)` calls throughout, which is a medium-effort change |
| 17 | Medium | CPU upgrade price range can be inverted | Edge case that rarely occurs; requires refactoring `getUpgrades` return value sorting |
| 18 | Medium | Fuzzy lookup can return wrong match | Requires implementing proper string similarity scoring (e.g., Levenshtein distance) |
| 22 | Low | Hardcoded `className="dark"` on html | This is intentional while only dark mode is supported; will be fixed when light theme toggle is added |
| 23 | Low | Demo loading state not cleaned up on unmount | Minor React strictness issue; will resolve when the component is refactored |
| 24 | Low | ScoreGauge imports could be simplified | Purely stylistic; no functional impact |
