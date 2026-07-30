# Audient — REST API Specification

**Status:** Draft
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** PRD, Technical Architecture Document, DATABASE.md, SCHEMA.md, **AUTH_API.md**, **AUDIT_API.md**, **USER_API.md**, **BILLING_API.md**, **API_MAPPING.md**

This document specifies the complete REST API for Audient. It is a design specification only — no backend code.

> **Login / OAuth / session:** see **[AUTH_API.md](./AUTH_API.md)** — `POST /auth/google` · `/auth/apple` · `/auth/microsoft` (provider ID token), plus `/me` and sign-out.  
> **Start / poll / report AI audit (product template):** see **[AUDIT_API.md](./AUDIT_API.md)** — `POST /ai/audit`, `GET /audit/{id}`, report, PDF, **`GET /history`**.  
> **User credits (product template):** see **[USER_API.md](./USER_API.md)** — `GET /user/credits`.  
> **Billing (product template):** see **[BILLING_API.md](./BILLING_API.md)** — `POST /billing/topup`.

---

## Conventions

- **Base URL:** `https://api.audient.app/api/v1` (routes shown below are relative to `/api/v1` unless noted).
- **Format:** JSON request and response bodies; `Content-Type: application/json`.
- **Authentication:** After `POST /auth/{provider}`, session is a JWT via `Authorization: Bearer <token>` (or secure cookie). Server derives the user from the verified token; clients never send `userId` as an authority claim. See AUTH_API.md.
- **IDs:** UUID strings.
- **Timestamps:** ISO 8601 (UTC), e.g. `2026-07-27T09:16:30Z`.
- **Money:** integers in the smallest currency unit (cents).
- **Pagination:** cursor-based — `?limit=20&cursor=<id>`; responses return `{ "data": [...], "nextCursor": "<id|null>" }`.
- **Filtering/sorting:** query params, e.g. `?status=COMPLETED&sort=-createdAt`.

### Standard Response Envelope
```json
// Success (single resource)
{ "data": { /* resource */ } }

// Success (collection)
{ "data": [ /* resources */ ], "nextCursor": "d3f5a1c9-..." }

// Error
{ "error": { "code": "INSUFFICIENT_CREDITS", "message": "Not enough credits for this audit." } }
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (async job queued) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed (tier/ownership) |
| 404 | Not found (or not owned by the user) |
| 409 | Conflict |
| 422 | Business rule failed (e.g., insufficient credits) |
| 429 | Rate limited |
| 500 | Internal server error |

### Common Error Codes
`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INSUFFICIENT_CREDITS`, `TIER_NOT_ALLOWED`, `RATE_LIMITED`, `EMAIL_NOT_VERIFIED`, `AUDIT_FAILED`, `DUPLICATE_REQUEST`, `INTERNAL_ERROR`.

---

## 1. Current User (Account)

### 1.1 Get Current User
- **Purpose:** Retrieve the authenticated user's profile, plan, and credit summary for the dashboard/header.
- **Method:** `GET`
- **URL:** `/me`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": {
    "id": "9f1c2e5a-...",
    "email": "owner@brightcafe.com",
    "name": "Priya Sharma",
    "role": "USER",
    "emailVerified": true,
    "tier": "PRO",
    "membershipStatus": "ACTIVE",
    "credits": { "balance": 620, "isUnlimited": false, "nextResetAt": "2026-08-27T00:00:00Z" }
  }
}
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Returns only the requesting user's data. Credit summary reflects live balance (or `isUnlimited` for Enterprise).

### 1.2 Update Current User
- **Purpose:** Update the user's editable profile fields.
- **Method:** `PATCH`
- **URL:** `/me`
- **Request Body:**
```json
{ "name": "Priya S." }
```
- **Response (200):** Updated user object (as in 1.1).
- **Error Responses:** `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Email is managed by Supabase Auth and cannot be changed here. Only whitelisted fields (e.g., `name`) are accepted.

