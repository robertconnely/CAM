"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { CapitalWizard } from "@/components/tracker/capital/CapitalWizard";
import { ToastProvider } from "@/components/admin/Toast";
import { CelebrationModal } from "@/components/cam/workflow/CelebrationModal";
import { updateCaseFromScoring } from "@/lib/cam/case-service";
import type { Initiative, PdlcPhase, InvestmentCase } from "@/lib/types/database";

const RECOMMENDATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  strong_go: { label: "Strong Go", color: "#320FFF", bg: "rgba(50, 15, 255, 0.1)" },
  go: { label: "Go", color: "#320FFF", bg: "rgba(50, 15, 255, 0.08)" },
  consider: { label: "Consider", color: "#D97706", bg: "rgba(255, 190, 0, 0.12)" },
  hold: { label: "Hold", color: "#E61E2D", bg: "rgba(230, 30, 45, 0.08)" },
};

export default function ScoreCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [phases, setPhases] = useState<PdlcPhase[]>([]);
  const [bridgeId, setBridgeId] = useState<string | null>(null);
  const [investmentCase, setInvestmentCase] = useState<InvestmentCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoringResult, setScoringResult] = useState<{
    recommendation: string;
    show: boolean;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      // Fetch case, bridge initiative, all initiatives, and phases in parallel
      const [
        { data: caseData },
        { data: inits },
        { data: allPhases },
      ] = await Promise.all([
        supabase.from("investment_cases").select("*").eq("id", caseId).single(),
        supabase.from("initiatives").select("*").eq("investment_case_id", caseId),
        supabase.from("pdlc_phases").select("*").order("display_order"),
      ]);

      if (!caseData) {
        setError("Investment case not found.");
        setLoading(false);
        return;
      }

      const ic = caseData as InvestmentCase;
      setInvestmentCase(ic);
      setPhases((allPhases ?? []) as PdlcPhase[]);

      let bridgeInitId: string | null = null;
      const initiativeId = `CAM-${caseId.slice(0, 8).toUpperCase()}`;

      if (inits && inits.length > 0) {
        bridgeInitId = inits[0].id;
      } else {
        // Fallback: check by initiative_id (may exist without investment_case_id FK)
        const { data: byInitId } = await supabase
          .from("initiatives")
          .select("id, investment_case_id")
          .eq("initiative_id", initiativeId)
          .limit(1);

        if (byInitId && byInitId.length > 0) {
          bridgeInitId = byInitId[0].id;
          // Backfill the FK if missing
          if (!byInitId[0].investment_case_id) {
            await supabase
              .from("initiatives")
              .update({ investment_case_id: caseId })
              .eq("id", byInitId[0].id);
          }
        } else {
          // No initiative exists — create one
          const phaseId = allPhases?.[0]?.id;
          if (!phaseId || !user) {
            setError("Unable to create scoring initiative. Please try again.");
            setLoading(false);
            return;
          }

          const { data: newInit, error: createErr } = await supabase
            .from("initiatives")
            .insert({
              initiative_id: initiativeId,
              name: ic.title,
              tier: "tier_2",
              current_phase_id: phaseId,
              status: "on_track",
              owner_id: user.id,
              investment_case_id: caseId,
              irr: ic.financials?.irr
                ? Math.min(999.99, Math.round((ic.financials.irr as number) * 10000) / 100)
                : null,
              contribution_margin: ic.financials?.contribution_margin != null
                ? Math.min(999.99, ic.financials.contribution_margin as number)
                : null,
              notes: `Auto-created from CAM case: ${ic.title}`,
              created_by: user.id,
            })
            .select("id")
            .single();

          if (createErr || !newInit) {
            console.error("[score] auto-create initiative error:", createErr?.message);
            setError("Failed to create scoring initiative.");
            setLoading(false);
            return;
          }
          bridgeInitId = newInit.id;
        }
      }

      // Check if this initiative has already been scored
      if (bridgeInitId) {
        const { count } = await supabase
          .from("capital_scores")
          .select("id", { count: "exact", head: true })
          .eq("initiative_id", bridgeInitId);

        if ((count ?? 0) > 0) {
          setError("This case has already been scored.");
          setLoading(false);
          return;
        }
      }

      // Fetch all initiatives (including the one we may have just created)
      const { data: allInits } = await supabase
        .from("initiatives")
        .select("*")
        .order("created_at", { ascending: false });

      setInitiatives((allInits ?? []) as Initiative[]);
      setBridgeId(bridgeInitId);
      setLoading(false);
    }

    load();
  }, [caseId]);

  const handleComplete = async (recommendation: string) => {
    // Update the investment case status based on the scoring result
    await updateCaseFromScoring(caseId, recommendation);

    // Notify case owner
    try {
      const supabase = createClient();
      const { data: investmentCase } = await supabase
        .from("investment_cases")
        .select("owner_id, title")
        .eq("id", caseId)
        .single();

      if (investmentCase?.owner_id) {
        await supabase.from("notifications").insert({
          recipient_id: investmentCase.owner_id,
          type: "case_scored",
          case_id: caseId,
          message: `Your case "${investmentCase.title}" has been scored: ${recommendation.replace("_", " ").toUpperCase()}`,
        });
      }
    } catch {
      // Non-fatal
    }

    // Show celebration modal instead of redirecting
    setScoringResult({ recommendation, show: true });
  };

  // Celebration modal for scoring result
  if (scoringResult?.show) {
    const rec = scoringResult.recommendation;
    const isApproved = rec === "strong_go" || rec === "go";
    const recLabel = RECOMMENDATION_LABELS[rec] ?? RECOMMENDATION_LABELS.consider;

    const variant = isApproved ? "approved" as const : rec === "hold" ? "hold" as const : "consider" as const;
    const title = isApproved ? "Case Approved" : `Case Scored: ${recLabel.label}`;
    const subtitle = isApproved
      ? "This case has been approved and moved to the execution stage. The initiative is active in the pipeline."
      : rec === "hold"
        ? "This case has been placed on hold. Review the scoring details and consider revising the business case."
        : "This case requires further review. The case remains in the approval stage.";

    const actions = isApproved
      ? [
          { label: "Back to Case", href: `/cam/${caseId}` },
          { label: "View Pipeline", href: "/cam/pipeline", primary: true },
        ]
      : [
          ...(rec !== "hold" ? [{ label: "View Pipeline", href: "/cam/pipeline" }] : []),
          { label: "Back to Case", href: `/cam/${caseId}`, primary: true },
        ];

    return (
      <CelebrationModal
        open
        variant={variant}
        title={title}
        subtitle={subtitle}
        badge={recLabel}
        actions={actions}
        onClose={() => router.push(`/cam/${caseId}`)}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--zelis-ice, #ECE9FF)",
            borderTopColor: "var(--zelis-blue-purple, #5F5FC3)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 14, color: "var(--zelis-medium-gray, #797279)" }}>
          Loading scoring wizard...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--zelis-red, #E61E2D)", marginBottom: 16 }}>
          {error}
        </p>
        <button
          onClick={() => router.push(`/cam/${caseId}`)}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            background: "#fff",
            color: "var(--zelis-dark, #23004B)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to Case
        </button>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
            margin: "0 0 24px",
          }}
        >
          Capital Scoring Wizard
        </h1>
        <CapitalWizard
          initiatives={initiatives}
          phases={phases}
          preselectedInitiativeId={bridgeId}
          onComplete={handleComplete}
          camStyle
          investmentCase={investmentCase}
        />
      </div>
    </ToastProvider>
  );
}
