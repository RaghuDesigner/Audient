# Audient — Database Migration Guide

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** `DATABASE.md` · `SCHEMA.md` · `PRICING.md` · `SECURITY.md` · `DEPLOYMENT.md` · `DEVELOPER_GUIDELINES.md` · `BUSINESS_RULES.md`

**Audience:** Backend · Data · DevOps  
**Format:** Markdown only — **no SQL / application code** in this document (describe migrations; implement via Prisma Migrate + `supabase/migrations` for RLS).

**Engine:** PostgreSQL (Supabase) · **ORM:** Prisma · **Auth bridge:** Supabase `auth.users` → app `Users`

**Authoritative plan credits:** Free **300** / Pro **1,000** / Business (`ENTERPRISE`) **10,000** per `PRICING.md` (overrides older SCHEMA examples of Free 200).

**Naming:** SCHEMA **Recommendations** = DATABASE “Audit Issues” (findings). Prefer table name `Recommendations` (FK → `Reports`).

---

## 1. Goals

| Goal | Practice |
|------|----------|
| Safe evolves | Versioned migrations only; never hand-edit prod |
| Zero/low downtime | Expand → migrate → contract |
| Integrity | FKs, CHECKs, enums, unique keys |
| Isolation | RLS on every user-owned table |
| Billing safety | Idempotent webhook table before granting credits |
| Erasure | Cascades + FileAssets inventory for storage purge |

---

## 2. Migration Order

Apply in this **sequence**. Each step is one or more migration files (`prisma/migrations` and/or `supabase/migrations`).

| Step | Migration | Contents |
|------|-----------|----------|
| **M00** | Extensions & helpers | `pgcrypto` / `uuid-ossp` if needed; shared `updated_at` trigger function |
| **M01** | Enums | All Postgres enums (see §4) |
| **M02** | Identity core | `Users` |
| **M03** | One-to-one satellites | `Memberships`, `Credits`, `Settings` |
| **M04** | Plan catalog (recommended) | `Plans` |
| **M05** | Product core | `Audits` |
| **M06** | Reports & findings | `Reports`, `Recommendations` |
| **M07** | Metering ledger | `CreditTransactions` |
| **M08** | Billing | `Payments` |
| **M09** | Engagement | `Notifications` |
| **M10** | Files | `FileAssets` |
| **M11** | Feedback | `ReportFeedback` |
| **M12** | Webhook idempotency | `ProcessedWebhookEvents` |
| **M13** | Security trail | `ActivityLog` |
| **M14** | Indexes | All non-PK indexes (§5) — may be co-located with tables |
| **M15** | RLS policies | Enable RLS + policies using `auth.uid()` (§7) |
| **M16** | Auth seed trigger | On `auth.users` insert → seed app rows (§8) |
| **M17** | Seed data | `Plans` rows + optional admin (§9) |

**Later / conditional (do not block MVP):** `Organizations`, `OrganizationMembers`, `ApiKeys` (DATABASE.md §8.6).

### Runtime apply order (environments)

```text
1. Backup / PITR check (prod)
2. prisma migrate deploy  (or supabase db push / migration up)
3. Verify RLS enabled
4. Deploy app + workers compatible with schema
```

See `DEPLOYMENT.md` § Database Migration.

---

## 3. Table Creation Order

Create tables only after their FK parents exist.

```text
Users
├── Memberships          (userId UNIQUE)
├── Credits              (userId UNIQUE)
├── Settings             (userId UNIQUE)
├── Audits               (userId)
│   └── Reports          (auditId UNIQUE)
│       ├── Recommendations (reportId)
│       └── ReportFeedback  (reportId, userId)
├── CreditTransactions   (creditsId → Credits; optional auditId)
├── Payments             (userId)
├── Notifications        (userId)
└── FileAssets           (userId; optional auditId/reportId)

Plans                    (no FK required; Memberships.tier aligns by enum/key)
ProcessedWebhookEvents   (standalone)
ActivityLog              (optional userId FK SET NULL on delete)
```

