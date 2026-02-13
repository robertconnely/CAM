import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ToastProvider } from "@/components/admin/Toast";
import { CapitalWizard } from "@/components/tracker/capital/CapitalWizard";
import type {
  Initiative,
  PdlcPhase,
  UserRole,
} from "@/lib/types/database";

export const metadata = {
  title: "Capital Allocation Scoring — Zelis Product Operating System",
};

export default async function CapitalScoringPage({
  searchParams,
}: {
  searchParams: Promise<{ initiative?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Role check — editors+ only
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileData as { role: UserRole } | null;
  const role = profile?.role ?? "viewer";

  if (role === "viewer") {
    redirect("/pdlc/tracker");
  }

  // Fetch data
  const [initiativesRes, phasesRes] = await Promise.all([
    supabase
      .from("initiatives")
      .select("*")
      .order("priority_rank", { ascending: true, nullsFirst: false }),
    supabase
      .from("pdlc_phases")
      .select("*")
      .order("display_order", { ascending: true }),
  ]);

  const initiatives = (initiativesRes.data ?? []) as Initiative[];
  const phases = (phasesRes.data ?? []) as PdlcPhase[];

  const preselectedId = params.initiative ?? null;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "PDLC Framework", href: "/pdlc" },
          { label: "Stage Gate Tracker", href: "/pdlc/tracker" },
          { label: "Capital Scoring" },
        ]}
      />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "1.5rem 1.5rem 3rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--zelis-purple)",
              lineHeight: 1.2,
            }}
          >
            Capital Allocation Scoring
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
            Walk through a guided evaluation to score and prioritize an initiative
            for capital investment.
          </p>
        </div>

        <ToastProvider>
          <CapitalWizard
            initiatives={initiatives}
            phases={phases}
            preselectedInitiativeId={preselectedId}
          />
        </ToastProvider>
      </main>
    </>
  );
}
