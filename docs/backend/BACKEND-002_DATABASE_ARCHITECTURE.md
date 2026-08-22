# AUDIENT — BACKEND-002  
# DATABASE ARCHITECTURE & SCHEMA

**Status:** Approved (reconciled by BACKEND-002.1)  
**Approved on:** 2026-08-15  
**Last updated:** 2026-08-15  
**Phase rule:** Architecture approved. Apply only via versioned corrective migrations after an explicit apply-phase request. See `docs/backend/BACKEND-002.1_DATABASE_RECONCILIATION.md`.  
**Depends on:** BACKEND-001 (Supabase foundation — complete)  
**Does not include:** Stripe wiring, AI worker, Auth migration off mock, PDF generation, realtime.

---

## 0. Design principles

| Principle | Decision |
|-----------|----------|
| Auth identity | Supabase `auth.users` is the credential source. App identity is `public.users` linked by `auth_provider_id → auth.users.id`. |
| Profiles | **No separate `profiles` table for MVP.** Profile fields live on `public.users` (name, avatar_url, email). A 1:1 `profiles` view/table may be added later without changing Auth. |
| Plan codes | Schema enum `FREE` \| `PRO` \| `ENTERPRISE`. UI label for `ENTERPRISE` = **Business**. |
| Pricing source of truth | `docs/PRICING.md` + `src/config/plans.ts`. DB `plans` catalog must match (seed today is **out of date** — see §16). |
| Credits | Persisted balance + append-only ledger. Never trust the client for balance or tier. |
| Membership | Persisted server-side. Client cannot set tier. |
| Audit history | Derived from `audits` (+ reports/findings). Not from frontend mock catalogs. |
| Workspaces / RBAC | **Designed below; deferred from MVP apply** (aligns with `BR-ENT-003` / BM-02). Frontend workspace screens stay mock until a later backend phase. |
| Invoices | Prefer Stripe as payment SoT. Persist **`payments`** (and optional `invoices` facade later). MVP uses `payments` with `stripe_invoice_id`. |
| Migrations | All DDL via versioned `supabase/migrations/*`. No hand-created production tables. |
| Mock frontend | `USE_MOCK_AUTH=true` remains until a later auth phase. Schema introduction must not require flipping mock auth. |

---

## 1. Existing migration inventory (already in repo)

Versioned under `supabase/migrations/` (not yet treated as “reviewed production truth”):

| Migration | Contents |
|-----------|----------|
| `…000_extensions_enums.sql` | Enums, `pgcrypto` |
| `…001_functions.sql` | `set_updated_at()` |
| `…002_identity_plans.sql` | `plans`, `users`, `memberships`, `settings` |
| `…003_credits.sql` | `credits`, `credit_transactions` |
| `…004_product.sql` | `audits`, `reports`, `recommendations`, `file_assets` |
| `…005_billing_engagement.sql` | `payments`, `notifications`, `processed_webhook_events`, `activity_log`, `report_feedback` |
| `…006_indexes.sql` | Hot-path indexes |
| `…007_triggers.sql` | `updated_at` triggers |
| `…008_seed_plans.sql` | Plan seed (**must be corrected to PRICING**) |
| `…009_rls_policies.sql` | RLS |
| `…010_auth_user_sync.sql` | Provision on `auth.users` insert |

**BACKEND-002 outcome:** lock the architecture below, then a follow-up apply phase corrects seed + any approved renames/additions via **new** migrations (never edit applied history casually).

---

## 2. Naming map (prompt → adopted)

| Prompt name | Adopted table | Notes |
|-------------|----------------|-------|
| profiles | *(columns on `users`)* | Avoid duplicating Auth; optional future split |
| plans | `plans` | Catalog |
| memberships | `memberships` | Active membership 1:1 user |
| credit_accounts | `credits` | Keep existing name |
| credit_transactions | `credit_transactions` | Append-only |
| audits | `audits` | |
| audit_findings | `recommendations` *(MVP)* or alias `audit_findings` | Findings attach via report today; see §5 |
| audit_reports | `reports` | |
| notifications | `notifications` | |
| invoices | `payments` (+ optional `invoices` later) | Stripe invoice id on payments |
| workspaces… | Designed §7 — **defer apply** | |

