"use client";

import { inputStyle, textareaStyle, labelStyle, fieldGroup } from "./editorStyles";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function FigmaEmbedEditor({ content, onChange }: Props) {
  return (
    <div style={fieldGroup}>
      <div>
        <label style={labelStyle}>Title</label>
        <input
          type="text"
          value={(content.title as string) ?? ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          style={inputStyle}
          placeholder="Figma board title"
        />
      </div>
      <div>
        <label style={labelStyle}>Embed URL</label>
        <input
          type="text"
          value={(content.embedUrl as string) ?? ""}
          onChange={(e) => onChange({ ...content, embedUrl: e.target.value })}
          style={inputStyle}
          placeholder="https://www.figma.com/embed?..."
        />
      </div>
      <div>
        <label style={labelStyle}>Image URL (fallback)</label>
        <input
          type="text"
          value={(content.imageUrl as string) ?? ""}
          onChange={(e) => onChange({ ...content, imageUrl: e.target.value })}
          style={inputStyle}
          placeholder="URL to static image"
        />
      </div>
      <div>
        <label style={labelStyle}>Figma File URL</label>
        <input
          type="text"
          value={(content.figmaUrl as string) ?? ""}
          onChange={(e) => onChange({ ...content, figmaUrl: e.target.value })}
          style={inputStyle}
          placeholder="https://www.figma.com/file/..."
        />
      </div>
      <div>
        <label style={labelStyle}>Note</label>
        <textarea
          value={(content.note as string) ?? ""}
          onChange={(e) => onChange({ ...content, note: e.target.value })}
          rows={2}
          style={textareaStyle}
          placeholder="Optional note about this embed..."
        />
      </div>
    </div>
  );
}
