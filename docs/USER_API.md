# Audient — User API

**Status:** Draft  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** API.md §1 · §5, AUTH_API.md, PRICING.md, COMPONENT_BEHAVIOR.md (Credits badge)

Product-facing user endpoints. Format matches AUTH_API / AUDIT_API templates.

### User inventory

| ID | API Name | Method | Endpoint |
|----|----------|--------|----------|
| USER-001 | Get User Credits | `GET` | `/user/credits` |

---

# Get User Credits

---

## API Name

Get User Credits

---

## Purpose

Return the authenticated user’s current credit balance (and related plan credit metadata) for the Credits badge / header.

---

## Method

GET

---

## Endpoint

`/user/credits`

(Alias of `/api/v1/credits` in API.md §5.1.)

---

## Called From

App header Credits badge; after login; after Start Audit (deduction); after payment success / plan change.

---

## Request

(No body.)

```http
GET /user/credits
Authorization: Bearer <token>
```

---

## Success

```json
{
  "credits": 300,
  "monthlyGrant": 300,
  "isUnlimited": false,
  "plan": "Free",
  "nextResetAt": "2026-08-27T00:00:00Z"
}
```

| Field | Notes |
|-------|--------|
| `credits` | Current spendable balance (`balance` in API.md) |
| `monthlyGrant` | Plan monthly allotment (Free **300**, Pro **1000**, Business **10000**) |
| `isUnlimited` | Business/Enterprise bypass when enabled |
| `plan` | UI label |
| `nextResetAt` | Next monthly reset (ISO 8601) |

---

## Failure

Not authenticated · Network Error · Server Error

---

## Frontend

Update Credits badge. On low / zero credits → prompt upgrade (Manage Plan). Refresh after audit create and after checkout success.

---

## Analytics

(Optional) `credits_viewed` · related `insufficient_credits` on audit failure

---

## Flow

```text
Login / app load / after audit / after payment
  → GET /user/credits
  → { credits, … }
  → Credits badge
```
