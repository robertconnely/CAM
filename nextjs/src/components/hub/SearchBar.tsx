"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: "relative", maxWidth: 400, marginBottom: "0.75rem" }}>
      <span
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "0.85rem",
          color: "var(--zelis-medium-gray, #B4B4B9)",
          pointerEvents: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search sections, topics, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "0.5rem 1rem 0.5rem 2.25rem",
          borderRadius: "999px",
          border: "2px solid var(--zelis-ice, #ECE9FF)",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          background: "white",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--zelis-blue-purple, #5F5FC3)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--zelis-ice, #ECE9FF)";
        }}
      />
    </div>
  );
}
