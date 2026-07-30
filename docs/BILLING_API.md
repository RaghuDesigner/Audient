# Audient — Billing API

**Status:** Draft  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** API.md §5 · §6, USER_API.md, PRICING.md, SECURITY.md (PCI / Stripe)

Product-facing billing endpoints. Format matches AUTH / AUDIT / USER API templates.

### Billing inventory

| ID | API Name | Method | Endpoint |
|----|----------|--------|----------|
| BILL-001 | Credit Top-Up | `POST` | `/billing/topup` |

---

# Credit Top-Up

---

## API Name

Credit Top-Up

---

## Purpose

Purchase additional credits mid-cycle (one-time Stripe payment). Credits are granted only after webhook confirmation.

---

## Method

POST

---

## Endpoint

`/billing/topup`

(Alias of `/api/v1/credits/topups` in API.md §5.3.)

---

## Called From

Credits / billing UI (Pro & Business); insufficient-credits upgrade path when already on a paid plan.

---

## Request

```json
{
  "packId": "PACK_2000"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `packId` | string | Yes | Pack from server config / PRICING.md |

**Packs (PRICING.md):**

| packId | Credits | Price |
|--------|---------|-------|
| `PACK_500` | 500 | $9 |
| `PACK_2000` | 2,000 | $29 |
| `PACK_5000` | 5,000 | $59 |

Header (recommended): `Idempotency-Key: <uuid>`.

---

## Success

```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

HTTP **200**. Client redirects to Stripe Checkout (`mode: payment`).  
Do **not** increment credits on this response — wait for Stripe webhook, then `GET /user/credits`.

---

## Failure

| Case | Meaning |
|------|---------|
| Invalid pack | Unknown `packId` |
| Free tier | Top-ups not allowed → upgrade first |
| Not authenticated | 401 |
| Network / Server | Retryable |
| Rate limited | 429 |

---

## Frontend

Redirect to `checkoutUrl`. On return success URL → poll `GET /user/credits` / show Payment Success. On cancel → stay on billing/credits. Free users → Manage Plan (subscribe) instead of top-up.

---

## Analytics

`topup_started` `{ packId }` · `topup_checkout_opened` · `topup_completed` (after webhook / credits refresh) · `topup_failed`

---

## Flow

```text
Pro/Business user selects pack
  → POST /billing/topup { packId }
  → { checkoutUrl }
  → Stripe Checkout
  → webhook grants credits
  → GET /user/credits
```
