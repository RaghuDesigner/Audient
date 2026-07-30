# Audient — Deployment Guide

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Engineering · DevOps · QA · Founders  

**Related:** `TECHNICAL_ARCHITECTURE.md` (§12) · `DEVELOPER_GUIDELINES.md` · `SECURITY.md` · `DATABASE.md` · `PRICING.md` · `ANALYTICS.md` · `ACCESSIBILITY.md` · `TEST_CASES.md` · `DEVELOPMENT_ROADMAP.md` · `.env.example` · `AGENTS.md`

**Format:** Markdown only — operational specification, not application code.

**Topology (summary):** Next.js on **Vercel** (web + API + Stripe webhooks) · **Supabase** (Auth, Postgres, Storage) · **Prisma** over Postgres · Audit **workers** on Railway/Render/Fly · **Upstash Redis** (BullMQ) · **Stripe** · LLM provider · Observability via Sentry + uptime/logs.

---

## 1. Architecture Overview

```text
Browser ──HTTPS──► Vercel Edge CDN ──► Next.js (SSR + Route Handlers)
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
   Supabase Auth    Postgres+RLS    Storage (private)
         │               ▲                ▲
         │               │                │
         └────── Redis queue ──► Workers (Playwright, AI, PDF)
                         │
                    Stripe ◄── webhooks ── Vercel /api/webhooks/stripe
```

| Component | Host | Why |
|-----------|------|-----|
| Marketing + app | Vercel | Global CDN, SSR, preview deploys |
| API / webhooks | Vercel serverless | Short-lived orchestration |
| Workers | Railway / Render / Fly | Long audits (≤ ~8 min URL); Chromium |
| DB / Auth / Storage | Supabase | Managed Postgres + RLS + Auth + buckets |
| Queue / cache | Upstash Redis (or managed Redis) | BullMQ + rate limits |
| Payments | Stripe | PCI-safe; test vs live keys per env |

**Do not** run full URL crawl/AI/PDF generation inside Vercel serverless timeouts.

---

## 2. Development Environment

### 2.1 Required software

| Tool | Version / notes |
|------|-----------------|
| **Node.js** | `>=18.18` (engines); prefer **Node 22** per `.nvmrc` |
| **npm** | Bundled with Node (default package manager for this repo) |
| **Git** | 2.x |
| **Cursor** or **VS Code** | IDE |
| **Supabase CLI** (optional) | Local Supabase / migrations |
| **Docker** (optional) | Local Redis / Playwright deps |
| **Stripe CLI** (recommended) | Forward webhooks to localhost |
| **nvm** / **fnm** | Pin Node via `.nvmrc` |

Optional later: Playwright browsers for local worker testing, Redis locally (`REDIS_URL`).

### 2.2 Cursor setup

1. Open the repo root in Cursor.  
2. Read `AGENTS.md`, `docs/CURSOR_RULES.md`, `docs/DEVELOPER_GUIDELINES.md` before coding.  
3. Ensure TypeScript, ESLint, and Tailwind are picked up from project config.  
4. Use `@/` imports; do not invent folder layouts (`FOLDER_STRUCTURE.md`).  
5. Prefer Agent/Composer with docs context: SCREEN_MAPPING, BUSINESS_RULES, PRICING.  
6. Never paste production secrets into chat or commits.

### 2.3 VS Code / Cursor extensions (recommended)

| Extension | Purpose |
|-----------|---------|
| ESLint | Lint on save |
| Prettier | Format (`prettier-plugin-tailwindcss`) |
| Tailwind CSS IntelliSense | Class completion |
| Prisma | Schema highlighting (when Prisma active) |
| Playwright Test for VS Code | E2E (when suite exists) |
| Error Lens (optional) | Inline diagnostics |
| GitLens (optional) | Blame / history |

Disable formatters that fight Prettier; rely on repo `.prettierrc.json`.

### 2.4 Node version

```bash
nvm use          # reads .nvmrc → 22
node -v          # expect v22.x
```

CI and Vercel should use the same major (Node 22). Document any intentional drift in the PR.

### 2.5 Package manager

- **npm** is the standard (`package-lock.json`).  
- Do not mix yarn/pnpm lockfiles unless the team formally switches.  
- Install: `npm ci` in CI; `npm install` locally when adding deps.

---

## 3. Environment Variables

Canonical list: **`.env.example`**. Copy to `.env.local` for local; configure the same keys in Vercel / worker secrets per environment.

