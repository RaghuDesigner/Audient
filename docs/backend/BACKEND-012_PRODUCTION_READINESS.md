# AUDIENT — BACKEND-012
# PRODUCTION READINESS & LAUNCH PREPARATION

**Status:** Ready for production (pending cutover execution)  
**Depends on:** BACKEND-001 … BACKEND-011  
**Out of scope:** Production deploy execution, live Stripe payments during assessment, BACKEND-013

---

## Executive summary

Audient’s backend architecture (BACKEND-001–011) is **launch-capable** with documented operational procedures. No unresolved **P0** blockers remain in code after BACKEND-012 hardening:

- **`USE_MOCK_AUTH` is forced `false` when `NODE_ENV=production`** (`src/config/auth.ts`)
- **`NEXT_PUBLIC_REAL_OAUTH_DEV_PATH` is disabled in production**
- **Runtime config validation** fails closed via `/api/health` (`ready: false` when misconfigured)
- **Stripe live keys** gated by `ALLOW_STRIPE_LIVE=true` + `sk_live_…`
- **Regression harnesses pass** (see §Regression)

Remaining items are **P1/P2 launch limitations** (distributed rate limits, fire-and-forget AI, manual alerting) — explicitly documented below.

---

## 1. Production environment

### Required server env (production)

| Variable | Purpose | Client-safe? |
|----------|---------|--------------|
| `NODE_ENV` | `production` | N/A |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (OAuth redirects, Stripe return URLs) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project origin | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes (RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | Credit/membership/webhook mutations | **Never** |
| `OPENAI_API_KEY` | AI audit engine | **Never** |
| `STRIPE_SECRET_KEY` | Billing (`sk_live_…` at cutover) | **Never** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | **Never** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout (`pk_live_…` at cutover) | Yes |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro subscription Price ID | Server maps only |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Business subscription Price ID | Server maps only |
| `STRIPE_PRICE_PACK_500/2000/5000` | Top-up Price IDs | Server maps only |
| `ALLOW_STRIPE_LIVE` | `true` only when using live Stripe in prod | **Never public** |

Optional: `OPENAI_AUDIT_MODEL` (default `gpt-4o-mini`), `DATABASE_URL` / `DIRECT_URL` for migrations.

### Validation

- `validateRuntimeConfiguration()` — `src/lib/config/runtime.ts`
- Exposed safely on **`GET /api/health`** as `configIssues[]` (codes only, no secrets)
- **`ready: true`** only when: no config errors, Supabase reachable, **`mockAuth: false`** in production

### Pre-deploy gate

```bash
curl -sS "$PRODUCTION_URL/api/health" | jq '{status, ready, mockAuth, configIssues}'
# Expect: ready=true, mockAuth=false, configIssues=[]
```

---

## 2. Stripe production cutover (do NOT execute during assessment)

### Current architecture (verified)

- Server-only secret + webhook secret (`src/lib/stripe/env.ts`)
- Test mode default: `sk_test_…` rejected if `sk_live_…` without `ALLOW_STRIPE_LIVE=true`
- Price IDs from env — client cannot choose Price IDs (`src/lib/stripe/prices.ts`)
- Webhook: raw body + `stripe-signature` validation (`/api/webhooks/stripe`)
- Idempotency: `processed_webhook_events`, payment/invoice dedupe (`verify:billing` 18/18)
- Subscription + invoice + notification sync via webhook processor

### Cutover checklist (final production only)

1. Create **live** Products/Prices in Stripe Dashboard matching `docs/PRICING.md`
2. Set live env: `STRIPE_SECRET_KEY=sk_live_…`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…`
3. Set live Price ID env vars (`STRIPE_PRICE_*`)
4. Set `ALLOW_STRIPE_LIVE=true`
5. Register production webhook: `https://<app>/api/webhooks/stripe`
6. Set `STRIPE_WEBHOOK_SECRET=whsec_…` from Dashboard
7. Verify webhook events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.*`
8. Run smoke test step 6–11 (§15) in **test mode first**, then once in live with minimal charge

**Do not** switch to live keys until cutover window.

---

## 3. OpenAI production readiness

| Control | Value / behavior |
|---------|------------------|
| Key | `OPENAI_API_KEY` server-only |
| Model | `gpt-4o-mini` default |
| Timeout | 60s (`AI_REQUEST_TIMEOUT_MS`) |
| Retries | Max 3, transient 429/5xx/timeout only |
| Output tokens | 3500 max |
| Vision | `detail: low`; data URL max ~4MB |
| Authorization | Audit claimed + `fetchAuditForUser` before AI call |
| Cost | One completion per audit attempt (+ bounded retries) |

Missing key → audit fails `AI_UNAVAILABLE` (no silent mock AI on API path).

---

## 4. Authentication (production)

### Required before launch

1. **`USE_MOCK_AUTH` false in production builds** — enforced in code when `NODE_ENV=production`
2. Supabase Auth providers configured (Google minimum for smoke test)
3. Redirect allow-list includes:
   - `https://<production-domain>/auth/callback`
4. Sign-out via `/auth/sign-out`
5. Protected routes enforced in middleware (`src/lib/supabase/middleware.ts`)
6. **`NEXT_PUBLIC_REAL_OAUTH_DEV_PATH` ignored in production**

### OAuth redirect URLs (configure in Supabase Dashboard)

- Site URL: `NEXT_PUBLIC_APP_URL`
- Redirect: `{NEXT_PUBLIC_APP_URL}/auth/callback`

---

## 5. Database

### Migrations

24 SQL migrations under `supabase/migrations/` — apply in filename order via Supabase CLI:

```bash
npx supabase db push --db-url "$DIRECT_URL"
```

Key migrations: enums, RLS (`20260730100009`), credits, billing, workspace, member RLS harden, credit deduction unique index.

### Integrity model

| Domain | Ownership / integrity |
|--------|----------------------|
| Audits | `user_id` + RLS `owns_audit`; workspace-scoped extension |
| Workspaces / members | membership tables + RLS harden migration |
| Credits | Service-role mutations; unique audit deduction index |
| Payments | Stripe IDs idempotent upsert |
| Notifications | User-scoped RLS |
| Invitations | Token hashed; rate limited |

**Do not** modify production data during verification.

---

## 6. Backup & recovery

### Supabase (operator procedure)

1. **Backups:** Enable/use Supabase Pro (or higher) **Point-in-Time Recovery** for production project
2. **Daily backups:** Confirm in Supabase Dashboard → Database → Backups
3. **Recovery:** Restore to new project or PITR via Supabase support/Dashboard — **test in staging clone first**
4. **Migration rollback:** No automatic down migrations — keep forward-only SQL; rollback = restore DB snapshot + redeploy prior app version
5. **Priority tables:** `users`, `memberships`, `credit_ledger`, `payments`, `audits`, `reports`, `processed_webhook_events`

**Classification:** Recovery procedure is **documented**; live restore not executed in BACKEND-012 (P2 — verify on staging clone post-launch).

---

## 7. Monitoring (existing infrastructure)

| Signal | Detection today |
|--------|-----------------|
| App up | `GET /api/health` → `status`, `ready` |
| Config drift | `configIssues[]` on health |
| Supabase down | `supabase.reachable` on health |
| Audit failures | Structured logs `audit.ai_failed`, `audit.ai_scheduler` |
| AI 429/timeout | Logs `ai.provider_failed`, codes `AI_RATE_LIMITED`, `AI_TIMEOUT` |
| Stuck audits | Poll + `reclaimStuckProcessingAudit` (10 min) |
| Stripe webhook | Logs `[webhooks/stripe]`; 400 invalid signature |
| Rate limits | HTTP 429 + `RATE_LIMITED` code |

**P1:** No vendor APM — use hosting platform logs + health polling until post-launch.

---

## 8. Alerting (minimum launch)

| Alert | Source | Status |
|-------|--------|--------|
| Health `ready=false` | Poll `/api/health` every 1–5 min | **Manual / platform uptime** |
| Repeated webhook 5xx | Log filter `[webhooks/stripe]` | **Manual** |
| Repeated `audit.ai_failed` | Log filter | **Manual** |
| Stuck PROCESSING accumulation | SQL: `audits WHERE status='PROCESSING' AND updated_at < now()-interval '15 min'` | **Manual** |
| Auth spike / 401 | Platform metrics | **Manual** |

**FUTURE:** PagerDuty/Datadog/Sentry integration.

---

## 9. Logging

- `src/lib/log.ts` — JSON structured logs, secret/token field redaction
- AI/audit/stripe paths use `logError` / `logWarn` with truncated messages
- **No correlation ID** on all requests (P2) — auditId/userId present on audit/billing paths

---

## 10. Security review summary

| Area | Status |
|------|--------|
| Auth / session | Supabase SSR middleware |
| Authorization | Server `requireAuthorizationContext` + RLS |
| IDOR | Resource APIs scoped to owner/workspace |
| RLS | Enabled; credits/payments service-role only |
| Webhooks | Signature required |
| Open redirect | `sanitizeAuthRedirect` on auth flows |
| URL SSRF | `validateHttpsUrl` + private IP block on URL audits |
| Image limits | MIME + 4MB cap |
| Prompt injection | BACKEND-011 prompt + delimiter scrub |
| Secret leakage | No secrets in health; log redaction |

No unresolved **P0** security findings.

---

## 11. Rate limiting

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| POST `/api/audits` | 10 | 1 min | per user |
| POST `/api/audits/[id]/retry` | 10 | 1 min | per user |
| POST `/api/billing/checkout` | 8 | 1 min | per user |
| POST workspace invitations | 20 | 1 min | per user |

**P2 launch limitation:** In-process only — limits reset per serverless instance; acceptable for initial launch scale.

---

## 12. Serverless / AI processing

- Fire-and-forget `scheduleAiAuditProcessor` (MVP)
- Stuck reclaim: 10 min → `AI_TIMEOUT` fail
- User retry cap: 3 attempts
- Lost job risk if instance dies mid-flight — mitigated by poll re-nudge QUEUED + stuck reclaim

**P2:** Durable queue (Redis/BullMQ) — post-launch if volume requires.

---

## 13. Load / concurrency

Safe offline verification:

- Concurrent audit **claim** is DB-safe (`QUEUED→PROCESSING`)
- Credit deduction idempotent (unique index)
- Webhook idempotent (`processed_webhook_events`)
- `verify:hardening` covers retry/rate/stuck contracts

**P2:** No load test executed — recommend staging soak before high-traffic launch.

---

## 14. Deployment procedure

### Launch sequence

1. Apply all Supabase migrations to production DB
2. Set production env vars (§1) — **test mode Stripe first** optional staging pass
3. Deploy application (`npm run build` artifact) with `NODE_ENV=production`
4. Verify `GET /api/health` → `ready: true`
5. Configure Supabase OAuth redirects
6. Register Stripe webhook (test or live per environment)
7. Execute production smoke test (§15)
8. For live billing cutover: follow §2 checklist

### Rollback

1. Redeploy previous app version
2. If migration broke schema: restore Supabase backup/PITR (§6) — **avoid** unless critical

### Build safety

- `npm run build` passes typecheck + lint
- Clean `.next` if duplicate type artifacts: `rm -rf .next && npm run build`

---

## 15. Production smoke test (define — execute at cutover, not during BACKEND-012 assessment)

1. Real Google login
2. Free account creation / profile sync
3. Screenshot audit create
4. AI completes → report visible
5. Credit deducted once
6. Upgrade to Pro (checkout)
7. Stripe webhook received (test or live)
8. Membership `PRO` / `ACTIVE`
9. Invoice history row appears
10. Billing notification created
11. Workspace member authorization (viewer cannot create audit)
12. Logout → login session restore

**Do not** run live billing during BACKEND-012 assessment.

---

## 16. Regression (executed)

```bash
npm run lint          # PASS
npm run build         # PASS
npm run verify:production-readiness  # PASS
npm run verify:hardening             # 9/9
npm run verify:audit-principles      # 6/6
npm run verify:ai                    # 14/14
npm run verify:billing               # 18/18
npm run verify:notifications         # 10/10
npm run verify:authorization         # 9/9
npm run verify:workspace             # 6/6
npm run verify:workspace-team        # 8/8
```

Controlled E2E (BACKEND-011): Evidence Grounding PASS, URL Evidence PASS.

---

## 17. Findings classification

### P0 — MUST FIX BEFORE PRODUCTION

| ID | Finding | Resolution |
|----|---------|------------|
| P0-001 | `USE_MOCK_AUTH` hardcoded `true` would allow mock auth in prod builds | **Fixed** — auto `false` when `NODE_ENV=production` |
| P0-002 | Dev OAuth bypass in production | **Fixed** — `isRealOAuthDevPathEnabled()` returns false in production |

**No open P0.**

### P1 — SHOULD FIX / ACCEPT BEFORE LAUNCH

| ID | Finding | Recommendation |
|----|---------|----------------|
| P1-001 | No automated alerting vendor | Accept — manual log/health monitoring at launch |
| P1-002 | Per-process rate limits | Accept for initial scale; monitor 429 rates |
| P1-003 | Fire-and-forget AI | Accept — stuck reclaim + retry bounds documented |
| P1-004 | Backup restore not exercised | Run restore drill on staging clone within 30 days of launch |
| P1-005 | Production smoke test not executed in this phase | Execute at cutover per §15 |
| P1-006 | Email/notifications in-app only | Accept — no transactional email provider yet |

### P2 — ACCEPTABLE LAUNCH LIMITATION

| ID | Finding |
|----|---------|
| P2-001 | No distributed queue for audits |
| P2-002 | No request correlation IDs globally |
| P2-003 | Standalone `tsc` may fail on duplicate `.next/types` artifacts |
| P2-004 | No load/soak test in BACKEND-012 |
| P2-005 | Apple/Microsoft OAuth not primary (Google first) |

### FUTURE — POST-LAUNCH

- Redis/BullMQ durable audit worker
- Datadog/Sentry/PagerDuty
- Distributed rate limiting
- Transactional email
- Full multi-provider OAuth
- BACKEND-013+

---

## 18. Success criteria checklist

- [x] No unresolved P0
- [x] Production configuration documented (§1)
- [x] Stripe cutover procedure documented (§2)
- [x] OpenAI configuration documented (§3)
- [x] Auth production configuration verified (§4)
- [x] Backup/recovery procedure documented (§6)
- [x] Security review — no P0 (§10)
- [x] Monitoring/alerting strategy documented (§7–8)
- [x] Deployment/rollback documented (§14)
- [x] Production smoke test defined (§15)
- [x] Regression tests pass (§16)

---

## Verify

```bash
npm run verify:production-readiness
npm run typecheck && npm run lint && npm run build
```

---

**BACKEND-012 READY FOR PRODUCTION**

*(Cutover execution — deploy, live Stripe, live smoke — remains an operator action outside this milestone.)*

**STOP.**