### 1.3 Delete Account
- **Purpose:** Permanently delete the user's account and all associated data (GDPR erasure).
- **Method:** `DELETE`
- **URL:** `/me`
- **Request Body:** None (may require a confirmation query param, e.g. `?confirm=true`).
- **Response (202):** `{ "data": { "status": "SCHEDULED_FOR_DELETION" } }`
- **Error Responses:** `401 UNAUTHENTICATED`, `409` (active subscription must be canceled first, if enforced).
- **Authentication Required:** Yes.
- **Business Rules:** Cascades deletion of audits, reports, recommendations, credits, notifications, and settings, and removes stored files. Financial records (Payments) are **anonymized, not deleted**, to satisfy financial-retention requirements.

---

## 2. Audits

### 2.1 Create Audit
- **Purpose:** Start a new UX audit from a screenshot upload or a live website URL.
- **Method:** `POST`
- **URL:** `/audits` (product alias: **`POST /ai/audit`** — see AUDIT_API.md)
- **Request Body (screenshot):**
```json
{
  "inputType": "SCREENSHOT",
  "screenshotKeys": ["users/9f1c.../uploads/home.png"]
}
```
- **Request Body (URL):**
```json
{
  "inputType": "URL",
  "websiteUrl": "https://brightcafe.com",
  "competitors": ["https://competitor-a.com"]
}
```
- **Request Body (product shorthand — AUDIT_API.md):**
```json
{
  "website": "https://nike.com"
}
```
(`website` maps to `websiteUrl` + `inputType: "URL"`.)
- **Response (202):**
```json
{ "data": { "id": "d3f5a1c9-...", "status": "QUEUED", "creditsCost": 400, "estimatedSeconds": 480 } }
```
Product shorthand: `{ "auditId": "AUD-001", "status": "queued" }`.- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing/invalid URL or screenshot keys.
  - `401 UNAUTHENTICATED`.
  - `403 TIER_NOT_ALLOWED` — URL audit attempted on the Free tier.
  - `403 EMAIL_NOT_VERIFIED` — email not verified.
  - `422 INSUFFICIENT_CREDITS` — not enough credits.
  - `429 RATE_LIMITED`.
- **Authentication Required:** Yes.
- **Business Rules:**
  - **URL audits require a paid tier** (Pro/Enterprise); Free tier is screenshot-only.
  - Credits are **checked and reserved (deducted) at creation** inside a transaction (prevents double-spend). Enterprise (`isUnlimited`) bypasses the balance check.
  - URL must pass SSRF validation (public http/https only; private/internal ranges rejected).
  - Supports an `Idempotency-Key` header to avoid duplicate audits on retry.
  - Returns `202` because processing is asynchronous.

### 2.2 List Audits (History)
- **Purpose:** List the user's past audits for the history view.
- **Method:** `GET`
- **URL:** `/audits?limit=20&cursor=<id>&status=COMPLETED&sort=-createdAt` (product alias: **`GET /history`** — see AUDIT_API.md)
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": [
    { "id": "d3f5a1c9-...", "websiteUrl": "https://brightcafe.com", "status": "COMPLETED", "overallScore": 72, "createdAt": "2026-07-27T09:10:00Z" }
  ],
  "nextCursor": null
}
```
Product shorthand:
```json
{
  "items": [
    { "auditId": "AUD-001", "title": "nike.com", "website": "https://nike.com", "status": "completed", "overallScore": 72, "hasPdf": true, "createdAt": "2026-07-27T09:10:00Z" }
  ],
  "nextCursor": null
}
```
- **Error Responses:** `401 UNAUTHENTICATED`, `400 VALIDATION_ERROR` (bad filter/params).
- **Authentication Required:** Yes.
- **Business Rules:** Returns only the requesting user's audits, newest first by default. Supports filtering by `status` and cursor pagination.

### 2.3 Get Audit
- **Purpose:** Retrieve a single audit with status and scores.
- **Method:** `GET`
- **URL:** `/audits/{auditId}`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": {
    "id": "d3f5a1c9-...",
    "websiteUrl": "https://brightcafe.com",
    "inputType": "URL",
    "status": "COMPLETED",
    "overallScore": 72,
    "accessibilityScore": 65,
    "conversionScore": 80,
    "mobileScore": 70,
    "summary": "Your homepage builds trust well, but...",
    "createdAt": "2026-07-27T09:10:00Z",
    "completedAt": "2026-07-27T09:16:30Z"
  }
}
```
- **Error Responses:** `401 UNAUTHENTICATED`, `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** A user can only fetch their own audits; others return `404` (existence not leaked). Score fields are null until `COMPLETED`.

### 2.4 Get Audit Status
- **Purpose:** Lightweight poll for progress while an audit runs.
- **Method:** `GET`
- **URL:** `/audits/{auditId}/status` (product alias: **`GET /audit/{auditId}`** — see AUDIT_API.md Check Progress)
- **Request Body:** None.
- **Polling:** Client calls every **2 seconds** until `progress` is **100** (or terminal `failed`).
- **Response (200):**
```json
{ "data": { "status": "PROCESSING", "progress": 0.6, "estimatedSecondsRemaining": 120 } }
```
Product shorthand:
```json
{ "progress": 45, "status": "running" }
```
(`progress` as 0–100 percent; `status`: `queued` · `running` · `completed` · `failed`.)
- **Error Responses:** `401 UNAUTHENTICATED`, `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** Optimized for frequent polling. Returns `COMPLETED`/`FAILED` terminal states; `FAILED` includes an error reason. (Realtime push may supplement polling.)

