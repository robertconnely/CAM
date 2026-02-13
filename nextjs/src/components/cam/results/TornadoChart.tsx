"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SensitivityResult } from "@/lib/financial";

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  const formatted =
    abs >= 1e6
      ? "$" + (abs / 1e6).toFixed(1) + "M"
      : abs >= 1e3
        ? "$" + (abs / 1e3).toFixed(0) + "K"
        : "$" + abs.toFixed(0);
  return n === 0 ? "$0" : sign + formatted;
}

interface TornadoChartProps {
  sensitivity: SensitivityResult;
}

export default function TornadoChart({ sensitivity }: TornadoChartProps) {
  const chartData = sensitivity.bars.map((bar) => {
    // Ensure downside is always the left (negative) bar
    // and upside is always the right (positive) bar
    const minDelta = Math.min(bar.low_delta, bar.high_delta);
    const maxDelta = Math.max(bar.low_delta, bar.high_delta);
    return {
      label: bar.label,
      downside: minDelta,
      upside: maxDelta,
    };
  });

  const chartHeight = chartData.length * 56 + 60;

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "var(--zelis-red, #E61E2D)",
            }}
          />
          <span style={{ fontSize: 12, color: "#797279" }}>
            NPV decrease (-20%)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "var(--zelis-blue-purple, #5F5FC3)",
            }}
          />
          <span style={{ fontSize: 12, color: "#797279" }}>
            NPV increase (+20%)
          </span>
        </div>
      </div>

      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 40, left: 8, bottom: 8 }}
            barGap={-4}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#797279" }}
              tickFormatter={(v) => formatCurrency(v)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fontSize: 12, fill: "#23004B", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                name === "downside" ? "NPV decrease" : "NPV increase",
              ]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #ECE9FF",
              }}
            />
            <ReferenceLine
              x={0}
              stroke="var(--zelis-dark, #23004B)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <Bar dataKey="downside" barSize={18} radius={[4, 0, 0, 4]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`down-${index}`}
                  fill="var(--zelis-red, #E61E2D)"
                />
              ))}
            </Bar>
            <Bar dataKey="upside" barSize={18} radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`up-${index}`}
                  fill="var(--zelis-blue-purple, #5F5FC3)"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
