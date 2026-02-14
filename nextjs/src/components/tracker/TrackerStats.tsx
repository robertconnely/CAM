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
  icon: React.ReactNode;
}

function SvgIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", top: 8, right: 8, opacity: 0.12 }}
    >
      {children}
    </svg>
  );
}

export function TrackerStats({ initiatives }: TrackerStatsProps) {
  const total = initiatives.length;
  const onTrack = initiatives.filter((i) => i.status === "on_track").length;
  const atRisk = initiatives.filter((i) => i.status === "at_risk").length;
  const blocked = initiatives.filter((i) => i.status === "blocked").length;
  const complete = initiatives.filter((i) => i.status === "complete").length;

  const stats: StatCard[] = [
    {
      label: "Total",
      count: total,
      color: "#321478",
      bg: "linear-gradient(135deg, #ECE9FF 0%, #f5f3ff 100%)",
      icon: (
        <SvgIcon color="#321478">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="12" y2="16" />
        </SvgIcon>
      ),
    },
    {
      label: "On Track",
      count: onTrack,
      color: "#320FFF",
      bg: "linear-gradient(135deg, #ECE9FF 0%, #f0f0ff 100%)",
      icon: (
        <SvgIcon color="#320FFF">
          <polyline points="20 6 9 17 4 12" />
        </SvgIcon>
      ),
    },
    {
      label: "At Risk",
      count: atRisk,
      color: "#FFBE00",
      bg: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
      icon: (
        <SvgIcon color="#FFBE00">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </SvgIcon>
      ),
    },
    {
      label: "Blocked",
      count: blocked,
      color: "#E61E2D",
      bg: "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)",
      icon: (
        <SvgIcon color="#E61E2D">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </SvgIcon>
      ),
    },
    {
      label: "Complete",
      count: complete,
      color: "#5F5FC3",
      bg: "linear-gradient(135deg, #ECE9FF 0%, #e8eaf6 100%)",
      icon: (
        <SvgIcon color="#5F5FC3">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </SvgIcon>
      ),
    },
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
          {s.icon}
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
