"use client";

import React from "react";

interface StageBarProps {
  current: number; // 1-indexed, which stage is completed
  total?: number; // default 6
}

export default function StageBar({ current, total = 6 }: StageBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 4,
            borderRadius: 2,
            backgroundColor:
              i < current
                ? "var(--zelis-blue-purple, #5F5FC3)"
                : "var(--zelis-ice, #ECE9FF)",
            transition: "background-color 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

export type { StageBarProps };
