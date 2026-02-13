"use client";

import { textareaStyle, labelStyle, fieldGroup } from "./editorStyles";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function SubtitleEditor({ content, onChange }: Props) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Subtitle Text</label>
      <textarea
        value={(content.text as string) ?? ""}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        rows={3}
        style={textareaStyle}
        placeholder="Section subtitle text..."
      />
    </div>
  );
}
