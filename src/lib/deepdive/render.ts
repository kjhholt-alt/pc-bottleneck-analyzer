// ─── PC Deep-Dive Report — HTML artifact renderer ────────────────────────────
//
// Turns a computed DeepDiveReport into a single, self-contained HTML document
// (inline CSS, no external assets) so it can be delivered at a private link,
// embedded in an <iframe srcDoc>, downloaded as a .html file, or printed /
// saved to PDF by the buyer. Dark, terminal-dense, buildkit house style — no
// glow, tabular. Fully deterministic: same report → same bytes.

import type { DeepDiveReport } from "./types";
import type { Bottleneck, Recommendation } from "@/lib/types";
import type { LadderRung } from "@/lib/blueprint";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#22d1ee",
  good: "#10b981",
};

const CATEGORY_MAX: Record<string, number> = {
  cpu: 25,
  gpu: 25,
  ram: 20,
  storage: 15,
  settings: 15,
};

const RES_LABEL: Record<string, string> = {
  "1080p": "1080p",
  "1440p": "1440p",
  "4K": "4K",
};

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function bar(label: string, value: number, max: number): string {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const color = pct >= 80 ? "#10b981" : pct >= 55 ? "#22d1ee" : pct >= 35 ? "#f59e0b" : "#ef4444";
  return `
    <div class="bar-row">
      <div class="bar-label">${esc(label)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="bar-val">${value}/${max}</div>
    </div>`;
}

function bottleneckCard(b: Bottleneck): string {
  const color = SEV_COLOR[b.severity] ?? "#22d1ee";
  return `
    <div class="bn" style="border-left-color:${color}">
      <div class="bn-head">
        <span class="sev" style="background:${color}1a;color:${color}">${esc(b.severity)}</span>
        <span class="bn-title">${esc(b.title)}</span>
        <span class="bn-cat">${esc(b.category.toUpperCase())}</span>
      </div>
      <p class="bn-desc">${esc(b.description)}</p>
      <div class="bn-grid">
        <div><span class="k">Impact</span><span class="v">${esc(b.impact)}</span></div>
        <div><span class="k">Fix</span><span class="v">${esc(b.fix)}</span></div>
        <div><span class="k">Difficulty</span><span class="v">${esc(b.difficulty)}</span></div>
        <div><span class="k">Cost</span><span class="v">${esc(b.estimated_cost)}</span></div>
      </div>
    </div>`;
}

function recItem(r: Recommendation): string {
  return `
    <li class="rec">
      <div class="rec-title">${esc(r.title)}</div>
      <div class="rec-desc">${esc(r.description)}</div>
      <div class="rec-meta"><span>${esc(r.impact)}</span><span class="rec-cost">${esc(r.estimated_cost)}</span></div>
    </li>`;
}

function ladderCard(rung: LadderRung): string {
  if (!rung.part) {
    return `
      <div class="rung">
        <div class="rung-budget">Up to ${money(rung.budget)}</div>
        <div class="rung-none">Nothing in our database beats your current GPU at this budget — save it toward the next rung.</div>
      </div>`;
  }
  const price = rung.part.current_price_approx || rung.part.msrp;
  const upliftRows = rung.fpsUplift
    .map(
      (u) => `
        <tr>
          <td>${esc(u.gameTitle)}</td>
          <td class="num">${u.beforeFps}</td>
          <td class="num arrow">→</td>
          <td class="num up">${u.afterFps}</td>
        </tr>`,
    )
    .join("");
  return `
    <div class="rung">
      <div class="rung-budget">Up to ${money(rung.budget)}</div>
      <div class="rung-part">${esc(rung.part.name)}</div>
      <div class="rung-cost">
        <span>${money(price)} new</span>
        <span class="muted">− ${money(rung.resaleOfCurrentGpu)} resale</span>
        <span class="net">= ${rung.netCost !== null ? money(rung.netCost) : "—"} net</span>
      </div>
      <table class="uplift">
        <thead><tr><th>Game</th><th class="num">Now</th><th></th><th class="num">After</th></tr></thead>
        <tbody>${upliftRows}</tbody>
      </table>
    </div>`;
}

