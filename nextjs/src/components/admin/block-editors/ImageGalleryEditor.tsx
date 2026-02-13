"use client";

import { inputStyle, labelStyle, fieldGroup, smallBtn, dangerSmallBtn } from "./editorStyles";

interface ImageEntry {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function ImageGalleryEditor({ content, onChange }: Props) {
  const images = (content.images as ImageEntry[]) ?? [];

  const updateImage = (index: number, field: keyof ImageEntry, value: string) => {
    const next = [...images];
    next[index] = { ...next[index], [field]: value };
    onChange({ ...content, images: next });
  };

  const addImage = () => {
    onChange({ ...content, images: [...images, { src: "", alt: "", caption: "" }] });
  };

  const removeImage = (index: number) => {
    onChange({ ...content, images: images.filter((_, i) => i !== index) });
  };

  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Images ({images.length})</label>
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            padding: "0.75rem",
            border: "1px solid var(--zelis-ice)",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, opacity: 0.6 }}>Image {i + 1}</span>
            <button type="button" onClick={() => removeImage(i)} style={dangerSmallBtn}>
              Remove
            </button>
          </div>
          <input
            type="text"
            value={img.src}
            onChange={(e) => updateImage(i, "src", e.target.value)}
            style={inputStyle}
            placeholder="Image URL or storage path"
          />
          <input
            type="text"
            value={img.alt}
            onChange={(e) => updateImage(i, "alt", e.target.value)}
            style={inputStyle}
            placeholder="Alt text"
          />
          <input
            type="text"
            value={img.caption ?? ""}
            onChange={(e) => updateImage(i, "caption", e.target.value)}
            style={inputStyle}
            placeholder="Caption (optional)"
          />
        </div>
      ))}
      <button type="button" onClick={addImage} style={smallBtn}>
        + Add Image
      </button>
    </div>
  );
}
