"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Section, Document as DocType } from "@/lib/types/database";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

interface DocumentUploaderProps {
  documents: (DocType & { sections?: { title: string; slug: string } })[];
  sections: Section[];
}

const FILE_TYPE_ICONS: Record<string, string> = {
  docx: "\u{1F4C4}",
  pptx: "\u{1F4CA}",
  xlsx: "\u{1F4C8}",
  pdf: "\u{1F4D5}",
  png: "\u{1F5BC}\uFE0F",
  html: "\u{1F310}",
};

export function DocumentUploader({
  documents,
  sections,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(
    sections[0]?.id ?? ""
  );
  const [title, setTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DocType | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || !selectedSection || !title) return;

    setUploading(true);

    const section = sections.find((s) => s.id === selectedSection);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const storagePath = `${section?.slug}/${file.name}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      showToast(`Upload failed: ${uploadError.message}`, "error");
      setUploading(false);
      return;
    }

    // Create document record
    const { error: dbError } = await supabase.from("documents").insert({
      section_id: selectedSection,
      title,
      storage_path: storagePath,
      file_type: ext,
      icon: FILE_TYPE_ICONS[ext] ?? "\u{1F4C4}",
    });

    if (dbError) {
      showToast(`Failed to save document record: ${dbError.message}`, "error");
    } else {
      showToast("Document uploaded", "success");
      setTitle("");
      router.refresh();
    }

    setUploading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await supabase.storage.from("documents").remove([deleteTarget.storage_path]);
    const { error } = await supabase.from("documents").delete().eq("id", deleteTarget.id);

    if (error) {
      showToast(`Delete failed: ${error.message}`, "error");
    } else {
      showToast("Document deleted", "success");
      router.refresh();
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <h2 style={{
        margin: 0,
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--zelis-dark, #23004B)",
      }}>Upload Document</h2>
      <p style={{
        margin: "0.15rem 0 1rem",
        fontSize: "0.78rem",
        color: "var(--zelis-medium-gray, #888)",
        fontWeight: 500,
      }}>Add a new document to a content section</p>

      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: 500,
          marginBottom: "2rem",
          padding: "1.25rem",
          background: "var(--zelis-ice, #ECE9FF)",
          borderRadius: 10,
        }}
      >
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--zelis-dark, #23004B)" }}>
          Section
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: 4,
              borderRadius: 6,
              border: "1.5px solid rgba(95,95,195,0.2)",
              fontFamily: "inherit",
              fontSize: "0.82rem",
              background: "#fff",
            }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.title}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--zelis-dark, #23004B)" }}>
          Document Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., PDLC Framework Guide"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: 4,
              borderRadius: 6,
              border: "1.5px solid rgba(95,95,195,0.2)",
              fontFamily: "inherit",
              fontSize: "0.82rem",
            }}
          />
        </label>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--zelis-dark, #23004B)" }}>
          File
          <input type="file" name="file" required style={{ display: "block", marginTop: 4, fontFamily: "inherit", fontSize: "0.82rem" }} />
        </label>
        <button
          disabled={uploading}
          style={{
            alignSelf: "flex-start",
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: "var(--zelis-blue-purple, #5F5FC3)",
            color: "#fff",
            fontSize: "0.82rem",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
            boxShadow: "0 2px 8px rgba(95, 95, 195, 0.25)",
          }}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--zelis-ice, #ECE9FF)", margin: "0.5rem 0 1.5rem" }} />

      <h2 style={{
        margin: "0 0 0.15rem",
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--zelis-dark, #23004B)",
      }}>All Documents</h2>
      <p style={{
        margin: "0 0 1rem",
        fontSize: "0.78rem",
        color: "var(--zelis-medium-gray, #888)",
        fontWeight: 500,
      }}>{documents.length} documents uploaded</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: "var(--zelis-ice, #ECE9FF)",
              padding: "0.85rem 1rem",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span style={{
                fontSize: "1.1rem",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: 6,
                flexShrink: 0,
              }}>{doc.icon}</span>
              <div>
                <div style={{
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: "var(--zelis-dark, #23004B)",
                }}>{doc.title}</div>
                <div style={{
                  fontSize: "0.72rem",
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  fontWeight: 500,
                }}>
                  {doc.sections?.title ?? "Unknown section"} &middot;{" "}
                  <span style={{
                    display: "inline-block",
                    padding: "0 5px",
                    borderRadius: 3,
                    background: "rgba(95,95,195,0.1)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--zelis-blue-purple, #5F5FC3)",
                  }}>{doc.file_type.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(doc)}
              style={{
                background: "none",
                border: "1px solid var(--zelis-red, #E61E2D)",
                color: "var(--zelis-red, #E61E2D)",
                borderRadius: 6,
                cursor: "pointer",
                padding: "0.3rem 0.7rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
