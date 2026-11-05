/**
 * Tremendous API v2, internal disbursement adapter.
 *
 * There is deliberately NO public order route. Caller must own a persistent
 * contest ledger, have checked official eligibility, identity, funding,
 * sanctions/tax requirements and enforce dual independent release approval.
 *
 * This module is not imported by the simulation engine.
 */
export class TremendousError extends Error {
  constructor(code, message){super(message);this.name='TremendousError';this.code=code;}
}
const fail=(code,message)=>{throw new TremendousError(code,message);};
const safeRef=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{7,99}$/.test(x);
const safeEmail=x=>typeof x==='string'&&x.length<255&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
export const endpoints=Object.freeze({
  sandbox:'https://testflight.tremendous.com',
  production:'https://api.tremendous.com'
});
/**
 * Internal order builder. No simulated contract/credit balance can be passed
 * as payout value; a legally authorized, fixed-prize ledger amount is required.
 */
export function buildFixedPrizeOrder({awardId,amountCents,recipientName,recipientEmail,campaignId,fundingSourceId='BALANCE'}){
  if(!safeRef(awardId))fail('INVALID_AWARD_ID','Persistent unique award ID required.');
  if(!Number.isSafeInteger(amountCents)||amountCents<100||amountCents>1000000)
    fail('INVALID_PRIZE','Prize must be between $1 and $10,000 in whole cents.');
  if(typeof recipientName!=='string'||recipientName.trim().length<2||recipientName.length>120)
    fail('INVALID_RECIPIENT','Verified recipient name required.');
  if(!safeEmail(recipientEmail))fail('INVALID_EMAIL','Verified recipient email required.');
  if(typeof campaignId!=='string'||!safeRef(campaignId))fail('CAMPAIGN_REQUIRED','Approved Tremendous campaign ID required.');
  if(typeof fundingSourceId!=='string'||(!safeRef(fundingSourceId)&&fundingSourceId!=='BALANCE'))
    fail('FUNDING_SOURCE_REQUIRED','Approved funding source required.');
  return Object.freeze({
    external_id:'figsuite-prize:'+awardId,
    payment:{funding_source_id:fundingSourceId},
    reward:{
      campaign_id:campaignId,
      value:{denomination:amountCents/100,currency_code:'USD'},
      recipient:{name:recipientName.trim(),email:recipientEmail},
      delivery:{method:'EMAIL'}
    }
  });
}
/**
 * Production checks are independent of user-controlled flags or API request
 * payload. A trusted internal release worker must provide a DB-verified,
 * short-lived release grant for a specific award and approved provider case.
 */
export function validateReleaseGrant(grant,awardId){
  if(!grant||grant.awardId!==awardId||grant.kind!=='PRODUCTION_AWARD_RELEASE'||
      grant.eligibilityVerified!==true||grant.fundingReserved!==true||
      grant.taxAndIdentityVerified!==true||!safeRef(grant.providerApprovalRef)||
      !safeRef(grant.legalApprovalRef)||!Array.isArray(grant.reviewers)||
      new Set(grant.reviewers).size<2||grant.reviewers.some(x=>!safeRef(x)))
    fail('RELEASE_GATE_UNSATISFIED','Independent payout release checks incomplete.');
  if(!Number.isFinite(Date.parse(grant.expiresAt))||Date.parse(grant.expiresAt)<=Date.now()||
      Date.parse(grant.expiresAt)>Date.now()+5*60*1000)
    fail('RELEASE_GRANT_EXPIRED','Release authorization must be short-lived.');
  return true;
}
export function createTremendousClient({environment='sandbox',apiKey,fetchImpl=fetch,productionExecutorEnabled=false}={}){
  if(!Object.hasOwn(endpoints,environment))fail('INVALID_ENV','Unrecognized Tremendous environment.');
  const expectedPrefix=environment==='sandbox'?'TEST_':'PROD_';
  if(typeof apiKey!=='string'||!apiKey.startsWith(expectedPrefix))
    fail('API_KEY_ENV_MISMATCH','API credential does not match Tremendous environment.');
  if(typeof fetchImpl!=='function')fail('INVALID_FETCH','HTTP adapter required.');
  const base=endpoints[environment];
  async function request(path,method='GET',body){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    let response;
    try{
      response=await fetchImpl(base+path,{
        method,headers:{Authorization:'Bearer '+apiKey,Accept:'application/json','Content-Type':'application/json'},
        ...(body?{body:JSON.stringify(body)}:{}),
        signal:controller.signal,redirect:'error'
      });
    }catch{
      fail('PROVIDER_TRANSPORT_UNCERTAIN','Provider response unknown. Reconcile by external_id before any retry.');
    }finally{clearTimeout(timeout);}
    let payload;
    try{payload=await response.json();}catch{payload={};}
    if(response.status===409)fail('IDEMPOTENCY_CONFLICT','External award ID already used with different order details.');
    if(response.status===401||response.status===403)fail('PROVIDER_ACCESS_DENIED','Tremendous credentials or provider approval invalid.');
    if(response.status===402)fail('PROVIDER_INSUFFICIENT_FUNDS','Provider funding balance insufficient.');
    if(response.status===429)fail('PROVIDER_RATE_LIMIT','Provider rate limit reached.');
    if(!response.ok)fail('PROVIDER_ERROR','Tremendous request failed. Reconcile before retry.');
    return payload;
  }
  return Object.freeze({
    environment,
    async ping(){return request('/api/v2/ping');},
    async createFixedPrizeOrder(order,{releaseGrant}={}){
      const awardId=typeof order?.external_id==='string'&&order.external_id.startsWith('figsuite-prize:')
        ?order.external_id.slice('figsuite-prize:'.length):'';
      if(!safeRef(awardId)||!order?.reward||order.reward.delivery?.method!=='EMAIL')
        fail('INVALID_ORDER','Only fixed award orders built by this module are supported.');
      // Always reconstruct from trusted fields, never accept a raw API payload.
      const exact=buildFixedPrizeOrder({
        awardId,amountCents:Math.round(order.reward.value.denomination*100),
        recipientName:order.reward.recipient.name,recipientEmail:order.reward.recipient.email,
        campaignId:order.reward.campaign_id,fundingSourceId:order.payment.funding_source_id
      });
      if(JSON.stringify(order)!==JSON.stringify(exact))
        fail('ORDER_TAMPERED','Order fields do not match the approved fixed-prize schema.');
      if(environment==='production'){
        if(!productionExecutorEnabled)fail('PRODUCTION_DISABLED','Production transfers are not enabled.');
        validateReleaseGrant(releaseGrant,awardId);
      }
      return request('/api/v2/orders','POST',exact);
    }
  });
}
