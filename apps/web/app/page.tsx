import Link from 'next/link';
import { Terminal } from '@/components/terminal';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);
  const email = authenticated && typeof data?.claims?.email === 'string' ? data.claims.email : undefined;

  // Read-only exploration is public. Key actions require a fresh verified session
  // in the client and, once persisted, authenticated server endpoints with RLS.
  return <>
    <div style={{background:'#0e1e2a',padding:'10px 20px',display:'flex',justifyContent:'center',alignItems:'center',gap:16,flexWrap:'wrap',color:'#d8ecf5',fontFamily:'system-ui',fontSize:13}}>
      <span>{authenticated ? 'Signed in · Simulations are illustrative' : 'Explore freely · Sign in to record activity'}</span>
      {email && <span style={{color:'#95accc'}}>{email}</span>}
      <Link href="/market-data" style={{color:'#45d9b6',fontWeight:700}}>Reference market data ↗</Link>
      <Link href={authenticated ? '/account' : '/login'} style={{color:'#92b6ff',fontWeight:700}}>
        {authenticated ? 'My account ↗' : 'Sign up / Log in ↗'}
      </Link>
    </div>
    <Terminal authenticated={authenticated}/>
  </>;
}
