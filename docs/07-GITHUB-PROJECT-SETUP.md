# FigSuite™ — GitHub Project board setup

The **36 roadmap Issues are already published**, FGS-001 through FGS-036, under [ByMarkAllan/FigSuite](https://github.com/ByMarkAllan/FigSuite/issues). Creating a GitHub Project v2 board uses a different permission system from repository Issues.

## One-time activation

1. In **ByMarkAllan/FigSuite → Settings → Secrets and variables → Actions**, add a secret named **PROJECTS_TOKEN** issued for the **ByMarkAllan** account with the GitHub Projects permission (project scope for GitHub CLI, plus repository access).
2. After merging the reviewed feature branch to main, run **Actions → Configure FigSuite MVP Project v2 → Run workflow**, entering SETUP.
3. The workflow reuses the 36 Issues by roadmap ID, creates/reuses **FigSuite — MVP Build**, links the repository, creates Phase/Priority/Workflow/Size fields, and attempts the initial views.

The workflow **never prints the token** and is manual only. It requires confirmation and works on a reviewed branch. No payout or production activity is triggered.

**Suggested views:** MVP Board, Roadmap, Current Sprint, Verification Queue, Blocked & Risks.

If Projects scope is unavailable or Project administration is restricted, create an empty user-owned Project in the GitHub UI and rerun the workflow; it will reuse the matching title.

Publishing an Issue or moving it to Done does not authorize production release or cash-prize activation.
