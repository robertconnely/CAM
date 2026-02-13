"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TocItem } from "@/lib/types/database";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

interface TocEditorProps {
  sectionId: string;
}

export function TocEditor({ sectionId }: TocEditorProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from("toc_items")
      .select("*")
      .eq("section_id", sectionId)
      .order("display_order");
    setItems(data ?? []);
    setLoading(false);
  }, [sectionId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const updateItem = async (id: string, field: "label" | "anchor", value: string) => {
    const { error } = await supabaseRef.current
      .from("toc_items")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      showToast(`Update failed: ${error.message}`, "error");
    } else {
      showToast("TOC item updated", "success");
      loadItems();
    }
  };

  const addItem = async () => {
    const nextOrder = items.length > 0
      ? Math.max(...items.map((i) => i.display_order)) + 1
      : 0;

    const { error } = await supabaseRef.current.from("toc_items").insert({
      section_id: sectionId,
      label: "New Item",
      anchor: "new-item",
      display_order: nextOrder,
    });

    if (error) {
      showToast(`Failed to add TOC item: ${error.message}`, "error");
    } else {
      showToast("TOC item added", "success");
      loadItems();
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabaseRef.current.from("toc_items").delete().eq("id", id);
    if (error) {
      showToast(`Delete failed: ${error.message}`, "error");
    } else {
      showToast("TOC item deleted", "success");
      loadItems();
    }
    setDeleteTarget(null);
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const a = items[index];
    const b = items[swapIndex];

    await Promise.all([
      supabaseRef.current.from("toc_items").update({ display_order: b.display_order }).eq("id", a.id),
      supabaseRef.current.from("toc_items").update({ display_order: a.display_order }).eq("id", b.id),
    ]);

    loadItems();
  };

  const autoGenerate = async () => {
    setSaving(true);

    // Fetch heading blocks for this section
    const { data: headings } = await supabaseRef.current
      .from("content_blocks")
      .select("content, display_order")
      .eq("section_id", sectionId)
      .eq("block_type", "heading")
      .order("display_order");

    if (!headings || headings.length === 0) {
      showToast("No heading blocks found in this section", "info");
      setSaving(false);
      return;
    }

    // Delete existing items
    await supabaseRef.current.from("toc_items").delete().eq("section_id", sectionId);

    // Insert new items from headings
    const newItems = headings.map((h, i) => ({
      section_id: sectionId,
      label: (h.content as Record<string, unknown>).text as string,
      anchor: (h.content as Record<string, unknown>).anchor as string ||
        ((h.content as Record<string, unknown>).text as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      display_order: i,
    }));

    const { error } = await supabaseRef.current.from("toc_items").insert(newItems);

    if (error) {
      showToast(`Auto-generate failed: ${error.message}`, "error");
    } else {
      showToast(`Generated ${newItems.length} TOC items from headings`, "success");
      loadItems();
    }

    setSaving(false);
  };

  if (loading) return <p>Loading TOC items...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Table of Contents</h2>
        <button
          className="filter-btn"
          onClick={autoGenerate}
          disabled={saving}
          style={{ fontSize: "0.8rem" }}
        >
          {saving ? "Generating..." : "Auto-generate from Headings"}
        </button>
      </div>

      <p className="opacity-75" style={{ marginBottom: "1.5rem" }}>
        {items.length} TOC items. These appear in the sidebar navigation.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              background: "var(--zelis-light-gray)",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--zelis-ice)",
            }}
          >
            <span style={{ fontSize: "0.8rem", opacity: 0.5, minWidth: "1.5rem" }}>
              {index + 1}.
            </span>
            <input
              type="text"
              defaultValue={item.label}
              onBlur={(e) => {
                if (e.target.value !== item.label) updateItem(item.id, "label", e.target.value);
              }}
              style={{
                flex: 1,
                padding: "0.35rem 0.5rem",
                borderRadius: "6px",
                border: "2px solid var(--zelis-ice)",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
              placeholder="Label"
            />
            <input
              type="text"
              defaultValue={item.anchor}
              onBlur={(e) => {
                if (e.target.value !== item.anchor) updateItem(item.id, "anchor", e.target.value);
              }}
              style={{
                width: "180px",
                padding: "0.35rem 0.5rem",
                borderRadius: "6px",
                border: "2px solid var(--zelis-ice)",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
              placeholder="anchor-id"
            />
            <div style={{ display: "flex", gap: "0.2rem" }}>
              <button
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                style={{
                  background: "none",
                  border: "1px solid var(--zelis-medium-gray)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  fontSize: "0.75rem",
                }}
              >
                &uarr;
              </button>
              <button
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                style={{
                  background: "none",
                  border: "1px solid var(--zelis-medium-gray)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  fontSize: "0.75rem",
                }}
              >
                &darr;
              </button>
              <button
                onClick={() => setDeleteTarget(item.id)}
                style={{
                  background: "var(--zelis-red)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  fontSize: "0.75rem",
                }}
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="filter-btn"
        onClick={addItem}
        style={{ marginTop: "1rem", fontSize: "0.85rem" }}
      >
        + Add TOC Item
      </button>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete TOC Item"
        message="Are you sure you want to delete this TOC item?"
        onConfirm={() => deleteTarget && deleteItem(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
