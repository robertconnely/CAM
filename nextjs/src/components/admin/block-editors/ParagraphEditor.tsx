"use client";

import { textareaStyle, labelStyle, fieldGroup } from "./editorStyles";
import { RichTextEditor } from "./RichTextEditor";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function ParagraphEditor({ content, onChange }: Props) {
  const isHtmlMode = !!content.html && !content.text;

  const toggleMode = () => {
    if (isHtmlMode) {
      onChange({ text: content.html as string, html: undefined });
    } else {
      onChange({ html: content.text as string, text: undefined });
    }
  };

  return (
    <div style={fieldGroup}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>
          {isHtmlMode ? "HTML Content" : "Paragraph Text"}
        </label>
        <button
          type="button"
          onClick={toggleMode}
          style={{
            background: "none",
            border: "1px solid var(--zelis-medium-gray)",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "0.15rem 0.5rem",
            fontSize: "0.75rem",
            fontFamily: "inherit",
          }}
        >
          Switch to {isHtmlMode ? "Rich Text" : "HTML"}
        </button>
      </div>
      {isHtmlMode ? (
        <textarea
          value={(content.html as string) ?? ""}
          onChange={(e) => onChange({ ...content, html: e.target.value })}
          rows={5}
          style={{
            ...textareaStyle,
            fontFamily: "monospace",
            fontSize: "0.85rem",
          }}
          placeholder="<p>HTML content...</p>"
        />
      ) : (
        <RichTextEditor
          content={(content.text as string) ?? ""}
          onChange={(html) => onChange({ ...content, text: html })}
          placeholder="Paragraph text..."
        />
      )}
    </div>
  );
}
