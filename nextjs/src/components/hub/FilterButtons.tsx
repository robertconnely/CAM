"use client";

import type { Category } from "@/lib/types/database";

interface FilterButtonsProps {
  categories: Category[];
  activeCategory: string | null;
  onFilter: (categoryId: string | null) => void;
}

const btnBase: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  borderRadius: "999px",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "var(--zelis-ice, #ECE9FF)",
  background: "white",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 600,
  fontFamily: "inherit",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  color: "var(--zelis-dark, #23004B)",
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: "var(--zelis-purple, #321478)",
  color: "white",
  borderColor: "var(--zelis-purple, #321478)",
};

export function FilterButtons({
  categories,
  activeCategory,
  onFilter,
}: FilterButtonsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--zelis-blue-purple, #5F5FC3)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Category:
      </span>
      <button
        style={activeCategory === null ? btnActive : btnBase}
        onClick={() => onFilter(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          style={activeCategory === category.id ? btnActive : btnBase}
          onClick={() => onFilter(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
