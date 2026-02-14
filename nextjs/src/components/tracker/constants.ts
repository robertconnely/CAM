import type { InitiativeStatus, GateDecision, GovernanceTier, PlcStage } from "@/lib/types/database";

export const STATUS_CONFIG: Record<
  InitiativeStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  on_track: { label: "On Track", color: "#320FFF", bg: "#ECE9FF", icon: "✓" },
  at_risk: { label: "At Risk", color: "#FFBE00", bg: "#F7F6FF", icon: "⚠" },
  blocked: { label: "Blocked", color: "#E61E2D", bg: "#F7F6FF", icon: "✕" },
  complete: { label: "Complete", color: "#5F5FC3", bg: "#ECE9FF", icon: "★" },
};

export const TIER_CONFIG: Record<
  GovernanceTier,
  { label: string; description: string; color: string; bg: string }
> = {
  tier_1: {
    label: "Tier 1",
    description: "Strategic / Board-level",
    color: "#321478",
    bg: "#ECE9FF",
  },
  tier_2: {
    label: "Tier 2",
    description: "Cross-functional",
    color: "#5F5FC3",
    bg: "#F7F6FF",
  },
  tier_3: {
    label: "Tier 3",
    description: "Team-level",
    color: "#41329B",
    bg: "#F7F6FF",
  },
  tier_4: {
    label: "Tier 4",
    description: "Operational",
    color: "#B4B4B9",
    bg: "#F0F0F1",
  },
};

export const DECISION_CONFIG: Record<
  GateDecision,
  { label: string; color: string; bg: string; icon: string }
> = {
  go: { label: "Go", color: "#320FFF", bg: "#ECE9FF", icon: "✓" },
  no_go: { label: "No Go", color: "#E61E2D", bg: "#F7F6FF", icon: "✕" },
  pivot: { label: "Pivot", color: "#FFBE00", bg: "#F7F6FF", icon: "↻" },
  park: { label: "Park", color: "#B4B4B9", bg: "#F0F0F1", icon: "⏸" },
};

export const PLC_STAGE_CONFIG: Record<
  PlcStage,
  { label: string; color: string; bg: string; icon: string }
> = {
  introduction: { label: "Introduction", color: "#23004B", bg: "#ECE9FF", icon: "→" },
  growth:       { label: "Growth",       color: "#FFBE00", bg: "#F7F6FF", icon: "↗" },
  maturity:     { label: "Maturity",     color: "#320FFF", bg: "#ECE9FF", icon: "—" },
  decline:      { label: "Decline",      color: "#B4B4B9", bg: "#F0F0F1", icon: "↘" },
};
