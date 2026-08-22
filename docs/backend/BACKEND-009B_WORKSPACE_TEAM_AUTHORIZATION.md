# AUDIENT — BACKEND-009B
# WORKSPACE, TEAM MANAGEMENT & AUTHORIZATION

**Status:** Implemented — ready for controlled E2E  
**Depends on:** BACKEND-009A workspace foundation  
**Out of scope:** BACKEND-010, production email, SSO, Stripe/AI redesign, weakening RLS

---

## Roles (reuse 009A — do not invent MEMBER)

| DB / API role | UI | Notes |
|---------------|-----|--------|
| OWNER | owner | Protected seat; billing manage |
| ADMIN | admin | Invite / manage DESIGNER·ANALYST·VIEWER only |
| DESIGNER | designer | Create-capable seat (brief “MEMBER”) |
| ANALYST | analyst | Create-capable seat (brief “MEMBER”) |
| VIEWER | viewer | Read-only audits/reports |

---

## Migrations applied

1. `20260821100030_workspace_invitations.sql` — invitations + accept RPC  
2. `20260821100040_workspace_member_rls_harden.sql` — ADMIN cannot assign/manage ADMIN; OWNER seat protected on UPDATE/DELETE

---

## Server / APIs

- `src/services/workspace/permissions.ts` — invite/manage/billing rules + owner protection  
- `src/services/workspace/members.ts` — members, invitations, billing summary (authorize → service-role)  
- `/api/workspaces/**` — list, members, invitations, billing summary  
- Audits/reports: RLS `owns_audit` (not `user_id`-only)  
- Billing invoices remain payment-owner scoped  

## UI

- `/workspace` real APIs for non-`mock-*` sessions; mock path preserved  
- `/workspace/roles` remains reference matrix (mock)

## Verify

```bash
npm run verify:workspace-team
npm run verify:workspace-jwt   # live JWT RLS + invite accept (ephemeral users)
npm run typecheck && npm run lint && npm run build
```

## Stop

Do not start BACKEND-010.