| Variable | Local | Preview | Staging | Production | Notes |
|----------|:-----:|:-------:|:-------:|:----------:|-------|
| `NEXT_PUBLIC_APP_URL` | localhost | Preview URL | staging URL | `https://audient.app` (final) | No trailing slash inconsistency |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ | ✓ | Per-project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ | ✓ | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ | ✓ | **Server only** |
| `DATABASE_URL` | ✓ | ✓ | ✓ | ✓ | Pooled (PgBouncer) |
| `DIRECT_URL` | ✓ | ✓ | ✓ | ✓ | Migrations |
| `STRIPE_*` / publishable | when billing | test | test | **live** | Never use live on preview |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI | env-specific endpoint | ✓ | ✓ | Per endpoint |
| `REDIS_URL` | local/Upstash | shared staging OK | ✓ | ✓ | Workers + RL |
| `AI_API_KEY` | ✓ | staging key | ✓ | prod key | Budget alerts |

**Rules**

- Never commit `.env.local` or real secrets.  
- `NEXT_PUBLIC_*` is browser-visible — no service-role or Stripe secret there.  
- Isolate **dev / staging / prod** Supabase projects and Stripe mode.  
- Document every new variable in `.env.example` with a comment.

---

## 4. Supabase Setup

### 4.1 Projects

Create **three** Supabase projects (minimum): `audient-dev`, `audient-staging`, `audient-prod` (names flexible).

Per project:

1. Enable **Auth** providers: **Google, Apple, Microsoft** (product SSO — not GitHub/password UI).  
2. Set redirect URLs for local (`http://localhost:3000/**`), Vercel previews, staging, production.  
3. Create **private** storage buckets for screenshots/PDFs (user-scoped keys).  
4. Apply **RLS** policies from `supabase/migrations` (`userId = auth.uid()`).  
5. Copy URL, anon key, service-role key into the matching env.

### 4.2 Local Supabase (optional)

```bash
npx supabase start
# use local API URL + keys in .env.local
npx supabase db reset   # apply migrations + seed if present
```

Prefer a shared cloud **dev** project if local Docker is unavailable.

### 4.3 Auth redirect checklist

| Environment | Example redirect allow-list |
|-------------|----------------------------|
| Local | `http://localhost:3000/**` |
| Preview | `https://*.vercel.app/**` (or project pattern) |
| Staging | `https://staging.audient.app/**` |
| Production | `https://audient.app/**`, `https://www.audient.app/**` |

---

## 5. Database Migration

Audient uses **PostgreSQL** via Supabase with **Prisma** (schema in `prisma/`) and/or SQL in `supabase/migrations/` for RLS.

### 5.1 Developer workflow

1. Change `prisma/schema.prisma` (and RLS SQL as needed).  
2. Create migration locally (`prisma migrate dev` / Supabase migration).  
3. Review SQL for expand/contract safety (no reckless drops).  
4. PR includes migration files + rollback notes.  
5. CI validates schema (`prisma validate` when wired).

### 5.2 Deploy workflow

```text
CI green → merge main →
  1) prisma migrate deploy (against target DIRECT_URL)
  2) confirm RLS still enabled
  3) deploy Vercel web
  4) deploy workers (compatible with new schema)
```

| Rule | Detail |
|------|--------|
| Order | Migrate **before** or atomically with app code that requires new columns |
| Prod | Never “migrate from laptop” ad-hoc; use CI/CD or controlled release job |
| Zero downtime | Expand/contract; avoid locking large tables in peak hours |
| Backups | Ensure PITR / snapshot before risky prod migrations |

---

## 6. Local Development

```bash
git clone <repo-url>
cd Audient
nvm use
npm install
cp .env.example .env.local   # fill Supabase (+ Stripe/Redis/AI as needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Production build locally | `npm run build && npm run start` |

**Stripe webhooks locally**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# put whsec_… into .env.local as STRIPE_WEBHOOK_SECRET
```

**Workers locally (later sprints):** run `workers/` against local/Upstash Redis with Playwright installed; point at the same `DATABASE_URL` / Supabase as the app.

---

## 7. GitHub Repository

| Item | Standard |
|------|----------|
| Hosting | GitHub |
| Default branch | `main` (protected) |
| Protection | Require PR, required CI checks, no force-push |
| Secrets | GitHub Actions secrets for CI-only; app secrets in Vercel/worker stores |
| CODEOWNERS (optional) | Require review on `prisma/`, `supabase/`, billing, auth |