---

## 3. Enumerations (target)

### 3.1 Identity & membership

| Enum | Values |
|------|--------|
| `user_role` | `USER`, `ADMIN` (platform admin — not workspace roles) |
| `user_status` | `ACTIVE`, `SUSPENDED`, `DELETED` |
| `tier` | `FREE`, `PRO`, `ENTERPRISE` (= Business) |
| `membership_status` | `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED` |
| `billing_interval` | `MONTHLY`, `YEARLY` |

### 3.2 Credits

| Enum | Values | Prompt equivalent |
|------|--------|-------------------|
| `credit_txn_type` | `MONTHLY_GRANT`, `TOPUP`, `AUDIT_DEDUCTION`, `REFUND`, **`ADMIN_ADJUSTMENT`** *(add)* | PLAN_ALLOCATION → MONTHLY_GRANT; AUDIT_USAGE → AUDIT_DEDUCTION; TOP_UP → TOPUP |

### 3.3 Audits

| Enum | Values |
|------|--------|
| `audit_input_type` | `SCREENSHOT`, `URL` (maps to IMAGE / URL in product copy) |
| `audit_status` | `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `issue_category` | UX dimensions (NAVIGATION, CTA, …) — keep catalog stable |
| `severity` | **Target for product UX:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`. *Current migration uses `CRITICAL`/`MAJOR`/`MINOR` — migrate/align in apply phase.* |
| `recommendation_priority` | `HIGH`, `MEDIUM`, `LOW` |

### 3.4 Billing & notifications

| Enum | Values |
|------|--------|
| `payment_type` | `SUBSCRIPTION`, `CREDIT_TOPUP`, `REFUND` |
| `payment_status` | `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED` |
| `notification_type` | `AUDIT_COMPLETE`, `AUDIT_FAILED`, `LOW_CREDITS`, `SUBSCRIPTION_EXPIRING`, `PAYMENT_SUCCEEDED`, `SYSTEM` |

---

## 4. Core entities (MVP)

### 4.1 `auth.users` (Supabase-managed)

- Source of authentication identity and credentials.  
- **Do not** store passwords in `public`.  
- App tables reference Auth via `users.auth_provider_id`.

### 4.2 `public.users` (app profile + identity)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | App user id (internal FK target) |
| `auth_provider_id` | UUID UNIQUE | NO | → `auth.users.id` ON DELETE CASCADE |
| `email` | TEXT | NO | Synced from Auth; unique among active rows |
| `name` | TEXT | YES | Display name |
| `avatar_url` | TEXT | YES | |
| `role` | `user_role` | NO | Default `USER` |
| `email_verified` | BOOLEAN | NO | |
| `status` | `user_status` | NO | Default `ACTIVE` |
| `last_login_at` | TIMESTAMPTZ | YES | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | Soft delete |

**Unique:** `auth_provider_id`; active email (`lower(email)` where `deleted_at IS NULL`).

**RLS:** user reads/updates **own** row (`auth_provider_id = auth.uid()`). Writes that escalate `role` denied for clients.

### 4.3 `public.plans`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `key` | `tier` | NO | FREE / PRO / ENTERPRISE |
| `display_name` | TEXT | NO | Free / Pro / Business |
| `description` | TEXT | YES | |
| `price_cents` | INT ≥ 0 | NO | Monthly list for this interval row |
| `currency` | TEXT(3) | NO | Default `usd` |
| `billing_interval` | `billing_interval` | NO | |
| `monthly_credits` | INT ≥ 0 | NO | Grant size |
| `is_unlimited` | BOOLEAN | NO | **Must be false** for all tiers per PRICING |
| `screenshot_cost` | INT ≥ 0 | NO | |
| `url_cost` | INT ≥ 0 | NO | 0 = disabled for Free |
| `features` | JSONB | NO | Feature flags |
| `stripe_price_id` | TEXT | YES | Filled when Stripe wired |
| `is_active` | BOOLEAN | NO | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

