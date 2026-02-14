"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { InvestmentCase } from "@/lib/types/database";

interface ScoreButtonProps {
  investmentCase: InvestmentCase | null;
}

export function ScoreButton({ investmentCase }: ScoreButtonProps) {
  const { role } = useAuth();
  const [alreadyScored, setAlreadyScored] = useState<boolean | null>(null);

  useEffect(() => {
    if (!investmentCase) return;

    const supabase = createClient();

    async function checkScored() {
      // Find bridge initiative for this case, then check for capital_scores
      const { data: inits } = await supabase
        .from("initiatives")
        .select("id")
        .eq("investment_case_id", investmentCase!.id)
        .limit(1);

      if (!inits || inits.length === 0) {
        setAlreadyScored(false);
        return;
      }

      const { count } = await supabase
        .from("capital_scores")
        .select("id", { count: "exact", head: true })
        .eq("initiative_id", inits[0].id);

      setAlreadyScored((count ?? 0) > 0);
    }

    checkScored();
  }, [investmentCase]);

  if (!investmentCase) return null;

  // Only show for submitted cases to editors/admins
  if (investmentCase.status !== "submitted") return null;
  if (role !== "admin" && role !== "editor") return null;

  // Hide while loading or if already scored
  if (alreadyScored === null || alreadyScored) return null;

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
