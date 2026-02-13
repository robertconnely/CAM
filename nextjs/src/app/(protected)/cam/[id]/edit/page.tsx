"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  InvestmentWizard,
  clearWizardSession,
} from "@/components/cam/wizard/InvestmentWizard";
import type { WizardResult } from "@/components/cam/wizard/InvestmentWizard";
import { getCase, updateCase, getConversation, saveConversation } from "@/lib/cam/case-service";
import { computeFinancials, toFinancialAssumptions, toCaseFinancials, DEFAULT_ASSUMPTIONS } from "@/lib/financial";
import type { InvestmentCase } from "@/lib/types/database";

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);

  // Load the case + conversation and seed into sessionStorage for the wizard
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    async function load() {
      const investmentCase = await getCase(caseId);
      if (!investmentCase) {
        setError("Case not found.");
        return;
      }

      const messages = await getConversation(caseId);

      // Build wizard session state from the case data
      const a = investmentCase.assumptions;
      const chatMessages: { role: "cam" | "user"; text: string }[] = [];
      const answers: string[] = [];

      if (messages && messages.length > 0) {
        // Restore original conversation messages
        for (const m of messages) {
          chatMessages.push({ role: "user", text: m.text });
          answers.push(m.text);
        }
      }

      // Determine which assumption fields were touched
      const touchedFields: string[] = [];
      if (a.monthly_price) touchedFields.push("monthly_price");
      if (a.year1_customers) touchedFields.push("year1_customers");
      if (a.investment_amount) touchedFields.push("investment_amount");
      if (a.revenue_growth_pct) touchedFields.push("revenue_growth_pct");

      const wizardState = {
        messages: chatMessages,
        answeredCount: 6,
        currentQuestion: 6,
        liveAssumptions: {
          ...DEFAULT_ASSUMPTIONS,
          monthly_price: (a.monthly_price as number) || DEFAULT_ASSUMPTIONS.monthly_price,
          year1_customers: (a.year1_customers as number) || DEFAULT_ASSUMPTIONS.year1_customers,
          revenue_growth_pct: (a.revenue_growth_pct as number) || DEFAULT_ASSUMPTIONS.revenue_growth_pct,
          gross_margin_pct: (a.gross_margin_pct as number) || DEFAULT_ASSUMPTIONS.gross_margin_pct,
          investment_amount: (a.investment_amount as number) || DEFAULT_ASSUMPTIONS.investment_amount,
          discount_rate: (a.discount_rate as number) || DEFAULT_ASSUMPTIONS.discount_rate,
        },
        touchedFields,
        answers,
        aiTitle: investmentCase.title,
        wizardDone: true,
        showModelPanel: true,
        modelStage: 2,
        showResultButton: true,
        useAI: true,
        initiativeType: investmentCase.initiative_type ?? null,
        revenueModel: investmentCase.revenue_model ?? null,
      };

      // Clear any stale session, then seed
      clearWizardSession();
      try {
        sessionStorage.setItem("cam_wizard_state", JSON.stringify(wizardState));
      } catch { /* sessionStorage full */ }

      setReady(true);
    }

    load();
  }, [caseId]);

  const handleComplete = async (result: WizardResult) => {
    // Recompute financials from the (possibly edited) assumptions
    const fa = toFinancialAssumptions({
      monthly_price: result.assumptions.monthly_price,
      year1_customers: result.assumptions.year1_customers,
      revenue_growth_pct: result.assumptions.revenue_growth_pct,
      gross_margin_pct: result.assumptions.gross_margin_pct,
      investment_amount: result.assumptions.investment_amount,
      discount_rate: result.assumptions.discount_rate,
      projection_years: 5,
    });
    const fr = computeFinancials(fa);
    const financials = toCaseFinancials(fr);

    await updateCase(caseId, {
      title: result.title,
      description: result.description,
      initiative_type: result.initiative_type,
      revenue_model: result.revenue_model,
      investment_amount: result.assumptions.investment_amount,
      assumptions: {
        monthly_price: result.assumptions.monthly_price,
        year1_customers: result.assumptions.year1_customers,
        revenue_growth_pct: result.assumptions.revenue_growth_pct,
        gross_margin_pct: result.assumptions.gross_margin_pct,
        investment_amount: result.assumptions.investment_amount,
        discount_rate: result.assumptions.discount_rate,
        projection_years: 5,
      },
      financials,
    });

    // Save conversation
    const messages = result.answers.map((text) => ({
      role: "user" as const,
      text,
    }));
    await saveConversation(caseId, messages, true);

    clearWizardSession();
    router.push(`/cam/${caseId}`);
  };

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

  if (!ready) {
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
          Loading case for editing...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <InvestmentWizard onComplete={handleComplete} />;
}