**Unique:** `(key, billing_interval)`.

**Required seed (authoritative):**

| key | display | monthly_credits | price_cents | screenshot | url | unlimited |
|-----|---------|-----------------|-------------|------------|-----|-----------|
| FREE | Free | **300** | 0 | 150 | 0 | false |
| PRO | Pro | **1000** | 2900 | 100 | 400 | false |
| ENTERPRISE | Business | **10000** | 9900 | 50 | 100 | false |

**RLS:** public/authenticated **SELECT** active plans; no client writes.

### 4.4 `public.memberships`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID UNIQUE | NO | → users; one **active** membership row MVP |
| `tier` | `tier` | NO | Denormalized for fast gates (must match plan) |
| `plan_id` | UUID | YES | → plans |
| `status` | `membership_status` | NO | |
| `billing_interval` | `billing_interval` | NO | |
| `stripe_customer_id` | TEXT | YES | Unique when set |
| `stripe_subscription_id` | TEXT | YES | Unique when set |
| `current_period_end` | TIMESTAMPTZ | YES | ≈ expires_at |
| `canceled_at` | TIMESTAMPTZ | YES | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

**Future membership history:** add `membership_events` (append-only: `user_id`, `from_tier`, `to_tier`, `reason`, `stripe_event_id`, `created_at`) in a later migration — do not overwrite history on the live row.

**RLS:** SELECT own; **all writes service_role only**.

### 4.5 `public.credits` (credit account)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID UNIQUE | NO | One account per user |
| `plan_credits` | INT ≥ 0 | NO | Remaining from plan grant |
| `purchased_credits` | INT ≥ 0 | NO | Top-ups |
| `balance` | INT generated | NO | `plan_credits + purchased_credits` |
| `is_unlimited` | BOOLEAN | NO | Always false under current PRICING |
| `updated_at` | TIMESTAMPTZ | NO | |

**RLS:** SELECT own; writes **service_role only**.

### 4.6 `public.credit_transactions` (immutable ledger)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID | NO | → users |
| `amount` | INT | NO | Signed: +grant / −usage |
| `transaction_type` | `credit_txn_type` | NO | |
| `balance_after` | INT | YES | Snapshot for auditability |
| `audit_id` | UUID | YES | → audits when usage |
| `payment_id` | UUID | YES | → payments when top-up *(add if missing)* |
| `description` | TEXT | YES | |
| `metadata` | JSONB | YES | Extensibility |
| `created_at` | TIMESTAMPTZ | NO | No `updated_at` |

**Rules:** no UPDATE/DELETE for clients; prefer DB trigger `RAISE` on update/delete for defense in depth.

**RLS:** SELECT own; writes service_role only.

### 4.7 `public.settings` (keep)

User preferences (theme, pdf format, emails). 1:1 with user. Not listed in the prompt but required by existing product screens.

---

## 5. Audit domain

### 5.1 Lifecycle

```
Create audit (QUEUED)
    → worker claims (PROCESSING)
        → success: COMPLETED + report + findings + credit deduction ledger
        → failure: FAILED + failure_code + optional credit refund ledger
```

Statuses: `QUEUED` → `PROCESSING` → `COMPLETED` | `FAILED` (no skip).  
History lists come from `audits` filtered by `user_id` + status + `created_at`.

### 5.2 `public.audits`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID | YES | Null only for constrained guest path if ever persisted |
| `input_type` | `audit_input_type` | NO | SCREENSHOT / URL |
| `source_url` | TEXT | YES | Required when URL |
| `status` | `audit_status` | NO | |
| `score` | NUMERIC | YES | Overall when completed |
| `failure_code` | TEXT | YES | When FAILED |
| `started_at` | TIMESTAMPTZ | YES | |
| `completed_at` | TIMESTAMPTZ | YES | |
| `failed_at` | TIMESTAMPTZ | YES | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | Soft delete |

