# Audient — Backend Development Tasks

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Backend · Data · DevOps · QA  

**Format:** Markdown only — **no application code**. Task breakdown for implementing the server, workers, and data layer.

**Related sources (read before coding):**  
`DEVELOPMENT_ROADMAP.md` · `TECHNICAL_ARCHITECTURE.md` · `FOLDER_STRUCTURE.md` · `DATABASE.md` · `SCHEMA.md` · `DATABASE_MIGRATION.md` · `API.md` · `API_SPECIFICATION.md` · `AUTH_API.md` · `AUDIT_API.md` · `USER_API.md` · `BILLING_API.md` · `API_MAPPING.md` · `PRICING.md` · `BUSINESS_RULES.md` (repo root) · `VALIDATION_RULES.md` · `ERROR_HANDLING.md` · `AI_WORKFLOW.md` · `AI_PROMPTS.md` · `SECURITY.md` · `DEPLOYMENT.md` · `TEST_CASES.md` · `ANALYTICS.md` · `DEVELOPER_GUIDELINES.md`

**Authoritative configs:** Free **300** / Pro **$29 · 1,000** / Business (`ENTERPRISE`) **$99 · 10,000** — `PRICING.md` / `src/config/plans.ts`. Guest = **1** anonymous screenshot audit.

**Out of scope (do not schedule as MVP backend work):** email/password · GitHub OAuth · Teams/seats (`BR-ENT-003`) · History search API · Report share API · Required competitive analysis (`BR-AI-006` nullable/undecided) · White-label / public API keys (`BR-ENT-004`).

---

## How to use this document

| Field | Meaning |
|-------|---------|
| **Goal** | Outcome this milestone delivers |
| **Files** | Paths to create/extend (per `FOLDER_STRUCTURE.md`) — descriptive, not code |
| **Database** | Schema / migrations / RLS impact |
| **API** | Endpoints from `API_SPECIFICATION.md` |
| **Authentication** | Authn/authz/session behaviour |
| **Business Rules** | Rule IDs that must be enforced server-side |
| **Testing** | Minimum proof (align with `TEST_CASES.md`) |
| **Estimated Complexity** | **S** ≤3d · **M** ~1 wk · **L** ~2 wk · **XL** >2 wk (1 backend engineer, relative) |
| **Dependencies** | Prior milestones / external accounts |
| **Completion Criteria** | Definition of done — binary checks |

**Suggested sequence:** BM-01 → BM-10. Frontend can parallelize after BM-03 (auth) and BM-05 (uploads) land contracts.

```text
BM-01 Foundation
  → BM-02 Database
    → BM-03 Auth & User
      → BM-04 Credits
      → BM-05 Uploads & Guest
      → BM-06 Billing & Stripe
        → BM-07 Screenshot audit pipeline
          → BM-08 URL audit + AI engine
            → BM-09 Reports & PDF
            → BM-10 Notifications, settings, erasure & harden
```

Maps roughly to `DEVELOPMENT_ROADMAP.md`: BM-01–03 ≈ Sprint 1 · BM-04–07 ≈ Sprint 2 · BM-08 ≈ Sprint 3 · BM-09–10 ≈ Sprint 4–5 (backend slice).

---

## Milestone index

| ID | Milestone | Complexity |
|----|-----------|------------|
| **BM-01** | Backend foundation & shared kit | M |
| **BM-02** | Database schema, migrations & RLS | L |
| **BM-03** | Authentication & current-user APIs | L |
| **BM-04** | Credits, membership reads & ledger | L |
| **BM-05** | Uploads, storage & guest session | M |
| **BM-06** | Stripe billing, checkout & webhooks | L |
| **BM-07** | Audit intake + queue + screenshot pipeline | XL |
| **BM-08** | URL audit pipeline & AI analysis engine | XL |
| **BM-09** | Reports, recommendations, PDF & feedback | L |
| **BM-10** | Notifications, settings, account deletion & hardening | L |

---

## BM-01 — Backend foundation & shared kit

### Goal

Stand up the backend skeleton: env contracts, Supabase clients, API envelope helpers, plan config, health check, and deployable empty route tree so later milestones plug into a consistent shape.

### Files

