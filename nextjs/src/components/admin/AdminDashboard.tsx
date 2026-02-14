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

const tabMeta: { key: Tab; label: string; icon: string; adminOnly?: boolean }[] = [
  { key: "sections", label: "Content", icon: "◉" },
  { key: "documents", label: "Documents", icon: "⊡" },
  { key: "users", label: "Users", icon: "◎", adminOnly: true },
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
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: active
                      ? "1px solid var(--zelis-blue-purple, #5F5FC3)"
                      : "1px solid var(--zelis-ice, #ECE9FF)",
                    background: active
                      ? "rgba(95,95,195,0.1)"
                      : "#fff",
                    color: active
                      ? "var(--zelis-blue-purple, #5F5FC3)"
                      : "var(--zelis-dark, #23004B)",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: active
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{tab.icon}</span>
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
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            padding: 24,
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
