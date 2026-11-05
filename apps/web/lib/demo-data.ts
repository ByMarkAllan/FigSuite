export type Scenario = {
  id: string;
  symbol: string;
  short: string;
  category: 'Equities' | 'Macro' | 'Commodities';
  name: string;
  description: string;
  reference: string;
  openUntil: string;
  q: [number, number];
  liquidity: number;
  change: number;
  volume: string;
  participants: string;
  chartSeed: number;
  gradient: 'blue' | 'green' | 'violet';
};
export const scenarios: Scenario[] = [
  {id:'spx-direction',symbol:'SPX / SESSION', short:'S&P 500 direction',category:'Equities',name:'Will the S&P 500 close above its session opening level?', description:'Compare the index closing reference against the exchange opening reference for the same illustrative trading session.', reference:'Illustrative session close · US equities', openUntil:'Locks at 10:00 ET', q:[60,0],liquidity:80,change:3.4,volume:'14.8k',participants:'1,204',chartSeed:4,gradient:'blue'},
  {id:'nvda-relative',symbol:'NVDA / SESSION', short:'NVIDIA momentum',category:'Equities',name:'Will NVIDIA outperform the NASDAQ-100 in this session?',description:'Compare percent changes from official open to official close across both references.',reference:'Illustrative session close · US equities',openUntil:'Locks at 10:00 ET',q:[20,0],liquidity:80,change:1.8,volume:'9.2k',participants:'803',chartSeed:2,gradient:'green'},
  {id:'fed-stability',symbol:'FED / MEETING',short:'Fed policy outlook',category:'Macro',name:'Will the next policy decision leave the target range unchanged?',description:'Resolve using the central bank decision announcement according to predefined rules.',reference:'Illustrative macro scenario · No actual meeting scheduled',openUntil:'Sample preview only',q:[98,0],liquidity:80,change:-0.8,volume:'11.3k',participants:'962',chartSeed:7,gradient:'violet'},
  {id:'gold-direction',symbol:'GOLD / SESSION',short:'Gold price direction',category:'Commodities',name:'Will gold finish the illustrated session above its open?',description:'Compare indicative reference close with reference open in a sample market.',reference:'Illustrative commodity price scenario',openUntil:'Sample preview only',q:[35,0],liquidity:80,change:2.1,volume:'6.7k',participants:'537',chartSeed:11,gradient:'blue'},
  {id:'aapl-momentum',symbol:'AAPL / SESSION',short:'Apple momentum',category:'Equities',name:'Will Apple finish higher than its session opening level?',description:'Resolve a one-day directional forecast using an independently published open and close.',reference:'Illustrative session close · US equities',openUntil:'Sample preview only',q:[-18,0],liquidity:80,change:-1.4,volume:'4.6k',participants:'412',chartSeed:6,gradient:'green'},
  {id:'yield-outlook',symbol:'UST10 / WEEK',short:'Treasury yield outlook',category:'Macro',name:'Will the US 10-year yield finish the illustrated week higher?',description:'Compare indicative weekly closing and opening reference yields.',reference:'Illustrative weekly epoch · Macro',openUntil:'Sample preview only',q:[-38,0],liquidity:80,change:0.6,volume:'3.8k',participants:'289',chartSeed:8,gradient:'violet'}
];
export const watchlist = [
  {ticker:'SPX',name:'S&P 500',value:'6,182.40',delta:'+0.82%',up:true},
  {ticker:'NDX',name:'Nasdaq 100',value:'22,905.18',delta:'+1.26%',up:true},
  {ticker:'VIX',name:'Volatility',value:'17.42',delta:'−0.61%',up:false},
  {ticker:'GC1!',name:'Gold Futures',value:'3,992.70',delta:'+0.34%',up:true},
  {ticker:'US10Y',name:'10Y Yield',value:'4.08%',delta:'−0.04%',up:false},
];
export const leaderboard = [
 {rank:1,handle:'quantatlas',initials:'QA',score:88.6,change:'+2.8'},
 {rank:2,handle:'signal.arch',initials:'SA',score:86.4,change:'+1.2'},
 {rank:3,handle:'macro_owl',initials:'MO',score:84.9,change:'+0.9'},
 {rank:4,handle:'deltaframe',initials:'DF',score:82.1,change:'+1.5'},
];
export function makeSeries(seed:number,length=60): number[] {
  return Array.from({length},(_,i)=>{
    const trend= i*0.29;
    const wave= Math.sin((i+seed)*0.48)*7 + Math.sin((i+seed)*0.18)*11 + Math.cos((i+seed)*1.13)*2.5;
    return 42+trend+wave+(seed%3)*2;
  });
}
