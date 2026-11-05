import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrizeDraft,previewFixedAwards,recordReviewAttestation,isPrizeExecutionAllowed,executePrizeDistribution } from '../src/workflow.mjs';
const valid=()=>({title:'Quarterly forecasting contest',totalPoolCents:100000,awardsCents:[50000,30000,20000],
  closingAt:'2027-01-10T20:00:00.000Z',freeEntryParity:true,purchaseRequired:false,
  sponsorFundingReference:'SPONSOR-FUNDING-PENDING-123',policyVersion:'rules-v1',
  permittedJurisdictions:['TX','AR']});
test('rejects purchase-required contest and missing free entry parity',()=>{
 assert.throws(()=>createPrizeDraft({...valid(),purchaseRequired:true}),/Free entries/);
 assert.throws(()=>createPrizeDraft({...valid(),freeEntryParity:false}),/Free entries/);
});
test('fixed awards cannot exceed the disclosed pool',()=>{
 assert.throws(()=>createPrizeDraft({...valid(),awardsCents:[70000,70000]}),/exceed fixed pool/);
});
test('award preview cannot create a payout or duplicate winner',()=>{
 const draft=createPrizeDraft(valid());
 assert.equal(draft.payoutEnabled,false);
 assert.throws(()=>previewFixedAwards(draft,['entry_aaaaaaaa','entry_aaaaaaaa']),/distinct/);
 const preview=previewFixedAwards(draft,['entry_aaaaaaaa','entry_bbbbbbbb']);
 assert.equal(preview.transferable,false);
 assert.equal(preview.providerRequests,0);
 assert.equal(preview.draftAwards[0].amountCents,50000);
});
test('review documents never activate real-money payments',async()=>{
 const draft=createPrizeDraft(valid());
 const record=recordReviewAttestation(draft,{scope:'legal',reviewer:'reviewer-1',evidence:'LEGAL-MEMO-01234'});
 assert.equal(record.activationGranted,false);
 assert.equal(isPrizeExecutionAllowed({...draft,legalApproved:true,providerApproved:true}),false);
 await assert.rejects(executePrizeDistribution({draft,records:[record]}),/Prize execution remains disabled/);
});