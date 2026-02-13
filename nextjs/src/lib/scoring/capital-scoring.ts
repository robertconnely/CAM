import type {
  InitiativeType,
  RevenueModel,
  CapitalBand,
  CapitalRecommendation,
} from "@/lib/types/database";

// =============================================
// IRR Thresholds by Initiative Type
// =============================================

export const IRR_THRESHOLDS: Record<
  InitiativeType,
  { label: string; min: number | null; target: number | null; description: string }
> = {
  new_product_platform: {
    label: "New Product / Platform",
    min: 25,
    target: 40,
    description: "Ground-up product or platform investment",
  },
  major_feature_enhancement: {
    label: "Major Feature Enhancement",
    min: 20,
    target: 30,
    description: "Significant enhancement to existing product",
  },
  efficiency_automation: {
    label: "Efficiency / Automation",
    min: 35,
    target: 50,
    description: "Operational efficiency or automation project",
  },
  compliance_regulatory: {
    label: "Compliance / Regulatory",
    min: null,
    target: null,
    description: "Required for regulatory or compliance reasons",
  },
  client_retention_defensive: {
    label: "Client Retention / Defensive",
    min: 15,
    target: 25,
    description: "Defensive investment to retain clients or market position",
  },
};

// =============================================
// CM% Thresholds by Revenue Model
// =============================================

export const CM_THRESHOLDS: Record<
  RevenueModel,
  { label: string; min: number; description: string }
> = {
  pmpm_subscription: {
    label: "PMPM (Subscription)",
    min: 65,
    description: "Per-member-per-month recurring subscription",
  },
  per_claim_transaction: {
    label: "Per-Claim Transaction",
    min: 55,
    description: "Transaction-based per-claim pricing",
  },
  contingency_savings: {
    label: "Contingency (% of Savings)",
    min: 50,
    description: "Contingency-based, percentage of savings delivered",
  },
  hybrid: {
    label: "Hybrid",
    min: 60,
    description: "Combination of subscription + transaction or contingency",
  },
};

// =============================================
// Strategic Scoring Dimensions & Weights
// =============================================

