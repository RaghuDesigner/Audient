# AUDIENT — BACKEND-012A
# PRODUCTION BLOCKER CLOSURE

**Status:** Implementation complete (cutover not executed)  
**Depends on:** BACKEND-012, BACKEND-001 … BACKEND-011  
**Out of scope:** Production deploy, live Stripe, live OAuth cutover, BACKEND-013

---

## Executive summary

BACKEND-012A closes the remaining **P0/P1** production blockers identified in the read-only plan:

| Area | Delivery |
|------|----------|
| P0 Production configuration | Documented env matrix + dashboard steps (this doc §1–4) |
| P0 Health-gated deployment | `GET /api/health` readiness + `scripts/deploy-health-gate.mjs` |
| P1 Boot-time fail-closed | `src/instrumentation.ts` → `assertProductionSafeOrThrow()` |
| P1 Production smoke test | §6 (PRE / POST cutover) |
| P1 Alerting | §7 (manual + existing health/log hooks) |
| P1 Backup / recovery | §8 (Supabase-native; no destructive drill) |

**Local TEST environment is preserved:** `NODE_ENV !== production` keeps mock auth, test Stripe keys, and localhost URLs valid.

---

## 1. P0 — NODE_ENV & production configuration

### NODE_ENV

Set on the hosting platform (not in source control):

```bash
NODE_ENV=production
```

Effects in this codebase:

- `USE_MOCK_AUTH` is forced **false** (`src/config/auth.ts`)
- `NEXT_PUBLIC_REAL_OAUTH_DEV_PATH` dev OAuth shortcut is **disabled**
- `validateRuntimeConfiguration()` treats missing critical env as **errors**
- `assertProductionSafeOrThrow()` runs at server boot (`src/instrumentation.ts`)
- `/api/health` returns **`503`** when not `ready` in production

### Required production environment variables

| Variable | Required | Client-safe? | Notes |
|----------|----------|--------------|-------|
| `NODE_ENV` | Yes | N/A | Must be `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Public HTTPS origin, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Project origin only (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | RLS-bound anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** | Server-only; credits, webhooks, admin paths |
| `OPENAI_API_KEY` | Yes | **Never** | AI audit engine |
| `STRIPE_SECRET_KEY` | Yes | **Never** | `sk_test_…` until cutover; then `sk_live_…` + `ALLOW_STRIPE_LIVE=true` |
| `STRIPE_WEBHOOK_SECRET` | Yes | **Never** | From Stripe Dashboard / CLI |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Yes | `pk_test_…` until cutover; then `pk_live_…` |
| `STRIPE_PRICE_PRO_MONTHLY` | Yes | Server maps | Live Price ID at cutover |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Yes | Server maps | Live Price ID at cutover |
| `STRIPE_PRICE_PACK_500` | Yes | Server maps | Live Price ID at cutover |
| `STRIPE_PRICE_PACK_2000` | Yes | Server maps | Live Price ID at cutover |
| `STRIPE_PRICE_PACK_5000` | Yes | Server maps | Live Price ID at cutover |
| `ALLOW_STRIPE_LIVE` | At live cutover | **Never** | `true` only when using `sk_live_…` |

Optional:

| Variable | Purpose |
|----------|---------|
| `OPENAI_AUDIT_MODEL` | Default `gpt-4o-mini` |
| `APP_URL` | Fallback alias for `NEXT_PUBLIC_APP_URL` (prefer public var) |
| `DATABASE_URL` / `DIRECT_URL` | Migrations via Supabase CLI only |

**Never commit real secrets.** Use platform secret stores. `.env.example` lists names only.

### Validation codes (safe, no secret values)

Boot and `/api/health` surface these via `configIssues[]`:

- `MOCK_AUTH_IN_PRODUCTION`
- `SUPABASE_PUBLIC_ENV`
- `SUPABASE_SERVICE_ROLE`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_KEY_MODE` / `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_IDS`
- `APP_URL` / `APP_URL_LOCALHOST`

Implementation: `src/lib/config/runtime.ts`

---

## 2. P0 — Google / OAuth production URLs

Configure in **Supabase Dashboard → Authentication → Providers → Google**:

1. Create **Google Cloud OAuth client** (Web application) for production.
2. **Authorized JavaScript origins:** `https://<your-production-domain>`
3. **Authorized redirect URIs:**
   - `https://<your-production-domain>/auth/callback`
   - `https://<your-project-ref>.supabase.co/auth/v1/callback` (Supabase default)
4. Paste Client ID + Secret into Supabase Google provider settings.

Configure in **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Production value |
|---------|------------------|
| Site URL | `https://<your-production-domain>` |
| Redirect URLs (allow list) | `https://<your-production-domain>/auth/callback` |

