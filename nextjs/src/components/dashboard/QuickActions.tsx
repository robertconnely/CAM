"use client";

import Link from "next/link";
import type { UserRole } from "@/lib/types/database";

interface QuickActionsProps {
  role: UserRole | null;
}

const ACTIONS = [
  {
    label: "New Initiative",
    description: "Start a new product initiative through the PDLC",
    href: "/pdlc/tracker",
    gradient:
      "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
    color: "white",
    iconColor: "rgba(255,255,255,0.3)",
    requiresEditor: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <path d="M14 8v12M8 14h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Capital Scoring",
    description: "Score an initiative for investment allocation",
    href: "/pdlc/tracker/capital",
    gradient: "linear-gradient(135deg, #fffbe6 0%, #fff3e0 100%)",
    color: "var(--zelis-purple)",
    iconColor: "var(--zelis-gold)",
    requiresEditor: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="16" width="4" height="9" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="9" y="11" width="4" height="14" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="15" y="7" width="4" height="18" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="21" y="3" width="4" height="22" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Knowledge Hub",
    description: "Browse operating system resources and documents",
    href: "/hub",
    gradient: "linear-gradient(135deg, var(--zelis-ice) 0%, #f5f3ff 100%)",
    color: "var(--zelis-purple)",
    iconColor: "var(--zelis-blue-purple)",
    requiresEditor: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 5h8l2 2h10v16H4V5z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M8 13h12M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
  },
  {
    label: "Stage Gate Tracker",
    description: "View the full initiative pipeline and gate reviews",
    href: "/pdlc/tracker",
    gradient: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
    color: "#2e7d32",
    iconColor: "#2e7d32",
    requiresEditor: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 14h5l3-8 4 16 3-8h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>
    ),
  },
];

export function QuickActions({ role }: QuickActionsProps) {
  const canEdit = role === "admin" || role === "editor";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
      }}
    >
      {ACTIONS.map((action) => {
        if (action.requiresEditor && !canEdit) return null;
        return (
          <Link
            key={action.label}
            href={action.href}
            style={{
              background: action.gradient,
              borderRadius: "10px",
              padding: "1.25rem",
              textDecoration: "none",
              color: action.color,
              transition: "all 0.2s",
              boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0px 8px 32px 9px rgba(130, 140, 225, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0px 4px 28px 9px rgba(130, 140, 225, 0.07)";
            }}
          >
            <div style={{ color: action.iconColor }}>{action.icon}</div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
              {action.label}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                opacity: 0.7,
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {action.description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
