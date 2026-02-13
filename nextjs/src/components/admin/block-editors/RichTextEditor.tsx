"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import type { CSSProperties } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px",
  padding: "0.4rem",
  borderBottom: "2px solid var(--zelis-ice)",
  background: "var(--zelis-light-gray)",
  borderRadius: "6px 6px 0 0",
};

const btnBase: CSSProperties = {
  background: "none",
  border: "1px solid transparent",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "0.2rem 0.5rem",
  fontSize: "0.8rem",
  fontFamily: "inherit",
  lineHeight: 1.4,
};

const btnActive: CSSProperties = {
  ...btnBase,
  background: "var(--zelis-ice)",
  border: "1px solid var(--zelis-blue-purple)",
  color: "var(--zelis-blue-purple)",
  fontWeight: 700,
};

const wrapperStyle: CSSProperties = {
  border: "2px solid var(--zelis-ice)",
  borderRadius: "6px",
  overflow: "hidden",
};

function ToolbarButton({
  label,
  isActive,
  onClick,
  style,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...(isActive ? btnActive : btnBase), ...style }}
      title={label}
    >
      {label}
    </button>
  );
}

const separator: CSSProperties = {
  width: "1px",
  background: "var(--zelis-medium-gray)",
  margin: "0 0.25rem",
  alignSelf: "stretch",
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          "min-height: 100px",
          "padding: 0.5rem",
          "font-family: inherit",
          "font-size: 0.9rem",
          "outline: none",
          "line-height: 1.7",
        ].join(";"),
      },
    },
  });

  if (!editor) return null;

  return (
    <div style={wrapperStyle}>
      <div style={toolbarStyle}>
        <ToolbarButton
          label="B"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ fontWeight: 700 }}
        />
        <ToolbarButton
          label="I"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ fontStyle: "italic" }}
        />
        <ToolbarButton
          label="U"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{ textDecoration: "underline" }}
        />
        <ToolbarButton
          label="S"
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ textDecoration: "line-through" }}
        />
        <div style={separator} />
        <ToolbarButton
          label="H3"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="H4"
          isActive={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        />
        <div style={separator} />
        <ToolbarButton
          label="&bull; List"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <div style={separator} />
        <ToolbarButton
          label="&ldquo; Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="&mdash;"
          isActive={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
      <EditorContent editor={editor} />
      <style>{`
        .tiptap p { margin-bottom: 0.6rem; }
        .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin-bottom: 0.6rem; list-style: revert; }
        .tiptap ul { list-style-type: disc; }
        .tiptap ol { list-style-type: decimal; }
        .tiptap li { margin-bottom: 0.2rem; }
        .tiptap blockquote {
          border-left: 3px solid var(--zelis-blue-purple);
          padding-left: 1rem;
          margin: 0.5rem 0;
          opacity: 0.85;
        }
        .tiptap h3 { font-size: 1.2rem; margin-top: 0.75rem; }
        .tiptap h4 { font-size: 1.05rem; margin-top: 0.5rem; }
        .tiptap p.is-editor-empty:first-child::before {
          content: "${placeholder || "Start typing..."}";
          color: var(--zelis-medium-gray);
          float: left;
          pointer-events: none;
          height: 0;
        }
        .tiptap hr { border: none; border-top: 1px solid var(--zelis-ice); margin: 1rem 0; }
      `}</style>
    </div>
  );
}
