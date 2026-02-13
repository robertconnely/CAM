"use client";

import type { Category } from "@/lib/types/database";

interface FilterButtonsProps {
  categories: Category[];
  activeCategory: string | null;
  onFilter: (categoryId: string | null) => void;
}

export function FilterButtons({
  categories,
  activeCategory,
  onFilter,
}: FilterButtonsProps) {
  return (
    <div className="filters">
      <button
        className={`filter-btn ${activeCategory === null ? "active" : ""}`}
        onClick={() => onFilter(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`filter-btn ${activeCategory === category.id ? "active" : ""}`}
          onClick={() => onFilter(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
