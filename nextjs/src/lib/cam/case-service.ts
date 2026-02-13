import { createClient } from "@/lib/supabase/client";
import { computeFinancials, toFinancialAssumptions, toCaseFinancials } from "@/lib/financial";
import type { InvestmentCase, CaseAssumptions, WizardMessage } from "@/lib/types/database";
import type { WizardResult } from "@/components/cam/wizard/InvestmentWizard";

/* ─── Create ─── */

export async function createCase(
  result: WizardResult,
  userId: string
): Promise<InvestmentCase | null> {
  const supabase = createClient();

  const assumptions: CaseAssumptions = {
    monthly_price: result.assumptions.monthly_price,
    year1_customers: result.assumptions.year1_customers,
    revenue_growth_pct: result.assumptions.revenue_growth_pct,
    gross_margin_pct: result.assumptions.gross_margin_pct,
    investment_amount: result.assumptions.investment_amount,
    discount_rate: result.assumptions.discount_rate,
    projection_years: 5,
  };

  const fa = toFinancialAssumptions(assumptions);
  const fr = computeFinancials(fa);
  const financials = toCaseFinancials(fr);

  const { data, error } = await supabase
    .from("investment_cases")
    .insert({
      title: result.title,
      description: result.description,
      owner_id: userId,
      stage: "business_case",
      status: "draft",
      initiative_type: result.initiative_type,
      revenue_model: result.revenue_model,
      investment_amount: result.assumptions.investment_amount,
      assumptions,
      financials,
    })
    .select()
    .single();

  if (error) {
    console.error("[case-service] createCase error:", error);
    return null;
  }
  return data as InvestmentCase;
}

/* ─── Read ─── */

export async function getCase(id: string): Promise<InvestmentCase | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[case-service] getCase error:", error);
    return null;
  }
  return data as InvestmentCase;
}

export async function getCases(): Promise<InvestmentCase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_cases")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[case-service] getCases error:", error);
    return [];
  }
  return (data ?? []) as InvestmentCase[];
}

/* ─── Update ─── */

export async function updateCase(
  id: string,
  updates: Partial<Pick<InvestmentCase, "title" | "description" | "stage" | "status" | "assumptions" | "financials" | "memo_content" | "investment_amount" | "timeline_months" | "initiative_type" | "revenue_model">>
): Promise<InvestmentCase | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_cases")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[case-service] updateCase error:", error);
    return null;
  }
  return data as InvestmentCase;
}

/* ─── Scoring Result ─── */

/**
 * Updates case status based on capital scoring recommendation.
 * strong_go/go → approved + execution stage
 * consider → stays in approval
 * hold → rejected
 */
export async function updateCaseFromScoring(
  caseId: string,
  recommendation: string
): Promise<void> {
  let status: string;
  let stage: string;

  switch (recommendation) {
    case "strong_go":
    case "go":
      status = "approved";
      stage = "execution";
      break;
    case "consider":
      status = "submitted"; // stays in approval review
      stage = "approval";
      break;
    case "hold":
      status = "rejected";
      stage = "approval";
      break;
    default:
      status = "submitted";
      stage = "approval";
  }

  await updateCase(caseId, { status: status as InvestmentCase["status"], stage: stage as InvestmentCase["stage"] });
}

/* ─── Conversation ─── */

export async function getConversation(
  caseId: string
): Promise<WizardMessage[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wizard_conversations")
    .select("messages")
    .eq("case_id", caseId)
    .single();

  if (error || !data) return null;
  return (data.messages as WizardMessage[]) ?? null;
}

export async function saveConversation(
  caseId: string,
  messages: WizardMessage[],
  completed: boolean
): Promise<string | null> {
  const supabase = createClient();

  // Upsert: check if conversation already exists for this case
  const { data: existing } = await supabase
    .from("wizard_conversations")
    .select("id")
    .eq("case_id", caseId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("wizard_conversations")
      .update({ messages, completed })
      .eq("id", existing.id);

    if (error) {
      console.error("[case-service] saveConversation update error:", error);
      return null;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("wizard_conversations")
    .insert({ case_id: caseId, messages, completed })
    .select("id")
    .single();

  if (error) {
    console.error("[case-service] saveConversation insert error:", error);
    return null;
  }
  return data?.id ?? null;
}
