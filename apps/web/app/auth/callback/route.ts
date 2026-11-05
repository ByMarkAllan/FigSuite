import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code=request.nextUrl.searchParams.get('code');
  const next=safeNext(request.nextUrl.searchParams.get('next'));
  const destination=new URL(next,request.url);
  if(!code)return NextResponse.redirect(new URL('/login?error=auth',request.url));
  const supabase=await createClient();
  const {error}=await supabase.auth.exchangeCodeForSession(code);
  if(error)return NextResponse.redirect(new URL('/login?error=auth',request.url));
  return NextResponse.redirect(destination);
}
