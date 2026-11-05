# FigSuite™ — Forecasting Intelligence Terminal

![Status](https://img.shields.io/badge/Status-UI%20alpha-3579F5) ![Mode](https://img.shields.io/badge/Mode-Simulation%20only-28C997)

> FigSuite is an institutional-style **forecasting simulator and analyst skill platform**, not a gambling site, securities exchange, brokerage, or live prediction market. All price data, markets, account metrics, and leaderboard entries in this starter are **fictional or illustrative**.

This repository package is the first implementation of the **FigSuite v1.1 hybrid architecture**. Its UI is influenced by general conventions used in analytical terminals (chart workspace, instrument watchlist, keyboard search, timeframe controls) and prediction-market discovery products (outcome-based scenario cards and probability comparisons), with independent FigSuite branding and original implementation. It does **not** embed or reproduce proprietary TradingView or Polymarket components or data.

## Alpha feature set

- Responsive, dark professional terminal: navigation, watchlist, probability chart, market cards, search, sort, category filters, and sample leaderboards.
- Interactive two-outcome forecast ticket. A local-session forecast supports 50–99% confidence in Yes or No and is marked as a **demo**.
- Separate simulated allocation ticket with mathematically correct **LMSR quote previews**, abstract-only simulator balance, outcome state updates, and no monetary value.
- Unit-tested LMSR cost/probabilities, deterministic Brier scoring, and a physically isolated `prize-control` module with denial-by-default tests.
- Stubbed read-only `/api/health` endpoint. **No Supabase data persistence**, third-party feed, user sign-in, payment, or payout integration is enabled.
- Includes the v1.1 PRD, architecture, GitHub backlog and milestone roadmap for subsequent implementation.

## Start in a GitHub Codespace

**Repository:** `ByMarkAllan/FigSuite`  
**Vercel project:** `figsuite`, team `fig-suite`, root `apps/web` (Git-linked but no deployment at package preparation)

1. On GitHub, open the repository and choose **Code → Codespaces → Create codespace on main**. Node 22 is configured in `.devcontainer/devcontainer.json`.
2. **Create a feature branch** in the Codespace terminal before importing the files:

   ```bash
   git switch -c feat/finance-terminal-v0.1
   ```

3. Download `FigSuite-UI-Starter.zip` from the ChatGPT reply, then drag it into the **root of the Codespaces VS Code Explorer**. If uploaded inside a folder, move it into the repository root.
4. Unpack the source at the repository root:

   ```bash
   unzip -o FigSuite-UI-Starter.zip -d .
   rm FigSuite-UI-Starter.zip
   npm install
   npm test
   npm run typecheck
   npm run build
   npm run dev
   ```

5. Open the forwarded **port 3000** URL. In Codespaces, set the port to **private** while this is an internal alpha.
6. Commit the source and generated lockfile on the feature branch and open a draft PR. **Do not merge to `main` or promote a production deployment until the test/build/security gates pass.**

   ```bash
   git add .
   git commit -m "feat: add FigSuite v1.1 finance terminal alpha"
   git push -u origin feat/finance-terminal-v0.1
   ```

> The ChatGPT GitHub integration still needs repository installation scope on `ByMarkAllan/FigSuite` to write directly, and no Codespace was programmatically created. This package is designed for importing in the Codespace you open.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server, `0.0.0.0:3000` |
| `npm run build` | Production compile |
| `npm run typecheck` | TypeScript diagnostics |
| `npm test` | Unit tests for simulation and disabled prizes |
| `npm run check` | Unit tests + typecheck |

**Dependency note:** This environment cannot contact the npm registry. Run `npm install` in Codespaces to fetch dependencies and generate `package-lock.json`, then commit the lockfile. CI accepts an initial lockfile-free bootstrap, and will use `npm ci` once the lockfile is committed. No dependency install or Next.js compile was executed while packaging this scaffold.

## Repository structure

```text
apps/web/
  app/                 Next.js App Router shell, CSS, health route
  components/          Interactive finance terminal
  lib/                 Illustrative market data, FigSuite icon
packages/simulation/  Shared deterministic LMSR and Brier domain functions
packages/prize-control/  Isolated denial-by-default prize module; no external provider
.devcontainer/        Codespaces Node 22 / forwarded port config
.github/workflows/    Unit, typecheck, build workflow
supabase/              Future reviewed migrations; intentionally absent
 docs/                 PRD, architecture, roadmap and integration handoff
 github/               60-item issue-ready CSV
```

## Security and compliance boundaries

1. `packages/prize-control` exports **no live payout capability**, and setting `PRIZES_ENABLED=true` cannot change this.
2. The Vercel `PRIZES_ENABLED` variable is configured `false` for production, preview, and development. Never add live payout or payment-service credentials.
3. Simulation units, Bips and probability quotes are nonmonetary, nonredeemable and nontransferable.
4. Official skill rankings must eventually derive from immutable server-recorded forecasts and independently finalized outcomes, not from simulated allocation quantities or purchases.
5. No real user data must be stored in the demo until Supabase Auth/RLS, consent, server clock and idempotency are implemented and reviewed.
6. Before adding Supabase tables, review the existing warning involving the exposed `public.rls_auto_enable()` security-definer event trigger. The project was healthy but contained no application tables or migrations when last inspected.
7. Legal counsel plus payment/payout provider, finance, security and executive signoffs are prerequisites for **any future prize functionality**, independent of technical readiness.

## Next engineering milestones

1. `G0` — rulebook, schema and compliance ADRs, scoring specification, official eligibility constraints.
2. `G1` — Next.js + Supabase Auth, RLS-protected records, roles, API errors, telemetry and CI gates.
3. `G2` — server-authoritative forecast commitment, immutable event definitions, idempotent LMSR allocation and audited resolution.
4. `G3` — production-quality financial data adapters, licensed feed, exchange calendar, terminal UAT.
5. `GP` — preserve disabled and isolated cash-prize module until a separate compliant activation decision.

Read the authoritative [`PRD`](docs/01-PRD-v1.1.md), [`technical architecture`](docs/02-TECHNICAL-ARCHITECTURE-v1.1.md), and [`GitHub roadmap`](docs/03-GITHUB-ROADMAP-v1.1.md) for complete acceptance criteria. No work in this package constitutes approval to release production or monetary functionality.