Do not store production dumps or `.env` files in the repo.

---

## 8. Branch Strategy

Aligns with `DEVELOPER_GUIDELINES.md`:

| Branch | Purpose |
|--------|---------|
| `main` | Production; auto-deploy web + trigger worker/migrate jobs |
| `feat/*` | Features |
| `fix/*` | Fixes |
| `chore/*` | Tooling/docs |
| `hotfix/*` | Urgent prod fixes from `main` |

Flow: branch → PR → CI + Vercel Preview → review → merge `main` → production.

---

## 9. CI/CD Pipeline

High-level (from TECHNICAL_ARCHITECTURE §12.5):

```text
Push/PR → GitHub Actions (lint · typecheck · test · build)
       → Vercel Preview
Merge main → migrate deploy → Vercel Production → Worker deploy
```

### 9.1 GitHub Actions (required jobs)

| Job | Command / check |
|-----|-----------------|
| Setup | Node 22, `npm ci` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format:check` |
| Unit tests | `npm test` (when present) |
| Build | `npm run build` (with dummy/public env as needed) |
| Prisma validate | when schema present |

Optional: Playwright smoke on staging after deploy; axe on P0 routes.

**Rules:** PRs cannot merge on failed required checks; no secrets in logs; cache `~/.npm`.

### 9.2 Preview deployments

- Vercel Git integration creates a **unique URL per PR**.  
- Wire Preview env to **dev/staging** Supabase + **Stripe test** keys (never live).  
- Auth redirect allow-list must include Vercel preview domains.  
- Workers: Preview may share staging workers/queue with clear job tagging, or skip heavy audits until staging.  
- QA uses Preview + `TEST_CASES.md` smoke subset.

### 9.3 Vercel deployment (web)

1. Import GitHub repo into Vercel.  
2. Framework: Next.js; install `npm ci`; build `npm run build`; output default.  
3. Set env vars per Environment (Production / Preview / Development).  
4. Production branch: `main`.  
5. Enable deployment protection on staging if needed.

**Stripe webhook (prod/staging):** point Stripe Dashboard endpoints at:

`https://<host>/api/webhooks/stripe`

Update `STRIPE_WEBHOOK_SECRET` per endpoint.

### 9.4 Worker deployment

| Step | Action |
|------|--------|
| Host | Railway / Render / Fly |
| Runtime | Node 22 + Playwright/Chromium deps |
| Deploy | On `main` merge (GitHub Action or host Git integration) |
| Env | Same logical secrets as web for DB/Redis/AI/Supabase **service** access |
| Scale | Horizontal replicas; concurrency caps for AI cost |
| Health | Process heartbeat / queue lag metrics |

Pause or scale-to-zero carefully during incident rollback.

### 9.5 Production deployment

1. CI green on `main`.  
2. Database backup / PITR confirmation.  
3. `prisma migrate deploy` to **prod** `DIRECT_URL`.  
4. Vercel promotes production deployment.  
5. Workers roll out (compatible schema).  
6. Verify Stripe live webhook delivery.  
7. Run **Post Deployment Verification** (§19).

---

## 10. Domain Setup

| Record | Target |
|--------|--------|
| Apex `audient.app` | Vercel A/ALIAS per Vercel DNS docs |
| `www.audient.app` | CNAME → Vercel |
| `staging.audient.app` | Vercel staging project/env |

Also configure:

- Supabase Auth Site URL + redirects for production domain.  
- `NEXT_PUBLIC_APP_URL` = canonical production URL.  
- Stripe Customer Portal / Checkout success URLs.  
- CORS locked to Audient origins (`SECURITY.md`).

---

## 11. SSL

- **Vercel** provisions and renews TLS certificates automatically for custom domains.  
- Force HTTPS; enable HSTS via security headers (`SECURITY.md`).  
- No plaintext API.  
- Workers call external APIs over TLS; store only private CA material if ever required (not expected for MVP).

---

## 12. CDN

- Vercel **Edge Network** caches static assets (`/_next/static`, `public/`).  
- Marketing pages may use ISR/caching where safe.  
- Authenticated app routes remain **dynamic** (no CDN cache of personalized credits/HTML).  
- Signed URL downloads for PDFs/screenshots — short TTL; not publicly CDN-listed buckets.

