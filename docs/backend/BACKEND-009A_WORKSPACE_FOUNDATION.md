# AUDIENT — BACKEND-009A
# WORKSPACE FOUNDATION

**Status:** Implemented (schema + RLS + server helpers)  
**Depends on:** BACKEND-009 personal authz hardening  
**Out of scope:** Invitations, workspace UI, payment/notification RLS changes, BACKEND-009B, BACKEND-010

---

## What landed

- Enums: `workspace_member_role`, `workspace_member_status`
- Tables: `workspaces`, `workspace_members`
- Idempotent `ensure_personal_workspace(user_id)` + trigger on `users` insert
- Backfill: every existing user → personal workspace + OWNER seat
- `audits.workspace_id` backfilled from audit owner’s personal workspace
- Audit RLS: member SELECT; create roles OWNER/ADMIN/DESIGNER/ANALYST; mutate OWNER/ADMIN or creator
- Server helpers: `src/services/workspace/membership.ts`
- Audit create sets `workspace_id` (personal default; optional verified client id)

Payments / credits / notifications RLS **unchanged**.

---

## Apply

```bash
npx supabase db push --db-url "$DIRECT_URL"
# or your project’s usual migration apply path
npm run verify:workspace
```

---

## Stop

Do not start BACKEND-009B / BACKEND-010 until controlled E2E of this foundation passes.
