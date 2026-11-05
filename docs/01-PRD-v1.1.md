# FigSuite™ — Product Requirements Document (PRD) v1.1

**Status:** Proposed baseline for founder review; not approved for production implementation  
**Version / Date:** 1.1 / 2026-11-03  
**Product thesis:** An institutional-grade, vertical-agnostic forecasting, simulation, and analytical talent evaluation environment.  
**Delivery strategy:** Simulation-first; independently gated, inactive cash-prize subsystem.  
**Canonical launch scope:** U.S. adults (18+) in an initial Finance-only closed beta; other jurisdictions and verticals explicitly gated.

## 1. Executive summary

FigSuite™ evaluates the quality of a person's forecasts, not their ability to spend. Users analyze resolvable events, record calibrated probability forecasts, explore a simulated LMSR-based pricing environment, earn non-transferable reputation (Bips), and compare performance in individual and Guild leaderboards. Finance is the launch vertical. Sports and Global Events are additional adapters to the same event lifecycle and forecast engine.

A future promotional-prize program is architecturally separate. **All prize-disbursement operations remain disabled by default in every environment, including production, unless separately activated under documented legal, payment-provider, payout-provider, financial, security, and executive gates.** No simulated contract represents ownership of money, security, betting interest, or claim on cash. FigSuite makes no promise that nomenclature, no-purchase routes, fixed prize pools, or funding arrangements determine legal classification.

### 1.1 Primary outcomes
1. Let an analyst construct a timestamped, probability-based forecast for a clearly defined event.
2. Publish transparent, reproducible resolutions and scoring methodology.
3. Measure predictive skill longitudinally with sample-size and difficulty normalization.
4. Provide a professional, real-time *simulation* terminal and source provenance.
5. Enable fair Guild competition and auditable community discussion.
6. Create defensible B2B value: performance analytics and eventually opt-in talent discovery.

### 1.2 Not in scope for the first beta
- Real-money wagers, trades, simulated credits redeemable for fiat, user-to-user transfers, cash-out, real-asset brokerage execution, paid competition advantage, or proportional cash-prize settlement.
- Automatic external strategy execution, endorsement of investment strategies, regulated financial advice, or unaffiliated scraping that violates third-party terms.
- Prize payout activation, paid Contracts that influence prize eligibility, and use of Stripe for prize-related payments without written approval.
- Sports and political-event competitions in the first public launch.

## 2. Personas, jobs to be done, and permissions

| Persona | Primary job | Launch privileges |
|---|---|---|
| Independent Analyst | Record forecasts; prove calibration and consistency | Create forecasts, view results, manage profile |
| Quantitative / Strategy Researcher | Explore systematic forecasts and simulated price dynamics | Same official scoring access; advanced sandbox configurations may be separate |
| Guild Member / Captain | Collaborate without score or asset pooling | Join/leave, roster management with explicit consent |
| Spectator | Observe markets and forecast trends | Browse permissible public data; participate with an account |
| Moderator | Handle reports, spam, harassment, conflicts | Moderation case management and audit logging |
| Market Operator | Create rules, manage markets, finalize resolutions | Restricted server-side/admin permissions, four-eyes critical actions |
| Compliance / Treasury Operator | Review optional future prize programs and obligations | Separate authorization; no prize production capability until gates pass |
| Sponsor / Enterprise Analyst | Support a clearly disclosed program; assess aggregate results | Sponsorship management and approved aggregate reporting |

**RBAC:** `user`, `guild_captain`, `moderator`, `market_operator`, `finance_reviewer`, `compliance_reviewer`, `platform_admin`. Elevated roles require MFA and non-self-approval for sensitive actions. Moderators may not alter forecast history or scoring.

## 3. Product principles and decision log