### 2.5 Delete Audit
- **Purpose:** Delete an audit and its artifacts.
- **Method:** `DELETE`
- **URL:** `/audits/{auditId}`
- **Request Body:** None.
- **Response (200):** `{ "data": { "id": "d3f5a1c9-...", "deleted": true } }`
- **Error Responses:** `401 UNAUTHENTICATED`, `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** Cascades to the audit's report, recommendations, and stored screenshots. Deleting an audit does **not** refund credits (only failed audits are refunded, at processing time).

---

## 3. Reports & Recommendations

### 3.1 Get Report
- **Purpose:** Retrieve the detailed report for a completed audit (scores, AI summary, competitive analysis).
- **Method:** `GET`
- **URL:** `/audits/{auditId}/report` (product alias: **`GET /audit/{auditId}/report`** — see AUDIT_API.md)
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": {
    "id": "e5c7b2a1-...",
    "auditId": "d3f5a1c9-...",
    "overallScore": 72,
    "categoryScores": { "accessibility": 65, "conversion": 80, "mobile": 70 },
    "aiSummary": "Your homepage builds trust well, but visitors struggle to find how to order...",
    "competitiveAnalysis": { "competitors": [ { "url": "https://competitor-a.com", "gaps": ["..."] } ] },
    "hasPdf": true
  }
}
```
- **Error Responses:** `401 UNAUTHENTICATED`, `403 TIER_NOT_ALLOWED` (Free tier — detailed report gated), `404 NOT_FOUND` (no report / audit not completed).
- **Authentication Required:** Yes.
- **Business Rules:** Detailed report is a **paid-tier** deliverable; Free users receive only the on-screen `summary` from the audit object. Report exists only for `COMPLETED` audits.

### 3.2 List Recommendations
- **Purpose:** Retrieve the individual UX findings for an audit's report.
- **Method:** `GET`
- **URL:** `/audits/{auditId}/recommendations?severity=CRITICAL&category=ACCESSIBILITY&sort=priority`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": [
    {
      "id": "b6d2f8a3-...",
      "category": "ACCESSIBILITY",
      "severity": "CRITICAL",
      "priority": "HIGH",
      "title": "Low color contrast on primary buttons",
      "description": "Primary buttons fail WCAG contrast ratios...",
      "recommendation": "Increase contrast to at least 4.5:1...",
      "businessImpact": "Hard-to-read buttons reduce click-through...",
      "screenshotRef": "users/9f1c.../annotations/contrast-1.png"
    }
  ],
  "nextCursor": null
}
```
- **Error Responses:** `401 UNAUTHENTICATED`, `403 TIER_NOT_ALLOWED` (full findings gated for Free), `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** Supports filtering by `severity`/`category` and sorting by `priority`/`severity`. Free tier may receive a limited subset to encourage upgrade.

