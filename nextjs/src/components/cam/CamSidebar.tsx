"use client";

import Link from "next/link";
import Image from "next/image";
import { NotificationBell } from "@/components/cam/notifications/NotificationBell";

interface NavItem {
  label: string;
  icon: string;
  href: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "◫", href: "/cam" },
  { label: "New Case", icon: "✦", href: "/cam/new" },
  { label: "ROIC Tree", icon: "⊛", href: "/cam/roic" },
  { label: "PDLC Framework", icon: "◉", href: "/cam/pdlc" },
  { label: "PDLC Pipeline", icon: "▥", href: "/cam/pipeline" },
  { label: "PLC Portfolio", icon: "◈", href: "/cam/portfolio" },
  { label: "Performance", icon: "◎", href: "/cam/performance", disabled: true },
  { label: "Calculators", icon: "⊞", href: "/cam/calculators", disabled: true },
  { label: "Reports", icon: "⊡", href: "/cam/reports", disabled: true },
];

interface CamSidebarProps {
  currentPath: string;
}

export function CamSidebar({ currentPath }: CamSidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        background: "var(--zelis-dark, #23004B)",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
      }}
    >
      {/* Company Logo */}
      <div style={{ padding: "20px 20px 0" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Image
            src="/brand/zelis-logo-white.png"
            alt="Zelis"
            width={100}
            height={59}
            style={{ height: "2.2rem", width: "auto" }}
            priority
          />
        </Link>
      </div>

      {/* App Title + Notifications */}
      <div style={{ padding: "14px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            C
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.5px",
                lineHeight: 1.2,
              }}
            >
              CAM
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.5,
                fontWeight: 400,
                letterSpacing: "0.3px",
              }}
            >
              Capital Allocation
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          margin: "0 20px 8px",
        }}
      />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 12px", overflow: "auto" }}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/cam"
              ? currentPath === "/cam"
              : currentPath.startsWith(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: "default",
                  userSelect: "none",
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: 0.6,
                    fontWeight: 600,
                  }}
                >
                  soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: isActive
                  ? "rgba(95,95,195,0.15)"
                  : "transparent",
                color: isActive
                  ? "var(--zelis-blue-purple, #5F5FC3)"
                  : "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(95,95,195,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          margin: "0 20px 0",
        }}
      />

      {/* User Card */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--zelis-purple, #321478)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          R
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            Rob
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 400,
            }}
          >
            SVP Operations
          </div>
        </div>
      </div>
    </aside>
  );
}
