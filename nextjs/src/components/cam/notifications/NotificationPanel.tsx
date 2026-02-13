"use client";

import Link from "next/link";
import type { Notification } from "@/lib/types/database";

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  case_submitted: "📋",
  case_scored: "📊",
  comment_added: "💬",
};

export function NotificationPanel({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationPanelProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        width: 320,
        maxHeight: 400,
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zelis-dark, #23004B)" }}>
          Notifications
        </span>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: "none",
              border: "none",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--zelis-blue-purple, #5F5FC3)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: 340, overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--zelis-medium-gray, #797279)" }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--zelis-medium-gray, #797279)" }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.case_id ? `/cam/${n.case_id}` : "/cam"}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                onClose();
              }}
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 16px",
                textDecoration: "none",
                background: n.read ? "transparent" : "rgba(236, 233, 255, 0.3)",
                borderBottom: "1px solid #f5f5f5",
                transition: "background 0.12s",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                {TYPE_ICONS[n.type] ?? "🔔"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "var(--zelis-dark, #23004B)",
                    margin: "0 0 2px",
                    fontWeight: n.read ? 400 : 600,
                  }}
                >
                  {n.message}
                </p>
                <span style={{ fontSize: 11, color: "var(--zelis-medium-gray, #797279)" }}>
                  {formatTime(n.created_at)}
                </span>
              </div>
              {!n.read && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--zelis-blue-purple, #5F5FC3)",
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