| ID | Decision | Rationale | Status |
|---|---|---|---|
| D-001 | One event/forecast core across verticals | Avoid divergent business logic | Proposed |
| D-002 | No purchasable forecast advantage in official leaderboards | Preserve analytical integrity | Proposed |
| D-003 | Simulation units are never fiat-denominated or redeemable | Avoid misleading economic equivalence | Proposed |
| D-004 | Prize infrastructure physically/logically isolated and default-deny | Block accidental activation | **Fixed by founder instruction** |
| D-005 | Bips cumulative; skill rating separate and rolling | Avoid volume-based leaderboards | Proposed |
| D-006 | Market allocations and forecasts are distinct domain objects | Preserve correctness and fairness | Proposed |
| D-007 | Finance-first beta; sports and events follow | Limit initial licensing and resolution complexity | Proposed |
| D-008 | Forecast commitments are immutable after lock | Auditability | Proposed |
| D-009 | Pro paid features cannot advantage official prize-eligible competition | Payment/legal/fairness control | Proposed |

**Language restriction:** use “simulated allocation,” “virtual quote,” “reputation,” and “forecast.” Avoid suggesting “investment returns,” “dividends,” “guaranteed profit,” or “cash settlement” in general-user simulation UI.

## 4. Taxonomy and asset separation

1. **Capital Credits (`workspace_credits`)** — optional, seller-maintained premium SaaS utility credit for noncompetitive terminal customization only. Not usable for official forecast slots, simulator exposure, prizes, odds, or rankings. No transfer/redemption. Do not launch payment capability until processor approval for FigSuite's *actual* business model. Proposed Pro discount: 20% on eligible workspace credits with a documented $200/month pre-discount eligible spend cap; finance review required. This is *not* a launch dependency.
2. **Allocated Contracts (`simulation_vouchers`)** — nontransferable, fixed-denomination access rights to a simulation allocation event; no economic value. Launch grants are equal to qualified users by event and cannot be bought. Each voucher permits one qualifying simulated allocation operation subject to global limits. The number and size of allocations must not directly determine official skill ranking or prize probability.
3. **Simulated Units (`sim_units`)** — independently granted, non-purchasable abstract budget used to model LMSR quote changes. Does not represent fiat or a stored monetary value. Each participant starts a comparable allocation budget when joining an official simulation.
4. **Bips (`reputation_bips`)** — additive-only, nonspendable lifetime reputation. A “bip” is a platform score unit, not a financial basis point, interest rate, or return. No negative adjustments except demonstrable corrections via reversible audit entries, without erasing history.
5. **Skill Rating (`skill_rating`)** — independent, dynamic measure of forecast quality; uses calibration, outcome difficulty, comparisons to a frozen baseline, and sample-size qualification. Can rise or fall based on new results.
6. **Session Gas (`session_gas`)** — ephemeral social rate-limiting allowance for an option community. Reading is free. Posting/upvoting/mentions cost configured units. Gas cannot be purchased for extra influence. Grant a baseline per session; an eligible forecast may grant an additional capped amount. Allow daily refresh and abuse controls so users do not need to spam allocations to speak.
7. **Prize Entries (`prize_entries`)** — a wholly distinct future domain; never generated by purchasing Credits, simulated allocations, or Gas. A prize program's access, criteria, odds, and free method of entry must be specifically reviewed before any activation. No implied entitlement in v1.1.

## 5. Vertical-agnostic event and session model

**Event definition** (immutable version at opening): `id`, `vertical`, title, objective question, mutually exclusive/exhaustive options, time zone (`IANA`), opens_at, lock_at, scheduled_resolution_at, resolution rule and tie/cancel policy, approved primary/secondary source references, source license, allowed user regions, rule version, market configuration, evidence policy, and moderation classification.

**Event states:** `DRAFT → REVIEW → SCHEDULED → OPEN → LOCKED → RESOLVING → PROVISIONAL → FINALIZED`; alternative terminal states `VOIDED`, `CANCELLED`, `DISPUTED` (disputed is a blocking review state with appeal workflow). Only allowed transitions are server-side and append audited state change records.

**Finance Intraday Combine:** market-local opening and locking configured using `America/New_York`, exchange calendars, holidays, half-days and feed interruption policy. Suggested default: 09:30 open, 10:00 lock, scheduled close at 16:00 on regular U.S. trading days; early close override. Outcomes and exact reference price/measurement must be fixed before entry.

**Weekly Epoch:** configurable Monday 09:30 to Friday 16:00 in the exchange's calendar, with nontrading day and early-close handling. A weekly event can accept time-bounded forecasts as defined before opening; no amendments after its lock.

