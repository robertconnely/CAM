"use client";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function KeyDocumentsEditor({ content: _content, onChange: _onChange }: Props) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "var(--zelis-ice)",
        borderRadius: "8px",
        fontSize: "0.9rem",
        opacity: 0.8,
      }}
    >
      Documents for this section are managed in the <strong>Documents</strong> tab.
      This block automatically displays all documents linked to this section.
    </div>
  );
}
