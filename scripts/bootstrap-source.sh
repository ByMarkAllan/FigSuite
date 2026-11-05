#!/usr/bin/env bash
# Bootstrap the source archive already committed in the FigSuite repository.
# Runs only in a reviewed feature branch. No migrations, provider keys or cash payouts.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f FigSuite-UI-Starter.zip ] || { echo "Missing FigSuite-UI-Starter.zip" >&2; exit 1; }
if unzip -Z1 FigSuite-UI-Starter.zip | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
  echo "Unsafe archive paths detected" >&2
  exit 1
fi
unzip -o FigSuite-UI-Starter.zip >/dev/null
for p in package.json apps/web/package.json packages/simulation/src/index.mjs packages/prize-control/src/index.mjs backlog/figsuite-mvp-issues.csv; do
  [ -f "$p" ] || { echo "Missing expected source: $p" >&2; exit 1; }
done
[ -f apps/marketing/public/index.html ] || { echo "Missing marketing site" >&2; exit 1; }
[ -f packages/prize-control/src/workflow.mjs ] || { echo "Missing prize preview boundary" >&2; exit 1; }
printf 'Source extraction complete. The ZIP remains as an archive; no payout or database action was run.\n'