**Indexes:** `(user_id, created_at DESC)`, `(status)`, `(user_id, status)`.

**RLS:** own-row CRUD (soft-delete preferred over hard delete).

### 5.3 `public.reports` (audit_reports)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `audit_id` | UUID UNIQUE | NO | 1:1 with audit |
| `overall_score` | NUMERIC | YES | |
| `report_json` | JSONB | YES | Structured payload |
| `pdf_url` | TEXT | YES | Storage path/URL later |
| `generated_at` | TIMESTAMPTZ | YES | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |

**RLS:** via ownership of parent audit.

### 5.4 Findings — `public.recommendations` (MVP name)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `report_id` | UUID | NO | → reports (current) |
| `category` | `issue_category` | NO | |
| `severity` | severity enum | NO | Align to product set on apply |
| `title` | TEXT | NO | |
| `description` | TEXT | YES | |
| `recommendation` | TEXT | YES | |
| `evidence` | JSONB | YES | Screenshots/selectors |
| `score_impact` | NUMERIC | YES | |
| `priority` | `recommendation_priority` | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

**Relationship choice (MVP):** `audit → report → recommendations`.  
Optional later: denormalize `audit_id` on findings for simpler queries.

**RLS:** via report → audit ownership.

### 5.5 `public.file_assets`

Storage inventory for screenshots/PDFs. Keep for Storage integration phase.

---

## 6. Notifications & billing

### 6.1 `public.notifications`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID | NO | |
| `type` | `notification_type` | NO | |
| `title` | TEXT | NO | |
| `message` | TEXT | NO | |
| `is_read` | BOOLEAN | NO | Default false |
| `action_url` | TEXT | YES | Deep link |
| `created_at` | TIMESTAMPTZ | NO | |
| `read_at` | TIMESTAMPTZ | YES | |

**Indexes:** `(user_id, created_at DESC)`, `(user_id, is_read)` where unread.

**RLS:** SELECT/UPDATE/DELETE own; **INSERT service_role** (or trusted server). Delivery (email/push) is separate from this table.

### 6.2 `public.payments` (invoice-capable trail)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | UUID PK | NO | |
| `user_id` | UUID | NO | |
| `type` | `payment_type` | NO | |
| `status` | `payment_status` | NO | |
| `amount_cents` | INT | NO | |
| `currency` | TEXT | NO | |
| `stripe_payment_intent_id` | TEXT | YES | |
| `stripe_invoice_id` | TEXT | YES | External invoice id |
| `invoice_url` | TEXT | YES | Hosted invoice / PDF link |
| `description` | TEXT | YES | |
| `paid_at` | TIMESTAMPTZ | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

**RLS:** SELECT own; writes service_role (webhooks).

**Optional later `invoices` table:** thin projection of Stripe invoices if product needs richer line items; not required for MVP if UI reads `payments`.

### 6.3 Supporting tables (keep)

| Table | Purpose |
|-------|---------|
| `processed_webhook_events` | Stripe idempotency |
| `activity_log` | Security / audit trail |
| `report_feedback` | User ratings on reports |

---

## 7. Business workspace model (designed — defer apply)

> Aligns with product screens (workspace, roles) but **BM-02 / BR-ENT-003 defer org tables**. Include in architecture so ENTERPRISE/Business can grow without redesign.

### 7.1 `workspaces`

| Column | Notes |
|--------|-------|
| `id` UUID PK | |
| `name` TEXT NOT NULL | |
| `owner_id` UUID → users | |
| `created_at` / `updated_at` | |

### 7.2 `workspace_members`

| Column | Notes |
|--------|-------|
| `id` UUID PK | |
| `workspace_id` → workspaces | |
| `user_id` → users | |
| `role_id` → roles | |
| `joined_at`, `created_at` | |
| UNIQUE `(workspace_id, user_id)` | |

