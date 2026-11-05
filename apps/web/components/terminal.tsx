'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, Bookmark,
  CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3,
  Command, Compass, Eye, Filter, Flame, Globe2, Info, Layers3, LineChart,
  LockKeyhole, Menu, MessageCircle, MoreHorizontal, PanelLeftClose, Plus,
  Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Target, TrendingUp,
  Trophy, Users, Wallet, X, Zap,
} from 'lucide-react';
import { lmsrPrices, quoteAllocation } from '@figsuite/simulation';
import { FigMark } from '@/lib/icons';
import { leaderboard, makeSeries, scenarios, watchlist, type Scenario } from '@/lib/demo-data';

type ForecastReceipt = { eventId: string; side: number; probability: number; timestamp: string };
type AllocationReceipt = { eventId: string; side: number; units: number; cost: number };
type View = 'Overview' | 'Explore markets' | 'My forecasts' | 'Watchlist' | 'Daily Combine' | 'Weekly Epoch' | 'Leaderboards' | 'Guilds';
type Category = 'All markets' | Scenario['category'];
const nav = [
  {label:'WORKSPACE',items:[{title:'Overview',icon:Compass},{title:'Explore markets',icon:Layers3},{title:'My forecasts',icon:Target},{title:'Watchlist',icon:Bookmark}]},
  {label:'COMPETE',items:[{title:'Daily Combine',icon:Zap},{title:'Weekly Epoch',icon:CalendarClock},{title:'Leaderboards',icon:Trophy},{title:'Guilds',icon:Users}]},
] as const;
const categories: Category[] = ['All markets','Equities','Macro','Commodities'];
const intervals = ['1H','1D','1W','1M','ALL'] as const;
const money = (n: number) => n.toFixed(2);
function pct(n:number) { return `${Math.round(n*100)}%`; }
function classNames(...parts: Array<string|false|undefined>) { return parts.filter(Boolean).join(' '); }

function TinySparkline({seed,positive=true}:{seed:number,positive?:boolean}) {
  const data=makeSeries(seed,25), min=Math.min(...data)-4, max=Math.max(...data)+4;
  const path=data.map((v,i)=>`${i===0?'M':'L'}${i*3.6} ${36-(v-min)/(max-min)*32}`).join(' ');
  return <svg viewBox="0 0 88 40" className="tiny-sparkline" role="img" aria-label="Illustrative probability trend"><path d={path} stroke={positive?'#2dd5a4':'#f38383'} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;
}

