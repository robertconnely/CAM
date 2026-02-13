"use client";

import { textareaStyle, labelStyle, fieldGroup } from "./editorStyles";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function HtmlEditor({ content, onChange }: Props) {
  return (
    <div style={fieldGroup}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Raw HTML</label>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--zelis-red)",
            fontWeight: 600,
          }}
        >
          Use with caution
        </span>
      </div>
      <textarea
        value={(content.html as string) ?? ""}
        onChange={(e) => onChange({ ...content, html: e.target.value })}
        rows={8}
        style={{
          ...textareaStyle,
          fontFamily: "monospace",
          fontSize: "0.85rem",
        }}
        placeholder="<div>Raw HTML content...</div>"
      />
    </div>
  );
}
