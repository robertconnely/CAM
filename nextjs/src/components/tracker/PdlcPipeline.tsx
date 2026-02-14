"use client";

import { useState } from "react";
import type { PdlcPhase } from "@/lib/types/database";
import { GlossaryText } from "@/components/ui/GlossaryText";

interface PdlcPipelineProps {
  phases: PdlcPhase[];
}

const MACRO_STAGES = [
  { name: "Strategy", color: "#321478", phases: [0, 1] },
  { name: "Build", color: "#41329B", phases: [2, 3] },
  { name: "Prepare", color: "#5F5FC3", phases: [4, 5] },
  { name: "Launch", color: "#320FFF", phases: [6, 7] },
];

const NODE_COLORS = [
  "#321478",
  "#41329B",
  "#5F5FC3",
  "#320FFF",
  "#828CE1",
  "#23004B",
  "#E61E2D",
  "#FFBE00",
];

export function PdlcPipeline({ phases }: PdlcPipelineProps) {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  return (
    <div style={{ position: "relative" }}>
      {/* Macro-stage labels row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          marginBottom: "0.75rem",
        }}
      >
        {MACRO_STAGES.map((stage) => (
          <div
            key={stage.name}
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              fontWeight: 800,
              color: stage.color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "0 0.5rem",
            }}
          >
            {stage.name}
          </div>
        ))}
      </div>

      {/* Bracket indicators */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          marginBottom: "1.25rem",
        }}
      >
        {MACRO_STAGES.map((stage) => (
          <div
            key={stage.name}
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 1.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}, ${stage.color}30)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Phase nodes row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 0,
          position: "relative",
        }}
      >
        {/* Connecting line behind nodes */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: "6.25%",
            right: "6.25%",
            height: 2,
            background:
              "linear-gradient(90deg, #321478, #41329B, #5F5FC3, #320FFF, #828CE1, #23004B, #E61E2D, #FFBE00)",
            zIndex: 0,
            borderRadius: 1,
          }}
        />

        {sorted.map((phase, i) => {
          const isActive = activePhase === i;
          const color = NODE_COLORS[i];

          return (
            <div
              key={phase.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setActivePhase(i)}
              onMouseLeave={() => setActivePhase(null)}
            >
              {/* Node circle */}
              <div
                style={{
                  width: isActive ? 48 : 44,
                  height: isActive ? 48 : 44,
                  borderRadius: "50%",
                  background: isActive ? color : "#fff",
                  border: `3px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActive ? "1rem" : "0.92rem",
                  fontWeight: 800,
                  color: isActive ? "#fff" : color,
                  fontFamily: "'Nunito Sans', sans-serif",
                  transition: "all 0.2s ease",
                  boxShadow: isActive
                    ? `0 4px 16px ${color}40`
                    : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {i + 1}
              </div>

              {/* Phase label */}
              <div
                style={{
                  marginTop: "0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? color : "var(--zelis-dark, #23004B)",
                  textAlign: "center",
                  lineHeight: 1.25,
                  minHeight: "2.5em",
                  transition: "all 0.2s",
                  padding: "0 0.15rem",
                }}
              >
                {phase.label}
              </div>

              {/* Duration */}
              <div
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  marginTop: "0.15rem",
                  transition: "all 0.2s",
                }}
              >
                {phase.typical_duration}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover detail card */}
      <div style={{ marginTop: "1.5rem" }}>
        {activePhase !== null ? (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: 10,
              background: "#fff",
              border: `2px solid ${NODE_COLORS[activePhase]}18`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              animation: "pipelineFade 0.15s ease-out",
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
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: NODE_COLORS[activePhase],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {activePhase + 1}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: NODE_COLORS[activePhase],
                  }}
                >
                  {sorted[activePhase].label}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--zelis-warm-gray, #B4B4B9)",
                  background: "var(--zelis-ice, #ECE9FF)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                }}
              >
                {sorted[activePhase].typical_duration}
              </div>
            </div>
            <p
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.8rem",
                color: "var(--zelis-dark-gray, #555)",
                lineHeight: 1.55,
              }}
            >
              <GlossaryText>{sorted[activePhase].description ?? ""}</GlossaryText>
            </p>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: NODE_COLORS[activePhase],
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "0.15rem",
              }}
            >
              Gate Criteria
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--zelis-dark-gray, #555)",
                lineHeight: 1.45,
              }}
            >
              {sorted[activePhase].gate_description || "—"}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: 10,
              background: "var(--zelis-ice, #ECE9FF)",
              textAlign: "center",
              border: "1.5px dashed #5F5FC325",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--zelis-blue-purple, #5F5FC3)",
                fontWeight: 500,
              }}
            >
              Hover over a phase to see details, gate criteria, and typical
              duration.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pipelineFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
