"use client";

import Link from "next/link";
import type { Section } from "@/lib/types/database";

interface SectionCardProps {
  section: Section;
  accentColor?: string;
}

export function SectionCard({ section, accentColor = "#321478" }: SectionCardProps) {
  return (
    <Link
      href={`/${section.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
      onMouseEnter={(e) => {
        const card = e.currentTarget.querySelector("[data-card]") as HTMLElement;
        if (card) {
          card.style.transform = "translateY(-2px)";
          card.style.boxShadow = "0px 6px 28px 9px rgba(130, 140, 225, 0.14)";
        }
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget.querySelector("[data-card]") as HTMLElement;
        if (card) {
          card.style.transform = "none";
          card.style.boxShadow = "0px 4px 28px 9px rgba(130, 140, 225, 0.07)";
        }
      }}
    >
      <div
        data-card
        style={{
          background: "white",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          borderLeft: `4px solid ${accentColor}`,
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          transition: "transform 0.15s, box-shadow 0.15s",
          cursor: "pointer",
          minHeight: 80,
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "var(--zelis-ice, #ECE9FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {section.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--zelis-purple, #321478)",
              lineHeight: 1.3,
              marginBottom: "0.2rem",
            }}
          >
            {section.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--zelis-medium-gray, #797279)",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {section.description}
          </div>
        </div>
        <div
          style={{
            color: accentColor,
            fontSize: "1.1rem",
            fontWeight: 700,
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          →
        </div>
      </div>
    </Link>
  );
}
