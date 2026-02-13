import type { CaseAssumptions, CaseFinancials } from "@/lib/types/database";

/* ─── Engine Input ─── */

export interface FinancialAssumptions {
  monthly_price: number;
  year1_customers: number;
  revenue_growth_pct: number; // e.g. 85 for 85%
  gross_margin_pct: number; // e.g. 78 for 78%
  investment_amount: number;
  discount_rate: number; // e.g. 10 for 10%
  projection_years: number;
  margin_ramp: number[]; // year-specific net margins [0.15, 0.35, …]
  growth_deceleration: number[]; // multipliers for growth decay [1.0, 0.7, …]
}

/* ─── Engine Output ─── */

export interface FinancialResults {
  annual_revenues: number[];
  cash_flows: number[];
  cumulative_cash_flows: number[];
  npv: number;
  irr: number | null;
  payback_months: number | null;
  monthly_revenue: number;
  annual_revenue: number;
  total_revenue_5yr: number;
  contribution_margin: number; // steady-state CM% (final-year margin_ramp * 100)
}

/* ─── Sensitivity ─── */

export interface TornadoBar {
  assumption_key: string;
  label: string;
  base_npv: number;
  low_npv: number;
  high_npv: number;
  low_delta: number;
  high_delta: number;
  spread: number;
}

export interface SensitivityResult {
  base_npv: number;
  bars: TornadoBar[];
}

/* ─── Defaults ─── */

export const DEFAULT_ASSUMPTIONS: FinancialAssumptions = {
  monthly_price: 3500,
  year1_customers: 15,
  revenue_growth_pct: 85,
  gross_margin_pct: 78,
  investment_amount: 1_800_000,
  discount_rate: 10,
  projection_years: 5,
  margin_ramp: [0.15, 0.35, 0.52, 0.6, 0.65],
  growth_deceleration: [1.0, 0.7, 0.5, 0.35],
};

/* ─── Converters (DB ↔ Engine) ─── */

export function toFinancialAssumptions(
  ca: CaseAssumptions
): FinancialAssumptions {
  return {
    ...DEFAULT_ASSUMPTIONS,
    monthly_price: ca.monthly_price ?? DEFAULT_ASSUMPTIONS.monthly_price,
    year1_customers: ca.year1_customers ?? DEFAULT_ASSUMPTIONS.year1_customers,
    revenue_growth_pct:
      ca.revenue_growth_pct ?? DEFAULT_ASSUMPTIONS.revenue_growth_pct,
    gross_margin_pct:
      ca.gross_margin_pct ?? DEFAULT_ASSUMPTIONS.gross_margin_pct,
    discount_rate: ca.discount_rate ?? DEFAULT_ASSUMPTIONS.discount_rate,
    projection_years:
      ca.projection_years ?? DEFAULT_ASSUMPTIONS.projection_years,
    investment_amount:
      ca.investment_amount ?? DEFAULT_ASSUMPTIONS.investment_amount,
  };
}

export function toCaseFinancials(fr: FinancialResults): CaseFinancials {
  return {
    npv: fr.npv,
    irr: fr.irr ?? undefined,
    payback_months: fr.payback_months ?? undefined,
    annual_revenue: fr.annual_revenue,
    cash_flows: fr.cash_flows,
    total_revenue_5yr: fr.total_revenue_5yr,
    contribution_margin: fr.contribution_margin,
  };
}
