import { createClient } from "@/lib/supabase/server";
import { PipelineKanban } from "@/components/dashboard/PipelineKanban";
import { PipelineKpiCards } from "@/components/dashboard/PipelineKpiCards";
import { InitiativeViewToggle } from "@/components/dashboard/InitiativeViewToggle";
import type { Initiative, PdlcPhase, CapitalScore } from "@/lib/types/database";

export const metadata = {
  title: "Initiative Pipeline — CAM",
};

export default async function PipelinePage() {
  const supabase = await createClient();

  const [initiativesRes, phasesRes, capitalScoresRes] = await Promise.all([
    supabase
      .from("initiatives")
      .select("*")
      .order("priority_rank", { ascending: true, nullsFirst: false }),
    supabase
      .from("pdlc_phases")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("capital_scores")
      .select("*")
      .order("scored_at", { ascending: false }),
  ]);

  if (initiativesRes.error || phasesRes.error || capitalScoresRes.error) {
    throw new Error("Failed to load pipeline data. Please try again.");
  }

  const initiatives = (initiativesRes.data ?? []) as Initiative[];
  const phases = (phasesRes.data ?? []) as PdlcPhase[];
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
          Initiative Pipeline
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Track active initiatives across all PDLC phases
        </p>
      </div>

      <InitiativeViewToggle active="pipeline" />

      {/* KPI Dashboard Cards */}
      <div style={{ marginBottom: "1.5rem" }}>
        <PipelineKpiCards initiatives={initiatives} capitalScores={capitalScores} />
      </div>

      {/* Pipeline Kanban */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "1.5rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
        }}
      >
        <PipelineKanban initiatives={initiatives} phases={phases} />
      </div>
    </div>
  );
}