**Sports:** normally lock before actual kickoff/first pitch or earlier. No automatic 30-minute in-play prediction window unless intentionally designed as a separately classified and legally reviewed product.

**Current events:** choose a published authoritative outcome and resolution deadline; avoid vaguely phrased questions and unbounded event resolution.

**Forecast record:** participant, event and option, vector of probabilities that sum to 1, client request ID, server-received timestamp, event version, basis/rationale (optional), privacy, model/source provenance (optional). One official scoring commitment per user/event by default. Draft edits are permitted until lock; history retains every change. No post-lock revision.

## 6. Simulation engine requirements

### 6.1 Correct LMSR mechanics

For `K` outcomes with outstanding quantities `q_1,...,q_K` and liquidity parameter `b > 0`:

- `C(q) = b × ln(Σ_k exp(q_k / b))`
- `p_i(q) = exp(q_i/b) / Σ_k exp(q_k/b)`
- `execution_cost = C(q + Δq) − C(q)`

Use numerically stable log-sum-exp and fixed precision conversion at boundaries. In a symmetric starting state, each option is priced `1/K` (0.5 only for binary). Quotes are derived from simulator state, not cash markets. The simulator must not accept arbitrary negative balances or quantities. For a fixed initial state `q=0`, the theoretical LMSR worst-case market-maker loss bound relative to initial cost is `b ln(K)` in the model's abstract unit; this **is not** a treasury reserve or fiat liability.

### 6.2 Official scoring separate from virtual allocation

- Official outcome forecasting measures probabilities submitted *before lock*; not number of virtual Contracts purchased or won.
- Brier error for a binary event: `(p − y)^2`, where `y∈{0,1}`. For multi-class: use a normalized multi-class Brier score and clearly publish the normalization.
- Proposed positive lifetime Bips: `floor(100 × max(0, baseline_error − user_error) / max(baseline_error, ε))`, capped per resolved event; exact calibration and baseline require validation before launch. Snapshot baseline model version before event open. Scoring corrections are compensating ledger entries.
- Official skill index: rolling average improvement over frozen pre-event baseline, weighted by event difficulty and confidence, with uncertainty intervals and minimum-event qualifications. A user can lose skill rank without losing historical reputation entries.
- Leaderboards: sort by qualified skill index for `Analyst Performance`; separately show `Lifetime Bips` and `Activity`. Do not use `(wins−losses)/contracts` as the sole measure of predictive skill.

### 6.3 Anti-whale and market integrity

- All users receive the same official simulation allocation budget and forecast submission opportunities.
- Per-event/option limits, repeat-action controls, rate limits, anti-sybil review, insider-information reporting and anomaly monitors.
- Use a capped `sqrt(units)` curve **only** for optional game-like participation visualization, never for skill scoring or cash prize calculations.
- Sponsor funding, paid subscription, premium dashboards, credits, and guild size may not secretly alter official odds, grading, or market access.

## 7. Core feature requirements and acceptance criteria

