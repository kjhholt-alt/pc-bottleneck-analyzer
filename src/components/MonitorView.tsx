"use client";

import { motion } from "framer-motion";
import {
  Play,
  Square,
  Activity,
  Thermometer,
  Cpu,
  MemoryStick,
  MonitorCog,
  Gauge,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useMonitor,
  type MonitorSnapshot,
  type MonitorStatus,
} from "@/hooks/useMonitor";

function StatusIndicator({ status }: { status: MonitorStatus }) {
  const config: Record<
    MonitorStatus,
    { color: string; label: string; pulse: boolean }
  > = {
    idle: { color: "var(--text-secondary)", label: "Ready", pulse: false },
    waiting: { color: "var(--amber)", label: "Waiting for scanner...", pulse: true },
    live: { color: "var(--green)", label: "Live — receiving data", pulse: true },
    error: { color: "var(--red)", label: "Error", pulse: false },
    stopped: { color: "var(--red)", label: "Scanner stopped", pulse: false },
  };

  const { color, label, pulse } = config[status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: color }}
        />
      </span>
      <span className="text-xs font-mono text-text-secondary">{label}</span>
    </div>
  );
}

function getTempColor(temp: number | null): string {
  if (temp === null) return "var(--text-secondary)";
  if (temp >= 85) return "var(--red)";
  if (temp >= 70) return "var(--amber)";
  return "var(--green)";
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  progress,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  color?: string;
  progress?: number;
  delta?: number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-text-secondary" />
        <span className="text-xs text-text-secondary font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span
          className="text-2xl font-bold font-mono tabular-nums"
          style={{ color: color ?? "var(--foreground)" }}
        >
          {value}
        </span>
        <span className="text-sm text-text-secondary mb-0.5">{unit}</span>
        {delta != null && delta !== 0 && (
          <span
            className={`text-xs font-mono mb-0.5 ml-auto ${
              delta > 0 ? "text-red" : "text-green"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        )}
      </div>
      {progress != null && (
        <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: color ?? "var(--cyan)",
            }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(timestamp: number, referenceTime: number): string {
  const diff = Math.round((referenceTime - timestamp) / 1000);
  if (diff < 5) return "now";
  if (diff < 60) return `${diff}s`;
  return `${Math.floor(diff / 60)}m${diff % 60}s`;
}

function TrendChart({
  data,
  title,
  lines,
}: {
  data: { time: string; [key: string]: number | string }[];
  title: string;
  lines: { key: string; color: string; label: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            {lines.map((line) => (
              <linearGradient
                key={line.key}
                id={`gradient-${line.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="line"
          />
          {lines.map((line) => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              fill={`url(#gradient-${line.key})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonitorView() {
  const { status, latest, history, error, snapshotCount, maxSnapshots, start, stop } =
    useMonitor();

  const isActive = status === "waiting" || status === "live";

  // Compute deltas (compare latest to 10 snapshots ago = ~30s)
  const deltaRef =
    history.length > 10 ? history[history.length - 11] : null;

  function getDelta(
    getter: (s: MonitorSnapshot) => number | null,
  ): number | null {
    if (!latest || !deltaRef) return null;
    const a = getter(deltaRef);
    const b = getter(latest);
    if (a === null || b === null) return null;
    return b - a;
  }

  // Build chart data
  const now = Date.now();
  const chartData = history.map((snap) => ({
    time: formatTime(snap.timestamp, now),
    "CPU Temp": snap.cpu.temp ?? 0,
    "GPU Temp": snap.gpu.temp ?? 0,
    "CPU %": snap.cpu.usage,
    "GPU %": snap.gpu.usage,
    "RAM %": Math.round((snap.ram.usedGb / snap.ram.totalGb) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <StatusIndicator status={status} />
          {snapshotCount > 0 && (
            <span className="text-xs font-mono text-text-secondary">
              {snapshotCount}/{maxSnapshots} snapshots
            </span>
          )}
        </div>
        <button
          onClick={isActive ? stop : start}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? "bg-red/15 text-red hover:bg-red/25 border border-red/30"
              : "bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/30"
          }`}
        >
          {isActive ? (
            <>
              <Square className="w-4 h-4" />
              Stop Monitoring
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Monitoring
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {/* Live Stats Grid */}
      {latest ? (
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatCard
            icon={Thermometer}
            label="CPU Temp"
            value={latest.cpu.temp !== null ? `${latest.cpu.temp}` : "N/A"}
            unit="°C"
            color={getTempColor(latest.cpu.temp)}
            delta={getDelta((s) => s.cpu.temp)}
          />
          <StatCard
            icon={Cpu}
            label="CPU Usage"
            value={`${latest.cpu.usage}`}
            unit="%"
            progress={latest.cpu.usage}
            color={
              latest.cpu.usage > 90
                ? "var(--red)"
                : latest.cpu.usage > 70
                  ? "var(--amber)"
                  : "var(--cyan)"
            }
            delta={getDelta((s) => s.cpu.usage)}
          />
          <StatCard
            icon={Thermometer}
            label="GPU Temp"
            value={latest.gpu.temp !== null ? `${latest.gpu.temp}` : "N/A"}
            unit="°C"
            color={getTempColor(latest.gpu.temp)}
            delta={getDelta((s) => s.gpu.temp)}
          />
          <StatCard
            icon={Gauge}
            label="GPU Usage"
            value={`${latest.gpu.usage}`}
            unit="%"
            progress={latest.gpu.usage}
            color={
              latest.gpu.usage > 95
                ? "var(--green)"
                : latest.gpu.usage > 70
                  ? "var(--amber)"
                  : "var(--text-secondary)"
            }
            delta={getDelta((s) => s.gpu.usage)}
          />
          <StatCard
            icon={MemoryStick}
            label="RAM Usage"
            value={`${latest.ram.usedGb.toFixed(1)}`}
            unit={`/ ${latest.ram.totalGb} GB`}
            progress={(latest.ram.usedGb / latest.ram.totalGb) * 100}
            color={
              latest.ram.usedGb / latest.ram.totalGb > 0.85
                ? "var(--red)"
                : "var(--cyan)"
            }
            delta={getDelta((s) => s.ram.usedGb)}
          />
          <StatCard
            icon={MonitorCog}
            label="GPU VRAM"
            value={`${latest.gpu.vramUsed.toFixed(1)}`}
            unit={`/ ${latest.gpu.vramTotal} GB`}
            progress={(latest.gpu.vramUsed / latest.gpu.vramTotal) * 100}
            color={
              latest.gpu.vramUsed / latest.gpu.vramTotal > 0.9
                ? "var(--red)"
                : "var(--cyan)"
            }
            delta={getDelta((s) => s.gpu.vramUsed)}
          />
        </motion.div>
      ) : (
        !isActive && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Activity className="w-12 h-12 text-text-secondary/30 mb-4" />
            <p className="text-text-secondary font-medium">
              Real-time hardware monitoring
            </p>
            <p className="text-text-secondary/60 text-sm mt-1 max-w-sm">
              Start monitoring to see live CPU, GPU, and RAM stats. Run the
              scanner in <code className="text-cyan">--monitor</code> mode for
              continuous updates.
            </p>
          </div>
        )
      )}

      {/* Trend Charts */}
      {chartData.length > 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={chartData}
            title="Temperature"
            lines={[
              { key: "CPU Temp", color: "var(--amber)", label: "CPU" },
              { key: "GPU Temp", color: "var(--red)", label: "GPU" },
            ]}
          />
          <TrendChart
            data={chartData}
            title="Utilization"
            lines={[
              { key: "CPU %", color: "var(--cyan)", label: "CPU" },
              { key: "GPU %", color: "var(--green)", label: "GPU" },
              { key: "RAM %", color: "var(--amber)", label: "RAM" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
