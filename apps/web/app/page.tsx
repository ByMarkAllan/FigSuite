import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Terminal } from '@/components/terminal';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function Page() {
  const supabase=await createClient();
  const { data, error }=await supabase.auth.getClaims();
  if(error||!data?.claims?.sub)redirect('/login');
  return <>
    <div style={{background:'#0e1e2a',padding:'10px 20px',display:'flex',justifyContent:'center',alignItems:'center',gap:16,flexWrap:'wrap',color:'#d8ecf5',fontFamily:'system-ui',fontSize:13}}>
      <span>Verified FigSuite workspace · Simulations only</span>
      <Link href="/market-data" style={{color:'#45d9b6',fontWeight:700}}>Market data ↗</Link>
      <Link href="/account" style={{color:'#92b6ff',fontWeight:700}}>My account ↗</Link>
    </div>
    <Terminal/>
  </>;
}
