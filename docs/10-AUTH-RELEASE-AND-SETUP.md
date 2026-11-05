# FigSuite — Passwordless authentication setup (v1)

Authentication is implemented in the FigSuite platform via Supabase Auth and Next.js SSR clients.

## Features
- Sign up / sign in using email one-time password or sign-in link.
- Email confirmation via verifyOtp; redirect callback supports PKCE code exchange.
- Persistent sessions with Next.js 16 proxy token refresh and secure server-side getClaims/getUser checks.
- Forecasting terminal at / requires sign-in. /account requires sign-in; the marketing site and /market-data remain public.
- User profile can be viewed and updated, subject to owner-only RLS in public.profiles.
- Sign out via server action. No server-side service role credentials in the app.

## Required Supabase Auth Dashboard configuration
Use the connected Supabase project FigSuite and navigate to Authentication > URL Configuration.
1. Set Site URL to https://app.figsuite.com.
2. Add redirect URLs: https://app.figsuite.com/auth/callback and https://app.figsuite.com/auth/confirm.
3. In Authentication > Providers > Email, confirm email authentication is enabled.
4. In Authentication > Email Templates > Magic Link, set the content to include a six-digit OTP AND a first-party link:
   <p>Your FigSuite sign-in code: <strong>{{ .Token }}</strong></p>
   <p>Or <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Sign in securely</a></p>
5. Configure SMTP for production delivery and appropriate rate limits / abuse controls.
6. Restrict extra redirect URLs to trusted exact preview hosts if testing preview auth.
7. Verify sign-in from a fresh browser, token verification, expiry and replay rejection, session refresh, logout, and cross-user RLS isolation.

**Do not add a service-role key, prize payout key or admin secret to browser code.**

## Additional constraints
The forecasting terminal still keeps demo forecasts in browser state; authentication does not persist them yet.
User authentication does not establish eligibility for future cash prizes. Identity, location, age, tax and fraud controls are separate. Payout execution stays disabled.

## Deployment
Use the canonical Vercel project fig-suite for app.figsuite.com, root apps/web, and existing public Supabase settings. The separate figsuite project serves marketing. Do not deploy to retired figsuite-platform.
