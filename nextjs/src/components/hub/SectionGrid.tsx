"use client";

import { useState, useMemo } from "react";
import type { Section, Category } from "@/lib/types/database";
import { SectionCard } from "./SectionCard";
import { SearchBar } from "./SearchBar";
import { FilterButtons } from "./FilterButtons";

// Accent colors cycle per category (Zelis brand palette)
const CATEGORY_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  "#321478", // Ink Shade 1
  "#5F5FC3", // Ink Shade 3
  "#320FFF", // Bright Blue
  "#41329B", // Ink Shade 2
  "#828CE1", // Ink Shade 4
  "#FFBE00", // Gold
];

function getCategoryColor(categoryId: string, categories: Category[]): string {
  if (!CATEGORY_COLORS[categoryId]) {
    const idx = categories.findIndex((c) => c.id === categoryId);
    CATEGORY_COLORS[categoryId] = COLOR_PALETTE[idx % COLOR_PALETTE.length] ?? "#321478";
  }
  return CATEGORY_COLORS[categoryId];
}

interface SectionGridProps {
  sections: Section[];
  categories: Category[];
}

export function SectionGrid({ sections, categories }: SectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    let filtered = sections;

    if (activeCategory) {
      filtered = filtered.filter((s) => s.category_id === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sections, activeCategory, searchQuery]);

  const handleFilter = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setSearchQuery("");
  };

  return (
    <>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterButtons
        categories={categories}
        activeCategory={activeCategory}
        onFilter={handleFilter}
      />

      {/* Results count */}
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--zelis-medium-gray, #B4B4B9)",
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        {filteredSections.length === sections.length
          ? `${sections.length} section${sections.length !== 1 ? "s" : ""}`
          : `${filteredSections.length} of ${sections.length} sections`}
      </div>

      {filteredSections.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              accentColor={getCategoryColor(section.category_id, categories)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 2rem",
            background: "var(--zelis-ice, #ECE9FF)",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--zelis-purple, #321478)",
              marginBottom: "0.5rem",
            }}
          >
            No sections found
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--zelis-medium-gray, #797279)",
            }}
          >
            Try adjusting your search terms or clearing the filter.
          </div>
        </div>
      )}
    </>
  );
}
