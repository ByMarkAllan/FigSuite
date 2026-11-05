# FigSuite — Passwordless authentication setup (v1)

Authentication is implemented in the FigSuite platform via Supabase Auth and Next.js SSR clients.

## Features
- Sign up / sign in using email one-time password or sign-in link.
- Email confirmation via verifyOtp; redirect callback supports PKCE code exchange.
- Persistent sessions with Next.js 16 proxy token refresh and secure server-side getClaims/getUser checks.
- Forecasting terminal at / is optionally gated by FIGSUITE_AUTH_REQUIRED=true; /account always requires a verified session. During email/redirect setup, the existing simulation remains available as a guest demo. Marketing and /market-data remain public.
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


## Acceptance test script (manual email delivery)
1. With FIGSUITE_AUTH_REQUIRED=false, visit / in a private browser; the guest demo remains accessible. Directly visit /account and confirm it redirects to /login. After all checks pass, set FIGSUITE_AUTH_REQUIRED=true and redeploy; then / must redirect to /login.
2. Request a code using a controlled test email address. Verify delivery from the configured SMTP sender.
3. Enter the OTP (or use the token-hash magic link). Confirm the workspace becomes accessible.
4. Go to /account, save a display name, refresh and confirm the value persists.
5. Sign out, then confirm / and /account are no longer accessible.
6. Repeat with a second controlled test account to confirm neither account can read or edit the other's profile.
7. Confirm reused and expired OTPs fail; check rate limits, audit logs, and cookie refresh.
8. Confirm /market-data stays accessible without a session and /api/prizes/status remains payout-disabled.

Do not complete launch without this check. The connected Supabase management integration does not expose hosted email template or Site URL settings, so those must be configured separately.

## Production cutover gate
The Vercel application project must keep FIGSUITE_AUTH_REQUIRED=false until Supabase redirects, email template, SMTP and real-email tests pass. Flip to true only after these checks; the setting never grants access to authenticated-only data. The /account page always checks the user's server-verified Supabase identity.
