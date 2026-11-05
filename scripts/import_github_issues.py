#!/usr/bin/env python3
"""Dry-run-first FigSuite v1.1 Issue publisher.

Requires: GitHub CLI `gh`, logged in with access to the target repository.
Default: DRY RUN, does not write to GitHub. `--apply` creates labels/issues.
Only run --apply after explicit product-owner authorization.

Examples:
    python scripts/import_github_issues.py --repo ByMarkAllan/FigSuite --dry-run
    python scripts/import_github_issues.py --repo ByMarkAllan/FigSuite --gate G0 --apply
"""
import argparse
import csv
import json
import shutil
import subprocess
import sys
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parents[1] / 'github' / 'FigSuite-v1.1-Issue-Backlog.csv'
LABEL_COLORS = {
    'priority:p0': 'd73a4a',
    'priority:p1': 'fbca04',
    'priority:p2': 'cfd3d7',
    'prize-disabled': 'b60205',
    'compliance-gate': 'd93f0b',
    'implementation': '0e8a16',
}


def gh(*args, json_output=False):
    result = subprocess.run(['gh', *args], capture_output=True, text=True, check=False)
    if result.returncode:
        raise RuntimeError(f'GitHub command failed: {" ".join(args[:3])}\n{result.stderr.strip()}')
    return json.loads(result.stdout) if json_output else result.stdout.strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--repo', required=True, help='Existing owner/repository, e.g. ByMarkAllan/FigSuite')
    ap.add_argument('--gate', action='append', help='Only create selected gates; may repeat (G0..G6, GP)')
    ap.add_argument('--limit', type=int, default=0, help='Maximum rows in this run; 0=all')
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument('--apply', action='store_true', help='WRITE issues and any missing labels; authorization required')
    mode.add_argument('--dry-run', action='store_true', help='Preview only (default)')
    args = ap.parse_args()
    if '/' not in args.repo or args.repo.count('/') != 1:
        ap.error('--repo must be owner/name')
    with CSV_PATH.open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    if args.gate:
        rows = [r for r in rows if r['Gate'] in set(args.gate)]
    if args.limit > 0:
        rows = rows[:args.limit]
    print(f'Mode: {"APPLY (writes GitHub)" if args.apply else "DRY RUN (no writes)"}; repository={args.repo}; issues={len(rows)}')
    if not args.apply:
        for r in rows:
            print(f'  [{r["Gate"]}] {r["Title"]}  depends=[{r["Depends_On"]}]')
        print('\nNo repository, issue, Project item, milestone, or label was changed.')
        return 0
    if shutil.which('gh') is None:
        print('GitHub CLI `gh` not found. Install or use a GitHub Codespace.', file=sys.stderr)
        return 2
    gh('auth', 'status')
    gh('repo', 'view', args.repo, '--json', 'name')
    current = gh('issue', 'list', '-R', args.repo, '--state', 'all', '--limit', '1000', '--json', 'title', json_output=True)
    titles = {i['title'] for i in current}
    existing_labels = {x['name'] for x in gh('label', 'list', '-R', args.repo, '--limit', '1000', '--json', 'name', json_output=True)}
    needed = {l for r in rows for l in r['Labels'].split(',') if l}
    for label in sorted(needed - existing_labels):
        color = LABEL_COLORS.get(label, '1d76db')
        gh('label', 'create', label, '-R', args.repo, '--color', color, '--description', 'FigSuite v1.1 issue classification')
        print(f'Created missing label: {label}')
    count = 0
    for r in rows:
        if r['Title'] in titles:
            print(f'SKIP existing: {r["Title"]}')
            continue
        command = ['issue', 'create', '-R', args.repo, '--title', r['Title'], '--body', r['Body']]
        for label in r['Labels'].split(','):
            if label:
                command += ['--label', label]
        url = gh(*command)
        print(f'CREATED {r["Issue_ID"]}: {url}')
        count += 1
    print(f'Created {count}; already existed {len(rows)-count}. Milestones, Project fields and dependencies require separate mapping.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
