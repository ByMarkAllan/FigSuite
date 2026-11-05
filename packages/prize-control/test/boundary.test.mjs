import assert from 'node:assert/strict';
import test from 'node:test';
import { getPrizeControlStatus, evaluatePrizeActivation, requestPrizePayout, enrollPrizeRecipient } from '../src/index.mjs';

test('payout status defaults to full deny and no provider egress', () => {
  assert.deepEqual(getPrizeControlStatus(), {
    enabled: false, status: 'DISABLED_PENDING_LEGAL_AND_PROVIDER_APPROVALS',
    providerEgressEnabled: false, paymentMethodCollectionEnabled: false,
    simulationToFiatConversionEnabled: false,
  });
});

test('no caller-provided approval can activate payouts', () => {
  assert.equal(evaluatePrizeActivation({legal:true,processor:true,payoutProvider:true,security:true,finance:true,executive:true}).eligibleForActivation,false);
});

test('environment toggle cannot activate payouts', async () => {
  process.env.FIGSUITE_PRIZE_PAYOUTS_ENABLED='true';
  try { await assert.rejects(requestPrizePayout({amount:100, currency:'USD'}), {code:'PRIZE_PAYOUTS_DISABLED'}); }
  finally { delete process.env.FIGSUITE_PRIZE_PAYOUTS_ENABLED; }
});

test('recipient enrollment also denied', async () => {
  await assert.rejects(enrollPrizeRecipient({userId:'fake'}), {code:'PRIZE_PAYOUTS_DISABLED'});
});
