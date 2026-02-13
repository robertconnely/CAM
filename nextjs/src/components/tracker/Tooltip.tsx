"use client";

import { useState, useRef, useCallback } from "react";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function Tooltip({ label, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timeout.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  }, []);

  const isTop = position === "top";

  return (
    <span
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {visible && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...(isTop
              ? { bottom: "calc(100% + 8px)" }
              : { top: "calc(100% + 8px)" }),
            background: "var(--zelis-dark)",
            color: "white",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "0.35rem 0.65rem",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(35, 0, 75, 0.35)",
            zIndex: 50,
            animation: "tooltip-fade-in 0.15s ease-out",
            letterSpacing: "0.01em",
          }}
        >
          {label}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              ...(isTop
                ? { top: "100%" }
                : { bottom: "100%" }),
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              ...(isTop
                ? { borderTop: "5px solid var(--zelis-dark)" }
                : { borderBottom: "5px solid var(--zelis-dark)" }),
            }}
          />
        </span>
      )}
      <style>{`
        @keyframes tooltip-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(${isTop ? "4px" : "-4px"}); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </span>
  );
}