function ProbabilityChart({scenario,interval,mode}:{scenario:Scenario,interval:string,mode:'Probability'|'Activity'}) {
  const all=makeSeries(scenario.chartSeed+(mode==='Activity'?17:0),84);
  const length = interval==='1H'?23:interval==='1D'?46:interval==='1W'?65:84;
  const values=all.slice(-length);
  const min=Math.min(...values)-8,max=Math.max(...values)+8;
  const plotW=770,plotH=278,left=18,top=23;
  const coords=values.map((v,i)=>({x:left+(i/(values.length-1))*plotW,y:top+plotH-(v-min)/(max-min)*plotH}));
  const d=coords.map((p,i)=>`${i===0?'M':'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area=`${d} L ${left+plotW} ${top+plotH} L ${left} ${top+plotH} Z`;
  const color=mode==='Activity'?'#987eff':scenario.gradient==='green'?'#31d6ae':scenario.gradient==='violet'?'#a491fa':'#448aff';
  const end=coords[coords.length-1];
  return <div className="chart-wrap">
    <div className="chart-labels"><span>{mode==='Probability'?'IMPLIED PROBABILITY • ILLUSTRATIVE':'SIMULATED ACTIVITY • ILLUSTRATIVE'}</span><span>H / L  72.4 / 48.1</span></div>
    <svg className="main-chart" viewBox="0 0 860 370" preserveAspectRatio="none" role="img" aria-label={`Illustrative ${mode.toLowerCase()} trend for ${scenario.short}`}>
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".22"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient>
        <linearGradient id="chart-stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={color} stopOpacity=".4"/><stop offset="100%" stopColor={color}/></linearGradient>
      </defs>
      {[0,1,2,3,4].map(i=><g key={i}><line x1="15" x2="797" y1={top+i*plotH/4} y2={top+i*plotH/4} stroke="#273146" strokeDasharray="3 6" strokeWidth=".85"/><text x="817" y={top+i*plotH/4+4} fill="#75849d" fontSize="12">{Math.round(max-i*(max-min)/4)}{mode==='Probability'?'%':''}</text></g>)}
      {[0,1,2,3,4,5,6].map(i=><line key={i} x1={left+i*plotW/6} x2={left+i*plotW/6} y1={top} y2={top+plotH} stroke="#1b2334" strokeWidth=".75"/>) }
      <path d={area} fill="url(#chart-fill)"/>
      <path d={d} fill="none" stroke="url(#chart-stroke)" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
      <line x1={end.x} y1={end.y} x2={end.x} y2={top+plotH} stroke={color} strokeDasharray="4 5" strokeOpacity=".6"/>
      <circle cx={end.x} cy={end.y} r="9" fill={color} fillOpacity=".2"/><circle cx={end.x} cy={end.y} r="4.2" fill={color} stroke="#0c1120" strokeWidth="1.6"/>
      {['09:30','10:15','11:00','12:30','14:00','15:00','16:00'].map((t,i)=><text key={t} x={left+i*plotW/6} y="343" fill="#708096" fontSize="12" textAnchor={i===0?'start':i===6?'end':'middle'}>{t}</text>)}
    </svg>
    <div className="chart-footnote"><span><span className="status-dot blue"/> Indicative simulation · no live exchange feed</span><span>Not a security or wagering contract</span></div>
  </div>;
}

function OutcomeMeter({positive}:{positive:number}) {
  return <div className="outcome-meter"><div style={{width:`${positive*100}%`}} className="meter-yes"/><div className="meter-no"/></div>;
}

export function Terminal(){
  const [view,setView] = useState<View>('Overview');
  const [selectedId,setSelectedId] = useState(scenarios[0].id);
  const [category,setCategory] = useState<Category>('All markets');
  const [search,setSearch] = useState('');
  const [interval,setInterval] = useState<(typeof intervals)[number]>('1D');
  const [chartMode,setChartMode] = useState<'Probability'|'Activity'>('Probability');
  const [side,setSide] = useState<0|1>(0);
  const [confidence,setConfidence] = useState(72);
  const [ticketTab,setTicketTab] = useState<'Forecast'|'Simulate'>('Forecast');
  const [units,setUnits] = useState(10);
  const [simBalance,setSimBalance] = useState(1000);
  const [marketState,setMarketState] = useState<Record<string,[number,number]>>({});
  const [forecasts,setForecasts] = useState<ForecastReceipt[]>([]);
  const [allocations,setAllocations] = useState<AllocationReceipt[]>([]);
  const [saved,setSaved] = useState<string[]>(['spx-direction','nvda-relative','fed-stability']);
  const [toast,setToast] = useState('');
  const [navOpen,setNavOpen] = useState(false);
  const [noticeOpen,setNoticeOpen] = useState(false);
  const [sort,setSort] = useState<'Trending'|'Probability'|'Alphabetical'>('Trending');
  const searchRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLElement>(null);
  const selected = scenarios.find(x=>x.id===selectedId) ?? scenarios[0];
  const q=marketState[selected.id]||selected.q;
  const prices=lmsrPrices(q,selected.liquidity),yes=prices[0];
  const quote=quoteAllocation(q, selected.liquidity, side, units);
  const forecastYes = side===0?confidence:100-confidence;
  const filters=useMemo(()=>{
    let result=scenarios.filter(x=>category==='All markets'||x.category===category);
    if(view==='Watchlist')result=result.filter(x=>saved.includes(x.id));
    if(view==='My forecasts')result=result.filter(x=>forecasts.some(f=>f.eventId===x.id));
    if(search.trim()){const term=search.trim().toLowerCase();result=result.filter(x=>(x.name+' '+x.symbol+' '+x.category+' '+x.short).toLowerCase().includes(term));}
    if(sort==='Probability') result=[...result].sort((a,b)=>lmsrPrices(marketState[b.id]||b.q,b.liquidity)[0]-lmsrPrices(marketState[a.id]||a.q,a.liquidity)[0]);
    if(sort==='Alphabetical')result=[...result].sort((a,b)=>a.short.localeCompare(b.short));
    return result;
  },[category,search,view,sort,saved,marketState,forecasts]);

  useEffect(()=>{
    const listener=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchRef.current?.focus();}};
    window.addEventListener('keydown',listener);return ()=>window.removeEventListener('keydown',listener);
  },[]);
  function selectScenario(id:string){setSelectedId(id);setSide(0);setConfidence(72);setTicketTab('Forecast');terminalRef.current?.scrollIntoView({behavior:'smooth',block:'start'});}
  function toggleSaved(id:string){setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}
  function navigate(next:View){setView(next);setNavOpen(false);if(next==='Daily Combine'||next==='Weekly Epoch'){setCategory('All markets');}if(next==='Explore markets'){document.getElementById('explore')?.scrollIntoView({behavior:'smooth'});}}
  function recordForecast(){setForecasts(prev=>[...prev.filter(x=>x.eventId!==selected.id),{eventId:selected.id,side,probability:confidence,timestamp:new Date().toISOString()}]);setToast(`Demo forecast recorded: ${side===0?'Yes':'No'} ${confidence}% for ${selected.short}. Browser-session only.`);}
  function applyAllocation(){if(quote.cost>simBalance){setToast('Not enough demonstration units for this preview.');return;}setSimBalance(prev=>prev-quote.cost);setMarketState(prev=>({...prev,[selected.id]:quote.updatedQuantities as [number,number]}));setAllocations(prev=>[{eventId:selected.id,side,units,cost:quote.cost},...prev]);setToast(`Simulated ${units} ${side===0?'Yes':'No'} units for ${money(quote.cost)} abstract points. Local demo only.`);}
  const selectedForecast=forecasts.find(x=>x.eventId===selected.id);

  return <div className="app-shell">
    <aside className={classNames('sidebar',navOpen&&'sidebar-mobile-open')}>
      <div className="brand-wrap"><FigMark/><div className="brand-stack"><strong>FigSuite<span className="brand-mark">™</span></strong><small>INTELLIGENCE TERMINAL</small></div><button className="sidebar-collapse" aria-label="Close navigation" onClick={()=>setNavOpen(false)}><PanelLeftClose size={17}/></button></div>
      <div className="workspace-switch"><div className="workspace-icon">F</div><div className="workspace-info"><strong>FigSuite Workspace</strong><small><span className="status-dot"/> Personal · Demo</small></div><ChevronDown size={15}/></div>
      <div className="sidebar-scroll">
        {nav.map(group=><div key={group.label} className="nav-group"><p className="nav-heading">{group.label}</p>{group.items.map(item=>{const Icon=item.icon;return <button key={item.title} onClick={()=>navigate(item.title as View)} className={classNames('nav-button',view===item.title&&'nav-active')}><Icon size={18} strokeWidth={1.85}/><span>{item.title}</span>{item.title==='Daily Combine'&&<span className="nav-pill">LIVE DEMO</span>}</button>;})}</div>)}
        <div className="nav-group"><p className="nav-heading">UPCOMING VERTICALS</p><div className="nav-button disabled"><Activity size={18}/> <span>Sports simulations</span><LockKeyhole size={14}/></div><div className="nav-button disabled"><Globe2 size={18}/><span>Global events</span><LockKeyhole size={14}/></div></div>
        <div className="sidebar-divider"/>
        <button className="nav-button" onClick={()=>setNoticeOpen(true)}><CircleHelp size={18}/><span>How FigSuite works</span></button>
        <button className="nav-button" onClick={()=>setToast('Preferences are coming in the next sprint. This preview uses a dark, high-contrast terminal theme.')}><Settings2 size={18}/><span>Preferences</span></button>
      </div>
      <div className="sidebar-bottom"><div className="pro-card"><span className="pro-spark"><Sparkles size={15}/></span><strong>Build a verified track record</strong><p>Measure how well you forecast — not how much you spend.</p><button onClick={()=>setNoticeOpen(true)}>Explore the method <ArrowRight size={14}/></button></div><div className="sidebar-profile"><span className="avatar avatar-primary">FS</span><div><strong>Demo Analyst</strong><small>Simulation access</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    {navOpen&&<button className="mobile-scrim" aria-label="Close menu" onClick={()=>setNavOpen(false)}/>}

    <div className="app-content">
      <header className="topbar"><div className="top-left"><button className="mobile-menu" aria-label="Open navigation" onClick={()=>setNavOpen(true)}><Menu size={21}/></button><span className="breadcrumb">Workspace <ChevronRight size={13}/> <b>{view}</b></span></div><div className="top-actions"><div className="header-search"><Search size={17}/><input ref={searchRef} aria-label="Search scenarios" placeholder="Search markets, symbols, topics..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><span className="header-divider"/><button className="icon-button" aria-label="Notifications" onClick={()=>setNoticeOpen(true)}><Bell size={19}/><span className="notification-dot"/></button><button className="user-badge" onClick={()=>setNoticeOpen(true)}><span className="avatar tiny">FS</span><ChevronDown size={14}/></button></div></header>
      <main className="main-content">
        <div className="demo-banner"><div><span className="demo-label"><span className="status-dot blue"/> SANDBOX PREVIEW</span><span>All market data, ratings, quotes and forecasts are illustrative. No live markets, payments or prizes.</span></div><button onClick={()=>setNoticeOpen(true)}>Read the rules <ArrowUpRight size={13}/></button></div>
        <div className="headline-row"><div><div className="eyebrow"><span className="eyebrow-line"/> THE INTELLIGENCE TERMINAL <span className="version-tag">BETA 0.1</span></div><h1>{view==='Leaderboards'?'Prove your analytical edge.':view==='My forecasts'?'Your forecasts, in focus.':view==='Watchlist'?'Your watchlist, at a glance.':'Where conviction meets calibration.'}</h1><p className="headline-sub">Track scenarios. Make informed forecasts. Build a record that speaks for itself.</p></div><button className="primary-button headline-cta" onClick={()=>{setView('Explore markets');document.getElementById('explore')?.scrollIntoView({behavior:'smooth'});}}>Explore scenarios <ArrowUpRight size={17}/></button></div>
        {(['Daily Combine','Weekly Epoch','Guilds','Leaderboards'] as View[]).includes(view)&&<div className="workspace-context"><div className="workspace-context-icon">{view==='Daily Combine'?<Zap size={20}/>:view==='Weekly Epoch'?<CalendarClock size={20}/>:view==='Guilds'?<Users size={20}/>:<Trophy size={20}/>}</div><div><strong>{view==='Daily Combine'?'Daily Combine — intraday forecasting':view==='Weekly Epoch'?'Weekly Epoch — multi-session analysis':view==='Guilds'?'Guilds — collaborative analysis': 'Leaderboards — the skill index'}</strong><p>{view==='Daily Combine'?'Illustrative session opening, lock and close references. Real exchange schedules and source adapters are pending.':view==='Weekly Epoch'?'Analyze a longer forecast horizon; calendar-aware weekly scheduling is part of the next implementation phase.':view==='Guilds'?'Guild rosters and team scoring are scheduled for a later sprint. Explore the sample markets in the meantime.':'Rankings will use qualified, calibrated forecasts rather than spending or simulation volume.'}</p></div><span className="workspace-context-tag">{view==='Leaderboards'?'SAMPLE RANKINGS':'PLANNED'}</span></div>}
        <div className="stat-grid"><div className="stat-card"><div className="stat-top"><span>ANALYST SKILL INDEX</span><Target size={18}/></div><div className="stat-number">74.8 <span className="stat-badge">PROVISIONAL</span></div><div className="stat-foot">Illustrative profile <span className="text-positive">+2.4 pts</span></div><div className="stat-progress"><i style={{width:'74.8%'}}/></div></div><div className="stat-card"><div className="stat-top"><span>REPUTATION</span><Sparkles size={18}/></div><div className="stat-number">2,450 <span className="stat-unit">Bips</span></div><div className="stat-foot">Lifetime, non-transferable <span className="muted">↗</span></div><div className="stat-traces"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div><div className="stat-card"><div className="stat-top"><span>ACTIVE SCENARIOS</span><Activity size={18}/></div><div className="stat-number">06 <span className="stat-unit">illustrative</span></div><div className="stat-foot"><span className="status-dot green"/> Finance sandbox <span className="muted">•</span> sample data</div></div><div className="stat-card"><div className="stat-top"><span>SIMULATION UNITS</span><Wallet size={18}/></div><div className="stat-number">{simBalance.toFixed(1)} <span className="stat-unit">SU</span></div><div className="stat-foot">Local sandbox only <span className="muted">•</span> no cash value</div></div></div>
        <div className="main-columns">
          <div className="primary-column">
            <section className="terminal-card" ref={terminalRef} id="terminal">
              <div className="terminal-header"><div className="terminal-title"><div className="terminal-symbol-icon"><LineChart size={23}/></div><div><div className="symbol-overline">FEATURED SCENARIO <span className="vertical-separator">/</span> {selected.symbol}</div><h2>{selected.name}</h2><div className="symbol-meta"><span className="category-chip"><span className="status-dot blue"/>{selected.category}</span><span><Clock3 size={12}/>{selected.openUntil}</span><span><Eye size={13}/>{selected.participants} analysts</span></div></div></div><button className={classNames('save-btn',saved.includes(selected.id)&&'saved')} aria-label={saved.includes(selected.id)?'Remove from watchlist':'Add to watchlist'} aria-pressed={saved.includes(selected.id)} onClick={()=>toggleSaved(selected.id)}><Bookmark size={17} fill={saved.includes(selected.id)?'currentColor':'none'}/></button></div>
              <div className="terminal-trade-overview"><div><span className="overline">YES · SIMULATED PROBABILITY</span><div className="price-line"><strong>{pct(yes)}</strong><span className={classNames('price-change',selected.change>=0?'up':'down')}>{selected.change>=0?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>} {selected.change>=0?'+':''}{selected.change.toFixed(1)} pts</span></div></div><div className="mini-book"><div><small>NO</small><strong>{pct(prices[1])}</strong></div><div><small>SIM ACTIVITY</small><strong>{selected.volume}</strong></div><div><small>OUTCOMES</small><strong>2</strong></div></div></div>
              <div className="chart-toolbar"><div className="chart-tabs"><button className={chartMode==='Probability'?'active':''} onClick={()=>setChartMode('Probability')}><LineChart size={15}/> Probability</button><button className={chartMode==='Activity'?'active':''} onClick={()=>setChartMode('Activity')}><BarChart3 size={15}/> Activity</button></div><div className="chart-intervals">{intervals.map(t=><button key={t} onClick={()=>setInterval(t)} className={interval===t?'active':''}>{t}</button>)}</div></div>
              <ProbabilityChart scenario={selected} interval={interval} mode={chartMode}/>
              <div className="terminal-bottom"><div><ShieldCheck size={15}/> <span>Reference: {selected.reference}</span></div><button onClick={()=>setNoticeOpen(true)}>Resolution rules <ArrowUpRight size={13}/></button></div>
            </section>
            <section className="explore-section" id="explore"><div className="section-head"><div><div className="section-eyebrow">DISCOVER & ANALYZE</div><h2>{view==='My forecasts'?'Recorded forecasts':view==='Watchlist'?'Saved scenarios':'Explore scenarios'} <span className="section-count">{filters.length}</span></h2><p>Structured hypotheses. Transparent rules. A better way to measure judgment.</p></div><button className="sort-select" onClick={()=>setSort(curr=>curr==='Trending'?'Probability':curr==='Probability'?'Alphabetical':'Trending')}><Filter size={15}/>{sort}<ChevronDown size={13}/></button></div>
              <div className="filter-tabs">{categories.map(item=><button className={category===item?'active':''} key={item} onClick={()=>setCategory(item)}>{item}</button>)}<span className="filter-future"><LockKeyhole size={13}/> Sports & Global Events soon</span></div>
              <div className="scenario-grid">{filters.length>0?filters.map(item=>{
                const price=lmsrPrices(marketState[item.id]||item.q,item.liquidity)[0];
                const isSaved=saved.includes(item.id), active=selected.id===item.id;
                return <article key={item.id} className={classNames('scenario-card',active&&'scenario-active')}><div className="scenario-card-top"><span className="card-category"><span className="category-dot"/>{item.category}</span><button aria-label={isSaved?'Remove saved scenario':'Save scenario'} aria-pressed={isSaved} onClick={()=>toggleSaved(item.id)}><Bookmark size={16} fill={isSaved?'currentColor':'none'}/></button></div><button className="scenario-title" onClick={()=>selectScenario(item.id)}>{item.name}</button><div className="scenario-sub">{item.symbol} · Demo scenario</div><div className="scenario-trend"><div><small>YES PROBABILITY</small><strong>{pct(price)}</strong><span className={item.change>=0?'up':'down'}>{item.change>=0?'+':''}{item.change.toFixed(1)} pts</span></div><TinySparkline seed={item.chartSeed} positive={item.change>=0}/></div><OutcomeMeter positive={price}/><div className="scenario-card-footer"><span><Users size={14}/>{item.participants}</span><button onClick={()=>selectScenario(item.id)}>Analyze <ArrowRight size={14}/></button></div></article>;
              }):<div className="empty-scenarios"><Search size={25}/><h3>No scenarios found</h3><p>Try another search or category. These are illustrative sample markets.</p><button onClick={()=>{setSearch('');setCategory('All markets');setView('Overview');}}>Reset filters</button></div>}</div>
              <div className="method-note"><Info size={17}/><p>FigSuite separates forecast accuracy from simulated allocation size. Probability paths above use deterministic sample data; external market ingestion, real-time feeds, and persisted forecasts are not connected in this starter.</p></div>
            </section>
          </div>
          <div className="secondary-column">
            <section className="forecast-ticket"><div className="ticket-heading"><div className="ticket-icon"><Target size={20}/></div><div><span>THE FORECAST TICKET</span><h3>Express your conviction</h3></div><span className="ticket-demo">DEMO</span></div><div className="ticket-switch"><button onClick={()=>setTicketTab('Forecast')} className={ticketTab==='Forecast'?'active':''}>Forecast</button><button onClick={()=>setTicketTab('Simulate')} className={ticketTab==='Simulate'?'active':''}>Simulate</button></div><p className="ticket-question">{selected.short}</p><div className="outcome-buttons"><button onClick={()=>setSide(0)} className={classNames('outcome-btn',side===0&&'yes-selected')}><span>YES</span><b>{pct(prices[0])}</b></button><button onClick={()=>setSide(1)} className={classNames('outcome-btn',side===1&&'no-selected')}><span>NO</span><b>{pct(prices[1])}</b></button></div>
                {ticketTab==='Forecast'?<><div className="ticket-field-label"><label htmlFor="confidence">Your confidence in {side===0?'YES':'NO'}</label><strong>{confidence}%</strong></div><input id="confidence" className="confidence-range" aria-label="Forecast confidence" type="range" min="50" max="99" value={confidence} onChange={e=>setConfidence(Number(e.target.value))}/><div className="range-labels"><span>50% · Uncertain</span><span>99% · Certain</span></div><div className="ticket-explanation">Implied probability: <strong>{pct(side===0?prices[0]:prices[1])}</strong><br/>Your forecast: <strong>{confidence}%</strong> · Yes vector <strong>{forecastYes}%</strong></div><button className="ticket-submit" onClick={recordForecast}><Target size={17}/>{selectedForecast?'Update demo forecast':'Record demo forecast'} <ArrowRight size={16}/></button>{selectedForecast&&<div className="saved-forecast"><CheckCircle2 size={15}/> Saved in this browser session: {selectedForecast.side===0?'Yes':'No'} {selectedForecast.probability}%</div>}</>:<><div className="ticket-field-label"><label htmlFor="units">Allocation quantity</label><span className="sim-limit">1–100 units</span></div><div className="unit-control"><button onClick={()=>setUnits(n=>Math.max(1,n-5))} aria-label="Decrease quantity">−</button><input type="number" id="units" min="1" max="100" value={units} onChange={e=>setUnits(Math.min(100,Math.max(1,Math.floor(Number(e.target.value)||1))))}/><button onClick={()=>setUnits(n=>Math.min(100,n+5))} aria-label="Increase quantity">+</button></div><div className="quote-details"><div><span>Model</span><strong>LMSR</strong></div><div><span>Simulated cost</span><strong>{money(quote.cost)} SU</strong></div><div><span>After allocation</span><strong>{pct(quote.pricesAfter[side])}</strong></div><div><span>Your sandbox balance</span><strong>{money(simBalance)} SU</strong></div></div><button className="ticket-submit" disabled={quote.cost>simBalance} onClick={applyAllocation}><Zap size={17}/>Apply demo allocation <ArrowRight size={16}/></button></>}
                <div className="ticket-disclaimer"><LockKeyhole size={14}/><span>Simulation only. No wagering, prizes, real money, or financial assets. Activity is not saved to a backend.</span></div>
            </section>
            <section className="rail-panel"><div className="rail-heading"><h3>Market watchlist</h3><button aria-label="About demo watchlist" onClick={()=>setToast('These watchlist quotes are static, illustrative figures. Connect a licensed feed in a later sprint.')}><MoreHorizontal size={17}/></button></div><div className="watchlist-header"><span>SYMBOL</span><span>REFERENCE*</span><span>CHANGE*</span></div>{watchlist.map(item=><div className="watch-row" key={item.ticker}><div className="watch-info"><strong>{item.ticker}</strong><small>{item.name}</small></div><span>{item.value}</span><span className={item.up?'up':'down'}>{item.delta}</span></div>)}<div className="rail-footer">* Static sample values. Not real-time.</div></section>
            <section className="rail-panel leaderboard-panel"><div className="rail-heading"><h3>Top analysts</h3><span className="rail-chip">EXAMPLE</span></div><div className="leaderboard-head"><span>ANALYST</span><span>SKILL</span></div>{leaderboard.map(item=><div className="leaderboard-row" key={item.handle}><span className="rank">{item.rank.toString().padStart(2,'0')}</span><span className="avatar small">{item.initials}</span><div className="leader-identity"><strong>{item.handle}</strong><small>Forecast skill · sample</small></div><div className="leader-score"><strong>{item.score.toFixed(1)}</strong><small>{item.change} pts</small></div></div>)}<button className="rail-full-link" onClick={()=>{setView('Leaderboards');setToast('Analyst leaderboard is illustrative; verified rankings will require finalized forecasts and 20 qualifying events.')}}>How scoring works <ArrowRight size={15}/></button></section>
            <section className="integrity-panel"><div className="integrity-heading"><ShieldCheck size={18}/><strong>Designed for integrity</strong></div><p>Calibrated forecasts, independent event resolution and immutable scoring history are at the heart of FigSuite.</p><button onClick={()=>setNoticeOpen(true)}>Our methodology <ArrowUpRight size={14}/></button></section>
          </div>
        </div>
        <footer className="app-footer"><span><FigMark size={17}/> FigSuite™ · Intelligence over intuition.</span><span>Illustrative simulator • v0.1 alpha • No real-money activity</span><button onClick={()=>setNoticeOpen(true)}>Safety & methodology</button></footer>
      </main>
    </div>
    {toast&&<div role="status" className="toast"><CheckCircle2 size={18}/><span>{toast}</span><button onClick={()=>setToast('')} aria-label="Dismiss notification"><X size={17}/></button></div>}
    {noticeOpen&&<div className="modal-overlay" onClick={()=>setNoticeOpen(false)}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()}><div className="modal-top"><span className="modal-symbol"><ShieldCheck size={23}/></span><button onClick={()=>setNoticeOpen(false)} aria-label="Close dialog"><X size={19}/></button></div><h2 id="modal-title">Built for better forecasts, not bigger bets.</h2><p>FigSuite is an analytical simulation environment. This alpha interface contains illustrative data and local-session interactions only.</p><div className="modal-feature"><Check size={18}/><div><strong>Forecast quality</strong><p>Quality is assessed through calibrated probabilities, Brier scoring and independently verified resolutions — not spending.</p></div></div><div className="modal-feature"><Check size={18}/><div><strong>Separate reputation</strong><p>Bips are non-transferable points. Simulated units are abstract and cannot be redeemed or converted into money.</p></div></div><div className="modal-feature"><Check size={18}/><div><strong>Prizes are disabled</strong><p>No prize API or payout provider is available. A separate legal and provider approval process is required before any future prize program.</p></div></div><button className="ticket-submit modal-done" onClick={()=>setNoticeOpen(false)}>Understood <ArrowRight size={16}/></button></section></div>}
  </div>;
}
