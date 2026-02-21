import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SystemScan, AnalysisResult } from "@/lib/types";

const CYAN = [34, 209, 238] as const;
const DARK = [10, 10, 15] as const;
const GREEN = [16, 185, 129] as const;
const AMBER = [245, 158, 11] as const;
const RED = [239, 68, 68] as const;
const GRAY = [136, 136, 160] as const;

function scoreColor(score: number): readonly [number, number, number] {
  if (score >= 80) return GREEN;
  if (score >= 60) return AMBER;
  return RED;
}

function severityColor(severity: string): readonly [number, number, number] {
  switch (severity) {
    case "critical":
      return RED;
    case "warning":
      return AMBER;
    case "info":
      return CYAN;
    default:
      return GREEN;
  }
}

export function generateReport(scan: SystemScan, analysis: AnalysisResult) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Header ──
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PC Bottleneck Analyzer", 15, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("System Performance Report", 15, 25);

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(date, pageWidth - 15, 18, { align: "right" });
  doc.text(`Scan ID: ${scan.scan_id}`, pageWidth - 15, 25, { align: "right" });

  y = 50;

  // ── Score Section ──
  const color = scoreColor(analysis.score.total);

  doc.setFillColor(245, 245, 250);
  doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3, "F");

  doc.setTextColor(...color);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(`${analysis.score.total}`, 35, y + 22);

  doc.setFontSize(14);
  doc.text(`/ 100`, 60, y + 22);

  doc.setTextColor(80, 80, 100);
  doc.setFontSize(18);
  doc.text(`Grade: ${analysis.score.grade}`, 95, y + 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(analysis.score.grade_description, 95, y + 25);

  y += 42;

  // ── Score Breakdown ──
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SCORE BREAKDOWN", 15, y);
  y += 5;

  const breakdown = analysis.score.breakdown;
  const maxScores: Record<string, number> = { cpu: 25, gpu: 25, ram: 20, storage: 15, settings: 15 };
  const categories = Object.entries(breakdown);
  const barWidth = (pageWidth - 30) / categories.length - 2;

  categories.forEach(([key, value], i) => {
    const x = 15 + i * (barWidth + 2);
    const max = maxScores[key] ?? 25;
    const pct = value / max;
    const barColor = pct >= 0.8 ? GREEN : pct >= 0.6 ? AMBER : RED;

    // Background bar
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(x, y, barWidth, 6, 1, 1, "F");

    // Filled bar
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(x, y, barWidth * pct, 6, 1, 1, "F");

    // Label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 120);
    doc.text(key.toUpperCase(), x + barWidth / 2, y + 11, { align: "center" });
    doc.setTextColor(barColor[0], barColor[1], barColor[2]);
    doc.text(`${value}/${max}`, x + barWidth / 2, y + 15, { align: "center" });
  });

  y += 22;

  // ── Hardware Specs Table ──
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("HARDWARE SPECIFICATIONS", 15, y);
  y += 3;

  const bootDrive = scan.storage.find((s) => s.is_boot_drive) ?? scan.storage[0];

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: [...DARK], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [60, 60, 80] },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [["Component", "Model", "Details"]],
    body: [
      ["CPU", scan.cpu.model_name, `${scan.cpu.physical_cores}C/${scan.cpu.logical_cores}T · ${scan.cpu.max_boost_clock_ghz} GHz · ${scan.cpu.current_temp_c ?? "N/A"}°C`],
      ["GPU", scan.gpu.model_name, `${scan.gpu.vram_total_gb} GB VRAM · ${scan.gpu.gpu_clock_mhz} MHz · ${scan.gpu.current_temp_c ?? "N/A"}°C`],
      ["RAM", `${scan.ram.total_gb} GB ${scan.ram.form_factor}`, `${scan.ram.speed_mhz} MHz · ${scan.ram.channel_mode} channel · ${scan.ram.num_sticks} stick(s)`],
      ["Storage", bootDrive?.model ?? "N/A", `${bootDrive?.type ?? "N/A"} · ${bootDrive?.capacity_gb ?? 0} GB · ${bootDrive?.free_gb ?? 0} GB free`],
      ["Motherboard", scan.motherboard.model, `BIOS ${scan.motherboard.bios_version}`],
      ["OS", scan.os.windows_version, `Build ${scan.os.build_number} · ${scan.os.power_plan}`],
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable?.finalY ?? y + 50;
  y += 8;

  // ── Bottlenecks ──
  if (analysis.bottlenecks.length > 0) {
    // Check if we need a new page
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(80, 80, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`DETECTED BOTTLENECKS (${analysis.bottlenecks.length})`, 15, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      headStyles: { fillColor: [...DARK], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [60, 60, 80], cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 50 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 22 },
      },
      head: [["Severity", "Issue", "Fix", "Cost"]],
      body: analysis.bottlenecks.map((b) => [
        b.severity.toUpperCase(),
        `${b.title}\n${b.impact}`,
        b.fix,
        b.estimated_cost,
      ]),
      didParseCell(data) {
        if (data.column.index === 0 && data.section === "body") {
          const sev = String(data.cell.raw).toLowerCase();
          data.cell.styles.textColor = [...severityColor(sev)];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable?.finalY ?? y + 40;
    y += 8;
  }

  // ── Recommendations ──
  if (analysis.recommendations.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(80, 80, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("TOP RECOMMENDATIONS", 15, y);
    y += 3;

    const tierLabels: Record<string, string> = { free: "FREE", cheap: "BUDGET", upgrade: "UPGRADE" };

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      headStyles: { fillColor: [...DARK], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [60, 60, 80], cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 20 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 22 },
      },
      head: [["#", "Tier", "Recommendation", "Cost"]],
      body: analysis.recommendations.map((r, i) => [
        `${i + 1}`,
        tierLabels[r.tier] ?? r.tier,
        `${r.title}\n${r.impact}`,
        r.estimated_cost,
      ]),
      didParseCell(data) {
        if (data.column.index === 1 && data.section === "body") {
          const tier = String(data.cell.raw).toLowerCase();
          if (tier === "free") data.cell.styles.textColor = [...GREEN];
          else if (tier === "budget") data.cell.styles.textColor = [...AMBER];
          else data.cell.styles.textColor = [168, 85, 247]; // purple
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      "Generated by PC Bottleneck Analyzer · pcbottleneck.buildkit.store",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" },
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 8, {
      align: "right",
    });
  }

  // ── Save ──
  const filename = `PC-Report-${scan.cpu.model_name.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
