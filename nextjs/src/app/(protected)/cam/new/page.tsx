"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvestmentWizard, clearWizardSession } from "@/components/cam/wizard/InvestmentWizard";
import type { WizardResult } from "@/components/cam/wizard/InvestmentWizard";
import { useAuth } from "@/components/auth/AuthProvider";
import { createCase, saveConversation } from "@/lib/cam/case-service";

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const fresh = searchParams.get("fresh") === "1";

  /* If ?fresh=1, clear saved session BEFORE mounting the wizard */
  const [ready, setReady] = useState(!fresh);
  useEffect(() => {
    if (fresh) {
      clearWizardSession();
      setReady(true);
    }
  }, [fresh]);

  const handleComplete = async (result: WizardResult) => {
    // Authenticated path: save to database
    if (user) {
      const investmentCase = await createCase(result, user.id);
      if (investmentCase) {
        // Save the conversation history
        const messages = result.answers.map((text) => ({
          role: "user" as const,
          text,
        }));
        await saveConversation(investmentCase.id, messages, true);

        // Clear wizard session and navigate to the saved case
        clearWizardSession();
        router.push(`/cam/${investmentCase.id}`);
        return;
      }
      // If DB save failed, fall through to demo flow
      console.warn("[NewCasePage] DB save failed, falling back to demo flow");
    }

    // Unauthenticated / fallback: sessionStorage demo flow
    sessionStorage.setItem("cam_wizard_result", JSON.stringify(result));
    sessionStorage.setItem("cam_nav_source", "wizard");
    router.push("/cam/demo-result");
  };

  if (!ready) return null;
  return <InvestmentWizard onComplete={handleComplete} />;
}
