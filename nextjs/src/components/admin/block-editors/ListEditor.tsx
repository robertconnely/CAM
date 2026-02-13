"use client";

import { inputStyle, labelStyle, fieldGroup, smallBtn, dangerSmallBtn } from "./editorStyles";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function ListEditor({ content, onChange }: Props) {
  const items = (content.items as string[]) ?? [];
  const ordered = (content.ordered as boolean) ?? false;

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange({ ...content, items: next });
  };

  const addItem = () => {
    onChange({ ...content, items: [...items, ""] });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div style={fieldGroup}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>List Items</label>
        <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={ordered}
            onChange={(e) => onChange({ ...content, ordered: e.target.checked })}
          />
          Ordered
        </label>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.5, minWidth: "1.5rem" }}>
            {ordered ? `${i + 1}.` : "\u2022"}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder={`Item ${i + 1}`}
          />
          <button type="button" onClick={() => removeItem(i)} style={dangerSmallBtn}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} style={smallBtn}>
        + Add Item
      </button>
    </div>
  );
}
