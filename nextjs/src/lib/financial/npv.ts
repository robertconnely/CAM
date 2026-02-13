/**
 * Net Present Value.
 *
 * NPV = sum( CF_i / (1 + r)^i )  for i = 0..n
 *
 * cash_flows[0] is the initial investment (negative, at time 0 — not discounted).
 *
 * @param cashFlows  Array starting with initial outlay (negative)
 * @param discountRate  Annual rate as decimal (e.g. 0.10 for 10%)
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number
): number {
  return cashFlows.reduce(
    (sum, cf, i) => sum + cf / Math.pow(1 + discountRate, i),
    0
  );
}
