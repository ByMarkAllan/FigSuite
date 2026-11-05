import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';
import { LoginForm } from '@/components/login-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in | FigSuite' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; logged_out?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect(next);
  return <main className="auth-page">
    <section className="auth-card">
      <Link href="/" className="auth-wordmark">F<span>.</span> FigSuite<sup>™</sup></Link>
      <div className="auth-eyebrow">SECURE ACCESS / FINANCE INTELLIGENCE</div>
      <h1>Sign up or <span>log in.</span></h1>
      <p className="auth-lead">Explore FigSuite freely. Use a one-time email code or secure link when you are ready to record a forecast, save scenarios or simulate an allocation. No password required.</p>
      <LoginForm destination={next} initialError={params.error === 'auth' ? 'Verification failed. Please request a new code.' : undefined}
        signedOut={params.logged_out === '1'}/>
      <div className="auth-footer">
        <span>Forecasts and simulation units have no cash value.</span>
        <Link href="/">Continue browsing without an account →</Link><Link href="/market-data">View market references →</Link>
      </div>
    </section>
  </main>;
}