| Area | Paths |
|------|-------|
| Config | `src/config/plans.ts` (grants, costs, gates) · `.env.example` |
| Lib | `src/lib/db.ts` · `src/lib/supabase/{client,server,admin,middleware}.ts` · `src/lib/redis.ts` (stub OK) |
| Types | `src/types/index.ts` (domain + API envelope) |
| Utils | `src/utils/` (errors, idempotency helpers stubs) |
| API | `src/app/api/health/` · `src/app/api/v1/` route group scaffold |
| Middleware | `src/middleware.ts` (passthrough / health only initially) |
| Docs/ops | Align with `DEPLOYMENT.md` topology notes |

### Database

None required beyond confirming connection string placeholders. Do **not** invent schema here — that is BM-02.

### API

| ID | Method | Path |
|----|--------|------|
| API-SYS-001 | GET | `/api/health` |

Envelope conventions from `API_SPECIFICATION.md` §1 documented and reusable for all later handlers.

### Authentication

No product auth yet. Health is public. Service-role keys documented as **server-only**.

### Business Rules

| Rule | Note |
|------|------|
| BR-SUB-001 | Plan catalog constants match `PRICING.md` |
| BR-CRED-003 | Cost table present in config (enforced later) |
| — | No email/password or GitHub stubs |

### Testing

- Health returns OK shape in local/preview.  
- `npm run typecheck` / lint pass on scaffold.  
- Env example lists required keys without secrets.

### Estimated Complexity

**M**

### Dependencies

- Node / Vercel / Supabase project shells (`DEPLOYMENT.md`).  
- Docs freeze on pricing & API inventory.

### Completion Criteria

- [ ] `/api/health` live on preview deploy  
- [ ] `plans.ts` matches Free 300 / Pro 1000 / Business 10000 and credit costs  
- [ ] Shared success/error envelope helpers exist  
- [ ] `.env.example` complete for next milestones  
- [ ] No secrets committed  

---

## BM-02 — Database schema, migrations & RLS

### Goal

Apply the full MVP schema with enums, FKs, indexes, CHECK constraints, RLS, auth seed trigger, and Plans seed — per `DATABASE_MIGRATION.md` and `SCHEMA.md`.

### Files

| Area | Paths |
|------|-------|
| Database | `supabase/migrations/*` |
| Supabase | `supabase/migrations/*` (RLS, triggers) · `supabase/seed.sql` |
| Lib | Wire `src/lib/db.ts` to migrated DB |

### Database

| Step | Content |
|------|---------|
| M00–M01 | Extensions, enums |
| M02–M03 | Users, Memberships, Credits, Settings |
| M04 | Plans |
| M05–M06 | Audits, Reports, Recommendations |
| M07–M09 | CreditTransactions, Payments, Notifications |
| M10–M13 | FileAssets, ReportFeedback, ProcessedWebhookEvents, ActivityLog |
| M14–M17 | Indexes, RLS, `on_auth_user_created` seed, Plans seed |

**Seed defaults:** Free membership; Credits `balance`/`monthlyGrant` = **300** (not legacy 200).

### API

None product-facing. Migration tooling only (Supabase CLI).

### Authentication

Auth trigger maps `auth.users` → `Users` + Membership FREE + Credits + Settings. RLS: `userId = auth.uid()` on user-owned tables; webhook/plans tables service-role only.

### Business Rules

| Rule | Note |
|------|------|
| BR-AUTH-002 | Seed Free + credits on first login |
| BR-CRED-002 | monthlyGrant by plan in Plans / Credits |
| BR-SEC-001 | RLS ownership |
| BR-SEC-006 | Cascades / Payments retention design for later delete |
| BR-BILL-006 | `ProcessedWebhookEvents` unique on `stripeEventId` |
| BR-ENT-003 | Do **not** create Organizations tables yet |

### Testing

- Empty DB migrate-up succeeds.  
- Seeded Plans rows correct.  
- Auth user insert creates four app rows.  
- RLS: user A cannot read user B rows (anon/authenticated JWT tests).  
- CHECK: `Credits.balance >= 0`.

### Estimated Complexity

**L**

### Dependencies

- BM-01  
- Supabase Postgres (dev + staging)  
- `DATABASE_MIGRATION.md` checklist

### Completion Criteria

- [ ] All MVP tables present with FKs/indexes from migration guide  
- [ ] RLS enabled and verified  
- [ ] Auth seed trigger works end-to-end  
- [ ] Plans seeded Free/Pro/ENTERPRISE with PRICING grants  
- [ ] Rollback/forward strategy documented for this baseline  

