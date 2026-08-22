# AUDIENT — BACKEND-004  
# REAL USER, MEMBERSHIP & CREDITS INTEGRATION

**Status:** Implemented  
**Depends on:** BACKEND-003 (verified)  
**Out of scope:** Stripe, AI, workspace persistence, credit purchase, `USE_MOCK_AUTH=false`

---

## Objective

Hydrate dashboard, membership, billing, and audit permission UX from Supabase while keeping mock auth available.

| Domain | Source of truth |
|--------|-----------------|
| Identity | `public.users` via `auth_provider_id = auth.uid()` |
| Membership | `public.memberships` (client cannot write tier) |
| Plans | `public.plans` (credits, costs, feature flags) |
| Credits | `public.credits.balance` (+ ledger for future mutations) |

---

## Architecture

```
AuthProvider (session)
  → AccountProvider (fetch GET /api/me when real Supabase user)
    → useAppState() / getMockAppState(user, { account })
      → Dashboard / headers / Manage Membership / URL gate / workspace gates
```

| Path | Role |
|------|------|
| `GET /api/me` | Account snapshot |
| `GET /api/me/permissions` | Server capability flags |
| `src/services/account.ts` | Load + map DB → snapshot |
| `src/services/audit-permissions.ts` | Server URL/credit asserts |
| `src/providers/account-provider.tsx` | Client hydration |
| `src/hooks/use-app-state.ts` | Shared facade over getMockAppState + account |
| Mock users (`mock-*` ids) | Skip `/api/me`; keep mock facade |

---

## Security

- Never trusts client-supplied tier/credits.
- Membership/credits writes remain RLS-denied for clients.
- Browser uses anon key only.

---

## Mock compatibility

`USE_MOCK_AUTH = true` unchanged. Mock SSO users continue to use mock state. Real Google sessions (controlled path) hydrate from DB.

---

## Stop

Do not start Stripe / AI / BACKEND-005 automatically.
