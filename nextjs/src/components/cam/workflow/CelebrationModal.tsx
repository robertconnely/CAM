"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type CelebrationVariant = "submitted" | "approved" | "consider" | "hold" | "graduated";

interface CelebrationAction {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}

interface CelebrationModalProps {
  open: boolean;
  variant: CelebrationVariant;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    color: string;
    bg: string;
  };
  actions: CelebrationAction[];
  onClose: () => void;
}

const VARIANT_CONFIG: Record<
  CelebrationVariant,
  { gradient: string; icon: "check" | "star" | "info" | "pause" }
> = {
  submitted: {
    gradient: "linear-gradient(135deg, #321478, #5F5FC3)",
    icon: "check",
  },
  approved: {
    gradient: "linear-gradient(135deg, #321478, #320FFF)",
    icon: "check",
  },
  consider: {
    gradient: "linear-gradient(135deg, #5F5FC3, #828CE1)",
    icon: "info",
  },
  hold: {
    gradient: "linear-gradient(135deg, #B4B4B9, #797279)",
    icon: "pause",
  },
  graduated: {
    gradient: "linear-gradient(135deg, #FFBE00, #321478)",
    icon: "star",
  },
};

function IconSvg({ type }: { type: "check" | "star" | "info" | "pause" }) {
  if (type === "check") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (type === "star") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (type === "pause") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    );
  }
  // info
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const btnBase: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  borderRadius: 10,
  fontSize: "0.88rem",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 0.15s, transform 0.15s",
  whiteSpace: "nowrap",
};

export function CelebrationModal({
  open,
  variant,
  title,
  subtitle,
  badge,
  actions,
  onClose,
}: CelebrationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const config = VARIANT_CONFIG[variant];

  return (
    <>
      <style>{`
        @keyframes celebration-fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes celebration-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(35, 0, 75, 0.45)",
          animation: "celebration-overlay-in 0.2s ease",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            maxWidth: 480,
            width: "90%",
            boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.15)",
            overflow: "hidden",
            animation: "celebration-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Accent bar */}
          <div style={{ height: 4, background: config.gradient }} />

          {/* Content */}
          <div style={{ padding: "2rem 2rem 1.5rem", textAlign: "center" }}>
            {/* Icon badge */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: config.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                boxShadow: "0 4px 16px rgba(50, 20, 120, 0.25)",
              }}
            >
              <IconSvg type={config.icon} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--zelis-purple, #321478)",
                margin: "0 0 0.5rem",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>

            {/* Badge (for scoring results) */}
            {badge && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.35rem 1rem",
                  borderRadius: 20,
                  background: badge.bg,
                  color: badge.color,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                {badge.label}
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--zelis-medium-gray, #797279)",
                  lineHeight: 1.6,
                  margin: "0 0 1.5rem",
                  maxWidth: 380,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {actions.map((action, i) => {
                const style: React.CSSProperties = action.primary
                  ? {
                      ...btnBase,
                      background:
                        "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(50, 20, 120, 0.3)",
                    }
                  : {
                      ...btnBase,
                      background: "#fff",
                      color: "var(--zelis-dark, #23004B)",
                      border: "2px solid var(--zelis-ice, #ECE9FF)",
                    };

                if (action.href) {
                  return (
                    <Link key={i} href={action.href} style={style}>
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button key={i} onClick={action.onClick} style={style}>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
