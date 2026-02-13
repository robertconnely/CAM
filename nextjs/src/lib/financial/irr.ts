/**
 * Internal Rate of Return via Newton-Raphson iteration.
 *
 * Finds the rate r where NPV(r) = 0:
 *   f(r)  = sum( CF_i / (1+r)^i )
 *   f'(r) = sum( -i * CF_i / (1+r)^(i+1) )
 *
 * Iterates: r_{k+1} = r_k - f(r_k) / f'(r_k)
 *
 * @returns IRR as decimal (e.g. 0.284 for 28.4%), or null if no convergence
 */
export function calculateIRR(
  cashFlows: number[],
  guess = 0.1,
  tolerance = 1e-7,
  maxIterations = 100
): number | null {
  if (cashFlows.length < 2) return null;

  // Check for at least one sign change (required for IRR to exist)
  let hasPositive = false;
  let hasNegative = false;
  for (const cf of cashFlows) {
    if (cf > 0) hasPositive = true;
    if (cf < 0) hasNegative = true;
    if (hasPositive && hasNegative) break;
  }
  if (!hasPositive || !hasNegative) return null;

  let r = guess;

  for (let iter = 0; iter < maxIterations; iter++) {
    let f = 0;
    let fPrime = 0;

    for (let i = 0; i < cashFlows.length; i++) {
      const denom = Math.pow(1 + r, i);
      f += cashFlows[i] / denom;
      if (i > 0) {
        fPrime += (-i * cashFlows[i]) / Math.pow(1 + r, i + 1);
      }
    }

    // Near-zero derivative — try a nudged guess
    if (Math.abs(fPrime) < 1e-12) {
      r += 0.01;
      continue;
    }

    const delta = f / fPrime;
    r -= delta;

    // Clamp to prevent divergence
    if (r <= -0.99) r = -0.5;

    if (Math.abs(delta) < tolerance) {
      return r;
    }
  }

  return null; // did not converge
}
