"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
}

export function ViewsOverTime({ data }: { data: DailyPoint[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cyan, #22d3ee)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-cyan, #22d3ee)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={24}
          />
          <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--color-cyan, #22d3ee)"
            strokeWidth={2}
            fill="url(#vGrad)"
            name="Views"
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={1.5}
            fill="transparent"
            name="Visitors"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
