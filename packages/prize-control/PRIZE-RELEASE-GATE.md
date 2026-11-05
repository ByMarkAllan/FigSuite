# FigSuite — Cash prize isolation (v1.1)

**Status: INACTIVE — preview-only domain model, not a sweepstakes launch.**

The API surface in \`src/workflow.mjs\` only builds contest *drafts*, captures review attestations and generates fixed-award *previews*. It never executes or authorizes money movement.

Required independent gates before a future live prize proposal may be considered:

1. Written specialist legal classification across jurisdictions and verticals (including sports, politics, securities and event contracts).
2. Written permission from a suitable *payments* provider and a separate *payout* provider, explicitly covering this use case.
3. Approved official rules, no-purchase parity, age/geography restrictions and verified funding.
4. KYC/AML/sanctions, tax reporting, identity, payment security, disbursement dispute and fraud controls.
5. Provider sandbox contract tests, idempotent transfer ledger, dual-control authorization, manual kill switch and operational incident runbooks.
6. Explicit founder approval to develop a later **separate** cash-capable production service; no feature flag, API call, record, or internal admin role can activate payouts in v1.1.

A draft attestation is not legal or provider approval. Existing \`index.mjs\` intentionally fails closed for all real payout entrypoints.