### 3.3 Download Report PDF
- **Purpose:** Obtain a time-limited signed URL to download the report PDF.
- **Method:** `GET`
- **URL:** `/audits/{auditId}/report/pdf` (product alias: **`GET /report/{auditId}/pdf`** — see AUDIT_API.md)
- **Request Body:** None.
- **Response (200):**
```json
{ "data": { "downloadUrl": "https://storage.audient.app/signed/...", "expiresIn": 300 } }
```
Product shorthand:
```json
{ "downloadUrl": "https://storage.audient.app/signed/...", "expiresIn": 300 }
```
- **Error Responses:** `401 UNAUTHENTICATED`, `403 TIER_NOT_ALLOWED` (Free), `404 NOT_FOUND` (PDF not generated yet).
- **Authentication Required:** Yes.
- **Business Rules:** PDF is Pro/Enterprise only. The signed URL is short-lived and scoped to the owning user. The PDF file itself is served from private object storage, not through the API.

### 3.4 Submit Report Feedback
- **Purpose:** Capture user feedback on report usefulness (supports PRD quality KPIs).
- **Method:** `POST`
- **URL:** `/audits/{auditId}/report/feedback`
- **Request Body:**
```json
{ "rating": "UP", "actedOnRecommendation": true, "comment": "Very clear and useful." }
```
- **Response (201):** `{ "data": { "id": "fb-...", "rating": "UP" } }`
- **Error Responses:** `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** One user may submit/update feedback for their own report. Feeds satisfaction and "acted-on-recommendation" metrics.

---

## 4. Uploads

### 4.1 Create Signed Upload URL
- **Purpose:** Get a signed URL to upload a screenshot directly to object storage (bypassing the API server).
- **Method:** `POST`
- **URL:** `/uploads/sign`
- **Request Body:**
```json
{ "fileName": "home.png", "contentType": "image/png", "fileSize": 348122 }
```
- **Response (200):**
```json
{ "data": { "uploadUrl": "https://storage.audient.app/signed-put/...", "key": "users/9f1c.../uploads/home.png", "expiresIn": 300 } }
```
- **Error Responses:** `400 VALIDATION_ERROR` (unsupported type/oversized), `401 UNAUTHENTICATED`, `429 RATE_LIMITED`.
- **Authentication Required:** Yes.
- **Business Rules:** Only image types (`image/png`, `image/jpeg`, `image/webp`) and a max file size are allowed. The returned `key` is user-scoped and later passed to `POST /audits`. Signed URL is short-lived.

---

## 5. Credits

### 5.1 Get Credit Balance
- **Purpose:** Show the user's current credit balance and reset schedule.
- **Method:** `GET`
- **URL:** `/credits` (product alias: **`GET /user/credits`** — see USER_API.md)
- **Request Body:** None.
- **Response (200):**
```json
{ "data": { "balance": 620, "monthlyGrant": 1000, "isUnlimited": false, "lastResetAt": "2026-07-27T00:00:00Z", "nextResetAt": "2026-08-27T00:00:00Z" } }
```
Product shorthand:
```json
{ "credits": 300, "monthlyGrant": 300, "isUnlimited": false, "plan": "Free", "nextResetAt": "2026-08-27T00:00:00Z" }
```
(`credits` ≡ `balance`.)
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** For Enterprise (`isUnlimited: true`), balance is not enforced; UI shows "Unlimited."

### 5.2 List Credit Transactions
- **Purpose:** Show the credit ledger (grants, deductions, refunds, top-ups).
- **Method:** `GET`
- **URL:** `/credits/transactions?limit=20&cursor=<id>`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": [
    { "id": "ct-...", "type": "AUDIT_DEDUCTION", "amount": -400, "balanceAfter": 620, "auditId": "d3f5a1c9-...", "createdAt": "2026-07-27T09:10:00Z" }
  ],
  "nextCursor": null
}
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Read-only, append-only history scoped to the user; newest first.

### 5.3 Purchase Credit Top-Up
- **Purpose:** Buy additional credits mid-cycle.
- **Method:** `POST`
- **URL:** `/credits/topups` (product alias: **`POST /billing/topup`** — see BILLING_API.md)
- **Request Body:**
```json
{ "packId": "PACK_2000" }
```
- **Response (200):**
```json
{ "data": { "checkoutUrl": "https://checkout.stripe.com/..." } }
```
Product shorthand:
```json
{ "checkoutUrl": "https://checkout.stripe.com/..." }
```
- **Error Responses:** `400 VALIDATION_ERROR` (unknown pack), `401 UNAUTHENTICATED`, `403 TIER_NOT_ALLOWED` (Free cannot buy top-ups).
- **Authentication Required:** Yes.
- **Business Rules:** Top-ups are Pro/Enterprise only. Credits are granted **only** after Stripe confirms payment via webhook (not on redirect). Purchased credits **roll over** across monthly resets (per PRD §9.3).

---

## 6. Membership & Billing

### 6.1 Get Membership
- **Purpose:** Retrieve the user's plan, status, and renewal date.
- **Method:** `GET`
- **URL:** `/membership`
- **Request Body:** None.
- **Response (200):**
```json
{ "data": { "tier": "PRO", "status": "ACTIVE", "billingInterval": "MONTHLY", "currentPeriodEnd": "2026-08-27T00:00:00Z", "cancelAtPeriodEnd": false } }
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Reflects current subscription state, synced from Stripe via webhooks.