---

## BM-03 — Authentication & current-user APIs

### Goal

Ship SSO-only auth (Google, Apple, Microsoft), session middleware, sign-out, and `/me` CRUD including GDPR-oriented account delete scaffolding hooks (full purge completes in BM-10 if storage not ready).

### Files

| Area | Paths |
|------|-------|
| API | `src/app/api/v1/auth/{google,apple,microsoft,sign-out}/` · `src/app/api/v1/me/` |
| Services | `src/services/user/` |
| Lib | Supabase auth helpers · session cookie handling |
| Middleware | `src/middleware.ts` — protect dashboard API patterns |
| Types | Session / User DTOs |

### Database

Uses Users, Memberships, Credits, Settings (read/update). Soft-delete / status `DELETED` fields per SCHEMA. ActivityLog inserts optional.

### API

| ID | Method | Path |
|----|--------|------|
| API-AUTH-001 | POST | `/api/v1/auth/google` |
| API-AUTH-002 | POST | `/api/v1/auth/apple` |
| API-AUTH-003 | POST | `/api/v1/auth/microsoft` |
| API-AUTH-004 | POST | `/api/v1/auth/sign-out` |
| API-USER-001 | GET | `/api/v1/me` |
| API-USER-002 | PATCH | `/api/v1/me` |
| API-USER-003 | DELETE | `/api/v1/me` |

Align response shapes with `AUTH_API.md` / `USER_API.md` / `API_SPECIFICATION.md`.

### Authentication

- Supabase Auth JWT; identity from token `sub` only (`BR-SEC-002`).  
- Providers: Google · Apple · Microsoft only (`BR-AUTH-001`).  
- Email read-only (`BR-AUTH-005`).  
- Protected routes require session (`BR-AUTH-003`).  
- Claim guest audit hook interface ready for BM-05 (`BR-GUEST-006`) — may no-op until guest exists.

### Business Rules

| Rule | Focus |
|------|-------|
| BR-AUTH-001 … BR-AUTH-006 | SSO, seed, session, sign-out, email, verification flag |
| BR-GUEST-006 | Claim path on login (wire when guest BM-05 done) |
| BR-SEC-002 | Token identity |
| BR-SEC-006 | Delete account behaviour (purge orchestration may complete BM-10) |

### Testing

- Each SSO provider returns session + seeded Free user.  
- Unauthenticated `/me` → 401.  
- PATCH cannot change email.  
- Sign-out clears session.  
- Rate limit stubs or basic throttle on auth (`BR-SEC-003`).  
- Cases from `TEST_CASES.md` auth suite smoke.

### Estimated Complexity

**L**

### Dependencies

- BM-02  
- OAuth apps configured (Google/Apple/Microsoft) in Supabase  

### Completion Criteria

- [ ] Three SSO paths + sign-out work on staging  
- [ ] New users have Membership FREE + 300 credits + Settings  
- [ ] `/me` GET/PATCH/DELETE match API spec envelopes  
- [ ] Middleware rejects unauthenticated protected API calls  
- [ ] No password/GitHub endpoints exist  

---

## BM-04 — Credits, membership reads & ledger

### Goal

Make credits and membership **server-authoritative**: balance APIs, transactional reserve/deduct/refund primitives, monthly grant config, ledger listing, and entitlement helpers used by audits/billing.

### Files

| Area | Paths |
|------|-------|
| API | `src/app/api/v1/credits/` · `.../credits/transactions/` · `src/app/api/v1/membership/` |
| Services | `src/services/credits/` · membership helpers in `src/services/billing/` or `user/` |
| Config | `src/config/plans.ts` consumed exclusively for costs/grants |
| Utils | Credit math / period reset helpers |

### Database

| Tables | Use |
|--------|-----|
| Credits | balance, monthlyGrant, isUnlimited, lifetimeUsed, reset timestamps |
| CreditTransactions | append-only ledger |
| Memberships | tier + status for entitlements |
| Plans | catalog reads |

Row-lock Credits on mutation. Prefer DB CHECK `balance >= 0`.

### API

