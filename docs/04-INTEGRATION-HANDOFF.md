# FigSuite v1.1 — Connected-resource handoff

**Verified:** November 4, 2026 (America/Chicago). This report is an account-state verification, not deployment or legal activation approval.

## Connected resources

| System | Resource | State | Next action |
| --- | --- | --- | --- |
| GitHub | `ByMarkAllan/FigSuite` / `main` | Repository accessible; README only; app branch-write requests return HTTP 403 | Install/authorize ChatGPT GitHub App under the **ByMarkAllan** owner account with FigSuite repository contents/PR/Issue access |
| Supabase | FigSuite Project (`ewopufapmqixlegkzgjb`) | `ACTIVE_HEALTHY`, PostgreSQL 17, us-west-2; no `public` tables or migration history | Review schema / RLS migrations first; security advisor finding below |
| Vercel | Team `fig-suite` / project `figsuite` (`prj_lfGDERq7AQoPsSlLMEd90z8gKv0R`) | **Created and linked** to `ByMarkAllan/FigSuite`, framework Next.js, root `apps/web`; no deployments | Publish/apply approved Next.js scaffold after GitHub write access and CI review; then validate preview |
| Vercel environment | `PRIZES_ENABLED` | `false` in development, preview and production | Retain hard-disabled module; an environment flag is never an activation authorization |

## Verification record

- Vercel `get_git_deployment_context`: `figsuite` linked to the intended GitHub repository, on the intended FigSuite team.
- Vercel `get_project`: `latestDeployment=null`, `live=false` as of verification. No public site or domain created.
- GitHub `create_branch`: HTTP 403 `Resource not accessible by integration`. GitHub App installations found only under QaloriHQ; `ByMarkAllan` owner installation not found.
- Supabase: no migrations or public application tables identified.
- Node.js unit tests for isolated `packages/prize-control`: **4 passed, 0 failed** (negative tests for payout/recipient enrollment/runtime flag/activation spoofing).
- GitHub importer: dry-run succeeded for all **60** distinct Issues; no Issues or labels were written.

## Supabase security review (no database change applied)

Security Advisor detected `public.rls_auto_enable()` callable by `anon` and `authenticated`. Read-only SQL inspection established it is a `SECURITY DEFINER` **event trigger function** enabling RLS after new `public` tables are created. Although runtime event-trigger execution differs from an ordinary RPC invocation, broad EXECUTE grants are unintended defense-in-depth exposure and should be removed under a reviewed, reproducible migration.

Suggested hardening SQL for review (NOT executed):

```sql
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
```

Before applying, verify owner/trigger dependencies, review impact, prepare a migration, and test that automatic RLS enforcement still functions on a scratch table in an isolated staging database. Re-run Supabase Security Advisor after execution. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable

## Next execution sequence

1. Owner authorizes the **ChatGPT GitHub App under ByMarkAllan**, scoped to `FigSuite` (not just the QaloriHQ installation).
2. Retry the planning branch; publish the full v1.1 documents, 60-issue CSV, architecture diagram and negative-tested disabled prize module in a **draft PR**.
3. Obtain founder review/approval for the proposed spec. Publish selected G0/G1 Issues, then organize them in a GitHub Project. Do not mark draft issues accepted automatically.
4. Open the Next.js foundation branch; add Supabase local/staging workflows and test-controlled migrations. Protect `main`, configure CI and preview deployments.
5. Make any site public or release monetization only after separate authorizations and required provider terms/reviews. Prize payout egress must not be present before the signed approval gate.

**No GitHub PR or Issues, Supabase migration, payment flow, payout-provider credentials or live deployment were created in this operation.**