App callback route: `src/app/auth/callback/route.ts`  
Client redirect uses `window.location.origin` in production builds tied to `NEXT_PUBLIC_APP_URL`.

**Pre-cutover:** Keep Google OAuth client in **testing** mode with test users until domain verification is complete.

---

## 3. P0 — Supabase production configuration

1. Create or select **production Supabase project** (separate from local dev recommended).
2. Apply migrations: `supabase db push` or run SQL from `supabase/migrations/` in order.
3. Set env on host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Enable **Google** provider (§2).
5. Confirm **RLS enabled** on user-facing tables (migrations include RLS policies).
6. Storage buckets: configure per `docs/TECHNICAL_ARCHITECTURE.md` if audit uploads use Storage.

Connectivity probe: `/api/health` → `supabase.reachable: true` (Auth health endpoint, read-only).

---

## 4. P0 — Stripe & OpenAI production configuration

### Stripe (TEST until controlled cutover)

**Before live cutover (recommended smoke path):**

- `STRIPE_SECRET_KEY=sk_test_…`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`
- Test Price IDs in `STRIPE_PRICE_*`
- **Do not** set `ALLOW_STRIPE_LIVE=true`
- Webhook: Stripe CLI or Dashboard test webhook → `https://<staging-or-prod>/api/webhooks/stripe`

**At live cutover only:**

1. Create live Products/Prices matching `docs/PRICING.md`
2. Set live keys and Price IDs
3. Set `ALLOW_STRIPE_LIVE=true`
4. Register production webhook endpoint; set `STRIPE_WEBHOOK_SECRET`
5. Verify events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.*`

Architecture unchanged: server-only secrets, signature verification, idempotent webhook processing (`verify:billing`).

### OpenAI

- Set `OPENAI_API_KEY` in platform secrets (server-only).
- Optional: `OPENAI_AUDIT_MODEL=gpt-4o-mini`
- Controls: 60s timeout, max 3 retries, token/image caps (`src/lib/ai/client.ts`)

---

## 5. P0 — Health-gated deployment

Production traffic must not land on a misconfigured instance.

### Readiness contract

**`GET /api/health`** (`src/app/api/health/route.ts`):

| Field | Production requirement |
|-------|------------------------|
| HTTP status | `200` when `ready=true`; **`503`** when unhealthy |
| `ready` | `true` |
| `mockAuth` | `false` |
| `configIssues` | `[]` |
| `supabase.reachable` | `true` |

### CI / post-deploy gate

```bash
DEPLOY_HEALTH_URL=https://your-app.example.com npm run verify:health-gate
```

Script: `scripts/deploy-health-gate.mjs` — polls until ready or fails (exit 1).

**Recommended promotion flow:**

1. Deploy new revision with production env vars set on platform.
2. Run health gate against deployment URL (preview or production).
3. **Only promote / swap traffic** when gate passes.
4. Re-run gate after DNS cutover.

No additional monitoring vendor required. Works with Vercel, Railway, Fly.io, or any host that exposes HTTPS.

### Boot-time complement

Even if traffic routing fails, **`src/instrumentation.ts`** prevents a production Node process from staying up with invalid config (actionable error, no secrets).

---

## 6. P1 — Production smoke test

### PRE-CUTOVER (safe — TEST Stripe, no live payment)

Run against staging or production URL with **test** Stripe keys.

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `curl -sS $URL/api/health \| jq '{ready,mockAuth,configIssues}'` | `ready=true`, `mockAuth=false`, `configIssues=[]` |
| 2 | Open `/` — Google login (test user) | Session established; redirect to dashboard |
| 3 | Upload screenshot / start audit | Audit enters PROCESSING |
| 4 | Wait for completion | COMPLETED with AI findings (evidence fields present) |
| 5 | Check credits | Deduction recorded; balance updated |
| 6 | Start checkout (Pro or pack) — **TEST card** `4242…` | Stripe Checkout completes |
| 7 | Webhook delivery | Membership/credits updated; no duplicate charges |
| 8 | Invoice history | Invoice row visible |
| 9 | Notifications | Payment/membership notification appears |
| 10 | Workspace | Invite/member role enforced |
| 11 | Logout → login | Session restored; data persists |

**Do not** use live card or `ALLOW_STRIPE_LIVE=true` in PRE-CUTOVER.

### POST-CUTOVER (controlled live sequence — execute once at launch)

Same flow as PRE-CUTOVER with **live** Stripe keys and a **minimal real charge** under change control:

```
Google login
  → account
  → audit
  → AI result
  → credits
  → Stripe checkout (live, minimal amount)
  → webhook
  → PRO membership
  → invoice
  → notification
  → workspace authorization
  → logout/login
