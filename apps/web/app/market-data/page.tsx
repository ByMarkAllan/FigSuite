import Link from 'next/link';
import {MarketDataPanel} from '@/components/market-data-panel';
export const metadata={title:'FigSuite — Market data',description:'Source-attributed market reference prices; forecasting remains simulated.'};
export default function MarketDataPage(){
  return <main style={{minHeight:'100vh',background:'#090f1c',padding:'35px max(18px,calc((100vw - 1080px)/2))',color:'#eff5ff',fontFamily:'system-ui,sans-serif'}}>
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,marginBottom:75}}>
      <Link href="/" style={{color:'#36d2af',fontWeight:750,fontSize:23,textDecoration:'none'}}>FigSuite™</Link>
      <Link href="/" style={{color:'#a4b5d0',textDecoration:'none'}}>← Return to terminal</Link>
    </nav>
    <h1 style={{fontSize:'clamp(32px,5vw,56px)',letterSpacing:'-.04em'}}>Exchange reference dashboard</h1>
    <p style={{color:'#9bacc6',maxWidth:650,lineHeight:1.7,marginBottom:30}}>
      Licensed Massive reference prices are presented with source, tier and as-of labels. These are
      independent market observations, not FigSuite event probabilities or tradeable positions.
    </p>
    <MarketDataPanel/>
    <p style={{color:'#7d90ae',fontSize:12,marginTop:25}}>No investment advice. No live market data is available until an authorized provider key and redistribution rights are configured.</p>
  </main>;
}
