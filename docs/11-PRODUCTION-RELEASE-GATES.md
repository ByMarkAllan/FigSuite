# FigSuite — Production Release Gates (v1)

**Status:** Evidence checklists created; neither gate is approved or automatically deployable.

## Two independent gates

1. **Finance MVP (finance_mvp):** production Finance-first forecasting and simulation without deposits, cash prizes, withdrawals, asset trades or payout egress.
2. **Cash prizes (cash_prizes):** separate subsequent release depending on Finance MVP plus specialist legal, treasury, payout-provider, security and founder signoffs. Generic provider approval does not alone authorize this specific prize use case.

The machine-readable checklist is in config/release-gates.json, and current evidence and approvals in config/release-evidence.json.

## Public browse and authenticated-action contract

- **Anyone:** open the FigSuite terminal, explore scenarios, change filters, read sample leaderboard information and inspect the market-data dashboard.
- **Logged-in users only:** record or revise demo forecasts, allocate virtual simulation units, add or remove watchlist items, edit profile data, and perform all future user-owned create/update/delete actions.
- **Enforcement:** page load gets SSR-authenticated claims; before each local demo mutation the client revalidates the account with Supabase Auth getUser. A session may expire after page load. Every future persistent mutation must verify identity server-side and enforce ownership through PostgreSQL RLS. Client prompts are not a substitute for trusted authorization.
- **Existing reality:** forecasts, allocations and saved scenarios are browser-session-only. No official scoring or durable user event record exists yet. Do not imply that sign-in alone makes a demo forecast persistent.
- **Never:** use editable user_metadata for authorization; allow arbitrary post-login redirects; mix virtual simulation units and cash; grant anonymous access to prize-control tables.

### Supabase email operational activation

1. Set the FigSuite project Auth Site URL to https://app.figsuite.com and allow https://app.figsuite.com/auth/callback and https://app.figsuite.com/auth/confirm.
2. Ensure Email provider, OTP or magic-link email template, production SMTP, sender domain and rate limits are configured. A numeric code requires the Magic Link template to contain the Supabase Token variable. A magic link can instead be used.
3. End-to-end UAT: actual controlled-inbox sign-up/login, valid and expired/replayed codes, logout, session refresh, disabled account behavior, user-to-user RLS isolation and profile edits.
4. Keep the terminal publicly browsable; do NOT turn on the legacy FIGSUITE_AUTH_REQUIRED variable. Route-wide login enforcement would violate the approved browse-first model.
5. Auth verification for future official forecast/account mutations belongs on authenticated server endpoints and cannot be satisfied by this demo's client handler.

## Gate review operations

- node scripts/check-release-gates.mjs --schema validates the checklist schema and fails if payout disable contract changed.
- node scripts/check-release-gates.mjs --report prints outstanding acceptance items.
- node scripts/check-release-gates.mjs --gate=finance_mvp checks Finance MVP evidence and signoffs.
- node scripts/check-release-gates.mjs --gate=cash_prizes checks Cash prizes and prerequisite Finance MVP.
- GitHub Actions: Review FigSuite release gate is manual and non-deploying. A passing check never changes Vercel, payout provider, production domain or cash-payout capabilities.

Every accepted check needs an actual HTTPS evidence URL, verified reviewer ID and timestamp. Each release requires distinct accountable reviewers; duplicate reviewer identities fail the gate.

**Important:** This file's verification script checks internal completeness, not truth of external evidence. Product owner/security/legal/finance reviewers must inspect linked evidence independently. Use protected release environments and approval procedures. Cash-prize activation requires its own separately approved code and infrastructure release.

## Finance MVP — production readiness

Must verify: protected account identity (including age and disabled accounts), RLS/RBAC/MFA, isolated environments, durable versioned events and official forecasts, transaction-safe virtual allocation and idempotency, independent resolution/scoring/revisions, licensed feed provenance, threat-model and security scans, structured logs/alerts, backups/restore, privacy/accessibility/support/account deletion, performance/reliability, beta UAT and rollback, and **zero payment-to-prize pathway**.

## Cash prizes — separate production release

Must verify: legal classification by jurisdiction and contest type, official rules and independent non-purchase entry, identity/age/location/tax/KYC screening, explicit Tremendous production use-case approval and prefunding, independent double authorization, sealed winner selection and funds ledger, idempotent payout worker, verified webhooks and reconciliation, fraud controls and caps, kill switch, negative/sandbox tests, and legal/finance/security/founder final signoff.

## Existing roadmap crosswalk

- Original MVP: FGS-001–FGS-036; verify rather than auto-close partially implemented issues.
- Identity: FGS-011, FGS-012 and #47.
- Engine integrity: FGS-017–FGS-028.
- Finance beta: FGS-036.
- Prize restrictions and worker: #42, #45.
- Board activation: #39. The issue backlog alone does not prove the Project v2 board is active.

**Roadmap gates are not enabled until their independent acceptance evidence is complete and reviewed.**
