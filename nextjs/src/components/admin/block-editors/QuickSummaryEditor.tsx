"use client";

import { textareaStyle, labelStyle, fieldGroup } from "./editorStyles";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function QuickSummaryEditor({ content, onChange }: Props) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Quick Summary</label>
      <textarea
        value={(content.text as string) ?? ""}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        rows={4}
        style={textareaStyle}
        placeholder="Brief summary of this section..."
      />
    </div>
  );
}
