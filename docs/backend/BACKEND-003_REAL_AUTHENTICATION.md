# AUDIENT — BACKEND-003  
# REAL AUTHENTICATION

**Status:** Implemented (foundation) — mock remains default  
**Date:** 2026-08-15  
**Depends on:** BACKEND-001 (complete), BACKEND-002 APPLY (complete)  
**Out of scope:** Stripe, AI worker, credit spend, workspace DDL, flipping `USE_MOCK_AUTH` off without separate approval

---

## Objective

Supabase Auth foundation (Google OAuth first) with callback, session refresh, sign-out, user sync via DB trigger, and protected routes — while **`USE_MOCK_AUTH = true`** stays the default.

---

## Architecture

| Layer | Behavior |
|-------|----------|
| Default UI login | Mock SSO (unchanged) when `USE_MOCK_AUTH=true` |
| Controlled real path | Set `NEXT_PUBLIC_REAL_OAUTH_DEV_PATH=true` → **Google** uses real Supabase OAuth; Apple/Microsoft stay mock |
| Full cutover | Separate approval: `USE_MOCK_AUTH = false` |
| Provisioning | `auth.users` INSERT → `handle_new_user()` creates `users` + FREE `memberships` + credits from **plans** catalog (fallback 300) |
| Membership writes | Server/trigger only — never from browser |
| RLS | Unchanged — own-row only; no broad authenticated policies |

### Flow (real Google)

```
Sign in (Google)
  → supabase.auth.signInWithOAuth
  → Google → Supabase
  → GET /auth/callback?code=&next=
  → exchangeCodeForSession
  → verify session + app user row (membership/credits via trigger)
  → redirect sanitized `next` (default /dashboard via afterLogin)
```

---

## Security

- Never expose service-role key, DB password, or OAuth client secrets to the client.
- Client may use anon/publishable key only.
- `next` redirects sanitized (`sanitizeAuthRedirect`) — no open redirects.
- Callback errors use opaque codes; no DB/secrets in the UI.

---

## Dashboard setup (required for Google in development)

1. Supabase → Authentication → Providers → **Google** (enable; Client ID/Secret).  
2. Redirect URLs allow-list: `{NEXT_PUBLIC_APP_URL}/auth/callback`  
3. `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_REAL_OAUTH_DEV_PATH=true` (controlled verification only)
4. Keep `USE_MOCK_AUTH = true` in `src/config/auth.ts` until cutover approval.

---

## Files

| Path | Role |
|------|------|
| `src/config/auth.ts` | Flag helpers; `USE_MOCK_AUTH` stays `true` |
| `src/providers/auth-provider.tsx` | Mock + optional real Google client |
| `src/lib/supabase/middleware.ts` | Hybrid guard when real OAuth path on |
| `src/app/auth/callback/route.ts` | PKCE exchange + sync verify + safe redirect |
| `src/app/auth/sign-out/route.ts` | Clear session (+ mock cookie) |
| `src/lib/auth/ensure-app-user.ts` | Post-login provision verification |
| `src/lib/auth/callback-errors.ts` | Friendly callback error mapping |
| `src/hooks/use-login-modal.ts` / `sso-login-panel.tsx` | Route Google to real OAuth when path enabled |

---

## Success criteria

- [x] Supabase Auth integrated (client/server/middleware/callback/sign-out)
- [x] Google OAuth path available under controlled env flag
- [x] Callback exchanges code, validates session, verifies app user
- [x] FREE membership + credits via DB trigger (plans catalog SoT)
- [x] Protected routes work (mock and/or real session in hybrid)
- [x] Sign-out clears real session (+ mock cookie)
- [x] Mock auth remains default (`USE_MOCK_AUTH=true`)
- [x] Typecheck / lint / build passed
- [ ] Manual Google sign-in verification in browser (requires Dashboard OAuth + `NEXT_PUBLIC_REAL_OAUTH_DEV_PATH=true`)

---

## Stop

Do **not** set `USE_MOCK_AUTH = false` without explicit approval.  
Do **not** start Stripe, AI, or workspace persistence (BACKEND-004+).
