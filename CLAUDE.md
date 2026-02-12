# PC Bottleneck Analyzer

## Project Overview
Desktop + web tool that scans PC hardware, detects bottlenecks, and provides AI-powered optimization recommendations. Two-part architecture:
1. **Python scanner** (`scanner/scanner.py`) — runs locally, collects hardware data, outputs JSON
2. **Next.js dashboard** — web app that visualizes scan data, runs analysis, provides recommendations

## Tech Stack
- **Dashboard**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, framer-motion, recharts, lucide-react, next-themes
- **Scanner**: Python 3.10+, psutil, GPUtil, WMI, py-cpuinfo
- **AI Analysis**: Anthropic Claude API (Session 3+)
- **Deploy**: Vercel

## Architecture
- `src/` — Next.js app (App Router, `src` directory)
- `scanner/` — Python system scanner (standalone, no server dependency)
- `src/lib/types.ts` — Shared TypeScript interfaces
- `src/lib/analysis.ts` — Rule-based bottleneck detection engine
- `src/data/sample-scan.ts` — Demo mode sample data
- `src/data/hardware-db.ts` — CPU/GPU comparison database

## Design System
- **Theme**: Dark by default (HWINFO-meets-modern-dashboard aesthetic)
- **Colors**: Cyan (#22d1ee) = good/accent, Amber (#f59e0b) = warning, Red (#ef4444) = critical, Green (#10b981) = optimal, Purple (#a855f7) = secondary
- **Tailwind v4**: Uses CSS variables in `globals.css` with `@theme inline {}`, NOT tailwind.config.ts
- **Fonts**: Geist Sans + Geist Mono (via next/font/google)
- **Animations**: framer-motion for all entrance animations

## Key Patterns
- All interactive components are `"use client"`
- Use lucide-react for icons
- Cards: `bg-surface border border-border rounded-2xl`
- Hover effects: subtle cyan border glow
- Performance score: /100 with letter grade (A/B/C/D)
- Bottleneck severity: critical > warning > info > good

## Git Identity
```bash
git -c user.name="kjhholt-alt" -c user.email="kjhholt.alt@gmail.com" commit -m "message"
```

## Session Roadmap
1. ✅ Python system scanner
2. ✅ Web dashboard (display + analysis)
3. 🔲 AI-powered deep analysis + chat + BIOS guide
4. 🔲 Real-time monitoring (WebSocket + live charts)
5. 🔲 Benchmark engine + comparison
6. 🔲 Testing, packaging (.exe), landing page
