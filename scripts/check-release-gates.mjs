import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPrizeControlStatus } from '../packages/prize-control/src/index.mjs';

const parse = file => JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8'));
const policy = parse('config/release-gates.json');
const evidence = parse('config/release-evidence.json');

function assertSchema() {
  if (policy.schemaVersion !== 1 || evidence.schemaVersion !== 1) throw Error('Unknown release gate schema version');
  if (!policy.gates?.finance_mvp || !policy.gates?.cash_prizes) throw Error('Both release gates are required');
  const ids = new Set();
  for (const [name, gate] of Object.entries(policy.gates)) {
    if (!Array.isArray(gate.checks) || gate.checks.length < 10) throw Error(name + ': missing required checks');
    if (!Array.isArray(gate.requiredApprovals) || gate.requiredApprovals.length < 2) throw Error(name + ': missing reviewers');
    if (!evidence.gates?.[name]?.checks || !evidence.gates?.[name]?.approvals) throw Error(name + ': missing evidence block');
    for (const check of gate.checks) {
      if (!/^(FIN|CASH)-\d{2}$/.test(check.id) || !check.title || !check.owner || ids.has(check.id)) throw Error('Invalid or duplicate check ID');
      ids.add(check.id);
      if (!(check.id in evidence.gates[name].checks)) throw Error(name + ': no evidence slot for ' + check.id);
    }
    for (const role of gate.requiredApprovals) {
      if (!(role in evidence.gates[name].approvals)) throw Error(name + ': missing reviewer role: ' + role);
    }
  }
  if (!policy.gates.cash_prizes.mustBeBefore.includes('finance_mvp')) throw Error('Prize gate must depend on Finance MVP gate');
  if (getPrizeControlStatus().enabled !== false) throw Error('Hard-disabled prize subsystem contract changed');
}

const nonblank = value => typeof value === 'string' && value.trim().length > 0;
const url = value => nonblank(value) && /^https:\/\/[^/]+\//i.test(value);
const timestamp = value => nonblank(value) && !Number.isNaN(Date.parse(value));

function evaluate(name, visited = new Set()) {
  if (visited.has(name)) throw Error('Circular release gate dependency: ' + name);
  const gate = policy.gates[name];
  if (!gate) throw Error('Unknown gate: ' + name);
  const next = new Set([...visited, name]);
  const gateEvidence = evidence.gates[name];
  const blockers = [];
  for (const predecessor of gate.mustBeBefore || []) {
    const prior = evaluate(predecessor, next);
    if (prior.blockers.length) blockers.push('prerequisite:' + predecessor);
  }
  for (const check of gate.checks) {
    const item = gateEvidence.checks[check.id];
    if (!item || item.verified !== true || !url(item.evidenceUrl) || !nonblank(item.verifiedBy) || !timestamp(item.verifiedAt))
      blockers.push('evidence:' + check.id);
  }
  const reviewers = [];
  for (const role of gate.requiredApprovals) {
    const approval = gateEvidence.approvals[role];
    if (!approval || approval.approved !== true || !nonblank(approval.actor) || !url(approval.evidenceUrl) || !timestamp(approval.approvedAt))
      blockers.push('approval:' + role);
    else reviewers.push(approval.actor.toLowerCase().trim());
  }
  if (new Set(reviewers).size !== reviewers.length) blockers.push('reviewers:must-be-independent');
  return { name, blockers };
}

try {
  assertSchema();
  const arg = process.argv.find(x => x.startsWith('--gate='));
  if (process.argv.includes('--schema')) {
    console.log('Release gate schemas and default-off prize contract validated.');
  } else if (arg) {
    const name = arg.slice('--gate='.length);
    const result = evaluate(name);
    if (result.blockers.length) {
      console.error(name + ' BLOCKED (' + result.blockers.length + ' outstanding): ' + result.blockers.join(', '));
      process.exitCode = 1;
    } else console.log(name + ' EVIDENCE VERIFIED. Human release and environment controls remain separate.');
  } else if (process.argv.includes('--report')) {
    for (const name of Object.keys(policy.gates)) {
      const result = evaluate(name);
      console.log(name + ': ' + (result.blockers.length ? 'BLOCKED' : 'EVIDENCE VERIFIED') + ', ' + result.blockers.length + ' outstanding');
    }
  } else {
    console.error('Usage: node scripts/check-release-gates.mjs --schema | --report | --gate=finance_mvp | --gate=cash_prizes');
    process.exitCode = 2;
  }
} catch (error) {
  console.error('Release gate validation failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
