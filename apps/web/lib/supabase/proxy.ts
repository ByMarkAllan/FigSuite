import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/** Refresh session cookies for SSR; no authorization decisions from raw cookies. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          for (const key of ['cache-control', 'expires', 'pragma'] as const) {
            const value = headers?.[key] ?? headers?.[key.replace('-','')];
            if (value) response.headers.set(key, value);
          }
        },
      },
    }
  );
  await client.auth.getClaims();
  return response;
}
