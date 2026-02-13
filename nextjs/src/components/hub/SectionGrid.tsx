"use client";

import { useState, useMemo } from "react";
import type { Section, Category } from "@/lib/types/database";
import { SectionCard } from "./SectionCard";
import { SearchBar } from "./SearchBar";
import { FilterButtons } from "./FilterButtons";

interface SectionGridProps {
  sections: Section[];
  categories: Category[];
}

export function SectionGrid({ sections, categories }: SectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    let filtered = sections;

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter((s) => s.category_id === activeCategory);
    }

    // Filter by search
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
      {filteredSections.length > 0 ? (
        <div className="grid">
          {filteredSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No sections found</h3>
          <p>Try adjusting your search terms or clearing the filter.</p>
        </div>
      )}
    </>
  );
}
