"use client";

import type { CapitalScore } from "@/lib/types/database";
import { RECOMMENDATION_CONFIG, BAND_CONFIG } from "@/lib/scoring/capital-scoring";

interface ScoreHistoryProps {
  scores: CapitalScore[];
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ScoreHistory({ scores }: ScoreHistoryProps) {
  if (scores.length === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          textAlign: "center",
          color: "var(--zelis-medium-gray)",
          fontSize: "0.85rem",
          background: "white",
          borderRadius: "10px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--zelis-ice)",
        }}
      >
        No capital scores recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {scores.map((score, i) => {
        const rec = score.recommendation
          ? RECOMMENDATION_CONFIG[score.recommendation]
          : null;
        const band = score.band ? BAND_CONFIG[score.band] : null;

        return (
          <div
            key={score.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.85rem 1.15rem",
              borderRadius: "10px",
              background: "white",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: i === 0 ? "var(--zelis-blue-purple)" : "var(--zelis-ice)",
              boxShadow: i === 0 ? "0 2px 8px rgba(50, 20, 120, 0.08)" : "none",
            }}
          >
            {/* Timeline dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: i === 0 ? "var(--zelis-purple)" : "var(--zelis-medium-gray)",
                }}
              />
              {i < scores.length - 1 && (
                <div
                  style={{
                    width: 2,
                    height: 20,
                    background: "var(--zelis-ice)",
                    marginTop: 2,
                  }}
                />
              )}
            </div>

            {/* Score info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                {rec && (
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "999px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      color: rec.color,
                      background: rec.bg,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {rec.label}
                  </span>
                )}
                {band && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: band.color,
                    }}
                  >
                    {band.label}
                  </span>
                )}
                {i === 0 && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: "var(--zelis-blue-purple)",
                      textTransform: "uppercase",
                    }}
                  >
                    Latest
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--zelis-medium-gray)",
                }}
              >
                {formatDate(score.scored_at)}
                {score.financial_gate_pass ? " — Financial gate passed" : " — Financial gate not met"}
              </div>
            </div>

            {/* Weighted score */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--zelis-purple)",
                }}
              >
                {score.weighted_score?.toFixed(2) ?? "—"}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--zelis-medium-gray)",
                  fontWeight: 600,
                }}
              >
                / 5.00
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