---

## 13. Monitoring

| Signal | Tooling (recommended) |
|--------|------------------------|
| Uptime | Better Stack / Checkly hitting `GET /api/health` |
| Metrics | Datadog or Better Stack — latency, 5xx rate, queue depth |
| Business | Failed payments, refund failures, audit failure rate by code |
| Cost | LLM token usage, crawl concurrency |

**Alerts (P0):** health down, 5xx spike, webhook failures, queue backlog, refund compensation failures, Stripe signature errors.

Target: **99.9%** uptime (PRD / architecture).

---

## 14. Logging

| Source | What to log |
|--------|-------------|
| Vercel | Request logs, function errors |
| Workers | Job id, audit id, stage, duration, error code |
| App | Structured logs with `request_id` |

**Never log:** PAN, ID tokens, service-role keys, raw screenshot binaries, full card payloads.

Align with `ERROR_HANDLING.md` logging strategy.

---

## 15. Crash Reporting

| Layer | Tool |
|-------|------|
| Browser | Sentry browser SDK (scrub PII) |
| Next.js server / API | Sentry Node / Next SDK |
| Workers | Sentry in worker process |

Configure separate Sentry projects or environments (`development`, `staging`, `production`). Source maps upload in CI for readable stacks. Alert on new issue regressions.

---

## 16. Analytics

| Concern | Standard |
|---------|----------|
| Spec | `docs/ANALYTICS.md` |
| Client product analytics | PostHog / Segment / Amplitude — **after CMP consent** (SCREEN-M12) |
| Server operational events | Audit outcomes, `payment_succeeded` (webhook) — may log operationally; marketing destinations still consent-gated |
| Env | Separate projects for staging vs production |
| Privacy | No PAN; prefer host hash for URLs; honor deletion (`DELETE /me`) |

Do not enable production marketing pixels without privacy review.

---

## 17. Rollback Strategy

| Layer | Rollback method |
|-------|-----------------|
| Web (Vercel) | Instant promote **previous immutable deployment** |
| Workers | Redeploy prior image/commit; pause consumers if poison jobs |
| Database | Prefer forward fix; PITR only for catastrophic corruption (coordinate downtime) |
| Feature flags (optional) | Disable risky paths without full rollback |
| Stripe | Do not “rollback” live prices casually; use Dashboard carefully |

**Procedure**

1. Declare incident; pause risky queue if needed.  
2. Roll back Vercel to last known good.  
3. Align worker version with API schema expectations.  
4. Verify health + smoke.  
5. Postmortem; fix forward on a hotfix branch.

Migrations: design for expand/contract so app rollback remains compatible with DB forward migrations when possible.

---

## 18. Backup Strategy

### 18.1 Database backup

| Mechanism | Detail |
|-----------|--------|
| Supabase automated backups | Enabled on paid plans |
| **PITR** | Point-in-time recovery for production |
| Pre-migrate snapshot | Confirm backup window before risky DDL |
| Logical export (optional) | Periodic `pg_dump` to secure object storage for extra safety |

Test restore **quarterly** on a scratch project.

### 18.2 Object storage

- Screenshots/PDFs in private buckets; durability from provider.  
- Lifecycle/TTL per data-minimization / GDPR (`SECURITY.md`, BR-SEC-006).  
- Deletion cascades with account erase.

### 18.3 Secrets & config

- Secrets live in Vercel / worker secret stores — not only in one laptop.  
- Document recovery owners; rotate after personnel changes.

---

## 19. Production Checklist

Before promoting a build to production:

- [ ] CI green on `main`  
- [ ] Migrations reviewed and applied  
- [ ] Env vars set (no test Stripe keys on prod)  
- [ ] Supabase Auth redirects include prod domain  
- [ ] RLS enabled on user-owned tables  
- [ ] Storage buckets private  
- [ ] Stripe **live** webhook verified (signature)  
- [ ] Redis/workers healthy; concurrency capped  
- [ ] Sentry + uptime monitors armed  
- [ ] `NEXT_PUBLIC_APP_URL` canonical  
- [ ] Security headers present  
- [ ] P0 smoke from `TEST_CASES.md` scheduled  

---

## 20. Go Live Checklist

First public launch / major cutover:

### Product & billing

- [ ] Plans match `PRICING.md` (Free 300 / Pro $29·1k / Business $99·10k)  
- [ ] Stripe products/prices live; Customer Portal configured  
- [ ] Guest 1-screenshot path + claim-on-login verified  
- [ ] Free URL gate + Pro URL audit + PDF path verified  

