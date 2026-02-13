"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ContentBlock, ContentBlockType } from "@/lib/types/database";
import { BLOCK_EDITORS } from "./block-editors";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

interface ContentBlockEditorProps {
  sectionId: string;
}

const BLOCK_TYPES: { value: ContentBlockType; label: string }[] = [
  { value: "subtitle", label: "Subtitle" },
  { value: "quick_summary", label: "Quick Summary" },
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "list", label: "List" },
  { value: "figma_embed", label: "Figma Embed" },
  { value: "image_gallery", label: "Image Gallery" },
  { value: "key_documents", label: "Key Documents" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "html", label: "Raw HTML" },
];

function BlockCard({
  block,
  index,
  total,
  onMove,
  onDelete,
  onSave,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragTarget,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  onMove: (index: number, direction: "up" | "down") => void;
  onDelete: (blockId: string) => void;
  onSave: (blockId: string, content: Record<string, unknown>) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  isDragTarget: boolean;
}) {
  const [localContent, setLocalContent] = useState(block.content);
  const [dirty, setDirty] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const Editor = BLOCK_EDITORS[block.block_type];

  const handleChange = (content: Record<string, unknown>) => {
    setLocalContent(content);
    setDirty(true);
  };

  const handleSave = () => {
    onSave(block.id, localContent);
    setDirty(false);
  };

  return (
    <div
      ref={cardRef}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(index);
      }}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={() => {
        if (cardRef.current) cardRef.current.draggable = false;
        onDragEnd();
      }}
      style={{
        background: "var(--zelis-light-gray)",
        padding: "1.25rem",
        borderRadius: "8px",
        border: isDragTarget
          ? "2px dashed var(--zelis-blue-purple)"
          : dirty
            ? "2px solid var(--zelis-gold)"
            : "1px solid var(--zelis-ice)",
        opacity: isDragTarget ? 0.6 : 1,
        transition: "border 0.15s, opacity 0.15s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              cursor: "grab",
              fontSize: "1rem",
              opacity: 0.4,
              userSelect: "none",
              padding: "0.1rem 0.25rem",
            }}
            title="Drag to reorder"
            onMouseDown={() => {
              if (cardRef.current) cardRef.current.draggable = true;
            }}
            onMouseUp={() => {
              if (cardRef.current) cardRef.current.draggable = false;
            }}
          >
            &#x2630;
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "var(--zelis-blue-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {block.block_type} (#{block.display_order})
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            style={{
              background: "none",
              border: "1px solid var(--zelis-medium-gray)",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.2rem 0.5rem",
              fontSize: "0.8rem",
            }}
          >
            &uarr;
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={index === total - 1}
            style={{
              background: "none",
              border: "1px solid var(--zelis-medium-gray)",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.2rem 0.5rem",
              fontSize: "0.8rem",
            }}
          >
            &darr;
          </button>
          <button
            onClick={() => onDelete(block.id)}
            style={{
              background: "var(--zelis-red)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.2rem 0.5rem",
              fontSize: "0.8rem",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <Editor content={localContent} onChange={handleChange} />

      {dirty && (
        <button
          className="filter-btn active"
          onClick={handleSave}
          style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}
        >
          Save Changes
        </button>
      )}
    </div>
  );
}

