'use client';
import {useEffect,useState} from 'react';
type Bar={timestamp:string;close:number;open:number;high:number;low:number;volume:number};
type Snapshot={ticker:string;status:'live'|'delayed'|'end_of_day'|'market_closed'|'stale';source:string;asOf:string;last:number;bars:Bar[];tier:string};
const tickers=['SPY','QQQ','NVDA','AAPL'];
const formatUSD=(n:number)=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
export function MarketDataPanel(){
  const [ticker,setTicker]=useState('SPY');
  const [timeframe,setTimeframe]=useState<'minute'|'day'>('minute');
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [reason,setReason]=useState('Checking');
  useEffect(()=>{
    let active=true;
    async function refresh(){
      try{
        const response=await fetch('/api/market-data/stocks?ticker='+ticker+'&timeframe='+timeframe,{cache:'no-store'});
        const data=await response.json();
        if(!active)return;
        if(!response.ok){setSnapshot(null);setReason(data.reason||'Data temporarily unavailable');}
        else{setSnapshot(data);setReason('');}
      }catch{if(active){setSnapshot(null);setReason('Data temporarily unavailable');}}
    }
    void refresh();
    const timer=setInterval(()=>{void refresh();},60000);
    return ()=>{active=false;clearInterval(timer);};
  },[ticker,timeframe]);
  const values=snapshot?.bars.map(x=>x.close)||[];
  const min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):0;
  const width=680,height=122;
  const points=values.map((v,i)=>{
    const x=values.length===1?width/2:i*width/(values.length-1);
    const y=(1-(v-min)/(max-min||1))*height;
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  return <section style={{background:'#0d1524',border:'1px solid #283650',borderRadius:13,padding:20,marginBottom:20}}>
    <div style={{display:'flex',gap:16,justifyContent:'space-between',flexWrap:'wrap',alignItems:'center'}}>
      <div>
        <span style={{fontSize:11,letterSpacing:'.12em',color:'#9caeca'}}>EXCHANGE REFERENCE PRICES · MASSIVE</span>
        <h2 style={{fontSize:20,margin:'6px 0'}}>Stock market data</h2>
        <div style={{fontSize:12,color:'#8ca0ba'}}>Separate from simulated FigSuite probabilities and cash-prize outcomes.</div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <select aria-label="Reference ticker" value={ticker} onChange={e=>setTicker(e.target.value)}
          style={{background:'#17243a',color:'#e4edff',border:'1px solid #354461',padding:8,borderRadius:6}}>
          {tickers.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Market data interval" value={timeframe} onChange={e=>setTimeframe(e.target.value as 'minute'|'day')}
          style={{background:'#17243a',color:'#e4edff',border:'1px solid #354461',padding:8,borderRadius:6}}>
          <option value="minute">1-minute bars</option>
          <option value="day">Daily bars</option>
        </select>
      </div>
    </div>
    {snapshot?<div style={{marginTop:18}}>
      <div style={{display:'flex',gap:16,alignItems:'baseline',flexWrap:'wrap'}}>
        <b style={{fontSize:28}}>{formatUSD(snapshot.last)}</b>
        <span style={{fontSize:12,color:snapshot.status==='live'?'#34d1aa':'#e6c38a'}}>
          {snapshot.status==='live'?'● REAL-TIME':snapshot.status.replaceAll('_',' ').toUpperCase()}
        </span>
        <span style={{color:'#92a6c3',fontSize:11}}>
          As of {new Date(snapshot.asOf).toLocaleString('en-US',{timeZone:'America/New_York'})} ET
        </span>
      </div>
      <svg role="img" aria-label={ticker+' market price history'} viewBox={'0 0 '+width+' '+height} preserveAspectRatio="none"
        style={{width:'100%',height:130,marginTop:14}}>
        <g stroke="#223148" strokeWidth=".5">
          {[0,1,2,3].map(i=><line key={i} x1="0" x2={width} y1={i*height/3} y2={i*height/3}/>)}
        </g>
        <polyline points={points} stroke="#31d5aa" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      </svg>
      <div style={{fontSize:11,color:'#95a8c2'}}>
        Source: Massive · Access tier: {snapshot.tier} · Refresh interval: 60 seconds. Licensing and exchange hours apply.
      </div>
    </div>:<div style={{background:'#151e2d',borderRadius:8,padding:17,marginTop:15,color:'#adbed1',fontSize:13}}>
      Market feed unavailable ({reason}). Scenario prices elsewhere remain illustrative; no fallback values are labeled live.
    </div>}
  </section>;
}