### 6.2 Create Checkout Session (Upgrade)
- **Purpose:** Start a Stripe Checkout to upgrade to Pro/Enterprise.
- **Method:** `POST`
- **URL:** `/billing/checkout`
- **Request Body:**
```json
{ "tier": "PRO", "billingInterval": "MONTHLY" }
```
- **Response (200):**
```json
{ "data": { "checkoutUrl": "https://checkout.stripe.com/..." } }
```
- **Error Responses:** `400 VALIDATION_ERROR` (invalid tier/interval), `401 UNAUTHENTICATED`, `409` (already on that tier).
- **Authentication Required:** Yes.
- **Business Rules:** Tier/interval/price come from server-side plan config (never client-supplied amounts). Entitlements are applied only after the Stripe webhook confirms payment. Supports `Idempotency-Key`.

### 6.3 Create Billing Portal Session
- **Purpose:** Open the Stripe Billing Portal to manage/cancel the subscription or update payment method.
- **Method:** `POST`
- **URL:** `/billing/portal`
- **Request Body:** None.
- **Response (200):** `{ "data": { "portalUrl": "https://billing.stripe.com/..." } }`
- **Error Responses:** `401 UNAUTHENTICATED`, `403` (no billing account, e.g., never upgraded).
- **Authentication Required:** Yes.
- **Business Rules:** Cancellation is handled in Stripe (cancel-at-period-end); the resulting webhook updates membership. Only the owning user can open their portal.

### 6.4 List Payments
- **Purpose:** Show the user's billing/payment history.
- **Method:** `GET`
- **URL:** `/payments?limit=20&cursor=<id>`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": [
    { "id": "a9f3c1d7-...", "type": "SUBSCRIPTION", "status": "SUCCEEDED", "amount": 2900, "currency": "usd", "createdAt": "2026-07-27T09:00:00Z" }
  ],
  "nextCursor": null
}
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Read-only history scoped to the user. Amounts are in minor units (cents).

---

## 7. Notifications

### 7.1 List Notifications
- **Purpose:** Retrieve the user's notifications for the notification center.
- **Method:** `GET`
- **URL:** `/notifications?read=false&limit=20&cursor=<id>`
- **Request Body:** None.
- **Response (200):**
```json
{
  "data": [
    { "id": "f1a2b3c4-...", "type": "AUDIT_COMPLETE", "title": "Your audit is ready", "message": "Your UX audit for brightcafe.com is complete — score 72.", "read": false, "metadata": { "auditId": "d3f5a1c9-..." }, "createdAt": "2026-07-27T09:16:30Z" }
  ],
  "nextCursor": null
}
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Scoped to the user; supports `?read=false` for the unread feed. Newest first.

### 7.2 Mark Notification Read
- **Purpose:** Mark a single notification as read.
- **Method:** `PATCH`
- **URL:** `/notifications/{notificationId}`
- **Request Body:** `{ "read": true }`
- **Response (200):** `{ "data": { "id": "f1a2b3c4-...", "read": true } }`
- **Error Responses:** `401 UNAUTHENTICATED`, `404 NOT_FOUND`.
- **Authentication Required:** Yes.
- **Business Rules:** A user can only modify their own notifications.

### 7.3 Mark All Notifications Read
- **Purpose:** Mark all of the user's notifications as read.
- **Method:** `POST`
- **URL:** `/notifications/read-all`
- **Request Body:** None.
- **Response (200):** `{ "data": { "updated": 12 } }`
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Affects only the requesting user's notifications.

---

## 8. Settings

### 8.1 Get Settings
- **Purpose:** Retrieve the user's preferences.
- **Method:** `GET`
- **URL:** `/settings`
- **Request Body:** None.
- **Response (200):**
```json
{ "data": { "theme": "DARK", "emailNotifications": true, "defaultPdfFormat": "A4", "timezone": "Asia/Kolkata", "language": "en" } }
```
- **Error Responses:** `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Every user has a settings record (created with defaults at sign-up).

