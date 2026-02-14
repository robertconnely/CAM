"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  /** The tooltip content shown on hover */
  text: string;
  /** The label/content to wrap — gets a dotted underline */
  children: ReactNode;
  /** Max width of the tooltip bubble (default 280) */
  maxWidth?: number;
}

/**
 * Wraps any label with a hover tooltip.
 * Uses a portal to render the tooltip at the document body level,
 * so it's never clipped by parent overflow or container boundaries.
 */
export function InfoTooltip({ text, children, maxWidth = 280 }: InfoTooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const above = rect.top > 140;
    setPos({
      x: centerX,
      y: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <span
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{
        cursor: "help",
        borderBottom: "1px dotted #828CE1",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {children}
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0, opacity: 0.5 }}
      >
        <circle cx="8" cy="8" r="7" stroke="#828CE1" strokeWidth="1.5" />
        <text
          x="8"
          y="12"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#828CE1"
          fontFamily="sans-serif"
        >
          i
        </text>
      </svg>

      {pos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            style={{
              position: "fixed",
              left: pos.x,
              ...(pos.above
                ? { bottom: `calc(100vh - ${pos.y}px)` }
                : { top: pos.y }),
              transform: "translateX(-50%)",
              background: "#23004B",
              color: "#fff",
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 1.5,
              padding: "10px 14px",
              borderRadius: 8,
              maxWidth,
              width: "max-content",
              textTransform: "none",
              letterSpacing: "normal",
              boxShadow: "0 4px 16px rgba(35, 0, 75, 0.25)",
              zIndex: 99999,
              pointerEvents: "none",
              whiteSpace: "normal",
            }}
          >
            {text}
            {/* Arrow */}
            <span
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                ...(pos.above
                  ? {
                      top: "100%",
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "6px solid #23004B",
                    }
                  : {
                      bottom: "100%",
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderBottom: "6px solid #23004B",
                    }),
                width: 0,
                height: 0,
              }}
            />
          </span>,
          document.body
        )}
    </span>
  );
}
