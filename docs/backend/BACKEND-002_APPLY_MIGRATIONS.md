# AUDIENT — BACKEND-002 APPLY  
# CORRECTIVE DATABASE MIGRATIONS

**Status:** Migrations authored in repo — **remote apply pending**  
**Date:** 2026-08-15  
**Depends on:** BACKEND-002 + BACKEND-002.1 (approved)  
**Out of scope:** Supabase Auth cutover, Stripe, AI worker, workspace DDL, mock→DB frontend wiring

---

## Migrations added (do not edit historical `2026073010*`)

| File | Purpose |
|------|---------|
| `20260815000011_guest_sessions.sql` | `guest_sessions` table + TTL indexes |
| `20260815000012_audits_guest_and_worker.sql` | Guest XOR ownership, worker/failure fields, retry link |
| `20260815000013_file_assets_guest.sql` | Guest asset ownership + `primary_asset_id` FK |
| `20260815000014_severity_remap.sql` | Severity → CRITICAL/HIGH/MEDIUM/LOW/INFO |
| `20260815000015_credits_adjustments.sql` | Defaults 300, `ADMIN_ADJUSTMENT`, `payment_id`, append-only triggers |
| `20260815000016_payments_invoice_fields.sql` | `invoice_url`, `paid_at`, etc. |
| `20260815000017_seed_plans_pricing_correction.sql` | FREE 300 / PRO 1000 / Business 10000 metered |
| `20260815000018_auth_trigger_grant_300.sql` | Auth provision fallback grant 300 |
| `20260815000019_rls_guest_and_updates.sql` | Deny guest_sessions to clients; tighten audits/assets RLS |

---

## Apply to your Supabase project

Automated remote apply was not run from this session (DB credentials stay local). Apply with one of:

```bash
# Option A — Supabase CLI (recommended)
npx supabase link --project-ref <your-project-ref>
npx supabase db push

# Option B — direct DB URL from Dashboard → Database settings
npx supabase db push --db-url "$DATABASE_URL"
```

Ensure `DATABASE_URL` / `DIRECT_URL` in `.env.local` points at the project (prefer direct host for DDL, not transaction pooler).

### Post-apply checks

```sql
SELECT key, display_name, monthly_credits, is_unlimited
FROM plans WHERE billing_interval = 'MONTHLY' AND deleted_at IS NULL;

SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE t.typname = 'severity' ORDER BY enumsortorder;

SELECT to_regclass('public.guest_sessions');
```

Also: `npm run verify:supabase`

---

## Local verification (already run)

| Check | Result |
|-------|--------|
| TypeScript | PASS |
| ESLint | PASS |
| Production build | PASS |
| `npm run verify:supabase` | PASS (Auth health) |
| `USE_MOCK_AUTH` | still `true` |

---

## Stop

After you apply + confirm SQL checks above: **STOP**.  
Do not start Auth migration, Stripe, AI worker, or workspace persistence until this apply is reviewed.
