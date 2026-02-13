"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search sections, topics, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