### Legal / privacy

- [ ] Privacy / Terms live (M14/M13)  
- [ ] Cookie consent (M12) gates analytics  
- [ ] Account deletion path works  

### Ops

- [ ] Domain + SSL live; www redirect policy decided  
- [ ] Status/uptime page or monitor contacts defined  
- [ ] On-call / escalation owner named  
- [ ] Incident Recovery doc reviewed (§21)  
- [ ] Backup restore drill completed once  

### Quality

- [ ] Accessibility axe Serious=0 on P0 routes  
- [ ] Lighthouse a11y acceptable on Landing/Report  
- [ ] Load/soak smoke on audit enqueue  

---

## 21. Post Deployment Verification

Run within **15–30 minutes** of each production deploy:

| # | Check | Pass criteria |
|---|-------|----------------|
| 1 | `GET /api/health` | 200 |
| 2 | Landing loads | SCREEN-001 renders |
| 3 | SSO (one provider) | Session established |
| 4 | Credits hydrate | Header matches server |
| 5 | Screenshot audit (staging data or cheap prod) | Queues → completes or fails cleanly |
| 6 | Stripe test on staging / live canary | Webhook `200`; membership updates |
| 7 | Sentry | No new crash spike |
| 8 | Queue | Lag within SLO; no poison loop |
| 9 | Auth callback | No redirect errors in logs |
| 10 | PDF (paid canary) | Signed URL download works |

Map failures to `ERROR_HANDLING` codes; roll back if P0 broken.

---

## 22. Incident Recovery

### 22.1 Severity

| Level | Example | Response |
|-------|---------|----------|
| SEV-1 | Site down, payments broken, mass credit corruption | Page on-call; rollback; pause workers |
| SEV-2 | Audit pipeline degraded, elevated 5xx | Mitigate; partial disable URL audits if needed |
| SEV-3 | Single-feature bug | Hotfix in business hours |

### 22.2 Playbooks (short)

**Site down**

1. Check Vercel status + `/api/health`.  
2. Roll back Vercel deployment.  
3. Verify DNS/SSL.  

**Payments failing**

1. Check Stripe Dashboard + webhook delivery.  
2. Verify `STRIPE_WEBHOOK_SECRET` and endpoint URL.  
3. Do not re-grant entitlements from client events alone.  

**Credit / ledger incident**

1. Pause audit create (feature flag or scale workers to 0).  
2. Freeze related webhooks if needed.  
3. Reconcile ledger vs Stripe; restore from backup only if necessary.  

**Data breach suspicion**

1. Rotate keys (Supabase service role, Stripe, AI).  
2. Preserve logs; follow SECURITY.md / legal process.  
3. Force session invalidation if warranted.  

**Bad migration**

1. Stop deploys.  
2. Assess forward fix vs PITR (last resort).  
3. Communicate downtime window.

After every SEV-1/2: write a short postmortem (timeline, root cause, action items).

---

## 23. Environment Matrix (quick reference)

| Concern | Development | Preview | Staging | Production |
|---------|-------------|---------|---------|------------|
| Vercel | local / `vercel dev` | PR URL | staging domain | apex/www |
| Supabase | local or dev project | dev/staging | staging | prod |
| Stripe | test + CLI | test | test | **live** |
| Workers | local optional | shared staging | dedicated | dedicated HA |
| Analytics | off or dev project | off/dev | staging project | prod + consent |
| Sentry | optional | optional | on | on + alerts |
| Data | disposable | disposable | near-prod | real customers |

---

## 24. Related Documents

| Doc | Use |
|-----|-----|
| `TECHNICAL_ARCHITECTURE.md` §12 | Topology source |
| `DEVELOPER_GUIDELINES.md` | CI/deploy standards, branches, commits |
| `SECURITY.md` | Headers, secrets, SSRF, PCI |
| `DATABASE.md` / `SCHEMA.md` | Data model |
| `.env.example` | Env catalog |
| `ANALYTICS.md` | Consent-aware analytics |
| `TEST_CASES.md` | Smoke / regression after deploy |
| `DEVELOPMENT_ROADMAP.md` | When infra pieces come online |
| `ERROR_HANDLING.md` | Failure codes during verification |

---

**End of DEPLOYMENT.md**