| ID | Method | Path |
|----|--------|------|
| API-CRED-001 | GET | `/api/v1/credits` |
| API-CRED-002 | GET | `/api/v1/credits/transactions` |
| API-BILL-001 | GET | `/api/v1/membership` |

(Top-ups checkout is BM-06; primitives here must support later `TOPUP` / `AUDIT_DEDUCTION` / `REFUND` / `MONTHLY_GRANT`.)

### Authentication

Bearer/session required. Own credits only. Service role for worker refunds later.

### Business Rules

| Rule | Focus |
|------|-------|
| BR-CRED-001 … BR-CRED-005 | Server truth, grants, costs, reserve, reset vs rollover |
| BR-CRED-006 / BR-CRED-007 | Top-up eligibility helpers (enforce at API in BM-06) |
| BR-SUB-001 | Plan catalog |
| BR-SUB-006 | PAST_DUE premium limits in entitlement helper |
| BR-ENT-001 | ENTERPRISE = Business label mapping |
| BR-ERR-001 | Refund primitive idempotent |

### Testing

- Concurrent reserve cannot double-spend.  
- Insufficient balance → typed error for audits.  
- Ledger append-only (no silent balance edits).  
- Free/Pro/Business cost lookup matches PRICING table.  
- Unit tests on credits service (heavy).

### Estimated Complexity

**L**

### Dependencies

- BM-03  

### Completion Criteria

- [ ] GET credits/membership/transactions match API spec  
- [ ] Reserve / deduct / refund / grant functions are transactional + ledgered  
- [ ] Entitlement helper encodes tier + status gates  
- [ ] Clients cannot supply cost or balance overrides  

---

## BM-05 — Uploads, storage & guest session

### Goal

Signed uploads to private storage, FileAssets inventory, MIME/size enforcement, and **guest** one-shot screenshot session with claim-on-login.

### Files

| Area | Paths |
|------|-------|
| API | `src/app/api/v1/uploads/sign/` |
| Lib | `src/lib/storage.ts` |
| Services | upload validation · guest session service · claim-on-login in `user/` |
| Middleware / cookies | Guest session cookie issuance |

### Database

| Tables | Use |
|--------|-----|
| FileAssets | key, type, mime, size, userId (nullable for guest until claim), auditId |
| Audits | optional guest owner linkage fields if modelled; else claim rewrites `userId` |

TTL / cleanup job notes for guest orphans (`BR-GUEST-007`).

### API

| ID | Method | Path |
|----|--------|------|
| API-UPL-001 | POST | `/api/v1/uploads/sign` |

Guest allowed for screenshot type only when under guest quota; avatar requires auth.

### Authentication

- Authed users: scoped keys `users/{userId}/…`.  
- Guests: server-issued guest session + rate limit / optional captcha hooks.  
- Claim: on SSO success, attach guest audit + files (`BR-GUEST-006`).

### Business Rules

| Rule | Focus |
|------|-------|
| BR-GUEST-001 … BR-GUEST-007 | One audit, display, no URL, second→login, menu, claim, abuse |
| BR-SHOT-002 | File constraints |
| BR-SEC-005 | Private uploads, signed URLs |
| BR-PDF-003 | Pattern for short-lived URLs (reuse for downloads later) |

### Testing

- Reject bad MIME/oversize.  
- Guest second upload/sign blocked.  
- Guest cannot request URL-audit-related upload types.  
- After login, guest asset owned by user.  
- Signed URL expiry verified.

### Estimated Complexity

**M**

### Dependencies

- BM-03 (claim) · BM-02 (FileAssets)  
- Supabase Storage (or R2) private bucket  

### Completion Criteria

- [ ] Signed PUT flow works for screenshot + avatar  
- [ ] Guest quota = 1 enforced server-side  
- [ ] Claim-on-login associates audit/files  
- [ ] No public bucket listing  

---

## BM-06 — Stripe billing, checkout & webhooks

### Goal

PCI-safe subscriptions and top-ups: Checkout, Portal, payment-method session, payments history, and **verified idempotent webhooks** that alone grant entitlements/credits.

### Files

| Area | Paths |
|------|-------|
| API | `src/app/api/v1/billing/{checkout,portal,payment-method}/` · `.../payments/` · `.../credits/topups/` · `src/app/api/webhooks/stripe/` |
| Lib | `src/lib/stripe.ts` |
| Services | `src/services/billing/` |
| Config | Stripe Price IDs mapped from Plans / env (test vs live) |

