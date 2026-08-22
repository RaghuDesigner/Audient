# AUDIENT — BACKEND-008
# NOTIFICATIONS & INVOICES

**Status:** Implemented (in-app notifications + invoice projection)  
**Depends on:** BACKEND-003, BACKEND-005, BACKEND-006, BACKEND-007  
**Out of scope:** Team notifications, production email provider, Stripe redesign, AI changes, BACKEND-009

---

## Objective

Server-authoritative in-app notifications and verified invoice/payment history for authenticated users, without client forgery of notification or payment state.

---

## Architecture

```
Authoritative event (Stripe webhook / audit complete|fail)
  → membership / payments / credits mutation (existing)
  → createNotification (service-role, idempotent on metadata.idempotencyKey)
  → public.notifications

Browser (real Supabase user)
  → GET /api/notifications
  → PATCH /api/notifications/:id { read: true }
  → POST /api/notifications/read-all
  → GET /api/billing/invoices (payments projection; invoice_url when Stripe provided)

Mock mock-* sessions keep mock inbox + mock read overlay.
```

Notification insert failures are logged and **do not** roll back payments or audits (`notifySafely`).

No production email provider exists in-repo — in-app persistence only.

---

## Schema

Reuses `public.notifications` (no new table / no migration):

| Column | Use |
|--------|-----|
| `type` | `notification_type` enum |
| `title` / `message` | Display |
| `read` | Unread state |
| `metadata` | `idempotencyKey`, `uiType`, entity refs, href |

UI types finer than the enum (e.g. `payment_failed`) map via `metadata.uiType` + `SYSTEM` / `PAYMENT_SUCCEEDED`.

---

## APIs

| Route | Purpose |
|-------|---------|
| `GET /api/notifications` | List own + `unreadCount` |
| `PATCH /api/notifications/[id]` | Mark own read |
| `POST /api/notifications/read-all` | Mark all own read |
| `GET /api/billing/invoices` | Verified payments (incl. hosted `invoiceUrl`) |

RLS: select/update own; insert denied for authenticated (service-role creates).

---

## Event → notification

| Event | Notification |
|-------|----------------|
| Audit → COMPLETED | `AUDIT_COMPLETE` |
| Audit → FAILED | `AUDIT_FAILED` |
| Audit failure refund | `SYSTEM` (credits refunded) |
| `invoice.paid` (subscription) | `PAYMENT_SUCCEEDED` / subscription activated or renewal |
| Credit Checkout paid + TOPUP | `PAYMENT_SUCCEEDED` / credit purchase |
| `invoice.payment_failed` | `SYSTEM` + uiType payment_failed |
| Subscription canceled/deleted | `SUBSCRIPTION_EXPIRING` / membership expiry |

Idempotency keys: `audit:{id}:completed|failed|refund`, `payment:{id}:succeeded|topup|failed`, `subscription:{id}:canceled`.

---

## Local verification

```bash
npm run verify:notifications
npm run typecheck
npm run lint
npm run build
```

Manual (Stripe TEST only, optional):

1. Real Google user completes Pro checkout or top-up → notification appears on `/notifications`
2. Replay webhook → no duplicate notification
3. Mark one / mark all read
4. Invoice History still shows payment; hosted invoice URL opens when present

---

## Stop

Do not start BACKEND-009, add a production email vendor, or enable live Stripe unless requested.