const CSS = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #0a0e14; color: #e6edf3;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.55; font-size: 15px;
  }
  .wrap { max-width: 860px; margin: 0 auto; padding: 40px 28px 80px; }
  .mono { font-family: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace; }
  h1 { font-size: 30px; margin: 0 0 4px; letter-spacing: -0.02em; }
  h2 { font-size: 18px; margin: 40px 0 14px; letter-spacing: -0.01em; border-bottom: 1px solid #1c232e; padding-bottom: 8px; }
  a { color: #22d1ee; }
  .brand { color: #22d1ee; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
  .muted { color: #8b98a5; }
  .spec-line { color: #b6c2cf; font-size: 14px; margin-top: 10px; }
  .spec-line b { color: #e6edf3; font-weight: 600; }
  .card { background: #10161f; border: 1px solid #1c232e; border-radius: 14px; padding: 20px; }
  .score-panel { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; margin-top: 18px; }
  .grade { font-size: 56px; font-weight: 800; line-height: 1; color: #22d1ee; }
  .score-sub { font-size: 14px; color: #b6c2cf; }
  .score-sub .big { font-size: 22px; font-weight: 700; color: #e6edf3; }
  .pctile { margin-left: auto; text-align: right; }
  .pctile .big { font-size: 22px; font-weight: 700; color: #10b981; }
  .bars { margin-top: 20px; }
  .bar-row { display: grid; grid-template-columns: 84px 1fr 54px; align-items: center; gap: 10px; margin: 7px 0; }
  .bar-label { font-size: 12px; color: #8b98a5; text-transform: uppercase; letter-spacing: 0.04em; }
  .bar-track { height: 8px; background: #1c232e; border-radius: 6px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 6px; }
  .bar-val { font-size: 12px; text-align: right; color: #b6c2cf; font-variant-numeric: tabular-nums; }
  p.lead { font-size: 15px; color: #cdd7e0; }
  ul.bullets { padding-left: 18px; margin: 12px 0; }
  ul.bullets li { margin: 5px 0; color: #cdd7e0; }
  .note { background: #12202a; border: 1px solid #1e3a44; border-radius: 12px; padding: 14px 16px; margin-top: 16px; }
  .note .k { color: #22d1ee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  .bn { background: #10161f; border: 1px solid #1c232e; border-left: 3px solid #22d1ee; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .bn-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .sev { font-size: 10px; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
  .bn-title { font-weight: 600; }
  .bn-cat { margin-left: auto; font-size: 11px; color: #8b98a5; }
  .bn-desc { color: #b6c2cf; font-size: 14px; margin: 8px 0; }
  .bn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; font-size: 13px; }
  .bn-grid .k { display: block; color: #8b98a5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  .bn-grid .v { color: #cdd7e0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .games th, .games td { text-align: left; padding: 9px 10px; border-bottom: 1px solid #1c232e; }
  .games th { color: #8b98a5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #1c232e; color: #b6c2cf; }
  .ladder { display: grid; gap: 14px; grid-template-columns: 1fr; margin-top: 8px; }
  .rung { background: #10161f; border: 1px solid #1c232e; border-radius: 12px; padding: 16px; }
  .rung-budget { font-size: 12px; color: #8b98a5; text-transform: uppercase; letter-spacing: 0.05em; }
  .rung-part { font-size: 17px; font-weight: 700; margin: 4px 0 8px; color: #e6edf3; }
  .rung-none { color: #b6c2cf; font-size: 14px; margin-top: 6px; }
  .rung-cost { display: flex; gap: 10px; flex-wrap: wrap; font-size: 13px; margin-bottom: 10px; }
  .rung-cost .net { color: #10b981; font-weight: 600; }
  .uplift { font-size: 13px; }
  .uplift th, .uplift td { padding: 4px 8px; }
  .uplift th { color: #8b98a5; font-size: 10px; text-transform: uppercase; }
  .uplift .up { color: #10b981; font-weight: 600; }
  .uplift .arrow { color: #8b98a5; }
  ol.ops { padding-left: 20px; }
  ol.ops li { margin: 7px 0; color: #cdd7e0; }
  ul.recs { list-style: none; padding: 0; margin: 0; }
  .rec { background: #10161f; border: 1px solid #1c232e; border-radius: 10px; padding: 12px 14px; margin: 8px 0; }
  .rec-title { font-weight: 600; }
  .rec-desc { color: #b6c2cf; font-size: 13px; margin: 4px 0; }
  .rec-meta { display: flex; justify-content: space-between; font-size: 12px; color: #8b98a5; }
  .rec-cost { color: #22d1ee; }
  .compat li { color: #cdd7e0; margin: 5px 0; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #1c232e; color: #8b98a5; font-size: 12px; }
  .sample-banner { background: #3a2a12; border: 1px solid #7a5a1e; color: #f5c563; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 20px; text-align: center; }
  @media print {
    body { background: #fff; color: #111; }
    .card, .bn, .rung, .rec, .note { background: #fff; border-color: #ddd; }
    .brand, a { color: #0a7ea4; }
    h2 { border-color: #ddd; }
  }
`;

export interface RenderOptions {
  /** Show a "sample" banner (public demo). */
  sample?: boolean;
}

/** Render a computed report to a complete, self-contained HTML document. */
export function renderReportHtml(report: DeepDiveReport, opts: RenderOptions = {}): string {
  const { input, cpu, gpu, score, percentile } = report;
  const date = report.generatedAtISO.slice(0, 10);
  const res = RES_LABEL[input.resolution] ?? input.resolution;

  const breakdown = score.breakdown as Record<string, number>;
  const bars = ["cpu", "gpu", "ram", "storage", "settings"]
    .map((k) => bar(k, breakdown[k] ?? 0, CATEGORY_MAX[k] ?? 25))
    .join("");

  const gamesRows = report.games
    .map(
      (g) => `
        <tr>
          <td>${esc(g.title)}</td>
          <td class="num">${g.currentFps} fps</td>
          <td><span class="tag">${esc(g.rating)}</span></td>
          <td class="num">${g.bestUpgradeFps} fps</td>
        </tr>`,
    )
    .join("");

  const bottlenecks = report.bottlenecks.map(bottleneckCard).join("");
  const ladder = report.ladder.map(ladderCard).join("");
  const ops = report.orderOfOperations.map((o) => `<li>${esc(o)}</li>`).join("");
  const freeWins = report.recommendations.free.map(recItem).join("");
  const cheap = report.recommendations.cheap.map(recItem).join("");
  const compat = report.compatibility
    .map((c) => `<li><b>${esc(c.title)}</b> — ${esc(c.description)}</li>`)
    .join("");

  const sampleBanner = opts.sample
    ? `<div class="sample-banner">This is a <b>sample</b> report on a fixed example rig. Buy your own to get one built from your exact specs.</div>`
    : "";

  const noteBlock = input.notes
    ? `<div class="note"><span class="k">Your note</span><div>${esc(input.notes)}</div></div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>PC Deep-Dive Report — ${esc(cpu.name)} + ${esc(gpu.name)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
  ${sampleBanner}
  <div class="brand">PC Bottleneck Analyzer · Deep-Dive Report</div>
  <h1>Your PC Deep-Dive Report</h1>
  <div class="muted mono">Generated ${esc(date)} · pcbottleneck.buildkit.store</div>
  <div class="spec-line">
    <b>${esc(cpu.name)}</b> · <b>${esc(gpu.name)}</b> · <b>${input.ramGb}GB RAM</b> ·
    <b>${esc(res)}</b> target${input.storageType ? ` · <b>${esc(input.storageType)}</b>` : ""}
  </div>
  ${noteBlock}

  <h2>Verdict</h2>
  <div class="card">
    <div class="score-panel">
      <div class="grade">${esc(score.grade)}</div>
      <div class="score-sub"><span class="big">${score.total}/100</span><br>${esc(score.grade_description)}</div>
      <div class="pctile"><div class="score-sub">Better than</div><div class="big">${percentile.overall}%</div><div class="score-sub">of systems</div></div>
    </div>
    <div class="bars">${bars}</div>
  </div>
  <p class="lead">${esc(report.verdictProse)}</p>
  <ul class="bullets">${report.summaryBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>

  <h2>Bottleneck deep-dive</h2>
  ${bottlenecks || '<p class="muted">No bottlenecks detected — your components are well matched.</p>'}

  <h2>Your games at ${esc(res)}</h2>
  <table class="games">
    <thead><tr><th>Game</th><th class="num">Now</th><th>Feel</th><th class="num">Top upgrade</th></tr></thead>
    <tbody>${gamesRows || '<tr><td colspan="4" class="muted">No games selected.</td></tr>'}</tbody>
  </table>
  <div class="muted" style="font-size:12px;margin-top:8px">Estimated average FPS at High settings from our hardware + benchmark database. Real numbers vary with settings and scene.</div>

  <h2>Upgrade ladder</h2>
  <div class="ladder">${ladder}</div>

  <h2>Order of operations</h2>
  <ol class="ops">${ops}</ol>

  ${freeWins ? `<h2>Free wins (do these first)</h2><ul class="recs">${freeWins}</ul>` : ""}
  ${cheap ? `<h2>Cheap fixes</h2><ul class="recs">${cheap}</ul>` : ""}

  ${compat ? `<h2>Compatibility notes</h2><ul class="compat">${compat}</ul>` : ""}

  <footer>
    <p><b>How this was built:</b> deterministic analysis from a hardware + game-benchmark database (~80 CPUs, ~85 GPUs, 20 games). No AI guesswork — the same specs always produce the same report. FPS figures are estimates, not measured benchmarks.</p>
    <p>Some upgrade links on pcbottleneck.buildkit.store are affiliate links; buying through them supports the tool at no cost to you. This report was purchased and is private to you — the link is unguessable, not indexed.</p>
    <p class="mono">© pcbottleneck.buildkit.store · PC Bottleneck Analyzer</p>
  </footer>
</div>
</body>
</html>`;
}