### 7.3 `roles` (workspace-scoped)

| Column | Notes |
|--------|-------|
| `id` UUID PK | |
| `workspace_id` → workspaces (NULL = system template) | |
| `name`, `description` | |
| `created_at` | |

### 7.4 `permissions` + `role_permissions`

| `permissions` | `id`, `code` UNIQUE, `name`, `description` |
| `role_permissions` | PK `(role_id, permission_id)` |

**RLS sketch:** members see workspace data; mutations gated by permission codes evaluated server-side (and optionally via SECURITY DEFINER helpers). Never frontend-only.

**Apply timing:** BACKEND-00x after personal MVP (auth, audits, credits, Stripe) is stable.

---

## 8. Relationship diagram

```
auth.users
    └── public.users (auth_provider_id)
            ├── memberships ──► plans
            ├── credits
            │       └── credit_transactions
            ├── settings
            ├── audits
            │       └── reports
            │               └── recommendations (findings)
            ├── notifications
            ├── payments
            ├── file_assets
            └── (future) workspace_members ──► workspaces
                                                    └── roles ──► role_permissions ──► permissions
```

**FK summary (MVP):**

| Child | Parent | On delete |
|-------|--------|-----------|
| users.auth_provider_id | auth.users.id | CASCADE |
| memberships.user_id | users.id | CASCADE |
| memberships.plan_id | plans.id | SET NULL |
| credits.user_id | users.id | CASCADE |
| credit_transactions.user_id | users.id | CASCADE |
| credit_transactions.audit_id | audits.id | SET NULL |
| audits.user_id | users.id | CASCADE / SET NULL (guest policy TBD) |
| reports.audit_id | audits.id | CASCADE |
| recommendations.report_id | reports.id | CASCADE |
| notifications.user_id | users.id | CASCADE |
| payments.user_id | users.id | CASCADE / SET NULL |

---

## 9. Row Level Security (requirements)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| plans | Active catalog (anon + auth) | deny | deny | deny |
| users | own | own (constrained) | own (no role escalate) | soft-delete own |
| settings | own | own | own | own |
| memberships | own | **deny** | **deny** | **deny** |
| credits | own | **deny** | **deny** | **deny** |
| credit_transactions | own | **deny** | **deny** | **deny** |
| audits | own | own | own | own (soft) |
| reports | via audit ownership | via ownership / service | via ownership | via ownership |
| recommendations | via report ownership | service / ownership | … | … |
| notifications | own | **deny** (server) | own (read flags) | own |
| payments | own | **deny** | **deny** | **deny** |
| processed_webhook_events | deny | deny | deny | deny |
| activity_log | own or deny | deny | deny | deny |

**Helpers (existing pattern):** `current_user_id()`, `owns_audit()`, `owns_report()` — `SECURITY DEFINER`, fixed `search_path`.

**Identity rule:** `public.users.auth_provider_id = auth.uid()` → resolve app `users.id`. Do **not** assume `users.id = auth.uid()`.

`service_role` bypasses RLS for workers/webhooks only (server-side).

---

## 10. Indexes (required)

| Index | Purpose |
|-------|---------|
| `users (auth_provider_id)` UNIQUE | Auth join |
| `users (lower(email))` WHERE active | Lookup |
| `memberships (user_id)` UNIQUE | Fast tier |
| `credits (user_id)` UNIQUE | Wallet |
| `credit_transactions (user_id, created_at DESC)` | Ledger history |
| `audits (user_id, created_at DESC)` | History |
| `audits (status)` | Worker queues |
| `audits (user_id, status)` | Filtered history |
| `notifications (user_id, created_at DESC)` | Feed |
| `notifications (user_id) WHERE NOT is_read` | Badge |
| `payments (user_id, created_at DESC)` | Billing history |
| `payments (stripe_invoice_id)` WHERE NOT NULL | Idempotency |
| Future: `workspace_members (workspace_id)`, `(user_id)` | Team |

