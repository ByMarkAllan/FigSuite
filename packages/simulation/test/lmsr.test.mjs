import test from 'node:test';
import assert from 'node:assert/strict';
import { lmsrCost, lmsrPrices, quoteAllocation, brierScore } from '../src/index.mjs';

test('neutral binary and ternary quotes sum to one', () => {
  assert.deepEqual(lmsrPrices([0, 0], 80), [0.5, 0.5]);
  const probs = lmsrPrices([0, 0, 0], 80);
  assert.equal(probs.length, 3);
  assert.ok(Math.abs(probs.reduce((a,b)=>a+b,0)-1)<1e-12);
});
test('LMSR cost is positive and monotone after allocation', () => {
  const quote = quoteAllocation([60,0], 80, 0, 10);
  assert.ok(quote.cost > 0 && quote.cost < 10);
  assert.ok(quote.pricesAfter[0] > quote.pricesBefore[0]);
  assert.ok(lmsrCost(quote.updatedQuantities,80) > lmsrCost([60,0],80));
});
test('stable LMSR handles large quantities', () => {
  const prices = lmsrPrices([1_000_000,999_999], 75);
  assert.ok(prices.every(Number.isFinite));
  assert.ok(Math.abs(prices[0]+prices[1]-1)<1e-12);
});
test('Brier scoring rewards calibrated forecasts', () => {
  assert.ok(brierScore([0.8,0.2], 0) < brierScore([0.55,0.45], 0));
  assert.equal(brierScore([1,0],0),0);
});
test('invalid allocation is rejected', () => {
  assert.throws(()=>quoteAllocation([0,0], 80, 0, 0), RangeError);
  assert.throws(()=>quoteAllocation([0,0], 0, 0, 1), RangeError);
  assert.throws(()=>brierScore([0.6,0.6],0), RangeError);
});
