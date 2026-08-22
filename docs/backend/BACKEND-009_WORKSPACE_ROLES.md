# AUDIENT — BACKEND-009
# WORKSPACE, ROLES & AUTHORIZATION

**Status:** Implemented (personal-account authorization hardening) — multi-seat schema started in BACKEND-009A  
**Depends on:** BACKEND-003 … BACKEND-008  
**Out of scope:** Invitations, workspace UI wiring, payment/notification RLS changes, BACKEND-009B feature APIs, BACKEND-010, flipping `USE_MOCK_AUTH`

See also: `docs/backend/BACKEND-009A_WORKSPACE_FOUNDATION.md`

---

## Objective

Make the **existing** account boundary authoritative for ownership, permissions, and resource access — without inventing a second authorization system or applying deferred org tables prematurely.

---

## Architecture reality

| Layer | State |
|-------|--------|
| Applied schema | **Personal account** — `users`, `memberships` (plan), `audits`/`payments`/`notifications` owned by `user_id` |
| Platform role | `users.role` enum `USER` \| `ADMIN` (not workspace roles) |
| Workspace DDL | Designed in BACKEND-002 §7 — **not migrated** (`workspaces`, `workspace_members`, `roles`, …) |
| Frontend `/workspace` | Mock team UI gated by Business (`ENTERPRISE`) plan |
| UI role matrix | `owner` / `admin` / `designer` / `analyst` / `viewer` — display only until DDL |

**Authoritative ownership today:** the authenticated app user (`public.users.id` from session) owns their audits, reports, payments, credits, and notifications. There is no separate workspace row.

---

## What BACKEND-009 implements

```
Session (verified JWT)
  → loadAccountSnapshot (RLS)
  → AuthorizationContext
       accountRole: owner          # personal account owner
       platformRole: USER|ADMIN
       workspaceMode: personal
       capabilities (plan + owner)
  → protected APIs reject client identity fields
  → RLS remains the DB boundary
```

- Server `AuthorizationContext` + capability helpers  
- Extended `GET /api/me/permissions` with account/workspace authorization fields  
- Client-supplied `userId` / `workspaceId` / `role` rejected on audit create  
- `npm run verify:authorization` contract checks  
- Mock auth + mock Business workspace UI preserved (no fake DB team)

---

## Explicitly deferred (no migration in this phase)

Per “prefer no migrations” and BACKEND-002 apply timing:

- Creating `workspaces` / `workspace_members` / invitation tables  
- Persisting team roles or sharing audits across seats  
- Replacing mock `/workspace` roster with live members  

Those require an **approved schema apply** of BACKEND-002 §7 (or successor) before multi-seat RLS can exist.

---

## RLS

Unchanged owner-scoped policies remain authoritative. Users cannot read/modify another user’s audits, reports, payments, or notifications. Clients cannot INSERT notifications or elevate `users.role` to platform `ADMIN`.

---

## Success criteria (this phase)

- [x] Ownership derived from session, not client  
- [x] Server permission/capability surface for personal account  
- [x] APIs scoped by `account.appUserId`  
- [x] IDOR-oriented contracts verified (script + existing ownership helpers)  
- [x] Mock auth preserved  
- [x] No Stripe/AI/credit redesign  
- [x] No RLS weakening  
- [x] typecheck / lint / build  

---

## Stop

Do not start BACKEND-010 or apply workspace DDL unless separately requested.
