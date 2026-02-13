import type {
  FinancialAssumptions,
  SensitivityResult,
  TornadoBar,
} from "./types";
import { calculateNPV } from "./npv";
import { projectRevenues, projectCashFlows } from "./projections";

const SENSITIVITY_KEYS: { key: keyof FinancialAssumptions; label: string }[] = [
  { key: "monthly_price", label: "Monthly Price" },
  { key: "year1_customers", label: "Year 1 Customers" },
  { key: "revenue_growth_pct", label: "Revenue Growth %" },
  { key: "gross_margin_pct", label: "Gross Margin %" },
  { key: "investment_amount", label: "Investment Amount" },
  { key: "discount_rate", label: "Discount Rate" },
];

function computeNPV(a: FinancialAssumptions): number {
  const revenues = projectRevenues(a);
  const flows = projectCashFlows(revenues, a);
  return calculateNPV(flows, a.discount_rate / 100);
}

/**
 * One-at-a-time sensitivity analysis.
 *
 * For each scalar assumption, varies it by ±variationPct and
 * records the NPV impact. Returns bars sorted by spread (largest first).
 */
export function generateSensitivity(
  base: FinancialAssumptions,
  variationPct = 20
): SensitivityResult {
  const baseNpv = computeNPV(base);
  const factor = variationPct / 100;

  const bars: TornadoBar[] = SENSITIVITY_KEYS.map(({ key, label }) => {
    const baseVal = base[key] as number;

    const lowAssumptions = { ...base, [key]: baseVal * (1 - factor) };
    const highAssumptions = { ...base, [key]: baseVal * (1 + factor) };

    const lowNpv = computeNPV(lowAssumptions);
    const highNpv = computeNPV(highAssumptions);

    return {
      assumption_key: key,
      label,
      base_npv: baseNpv,
      low_npv: lowNpv,
      high_npv: highNpv,
      low_delta: lowNpv - baseNpv,
      high_delta: highNpv - baseNpv,
      spread: Math.abs(highNpv - lowNpv),
    };
  });

  bars.sort((a, b) => b.spread - a.spread);

  return { base_npv: baseNpv, bars };
}
