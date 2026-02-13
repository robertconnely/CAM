import type { InitiativeStatus, GateDecision, GovernanceTier } from "@/lib/types/database";

export const STATUS_CONFIG: Record<
  InitiativeStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  on_track: { label: "On Track", color: "#2e7d32", bg: "#e8f5e9", icon: "✓" },
  at_risk: { label: "At Risk", color: "#e67e00", bg: "#fff3e0", icon: "⚠" },
  blocked: { label: "Blocked", color: "#c62828", bg: "#ffebee", icon: "✕" },
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
    bg: "#f0f0ff",
  },
  tier_3: {
    label: "Tier 3",
    description: "Team-level",
    color: "#41329B",
    bg: "#f5f3ff",
  },
  tier_4: {
    label: "Tier 4",
    description: "Operational",
    color: "#666",
    bg: "#f5f5f5",
  },
};

export const DECISION_CONFIG: Record<
  GateDecision,
  { label: string; color: string; bg: string; icon: string }
> = {
  go: { label: "Go", color: "#2e7d32", bg: "#e8f5e9", icon: "✓" },
  no_go: { label: "No Go", color: "#c62828", bg: "#ffebee", icon: "✕" },
  pivot: { label: "Pivot", color: "#e67e00", bg: "#fff3e0", icon: "↻" },
  park: { label: "Park", color: "#666", bg: "#f5f5f5", icon: "⏸" },
};
