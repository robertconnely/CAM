"use client";

import { useState } from "react";
import type { PdlcPhase } from "@/lib/types/database";
import { PHASE_COLORS, PHASE_ICONS } from "./PdlcCycleDiagram";

interface PdlcFlowDiagramProps {
  phases: PdlcPhase[];
}

const MACRO_STAGES = [
  { name: "Strategy", color: "#321478", light: "#ECE9FF", phases: [0, 1] },
  { name: "Build", color: "#41329B", light: "#F7F6FF", phases: [2, 3] },
  { name: "Prepare", color: "#5F5FC3", light: "#ECE9FF", phases: [4, 5] },
  { name: "Launch", color: "#320FFF", light: "#F7F6FF", phases: [6, 7] },
];

export function PdlcFlowDiagram({ phases }: PdlcFlowDiagramProps) {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  const stageW = 210;
  const gapW = 30;
  const totalW = stageW * 4 + gapW * 3 + 40;
  const totalH = 290;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ width: "100%", height: "auto", minWidth: 700 }}
      >
        <defs>
          <marker
            id="flow-arrow"
            markerWidth="10"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 4 L 0 8"
              fill="none"
              stroke="#828CE1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {MACRO_STAGES.map((stage, si) => {
          const x = 20 + si * (stageW + gapW);
          const isActive = activeStage === si;
          const dimmed = activeStage !== null && !isActive;
          const phase1 = sorted[stage.phases[0]];
          const phase2 = sorted[stage.phases[1]];
          const pi1 = stage.phases[0];
          const pi2 = stage.phases[1];

          return (
            <g
              key={stage.name}
              onMouseEnter={() => setActiveStage(si)}
              onMouseLeave={() => setActiveStage(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Macro-stage label */}
              <text
                x={x + stageW / 2}
                y={20}
                textAnchor="middle"
                fill={stage.color}
                fontSize="13"
                fontWeight="800"
                fontFamily="'Nunito Sans', sans-serif"
                style={{
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  opacity: dimmed ? 0.3 : 1,
                  transition: "opacity 0.25s",
                }}
              >
                {stage.name}
              </text>

              {/* Container rect */}
              <rect
                x={x}
                y={32}
                width={stageW}
                height={230}
                rx={16}
                fill={stage.light}
                stroke={stage.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={dimmed ? 0.3 : 1}
                style={{ transition: "all 0.25s" }}
              />

              {/* Phase 1 pill */}
              <rect
                x={x + 14}
                y={50}
                width={stageW - 28}
                height={90}
                rx={12}
                fill="white"
                stroke={PHASE_COLORS[pi1]}
                strokeWidth={1.5}
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              />
              {/* Phase 1 icon */}
              <text
                x={x + stageW / 2}
                y={80}
                textAnchor="middle"
                fontSize="20"
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              >
                {PHASE_ICONS[pi1]}
              </text>
              {/* Phase 1 number */}
              <text
                x={x + stageW / 2}
                y={100}
                textAnchor="middle"
                fill={PHASE_COLORS[pi1]}
                fontSize="8"
                fontWeight="700"
                fontFamily="'Nunito Sans', sans-serif"
                opacity={dimmed ? 0.4 : 1}
                style={{
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  transition: "opacity 0.25s",
                }}
              >
                Phase {pi1 + 1}
              </text>
              {/* Phase 1 label */}
              <text
                x={x + stageW / 2}
                y={117}
                textAnchor="middle"
                fill="var(--zelis-dark, #23004B)"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="'Nunito Sans', sans-serif"
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              >
                {phase1?.label || "—"}
              </text>

              {/* Vertical gate arrow between pills */}
              <line
                x1={x + stageW / 2}
                y1={142}
                x2={x + stageW / 2}
                y2={155}
                stroke={stage.color}
                strokeWidth="1.5"
                opacity={dimmed ? 0.2 : 0.5}
                strokeDasharray="3 2"
                style={{ transition: "opacity 0.25s" }}
              />
              <text
                x={x + stageW / 2}
                y={152}
                textAnchor="middle"
                fill={stage.color}
                fontSize="7"
                fontWeight="700"
                fontFamily="'Nunito Sans', sans-serif"
                opacity={dimmed ? 0.2 : 0.5}
                style={{ transition: "opacity 0.25s" }}
              >
                GATE
              </text>

              {/* Phase 2 pill */}
              <rect
                x={x + 14}
                y={160}
                width={stageW - 28}
                height={90}
                rx={12}
                fill="white"
                stroke={PHASE_COLORS[pi2]}
                strokeWidth={1.5}
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              />
              {/* Phase 2 icon */}
              <text
                x={x + stageW / 2}
                y={190}
                textAnchor="middle"
                fontSize="20"
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              >
                {PHASE_ICONS[pi2]}
              </text>
              {/* Phase 2 number */}
              <text
                x={x + stageW / 2}
                y={210}
                textAnchor="middle"
                fill={PHASE_COLORS[pi2]}
                fontSize="8"
                fontWeight="700"
                fontFamily="'Nunito Sans', sans-serif"
                opacity={dimmed ? 0.4 : 1}
                style={{
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  transition: "opacity 0.25s",
                }}
              >
                Phase {pi2 + 1}
              </text>
              {/* Phase 2 label */}
              <text
                x={x + stageW / 2}
                y={227}
                textAnchor="middle"
                fill="var(--zelis-dark, #23004B)"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="'Nunito Sans', sans-serif"
                opacity={dimmed ? 0.4 : 1}
                style={{ transition: "opacity 0.25s" }}
              >
                {phase2?.label || "—"}
              </text>

              {/* Horizontal arrow to next stage */}
              {si < 3 && (
                <line
                  x1={x + stageW + 2}
                  y1={147}
                  x2={x + stageW + gapW - 2}
                  y2={147}
                  stroke="#828CE1"
                  strokeWidth="2"
                  markerEnd="url(#flow-arrow)"
                  opacity={dimmed ? 0.2 : 0.6}
                  style={{ transition: "opacity 0.25s" }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
