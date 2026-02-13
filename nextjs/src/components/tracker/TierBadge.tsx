"use client";

import type { GovernanceTier } from "@/lib/types/database";
import { TIER_CONFIG } from "./constants";
import { Tooltip } from "./Tooltip";

interface TierBadgeProps {
  tier: GovernanceTier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const cfg = TIER_CONFIG[tier];

  return (
    <Tooltip label={cfg.description}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.15rem 0.6rem",
          borderRadius: "999px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.color}25`,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {cfg.label}
      </span>
    </Tooltip>
  );
}