### Database

| Tables | Use |
|--------|-----|
| Memberships | stripeCustomerId, stripeSubscriptionId, tier, status, period |
| Payments | amount, status, type, Stripe ids |
| Credits + CreditTransactions | TOPUP / MONTHLY_GRANT via webhook |
| ProcessedWebhookEvents | idempotency |

### API

| ID | Method | Path |
|----|--------|------|
| API-CRED-003 | POST | `/api/v1/credits/topups` |
| API-BILL-002 | POST | `/api/v1/billing/checkout` |
| API-BILL-003 | POST | `/api/v1/billing/portal` |
| API-BILL-004 | POST | `/api/v1/billing/payment-method` |
| API-BILL-005 | GET | `/api/v1/payments` |
| API-WH-001 | POST | `/api/webhooks/stripe` |

Idempotency-Key on checkout/top-ups (`API.md` §11).

### Authentication

User session for billing APIs. Webhook: Stripe-Signature only — **no** user JWT. Never accept client “I paid” claims.

### Business Rules

| Rule | Focus |
|------|-------|
| BR-SUB-002 … BR-SUB-006 | Monthly only, checkout, Active Account, webhook entitlements, PAST_DUE |
| BR-BILL-001 … BR-BILL-006 | Stripe, PCI, SCA, fail=no grant, success path, idempotency |
| BR-CRED-006 / BR-CRED-007 | Free blocked from top-ups; pack sizes |
| BR-ENT-001 | Business ↔ ENTERPRISE |

### Testing

- Stripe CLI forward: checkout.session.completed / invoice / subscription updated.  
- Duplicate event → no double credit.  
- Failed payment → no tier change.  
- Free top-up → 403.  
- Signature failure → 400/401, no side effects.  
- Integration tests with Stripe test mode.

### Estimated Complexity

**L**

### Dependencies

- BM-04  
- Stripe products/prices for Pro, Business, three top-up packs  

### Completion Criteria

- [ ] Checkout/portal/top-up sessions create correctly  
- [ ] Webhook grants Pro/Business + credits only after verify  
- [ ] ProcessedWebhookEvents prevents double apply  
- [ ] GET payments lists own rows  
- [ ] No raw PAN handling anywhere  

---

## BM-07 — Audit intake + queue + screenshot pipeline

### Goal

End-to-end **screenshot** audit: create/list/get/status/delete APIs, credit reservation, BullMQ job, worker that runs multimodal brief analysis, persists Audit (+ light Report/summary for Free), refunds on failure, guest create path.

### Files

| Area | Paths |
|------|-------|
| API | `src/app/api/v1/audits/` (+ `[auditId]`, `status`) |
| Lib | `src/lib/queue.ts` · Redis |
| Services | `src/services/audit/` (create, status, delete, orchestration) |
| AI | `src/lib/ai/` + providers · prompt refs from `AI_PROMPTS.md` (brief path) |
| Workers | `workers/index.ts` · `workers/audit.worker.ts` · `workers/processors/` (screenshot stages) |

### Database

| Tables | Use |
|--------|-----|
| Audits | QUEUED→PROCESSING→COMPLETED/FAILED |
| CreditTransactions | AUDIT_DEDUCTION / REFUND |
| FileAssets | input screenshot refs |
| Reports | brief summary / scores as applicable for Free depth |
| Notifications | optional stub enqueue for BM-10 |

### API

| ID | Method | Path |
|----|--------|------|
| API-AUDIT-001 | POST | `/api/v1/audits` (screenshot) |
| API-AUDIT-002 | GET | `/api/v1/audits` |
| API-AUDIT-003 | GET | `/api/v1/audits/{auditId}` |
| API-AUDIT-004 | GET | `/api/v1/audits/{auditId}/status` |
| API-AUDIT-005 | DELETE | `/api/v1/audits/{auditId}` |

Returns **202** + poll status (~2s). Product aliases per API_SPECIFICATION.

### Authentication

- Authed: email verified required (`BR-AUTH-006`).  
- Guest: screenshot only if quota remaining.  
- Ownership 404 for others (`BR-HIST-001`, `BR-SEC-001`).  
- Delete: no credit refund (`ERROR_HANDLING` / BR-ERR).

### Business Rules

