"use client";

import { useState, useEffect } from "react";
import type { DimensionKey } from "@/lib/scoring/capital-scoring";
import {
  DIMENSIONS,
  RECOMMENDATION_CONFIG,
  BAND_CONFIG,
} from "@/lib/scoring/capital-scoring";
import type { CapitalBand, CapitalRecommendation } from "@/lib/types/database";

interface StepResultsProps {
  weightedScore: number;
  band: CapitalBand;
  recommendation: CapitalRecommendation;
  scores: Record<DimensionKey, number>;
  irrPass: boolean;
  cmPass: boolean;
  irrValue: number;
  cmValue: number;
  saving: boolean;
  onSave: () => void;
}

export function StepResults({
  weightedScore,
  band,
  recommendation,
  scores,
  irrPass,
  cmPass,
  irrValue,
  cmValue,
  saving,
  onSave,
}: StepResultsProps) {
  const recConfig = RECOMMENDATION_CONFIG[recommendation];
  const bandConfig = BAND_CONFIG[band];
  const financialGatePass = irrPass && cmPass;

  // Animated score counter
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * weightedScore * 100) / 100);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [weightedScore]);

  // Score color based on value
  const scoreColor =
    weightedScore >= 4.0
      ? "#1b5e20"
      : weightedScore >= 3.5
        ? "#2e7d32"
        : weightedScore >= 3.0
          ? "#e65100"
          : "#b71c1c";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            margin: "0 0 0.35rem 0",
          }}
        >
          Scoring Complete
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--zelis-blue-purple)", margin: 0 }}>
          Here are your results
        </p>
      </div>

      {/* Score reveal */}
      <div
        style={{
          background: `linear-gradient(135deg, ${recConfig.bg} 0%, white 100%)`,
          borderRadius: "16px",
          padding: "2rem 1.5rem",
          textAlign: "center",
          marginBottom: "1.5rem",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: `${recConfig.color}30`,
        }}
      >
        {/* Big score */}
        <div
          style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            color: scoreColor,
            lineHeight: 1,
            marginBottom: "0.5rem",
          }}
        >
          {displayScore.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--zelis-medium-gray)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem",
          }}
        >
          Weighted Score (out of 5.00)
        </div>

        {/* Recommendation badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.5rem",
            borderRadius: "999px",
            background: recConfig.color,
            color: "white",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          {recConfig.label}
        </div>

        <div
          style={{
            fontSize: "0.82rem",
            color: recConfig.color,
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          {bandConfig.label} — {bandConfig.description}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--zelis-medium-gray)",
            lineHeight: 1.5,
            maxWidth: 440,
            margin: "0 auto",
          }}
        >
          {recConfig.description}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--zelis-ice)",
          padding: "1.25rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: "0.75rem",
          }}
        >
          Dimension Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {DIMENSIONS.map((dim) => {
            const s = scores[dim.key];
            const barWidth = (s / 5) * 100;
            const barColor =
              s <= 2 ? "#e53935" : s === 3 ? "#ff9800" : s === 4 ? "#43a047" : "#1b5e20";

            return (
              <div key={dim.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.2rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--zelis-dark-gray)",
                    }}
                  >
                    {dim.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: barColor,
                    }}
                  >
                    {s}/5
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--zelis-medium-gray)",
                        fontWeight: 500,
                        marginLeft: "0.35rem",
                      }}
                    >
                      ({(dim.weight * 100).toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: "#f0f0f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      borderRadius: 4,
                      background: barColor,
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial gate summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            background: irrPass ? "#e8f5e9" : "#fce4ec",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: irrPass ? "#2e7d32" : "#c62828",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.2rem",
            }}
          >
            IRR Gate
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: irrPass ? "#2e7d32" : "#c62828" }}>
            {irrValue}% {irrPass ? "✓" : "✗"}
          </div>
        </div>
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            background: cmPass ? "#e8f5e9" : "#fce4ec",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: cmPass ? "#2e7d32" : "#c62828",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.2rem",
            }}
          >
            CM% Gate
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: cmPass ? "#2e7d32" : "#c62828" }}>
            {cmValue}% {cmPass ? "✓" : "✗"}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            padding: "0.85rem 3rem",
            borderRadius: "12px",
            border: "none",
            background: saving
              ? "var(--zelis-medium-gray)"
              : "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
            color: "white",
            cursor: saving ? "default" : "pointer",
            fontWeight: 800,
            fontSize: "1rem",
            fontFamily: "inherit",
            boxShadow: saving ? "none" : "0 4px 16px rgba(50, 20, 120, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          {saving ? "Saving..." : "Save Score & Return to Tracker"}
        </button>
      </div>
    </div>
  );
}