Avoid duplicate indexes already covered by UNIQUE constraints.

---

## 11. Credit lifecycle

```
Signup / period start
  → service: set plan_credits = plans.monthly_credits
  → ledger: MONTHLY_GRANT (+)

Top-up (Stripe success — later)
  → service: purchased_credits += pack
  → ledger: TOPUP (+)

Start audit
  → service: verify balance ≥ cost (from plans costs)
  → optionally reserve / deduct AUDIT_DEDUCTION (−)
  → on FAILED: optional REFUND (+)

Admin correction
  → ledger: ADMIN_ADJUSTMENT (±)
```

**Balance of truth:** `credits` row updated only in the same transaction as the ledger insert (server/RPC). Frontend mock balances remain until APIs exist.

---

## 12. Membership lifecycle

```
Auth user created
  → users row + memberships(FREE, ACTIVE) + credits + settings
  → MONTHLY_GRANT for Free

Checkout success (later Stripe)
  → service updates memberships.tier / plan_id / Stripe ids / period_end
  → optional membership_events row
  → credit grant for new plan

Cancel / past_due
  → status transitions only via service/webhooks
```

Client never PATCHes `tier`.

---

## 13. Security

| Rule | Enforcement |
|------|-------------|
| No service-role in browser | `NEXT_PUBLIC_` only URL + anon |
| No DB password in client | Server / CI secrets only |
| Privileged writes | `service_role` or SECURITY DEFINER RPCs |
| Soft delete | Prefer `deleted_at` + status |
| Webhook idempotency | `processed_webhook_events` |

---

## 14. Migration strategy (after review)

1. **Review & approve** this document.  
2. **Do not** hand-edit production in Dashboard.  
3. Add **new** migrations for:  
   - Correct plan seed to PRICING (300 / 1000 / 10000, Business display, `is_unlimited=false`)  
   - Auth trigger Free grant = 300  
   - Severity / `ADMIN_ADJUSTMENT` enum alignment if approved  
   - Optional `payment_id` on ledger  
4. Apply with Supabase CLI / linked project.  
5. Generate TypeScript `Database` types.  
6. Keep `USE_MOCK_AUTH=true` until Auth backend phase.  
7. Workspace DDL = separate approved phase.

---

## 15. Success criteria checklist (design)

- [x] Entities defined (MVP + deferred workspace)  
- [x] Relationships / FKs documented  
- [x] PKs, nullability, uniques documented  
- [x] RLS requirements documented  
- [x] Indexes identified  
- [x] Audit / credit / membership lifecycles defined  
- [x] Business workspace model defined (deferred apply)  
- [x] Migration approach defined  
- [ ] **Tables created** — blocked until review approval  

---

## 16. Known conflicts to resolve on apply

| Item | Current migration | Target |
|------|-------------------|--------|
| Free credits | Seed **200** | **300** |
| Pro credits | Seed **2000** | **1000** |
| Enterprise | Unlimited / 0 grant / name “Enterprise” | **10000** metered / display **Business** |
| Auth trigger fallback grant | 200 | 300 |
| Severity enum | CRITICAL/MAJOR/MINOR | Align to product CRITICAL/HIGH/MEDIUM/LOW/INFO *(decide on apply)* |
| Findings table name | `recommendations` | Keep MVP name; document as findings |
| Invoices table | Missing | Use `payments`; optional later |
| Workspaces | Missing | Designed; defer |

---

## 17. Out of scope (do not implement in this phase)

- Stripe / webhooks / Checkout Session creation  
- AI audit worker  
- Disabling mock auth / real OAuth  
- PDF generation pipeline  
- Realtime subscriptions  
- Creating or applying tables before review sign-off  

---

## 18. Recommended next step after approval

1. Stakeholder review of §§3–12 and conflict table §16.  
2. BACKEND-002 **apply** task: corrective migrations + seed fix only (no Auth cutover).  
3. Then BACKEND-003: Auth migration (when ready).  

**Stop here — awaiting schema review.**
