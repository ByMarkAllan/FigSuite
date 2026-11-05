import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut, updateProfile } from './actions';

export const dynamic='force-dynamic';
export const metadata={title:'Account | FigSuite'};

export default async function AccountPage({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}) {
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)redirect('/login?next=%2Faccount');
  const {data:profile}=await supabase.from('profiles').select('display_name,created_at').eq('id',user.id).maybeSingle();
  const params=await searchParams;
  return <main className="auth-page">
    <section className="auth-card account-card">
      <nav className="account-nav">
        <Link href="/" className="auth-wordmark">F<span>.</span> FigSuite<sup>™</sup></Link>
        <Link href="/">← Return to workspace</Link>
      </nav>
      <div className="auth-eyebrow">ACCOUNT / PERSONAL PROFILE</div>
      <h1>Your FigSuite <span>identity.</span></h1>
      <p className="auth-lead">Manage the information associated with your verified email account.</p>
      <div className="account-field"><small>VERIFIED EMAIL</small><strong>{user.email||'Email unavailable'}</strong></div>
      <form action={updateProfile} className="auth-form">
        <label htmlFor="display-name">Display name</label>
        <input id="display-name" name="display_name" type="text" maxLength={80} defaultValue={profile?.display_name||''} placeholder="How should we display your name?"/>
        <button type="submit">Save profile <span aria-hidden>→</span></button>
      </form>
      {params.saved==='1'&&<p className="auth-notice" role="status">Profile updated.</p>}
      {params.error&&<p className="auth-error" role="alert">Profile could not be saved. Please try again.</p>}
      <div className="account-info">Your profile is accessible only to you through row-level security. Verification for future cash-prize eligibility is handled separately.</div>
      <form action={signOut}><button type="submit" className="account-signout">Sign out</button></form>
    </section>
  </main>;
}
