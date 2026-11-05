/**
 * Massive reference stock bars. This does not price FigSuite Yes/No outcomes.
 * Key and redistribution authorization are server-side only.
 */
export type Tier = 'realtime'|'delayed'|'eod';
export type Bar = { timestamp: string; open: number; high: number; low: number; close: number; volume: number };
export type StockSeries = {
  ticker: string; source: 'Massive'; tier: Tier;
  status: 'live'|'delayed'|'end_of_day'|'stale'|'market_closed';
  asOf: string; fetchedAt: string; bars: Bar[]; last: number;
  isTradeable: false; isForecastProbability: false;
};
const allowed = new Set(['AAPL','NVDA','SPY','QQQ','MSFT','AMZN','GOOGL','TSLA','META']);
export function validateTicker(input: string) {
  const t=(input||'').toUpperCase().trim();
  if(!allowed.has(t))throw new Error('TICKER_NOT_ALLOWED');
  return t;
}
export function configured() {
  return Boolean(process.env.MASSIVE_API_KEY && process.env.MASSIVE_REDISPLAY_APPROVED === 'true');
}
function tier(): Tier {
  const x=process.env.MASSIVE_STOCKS_TIER;
  return x==='realtime'||x==='delayed'||x==='eod'?x:'eod';
}
function isMarketSession(date: Date) {
  // Deliberately conservative: does not infer holidays or early closes.
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).formatToParts(date);
  const get=(t:string)=>parts.find(p=>p.type===t)?.value||'';
  const minutes=Number(get('hour'))*60+Number(get('minute'));
  return !['Sat','Sun'].includes(get('weekday')) && minutes>=570 && minutes<960;
}
export async function loadStockBars(input: string, timeframe: 'day'|'minute'='minute'):Promise<StockSeries> {
  const ticker=validateTicker(input);
  if(!configured())throw new Error('DATA_FEED_NOT_CONFIGURED_OR_LICENSED');
  const key=process.env.MASSIVE_API_KEY!;
  const now=new Date(), from=new Date(now.getTime()-(timeframe==='minute'?7:60)*86400000);
  const fmt=(d:Date)=>d.toISOString().slice(0,10);
  const uri=new URL('https://api.massive.com/v2/aggs/ticker/'+encodeURIComponent(ticker)+'/range/1/'+timeframe+'/'+fmt(from)+'/'+fmt(now));
  uri.searchParams.set('adjusted','true');
  uri.searchParams.set('sort','desc');
  uri.searchParams.set('limit',timeframe==='minute'?'120':'60');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  let response:Response;
  try{response=await fetch(uri,{headers:{Authorization:'Bearer '+key,Accept:'application/json'},signal:controller.signal,cache:'no-store'});}
  finally{clearTimeout(timeout);}
  if(response.status===401||response.status===403)throw new Error('DATA_FEED_NOT_ENTITLED');
  if(!response.ok)throw new Error('DATA_PROVIDER_UNAVAILABLE');
  const data:unknown=await response.json();
  if(!data||typeof data!=='object'||!('results' in data)||!Array.isArray(data.results))throw new Error('DATA_PROVIDER_RESPONSE_INVALID');
  const bars:Bar[]=data.results.filter((v:unknown): v is Record<string,number>=>Boolean(v)&&typeof v==='object'&&
      ['t','o','h','l','c','v'].every(x=>typeof (v as Record<string,unknown>)[x]==='number'))
    .map((v:Record<string,number>)=>({timestamp:new Date(v.t).toISOString(),open:v.o,high:v.h,low:v.l,close:v.c,volume:v.v}))
    .filter((v:Bar)=>Number.isFinite(v.close)&&v.close>0)
    .sort((a:Bar,b:Bar)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));
  if(!bars.length)throw new Error('NO_MARKET_DATA_AVAILABLE');
  const asOf=bars[bars.length-1].timestamp;
  const age=Date.now()-Date.parse(asOf);
  const accessTier=tier();
  const status:StockSeries['status']=timeframe==='day'||accessTier==='eod'?'end_of_day':
    !isMarketSession(now)?'market_closed':
    age>25*60000?'stale':accessTier==='delayed'?'delayed':
    age<=3*60000?'live':'stale';
  return {ticker,source:'Massive',tier:accessTier,status,asOf,fetchedAt:now.toISOString(),last:bars[bars.length-1].close,bars,isTradeable:false,isForecastProbability:false};
}
