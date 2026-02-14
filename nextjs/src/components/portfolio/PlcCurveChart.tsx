"use client";

import { useState } from "react";
import type { PortfolioProduct, PlcStage } from "@/lib/types/database";
import { PLC_STAGE_CONFIG } from "@/components/tracker/constants";

interface PlcCurveChartProps {
  products: PortfolioProduct[];
}

// Stage boundaries along the x-axis (0-800)
const STAGES: { key: PlcStage; x0: number; x1: number }[] = [
  { key: "introduction", x0: 0, x1: 200 },
  { key: "growth", x0: 200, x1: 400 },
  { key: "maturity", x0: 400, x1: 600 },
  { key: "decline", x0: 600, x1: 800 },
];

// S-curve path — classic PLC bell shape
const CURVE_PATH =
  "M 20,350 C 80,340 140,310 200,260 C 240,230 270,180 320,120 C 370,60 400,40 440,35 C 480,30 520,35 560,50 C 600,70 640,110 680,170 C 720,230 750,290 780,340";

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

// Position products on the curve by stage
function getProductPosition(product: PortfolioProduct, index: number, total: number) {
  const stage = STAGES.find((s) => s.key === product.plc_stage)!;
  const spread = stage.x1 - stage.x0;
  // Distribute products within their stage zone
  const x = stage.x0 + spread * 0.2 + (spread * 0.6 * (index + 0.5)) / Math.max(total, 1);

  // Y position based on curve shape per stage
  const yMap: Record<PlcStage, (t: number) => number> = {
    introduction: (t) => 330 - t * 90,
    growth: (t) => 240 - t * 200,
    maturity: (t) => 40 + t * 30,
    decline: (t) => 70 + t * 260,
  };
  const t = (index + 0.5) / Math.max(total, 1);
  const y = yMap[product.plc_stage](t);

  return { x, y };
}

export function PlcCurveChart({ products }: PlcCurveChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group products by stage for positioning
  const byStage = STAGES.map((s) => ({
    ...s,
    products: products.filter((p) => p.plc_stage === s.key),
  }));

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox="0 0 800 400"
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Stage zone backgrounds */}
        {STAGES.map((s) => {
          const cfg = PLC_STAGE_CONFIG[s.key];
          return (
            <rect
              key={s.key}
              x={s.x0}
              y={0}
              width={s.x1 - s.x0}
              height={400}
              fill={cfg.bg}
              opacity={0.4}
            />
          );
        })}

        {/* Vertical dividers */}
        {[200, 400, 600].map((x) => (
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={400}
            stroke="#B4B4B9"
            strokeWidth={1}
            strokeDasharray="6,4"
            opacity={0.5}
          />
        ))}

        {/* Stage labels at top */}
        {STAGES.map((s) => {
          const cfg = PLC_STAGE_CONFIG[s.key];
          const cx = (s.x0 + s.x1) / 2;
          return (
            <text
              key={s.key}
              x={cx}
              y={22}
              textAnchor="middle"
              fill={cfg.color}
              fontSize={13}
              fontWeight={700}
              fontFamily="'Nunito Sans', sans-serif"
            >
              {cfg.label}
            </text>
          );
        })}

        {/* PLC Curve */}
        <path
          d={CURVE_PATH}
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#23004B" />
            <stop offset="30%" stopColor="#FFBE00" />
            <stop offset="55%" stopColor="#320FFF" />
            <stop offset="100%" stopColor="#B4B4B9" />
          </linearGradient>
        </defs>

        {/* Axis labels */}
        <text
          x={400}
          y={390}
          textAnchor="middle"
          fill="#B4B4B9"
          fontSize={11}
          fontWeight={600}
          fontFamily="'Nunito Sans', sans-serif"
          letterSpacing="0.1em"
        >
          TIME
        </text>
        <text
          x={12}
          y={200}
          textAnchor="middle"
          fill="#B4B4B9"
          fontSize={11}
          fontWeight={600}
          fontFamily="'Nunito Sans', sans-serif"
          letterSpacing="0.1em"
          transform="rotate(-90, 12, 200)"
        >
          REVENUE
        </text>

        {/* Product dots */}
        {byStage.map((sg) =>
          sg.products.map((product, i) => {
            const pos = getProductPosition(product, i, sg.products.length);
            const cfg = PLC_STAGE_CONFIG[product.plc_stage];
            const isHovered = hoveredId === product.id;

            return (
              <g
                key={product.id}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer glow on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={14}
                    fill={cfg.color}
                    opacity={0.15}
                  />
                )}
                {/* Dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 8 : 6}
                  fill={cfg.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ transition: "r 0.15s ease" }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={pos.x - 90}
                      y={pos.y - 68}
                      width={180}
                      height={52}
                      rx={6}
                      fill="#23004B"
                      opacity={0.95}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 48}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={11}
                      fontWeight={700}
                      fontFamily="'Nunito Sans', sans-serif"
                    >
                      {product.name.length > 26
                        ? product.name.slice(0, 24) + "..."
                        : product.name}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y - 30}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.7)"
                      fontSize={10}
                      fontFamily="'Nunito Sans', sans-serif"
                    >
                      {product.annual_recurring_revenue
                        ? `ARR: ${formatCurrency(product.annual_recurring_revenue)}`
                        : "ARR: —"}
                      {product.revenue_growth_rate != null
                        ? `  |  Growth: ${product.revenue_growth_rate > 0 ? "+" : ""}${product.revenue_growth_rate}%`
                        : ""}
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
