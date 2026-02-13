"use client";

import { useState } from "react";
import Link from "next/link";
import type { Initiative, PdlcPhase } from "@/lib/types/database";
import { STATUS_CONFIG, TIER_CONFIG } from "@/components/tracker/constants";

interface PipelineKanbanProps {
  initiatives: Initiative[];
  phases: PdlcPhase[];
}

const PHASE_COLORS = [
  "#321478",
  "#41329B",
  "#5F5FC3",
  "#320FFF",
  "#2e7d32",
  "#e67e00",
  "#E61E2D",
  "#FFC000",
];

export function PipelineKanban({ initiatives, phases }: PipelineKanbanProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const sortedPhases = [...phases].sort(
    (a, b) => a.display_order - b.display_order
  );

  const maxCount = Math.max(
    ...sortedPhases.map(
      (p) => initiatives.filter((i) => i.current_phase_id === p.id).length
    ),
    1
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {sortedPhases.map((phase, i) => {
        const phaseInits = initiatives.filter(
          (init) => init.current_phase_id === phase.id
        );
        const color = PHASE_COLORS[i % PHASE_COLORS.length];
        const barWidth =
          phaseInits.length > 0
            ? Math.max((phaseInits.length / maxCount) * 100, 8)
            : 0;
        const isExpanded = expandedPhase === phase.id;

        return (
          <div key={phase.id}>
            {/* Phase row */}
            <div
              onClick={() =>
                setExpandedPhase(isExpanded ? null : phase.id)
              }
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr 40px",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                cursor: phaseInits.length > 0 ? "pointer" : "default",
                background: isExpanded ? `${color}08` : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isExpanded)
                  e.currentTarget.style.background = `${color}05`;
              }}
              onMouseLeave={(e) => {
                if (!isExpanded)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Phase label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: color,
                    lineHeight: 1.3,
                  }}
                >
                  {phase.label}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 22,
                  background: "var(--zelis-light-gray)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                    borderRadius: "4px",
                    transition: "width 0.4s ease",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "0.5rem",
                  }}
                >
                  {phaseInits.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {phaseInits.length === 1
                        ? "1 initiative"
                        : `${phaseInits.length} initiatives`}
                    </span>
                  )}
                </div>
              </div>

              {/* Count */}
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: phaseInits.length > 0 ? color : "var(--zelis-warm-gray)",
                  textAlign: "right",
                }}
              >
                {phaseInits.length}
              </div>
            </div>

            {/* Expanded initiative list */}
            {isExpanded && phaseInits.length > 0 && (
              <div
                style={{
                  marginLeft: "calc(220px + 0.75rem + 0.75rem)",
                  marginTop: "0.25rem",
                  marginBottom: "0.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  animation: "fadeInUp 0.15s ease-out",
                }}
              >
                {phaseInits.map((init) => {
                  const statusCfg = STATUS_CONFIG[init.status];
                  const tierCfg = TIER_CONFIG[init.tier];
                  const isOverdue =
                    init.target_gate_date &&
                    new Date(init.target_gate_date) < new Date() &&
                    init.status !== "complete";

                  return (
                    <Link
                      key={init.id}
                      href="/pdlc/tracker"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: "6px",
                          background: "white",
                          border: `1px solid ${isOverdue ? "var(--zelis-red)" : "var(--zelis-ice)"}`,
                          fontSize: "0.72rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow =
                            "0 1px 4px rgba(0,0,0,0.04)";
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: statusCfg.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--zelis-dark)",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {init.name}
                        </span>
                        <span
                          style={{
                            padding: "0.05rem 0.3rem",
                            borderRadius: "3px",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            background: `${tierCfg.color}12`,
                            color: tierCfg.color,
                          }}
                        >
                          {tierCfg.label}
                        </span>
                        {init.owner_name && (
                          <span
                            style={{
                              color: "var(--zelis-medium-gray)",
                              fontSize: "0.62rem",
                            }}
                          >
                            {init.owner_name}
                          </span>
                        )}
                        {isOverdue && (
                          <span
                            style={{
                              color: "var(--zelis-red)",
                              fontWeight: 700,
                              fontSize: "0.6rem",
                            }}
                          >
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
