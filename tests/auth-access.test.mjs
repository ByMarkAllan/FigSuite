import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = file => readFileSync(file, 'utf8');
const page = read('apps/web/app/page.tsx');
const terminal = read('apps/web/components/terminal.tsx');
const account = read('apps/web/app/account/page.tsx');
const profileSql = read('supabase/migrations/20261105182500_auth_profiles.sql');

test('root remains browsable without a session', () => {
  assert.match(page, /<Terminal authenticated=\{authenticated\}/);
  assert.doesNotMatch(page, /if\s*\(!authenticated\b[^;]*redirect\(/);
  assert.match(page, /getClaims\(\)/);
});

test('mutating demo actions reverify identity before changing state', () => {
  for (const action of ['toggleSaved', 'recordForecast', 'applyAllocation']) {
    assert.match(terminal, new RegExp('async function ' + action + '\\([^)]*\\)\\s*\\{[\\s\\S]{0,90}await requireActionSession\\(\\)'));
  }
  assert.match(terminal, /if \(!authenticated\).*setAuthGateOpen\(true\)/);
  assert.match(terminal, /createClient\(\)\.auth\.getUser\(\)/);
  assert.match(terminal, /href="\/login\?next=%2F"/);
});

test('account is protected by server identity and profile RLS', () => {
  assert.match(account, /auth\.getUser\(\)/);
  assert.match(account, /if\(error\|\|!user\)redirect\(/);
  assert.match(profileSql, /alter table public\.profiles enable row level security/i);
  assert.match(profileSql, /revoke all on public\.profiles from anon/i);
  for (const action of ['select', 'insert', 'update']) assert.match(profileSql, new RegExp('for ' + action + ' to authenticated'));
  assert.match(profileSql, /with check \(\(select auth\.uid\(\)\) = id\)/);
});

test('both release gates are structurally valid and blocked until signed evidence exists', () => {
  const valid = spawnSync(process.execPath, ['scripts/check-release-gates.mjs','--schema'], {encoding:'utf8'});
  assert.equal(valid.status,0,valid.stderr);
  for (const gate of ['finance_mvp','cash_prizes']) {
    const review = spawnSync(process.execPath,['scripts/check-release-gates.mjs','--gate='+gate],{encoding:'utf8'});
    assert.equal(review.status,1,'An unapproved gate must not pass');
    assert.match(review.stderr,/BLOCKED/);
  }
});
