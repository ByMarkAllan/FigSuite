import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFixedPrizeOrder,createTremendousClient,validateReleaseGrant,TremendousError} from '../src/tremendous-client.mjs';
const sample=()=>({awardId:'award_00000001',amountCents:5000,recipientName:'Test Recipient',
  recipientEmail:'test@example.org',campaignId:'campaign_abc123',fundingSourceId:'BALANCE'});
test('fixed award uses Tremendous idempotent external ID, integer cents and approved campaign',()=>{
  const order=buildFixedPrizeOrder(sample());
  assert.equal(order.external_id,'figsuite-prize:award_00000001');
  assert.equal(order.reward.value.denomination,50);
  assert.equal(order.reward.delivery.method,'EMAIL');
  assert.equal(order.payment.funding_source_id,'BALANCE');
});
test('invalid amount and email cannot reach payout adapter',()=>{
  assert.throws(()=>buildFixedPrizeOrder({...sample(),amountCents:-1}),/between/);
  assert.throws(()=>buildFixedPrizeOrder({...sample(),recipientEmail:'bad-email'}),/email/);
});
test('sandbox and production credentials cannot be mixed',()=>{
  assert.throws(()=>createTremendousClient({environment:'production',apiKey:'TEST_not_prod'}),/environment/);
  assert.throws(()=>createTremendousClient({environment:'sandbox',apiKey:'PROD_not_test'}),/environment/);
});
test('sandbox request targets sandbox only, never production host',async()=>{
  const urls=[];
  const client=createTremendousClient({environment:'sandbox',apiKey:'TEST_internal_fake',
    fetchImpl:async(url,opts)=>{urls.push(url);assert.match(opts.headers.Authorization,/^Bearer TEST_/);
      assert.equal(JSON.parse(opts.body).external_id,'figsuite-prize:award_00000001');
      return {ok:true,status:200,json:async()=>({order:{id:'test-order'}})};}});
  const response=await client.createFixedPrizeOrder(buildFixedPrizeOrder(sample()));
  assert.equal(response.order.id,'test-order');
  assert.deepEqual(urls,['https://testflight.tremendous.com/api/v2/orders']);
});
test('production send is disabled without trusted release worker',async()=>{
  let requests=0;
  const client=createTremendousClient({environment:'production',apiKey:'PROD_internal_fake',
    fetchImpl:async()=>{requests++;return {ok:true,status:200,json:async()=>({})};}});
  await assert.rejects(client.createFixedPrizeOrder(buildFixedPrizeOrder(sample())),e=>
    e instanceof TremendousError&&e.code==='PRODUCTION_DISABLED');
  assert.equal(requests,0);
});
test('production requires two distinct reviewers and legal/provider evidence',()=>{
  const release={kind:'PRODUCTION_AWARD_RELEASE',awardId:'award_00000001',
    eligibilityVerified:true,fundingReserved:true,taxAndIdentityVerified:true,
    providerApprovalRef:'provider-ref-1234',legalApprovalRef:'legal-ref-1234',
    reviewers:['reviewer_a','reviewer_a'],expiresAt:new Date(Date.now()+100000).toISOString()};
  assert.throws(()=>validateReleaseGrant(release,'award_00000001'),/incomplete/);
  release.reviewers=['reviewer_a','reviewer_b'];
  assert.equal(validateReleaseGrant(release,'award_00000001'),true);
  release.expiresAt=new Date(Date.now()-10000).toISOString();
  assert.throws(()=>validateReleaseGrant(release,'award_00000001'),/short-lived/);
});
test('unknown Tremendous transport outcome is never retried automatically',async()=>{
  const client=createTremendousClient({environment:'sandbox',apiKey:'TEST_internal_fake',
    fetchImpl:async()=>{throw Error('timeout');}});
  await assert.rejects(client.createFixedPrizeOrder(buildFixedPrizeOrder(sample())),e=>
    e.code==='PROVIDER_TRANSPORT_UNCERTAIN');
});
test('Tremendous 409 idempotency collision is blocked',async()=>{
  const client=createTremendousClient({environment:'sandbox',apiKey:'TEST_internal_fake',
    fetchImpl:async()=>({status:409,ok:false,json:async()=>({error:'duplicate'})})});
  await assert.rejects(client.createFixedPrizeOrder(buildFixedPrizeOrder(sample())),e=>
    e.code==='IDEMPOTENCY_CONFLICT');
});
