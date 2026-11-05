import { NextRequest, NextResponse } from 'next/server';
import {configured,loadStockBars,validateTicker} from '@/lib/market-data';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'public, s-maxage=45, stale-while-revalidate=30','X-Content-Type-Options':'nosniff'};
export async function GET(request:NextRequest){
  const ticker=request.nextUrl.searchParams.get('ticker')||'SPY';
  const timeframe=request.nextUrl.searchParams.get('timeframe')==='day'?'day':'minute';
  try{validateTicker(ticker);}catch{return NextResponse.json({error:'Ticker not supported'},{status:400});}
  if(!configured())return NextResponse.json({
    source:'Massive',status:'unavailable',reason:'MARKET_DATA_CONFIGURATION_OR_REDISPLAY_RIGHTS_REQUIRED',
    isForecastProbability:false,isTradeable:false
  },{status:503,headers:{'Cache-Control':'no-store'}});
  try{return NextResponse.json(await loadStockBars(ticker,timeframe),{headers});}
  catch(err){
    const reason=err instanceof Error?err.message:'DATA_PROVIDER_UNAVAILABLE';
    const known=['DATA_FEED_NOT_ENTITLED','NO_MARKET_DATA_AVAILABLE','DATA_FEED_NOT_CONFIGURED_OR_LICENSED'].includes(reason);
    return NextResponse.json({status:'unavailable',reason:known?reason:'DATA_PROVIDER_UNAVAILABLE',isTradeable:false,isForecastProbability:false},
      {status:reason==='NO_MARKET_DATA_AVAILABLE'?404:503,headers:{'Cache-Control':'no-store'}});
  }
}
