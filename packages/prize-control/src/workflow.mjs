/**
 * FigSuite v1.1 prize planning domain.
 *
 * This is a review-only model. It deliberately DOES NOT expose a real payout
 * adapter, payment provider client, activation flag or money-transfer API.
 * All real-money operations must stay outside the simulation service and
 * require fresh approval before a future, separately reviewed integration.
 */
import { randomUUID } from 'node:crypto';
export const PRIZE_MODE = 'PREVIEW_ONLY_DISABLED';
export class PrizeConfigurationError extends Error {
  constructor(code, message) { super(message); this.name='PrizeConfigurationError'; this.code=code; }
}
function assert(condition,code,message){if(!condition)throw new PrizeConfigurationError(code,message);}
function positiveCents(x){return Number.isSafeInteger(x) && x>0;}
function distinct(xs){return new Set(xs).size === xs.length;}
function immutable(x){return Object.freeze(x);}

/** Inputs: integer cents only, with strict free-entry parity; no paid allocations. */
export function createPrizeDraft(input) {
  assert(input && typeof input==='object','INVALID_REQUEST','Draft requires an object.');
  const {title, currency='USD', totalPoolCents, awardsCents, closingAt,
    freeEntryParity, purchaseRequired=false, sponsorFundingReference, policyVersion,
    permittedJurisdictions=[]} = input;
  assert(typeof title==='string' && title.trim().length>=8,'INVALID_TITLE','Contest title required.');
  assert(currency==='USD','CURRENCY_UNSUPPORTED','Only USD planning previews supported.');
  assert(positiveCents(totalPoolCents),'INVALID_POOL','Pool must be a positive integer in cents.');
  assert(Array.isArray(awardsCents) && awardsCents.length>0 && awardsCents.every(positiveCents),'INVALID_AWARDS','Fixed positive integer-cent awards required.');
  assert(awardsCents.reduce((a,b)=>a+b,0)<=totalPoolCents,'AWARD_POOL_EXCEEDED','Fixed awards exceed fixed pool.');
  assert(freeEntryParity === true && purchaseRequired === false,'PURCHASE_ADVANTAGE_FORBIDDEN','Free entries must have fully equivalent eligibility and winning odds.');
  assert(typeof sponsorFundingReference==='string'&&sponsorFundingReference.trim().length>=8,'FUNDING_EVIDENCE_REQUIRED','A sponsor-funded pool reference is required for planning.');
  assert(typeof policyVersion==='string'&&policyVersion.length>=3,'POLICY_UNSPECIFIED','Written contest policy version required.');
  assert(Array.isArray(permittedJurisdictions)&&permittedJurisdictions.length>0&&permittedJurisdictions.every(x=>typeof x==='string' && /^[A-Z]{2}$/.test(x)),'JURISDICTIONS_UNREVIEWED','Reviewed state codes required.');
  assert(typeof closingAt==='string'&&Number.isFinite(Date.parse(closingAt)),'INVALID_CLOSE','UTC close time required.');
  return immutable({
    id: randomUUID(), title:title.trim(),currency,totalPoolCents,awardsCents:immutable([...awardsCents]),
    closingAt, freeEntryParity:true,purchaseRequired:false,
    sponsorFundingReference:sponsorFundingReference.trim(),policyVersion,
    permittedJurisdictions:immutable([...new Set(permittedJurisdictions)]),
    state:'DRAFT_REVIEW_ONLY', payoutEnabled:false, providerEgressEnabled:false,
    fundingConfirmed:false, legalApproved:false,providerApproved:false,
    createdAt:new Date().toISOString()
  });
}
/** Draft audit attestations do not grant executable privilege. */
export function recordReviewAttestation(draft, input) {
  assert(draft?.state==='DRAFT_REVIEW_ONLY','INVALID_DRAFT','Draft required.');
  const reviewer=input?.reviewer, scope=input?.scope, evidence=input?.evidence;
  assert(typeof reviewer==='string'&&reviewer.length>1,'REVIEWER_REQUIRED','Reviewer required.');
  assert(['legal','payments','payouts','finance','security','executive'].includes(scope),'INVALID_SCOPE','Review scope invalid.');
  assert(typeof evidence==='string'&&evidence.length>=8,'EVIDENCE_REQUIRED','Evidence URI or reference required.');
  return immutable({contestId:draft.id,scope,reviewer,evidence,recordedAt:new Date().toISOString(),effect:'DOCUMENTATION_ONLY',activationGranted:false});
}
/** Generates an isolated draft award preview from approved *fixed* slots. */
export function previewFixedAwards(draft, winningEntryIds) {
  assert(draft?.state==='DRAFT_REVIEW_ONLY'&&draft.payoutEnabled===false,'NOT_REVIEW_DRAFT','Only preview-only drafts can be inspected.');
  assert(Array.isArray(winningEntryIds) && distinct(winningEntryIds),'DUPLICATE_WINNERS','Winner IDs must be distinct.');
  assert(winningEntryIds.length<=draft.awardsCents.length,'AWARDS_EXCEEDED','Too many slots for fixed awards.');
  assert(winningEntryIds.every(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(id)),'INVALID_ENTRY_ID','Opaque validated entry IDs required.');
  return immutable({
    contestId:draft.id,mode:PRIZE_MODE,currency:draft.currency,
    draftAwards:immutable(winningEntryIds.map((entryId,i)=>immutable({entryId,amountCents:draft.awardsCents[i],status:'PREVIEW_NOT_PAYABLE'}))),
    providerRequests:0,transferable:false,fiatClaimCreated:false
  });
}
export function isPrizeExecutionAllowed(_context={}) { return false; }
export async function executePrizeDistribution(_anyInput) {
  throw new PrizeConfigurationError('PRIZES_DISABLED','Prize execution remains disabled pending separate legal, provider and production approvals.');
}