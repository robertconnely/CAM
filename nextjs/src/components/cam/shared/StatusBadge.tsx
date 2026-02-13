"use client";

import React from "react";

type CaseStatusDisplay =
  | "approved"
  | "in-progress"
  | "tracking"
  | "draft"
  | "submitted"
  | "rejected";

interface StatusBadgeProps {
  status: CaseStatusDisplay;
}

const STATUS_STYLES: Record<
  CaseStatusDisplay,
  { dot: string; bg: string; text: string; label: string }
> = {
  approved: {
    dot: "#10B981",
    bg: "#ECFDF5",
    text: "#10B981",
    label: "Approved",
  },
  "in-progress": {
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#F59E0B",
    label: "In Progress",
  },
  tracking: {
    dot: "var(--zelis-blue-purple, #5F5FC3)",
    bg: "var(--zelis-ice, #ECE9FF)",
    text: "var(--zelis-blue-purple, #5F5FC3)",
    label: "Tracking",
  },
  draft: {
    dot: "var(--zelis-medium-gray, #8C8C8C)",
    bg: "#F1F5F9",
    text: "var(--zelis-medium-gray, #8C8C8C)",
    label: "Draft",
  },
  submitted: {
    dot: "var(--zelis-blue, #320FFF)",
    bg: "#EEF2FF",
    text: "var(--zelis-blue, #320FFF)",
    label: "Submitted",
  },
  rejected: {
    dot: "var(--zelis-red, #E61E2D)",
    bg: "#FEF2F2",
    text: "var(--zelis-red, #E61E2D)",
    label: "Rejected",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: s.bg,
        fontSize: 12,
        fontWeight: 600,
        color: s.text,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

export type { CaseStatusDisplay, StatusBadgeProps };
