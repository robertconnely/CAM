"use client";

import { useState, useEffect, useCallback } from "react";
import { getCase } from "@/lib/cam/case-service";
import type { InvestmentCase } from "@/lib/types/database";

export function useInvestmentCase(caseId: string | undefined) {
  const [investmentCase, setInvestmentCase] = useState<InvestmentCase | null>(null);
  const [loading, setLoading] = useState(!!caseId);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    const result = await getCase(caseId);
    if (result) {
      setInvestmentCase(result);
    } else {
      setError("Case not found");
    }
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { investmentCase, loading, error, refetch: fetch };
}
