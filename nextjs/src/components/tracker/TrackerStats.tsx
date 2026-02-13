"use client";

import type { Initiative } from "@/lib/types/database";

interface TrackerStatsProps {
  initiatives: Initiative[];
}

interface StatCard {
  label: string;
  count: number;
  color: string;
  bg: string;
  icon: string;
}

export function TrackerStats({ initiatives }: TrackerStatsProps) {
  const total = initiatives.length;
  const onTrack = initiatives.filter((i) => i.status === "on_track").length;
  const atRisk = initiatives.filter((i) => i.status === "at_risk").length;
  const blocked = initiatives.filter((i) => i.status === "blocked").length;
  const complete = initiatives.filter((i) => i.status === "complete").length;

  const stats: StatCard[] = [
    { label: "Total", count: total, color: "#321478", bg: "linear-gradient(135deg, #ECE9FF 0%, #f5f3ff 100%)", icon: "📋" },
    { label: "On Track", count: onTrack, color: "#2e7d32", bg: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)", icon: "✓" },
    { label: "At Risk", count: atRisk, color: "#e67e00", bg: "linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)", icon: "⚠" },
    { label: "Blocked", count: blocked, color: "#c62828", bg: "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)", icon: "✕" },
    { label: "Complete", count: complete, color: "#5F5FC3", bg: "linear-gradient(135deg, #ECE9FF 0%, #e8eaf6 100%)", icon: "★" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: s.bg,
            borderRadius: "10px",
            padding: "1.15rem 1.5rem",
            border: `1px solid ${s.color}15`,
            boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "-4px",
              fontSize: "2.5rem",
              opacity: 0.08,
              fontWeight: 900,
            }}
          >
            {s.icon}
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: s.color,
              lineHeight: 1,
              marginBottom: "0.25rem",
            }}
          >
            {s.count}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
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
