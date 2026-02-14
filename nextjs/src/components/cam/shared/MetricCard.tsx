"use client";

import React from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  /** Override auto-lookup tooltip text */
  tooltip?: string;
}

export default function MetricCard({ label, value, sub, accent, tooltip }: MetricCardProps) {
  const tip = tooltip ?? GLOSSARY[label];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
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
          color: "var(--zelis-medium-gray, #8C8C8C)",
          lineHeight: 1.2,
        }}
      >
        {tip ? <InfoTooltip text={tip}>{label}</InfoTooltip> : label}
      </span>
      <span
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: accent || "var(--zelis-dark, #23004B)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: 11,
            color: "var(--zelis-medium-gray, #8C8C8C)",
            lineHeight: 1.3,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
