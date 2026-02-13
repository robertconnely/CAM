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

  const tabs: { key: Tab; label: string; adminOnly?: boolean }[] = [
    { key: "sections", label: "Sections & Content" },
    { key: "documents", label: "Documents" },
    { key: "users", label: "Users", adminOnly: true },
  ];

  return (
    <ToastProvider>
      <main className="site-main">
        <h1>Admin Dashboard</h1>
        <p className="opacity-75" style={{ marginBottom: "2rem" }}>
          Manage content, documents, and users.
        </p>

        <div className="filters" style={{ marginBottom: "2rem" }}>
          {tabs
            .filter((tab) => !tab.adminOnly || userRole === "admin")
            .map((tab) => (
              <button
                key={tab.key}
                className={`filter-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
        </div>

        {activeTab === "sections" && (
          <SectionEditor sections={sections} categories={categories} editSectionId={editSectionId} editFromSlug={editFromSlug} />
        )}
        {activeTab === "documents" && (
          <DocumentUploader documents={documents} sections={sections} />
        )}
        {activeTab === "users" && userRole === "admin" && (
          <UserManager profiles={profiles} />
        )}
      </main>
    </ToastProvider>
  );
}