| Rule | Focus |
|------|-------|
| BR-SHOT-001 … BR-SHOT-004 | Availability, files, SLA ≤90s, valid input |
| BR-CRED-003 / BR-CRED-004 | Costs + reserve at create |
| BR-GUEST-* | Guest create limits |
| BR-AI-001 / BR-AI-003 / BR-AI-005 | Async, Free brief depth, cost bounds |
| BR-ERR-001 … BR-ERR-003 | Refund, taxonomy, idempotent retries |
| BR-HIST-001 … BR-HIST-003 | Own list; guest history gated |

### Testing

- Create screenshot → status transitions → COMPLETED with summary.  
- Insufficient credits → 422.  
- Unverified email → 403.  
- Failure path refunds once.  
- Idempotency-Key prevents duplicate audits/charges.  
- Guest second create blocked.  
- Delete removes row/assets policy without refund.  
- Worker crash → FAILED + refund.

### Estimated Complexity

**XL**

### Dependencies

- BM-04 · BM-05 · Redis · worker host · AI provider key  
- BM-06 optional for paid screenshot costs but Free path can ship first  

### Completion Criteria

- [ ] Free/authed screenshot E2E on staging within ~90s budget  
- [ ] Guest one-shot works  
- [ ] Status polling contract stable for Progress UI  
- [ ] Credits reserved and refunded correctly  
- [ ] History list returns own audits only  

---

## BM-08 — URL audit pipeline & AI analysis engine

### Goal

Paid **URL** audits: SSRF-safe validation, Playwright crawl + screenshots, HTML extract, axe/Lighthouse signals, full multimodal analysis, scoring/prioritization, persist Recommendations + full reportJson, failure/refund, ≤8 min budget.

### Files

| Area | Paths |
|------|-------|
| Services | `src/services/audit/` URL validators · crawl · scan orchestration |
| AI | `src/lib/ai/` structured JSON validate/repair · `AI_PROMPTS.md` versions |
| Workers | `workers/processors/` crawl, screenshot, extract, a11y, ai, score, store |
| Utils | SSRF DNS recheck helpers · scoring (deterministic in code, not model) |

### Database

| Tables | Use |
|--------|-----|
| Audits | URL inputType, scores, errorCode, creditsCost |
| Reports | full reportJson, categoryScores, aiSummary |
| Recommendations | findings (category, severity, priority, …) |
| FileAssets | captured screenshots |

Competitive analysis field **nullable** only (`BR-AI-006`).

### API

Extend **API-AUDIT-001** for `inputType=URL`. Same status/get/list/delete. Recommendations/report read may soft-land here or finalize in BM-09 — worker must **write** data either way.

### Authentication

Pro/Business + active (not PAST_DUE premium block) · email verified · no guests · Free → `TIER_NOT_ALLOWED`.

### Business Rules

| Rule | Focus |
|------|-------|
| BR-URL-001 … BR-URL-005 | Paid gate, upgrade, validation, SSRF, SLA |
| BR-SUB-006 | PAST_DUE |
| BR-AI-001 … BR-AI-005 | Pipeline, dimensions, depth, invalid JSON, bounds |
| BR-AI-006 | Do not require competitive analysis |
| BR-CRED-003 / BR-CRED-004 / BR-ERR-* | URL costs, reserve, refund |
| BR-SEC-* | Network-isolated worker; prompt injection defenses (`SECURITY.md` §8, `AI_PROMPTS.md`) |

### Testing

- Reject localhost / metadata IPs / rebinding.  
- Free URL → 403.  
- Pro URL → COMPLETED with recommendations + scores.  
- Timeout → FAILED + full refund.  
- Invalid model JSON repaired or fail+refund per BR-AI-004.  
- Concurrency caps protect spend.  
- Integration tests with fixture sites (allowlisted).

### Estimated Complexity

**XL**

### Dependencies

- BM-07  
- Worker image with Chromium  
- AI provider  

### Completion Criteria

- [ ] URL audits gated and SSRF-safe  
- [ ] Pipeline stages produce stored report + recommendations  
- [ ] Scoring/prioritization deterministic in application code  
- [ ] Failure taxonomy + refunds match ERROR_HANDLING  
- [ ] Typical site finishes within ~8 minutes under load caps  

---

## BM-09 — Reports, recommendations, PDF & feedback

### Goal

