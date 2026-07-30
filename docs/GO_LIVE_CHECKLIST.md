# Audient — Go-Live Checklist

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Eng lead · DevOps · Product · QA · Support  

**Format:** Markdown only — checkbox runbook for private beta and public launch.  
**Related:** `DEPLOYMENT.md` · `TESTING_STRATEGY.md` · `PAYMENT_FLOW.md` · `SECURITY.md` · `ACCESSIBILITY.md` · `ANALYTICS.md` · `PRICING.md` · `DATABASE_MIGRATION.md` · `TEST_CASES.md` · `.env.example`

**Canonical product:** Free **300** · Pro **$29 / 1,000** · Business **$99 / 10,000** · Guest **1** screenshot · SSO Google/Apple/Microsoft · Stripe live entitlements **only via webhooks**.

**Mark:** □ → ☑ when verified. Record owner + timestamp in your release tracker.

---

## 0. Pre-conditions (do not launch without)

□ CI green on `main` (`typecheck`, `lint`, build, unit/integration as wired)  
□ Product acceptance signed (`TESTING_STRATEGY` § Acceptance)  
□ Staging P0 e2e smoke passed (Stripe **test**)  
□ On-call / escalation owner named for launch window  
□ Rollback owner identified and practiced once on staging  

---

## 1. Environment variables

Canonical catalog: **`.env.example`**. Production values live in Vercel + worker secret stores — **never** in git.

### 1.1 App / public

□ `NEXT_PUBLIC_APP_URL` = canonical prod URL (e.g. `https://audient.app`) — no trailing-slash drift  
□ No secrets in any `NEXT_PUBLIC_*` key  

### 1.2 Supabase

□ `NEXT_PUBLIC_SUPABASE_URL` → **prod** project  
□ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → prod anon  
□ `SUPABASE_SERVICE_ROLE_KEY` → prod service role (**server/workers only**)  

### 1.3 Database

□ `DATABASE_URL` → prod pooled (PgBouncer)  
□ `DIRECT_URL` → prod direct (migrations only)  

### 1.4 Stripe (**live** on production)

□ `STRIPE_SECRET_KEY` = `sk_live_…` (not test)  
□ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…`  
□ `STRIPE_WEBHOOK_SECRET` = `whsec_…` for **prod** webhook endpoint  
□ Price IDs / product metadata wired for Pro $29, Business $99, top-up packs  
□ Preview/staging still on **test** keys only  

### 1.5 Workers / AI / Redis

□ `REDIS_URL` → prod Upstash/managed Redis  
□ `AI_API_KEY` → prod key with budget alerts  
□ Any extra provider keys documented in `.env.example`  

### 1.6 Observability / analytics (as adopted)

□ Sentry DSN(s) for web + workers (prod environment)  
□ Analytics write key / project (prod) — client gated by consent  
□ Uptime check URL configured  

### 1.7 Hygiene

□ Every prod secret rotated from any value that ever lived in chat/screenshots  
□ `.env.example` updated for any new vars  
□ Secret scan clean on `main`  

---

## 2. Domains

□ Apex domain decided (`audient.app` or final brand domain)  
□ `www` policy decided (redirect www → apex **or** apex → www)  
□ Staging host separate (`staging.…`) — not sharing prod secrets  
□ Vercel project domain(s) attached to **Production** environment  
□ `NEXT_PUBLIC_APP_URL` matches the canonical host users will bookmark  
□ CORS allow-list = Audient origins only (`SECURITY.md`)  
□ Stripe Checkout / Portal return URLs use prod domain  
□ Email/link templates (if any) use prod domain  

---

## 3. DNS

□ Apex record per Vercel DNS docs (A / ALIAS)  
□ `www` CNAME → Vercel  
□ Staging DNS record points to staging project  
□ TTL understood for cutover / rollback  
□ Propagation verified (`dig` / DNS checker) from multiple resolvers  
□ No stale records pointing at old hosts  
□ CAA records acceptable for TLS issuer (if used)  

---

## 4. SSL

□ Vercel TLS certificate **Issued** for apex + www  
□ HTTPS forced (HTTP → HTTPS)  
□ HSTS enabled via security headers  
□ No mixed-content warnings on Landing / app shell  
□ Certificate auto-renewal confirmed (Vercel-managed)  
□ Workers and outbound API calls use TLS  

---

## 5. Database

□ Prod Postgres = **audient-prod** Supabase (isolated from staging)  
□ All migrations applied via `prisma migrate deploy` / approved pipeline (**not** laptop ad-hoc)  
□ Pre-migrate **PITR / backup** confirmed  
□ Enums, FKs, CHECKs match `DATABASE_MIGRATION.md` / `SCHEMA.md`  
□ Indexes present for history, worker pickup, ledger  
□ `Credits.balance >= 0` enforced  
□ Plans seed: Free 300 / Pro 1000 / Business 10000  
□ Connection pooling healthy (no exhaustion under smoke)  
□ Expand/contract notes filed for any risky migration  

---

## 6. Supabase

### Auth

□ Providers enabled: **Google, Apple, Microsoft** only (no password/GitHub UI)  
□ Site URL = prod canonical URL  
□ Redirect allow-list includes `https://audient.app/**` and `https://www.audient.app/**` (as used)  
□ PKCE / cookie settings reviewed  
□ Auth seed trigger: new user → Users + Membership FREE + Credits 300 + Settings  

