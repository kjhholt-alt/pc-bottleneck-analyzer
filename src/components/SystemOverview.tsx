"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Laptop,
} from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";
import { HardwareCard } from "./HardwareCard";
import type { SystemScan, PerformanceScore } from "@/lib/types";

interface SystemOverviewProps {
  scan: SystemScan;
  score: PerformanceScore;
}

function tempStatus(temp: number | null): "good" | "warning" | "critical" | undefined {
  if (temp === null) return undefined;
  if (temp < 70) return "good";
  if (temp < 85) return "warning";
  return "critical";
}

function formatTemp(temp: number | null): string {
  if (temp === null) return "N/A";
  return `${temp}°C`;
}

function formatCache(kb: number | null): string {
  if (kb === null) return "N/A";
  if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
  return `${kb} KB`;
}

export function SystemOverview({ scan, score }: SystemOverviewProps) {
  const bootDrive = scan.storage.find((s) => s.is_boot_drive) ?? scan.storage[0];

  const cards = [
    {
      title: "CPU",
      icon: <Cpu size={20} />,
      model: scan.cpu.model_name,
      specs: [
        {
          label: "Cores",
          value: `${scan.cpu.physical_cores}C / ${scan.cpu.logical_cores}T`,
        },
        {
          label: "Clock",
          value: `${scan.cpu.current_clock_ghz} / ${scan.cpu.max_boost_clock_ghz} GHz`,
        },
        {
          label: "L3 Cache",
          value: formatCache(scan.cpu.cache_l3),
        },
        {
          label: "Temp",
          value: formatTemp(scan.cpu.current_temp_c),
          status: tempStatus(scan.cpu.current_temp_c),
        },
        ...(scan.cpu.power_draw_w !== null
          ? [{ label: "Power", value: `${scan.cpu.power_draw_w}W` }]
          : []),
      ],
    },
    {
      title: "GPU",
      icon: <Monitor size={20} />,
      model: scan.gpu.model_name,
      specs: [
        {
          label: "VRAM",
          value: `${scan.gpu.vram_used_gb} / ${scan.gpu.vram_total_gb} GB`,
        },
        {
          label: "Core Clock",
          value: `${scan.gpu.gpu_clock_mhz} MHz`,
        },
        {
          label: "Utilization",
          value: `${scan.gpu.gpu_utilization_pct}%`,
          status: scan.gpu.gpu_utilization_pct > 95 ? ("warning" as const) : undefined,
        },
        {
          label: "Temp",
          value: formatTemp(scan.gpu.current_temp_c),
          status: tempStatus(scan.gpu.current_temp_c),
        },
        {
          label: "Driver",
          value: scan.gpu.driver_version,
        },
      ],
    },
    {
      title: "RAM",
      icon: <MemoryStick size={20} />,
      model: `${scan.ram.total_gb} GB ${scan.ram.form_factor}`,
      specs: [
        {
          label: "Speed",
          value: `${scan.ram.speed_mhz} MHz`,
        },
        {
          label: "Config",
          value: `${scan.ram.num_sticks}x stick, ${scan.ram.channel_mode} channel`,
        },
        {
          label: "Usage",
          value: `${scan.ram.current_used_gb} / ${scan.ram.total_gb} GB (${scan.ram.usage_percent}%)`,
        },
        ...(scan.ram.timings
          ? [{ label: "Timings", value: scan.ram.timings }]
          : []),
      ],
    },
    ...(bootDrive
      ? [
          {
            title: "Storage",
            icon: <HardDrive size={20} />,
            model: bootDrive.model,
            specs: [
              { label: "Type", value: bootDrive.type },
              { label: "Interface", value: bootDrive.interface },
              {
                label: "Capacity",
                value: `${bootDrive.used_gb} / ${bootDrive.capacity_gb} GB`,
              },
              {
                label: "Free",
                value: `${bootDrive.free_gb} GB`,
                status:
                  bootDrive.free_gb < 50
                    ? ("critical" as const)
                    : bootDrive.free_gb < 100
                      ? ("warning" as const)
                      : ("good" as const),
              },
              ...(bootDrive.health_status
                ? [{ label: "Health", value: bootDrive.health_status }]
                : []),
            ],
          },
        ]
      : []),
    {
      title: "Motherboard",
      icon: <CircuitBoard size={20} />,
      model: scan.motherboard.model,
      specs: [
        ...(scan.motherboard.chipset
          ? [{ label: "Chipset", value: scan.motherboard.chipset }]
          : []),
        { label: "BIOS", value: scan.motherboard.bios_version },
        ...(scan.motherboard.bios_date
          ? [{ label: "BIOS Date", value: scan.motherboard.bios_date }]
          : []),
      ],
    },
    {
      title: "OS",
      icon: <Laptop size={20} />,
      model: scan.os.windows_version,
      specs: [
        { label: "Build", value: scan.os.build_number },
        { label: "Power Plan", value: scan.os.power_plan },
        ...(scan.os.game_mode !== null
          ? [
              {
                label: "Game Mode",
                value: scan.os.game_mode ? "Enabled" : "Disabled",
                status: scan.os.game_mode ? ("good" as const) : undefined,
              },
            ]
          : []),
        ...(scan.os.hw_accelerated_gpu_scheduling !== null
          ? [
              {
                label: "HAGS",
                value: scan.os.hw_accelerated_gpu_scheduling
                  ? "Enabled"
                  : "Disabled",
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Score gauge */}
      <motion.div
        className="flex justify-center py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ScoreGauge score={score} />
      </motion.div>

      {/* Score breakdown bar */}
      <motion.div
        className="bg-surface border border-border rounded-2xl p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Score Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(score.breakdown).map(([key, value]) => {
            // Each sub-score has a different max, so compute percentage
            const maxScores: Record<string, number> = {
              cpu: 25,
              gpu: 25,
              ram: 20,
              storage: 15,
              settings: 15,
            };
            const max = maxScores[key] ?? 25;
            const pct = Math.round((value / max) * 100);

            return (
              <div key={key} className="text-center">
                <div className="text-xs text-text-secondary uppercase mb-1">
                  {key}
                </div>
                <div
                  className="text-lg font-bold font-mono"
                  style={{
                    color:
                      pct >= 75
                        ? "var(--green)"
                        : pct >= 50
                          ? "var(--amber)"
                          : "var(--red)",
                  }}
                >
                  {value}/{max}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Hardware cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <HardwareCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            model={card.model}
            specs={card.specs}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
