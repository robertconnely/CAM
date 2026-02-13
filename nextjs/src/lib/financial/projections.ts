import type { FinancialAssumptions } from "./types";

/**
 * Project annual revenues over the projection period.
 *
 * Year 1 = monthly_price * year1_customers * 12
 * Year N = previous * (1 + growth_rate * deceleration[N-2])
 */
export function projectRevenues(a: FinancialAssumptions): number[] {
  const years = a.projection_years;
  const growth = a.revenue_growth_pct / 100;
  const revenues: number[] = [a.monthly_price * a.year1_customers * 12];

  for (let i = 1; i < years; i++) {
    const decelIdx = Math.min(i - 1, a.growth_deceleration.length - 1);
    const decel = a.growth_deceleration[decelIdx];
    revenues.push(revenues[i - 1] * (1 + growth * decel));
  }

  return revenues;
}

/**
 * Compute cash flows from revenues and assumptions.
 *
 * cash_flows[0] = -investment_amount
 * cash_flows[i] = revenues[i-1] * margin_ramp[i-1]
 */
export function projectCashFlows(
  revenues: number[],
  a: FinancialAssumptions
): number[] {
  const flows: number[] = [-a.investment_amount];

  for (let i = 0; i < revenues.length; i++) {
    const marginIdx = Math.min(i, a.margin_ramp.length - 1);
    flows.push(revenues[i] * a.margin_ramp[marginIdx]);
  }

  return flows;
}

/**
 * Running cumulative sum of cash flows.
 */
export function cumulativeCashFlows(cashFlows: number[]): number[] {
  const cumul: number[] = [];
  let sum = 0;
  for (const cf of cashFlows) {
    sum += cf;
    cumul.push(sum);
  }
  return cumul;
}
