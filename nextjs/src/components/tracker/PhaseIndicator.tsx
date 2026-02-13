"use client";

import type { PdlcPhase } from "@/lib/types/database";
import { Tooltip } from "./Tooltip";

interface PhaseIndicatorProps {
  phases: PdlcPhase[];
  currentPhaseId: string;
  size?: "sm" | "lg";
}

export function PhaseIndicator({ phases, currentPhaseId, size = "sm" }: PhaseIndicatorProps) {
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);
  const currentIndex = sorted.findIndex((p) => p.id === currentPhaseId);
  const isLarge = size === "lg";

  const dotSize = isLarge ? 28 : 14;
  const lineHeight = isLarge ? 3 : 2;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        width: "100%",
      }}
    >
      {sorted.map((phase, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        let bg: string;
        let border: string;
        let shadow: string;

        if (isComplete) {
          bg = "var(--zelis-blue-purple)";
          border = "var(--zelis-blue-purple)";
          shadow = "none";
        } else if (isCurrent) {
          bg = "var(--zelis-gold)";
          border = "var(--zelis-gold)";
          shadow = "0 0 0 4px rgba(255, 192, 0, 0.25)";
        } else {
          bg = "white";
          border = "var(--zelis-medium-gray)";
          shadow = "none";
        }

        return (
          <div
            key={phase.id}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < sorted.length - 1 ? 1 : "none",
            }}
          >
            {/* Dot + label */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Tooltip label={phase.label} position="bottom">
                <div
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    background: bg,
                    border: `2px solid ${border}`,
                    boxShadow: shadow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isLarge ? "0.7rem" : "0.5rem",
                    color: isFuture ? "transparent" : "white",
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                >
                  {isComplete ? "✓" : isCurrent ? (isLarge ? i + 1 : "") : ""}
                </div>
              </Tooltip>
              {isLarge && (
                <span
                  style={{
                    position: "absolute",
                    top: dotSize + 6,
                    fontSize: "0.65rem",
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent
                      ? "var(--zelis-purple)"
                      : isFuture
                        ? "var(--zelis-medium-gray)"
                        : "var(--zelis-blue-purple)",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    maxWidth: 80,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {phase.label}
                </span>
              )}
            </div>
            {/* Connecting line */}
            {i < sorted.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: lineHeight,
                  background:
                    i < currentIndex
                      ? "var(--zelis-blue-purple)"
                      : "var(--zelis-medium-gray)",
                  borderRadius: lineHeight,
                  minWidth: isLarge ? 20 : 6,
                  transition: "background 0.3s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