### 8.2 Update Settings
- **Purpose:** Update one or more preferences.
- **Method:** `PATCH`
- **URL:** `/settings`
- **Request Body:**
```json
{ "theme": "LIGHT", "emailNotifications": false }
```
- **Response (200):** Updated settings object (as in 8.1).
- **Error Responses:** `400 VALIDATION_ERROR` (invalid enum/value), `401 UNAUTHENTICATED`.
- **Authentication Required:** Yes.
- **Business Rules:** Partial updates allowed; only known fields with valid enum values are accepted. `emailNotifications` and `timezone` govern email delivery timing for notifications.

---

## 9. Webhooks (Server-to-Server)

### 9.1 Stripe Webhook
- **Purpose:** Receive Stripe events to keep membership, credits, and payments in sync.
- **Method:** `POST`
- **URL:** `/webhooks/stripe` (note: outside `/api/v1`, e.g. `/api/webhooks/stripe`)
- **Request Body:** Raw Stripe event payload (e.g., `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`).
- **Response (200):** `{ "received": true }`
- **Error Responses:** `400` (missing/invalid signature), `500` (processing error → Stripe will retry).
- **Authentication Required:** No session; authenticated by **Stripe signature verification** (signing secret).
- **Business Rules:**
  - Every event is **signature-verified**; unverified events are rejected.
  - Handlers are **idempotent** (keyed on Stripe event ID via the Processed Webhook Events table) — duplicate deliveries are ignored.
  - Successful subscription payment → set membership `ACTIVE`, update `currentPeriodEnd`, reset monthly plan credits.
  - Top-up payment → grant purchased (rollover) credits.
  - Failed payment → `PAST_DUE`; final failure/cancellation → downgrade to Free.
  - Entitlement changes are driven **only** by verified webhooks (never client redirects).

---

## 10. System

### 10.1 Health Check
- **Purpose:** Liveness/uptime probe for monitoring.
- **Method:** `GET`
- **URL:** `/api/health` (outside `/api/v1`)
- **Request Body:** None.
- **Response (200):** `{ "status": "ok", "time": "2026-07-27T09:16:30Z" }`
- **Error Responses:** `500` (unhealthy).
- **Authentication Required:** No.
- **Business Rules:** Public, unauthenticated, lightweight; used by uptime monitoring to track the 99.9% target.

---

## 11. Cross-Cutting Rules

- **Ownership scoping:** every resource is scoped to the authenticated user; access to another user's resource returns `404` (existence not leaked).
- **Tier gating:** URL audits, detailed reports/PDFs, and credit top-ups require Pro/Enterprise → `403 TIER_NOT_ALLOWED` otherwise.
- **Credit enforcement:** audit creation checks and reserves credits transactionally (`422 INSUFFICIENT_CREDITS` if short); failed audits auto-refund; Enterprise bypasses balance checks.
- **Email verification:** running audits requires a verified email (`403 EMAIL_NOT_VERIFIED`).
- **Rate limiting:** per-user and per-IP limits on sensitive endpoints (audit creation, uploads, auth, checkout) → `429 RATE_LIMITED`.
- **Idempotency:** state-changing, charge-affecting endpoints (`POST /audits`, `POST /billing/checkout`, `POST /credits/topups` / `POST /billing/topup`) accept an `Idempotency-Key` header.
- **Validation:** all request bodies are schema-validated → `400 VALIDATION_ERROR` on failure.
- **Async model:** audits are created with `202` and tracked via `GET /audits/{id}/status` (and/or realtime), then results fetched on completion.

---
