/** FigSuite v1.1: hard-disabled payout boundary. No runtime flag enables payouts. */
export const PRIZE_CONTROL_STATUS = Object.freeze({
  enabled: false,
  status: 'DISABLED_PENDING_LEGAL_AND_PROVIDER_APPROVALS',
  providerEgressEnabled: false,
  paymentMethodCollectionEnabled: false,
  simulationToFiatConversionEnabled: false,
});

export class PrizePayoutsDisabledError extends Error {
  constructor() {
    super('Prize payouts are disabled pending independent legal, provider, financial, security and executive approval.');
    this.name = 'PrizePayoutsDisabledError';
    this.code = 'PRIZE_PAYOUTS_DISABLED';
  }
}

/** Non-authoritative preview only. A flag or caller-supplied approvals cannot activate payouts. */
export function getPrizeControlStatus() { return PRIZE_CONTROL_STATUS; }

export function evaluatePrizeActivation(_approvals = undefined) {
  return Object.freeze({
    eligibleForActivation: false,
    executable: false,
    reason: 'INDEPENDENT_APPROVAL_AND_IMPLEMENTATION_GATE_NOT_AVAILABLE',
  });
}

/** Deliberately has no payout provider dependency, network adapter or credential path. */
export async function requestPrizePayout(_request) {
  throw new PrizePayoutsDisabledError();
}

export async function enrollPrizeRecipient(_recipient) {
  throw new PrizePayoutsDisabledError();
}
