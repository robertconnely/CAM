"use client";

import type { DimensionConfig, DimensionKey } from "@/lib/scoring/capital-scoring";
import { DIMENSIONS, calculateWeightedScore } from "@/lib/scoring/capital-scoring";

interface StepScoreDimensionProps {
  dimensionKey: DimensionKey;
  score: number | null;
  notes: string;
  allScores: Partial<Record<DimensionKey, number>>;
  onSetScore: (score: number) => void;
  onSetNotes: (notes: string) => void;
}

const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  chart: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="16" width="4" height="9" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="9" y="11" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="15" y="7" width="4" height="18" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="21" y="3" width="4" height="22" rx="1" fill="currentColor" />
    </svg>
  ),
  compass: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M11 17l2-6 6-2-2 6z" fill="currentColor" />
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3l9 4v6c0 5.5-3.8 10.5-9 12-5.2-1.5-9-6.5-9-12V7z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 14l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 22c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 22c0-2.2 1.3-4 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  wrench: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M16.5 3.5a7 7 0 00-8.6 8.6L4 16l2 2 4-3.9a7 7 0 008.5-8.6l-3.5 3.5-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18l-4 4m2-2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function StepScoreDimension({
  dimensionKey,
  score,
  notes,
  allScores,
  onSetScore,
  onSetNotes,
}: StepScoreDimensionProps) {
  const dim = DIMENSIONS.find((d) => d.key === dimensionKey)!;
  const dimIndex = DIMENSIONS.findIndex((d) => d.key === dimensionKey);
  const currentWeighted = calculateWeightedScore(allScores);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <div
          style={{
            color: "var(--zelis-purple)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {DIMENSION_ICONS[dim.icon]}
        </div>
        <div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "var(--zelis-purple)",
              margin: 0,
            }}
          >
            {dim.label}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--zelis-blue-purple)", margin: "0.15rem 0 0 0" }}>
            Dimension {dimIndex + 1} of 5 — Weight: {(dim.weight * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--zelis-medium-gray)",
          marginBottom: "1.25rem",
          lineHeight: 1.5,
        }}
      >
        {dim.description}
      </p>

      {/* Score cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {([1, 2, 3, 4, 5] as const).map((val) => {
          const rubric = dim.rubric[val];
          const isSelected = score === val;
          const scoreColor =
            val <= 2 ? "#e53935" : val === 3 ? "#ff9800" : val === 4 ? "#43a047" : "#1b5e20";

          return (
            <button
              key={val}
              onClick={() => onSetScore(val)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: isSelected ? scoreColor : "var(--zelis-ice)",
                background: isSelected ? `${scoreColor}08` : "white",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                width: "100%",
              }}
            >
              {/* Score badge */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  background: isSelected ? scoreColor : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isSelected ? "white" : "var(--zelis-medium-gray)",
                  fontSize: "1rem",
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {val}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: isSelected ? scoreColor : "var(--zelis-dark-gray)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {rubric.label}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--zelis-medium-gray)",
                    lineHeight: 1.45,
                  }}
                >
                  {rubric.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: "1.25rem" }}>
        <label
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "block",
            marginBottom: "0.3rem",
          }}
        >
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onSetNotes(e.target.value)}
          placeholder={`Rationale for your ${dim.label.toLowerCase()} score...`}
          style={{
            width: "100%",
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "var(--zelis-ice)",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            outline: "none",
            minHeight: 50,
            resize: "vertical",
            background: "white",
          }}
        />
      </div>

      {/* Running score sidebar */}
      <div
        style={{
          background: "var(--zelis-ice)",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: "0.6rem",
          }}
        >
          Running Score
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          {DIMENSIONS.map((d) => {
            const s = allScores[d.key];
            const isCurrent = d.key === dimensionKey;
            return (
              <div
                key={d.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                  flex: 1,
                  minWidth: 60,
                }}
              >
                <div
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    color: isCurrent ? "var(--zelis-purple)" : "var(--zelis-medium-gray)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {d.label.split(" ")[0]}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: s != null ? "var(--zelis-purple)" : isCurrent ? "white" : "#ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s != null ? "white" : "var(--zelis-medium-gray)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    borderWidth: isCurrent ? "2px" : "0px",
                    borderStyle: "solid",
                    borderColor: "var(--zelis-purple)",
                  }}
                >
                  {s ?? "—"}
                </div>
                <div
                  style={{
                    fontSize: "0.55rem",
                    color: "var(--zelis-medium-gray)",
                    fontWeight: 600,
                  }}
                >
                  {(d.weight * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem",
              marginLeft: "0.5rem",
              paddingLeft: "0.75rem",
              borderLeftWidth: "2px",
              borderLeftStyle: "solid",
              borderLeftColor: "var(--zelis-purple)",
            }}
          >
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--zelis-purple)" }}>
              Weighted
            </div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--zelis-purple)",
              }}
            >
              {currentWeighted > 0 ? currentWeighted.toFixed(2) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