### Storage

□ Private buckets for screenshots / PDFs / avatars  
□ No public list; access via signed URLs only  
□ User-scoped key prefix convention live  
□ Lifecycle / TTL policy documented for GDPR  

### RLS

□ RLS **enabled** on all user-owned tables  
□ Policies use `auth.uid()` ownership  
□ Verified: user A cannot read user B rows  
□ Service role used only server-side (webhooks, workers)  

---

## 7. Stripe

□ Stripe account switched to **live** mode for prod  
□ Products/prices: Pro **$29**, Business **$99**, packs $9 / $29 / $59  
□ Metadata: `tier=PRO|ENTERPRISE`, `type=topup`, `credits=N`  
□ Customer Portal configured (cancel at period end, invoices, payment method)  
□ Stripe Tax enabled if collecting tax  
□ Webhook endpoint: `https://<prod-host>/api/webhooks/stripe`  
□ Events subscribed (checkout, subscription, invoice, payment_intent, charge.refunded — see `PAYMENT_FLOW.md`)  
□ Test event delivery → `200`; signature verifies  
□ Idempotency table `ProcessedWebhookEvents` working (duplicate event no double grant)  
□ No raw PAN collection in Audient UI (Elements/Checkout only)  
□ Success/cancel URLs → M07 / Manage Plan on prod domain  
□ Billing statement descriptor / support email set  

---

## 8. Analytics

□ Prod analytics project created (PostHog / Segment / Amplitude — as chosen)  
□ Server events for `payment_succeeded`, `audit_*` outcomes wired  
□ Client events respect **consent** (SCREEN-M12)  
□ No PAN, tokens, or screenshot binaries in payloads  
□ URLs hashed / eTLD+1 where required by privacy policy  
□ Funnel dashboards: guest → audit → upgrade → PDF  
□ Staging project separate (no prod pollution)  
□ Kill switch / disable path if CMP fails  

---

## 9. Monitoring

□ Uptime monitor on `GET /api/health` (Better Stack / Checkly / equivalent)  
□ Alert contacts (email/SMS/Pager) verified with a test page  
□ Metrics: 5xx rate, latency, queue depth, webhook fail count  
□ Business metrics: audit fail rate, payment_failed, refund_failed  
□ LLM cost / token burn dashboard or budget alert  
□ Crawl/worker concurrency cap visible  
□ 99.9% uptime target acknowledged  

**P0 alerts armed:**

□ Health down  
□ 5xx spike  
□ Stripe webhook failures / signature errors  
□ Queue backlog / poison loop  
□ Credit refund compensation failures  

---

## 10. Logging

□ Structured logs on Vercel functions (request id)  
□ Worker logs: audit id, stage, duration, error taxonomy code  
□ Log retention set per policy  
□ **Scrubbed:** no PAN, service-role keys, ID tokens, full HTML dumps, screenshot binaries  
□ Log access limited to eng/on-call  
□ CorrelationId surfaced on INTERNAL_ERROR support path  

---

## 11. Error tracking

□ Sentry (or equivalent) for **browser**, **Next server**, **workers**  
□ Environment tag = `production`  
□ Source maps uploaded from CI  
□ PII scrubbing enabled  
□ Alert on new issue regressions / spike  
□ Separate Sentry projects or envs for staging vs prod  
□ Test error event received before launch  

