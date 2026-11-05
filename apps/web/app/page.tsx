import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Terminal } from '@/components/terminal';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function Page() {
  const supabase=await createClient();
  const { data }=await supabase.auth.getClaims();
  const authenticated=Boolean(data?.claims?.sub);

  // Until Supabase Site URL, redirect allowlist, templates and SMTP are verified,
  // keep the current demonstration accessible; account and protected data remain gated.
  if(!authenticated && process.env.FIGSUITE_AUTH_REQUIRED === 'true')redirect('/login');

  const email=authenticated && typeof data?.claims?.email==='string' ? data.claims.email : undefined;
  return <>
    <div style={{background:'#0e1e2a',padding:'10px 20px',display:'flex',justifyContent:'center',alignItems:'center',gap:16,flexWrap:'wrap',color:'#d8ecf5',fontFamily:'system-ui',fontSize:13}}>
      <span>{authenticated ? 'Authenticated FigSuite workspace' : 'Open demonstration · No persistent forecasts'}</span>
      {email&&<span style={{color:'#95accc'}}>{email}</span>}
      <Link href="/market-data" style={{color:'#45d9b6',fontWeight:700}}>Market data ↗</Link>
      <Link href={authenticated?'/account':'/login'} style={{color:'#92b6ff',fontWeight:700}}>
        {authenticated?'My account ↗':'Sign in ↗'}
      </Link>
    </div>
    <Terminal/>
  </>;
}
