"use client";

import type { Initiative, CapitalScore } from "@/lib/types/database";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

interface PipelineKpiCardsProps {
  initiatives: Initiative[];
  capitalScores: CapitalScore[];
}

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export function PipelineKpiCards({ initiatives, capitalScores }: PipelineKpiCardsProps) {
  const total = initiatives.length;
  const onTrack = initiatives.filter((i) => i.status === "on_track").length;
  const atRisk = initiatives.filter((i) => i.status === "at_risk").length;
  const blocked = initiatives.filter((i) => i.status === "blocked").length;
  const complete = initiatives.filter((i) => i.status === "complete").length;

  // Portfolio health: weighted by status
  const healthScore =
    total > 0
      ? Math.round(
          ((onTrack * 100 + complete * 90 + atRisk * 40 + blocked * 0) / total)
        )
      : 0;

  // Avg strategic score
  const scores = initiatives
    .map((i) => i.strategic_score)
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—";

  const stats: StatCard[] = [
    {
      label: "Pipeline Health",
      value: total > 0 ? `${healthScore}%` : "—",
      accent: healthScore >= 70 ? "#320FFF" : healthScore >= 40 ? "#FFBE00" : "#E61E2D",
    },
    {
      label: "Initiatives",
      value: String(total),
      accent: "#321478",
    },
    {
      label: "On Track",
      value: String(onTrack),
      accent: "#320FFF",
    },
    {
      label: "At Risk",
      value: String(atRisk),
      accent: "#FFBE00",
    },
    {
      label: "Blocked",
      value: String(blocked),
      accent: "#E61E2D",
    },
    {
      label: "Avg Score",
      value: avgScore,
      accent: "#5F5FC3",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: s.accent === "#E61E2D" ? "rgba(230, 30, 45, 0.04)" : "#fff",
            borderRadius: 10,
            border: s.accent === "#E61E2D" ? "1px solid rgba(230, 30, 45, 0.15)" : "1px solid var(--zelis-ice, #ECE9FF)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#41329B",
              lineHeight: 1.2,
            }}
          >
            {GLOSSARY[s.label] ? (
              <InfoTooltip text={GLOSSARY[s.label]}>{s.label}</InfoTooltip>
            ) : (
              s.label
            )}
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: s.accent || "var(--zelis-dark, #23004B)",
              lineHeight: 1.2,
            }}
          >
            {s.value}
          </span>
          {s.sub && (
            <span
              style={{
                fontSize: 11,
                color: "var(--zelis-warm-gray, #B4B4B9)",
                lineHeight: 1.3,
              }}
            >
              {s.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
