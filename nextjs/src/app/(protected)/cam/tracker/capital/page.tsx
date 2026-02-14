import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToastProvider } from "@/components/admin/Toast";
import { CapitalWizard } from "@/components/tracker/capital/CapitalWizard";
import type {
  Initiative,
  PdlcPhase,
  UserRole,
  CapitalRecommendation,
} from "@/lib/types/database";

export const metadata = {
  title: "Capital Allocation Scoring — CAM",
};

export default async function CapitalScoringPage({
  searchParams,
}: {
  searchParams: Promise<{ initiative?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (profileData as { role: UserRole } | null)?.role ?? "viewer";

  if (role === "viewer") {
    redirect("/cam/tracker");
  }

  const [initiativesRes, phasesRes, scoresRes] = await Promise.all([
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
      .select("initiative_id, recommendation")
      .order("scored_at", { ascending: false }),
  ]);

  const initiatives = (initiativesRes.data ?? []) as Initiative[];
  const phases = (phasesRes.data ?? []) as PdlcPhase[];

  // Build map of initiative UUID → most recent recommendation
  const scoredInitiatives: Record<string, CapitalRecommendation> = {};
  for (const row of scoresRes.data ?? []) {
    const s = row as { initiative_id: string; recommendation: CapitalRecommendation };
    if (!scoredInitiatives[s.initiative_id]) {
      scoredInitiatives[s.initiative_id] = s.recommendation;
    }
  }

  const preselectedId = params.initiative ?? null;

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
          Capital Allocation Scoring
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #797279)",
            fontWeight: 500,
          }}
        >
          Walk through a guided evaluation to score and prioritize an initiative
          for capital investment.
        </p>
      </div>

      <ToastProvider>
        <CapitalWizard
          initiatives={initiatives}
          phases={phases}
          preselectedInitiativeId={preselectedId}
          scoredInitiatives={scoredInitiatives}
        />
      </ToastProvider>
    </div>
  );
}
