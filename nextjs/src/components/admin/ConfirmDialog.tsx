"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: "2rem",
          maxWidth: 400,
          width: "100%",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.15)",
        }}
      >
        <h3 style={{
          marginTop: 0,
          marginBottom: "0.5rem",
          fontSize: "1.1rem",
          fontWeight: 800,
          color: "var(--zelis-purple, #321478)",
        }}>{title}</h3>
        <p style={{
          marginBottom: "1.5rem",
          fontSize: "0.85rem",
          color: "var(--zelis-dark-gray, #555)",
          lineHeight: 1.5,
        }}>{message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid var(--zelis-ice, #ECE9FF)",
              background: "#fff",
              color: "var(--zelis-dark, #23004B)",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--zelis-red, #E61E2D)",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(230, 30, 45, 0.25)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
