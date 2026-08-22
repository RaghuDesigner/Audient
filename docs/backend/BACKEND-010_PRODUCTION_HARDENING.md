# AUDIENT — BACKEND-010
# PRODUCTION HARDENING, RELIABILITY & OBSERVABILITY

**Status:** Implemented — ready for controlled E2E  
**Depends on:** BACKEND-001 … BACKEND-009B  
**Out of scope:** BACKEND-011, production deploy, live Stripe testing, distributed queue/vendor APM

---

## What landed

### Configuration
- `src/lib/config/runtime.ts` — production fail-closed checks (mock auth, Supabase, OpenAI, Stripe mode, APP_URL)
- Stripe: `sk_test_` locally; `sk_live_` only when `NODE_ENV=production` **and** `ALLOW_STRIPE_LIVE=true`

### AI
- 60s request timeout; SDK `maxRetries: 0`
- Bounded provider retries (max 3) for timeout / 429 / 5xx only
- New failure codes: `AI_TIMEOUT`, `AI_RATE_LIMITED`
- Existing cost caps preserved (tokens, vision low, data-URL size)

### Audits
- Claim remains concurrency-safe (`QUEUED` → `PROCESSING`)
- Stuck PROCESSING reclaim after 10 minutes → `AI_TIMEOUT` fail
- User retry capped at `attempt_count <= 3`
- Poll re-nudges QUEUED only; reclaim on stuck PROCESSING

### Credits
- Idempotent deduct if `AUDIT_DEDUCTION` exists for audit
- Unique index migration: `20260821120050_credit_deduction_unique.sql`

### Rate limits (in-process)
- Audit create / retry: 10 / min / user
- Checkout: 8 / min / user
- Workspace invites: 20 / min / user

### Observability
- `src/lib/log.ts` structured JSON logs with secret redaction
- Health returns `ready`, `production`, dependency flags, config issue **codes** (no secrets)

---

## Apply migration

```bash
npx supabase db push --db-url "$DIRECT_URL"
```

## Verify

```bash
npm run typecheck && npm run lint && npm run build
```

## Stop

Do not start BACKEND-011 or deploy production from this phase.
