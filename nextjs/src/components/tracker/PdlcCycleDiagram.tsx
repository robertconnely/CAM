"use client";

import { useState } from "react";
import type { PdlcPhase } from "@/lib/types/database";

interface PdlcCycleDiagramProps {
  phases: PdlcPhase[];
}

export const PHASE_COLORS = [
  "#321478", // Ideation (Ink Shade 1)
  "#41329B", // Business Validation (Ink Shade 2)
  "#5F5FC3", // Product Requirements (Ink Shade 3)
  "#320FFF", // Design & Development (Bright Blue)
  "#828CE1", // Marketing Strategy (Ink Shade 4)
  "#23004B", // UAT & QA/QC Testing (Ink Blue Primary)
  "#E61E2D", // Launch (Red)
  "#FFBE00", // Optimize & Support (Gold)
];

export const PHASE_ICONS = [
  "💡", // Ideation
  "✅", // Business Validation
  "📋", // Product Requirements
  "🎨", // Design & Development
  "📣", // Marketing Strategy
  "🧪", // UAT & QA/QC Testing
  "🚀", // Launch
  "📊", // Optimize & Support
];

export function PdlcCycleDiagram({ phases }: PdlcCycleDiagramProps) {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  const cx = 260;
  const cy = 260;
  const radius = 190;
  const nodeRadius = 38;
  const count = sorted.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* SVG Cycle Diagram */}
      <div
        style={{
          position: "relative",
          width: 520,
          height: 520,
          maxWidth: "100%",
        }}
      >
        <svg
          viewBox="0 0 520 520"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Background circle path */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--zelis-ice)"
            strokeWidth="3"
            strokeDasharray="8 4"
            opacity={0.6}
          />

          {/* Arrow connections between nodes */}
          {sorted.map((_, i) => {
            const angleFrom = (i / count) * Math.PI * 2 - Math.PI / 2;
            const angleTo = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2;

            const gap = 0.06; // rad gap from node edge
            const aFrom = angleFrom + gap;
            const aTo = angleTo - gap;

            const x1 = cx + radius * Math.cos(aFrom);
            const y1 = cy + radius * Math.sin(aFrom);
            const x2 = cx + radius * Math.cos(aTo);
            const y2 = cy + radius * Math.sin(aTo);

            const largeArc = aTo - aFrom > Math.PI ? 1 : 0;

            return (
              <path
                key={`arrow-${i}`}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={PHASE_COLORS[i % PHASE_COLORS.length]}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={activePhase !== null && activePhase !== i ? 0.15 : 0.5}
                style={{ transition: "opacity 0.3s" }}
              />
            );
          })}

          {/* Center text */}
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill="var(--zelis-purple)"
            fontSize="15"
            fontWeight="800"
            fontFamily="'Nunito Sans', sans-serif"
          >
            PDLC
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="var(--zelis-blue-purple)"
            fontSize="10"
            fontWeight="600"
            fontFamily="'Nunito Sans', sans-serif"
          >
            Product Development
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fill="var(--zelis-blue-purple)"
            fontSize="10"
            fontWeight="600"
            fontFamily="'Nunito Sans', sans-serif"
          >
            Lifecycle
          </text>

          {/* Phase nodes */}
          {sorted.map((phase, i) => {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const color = PHASE_COLORS[i % PHASE_COLORS.length];
            const isActive = activePhase === i;

            // Label position outside the circle
            const labelRadius = radius + nodeRadius + 14;
            const lx = cx + labelRadius * Math.cos(angle);
            const ly = cy + labelRadius * Math.sin(angle);
            const isRight = Math.cos(angle) > 0.1;
            const isLeft = Math.cos(angle) < -0.1;
            const textAnchor = isRight
              ? "start"
              : isLeft
                ? "end"
                : "middle";

            return (
              <g
                key={phase.id}
                onMouseEnter={() => setActivePhase(i)}
                onMouseLeave={() => setActivePhase(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow */}
                {isActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius + 6}
                    fill={color}
                    opacity={0.15}
                    style={{ transition: "opacity 0.3s" }}
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill={isActive ? color : "white"}
                  stroke={color}
                  strokeWidth={isActive ? "3" : "2.5"}
                  style={{ transition: "all 0.25s ease" }}
                />
                {/* Phase number */}
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  fill={isActive ? "white" : color}
                  fontSize="18"
                  fontWeight="800"
                  fontFamily="'Nunito Sans', sans-serif"
                  style={{ transition: "fill 0.25s", pointerEvents: "none" }}
                >
                  {PHASE_ICONS[i]}
                </text>
                {/* Short label inside node */}
                <text
                  x={x}
                  y={y + 14}
                  textAnchor="middle"
                  fill={isActive ? "rgba(255,255,255,0.9)" : color}
                  fontSize="7"
                  fontWeight="700"
                  fontFamily="'Nunito Sans', sans-serif"
                  style={{ transition: "fill 0.25s", pointerEvents: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}
                >
                  {`PHASE ${i + 1}`}
                </text>
                {/* Label outside */}
                <text
                  x={lx}
                  y={ly + 1}
                  textAnchor={textAnchor}
                  fill={isActive ? color : "var(--zelis-dark-gray)"}
                  fontSize="10.5"
                  fontWeight={isActive ? "800" : "600"}
                  fontFamily="'Nunito Sans', sans-serif"
                  style={{ transition: "all 0.25s", pointerEvents: "none" }}
                >
                  {phase.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail card below (shows on hover) */}
      <div
        style={{
          minHeight: 120,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {activePhase !== null ? (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: "12px",
              background: "white",
              border: `2px solid ${PHASE_COLORS[activePhase]}25`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>
                {PHASE_ICONS[activePhase]}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: PHASE_COLORS[activePhase],
                }}
              >
                Phase {activePhase + 1}: {sorted[activePhase].label}
              </h3>
            </div>
            <p
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.85rem",
                color: "var(--zelis-dark-gray)",
                lineHeight: 1.6,
              }}
            >
              {sorted[activePhase].description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                fontSize: "0.78rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    color: PHASE_COLORS[activePhase],
                    textTransform: "uppercase",
                    fontSize: "0.68rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  Gate Criteria
                </span>
                <div
                  style={{
                    color: "var(--zelis-dark-gray)",
                    marginTop: "0.15rem",
                  }}
                >
                  {sorted[activePhase].gate_description || "—"}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: PHASE_COLORS[activePhase],
                    textTransform: "uppercase",
                    fontSize: "0.68rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  Duration
                </span>
                <div
                  style={{
                    color: "var(--zelis-dark-gray)",
                    marginTop: "0.15rem",
                    fontWeight: 600,
                  }}
                >
                  {sorted[activePhase].typical_duration || "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              background: "var(--zelis-ice)",
              textAlign: "center",
              border: "2px dashed var(--zelis-blue-purple)25",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--zelis-blue-purple)",
                fontWeight: 500,
              }}
            >
              Hover over a phase to see details about each stage of the Product Development Lifecycle.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
