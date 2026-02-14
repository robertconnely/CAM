import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrackerDashboard } from "@/components/tracker/TrackerDashboard";
import { InitiativeViewToggle } from "@/components/dashboard/InitiativeViewToggle";
import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
} from "@/lib/types/database";

export const metadata = {
  title: "Initiative Tracker — CAM",
};

export default async function TrackerPage() {
  const supabase = await createClient();

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

  const [initiativesRes, gateReviewsRes, phasesRes, capitalScoresRes] = await Promise.all([
    supabase
      .from("initiatives")
      .select("*")
      .order("priority_rank", { ascending: true, nullsFirst: false }),
    supabase
      .from("gate_reviews")
      .select("*")
      .order("review_date", { ascending: false }),
    supabase
      .from("pdlc_phases")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("capital_scores")
      .select("*")
      .order("scored_at", { ascending: false }),
  ]);

  const initiatives = (initiativesRes.data ?? []) as Initiative[];
  const gateReviews = (gateReviewsRes.data ?? []) as GateReview[];
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
          Initiative Tracker
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #797279)",
            fontWeight: 500,
          }}
        >
          Track initiatives through the Product Development Lifecycle — from
          idea to post-launch.
        </p>
      </div>

      <InitiativeViewToggle active="tracker" />

      <TrackerDashboard
        initiatives={initiatives}
        gateReviews={gateReviews}
        phases={phases}
        capitalScores={capitalScores}
        role={role}
      />
    </div>
  );
}