```

Record: timestamp, user id, audit id, Stripe session id, webhook event id, invoice id.

**Not executed during BACKEND-012A implementation.**

---

## 7. P1 — Alerting (minimum launch set)

No third-party monitoring vendor is integrated in-repo. Use **platform logs + manual checks** until BACKEND-013 or external APM.

| Alert | Signal | Automation | Action |
|-------|--------|------------|--------|
| Application failures | `/api/health` → `503` or `ready=false` | **Manual / CI gate** | Page on-call; check deploy logs + `configIssues` |
| AI failures | Audit status FAILED + code `AI_*` | **Manual** | Check OpenAI status, key quota, `OPENAI_API_KEY` |
| Stuck audits | PROCESSING > threshold | **Manual** | Query audits; retry endpoint; check stuck reclaim |
| Stripe webhook failures | 4xx/5xx on `/api/webhooks/stripe` | **Manual** | Stripe Dashboard → Webhooks → event log |
| Payment failures | Checkout errors / failed payments | **Manual** | Stripe Dashboard + app logs (redacted secrets) |
| Notification failures | Missing notification after billing event | **Manual** | DB `notifications` table + API logs |
| Database failures | `supabase.reachable=false` on health | **Semi-auto** | Health gate fails deploy; Supabase status page |
| Authentication failures | Spike in auth errors / OAuth redirect mismatch | **Manual** | Supabase Auth logs; verify redirect URLs (§2) |

**Existing infrastructure to use:**

- Structured logging with secret redaction: `src/lib/log.ts`
- Health endpoint for synthetic checks: `/api/health`
- Deploy gate script: `npm run verify:health-gate`
- Stripe Dashboard webhook delivery logs
- Supabase Dashboard → Logs (Auth, API, Postgres)

---

## 8. P1 — Backup / recovery (Supabase)

Based on **Supabase platform capabilities** (no destructive restore drill performed).

### Backup capability

| Tier | Typical capability |
|------|-------------------|
| Supabase Pro+ | Daily automated backups (retention per plan) |
| Free | Limited / no PITR — **not recommended for production** |

Confirm backup tier in **Supabase Dashboard → Project Settings → Database → Backups**.

### Restoration process

1. **Supabase Dashboard → Database → Backups** → select restore point (Pro+)  
   **OR** contact Supabase support for PITR restore to new project.
2. Update production env vars if project ref / keys change after restore.
3. Run `GET /api/health` — confirm `supabase.reachable=true`.
4. Run PRE-CUTOVER smoke (§6) on restored environment.

**Classification:** Full restore drill **not performed** before launch — classify as **P1 manual verification required at cutover window**.

### Migration recovery

1. Keep ordered migrations in `supabase/migrations/` (source of truth).
2. If migration partially applied: inspect `supabase_migrations.schema_migrations` in Postgres.
3. Fix forward with new migration (preferred) or rollback via Supabase CLI under change control.
4. Never weaken RLS to “fix” migration issues.

### Critical data recovery priorities

1. **Auth users** (`auth.users`) — identity
2. **Membership / credits** — billing state
3. **Audits + reports** — customer deliverables
4. **Workspaces / members** — authorization
5. **Invoices / webhook idempotency tables** — financial audit trail

---

## 9. Verification (BACKEND-012A)

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:production-readiness
npm run verify:hardening
npm run verify:audit-principles
npm run verify:ai
npm run verify:billing
npm run verify:notifications
npm run verify:authorization
npm run verify:workspace
npm run verify:workspace-team
```

Health gate (requires deployed URL — not run during local implementation):

```bash
DEPLOY_HEALTH_URL=https://your-app.example.com npm run verify:health-gate
```

---

## 10. Related files

| File | Purpose |
|------|---------|
| `src/instrumentation.ts` | Boot-time fail-closed |
| `src/lib/config/runtime.ts` | Config validation |
| `src/lib/supabase/health.ts` | Readiness probe |
| `src/app/api/health/route.ts` | Health HTTP handler |
| `scripts/deploy-health-gate.mjs` | Post-deploy gate |
| `scripts/verify-production-readiness.mjs` | Static contract checks |
| `docs/backend/BACKEND-012_PRODUCTION_READINESS.md` | Parent launch guide |
| `.env.example` | Env name reference |

---

## 11. Remaining launch blockers (operational)

These are **outside repo** and require cutover execution:

1. Set production env vars on hosting platform
2. Configure Google OAuth + Supabase redirect URLs for production domain
3. Apply migrations to production Supabase project
4. Run PRE-CUTOVER smoke on deployed URL
5. Execute controlled POST-CUTOVER live payment sequence (once)
6. Schedule backup tier confirmation + restore runbook review

**BACKEND-013** (extended observability) intentionally not started.
