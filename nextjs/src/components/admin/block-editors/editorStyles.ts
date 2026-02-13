import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "2px solid var(--zelis-ice)",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 600,
  fontSize: "0.85rem",
  marginBottom: "0.25rem",
  color: "var(--zelis-mid-purple)",
};

export const fieldGroup: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

export const smallBtn: CSSProperties = {
  background: "none",
  border: "1px solid var(--zelis-medium-gray)",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "0.25rem 0.6rem",
  fontSize: "0.8rem",
  fontFamily: "inherit",
};

export const dangerSmallBtn: CSSProperties = {
  ...smallBtn,
  color: "var(--zelis-red)",
  borderColor: "var(--zelis-red)",
};
