"use client";

import { inputStyle, labelStyle, fieldGroup } from "./editorStyles";
import { RichTextEditor } from "./RichTextEditor";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function HeadingEditor({ content, onChange }: Props) {
  return (
    <div style={fieldGroup}>
      <div>
        <label style={labelStyle}>Heading Text</label>
        <input
          type="text"
          value={(content.text as string) ?? ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          style={inputStyle}
          placeholder="Section heading..."
        />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Level</label>
          <select
            value={(content.level as number) ?? 2}
            onChange={(e) => onChange({ ...content, level: Number(e.target.value) })}
            style={inputStyle}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Anchor ID</label>
          <input
            type="text"
            value={(content.anchor as string) ?? ""}
            onChange={(e) => onChange({ ...content, anchor: e.target.value })}
            style={inputStyle}
            placeholder="section-anchor"
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Body Text (optional)</label>
        <RichTextEditor
          content={(content.body as string) ?? ""}
          onChange={(html) => onChange({ ...content, body: html })}
          placeholder="Paragraph text below the heading..."
        />
      </div>
    </div>
  );
}
