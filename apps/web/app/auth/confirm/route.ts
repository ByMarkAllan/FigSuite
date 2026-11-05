import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const hash=request.nextUrl.searchParams.get('token_hash');
  const next=safeNext(request.nextUrl.searchParams.get('next'));
  if(!hash||request.nextUrl.searchParams.get('type')!=='email') {
    return NextResponse.redirect(new URL('/login?error=auth',request.url));
  }
  const supabase=await createClient();
  const {error}=await supabase.auth.verifyOtp({token_hash:hash,type:'email'});
  if(error)return NextResponse.redirect(new URL('/login?error=auth',request.url));
  return NextResponse.redirect(new URL(next,request.url));
}
