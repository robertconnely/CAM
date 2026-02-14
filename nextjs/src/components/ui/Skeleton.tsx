"use client";

import React from "react";

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}

export function SkeletonBox({
  width = "100%",
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonBoxProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background:
          "linear-gradient(90deg, var(--zelis-snow-gray, #F0F0F1) 25%, var(--zelis-ice, #ECE9FF) 50%, var(--zelis-snow-gray, #F0F0F1) 75%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({
  height = 100,
  style,
}: {
  height?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        padding: 20,
        height,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      <SkeletonBox width="60%" height={12} />
      <SkeletonBox width="40%" height={24} />
    </div>
  );
}

export function SkeletonStyles() {
  return <style>{shimmerKeyframes}</style>;
}
