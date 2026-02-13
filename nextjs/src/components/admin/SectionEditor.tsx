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

  if (subView?.type === "content") {
    return (
      <div>
        <button
          className="filter-btn"
          onClick={handleBack}
          style={{ marginBottom: "1rem" }}
        >
          {backLabel}
        </button>
        <ContentBlockEditor sectionId={subView.sectionId} />
      </div>
    );
  }

  if (subView?.type === "toc") {
    return (
      <div>
        <button
          className="filter-btn"
          onClick={handleBack}
          style={{ marginBottom: "1rem" }}
        >
          {backLabel}
        </button>
        <TocEditor sectionId={subView.sectionId} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Sections</h2>
        <button className="filter-btn active" onClick={handleCreate}>
          + New Section
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sections.map((section) => (
          <div
            key={section.id}
            className="doc-item"
            style={{
              background: "var(--zelis-light-gray)",
              padding: "1.5rem",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "1.5rem", marginRight: "0.75rem" }}>
                {section.icon}
              </span>
              <strong>{section.title}</strong>
              <span
                style={{
                  marginLeft: "1rem",
                  fontSize: "0.85rem",
                  opacity: 0.6,
                }}
              >
                /{section.slug}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="filter-btn"
                onClick={() => setSubView({ type: "content", sectionId: section.id })}
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                Edit Content
              </button>
              <button
                className="filter-btn"
                onClick={() => setSubView({ type: "toc", sectionId: section.id })}
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                Edit TOC
              </button>
              <button
                className="filter-btn"
                onClick={() => handleEdit(section)}
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                Edit Section
              </button>
              <button
                onClick={() => setDeleteTarget(section)}
                style={{
                  background: "none",
                  border: "1px solid var(--zelis-red)",
                  color: "var(--zelis-red)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.8rem",
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
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <h3>{isCreating ? "New Section" : "Edit Section"}</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
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
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  className="filter-btn active"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : isCreating ? "Create" : "Save"}
                </button>
                <button
                  className="filter-btn"
                  onClick={() => {
                    setEditingSection(null);
                    setIsCreating(false);
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
