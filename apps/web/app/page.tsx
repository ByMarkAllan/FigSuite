import Link from 'next/link';
import { Terminal } from '@/components/terminal';

export default function Page(){
  return <>
    <div style={{background:'#0e1e2a',padding:'10px 20px',textAlign:'center',color:'#d8ecf5',fontFamily:'system-ui',fontSize:13}}>
      Reference stock data: <Link href="/market-data" style={{color:'#45d9b6',fontWeight:700}}>Open market dashboard →</Link>
      <span style={{marginLeft:14,color:'#9cacc0'}}>Market quotes and forecasting simulations are separate.</span>
    </div>
    <Terminal/>
  </>;
}
