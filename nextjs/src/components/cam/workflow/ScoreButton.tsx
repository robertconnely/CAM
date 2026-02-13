"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import type { InvestmentCase } from "@/lib/types/database";

interface ScoreButtonProps {
  investmentCase: InvestmentCase | null;
}

export function ScoreButton({ investmentCase }: ScoreButtonProps) {
  const { role } = useAuth();

  if (!investmentCase) return null;

  // Only show for submitted cases to editors/admins
  if (investmentCase.status !== "submitted") return null;
  if (role !== "admin" && role !== "editor") return null;

  return (
    <Link
      href={`/cam/${investmentCase.id}/score`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 18px",
        borderRadius: 8,
        background:
          "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
      }}
    >
      Score This Case
    </Link>
  );
}
