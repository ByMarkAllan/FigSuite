'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase=await createClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)redirect('/login');
  const name=String(formData.get('display_name')||'').trim();
  if(name.length>80)redirect('/account?error=name');
  const {error}=await supabase.from('profiles').upsert({
    id:user.id,display_name:name,updated_at:new Date().toISOString()
  },{onConflict:'id'});
  if(error)redirect('/account?error=profile');
  redirect('/account?saved=1');
}

export async function signOut() {
  const supabase=await createClient();
  await supabase.auth.signOut({scope:'local'});
  redirect('/login?logged_out=1');
}
