"use client";

import { useState } from "react";
import type {
  Section,
  Category,
  Profile,
  Document as DocType,
  UserRole,
} from "@/lib/types/database";
import { SectionEditor } from "./SectionEditor";
import { DocumentUploader } from "./DocumentUploader";
import { UserManager } from "./UserManager";
import { ToastProvider } from "./Toast";

interface AdminDashboardProps {
  sections: Section[];
  categories: Category[];
  profiles: Profile[];
  documents: (DocType & { sections?: { title: string; slug: string } })[];
  userRole: UserRole;
  editSectionId?: string;
  editFromSlug?: string;
}

type Tab = "sections" | "documents" | "users";

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  sections: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  documents: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 14c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const tabMeta: { key: Tab; label: string; adminOnly?: boolean }[] = [
  { key: "sections", label: "Content" },
  { key: "documents", label: "Documents" },
  { key: "users", label: "Users", adminOnly: true },
];

export function AdminDashboard({
  sections,
  categories,
  profiles,
  documents,
  userRole,
  editSectionId,
  editFromSlug,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("sections");

  return (
    <ToastProvider>
      <div style={{ padding: "2rem 2.5rem", maxWidth: 1120 }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--zelis-purple, #321478)",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.85rem",
              color: "var(--zelis-medium-gray, #888)",
              fontWeight: 500,
            }}
          >
            Manage content, documents, and users
          </p>
        </div>

        {/* Tab pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tabMeta
            .filter((tab) => !tab.adminOnly || userRole === "admin")
            .map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: active
                      ? "var(--zelis-blue-purple, #5F5FC3)"
                      : "#fff",
                    color: active
                      ? "#fff"
                      : "var(--zelis-dark, #23004B)",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: active
                      ? "0 2px 8px rgba(95, 95, 195, 0.3)"
                      : "0px 2px 12px rgba(130, 140, 225, 0.08)",
                  }}
                >
                  {TAB_ICONS[tab.key]}
                  {tab.label}
                </button>
              );
            })}
        </div>

        {/* Tab content */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
            padding: "1.5rem",
          }}
        >
          {activeTab === "sections" && (
            <SectionEditor
              sections={sections}
              categories={categories}
              editSectionId={editSectionId}
              editFromSlug={editFromSlug}
            />
          )}
          {activeTab === "documents" && (
            <DocumentUploader documents={documents} sections={sections} />
          )}
          {activeTab === "users" && userRole === "admin" && (
            <UserManager profiles={profiles} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
