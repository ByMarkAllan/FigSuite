# Codespaces Import — Acceptance Checklist

**Target:** `ByMarkAllan/FigSuite` / feature branch `feat/finance-terminal-v0.1`; no direct merge to main.

- [ ] Create a Codespace from the repository under the ByMarkAllan account.
- [ ] Create the feature branch before importing starter files.
- [ ] Upload and unzip the repository-root FigSuite starter zip.
- [ ] `npm install` completes, generating lockfile; no env secrets added.
- [ ] `npm test` passes (9 expected tests: 5 LMSR/Brier, 4 prize-denial).
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm run dev` exposes private port 3000; manually inspect market cards, chart, ticket, mobile layout.
- [ ] `/api/health` reports simulation demo, `payoutsEnabled=false`, no persistence.
- [ ] Confirm `PRIZES_ENABLED=false` remains in all Vercel targets; no live prize credentials exist.
- [ ] Commit `package-lock.json`, add GitHub PR with screenshots, test results and dependency scan.
- [ ] Review Supabase elevated-function advisory before applying any database migrations.
- [ ] Require human review of PR and production promotion. No deployment is part of the archive/import process.

**Known blocker:** The GitHub integration available to ChatGPT is currently installed only for QaloriHQ, not the ByMarkAllan-owned repository. Vercel Git integration already sees the repository and a Vercel project exists. Codespace creation is a user-side action because the connected tools do not expose Codespaces creation.
