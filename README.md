# PC Bottleneck Analyzer

Scan your PC hardware, detect performance bottlenecks, and get actionable recommendations to maximize gaming and productivity performance.

![Screenshot placeholder](docs/screenshot-placeholder.png)

## Features

- **Python System Scanner** -- Detects CPU, GPU, RAM, storage, motherboard, OS settings, network, and BIOS configuration on Windows 10/11
- **Web Dashboard** -- Drag-and-drop JSON upload with instant analysis results
- **Demo Mode** -- Try the dashboard with realistic sample data (mid-range gaming PC with intentional bottlenecks)
- **Rule-Based Bottleneck Detection** -- Identifies CPU bottlenecks, GPU bottlenecks, RAM issues, storage limitations, thermal throttling, and suboptimal settings
- **Performance Score** -- Overall /100 score with letter grade (A/B/C/D) and per-component breakdown
- **Hardware Database** -- 30+ CPUs and 30+ GPUs with tier classifications and pricing data
- **Prioritized Recommendations** -- Organized into free fixes, cheap fixes, and upgrade paths with estimated costs
- **Dark Theme** -- HWINFO-meets-modern-dashboard aesthetic with neon accent colors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Dashboard | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes |
| Scanner | Python 3.10+, psutil, GPUtil, WMI, py-cpuinfo |
| AI Analysis | Anthropic Claude API (planned for Session 3) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.10+ (for the scanner)
- Windows 10 or 11 (scanner is Windows-specific)

### Dashboard Setup

```bash
# Clone the repository
git clone https://github.com/kjhholt-alt/pc-bottleneck-analyzer.git
cd pc-bottleneck-analyzer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scanner Setup

```bash
cd scanner

# Install Python dependencies
pip install psutil GPUtil wmi py-cpuinfo

# Run the scanner
python scanner.py

# Or scan and auto-upload to the dashboard
python scanner.py --upload
```

The scanner outputs `system_scan.json` which you can drag-and-drop onto the dashboard.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Session 3+ | Claude API key for AI-powered analysis |

## Project Structure

```
pc-bottleneck-analyzer/
  scanner/
    scanner.py              # Python hardware scanner (standalone)
  src/
    app/
      api/scan/route.ts     # POST/GET endpoint for scanner data
      globals.css            # Tailwind v4 theme + CSS variables
      layout.tsx             # Root layout with fonts and theme
      page.tsx               # Home page (upload + dashboard)
    components/
      BottleneckCard.tsx     # Expandable bottleneck detail card
      Dashboard.tsx          # Main dashboard with tab navigation
      DashboardTabs.tsx      # Tab bar with animated underline
      HardwareCard.tsx       # Hardware spec display card
      RawDataViewer.tsx      # Collapsible JSON tree viewer
      RecommendationList.tsx # Tiered recommendation sections
      ScanUploader.tsx       # Drag-and-drop file upload + demo
      ScoreGauge.tsx         # Animated circular score gauge
      SystemOverview.tsx     # Score + hardware cards grid
      ThemeProvider.tsx      # next-themes wrapper
    data/
      hardware-db.ts         # CPU/GPU performance database (60+ entries)
      sample-scan.ts         # Demo mode sample data
    lib/
      analysis.ts            # Rule-based bottleneck detection engine
      types.ts               # Shared TypeScript interfaces
  specs/                      # Feature specification files
  public/                     # Static assets
```

## Session Roadmap

| Session | Goal | Status |
|---------|------|--------|
| 1 | Python system scanner | Done |
| 2 | Web dashboard + analysis engine | Done |
| 3 | AI-powered deep analysis + chat + BIOS guide | Planned |
| 4 | Real-time monitoring (WebSocket + live charts) | Planned |
| 5 | Benchmark engine + comparison | Planned |
| 6 | Testing, packaging (.exe), landing page | Planned |

## License

Private project.
