/** Pure simulation primitives; not for real-money or regulated event contracts. */
function assertVector(quantities, liquidity) {
  if (!Array.isArray(quantities) || quantities.length < 2 || quantities.some((v) => !Number.isFinite(v))) {
    throw new RangeError('Quantities must be a finite vector with at least two outcomes');
  }
  if (!Number.isFinite(liquidity) || liquidity <= 0) throw new RangeError('Liquidity must be positive');
}
function stableLogSumExp(values) {
  const max = Math.max(...values);
  return max + Math.log(values.reduce((sum, value) => sum + Math.exp(value - max), 0));
}
export function lmsrCost(quantities, liquidity) {
  assertVector(quantities, liquidity);
  return liquidity * stableLogSumExp(quantities.map((q) => q / liquidity));
}
export function lmsrPrices(quantities, liquidity) {
  assertVector(quantities, liquidity);
  const scaled = quantities.map((q) => q / liquidity);
  const max = Math.max(...scaled);
  const weights = scaled.map((x) => Math.exp(x - max));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((v) => v / total);
}
export function quoteAllocation(quantities, liquidity, outcomeIndex, units) {
  assertVector(quantities, liquidity);
  if (!Number.isInteger(outcomeIndex) || outcomeIndex < 0 || outcomeIndex >= quantities.length) throw new RangeError('Unknown outcome');
  if (!Number.isInteger(units) || units < 1 || units > 100) throw new RangeError('Units must be an integer from 1 to 100');
  const updatedQuantities = [...quantities];
  updatedQuantities[outcomeIndex] += units;
  const rawCost = lmsrCost(updatedQuantities, liquidity) - lmsrCost(quantities, liquidity);
  return { cost: Math.round(Math.max(0, rawCost) * 1e6) / 1e6, pricesBefore: lmsrPrices(quantities, liquidity), pricesAfter: lmsrPrices(updatedQuantities, liquidity), updatedQuantities };
}
export function brierScore(probabilities, winnerIndex) {
  if (!Array.isArray(probabilities) || probabilities.length < 2 || probabilities.some((p) => !Number.isFinite(p) || p < 0 || p > 1)) throw new RangeError('Invalid probability vector');
  if (Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) > 1e-9) throw new RangeError('Probabilities must sum to one');
  if (!Number.isInteger(winnerIndex) || winnerIndex < 0 || winnerIndex >= probabilities.length) throw new RangeError('Invalid winning index');
  return probabilities.reduce((sum, p, i) => sum + (p - (i === winnerIndex ? 1 : 0)) ** 2, 0) / probabilities.length;
}
