"use client";

import type { Initiative, CapitalScore } from "@/lib/types/database";

interface KpiStatsBarProps {
  initiatives: Initiative[];
  capitalScores: CapitalScore[];
}

interface StatCard {
  label: string;
  value: string;
  color: string;
  bg: string;
  borderColor: string;
}

export function KpiStatsBar({ initiatives, capitalScores }: KpiStatsBarProps) {
  const total = initiatives.length;
  const onTrack = initiatives.filter((i) => i.status === "on_track").length;
  const atRisk = initiatives.filter((i) => i.status === "at_risk").length;
  const blocked = initiatives.filter((i) => i.status === "blocked").length;
  const complete = initiatives.filter((i) => i.status === "complete").length;

  // Capital deployed: sum latest score per initiative
  const latestScores = new Map<string, CapitalScore>();
  for (const s of capitalScores) {
    if (!latestScores.has(s.initiative_id)) {
      latestScores.set(s.initiative_id, s);
    }
  }
  const totalCapital = Array.from(latestScores.values()).reduce(
    (sum, s) => sum + (s.investment_amount ?? 0),
    0
  );

  // Avg strategic score
  const scores = initiatives
    .map((i) => i.strategic_score)
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—";

  // Portfolio health: weighted by status
  const healthScore =
    total > 0
      ? Math.round(
          ((onTrack * 100 + complete * 90 + atRisk * 40 + blocked * 0) / total)
        )
      : 0;

  const stats: StatCard[] = [
    {
      label: "Portfolio Health",
      value: total > 0 ? `${healthScore}%` : "—",
      color: healthScore >= 70 ? "#2e7d32" : healthScore >= 40 ? "#e67e00" : "#c62828",
      bg: "linear-gradient(135deg, #f5f3ff 0%, #ECE9FF 100%)",
      borderColor: "#321478",
    },
    {
      label: "Initiatives",
      value: String(total),
      color: "#321478",
      bg: "linear-gradient(135deg, #ECE9FF 0%, #f5f3ff 100%)",
      borderColor: "#321478",
    },
    {
      label: "On Track",
      value: String(onTrack),
      color: "#2e7d32",
      bg: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
      borderColor: "#2e7d32",
    },
    {
      label: "At Risk",
      value: String(atRisk),
      color: "#e67e00",
      bg: "linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)",
      borderColor: "#e67e00",
    },
    {
      label: "Blocked",
      value: String(blocked),
      color: "#c62828",
      bg: "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)",
      borderColor: "#c62828",
    },
    {
      label: "Avg Score",
      value: avgScore,
      color: "#5F5FC3",
      bg: "linear-gradient(135deg, #ECE9FF 0%, #e8eaf6 100%)",
      borderColor: "#5F5FC3",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: s.bg,
            borderRadius: "10px",
            padding: "1.15rem 1.25rem",
            borderLeft: `4px solid ${s.borderColor}`,
            boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: s.color,
              lineHeight: 1,
              marginBottom: "0.25rem",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: s.color,
              opacity: 0.8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
