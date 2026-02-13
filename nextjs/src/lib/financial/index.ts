export type {
  FinancialAssumptions,
  FinancialResults,
  TornadoBar,
  SensitivityResult,
} from "./types";
export {
  DEFAULT_ASSUMPTIONS,
  toFinancialAssumptions,
  toCaseFinancials,
} from "./types";
export {
  projectRevenues,
  projectCashFlows,
  cumulativeCashFlows,
} from "./projections";
export { calculateNPV } from "./npv";
export { calculateIRR } from "./irr";
export { calculatePayback } from "./payback";
export { generateSensitivity } from "./sensitivity";

/* ─── Convenience: full model from assumptions ─── */

import type { FinancialAssumptions, FinancialResults } from "./types";
import { projectRevenues, projectCashFlows, cumulativeCashFlows } from "./projections";
import { calculateNPV } from "./npv";
import { calculateIRR } from "./irr";
import { calculatePayback } from "./payback";

export function computeFinancials(
  a: FinancialAssumptions
): FinancialResults {
  const annual_revenues = projectRevenues(a);
  const cash_flows = projectCashFlows(annual_revenues, a);
  const cumulative_cash_flows = cumulativeCashFlows(cash_flows);
  const npv = calculateNPV(cash_flows, a.discount_rate / 100);
  const irr = calculateIRR(cash_flows);
  const payback_months = calculatePayback(cash_flows);

  const steadyStateIdx = Math.min(a.projection_years - 1, a.margin_ramp.length - 1);
  const contribution_margin = a.margin_ramp[steadyStateIdx] * 100;

  return {
    annual_revenues,
    cash_flows,
    cumulative_cash_flows,
    npv,
    irr,
    payback_months,
    monthly_revenue: a.monthly_price * a.year1_customers,
    annual_revenue: annual_revenues[0],
    total_revenue_5yr: annual_revenues.reduce((s, r) => s + r, 0),
    contribution_margin,
  };
}
