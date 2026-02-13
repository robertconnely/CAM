import { createClient } from "@/lib/supabase/server";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { Footer } from "@/components/layout/Footer";
import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
} from "@/lib/types/database";

export const metadata = {
  title: "Dashboard — Zelis Product Operating System",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user role (optional — dashboard shows for all, limited for viewers)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole | null = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const profile = profileData as { role: UserRole } | null;
    role = profile?.role ?? "viewer";
  }

  // Parallel data fetch
  const [initiativesRes, gateReviewsRes, phasesRes, capitalScoresRes] =
    await Promise.all([
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
    <>
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "1.5rem 2rem 3rem",
        }}
      >
        <ExecutiveDashboard
          initiatives={initiatives}
          gateReviews={gateReviews}
          phases={phases}
          capitalScores={capitalScores}
          role={role}
        />
      </main>
      <Footer />
    </>
  );
}
