"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Section, Category } from "@/lib/types/database";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { TocEditor } from "./TocEditor";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

interface SectionEditorProps {
  sections: Section[];
  categories: Category[];
  editSectionId?: string;
  editFromSlug?: string;
}

type SubView = null | { type: "content"; sectionId: string } | { type: "toc"; sectionId: string };

export function SectionEditor({ sections, categories, editSectionId, editFromSlug }: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [subView, setSubView] = useState<SubView>(
    editSectionId ? { type: "content", sectionId: editSectionId } : null
  );
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    icon: "",
    category_id: "",
    keywords: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setIsCreating(false);
    setFormData({
      title: section.title,
      slug: section.slug,
      description: section.description,
      icon: section.icon,
      category_id: section.category_id,
      keywords: section.keywords.join(", "),
    });
  };

  const handleCreate = () => {
    setEditingSection(null);
    setIsCreating(true);
    setFormData({
      title: "",
      slug: "",
      description: "",
      icon: "",
      category_id: categories[0]?.id ?? "",
      keywords: "",
    });
  };

  const handleTitleChange = (title: string) => {
    const newData = { ...formData, title };
    if (isCreating) {
      newData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    setFormData(newData);
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      category_id: formData.category_id,
      keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    };

    if (isCreating) {
      const nextOrder = sections.length > 0
        ? Math.max(...sections.map((s) => s.display_order)) + 1
        : 0;

      const { error } = await supabase.from("sections").insert({
        ...payload,
        display_order: nextOrder,
      });

      setSaving(false);
      if (error) {
        showToast(`Failed to create section: ${error.message}`, "error");
      } else {
        showToast("Section created", "success");
        setIsCreating(false);
        router.refresh();
      }
    } else if (editingSection) {
      const { error } = await supabase
        .from("sections")
        .update(payload)
        .eq("id", editingSection.id);

      setSaving(false);
      if (error) {
        showToast(`Failed to save section: ${error.message}`, "error");
      } else {
        showToast("Section saved", "success");
        setEditingSection(null);
        router.refresh();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      showToast(`Failed to delete section: ${error.message}`, "error");
    } else {
      showToast("Section deleted", "success");
      router.refresh();
    }
    setDeleteTarget(null);
  };

  const backLabel = editFromSlug && subView?.sectionId === editSectionId
    ? `\u2190 Back to Page`
    : `\u2190 Back to Sections`;

  const handleBack = () => {
    if (editFromSlug && subView?.sectionId === editSectionId) {
      router.push(`/${editFromSlug}`);
    } else {
      setSubView(null);
    }
  };

  const backButtonStyle = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 6,
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid var(--zelis-ice, #ECE9FF)",
    background: "#fff",
    color: "var(--zelis-dark, #23004B)",
    fontSize: "0.8rem",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer" as const,
    marginBottom: "1.25rem",
  };

  if (subView?.type === "content") {
    return (
      <div>
        <button onClick={handleBack} style={backButtonStyle}>
          {backLabel}
        </button>
        <ContentBlockEditor sectionId={subView.sectionId} />
      </div>
    );
  }

  if (subView?.type === "toc") {
    return (
      <div>
        <button onClick={handleBack} style={backButtonStyle}>
          {backLabel}
        </button>
        <TocEditor sectionId={subView.sectionId} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
          }}>Sections</h2>
          <p style={{
            margin: "0.15rem 0 0",
            fontSize: "0.78rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}>{sections.length} content sections</p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--zelis-blue-purple, #5F5FC3)",
            color: "#fff",
            fontSize: "0.8rem",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(95, 95, 195, 0.25)",
          }}
        >
          + New Section
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              background: "var(--zelis-ice, #ECE9FF)",
              padding: "1rem 1.25rem",
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "box-shadow 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span style={{
                fontSize: "1.25rem",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: 8,
                flexShrink: 0,
              }}>
                {section.icon}
              </span>
              <div>
                <div style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--zelis-dark, #23004B)",
                }}>{section.title}</div>
                <div style={{
                  fontSize: "0.72rem",
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  fontWeight: 500,
                }}>/{section.slug}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[
                { label: "Content", onClick: () => setSubView({ type: "content", sectionId: section.id }) },
                { label: "TOC", onClick: () => setSubView({ type: "toc", sectionId: section.id }) },
                { label: "Edit", onClick: () => handleEdit(section) },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.onClick}
                  style={{
                    background: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: "0.35rem 0.7rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    color: "var(--zelis-dark, #23004B)",
                    transition: "all 0.15s",
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => setDeleteTarget(section)}
                style={{
                  background: "none",
                  border: "1px solid var(--zelis-red, #E61E2D)",
                  color: "var(--zelis-red, #E61E2D)",
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: "0.35rem 0.7rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editingSection || isCreating) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingSection(null);
              setIsCreating(false);
            }
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: "2rem",
              maxWidth: 600,
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.15)",
            }}
          >
            <h3 style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--zelis-purple, #321478)",
            }}>{isCreating ? "New Section" : "Edit Section"}</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1.25rem",
              }}
            >
              <label>
                Title
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
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
                Slug
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
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
                Description
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "2px solid var(--zelis-ice)",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </label>
              <label>
                Icon (emoji)
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
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
                Category
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "2px solid var(--zelis-ice)",
                    fontFamily: "inherit",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Keywords (comma-separated)
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "2px solid var(--zelis-ice)",
                    fontFamily: "inherit",
                  }}
                />
              </label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--zelis-blue-purple, #5F5FC3)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    boxShadow: "0 2px 8px rgba(95, 95, 195, 0.25)",
                  }}
                >
                  {saving ? "Saving..." : isCreating ? "Create" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setIsCreating(false);
                  }}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "1px solid var(--zelis-ice, #ECE9FF)",
                    background: "#fff",
                    color: "var(--zelis-dark, #23004B)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Section"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All content blocks, documents, and TOC items in this section will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
