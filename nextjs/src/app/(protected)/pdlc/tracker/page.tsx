import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TrackerDashboard } from "@/components/tracker/TrackerDashboard";
import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
} from "@/lib/types/database";

export const metadata = {
  title: "PDLC Stage Gate Tracker — Zelis Product Operating System",
};

export default async function TrackerPage() {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile for role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileData as { role: UserRole } | null;
  const role = profile?.role ?? "viewer";

  // Parallel data fetch
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
    <>
      <Breadcrumb
        items={[
          { label: "PDLC Framework", href: "/pdlc" },
          { label: "Stage Gate Tracker" },
        ]}
      />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "1.5rem 1.5rem 3rem",
        }}
      >
        {/* Page header */}
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--zelis-purple)",
              lineHeight: 1.2,
            }}
          >
            PDLC Stage Gate Tracker
          </h1>
          <p
            style={{
              margin: "0.35rem 0 0",
              fontSize: "0.92rem",
              color: "var(--zelis-blue-purple)",
              fontWeight: 500,
              maxWidth: 600,
            }}
          >
            Track initiatives through the Product Development Lifecycle — from
            idea to post-launch.
          </p>
        </div>

        <TrackerDashboard
          initiatives={initiatives}
          gateReviews={gateReviews}
          phases={phases}
          capitalScores={capitalScores}
          role={role}
        />
      </main>
    </>
  );
}
