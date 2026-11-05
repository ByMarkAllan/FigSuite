'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Props = { destination: '/' | '/account'; initialError?: string; signedOut?: boolean };
export function LoginForm({destination, initialError, signedOut}: Props) {
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(initialError||'');
  const [notice,setNotice]=useState(signedOut?'Signed out successfully.':'');
  const supabase=createClient();

  async function send(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');setNotice('');
    const normalized=email.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)||normalized.length>254) {
      setError('Enter a valid email address.');return;
    }
    setBusy(true);
    try {
      const {error:authError}=await supabase.auth.signInWithOtp({
        email:normalized,
        options:{
          shouldCreateUser:true,
          emailRedirectTo:window.location.origin+'/auth/callback?next='+encodeURIComponent(destination)
        }
      });
      if(authError)throw authError;
      setEmail(normalized);setSent(true);
      setNotice('Check your inbox. Enter the code if provided, or use the secure sign-in link.');
    } catch {
      setError('Unable to send the sign-in email. Please try again shortly.');
    } finally {setBusy(false);}
  }
  async function verify(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!/^\d{6,8}$/.test(code.trim())) {setError('Enter the one-time code from your email.');return;}
    setBusy(true);setError('');
    try {
      const {error:authError}=await supabase.auth.verifyOtp({email,token:code.trim(),type:'email'});
      if(authError)throw authError;
      router.replace(destination);router.refresh();
    } catch {setError('That code is invalid or expired. Request another code and try again.');}
    finally {setBusy(false);}
  }
  return <div className="auth-form">
    <form onSubmit={send}>
      <label htmlFor="fig-email">Email address</label>
      <input id="fig-email" name="email" type="email" autoComplete="email" required maxLength={254}
        placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/>
      <button type="submit" disabled={busy}>{busy?'Sending…':sent?'Send another code':'Continue with email'} <span aria-hidden>→</span></button>
    </form>
    {sent && <form onSubmit={verify} className="auth-verify">
      <label htmlFor="fig-code">One-time verification code</label>
      <input id="fig-code" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]*" placeholder="6-digit code" value={code} maxLength={8}
        onChange={e=>setCode(e.target.value.replace(/[^0-9]/g,''))} disabled={busy}/>
      <button type="submit" disabled={busy||code.length<6}>{busy?'Verifying…':'Verify and sign in'}</button>
      <p>If your email contains a sign-in link rather than a code, click the link instead.</p>
    </form>}
    {notice&&<div className="auth-notice" role="status">{notice}</div>}
    {error&&<div className="auth-error" role="alert">{error}</div>}
    <p className="auth-policy">Continuing creates an account if needed. Your email is used to secure your FigSuite workspace.</p>
  </div>;
}
