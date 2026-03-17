"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Cpu, Gpu, MemoryStick, TrendingUp, X, Plus } from "lucide-react";
import {
  comparisonCPUs,
  comparisonGPUs,
  ramSpeedData,
} from "@/data/comparison-data";

type ComparisonMode = "cpu" | "gpu" | "ram";

interface ComparisonChartProps {
  defaultMode?: ComparisonMode;
  className?: string;
}

export function ComparisonChart({
  defaultMode = "gpu",
  className = "",
}: ComparisonChartProps) {
  const [mode, setMode] = useState<ComparisonMode>(defaultMode);
  const [selectedCPUs, setSelectedCPUs] = useState<string[]>([
    "ryzen-7-9800x3d",
    "i9-14900k",
  ]);
  const [selectedGPUs, setSelectedGPUs] = useState<string[]>([
    "rtx-5090",
    "rtx-4090",
  ]);
  const [selectedRAMSpeeds, setSelectedRAMSpeeds] = useState<number[]>([
    3200, 4800, 6400,
  ]);

  const toggleCPU = (id: string) => {
    setSelectedCPUs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cpuId) => cpuId !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleGPU = (id: string) => {
    setSelectedGPUs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((gpuId) => gpuId !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleRAMSpeed = (speed: number) => {
    setSelectedRAMSpeeds((prev) => {
      if (prev.includes(speed)) {
        return prev.filter((s) => s !== speed);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, speed];
    });
  };

  // Prepare chart data based on mode
  const chartData =
    mode === "cpu"
      ? selectedCPUs
          .map((id) => comparisonCPUs.find((cpu) => cpu.id === id))
          .filter(Boolean)
          .map((cpu) => ({
            name: cpu!.name.replace(/AMD |Intel Core |Ryzen /g, ""),
            "Gaming Score": cpu!.gaming_score,
            "Single Thread": cpu!.single_thread_score,
            "Multi Thread": cpu!.multi_thread_score,
            Price: cpu!.price,
          }))
      : mode === "gpu"
        ? selectedGPUs
            .map((id) => comparisonGPUs.find((gpu) => gpu.id === id))
            .filter(Boolean)
            .map((gpu) => ({
              name: gpu!.name.replace(/NVIDIA |AMD |Intel /g, ""),
              "Gaming Score": gpu!.gaming_score,
              "1080p": gpu!.performance_1080p,
              "1440p": gpu!.performance_1440p,
              "4K": gpu!.performance_4k,
              Price: gpu!.price,
            }))
        : selectedRAMSpeeds
            .map((speed) => ramSpeedData.find((ram) => ram.speed_mhz === speed))
            .filter(Boolean)
            .map((ram) => ({
              name: `DDR4-${ram!.speed_mhz}`,
              "FPS Impact %": ram!.gaming_fps_impact,
              "Latency (ns)": ram!.latency_ns,
              "Price/16GB": ram!.price_per_16gb,
            }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode Selector */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setMode("cpu")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            mode === "cpu"
              ? "bg-cyan-dim border-cyan text-cyan"
              : "bg-surface border-border text-text-secondary hover:border-cyan/40"
          }`}
        >
          <Cpu size={18} />
          <span className="font-semibold text-sm">CPU Comparison</span>
        </button>
        <button
          onClick={() => setMode("gpu")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            mode === "gpu"
              ? "bg-cyan-dim border-cyan text-cyan"
              : "bg-surface border-border text-text-secondary hover:border-cyan/40"
          }`}
        >
          <Gpu size={18} />
          <span className="font-semibold text-sm">GPU Comparison</span>
        </button>
        <button
          onClick={() => setMode("ram")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            mode === "ram"
              ? "bg-cyan-dim border-cyan text-cyan"
              : "bg-surface border-border text-text-secondary hover:border-cyan/40"
          }`}
        >
          <MemoryStick size={18} />
          <span className="font-semibold text-sm">RAM Speed Impact</span>
        </button>
      </div>

      {/* Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan" />
          <h3 className="text-sm font-semibold text-foreground">
            Select 2-3 to Compare
          </h3>
          <span className="text-xs text-text-secondary font-mono">
            {mode === "cpu"
              ? `${selectedCPUs.length}/3`
              : mode === "gpu"
                ? `${selectedGPUs.length}/3`
                : `${selectedRAMSpeeds.length}/3`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {mode === "cpu" &&
            comparisonCPUs.slice(0, 15).map((cpu) => (
              <button
                key={cpu.id}
                onClick={() => toggleCPU(cpu.id)}
                disabled={
                  !selectedCPUs.includes(cpu.id) && selectedCPUs.length >= 3
                }
                className={`relative px-3 py-2 rounded-lg border text-left transition-all ${
                  selectedCPUs.includes(cpu.id)
                    ? "bg-cyan-dim border-cyan text-cyan"
                    : "bg-surface border-border text-text-secondary hover:border-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                <div className="text-xs font-semibold truncate">
                  {cpu.name.replace(/AMD |Intel Core |Ryzen /g, "")}
                </div>
                <div className="text-xs opacity-70 mt-0.5">${cpu.price}</div>
                {selectedCPUs.includes(cpu.id) && (
                  <div className="absolute -top-1 -right-1 bg-cyan rounded-full p-0.5">
                    <X size={10} className="text-background" />
                  </div>
                )}
              </button>
            ))}

          {mode === "gpu" &&
            comparisonGPUs.slice(0, 15).map((gpu) => (
              <button
                key={gpu.id}
                onClick={() => toggleGPU(gpu.id)}
                disabled={
                  !selectedGPUs.includes(gpu.id) && selectedGPUs.length >= 3
                }
                className={`relative px-3 py-2 rounded-lg border text-left transition-all ${
                  selectedGPUs.includes(gpu.id)
                    ? "bg-cyan-dim border-cyan text-cyan"
                    : "bg-surface border-border text-text-secondary hover:border-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                <div className="text-xs font-semibold truncate">
                  {gpu.name.replace(/NVIDIA |AMD |Intel /g, "")}
                </div>
                <div className="text-xs opacity-70 mt-0.5">${gpu.price}</div>
                {selectedGPUs.includes(gpu.id) && (
                  <div className="absolute -top-1 -right-1 bg-cyan rounded-full p-0.5">
                    <X size={10} className="text-background" />
                  </div>
                )}
              </button>
            ))}

          {mode === "ram" &&
            ramSpeedData.map((ram) => (
              <button
                key={ram.speed_mhz}
                onClick={() => toggleRAMSpeed(ram.speed_mhz)}
                disabled={
                  !selectedRAMSpeeds.includes(ram.speed_mhz) &&
                  selectedRAMSpeeds.length >= 3
                }
                className={`relative px-3 py-2 rounded-lg border text-left transition-all ${
                  selectedRAMSpeeds.includes(ram.speed_mhz)
                    ? "bg-cyan-dim border-cyan text-cyan"
                    : "bg-surface border-border text-text-secondary hover:border-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                <div className="text-xs font-semibold">
                  DDR4-{ram.speed_mhz}
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  +{ram.gaming_fps_impact}% FPS
                </div>
                {selectedRAMSpeeds.includes(ram.speed_mhz) && (
                  <div className="absolute -top-1 -right-1 bg-cyan rounded-full p-0.5">
                    <X size={10} className="text-background" />
                  </div>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100, 116, 139, 0.1)"
              />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
                verticalAlign="top"
              />

              {mode === "cpu" && (
                <>
                  <Bar dataKey="Gaming Score" fill="#22d1ee" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Single Thread"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Multi Thread"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}

              {mode === "gpu" && (
                <>
                  <Bar dataKey="Gaming Score" fill="#22d1ee" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="1080p" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="1440p" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="4K" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </>
              )}

              {mode === "ram" && (
                <>
                  <Bar
                    dataKey="FPS Impact %"
                    fill="#22d1ee"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Latency (ns)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Price/16GB"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>

          {/* Value Analysis */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Value Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mode === "cpu" &&
                selectedCPUs
                  .map((id) => comparisonCPUs.find((cpu) => cpu.id === id))
                  .filter(Boolean)
                  .map((cpu) => {
                    const valueScore = (
                      cpu!.gaming_score / cpu!.price
                    ).toFixed(3);
                    return (
                      <div
                        key={cpu!.id}
                        className="bg-background rounded-lg p-3 border border-border"
                      >
                        <div className="text-xs font-semibold text-cyan truncate">
                          {cpu!.name.replace(/AMD |Intel Core |Ryzen /g, "")}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold text-foreground">
                            {valueScore}
                          </span>
                          <span className="text-xs text-text-secondary">
                            score/$
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {cpu!.cores}C/{cpu!.threads}T • {cpu!.tdp_w}W
                        </div>
                      </div>
                    );
                  })}

              {mode === "gpu" &&
                selectedGPUs
                  .map((id) => comparisonGPUs.find((gpu) => gpu.id === id))
                  .filter(Boolean)
                  .map((gpu) => {
                    const valueScore = (
                      gpu!.gaming_score / gpu!.price
                    ).toFixed(3);
                    return (
                      <div
                        key={gpu!.id}
                        className="bg-background rounded-lg p-3 border border-border"
                      >
                        <div className="text-xs font-semibold text-cyan truncate">
                          {gpu!.name.replace(/NVIDIA |AMD |Intel /g, "")}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold text-foreground">
                            {valueScore}
                          </span>
                          <span className="text-xs text-text-secondary">
                            score/$
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {gpu!.vram_gb}GB VRAM • {gpu!.tdp_w}W
                        </div>
                      </div>
                    );
                  })}

              {mode === "ram" &&
                selectedRAMSpeeds
                  .map((speed) =>
                    ramSpeedData.find((ram) => ram.speed_mhz === speed),
                  )
                  .filter(Boolean)
                  .map((ram) => {
                    const valueScore = (
                      ram!.gaming_fps_impact / ram!.price_per_16gb
                    ).toFixed(3);
                    return (
                      <div
                        key={ram!.speed_mhz}
                        className="bg-background rounded-lg p-3 border border-border"
                      >
                        <div className="text-xs font-semibold text-cyan">
                          DDR4-{ram!.speed_mhz}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold text-foreground">
                            {valueScore}
                          </span>
                          <span className="text-xs text-text-secondary">
                            FPS%/$
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {ram!.latency_ns}ns latency
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </motion.div>
      )}

      {chartData.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <Plus size={32} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary text-sm">
            Select 2-3 components above to compare
          </p>
        </div>
      )}
    </div>
  );
}
