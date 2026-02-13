import Link from "next/link";
import type { Section } from "@/lib/types/database";

interface SectionCardProps {
  section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link href={`/${section.slug}`} style={{ textDecoration: "none" }}>
      <div className="card">
        <div className="card-icon">{section.icon}</div>
        <div className="card-title">{section.title}</div>
        <div className="card-description">{section.description}</div>
        <div className="card-arrow">→</div>
      </div>
    </Link>
  );
}
