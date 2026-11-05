export interface PrizeControlStatus {
  readonly enabled: false;
  readonly status: 'DISABLED_PENDING_LEGAL_AND_PROVIDER_APPROVALS';
  readonly providerEgressEnabled: false;
  readonly paymentMethodCollectionEnabled: false;
  readonly simulationToFiatConversionEnabled: false;
}
export declare const PRIZE_CONTROL_STATUS: Readonly<PrizeControlStatus>;
export declare class PrizePayoutsDisabledError extends Error { readonly code: 'PRIZE_PAYOUTS_DISABLED'; }
export declare function getPrizeControlStatus(): Readonly<PrizeControlStatus>;
export declare function evaluatePrizeActivation(approvals?: unknown): Readonly<{eligibleForActivation: false; executable: false; reason: string}>;
export declare function requestPrizePayout(request: unknown): Promise<never>;
export declare function enrollPrizeRecipient(recipient: unknown): Promise<never>;