export function ContentBlockEditor({ sectionId }: ContentBlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockType, setNewBlockType] = useState<ContentBlockType>("paragraph");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const { showToast } = useToast();

  const loadBlocks = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from("content_blocks")
      .select("*")
      .eq("section_id", sectionId)
      .order("display_order");
    setBlocks(data ?? []);
    setLoading(false);
  }, [sectionId]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const addBlock = async () => {
    setSaving(true);
    const nextOrder = blocks.length > 0
      ? Math.max(...blocks.map((b) => b.display_order)) + 1
      : 0;

    const defaultContent: Record<string, unknown> = {};
    if (newBlockType === "heading") {
      defaultContent.text = "New Heading";
      defaultContent.level = 2;
    } else if (newBlockType === "paragraph") {
      defaultContent.text = "New paragraph content.";
    } else if (newBlockType === "list") {
      defaultContent.items = ["Item 1"];
      defaultContent.ordered = false;
    } else if (newBlockType === "subtitle" || newBlockType === "quick_summary" || newBlockType === "coming_soon") {
      defaultContent.text = "";
    } else if (newBlockType === "html") {
      defaultContent.html = "";
    } else if (newBlockType === "figma_embed") {
      defaultContent.title = "Figma Board";
    } else if (newBlockType === "image_gallery") {
      defaultContent.images = [];
    } else if (newBlockType === "key_documents") {
      defaultContent.documentIds = [];
    }

    const { error } = await supabaseRef.current.from("content_blocks").insert({
      section_id: sectionId,
      block_type: newBlockType,
      content: defaultContent,
      display_order: nextOrder,
    });

    setSaving(false);
    if (error) {
      showToast(`Failed to add block: ${error.message}`, "error");
    } else {
      showToast("Block added", "success");
      loadBlocks();
    }
  };

  const saveBlock = async (blockId: string, content: Record<string, unknown>) => {
    const { error } = await supabaseRef.current
      .from("content_blocks")
      .update({ content })
      .eq("id", blockId);

    if (error) {
      showToast(`Save failed: ${error.message}`, "error");
    } else {
      showToast("Block saved", "success");
      router.refresh();
    }
  };

  const deleteBlock = async (blockId: string) => {
    const { error } = await supabaseRef.current
      .from("content_blocks")
      .delete()
      .eq("id", blockId);

    if (error) {
      showToast(`Delete failed: ${error.message}`, "error");
    } else {
      showToast("Block deleted", "success");
      loadBlocks();
    }
    setDeleteTarget(null);
  };

  const moveBlock = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= blocks.length) return;

    const a = blocks[index];
    const b = blocks[swapIndex];

    await Promise.all([
      supabaseRef.current
        .from("content_blocks")
        .update({ display_order: b.display_order })
        .eq("id", a.id),
      supabaseRef.current
        .from("content_blocks")
        .update({ display_order: a.display_order })
        .eq("id", b.id),
    ]);

    loadBlocks();
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Build new order: remove dragged block, insert at drop position
    const reordered = [...blocks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Optimistically update UI
    setBlocks(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    // Persist new display_order values
    const updates = reordered.map((block, i) => ({
      id: block.id,
      display_order: i,
    }));

    const results = await Promise.all(
      updates.map(({ id, display_order }) =>
        supabaseRef.current
          .from("content_blocks")
          .update({ display_order })
          .eq("id", id)
      )
    );

    const failed = results.some((r) => r.error);
    if (failed) {
      showToast("Failed to save new order", "error");
      loadBlocks(); // revert to server state
    } else {
      showToast("Order updated", "success");
    }
  };

  if (loading) return <p>Loading content blocks...</p>;

  return (
    <div>
      <h2>Content Blocks</h2>
      <p className="opacity-75" style={{ marginBottom: "1.5rem" }}>
        {blocks.length} blocks in this section. Drag blocks to reorder.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            index={index}
            total={blocks.length}
            onMove={moveBlock}
            onDelete={(id) => setDeleteTarget(id)}
            onSave={saveBlock}
            onDragStart={setDragIndex}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            isDragTarget={dragOverIndex === index && dragIndex !== index}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginTop: "1.5rem",
          alignItems: "center",
        }}
      >
        <select
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value as ContentBlockType)}
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            border: "2px solid var(--zelis-ice)",
            fontFamily: "inherit",
          }}
        >
          {BLOCK_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </select>
        <button
          className="filter-btn active"
          onClick={addBlock}
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Block"}
        </button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Block"
        message="Are you sure you want to delete this content block? This cannot be undone."
        onConfirm={() => deleteTarget && deleteBlock(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
