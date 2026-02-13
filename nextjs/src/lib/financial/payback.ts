/**
 * Cumulative payback period in months.
 *
 * Finds the year where cumulative cash flow crosses zero,
 * then linearly interpolates within that year to estimate months.
 *
 * @param cashFlows  Array starting with negative investment
 * @returns  Months to payback, or null if never pays back within projection
 */
export function calculatePayback(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;

  // Build cumulative cash flows
  const cumul: number[] = [];
  let sum = 0;
  for (const cf of cashFlows) {
    sum += cf;
    cumul.push(sum);
  }

  // Find crossover year (first year where cumulative >= 0)
  for (let i = 1; i < cumul.length; i++) {
    if (cumul[i] >= 0) {
      // Linear interpolation within the crossover year
      const remainingAtStart = Math.abs(cumul[i - 1]);
      const cashInYear = cashFlows[i];

      if (cashInYear <= 0) return null; // shouldn't happen at crossover

      const fractionOfYear = remainingAtStart / cashInYear;
      const paybackYears = (i - 1) + fractionOfYear;
      return Math.round(paybackYears * 12);
    }
  }

  return null; // never pays back within projection
}
