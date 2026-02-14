"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

interface EditPageLinkProps {
  sectionId: string;
  slug: string;
}

export function EditPageLink({ sectionId, slug }: EditPageLinkProps) {
  const { role } = useAuth();

  if (role !== "admin" && role !== "editor") return null;

  return (
    <Link
      href={`/cam/settings?section=${sectionId}&from=${slug}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "var(--zelis-blue-purple)",
        textDecoration: "none",
        padding: "0.3rem 0.75rem",
        borderRadius: "6px",
        border: "1px solid var(--zelis-blue-purple)",
        opacity: 0.7,
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
    >
      &#9998; Edit Page
    </Link>
  );
}
