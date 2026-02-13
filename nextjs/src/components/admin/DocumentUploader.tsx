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
      <h2>Upload Document</h2>
      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "500px",
          marginBottom: "2rem",
        }}
      >
        <label>
          Section
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "2px solid var(--zelis-ice)",
              fontFamily: "inherit",
            }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Document Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., PDLC Framework Guide"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "2px solid var(--zelis-ice)",
              fontFamily: "inherit",
            }}
          />
        </label>
        <label>
          File
          <input type="file" name="file" required style={{ fontFamily: "inherit" }} />
        </label>
        <button className="filter-btn active" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      <h2>All Documents ({documents.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="doc-item"
            style={{
              background: "var(--zelis-light-gray)",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="doc-icon">{doc.icon}</span>
              <div>
                <strong>{doc.title}</strong>
                <div
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.6,
                  }}
                >
                  {doc.sections?.title ?? "Unknown section"} &middot;{" "}
                  {doc.file_type.toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(doc)}
              style={{
                background: "var(--zelis-red)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "0.3rem 0.75rem",
                fontSize: "0.8rem",
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
