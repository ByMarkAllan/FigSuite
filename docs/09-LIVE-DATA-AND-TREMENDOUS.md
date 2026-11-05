# FigSuite v1.2 — Tremendous and Massive integration

## Scope

Legal and payment-provider approval reported by the owner. This is not evidence of Tremendous's separate production account authorization or exchange redistribution rights. This branch adds server-side adapters, contract tests and a read-only market-data page. Live payouts are not activated by publication of this code.

### Stock reference data

- Source: Massive (https://api.massive.com).
- API: GET /api/market-data/stocks?ticker=SPY&timeframe=minute|day.
- Allowlisted tickers: SPY, QQQ, NVDA, AAPL, MSFT, AMZN, GOOGL, TSLA, META.
- Broker/trading data is NEVER used as a substitute for FigSuite simulated Yes/No probabilities or as unreviewed competition settlement evidence.
- Explicit source, tier, asOf, status, and 60-second browser refresh; closed markets are not labeled live.
- MASSIVE_API_KEY: server-only credential. No NEXT_PUBLIC prefix.
- MASSIVE_REDISPLAY_APPROVED=true: set only after documented entitlement to redistribute the exact data through FigSuite's user-facing app.
- MASSIVE_STOCKS_TIER=realtime|delayed|eod: must reflect actual licensed tier; false realtime configuration does not override staleness checks.
- If configuration is absent, return a deterministic 503 unavailable response. No invented prices or leaked secrets.
- Production requires provider rate limits, caching and exchange entitlement review before expanding symbols and users.

### Tremendous API integration

API reference: https://developers.tremendous.com/reference/create-order

- packages/prize-control/src/tremendous-client.mjs creates strictly validated fixed-award orders (not proportional to bought/allocated simulated contracts).
- Production and sandbox hosts/credentials are separated; sandbox keys start TEST_, production keys PROD_.
- Every Tremendous order has a deterministic unique external_id, allowing idempotent provider reconciliation.
- Recipient email/name, campaign ID, amount and funding source are required; no public payout route exists.
- Production requires an internal service to first validate source-of-truth prize ledger, two independent approvals, age/location/identity/tax/sanctions and disbursement limits; no release worker is deployed yet.
- Only verified, audited award release grants, never user-supplied request bodies, may authorize a future payout worker.
- The adapter constructor has productionExecutorEnabled=false by default. Vercel currently has PRIZES_ENABLED=false and the read-only status API reports payouts disabled.
- Production credentials must only be stored in a restricted server-side secret store once Tremendous separately authorizes the FigSuite prize model. Do not add a production key just to test this branch.
- For sandbox tests only, use isolated TEST_ key, sandbox campaign ID, test funding and test recipients in a controlled non-public environment.
- On network uncertainty, reconcile the order by external_id; never generate another ID or repeat without audit.
- Tremendous must confirm this use case complies with its restrictions: https://developers.tremendous.com/docs/production-api-access

### Mandatory launch blockers

1. Collect counsel approval scope, approved jurisdictions, classifications and versioned official rules. The owner-reported approval does not specify these.
2. Collect separate written Tremendous production approval for the actual FigSuite cash-prize use case and confirm prefunding/campaign.
3. Confirm Massive redistribution and real-time feed entitlements with exchange/plan limits.
4. Build persisted authenticated entry and eligibility services (free pathway equal to paid), auditable fixed winner selection, reconciliation and dispute workflows.
5. Build operator/finance dual-control UI, immutable order state machine, ledger lock and idempotency tests, sanctions/identity verification, budget/rate limits, monitoring and rollback.
6. Carry out sandbox UAT with approval evidence, then a separate production release review.

FigSuite remains an analytical simulation platform until those gates are satisfied.