export type DimensionKey =
  | "financial_return"
  | "strategic_alignment"
  | "competitive_impact"
  | "client_demand"
  | "execution_feasibility";

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  weight: number;
  icon: string;
  description: string;
  rubric: Record<1 | 2 | 3 | 4 | 5, { label: string; description: string }>;
}

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: "financial_return",
    label: "Financial Return",
    weight: 0.3,
    icon: "chart",
    description: "Projected financial performance including IRR, NPV, and payback period",
    rubric: {
      1: {
        label: "Minimal Return",
        description:
          "IRR below minimum threshold. Negative or break-even NPV. Payback period exceeds 5 years. Limited revenue potential.",
      },
      2: {
        label: "Below Target",
        description:
          "IRR meets minimum but below target. Marginal NPV positive. Payback period 3-5 years. Modest revenue contribution.",
      },
      3: {
        label: "Meets Expectations",
        description:
          "IRR meets target threshold. Solid NPV positive. Payback period 2-3 years. Good revenue contribution aligned with plan.",
      },
      4: {
        label: "Strong Return",
        description:
          "IRR exceeds target by 10%+. Strong NPV. Payback under 2 years. Significant revenue contribution with margin expansion.",
      },
      5: {
        label: "Exceptional Return",
        description:
          "IRR significantly exceeds target. Outstanding NPV. Payback under 1 year. Transformative revenue impact with premium margins.",
      },
    },
  },
  {
    key: "strategic_alignment",
    label: "Strategic Alignment",
    weight: 0.25,
    icon: "compass",
    description: "How well this initiative supports Zelis corporate strategy and BU roadmap",
    rubric: {
      1: {
        label: "Misaligned",
        description:
          "Does not support current strategic priorities. Tangential to BU roadmap. No connection to corporate OKRs.",
      },
      2: {
        label: "Loosely Connected",
        description:
          "Indirect connection to one strategic priority. Minor alignment with BU roadmap. Could be deferred without strategic impact.",
      },
      3: {
        label: "Aligned",
        description:
          "Directly supports a strategic priority. Fits BU roadmap. Contributes to at least one corporate OKR or growth pillar.",
      },
      4: {
        label: "Highly Aligned",
        description:
          "Core to a strategic priority. Key to BU roadmap delivery. Advances multiple corporate OKRs. Enables other strategic initiatives.",
      },
      5: {
        label: "Foundational",
        description:
          "Defines or enables a strategic priority. Critical path for BU transformation. Board-level visibility. Platform for multiple future initiatives.",
      },
    },
  },
  {
    key: "competitive_impact",
    label: "Competitive Impact",
    weight: 0.2,
    icon: "shield",
    description: "Competitive differentiation and market positioning impact",
    rubric: {
      1: {
        label: "No Differentiation",
        description:
          "Table stakes feature that competitors already offer. No competitive advantage. Easy for competitors to match.",
      },
      2: {
        label: "Incremental",
        description:
          "Minor competitive improvement. Some competitors have equivalent. Short-lived advantage of 6 months or less.",
      },
      3: {
        label: "Differentiating",
        description:
          "Meaningful competitive advantage. Few competitors offer comparable solution. 12-18 month advantage window.",
      },
      4: {
        label: "Market Leading",
        description:
          "First-mover or best-in-class capability. Creates significant competitive moat. 18-24 month advantage. Potential for market share gains.",
      },
      5: {
        label: "Category Defining",
        description:
          "Creates a new category or redefines the competitive landscape. Multi-year defensible advantage. Forces competitor response.",
      },
    },
  },
  {
    key: "client_demand",
    label: "Client Demand",
    weight: 0.15,
    icon: "users",
    description: "Level of client demand, retention impact, and revenue at risk",
    rubric: {
      1: {
        label: "No Demand",
        description:
          "No client requests. No retention risk. Nice-to-have with no measurable client impact.",
      },
      2: {
        label: "Low Demand",
        description:
          "Requested by 1-2 clients. Minor retention factor. Would improve satisfaction but not a decision driver.",
      },
      3: {
        label: "Moderate Demand",
        description:
          "Requested by 3-5 clients or one major account. Notable in RFPs. Could influence renewal decisions.",
      },
      4: {
        label: "High Demand",
        description:
          "Requested by 5+ clients or multiple strategic accounts. Frequently appears in RFPs. Revenue at risk without it.",
      },
      5: {
        label: "Critical Demand",
        description:
          "Top request across client base. Multiple accounts have made it a renewal condition. Significant revenue at risk. Deal-breaker in new sales.",
      },
    },
  },
  {
    key: "execution_feasibility",
    label: "Execution Feasibility",
    weight: 0.1,
    icon: "wrench",
    description: "Technical complexity, resource availability, and delivery confidence",
    rubric: {
      1: {
        label: "Very High Risk",
        description:
          "Requires unproven technology. Critical skill gaps. Multiple external dependencies. High uncertainty in timeline and scope.",
      },
      2: {
        label: "High Risk",
        description:
          "Significant technical challenges. Some skill gaps. External dependencies. Timeline uncertainty of 50%+.",
      },
      3: {
        label: "Moderate Risk",
        description:
          "Known technology stack. Team has most required skills. Limited external dependencies. Timeline confidence of 70%+.",
      },
      4: {
        label: "Low Risk",
        description:
          "Proven patterns and technology. Team is experienced. Minimal dependencies. Timeline confidence of 85%+. Clear path to delivery.",
      },
      5: {
        label: "Very Low Risk",
        description:
          "Well-understood scope and technology. Team has deep experience. No external dependencies. Timeline confidence of 95%+. Can start immediately.",
      },
    },
  },
];

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  financial_return: 0.3,
  strategic_alignment: 0.25,
  competitive_impact: 0.2,
  client_demand: 0.15,
  execution_feasibility: 0.1,
};

// =============================================
// Pure Scoring Functions
// =============================================

export function checkIrrPass(
  irrValue: number,
  initiativeType: InitiativeType
): { pass: boolean; min: number | null; target: number | null } {
  const threshold = IRR_THRESHOLDS[initiativeType];
  // Compliance/regulatory has no IRR requirement
  if (threshold.min === null) {
    return { pass: true, min: null, target: null };
  }
  return {
    pass: irrValue >= threshold.min,
    min: threshold.min,
    target: threshold.target,
  };
}

export function checkCmPass(
  cmValue: number,
  revenueModel: RevenueModel
): { pass: boolean; min: number } {
  const threshold = CM_THRESHOLDS[revenueModel];
  return {
    pass: cmValue >= threshold.min,
    min: threshold.min,
  };
}