---

## 12. Backups

□ Supabase automated backups enabled (paid plan as required)  
□ **PITR** enabled and window known  
□ Pre-launch restore drill completed once on scratch project  
□ Object storage durability confirmed (R2/S3/Supabase Storage)  
□ Secrets recoverable from Vercel/worker stores (not one laptop)  
□ GDPR delete path tested (account erase + storage purge)  
□ Quarterly restore drill scheduled on calendar  

---

## 13. Production testing

Controlled canary only — see `TESTING_STRATEGY` § Go-live.

□ `GET /api/health` → 200  
□ Landing (SCREEN-001) loads on apex + www redirect  
□ SSO one provider end-to-end (founder account)  
□ Header credits hydrate from server  
□ Guest or Free screenshot canary (budget-aware) → Progress → brief Report  
□ Free URL → Upgrade / Manage Plan (no charge)  
□ Live Checkout canary: coupon / minimal charge + documented refund playbook **or** verified webhook with test-like safety  
□ Webhook flips Membership ACTIVE; crown/credits update after poll  
□ Portal opens for canary customer  
□ Paid PDF signed download (if Pro canary)  
□ Invalid URL / SSRF rejected  
□ Failed audit path refunds credits (staging proof accepted if prod AI cost constrained — note exception)  
□ No Sentry spike during canary window  
□ Queue lag within SLO  

---

## 14. Performance audit

□ Lighthouse (lab) on Landing + authenticated Home — LCP/INP/CLS reviewed  
□ Screenshot audit p95 ≤ ~90s on staging soak  
□ URL audit p95 ≤ ~8 min on staging soak  
□ Create-audit API returns 202 quickly under light concurrency  
□ Worker stage timings dashboards green  
□ Next bundle size reviewed (no accidental huge client deps)  
□ CDN caching static assets; personalized routes not cached incorrectly  
□ Load/soak smoke on enqueue completed pre-launch (`TESTING_STRATEGY` § Load)  

---

## 15. Accessibility audit

□ Target **WCAG 2.2 AA** (`ACCESSIBILITY.md`)  
□ axe Serious/Critical = **0** on P0 routes (Landing, SSO, Home, Plan, Progress, Report, History, Settings)  
□ Keyboard marathon: Landing → SSO → Home → Plan → Progress → Report → History  
□ Skip link + focus-visible + modal focus trap verified  
□ CreditMeter / crown not icon-only without names  
□ Contrast fixes for empty History / warning tokens verified  
□ `prefers-reduced-motion` respected on Progress / marketing motion  
□ Mobile sticky payment CTA does not fully obscure focused fields  
□ Manual SR spot-check (VoiceOver or TalkBack) on SSO + Report  
□ Waived axe rules documented with owner + expiry  

---

## 16. SEO audit

□ Marketing Landing indexable (SSR/metadata)  
□ Unique `<title>` + meta description per public page  
□ Open Graph / Twitter cards for Landing (brand + value prop)  
□ Canonical URL matches `NEXT_PUBLIC_APP_URL` policy  
□ `robots.txt` allows marketing; disallows private app paths as intended  
□ `sitemap.xml` for public routes (Landing, Pricing, Privacy, Terms)  
□ Pricing page shows **$29 / $99** (not stale Figma $99/$199)  
□ Auth/dashboard routes `noindex` where appropriate  
□ HTTPS + www/apex consistency (no duplicate content)  
□ Favicon / app icons present  
□ Core Web Vitals acceptable on Landing  
□ Structured data optional (Organization) — only if accurate  

---

## 17. Security audit

□ SECURITY.md pass: headers (CSP, HSTS, X-Content-Type-Options, frame-ancestors)  
□ RLS verified on prod  
□ SSRF suite green (private IPs, metadata, rebinding)  
□ Webhook signature required; replays idempotent  
□ Rate limits on auth, audits, uploads, checkout  
□ No service-role or Stripe secret in client bundle  
□ Storage buckets private  
□ Prompt-injection corpus does not break JSON contract / scores  
□ `npm audit` reviewed; critical vulns addressed or waived  
□ Dependency + secret scan in CI  
□ Admin/support access least-privilege  
□ Incident playbooks reviewed (`DEPLOYMENT` § Incident Recovery)  
□ PCI: Checkout/Elements/Portal only — no Audient-hosted PAN fields  

---

## 18. Launch checklist

