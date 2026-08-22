# AUDIENT — BACKEND-007
# STRIPE BILLING & PAYMENTS

**Status:** Implemented (TEST mode code) — Dashboard TEST Price IDs + keys required for E2E  
**Depends on:** BACKEND-003, BACKEND-004  
**Out of scope:** Live Stripe keys, AI, audit engine, workspace redesign, production deploy

Live secrets (`sk_live_`) are **rejected** by `assertStripeTestModeSecret`.

---

## Objective

Connect existing billing UI to Stripe Checkout + webhooks so membership and credits update only after verified Stripe state.

---

## Architecture

```
Browser (real Supabase user)
  → POST /api/billing/checkout { plan | packId }
  → server validates against plans.ts / TOP_UP_PACKS
  → resolves Stripe Price ID from env (never client Price IDs)
  → ensure Stripe customer on memberships.stripe_customer_id
  → Stripe Checkout Session → redirect

Stripe → POST /api/webhooks/stripe
  → verify signature
  → processed_webhook_events (idempotent)
  → update memberships / payments / credit TOPUP|MONTHLY_GRANT
```

Mock `mock-*` auth keeps mock Pay Now + `applyMockPurchase`.

---

## Env (server-only secrets)

| Variable | Role |
|----------|------|
| `STRIPE_SECRET_KEY` | `sk_test_…` (never `NEXT_PUBLIC_`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (Checkout Session redirect) |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for Pro $29 |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Price ID for Business $99 |
| `STRIPE_PRICE_PACK_500` / `_2000` / `_5000` | Top-up packs |

Amounts must match `docs/PRICING.md` / `src/config/plans.ts`.

---

## APIs

| Route | Purpose |
|-------|---------|
| `POST /api/billing/checkout` | Create Checkout Session |
| `GET /api/billing/invoices` | Payment projection for Invoice History |
| `POST /api/webhooks/stripe` | Signed webhook processor |

---

## Webhook events handled

- `checkout.session.completed`
- `customer.subscription.created|updated|deleted`
- `invoice.paid` / `invoice.payment_failed`
- `payment_intent.*` acknowledged (no duplicate grants)

---

## Local test-mode checklist

1. Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Put `whsec_…` in `.env.local`
3. Create test Prices matching PRICING.md; set Price ID env vars
4. Restart `npm run dev`
5. Real Google/OAuth user → Checkout Pay Now → Stripe test card
6. Confirm membership + credits via webhook (not success URL alone)
7. Replay webhook → no duplicate credits

---

## Stop

Do not enable live keys or start BACKEND-008 unless requested.