| # | Table | Depends on |
|---|-------|------------|
| 1 | `Users` | — |
| 2 | `Memberships` | Users |
| 3 | `Credits` | Users |
| 4 | `Settings` | Users |
| 5 | `Plans` | — |
| 6 | `Audits` | Users |
| 7 | `Reports` | Audits |
| 8 | `Recommendations` | Reports |
| 9 | `CreditTransactions` | Credits (+ optional Audits) |
| 10 | `Payments` | Users |
| 11 | `Notifications` | Users |
| 12 | `FileAssets` | Users (+ optional Audits/Reports) |
| 13 | `ReportFeedback` | Users, Reports |
| 14 | `ProcessedWebhookEvents` | — |
| 15 | `ActivityLog` | Users (nullable) |

---

## 4. Enums (create before tables)

| Enum | Values |
|------|--------|
| `UserRole` | `USER`, `ADMIN` |
| `UserStatus` | `ACTIVE`, `SUSPENDED`, `DELETED` |
| `MembershipTier` | `FREE`, `PRO`, `ENTERPRISE` |
| `MembershipStatus` | `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED` |
| `AuditStatus` | `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `AuditInputType` | `URL`, `SCREENSHOT` *(add if not only inferred)* |
| `UxCategory` | `NAVIGATION`, `CTA`, `VISUAL_HIERARCHY`, `MOBILE_RESPONSIVENESS`, `COPY_MESSAGING`, `TRUST_SIGNALS`, `PAGE_SPEED`, `ACCESSIBILITY`, `CONVERSION_FLOW` |
| `Severity` | `CRITICAL`, `MAJOR`, `MINOR` |
| `Priority` | `HIGH`, `MEDIUM`, `LOW` |
| `PaymentStatus` | `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED` |
| `PaymentType` | `SUBSCRIPTION`, `CREDIT_TOPUP`, `REFUND` |
| `CreditTxnType` | `MONTHLY_GRANT`, `AUDIT_DEDUCTION`, `REFUND`, `TOPUP`, `ADJUSTMENT` |
| `NotificationType` | `AUDIT_COMPLETE`, `AUDIT_FAILED`, `LOW_CREDITS`, `SUBSCRIPTION_EXPIRING`, `PAYMENT_SUCCEEDED`, `SYSTEM` |
| `Theme` | `LIGHT`, `DARK`, `SYSTEM` |
| `PdfFormat` | `A4`, `LETTER` |
| `FileAssetType` | `SCREENSHOT`, `ANNOTATION`, `PDF`, `AVATAR` |
| `WebhookProcessStatus` | `RECEIVED`, `PROCESSED`, `FAILED` |

Changing enum values later requires a dedicated migration (prefer expand with new value → backfill → optional rename).

---

## 5. Indexes

### 5.1 Primary & unique

| Table | Constraint |
|-------|------------|
| All | `PRIMARY KEY (id)` |
| Users | `UNIQUE (email)`, `UNIQUE (authProviderId)` |
| Memberships | `UNIQUE (userId)`, `UNIQUE (stripeCustomerId)` where not null, `UNIQUE (stripeSubscriptionId)` where not null |
| Credits | `UNIQUE (userId)` |
| Settings | `UNIQUE (userId)` |
| Reports | `UNIQUE (auditId)` |
| Payments | `UNIQUE (stripePaymentIntentId)` where not null, `UNIQUE (stripeInvoiceId)` where not null |
| ProcessedWebhookEvents | `UNIQUE (stripeEventId)` |
| Plans | `UNIQUE (tier)` / `UNIQUE (key)` |

### 5.2 Foreign-key indexes

Index every FK column: `Memberships.userId`, `Credits.userId`, `Settings.userId`, `Audits.userId`, `Reports.auditId`, `Recommendations.reportId`, `CreditTransactions.creditsId`, `CreditTransactions.auditId`, `Payments.userId`, `Notifications.userId`, `FileAssets.userId`, `FileAssets.auditId`, `ReportFeedback.reportId`, `ReportFeedback.userId`, `ActivityLog.userId`.

### 5.3 Query-pattern indexes (DATABASE.md §6 / §9)

| Index | Purpose |
|-------|---------|
| `Audits (userId, createdAt DESC)` | History list |
| `Audits (status)` **partial** where `status IN ('QUEUED','PROCESSING')` | Worker pickup |
| `Recommendations (reportId, severity)` | Report critical-first |
| `Recommendations (reportId, priority)` | Ordered fixes |
| `Notifications (userId, read, createdAt DESC)` | Unread feed |
| `CreditTransactions (creditsId, createdAt DESC)` | Ledger |
| `Payments (userId, createdAt DESC)` | Billing history |
| `FileAssets (userId, type)` | GDPR purge / inventory |
| `ActivityLog (createdAt DESC)` | Security review |
| `ActivityLog (userId, createdAt DESC)` | Per-user trail |

Do not over-index write-heavy paths; revisit with production `EXPLAIN`.

---

## 6. Foreign Keys

| Child | Column | Parent | On delete |
|-------|--------|--------|-----------|
| Memberships | userId | Users.id | **CASCADE** |
| Credits | userId | Users.id | **CASCADE** |
| Settings | userId | Users.id | **CASCADE** |
| Audits | userId | Users.id | **CASCADE** |
| Reports | auditId | Audits.id | **CASCADE** |
| Recommendations | reportId | Reports.id | **CASCADE** |
| CreditTransactions | creditsId | Credits.id | **CASCADE** |
| CreditTransactions | auditId | Audits.id | **SET NULL** (keep ledger if audit deleted) *or* CASCADE if product prefers hard purge — **recommend SET NULL** for financial auditability |
| Payments | userId | Users.id | **SET NULL** or anonymize column on GDPR (prefer **anonymize userId** / retain row — see BR-SEC-006); if hard FK, use SET NULL + `userId` nullable after erasure |
| Notifications | userId | Users.id | **CASCADE** |
| FileAssets | userId | Users.id | **CASCADE** (app must delete storage objects) |
| FileAssets | auditId | Audits.id | **SET NULL** or CASCADE with audit |
| ReportFeedback | reportId | Reports.id | **CASCADE** |
| ReportFeedback | userId | Users.id | **CASCADE** |
| ActivityLog | userId | Users.id | **SET NULL** |

**Rule:** Deleting a **User** removes product data; **Payments** retained/anonymized for financial retention (`API` Delete Account / BR-SEC-006).

---

## 7. Constraints

### 7.1 CHECK constraints

| Table | Constraint |
|-------|------------|
| Credits | `balance >= 0` |
| Credits | `monthlyGrant >= 0` |
| Credits | `lifetimeUsed >= 0` |
| Audits | scores null **or** between 0 and 100 (`overallScore`, `accessibilityScore`, `conversionScore`, `mobileScore`) |
| Reports | `overallScore` between 0 and 100 |
| Payments | `amount >= 0` (refunds as separate rows / signed policy documented) |
| Recommendations | — enums enforce severity/priority/category |
| CreditTransactions | `amount <> 0` **or** allow 0 for unlimited usage markers |

### 7.2 NOT NULL

Per SCHEMA required fields: ids, FKs where required, enums with defaults, timestamps (`createdAt`/`updatedAt` where specified).

### 7.3 Application + DB

- Server still validates with Zod; DB CHECKs are defense-in-depth.  
- `websiteUrl` nullable for pure screenshot audits (SCHEMA note); enforce XOR at app: URL **or** screenshot keys via `FileAssets` / `inputType`.

---

## 8. Triggers

| Trigger | When | Behaviour |
|---------|------|-----------|
| `set_updated_at` | BEFORE UPDATE on tables with `updatedAt` | Set `updatedAt = now()` |
| `on_auth_user_created` | AFTER INSERT on `auth.users` | Insert `Users` (+ link `authProviderId` / `id` = `auth.uid()`), `Memberships` (FREE, ACTIVE), `Credits` (balance=**300**, monthlyGrant=**300**, isUnlimited=false), `Settings` (defaults) — **atomic** |
| Optional `prevent_credit_txn_update` | BEFORE UPDATE/DELETE on `CreditTransactions` | Raise exception (append-only) |
| Optional `prevent_payment_mutation` | BEFORE UPDATE of immutable payment fields | Restrict except status transitions via service role |

**RLS note:** Auth trigger and workers use **service role** (bypasses RLS). Never expose service role to the browser.

### RLS (enable after tables)

For every table with `userId` (and Reports/Recommendations via join ownership):

- `SELECT` / `UPDATE` / `DELETE`: `userId = auth.uid()` (or ownership through audit → user).  
- `INSERT`: `userId = auth.uid()`.  
- `ProcessedWebhookEvents`, `Plans`: no end-user access (service role only).  
- `ActivityLog`: insert service-only; users may read own rows if product requires.

---

## 9. Rollback Strategy

| Situation | Strategy |
|-----------|----------|
| **Dev** | `migrate reset` / drop local DB; recreate |
| **Preview/Staging** | Restore snapshot or reset project; re-migrate |
| **Prod — additive migration** (new nullable col, new table) | Deploy app compatible with old+new; rollback **app** first if needed; leave DB forward |
| **Prod — destructive** | Avoid; use expand/contract: add new → dual-write → backfill → switch reads → drop old in later migration |
| **Failed migrate mid-way** | Prisma/Supabase transaction per migration file; fix forward with a new migration — do not edit applied migrations |
| **Catastrophic** | Supabase **PITR** / daily backup restore to new instance; cut DNS after validation (`DEPLOYMENT.md`, DATABASE.md §7) |
| **Workers mismatch** | Pause queue; roll back worker image with DB; never run old workers against dropped columns |

**Expand/contract example (rename column):**

1. Add `new_col`  
2. Dual-write  
3. Backfill  
4. Switch reads  
5. Stop writing `old_col`  
6. Drop `old_col` in a later release  

**Never** roll back payment/credit ledger rows casually — issue compensating ledger entries instead.

---

## 10. Seed Data

### 10.1 Plans catalog (required for billing clarity)

| tier | Display | Price (cents) | monthlyGrant | isUnlimited | Notes |
|------|---------|---------------|--------------|-------------|-------|
| FREE | Free | 0 | **300** | false | Screenshot only |
| PRO | Pro | **2900** | **1000** | false | URL + PDF |
| ENTERPRISE | Business | **9900** | **10000** | false* | UI label Business |

\*SCHEMA historically allowed Enterprise `isUnlimited=true`; **adopted product** is metered **10,000** (`PRICING.md`). Seed `isUnlimited=false` unless Product re-enables unlimited.

Store Stripe Price IDs per environment in `Plans` or env config — **test vs live** never mixed.

### 10.2 Top-up pack reference (config or table)

| packId | Credits | Price |
|--------|---------|-------|
| PACK_500 | 500 | $9 |
| PACK_2000 | 2,000 | $29 |
| PACK_5000 | 5,000 | $59 |

### 10.3 Development-only seeds (optional)

| Seed | Purpose |
|------|---------|
| Admin user | `role=ADMIN` after manual auth link |
| Demo Free / Pro users | QA personas |
| Sample completed audit + report + recommendations | UI/PDF fixtures |
| **Never** seed prod with fake payments or live Stripe IDs |

### 10.4 Auth-triggered seed (every real user)

On first SSO:

1. `Users` (email, authProviderId, emailVerified from provider)  
2. `Memberships` FREE ACTIVE  
3. `Credits` balance=300, monthlyGrant=300  
4. `Settings` SYSTEM theme, emailNotifications=true, A4, UTC, en  

---

## 11. Development Database

| Item | Practice |
|------|----------|
| Options | Local Supabase CLI **or** dedicated Supabase **dev** project |
| Connection | `DATABASE_URL` pooled; `DIRECT_URL` for migrations |
| Apply | `prisma migrate dev` / `supabase db reset` |
| RLS | Test with anon key **and** user JWT — prove isolation |
| Stripe | Test mode only |
| Data | Disposable; reset freely |
| Seed | Plans + optional fixtures |
| Auth | Google/Apple/Microsoft redirect → localhost |

Do not point local apps at **production** DATABASE_URL.

---

## 12. Production Database

| Item | Practice |
|------|----------|
| Instance | Dedicated Supabase **prod** project |
| Backups | Automated daily + **PITR** enabled |
| Pooling | Transaction-mode pooler for Vercel |
| Migrations | CI/`migrate deploy` only — gated on `main` |
| RLS | Mandatory; verified in checklist |
| Credentials | Least-privilege app role + service role server-only |
| Monitoring | Connection count, slow queries, disk |
| Retention | Archive old audits/JSON per policy; FileAssets TTL |
| Restore drill | Quarterly restore to scratch project |

Staging mirrors prod schema; separate data and Stripe test keys.

---

## 13. Migration Checklist

### Before writing a migration

- [ ] Schema change reflected in `SCHEMA.md` / Prisma schema  
- [ ] FK order respected  
- [ ] Enums/CHECKs defined  
- [ ] Indexes for new query paths  
- [ ] RLS updated for new user-owned tables  
- [ ] Expand/contract plan if breaking  
- [ ] Credit/payment implications reviewed  

### Before applying to staging

- [ ] Migration applies clean on empty DB  
- [ ] Migration applies clean on DB with data  
- [ ] Rollback/forward-fix documented  
- [ ] Auth trigger still seeds correctly  
- [ ] API contract tests green  

### Before applying to production

- [ ] Staging soak complete  
- [ ] PITR / backup confirmed  
- [ ] Maintenance window if locking risk  
- [ ] App/worker versions compatible  
- [ ] On-call aware  
- [ ] Post-migrate: RLS on, Plans seeded, health OK  
- [ ] Smoke: signup seed → audit create → webhook idempotency  

### After migrate

- [ ] Spot-check row counts / constraints  
- [ ] No RLS disabled accidentally  
- [ ] FileAssets / webhook table writable by service role  
- [ ] Record migration version in release notes  

---

## 14. Suggested migration file map

| File (illustrative) | Step |
|---------------------|------|
| `20260730000000_enums` | M01 |
| `20260730000001_users` | M02 |
| `20260730000002_memberships_credits_settings` | M03 |
| `20260730000003_plans` | M04 |
| `20260730000004_audits` | M05 |
| `20260730000005_reports_recommendations` | M06 |
| `20260730000006_credit_transactions` | M07 |
| `20260730000007_payments_notifications` | M08–M09 |
| `20260730000008_file_assets_feedback` | M10–M11 |
| `20260730000009_webhooks_activity` | M12–M13 |
| `20260730000010_indexes` | M14 (if split) |
| `20260730000011_rls` | M15 |
| `20260730000012_auth_trigger` | M16 |
| `20260730000013_seed_plans` | M17 |

Exact timestamps follow Prisma/Supabase tooling.

---

## 15. Column quick reference (core tables)

Use SCHEMA.md for full field lists. Migration must include at minimum:

| Table | Critical columns |
|-------|------------------|
| Users | id, authProviderId, email, name, avatarUrl, role, emailVerified, status, lastLoginAt, createdAt, updatedAt |
| Memberships | id, userId, tier, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, canceledAt, createdAt, updatedAt |
| Credits | id, userId, balance, monthlyGrant, isUnlimited, lifetimeUsed, lastResetAt, nextResetAt, updatedAt |
| Settings | id, userId, theme, emailNotifications, defaultPdfFormat, timezone, language, updatedAt |
| Audits | id, userId, websiteUrl?, inputType, status, scores?, summary?, errorCode?, creditsCost?, createdAt, updatedAt, completedAt? |
| Reports | id, auditId, overallScore, categoryScores, aiSummary, reportJson, pdf key/url, hasPdf, createdAt |
| Recommendations | id, reportId, category, severity, priority, title, description, recommendation, businessImpact, screenshotRef?, createdAt |
| CreditTransactions | id, creditsId, type, amount, balanceAfter, auditId?, paymentId?, createdAt |
| Payments | id, userId, amount, currency, status, type, stripe* ids, creditsGranted?, createdAt |
| Notifications | id, userId, type, title, message, read, metadata, createdAt |
| FileAssets | id, userId, key, type, mime, size, auditId?, reportId?, createdAt, expiresAt? |
| ProcessedWebhookEvents | id, stripeEventId, type, status, receivedAt, processedAt?, payload? |
| ReportFeedback | id, userId, reportId, rating, actedOnRecommendation?, comment?, createdAt |
| ActivityLog | id, userId?, action, entityType, entityId, ip?, userAgent?, metadata?, createdAt |
| Plans | id, tier, name, priceCents, currency, monthlyGrant, isUnlimited, features JSON, stripePriceId?, active |

---

## 16. Related documents

| Doc | Use |
|-----|-----|
| DATABASE.md | Overview, indexes, backups, missing tables |
| SCHEMA.md | Field-level specs |
| PRICING.md | Seed grant amounts |
| DEPLOYMENT.md | When/how to run migrate in CI/CD |
| SECURITY.md | RLS, least privilege, erasure |
| BUSINESS_RULES.md | Credit/membership behaviour encoded in constraints + app |

---

**End of DATABASE_MIGRATION.md**
