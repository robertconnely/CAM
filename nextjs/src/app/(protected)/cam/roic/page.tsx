import { createClient } from "@/lib/supabase/server";
import { RoicValueDriverTree } from "@/components/dashboard/roic-tree/RoicValueDriverTree";
import type { Initiative, CapitalScore } from "@/lib/types/database";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

export const metadata = {
  title: "ROIC Value Driver Tree — CAM",
};

export default async function RoicPage() {
  const supabase = await createClient();

  const [initiativesRes, capitalScoresRes] = await Promise.all([
    supabase
      .from("initiatives")
      .select("*")
      .order("priority_rank", { ascending: true, nullsFirst: false }),
    supabase
      .from("capital_scores")
      .select("*")
      .order("scored_at", { ascending: false }),
  ]);

  if (initiativesRes.error || capitalScoresRes.error) {
    throw new Error("Failed to load ROIC data. Please try again.");
  }

  const initiatives = (initiativesRes.data ?? []) as Initiative[];
  const capitalScores = (capitalScoresRes.data ?? []) as CapitalScore[];

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          <InfoTooltip text={GLOSSARY.ROIC}>ROIC</InfoTooltip> Value Driver Tree
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Aligning product initiatives to business value creation
        </p>
      </div>

      <RoicValueDriverTree
        initiatives={initiatives}
        capitalScores={capitalScores}
        hideTitle
      />
    </div>
  );
}
