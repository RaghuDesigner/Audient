# AUDIENT — BACKEND-005
# REAL AUDIT BACKEND

**Status:** Superseded for processing by BACKEND-006 (AI worker). Create/authorize/poll/report APIs remain.  
**Depends on:** BACKEND-003, BACKEND-004  
**Out of scope (this phase):** OpenAI (see BACKEND-006), Stripe, Business workspace, production deployment

---

## Objective

Replace the frontend-only mock audit lifecycle with a Supabase-backed create → authorize → track → complete/fail → retrieve flow. AI analysis remains a later phase.

---

## Architecture

```
POST /api/audits
  → auth.getUser() (never trust client user_id)
  → loadAccountSnapshot (membership + plan + credits)
  → permission + cost from plan (not client)
  → insert audits (QUEUED)
  → service-role credit deduct + ledger AUDIT_DEDUCTION
  → schedule lifecycle stub (no AI)

GET /api/audits/[id]     status poll (ownership RLS)
GET /api/audits          history
GET /api/audits/[id]/report   report foundation (1:1)
POST /api/audits/[id]/retry   failed → new QUEUED + re-charge
```

| Path | Role |
|------|------|
| `src/services/audit/*` | Create, claim, complete, fail, list, retry |
| `src/services/credits/mutate.ts` | Deduct / refund (service role) |
| `src/services/report/foundation.ts` | Placeholder report (unique `audit_id`) |
| `src/services/audit/stub-processor.ts` | QUEUED→PROCESSING→COMPLETED/FAILED without AI |

---

## Frontend

| Surface | Behavior |
|---------|----------|
| Audit entry | Real Supabase session → `POST /api/audits`; `mock-*` auth → mock id path |
| Processing | UUID → poll status; `mock-*` → timer |
| History / dashboard recent | Real API list; mock catalog for mock auth |
| Report UI | Unchanged mock presentation; API foundation available |

`USE_MOCK_AUTH` remains `true`. Mock GO path stays available.

---

## Credits

- Cost from DB plan / account limits (never client).
- Deduct/refund via **server-only** service role (`SUPABASE_SERVICE_ROLE_KEY`) because RLS denies JWT writes to `credits` / `credit_transactions`.
- Lifecycle claim/complete/fail/report rows use the **authenticated** server Supabase client (RLS).
- Never use `NEXT_PUBLIC_` for the service-role key.
- Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (gitignored). Do not commit or paste secrets.

---

## Security

- RLS enabled; users only see own audits/reports.
- No client-supplied user_id, tier, balance, cost, or status.
- Service role only on server for credit mutations.

---

## Lifecycle stub (historical)

BACKEND-005 used `scheduleAuditLifecycleStub` for QUEUED→PROCESSING→COMPLETED without AI.

**BACKEND-006** replaces scheduling with `scheduleAiAuditProcessor`. The stub file remains for reference only.