Read APIs for full report and recommendations; Pro/Business PDF generation (Playwright HTML→PDF) with signed download; report feedback; Free users blocked from PDF/full depth per rules.

### Files

| Area | Paths |
|------|-------|
| API | report, recommendations, pdf, feedback under `audits/[auditId]/` |
| Services | `src/services/report/` |
| Workers | PDF processor (or on-demand job) |
| Templates | Report HTML template source (design-aligned; backend ownership of render) |

### Database

| Tables | Use |
|--------|-----|
| Reports | pdf storage key, hasPdf |
| Recommendations | list/filter by severity/priority |
| ReportFeedback | rating / comment |
| FileAssets | PDF type |

### API

| ID | Method | Path |
|----|--------|------|
| API-RPT-001 | GET | `/api/v1/audits/{auditId}/report` |
| API-RPT-002 | GET | `/api/v1/audits/{auditId}/recommendations` |
| API-RPT-003 | GET | `/api/v1/audits/{auditId}/report/pdf` |
| API-RPT-004 | POST | `/api/v1/audits/{auditId}/report/feedback` |

### Authentication

Owner only. PDF: paid tier + active entitlement. Free/guest: brief report fields only (`BR-AI-003`, `BR-PDF-001`).

### Business Rules

| Rule | Focus |
|------|-------|
| BR-PDF-001 … BR-PDF-004 | Gate, 0 credits, signed URL, PDF fail ≠ audit refund |
| BR-AI-003 | Free vs paid depth |
| BR-HIST-001 | Ownership |
| BR-SEC-001 | 404 not 403 for others |

### Testing

- Free PDF → 403.  
- Pro PDF → short-lived signed URL; object private.  
- PDF failure leaves audit COMPLETED; no credit refund.  
- Feedback validation per VALIDATION_RULES.  
- Recommendations ordered/filterable as spec.

### Estimated Complexity

**L**

### Dependencies

- BM-08 (full report data) · BM-07 minimum for Free brief report reads  

### Completion Criteria

- [ ] Report + recommendations APIs match API_SPECIFICATION  
- [ ] PDF generate + download for Pro/Business  
- [ ] Feedback persisted  
- [ ] Tier depth enforced server-side  

---

## BM-10 — Notifications, settings, account deletion & hardening

### Goal

Close remaining API surface; wire notification create on audit/payment events; settings GET/PATCH; complete account erasure (DB + storage); rate limits; ActivityLog; observability; security pass for private beta.

### Files

| Area | Paths |
|------|-------|
| API | `notifications/` · `settings/` · finalize `DELETE /me` purge |
| Services | `src/services/notification/` · erasure in `user/` |
| Lib | rate limiter (Redis) · Sentry hooks |
| Workers | email dispatch adapter (if used) · retention/TTL cleanup job |
| Ops | `DEPLOYMENT.md` checklists · staging soak |

### Database

| Tables | Use |
|--------|-----|
| Notifications | CRUD/read-all |
| Settings | theme, emails, pdf format, timezone, language |
| ActivityLog | security-significant actions |
| FileAssets | purge on delete / TTL |
| Payments | anonymize/retain per BR-SEC-006 |

### API

| ID | Method | Path |
|----|--------|------|
| API-NOTIF-001 | GET | `/api/v1/notifications` |
| API-NOTIF-002 | PATCH | `/api/v1/notifications/{notificationId}` |
| API-NOTIF-003 | POST | `/api/v1/notifications/read-all` |
| API-SET-001 | GET | `/api/v1/settings` |
| API-SET-002 | PATCH | `/api/v1/settings` |
| API-USER-003 | DELETE | `/api/v1/me` (complete purge) |

Confirm entire `API_SPECIFICATION.md` inventory implemented (32 endpoints).

### Authentication

Own notifications/settings only. Admin role reserved; no Teams APIs. Rate limits on auth, audits, uploads, checkout (`BR-SEC-003`).

### Business Rules

| Rule | Focus |
|------|-------|
| BR-NOTIF-001 … BR-NOTIF-003 | Types, audit complete, privacy |
| BR-AUTH-005 | Settings cannot edit email |
| BR-SEC-001 … BR-SEC-006 | Ownership, token, rate limit, no training, private files, deletion |
| BR-BILL-006 | Re-audit webhook idempotency |
| BR-ERR-* | Failure + refund consistency review |