| ID | Priority | Requirement | Acceptance checkpoint |
|---|---|---|---|
| FR-001 | P0 | Auth, verified email, 18+ attestation, terms consent | Unauthorized APIs reject; RLS automated tests pass |
| FR-002 | P0 | Discover and filter events by vertical, window, state | Correct states and time zones render on desktop/mobile |
| FR-003 | P0 | Operator creates versioned event with resolution rules | Cannot open without two required source/evidence checks |
| FR-004 | P0 | Submit/edit probability forecast before hard lock | At/after lock server rejects independently of browser time |
| FR-005 | P0 | Allocate virtual budget in LMSR simulator | State transition atomic; costs match deterministic reference tests |
| FR-006 | P0 | Ingest source observations with timestamp/provenance | Idempotent ingestion and stale-source indicators |
| FR-007 | P0 | Resolve provisionally and finalize with evidence | Disputes/corrections leave immutable audit trail |
| FR-008 | P0 | Post qualified Bips entries and rolling skill | Re-running settlement never duplicates entries |
| FR-009 | P0 | Leaderboards with qualification and confidence | Large-volume low-accuracy profiles cannot dominate skill sorting |
| FR-010 | P0 | User-facing simulation disclosures and help | No UI falsely suggests real cash/wagering in beta |
| FR-011 | P0 | Prize feature *hard-disabled* | No user or service can trigger payout on any default config |
| FR-012 | P1 | Analyst portfolio/calibration visualization | History shows source/outcome and scoring inputs |
| FR-013 | P1 | Guild roster, membership, ledgers | No transfer/pooling; membership history preserved |
| FR-014 | P1 | Option chats with Gas and moderation | Read freely; cross-option and self-vote abuse blocked |
| FR-015 | P1 | Sports adapter and resolution tests | Validated fixtures and actual-event edge cases |
| FR-016 | P1 | Current-events adapter | Reviewable official source and ambiguity adjudication |
| FR-017 | P1 | Operator/admin consoles | Two-person review for resolution overrides |
| FR-018 | P2 | Approved SaaS tier plans | Feature entitlements separated from forecast scoring |
| FR-019 | P2 | Composer reference/strategy import | Explicit rights, consent, versioned definitions; no execution |
| FR-020 | P2 | Sponsor and enterprise dashboards | Advertiser disclosure and privacy-safe aggregation |
| FR-021 | P2-GATED | Prize program definition and payout drafts | No deployment of active prize feature until all gates pass |

## 8. UX and design principles

- Visual direction: institutional/terminal, high-density but accessible; dark and light themes with high-contrast annotations.
- Primary navigation: **Combines, Epochs, Portfolio, Rankings, Guilds, Research**. Admin navigation separately permissioned.
- Event detail: immutable resolution rule, source, countdown, latest observations, probability forecast, simulator quotes, implied probability explanation, community tab, provenance and dispute actions.
- Never present LMSR quote as “actual probability” without label; distinguish market-implied sentiment from forecast accuracy.
- Differentiate `Official Forecast` from `Simulation Allocation`. Confirm on submission with an audit receipt.
- Accessibility: WCAG 2.2 AA target, keyboard workflows, screen-reader labels, reduced motion, no color-only state indicators.
- Public user profile opt-in for discoverability, private default for sensitive forecasts where appropriate, account deletion/export controls.

## 9. Prize Program — isolated inactive capability

**This is an architectural placeholder, not an authorized sweepstakes plan.** The original corporate-funded proportional payout specification is *not* approved and must not be implemented as an active program. Paying for more forecasting allocations can change expected prize shares even with free alternatives and fixed sponsor funding; that is a central unresolved legal issue.

**Allowed preparation:** separate admin-only configuration schemas, mock provider contract, inactive payout queue, test fixtures, audit trail, and a non-routable sandbox test runner that cannot perform real transfers.

**Forbidden until written approvals:** real recipient enrollment for prizes, payment-method linking for prize qualification, fund transfers, live Tremendous credentials, active prize API endpoints, automatic payouts, paid Credits applied to prize entries, and production marketing promising prizes.

**Future activation checklist (all required):**
1. Qualified counsel signs off on each actual competition model, state/jurisdiction eligibility, rules, disclosures, age, registration/bonding if applicable, tax, anti-fraud, dispute, and retention requirements; CFTC/SEC/state regulatory characterization explicitly addressed.
2. Applicable billing/processing providers approve the disclosed FigSuite business activities *in writing*. Stripe is **not assumed available** for the proposed cash-prize offering.
3. Payout provider approves use case, geography, tax/identity obligations and delivery methods; test reconciliation completed.
4. Executive owner and independent compliance owner sign the exact prize program version and allowlist of jurisdictions/markets.
5. Security signs infrastructure controls, secret isolation, monitoring, tests, independent kill switch and runbook.
6. Only then can specific signed program IDs be enabled using two independent production approvals and a time-bounded feature flag. A global emergency disable overrides any program enablement.

**Equal opportunity principle:** any legally approved prize program must use an independently reviewed entrance/eligibility/scoring system. No participant should gain improved prize odds via spending, Pro features, simulated units, or social engagement. A separate no-purchase alternative alone is not treated as sufficient legal compliance.

