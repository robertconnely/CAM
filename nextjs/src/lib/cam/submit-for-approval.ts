import { createClient } from "@/lib/supabase/client";
import type { InvestmentCase } from "@/lib/types/database";

/**
 * Submits an investment case for approval:
 * 1. Updates case status to "submitted" and stage to "approval"
 * 2. Creates a bridge initiative record linking to the case
 * 3. Creates notifications for all editors/admins
 */
export async function submitForApproval(
  investmentCase: InvestmentCase,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 1. Update case status
  const { error: updateError } = await supabase
    .from("investment_cases")
    .update({ status: "submitted", stage: "approval" })
    .eq("id", investmentCase.id);

  if (updateError) {
    console.error("[submit] updateCase error:", updateError);
    return { success: false, error: "Failed to update case status" };
  }

  // 2. Get the first PDLC phase to use for the bridge initiative
  const { data: phases } = await supabase
    .from("pdlc_phases")
    .select("id")
    .order("display_order", { ascending: true })
    .limit(1);

  const phaseId = phases?.[0]?.id;
  if (!phaseId) {
    console.error("[submit] No PDLC phases found");
    return { success: false, error: "System configuration error: no PDLC phases" };
  }

  // 3. Create or update bridge initiative
  const initiativeId = `CAM-${investmentCase.id.slice(0, 8).toUpperCase()}`;

  // Check if bridge initiative already exists (re-submission)
  const { data: existing } = await supabase
    .from("initiatives")
    .select("id")
    .eq("investment_case_id", investmentCase.id)
    .limit(1);

  if (existing && existing.length > 0) {
    // Update existing bridge initiative
    const { error: updateInitError } = await supabase
      .from("initiatives")
      .update({
        name: investmentCase.title,
        irr: investmentCase.financials?.irr
          ? Math.min(999.99, Math.round((investmentCase.financials.irr as number) * 10000) / 100)
          : null,
        contribution_margin: investmentCase.financials?.contribution_margin != null
          ? Math.min(999.99, investmentCase.financials.contribution_margin as number)
          : null,
      })
      .eq("id", existing[0].id);

    if (updateInitError) {
      console.error("[submit] updateInitiative error:", updateInitError.message);
    }
  } else {
    const { error: initError } = await supabase
      .from("initiatives")
      .insert({
        initiative_id: initiativeId,
        name: investmentCase.title,
        tier: "tier_2" as const,
        current_phase_id: phaseId,
        status: "on_track" as const,
        owner_id: userId,
        investment_case_id: investmentCase.id,
        irr: investmentCase.financials?.irr
          ? Math.min(999.99, Math.round((investmentCase.financials.irr as number) * 10000) / 100)
          : null,
        contribution_margin: investmentCase.financials?.contribution_margin != null
          ? Math.min(999.99, investmentCase.financials.contribution_margin as number)
          : null,
        notes: `Auto-created from CAM case: ${investmentCase.title}`,
        created_by: userId,
      });

    if (initError) {
      console.error("[submit] createInitiative error:", initError.message, initError.code);
    }
  }

  // 4. Create notifications for editors and admins
  try {
    const { data: reviewers } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["admin", "editor"])
      .neq("id", userId);

    if (reviewers && reviewers.length > 0) {
      const notifications = reviewers.map((r) => ({
        recipient_id: r.id,
        type: "case_submitted" as const,
        case_id: investmentCase.id,
        message: `New case submitted for approval: "${investmentCase.title}"`,
      }));

      await supabase.from("notifications").insert(notifications);
    }
  } catch {
    // Non-fatal: notifications are best-effort
  }

  return { success: true };
}