### Testing

- Notification created on COMPLETED/FAILED/low credits/payment.  
- Mark read / read-all.  
- Settings PATCH validation.  
- DELETE /me removes user data + storage objects; payments retained/anonymized.  
- Rate limit returns 429.  
- Security checklist from `SECURITY.md` / `DEPLOYMENT.md`.  
- Regression across TEST_CASES backend-critical IDs.  
- Load: queue concurrency + health.

### Estimated Complexity

**L**

### Dependencies

- BM-06 · BM-07 · BM-09  
- Sentry / uptime (`DEPLOYMENT.md`)  

### Completion Criteria

- [ ] All in-scope API_SPECIFICATION endpoints live on staging  
- [ ] Notifications + settings complete  
- [ ] Account deletion meets BR-SEC-006  
- [ ] Rate limiting + ActivityLog active  
- [ ] Observability dashboards receiving API/worker errors  
- [ ] Backend private-beta readiness sign-off  

---

## Cross-cutting backlog (attach to milestones, not separate MVP milestones)

| Item | Attach to | Notes |
|------|-----------|-------|
| Analytics server events | BM-03+ | `ANALYTICS.md` — emit from services, respect consent |
| Prompt versioning | BM-07/08 | `AI_PROMPTS.md`; scores in code |
| Idempotency-Key store | BM-06/07 | audits, checkout, top-ups |
| Monthly credit reset job | BM-04/10 | BR-CRED-005 |
| Guest TTL cleanup | BM-05/10 | BR-GUEST-007 |
| Competitive analysis | — | **OOS** until BR-AI-006 decided |
| Organizations / API keys | — | Phase 2 / BR-ENT-003–004 |

---

## Endpoint coverage matrix

| Endpoint | Milestone |
|----------|-----------|
| GET `/api/health` | BM-01 |
| Auth google/apple/microsoft/sign-out | BM-03 |
| GET/PATCH/DELETE `/me` | BM-03 / purge BM-10 |
| GET `/credits`, `/credits/transactions` | BM-04 |
| GET `/membership` | BM-04 |
| POST `/uploads/sign` | BM-05 |
| POST `/credits/topups`, billing/*, GET `/payments`, Stripe webhook | BM-06 |
| Audits CRUD + status | BM-07 (+ URL in BM-08) |
| Report, recommendations, PDF, feedback | BM-09 |
| Notifications + settings | BM-10 |

---

## Complexity rollup

| Milestone | Complexity | Rough order |
|-----------|------------|-------------|
| BM-01 | M | 1 |
| BM-02 | L | 2 |
| BM-03 | L | 3 |
| BM-04 | L | 4 |
| BM-05 | M | 5 |
| BM-06 | L | 6 |
| BM-07 | XL | 7 |
| BM-08 | XL | 8 |
| BM-09 | L | 9 |
| BM-10 | L | 10 |

**Indicative total:** ~10–14 engineer-weeks for one focused backend engineer (overlaps with frontend/QA). Validate after BM-03 against real velocity (`DEVELOPMENT_ROADMAP.md` assumptions).

---

## Definition of backend MVP done

When BM-01–BM-10 completion criteria are met:

1. SSO-only auth seeds Free **300** credits.  
2. Guest **1** screenshot audit + claim.  
3. Free screenshot → brief result with credit metering.  
4. Pro/Business URL audit → scored recommendations.  
5. PDF for paid tiers; Stripe upgrade/top-up via webhooks only.  
6. History, notifications, settings, account delete.  
7. RLS, SSRF, PCI, rate limits, refund integrity verified.  
8. Full in-scope API surface from `API_SPECIFICATION.md` on staging.

---

## Related documents

| Doc | Role |
|-----|------|
| DEVELOPMENT_ROADMAP.md | Sprint calendar alignment |
| API_SPECIFICATION.md | Endpoint contracts |
| DATABASE_MIGRATION.md | Schema apply order |
| BUSINESS_RULES.md | Server enforcement IDs |
| AI_WORKFLOW.md / AI_PROMPTS.md | Pipeline & prompts |
| TEST_CASES.md | QA scenarios |
| DEPLOYMENT.md | Environments & release |
| SECURITY.md | Hardening bar for BM-10 |

---

**End of BACKEND_TASKS.md**