## 10. Nonfunctional requirements

- **Correctness:** zero duplicate accepted final forecasts under concurrency; zero duplicate final settlement or Bips entries; determinism from event version and source snapshot.
- **Latency targets:** p95 < 300 ms for cached event reads, p95 < 800 ms for forecast commits under planned load (targets to validate in staging), soft realtime ≤3 seconds for simulator state fanout. No guarantees of provider feed latency.
- **Availability goals:** 99.9% monthly core read availability after general launch; automatic graceful degraded read-only mode on feed outage.
- **Durability:** immutable audit trail, PITR/backups for Postgres, tested restore; write-ahead transactional events/outbox.
- **Security:** RLS on exposed tables, granular privileges, no service-role key in browser, MFA for privileged users, least-privilege secrets, webhook signature verification, data minimization.
- **Privacy:** retention schedule for device signals; privacy notice, deletion/export; no sensitive fingerprints shared with sponsors.
- **Monitoring:** source age, ingest lag, forecast rejection, events pending resolution, ledger drift, suspicious referral patterns, denied payout attempts and disabled-gate status.
- **Accessibility:** WCAG 2.2 AA target across high-priority terminal flows.

## 11. Metrics and validation plan

**Product:** week-1 and week-4 analyst retention; percent of new users submitting ≥3 qualified forecasts; calibration improvement; time from signup to first forecast; event participation completion; qualified Guild formation.

**Trust:** percent of events with prepublished unambiguous criteria; median resolution delay; dispute rate and overturned resolution rate; duplicate ledger incidents (target zero); number of prize egress events while disabled (target zero).

**Economic:** SaaS conversion (after approval), sponsor revenue independent of event allocations, data/feed cost per active analyst, B2B research adoption.

Do not present user-specific performance as investment advice or market-beating returns.

## 12. Release gates and ownership

- **G0 — Rules & legal review:** Regulatory matrix; processing provider suitability; no-prize beta disclosures.
- **G1 — Platform security:** RLS tests, auth abuse tests, incident runbook, architecture threat model.
- **G2 — Simulator accuracy:** LMSR property and concurrency tests, deterministic settlement and source failover.
- **G3 — Private Finance beta:** Participant feedback, valid market data rights, scoring validation, accessibility basics.
- **G4 — Public simulation beta:** Observability, retention, trust metrics, support and dispute queues.
- **G5 — Cross-vertical scale:** Sports and global events with source licensing and resolution policy.
- **GP — Prize activation (independent, not date-based):** All six written approvals above; without them prize service remains inactive indefinitely.

**Change control:** Roadmap changes, new GitHub issue creation and verification/acceptance gates require founder approval. PR-to-staging, verification, and production deployment are separate gates. Do not grant implied production authorization from PRD acceptance.

## 13. External reference points (checked 2026-11-03)

- CFTC, 2026-10-09 proposed event-contract/swap-definition rule: https://www.cftc.gov/PressRoom/PressReleases/9310-26
- CFTC, 2026-06-10 event-contract NPRM: https://www.cftc.gov/PressRoom/PressReleases/9249-26
- FTC on sweepstakes and increased purchase-based odds: https://consumer.ftc.gov/articles/fake-prize-sweepstakes-and-lottery-scams
- Stripe prohibited/restricted businesses (last updated 2026-09-22): https://stripe.com/legal/restricted-businesses
- Supabase RLS guidance: https://supabase.com/docs/guides/database/postgres/row-level-security

**Disclaimer:** Legal and provider references identify issues for counsel and vendors to resolve, not legal advice or regulatory approval.

## 14. Questions frozen for founder approval

1. Confirm **Finance-only private beta**, then sports and global events in subsequent milestones.
2. Confirm **one official scored forecast per user/event**, with editable history only until lock.
3. Confirm **Capital Credits cannot purchase additional official simulator exposures, forecasts, or prize chances**; they may be used only for noncompetitive SaaS utilities.
4. Confirm the published skill score (calibrated Brier improvement) becomes the primary ranking, with cumulative Bips as secondary reputation.
5. Confirm **prize feature is inactive and never blocks the simulation launch**, even if legal review remains unresolved.

