"use client";

import type { InitiativeStatus } from "@/lib/types/database";
import { STATUS_CONFIG } from "./constants";

interface StatusBadgeProps {
  status: InitiativeStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "0.25rem" : "0.35rem",
        padding: isSmall ? "0.15rem 0.5rem" : "0.25rem 0.75rem",
        borderRadius: "999px",
        fontSize: isSmall ? "0.7rem" : "0.78rem",
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}20`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: isSmall ? "0.65rem" : "0.75rem" }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