export function calculateWeightedScore(
  scores: Partial<Record<DimensionKey, number>>
): number {
  let totalWeight = 0;
  let totalScore = 0;

  for (const dim of DIMENSIONS) {
    const score = scores[dim.key];
    if (score != null) {
      totalScore += score * dim.weight;
      totalWeight += dim.weight;
    }
  }

  if (totalWeight === 0) return 0;
  // Normalize if not all dimensions scored
  return Math.round((totalScore / totalWeight) * 100) / 100;
}

export function determineRecommendation(
  weightedScore: number,
  financialGatePass: boolean
): { recommendation: CapitalRecommendation; band: CapitalBand } {
  if (weightedScore >= 4.0 && financialGatePass) {
    return { recommendation: "strong_go", band: "band_a" };
  }
  if (weightedScore >= 3.5 && financialGatePass) {
    return { recommendation: "go", band: "band_a" };
  }
  if (weightedScore >= 3.0) {
    return { recommendation: "consider", band: "band_b" };
  }
  return { recommendation: "hold", band: weightedScore >= 2.0 ? "band_c" : "band_d" };
}

// =============================================
// Display Helpers
// =============================================

export const INITIATIVE_TYPE_OPTIONS: {
  value: InitiativeType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "new_product_platform",
    label: "New Product / Platform",
    description: "Ground-up product or platform investment",
    icon: "rocket",
  },
  {
    value: "major_feature_enhancement",
    label: "Major Feature Enhancement",
    description: "Significant enhancement to existing product",
    icon: "sparkle",
  },
  {
    value: "efficiency_automation",
    label: "Efficiency / Automation",
    description: "Operational efficiency or automation project",
    icon: "gear",
  },
  {
    value: "compliance_regulatory",
    label: "Compliance / Regulatory",
    description: "Required for regulatory or compliance reasons",
    icon: "check",
  },
  {
    value: "client_retention_defensive",
    label: "Client Retention / Defensive",
    description: "Defensive investment to retain clients",
    icon: "shield",
  },
];

export const REVENUE_MODEL_OPTIONS: {
  value: RevenueModel;
  label: string;
  description: string;
}[] = [
  {
    value: "pmpm_subscription",
    label: "PMPM (Subscription)",
    description: "Per-member-per-month recurring subscription",
  },
  {
    value: "per_claim_transaction",
    label: "Per-Claim Transaction",
    description: "Transaction-based per-claim pricing",
  },
  {
    value: "contingency_savings",
    label: "Contingency (% of Savings)",
    description: "Contingency-based, percentage of savings delivered",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Combination of subscription + transaction or contingency",
  },
];

export const RECOMMENDATION_CONFIG: Record<
  CapitalRecommendation,
  { label: string; color: string; bg: string; icon: string; description: string }
> = {
  strong_go: {
    label: "STRONG GO",
    color: "#1b5e20",
    bg: "#e8f5e9",
    icon: "rocket",
    description: "Exceeds all thresholds. Highest priority for capital allocation.",
  },
  go: {
    label: "GO",
    color: "#2e7d32",
    bg: "#f1f8e9",
    icon: "check",
    description: "Meets all thresholds. Approved for capital allocation.",
  },
  consider: {
    label: "CONSIDER",
    color: "#e65100",
    bg: "#fff3e0",
    icon: "question",
    description: "Mixed results. Requires additional review or conditions.",
  },
  hold: {
    label: "HOLD",
    color: "#b71c1c",
    bg: "#fce4ec",
    icon: "pause",
    description: "Below thresholds. Not recommended for capital allocation at this time.",
  },
};

export const BAND_CONFIG: Record<
  CapitalBand,
  { label: string; description: string; color: string }
> = {
  band_a: {
    label: "Band A",
    description: "Priority investment — fund immediately",
    color: "#2e7d32",
  },
  band_b: {
    label: "Band B",
    description: "Conditional investment — fund with conditions",
    color: "#e65100",
  },
  band_c: {
    label: "Band C",
    description: "Deferred — revisit next cycle",
    color: "#b71c1c",
  },
  band_d: {
    label: "Band D",
    description: "Not recommended — significant gaps",
    color: "#880e4f",
  },
};