### Product

□ Guest 1-screenshot + claim-on-login  
□ Free / Pro / Business gates (URL, PDF, top-ups) match `PRICING.md` / `BUSINESS_RULES`  
□ Manage Plan prices **$29 / $99**  
□ Progress / Report / Failure / Upgrade screens live  
□ Notifications for audit complete / payment / low credits  
□ Privacy, Terms, consent banner live  
□ Account deletion works  

### Ops cutover

□ DNS/SSL live  
□ Prod env vars live (Stripe **live**)  
□ Migrations applied  
□ Workers deployed + concurrency capped  
□ Webhooks delivering  
□ Monitoring + Sentry + backups confirmed  
□ Status communication channel ready (Twitter/status page/email)  
□ Support inbox / escalation path staffed  
□ Feature flags ready to disable URL audits / checkout if needed  

### Go / no-go

□ Eng lead: GO / NO-GO  
□ Product: GO / NO-GO  
□ On-call online for T+0 to T+2h  

---

## 19. Rollback plan

### App / web (Vercel)

□ Instant rollback to previous Production deployment known  
□ `NEXT_PUBLIC_APP_URL` / env unchanged unless bad config was the cause  
□ After rollback: re-run health + SSO smoke  

### Workers

□ Redeploy previous worker image / scale to 0 to pause audits  
□ Drain or pause BullMQ as documented  
□ Do not leave old workers on new breaking schema  

### Database

□ Prefer **forward fix** migration over destructive rollback  
□ PITR restore = last resort (new instance + cutover) — owner + ETA predefined  
□ Never restore over prod without communication window  

### Stripe / entitlements

□ Do not “rollback” live prices casually  
□ Fix webhook secret/endpoint if payments break  
□ Reconcile ledger vs Stripe Dashboard; no client-side entitlement grants  
□ Pause Checkout via flag if mass mis-grant  

### Comms

□ Status message template ready  
□ Customer support macros for payment/audit failures  

### Decision tree (short)

```text
SEV-1 site down     → Vercel rollback → verify DNS/SSL → health
SEV-1 payments      → check Stripe webhooks/keys → pause checkout flag
SEV-1 credit corruption → pause audit create + workers → reconcile
SEV-2 AI pipeline   → disable URL audits / fallback model → refund path OK
Bad migration       → stop deploys → forward fix or PITR plan
```

□ Post-incident: SEV-1/2 postmortem within 72h  

---

## 20. Post-launch checklist

### T+15–30 minutes

□ Health 200  
□ Landing + SSO  
□ Credits hydrate  
□ No Sentry crash spike  
□ Webhook delivery success rate healthy  
□ Queue lag OK  

### T+2–24 hours

□ Review `payment_failed` / `renewal_failed` / `audit_failed` rates  
□ Spot-check credit ledger vs Stripe for canary customers  
□ Confirm backup jobs still running  
□ Support tickets triaged; FAQ updated  
□ LLM cost within expected burn  

### T+48 hours – week 1

□ Accessibility/SEO follow-ups filed  
□ Flaky e2e / monitoring noise tuned  
□ Private beta feedback → prioritized backlog  
□ Confirm no test Stripe keys accidentally on prod  
□ Schedule first quarterly restore drill if not done  

### Ongoing

□ Weekly regression smoke on staging  
□ On-call rotation calendar filled  
□ Price/plan changes only via controlled Stripe + `plans.ts` + docs PR  

---

## 21. Sign-off

| Role | Name | Date | GO / NO-GO |
|------|------|------|------------|
| Eng lead | | | |
| Product | | | |
| QA | | | |
| On-call | | | |

**Launch timestamp (UTC):** _______________  
**Production deployment URL / ID:** _______________  
**Notes / exceptions:** _______________

---

## 22. Related documents

| Doc | Use |
|-----|-----|
| DEPLOYMENT.md | Topology, DNS, SSL, incident recovery |
| TESTING_STRATEGY.md | Go-live testing detail |
| PAYMENT_FLOW.md | Webhooks & billing |
| SECURITY.md | Headers, SSRF, PCI |
| ACCESSIBILITY.md | WCAG 2.2 AA |
| ANALYTICS.md | Events & consent |
| DATABASE_MIGRATION.md | Migrate/rollback DB |
| PRICING.md | Live price truth |

---

**End of GO_LIVE_CHECKLIST.md**
