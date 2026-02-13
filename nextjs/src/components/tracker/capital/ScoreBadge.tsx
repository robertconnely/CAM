"use client";

import type { CapitalRecommendation } from "@/lib/types/database";
import { RECOMMENDATION_CONFIG } from "@/lib/scoring/capital-scoring";

interface ScoreBadgeProps {
  recommendation: CapitalRecommendation;
  score?: number | null;
  size?: "sm" | "md";
}

export function ScoreBadge({ recommendation, score, size = "sm" }: ScoreBadgeProps) {
  const cfg = RECOMMENDATION_CONFIG[recommendation];
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "0.3rem" : "0.4rem",
        padding: isSmall ? "0.15rem 0.5rem" : "0.25rem 0.75rem",
        borderRadius: "999px",
        fontSize: isSmall ? "0.65rem" : "0.75rem",
        fontWeight: 800,
        color: cfg.color,
        background: cfg.bg,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: `${cfg.color}25`,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
      {score != null && (
        <span style={{ fontWeight: 600, opacity: 0.8 }}>{score.toFixed(1)}</span>
      )}
    </span>
  );
}
