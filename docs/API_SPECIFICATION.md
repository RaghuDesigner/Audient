# Audient — API Specification

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** API.md · AUTH_API.md · AUDIT_API.md · USER_API.md · BILLING_API.md · API_MAPPING.md · BUSINESS_RULES.md · VALIDATION_RULES.md · ERROR_HANDLING.md · ANALYTICS.md · PRICING.md · SCHEMA.md · SECURITY.md

**Audience:** Backend · Frontend · QA · Mobile  
**Format:** Markdown only — design specification, **no application code**.

This document is the **unified REST catalogue**. Product aliases (`/ai/audit`, `/history`, `/user/credits`, `/billing/topup`) and canonical `/api/v1/*` paths are both listed; implement one primary path and optionally dual-route or redirect.

---

## 1. Conventions

| Topic | Rule |
|-------|------|
| Base URL (versioned) | `https://api.audient.app/api/v1` (local: `http://localhost:3000/api/v1` via Next route handlers) |
| Unversioned | `/api/webhooks/stripe`, `/api/health` |
| Format | JSON; `Content-Type: application/json` |
| Auth | `Authorization: Bearer <jwt>` and/or httpOnly session cookie after SSO |
| Identity | Server derives `userId` from token — never trust body `userId` |
| IDs | UUID strings |
| Time | ISO 8601 UTC |
| Money | Integer cents |
| Pagination | `?limit=&cursor=` → `{ data, nextCursor }` |
| Idempotency | `Idempotency-Key` on create audit, checkout, top-up |

### Envelope

```json
{ "data": { } }

{ "data": [ ], "nextCursor": null }

{ "error": { "code": "INSUFFICIENT_CREDITS", "message": "Not enough credits for this audit." } }
```

### Common error codes

`UNAUTHENTICATED` · `FORBIDDEN` · `NOT_FOUND` · `VALIDATION_ERROR` · `INSUFFICIENT_CREDITS` · `TIER_NOT_ALLOWED` · `RATE_LIMITED` · `EMAIL_NOT_VERIFIED` · `AUDIT_FAILED` · `DUPLICATE_REQUEST` · `INTERNAL_ERROR`

### Alias map

| Product / screen docs | Canonical API.md |
|----------------------|------------------|
| `POST /ai/audit` | `POST /audits` |
| `GET /audit/{id}` | `GET /audits/{id}/status` |
| `GET /audit/{id}/report` | `GET /audits/{id}/report` |
| `GET /report/{id}/pdf` | `GET /audits/{id}/report/pdf` |
| `GET /history` | `GET /audits` |
| `GET /user/credits` | `GET /credits` |
| `POST /billing/topup` | `POST /credits/topups` |

### Credit costs (server config)

| Action | Free | Pro | Business (`ENTERPRISE`) |
|--------|------|-----|-------------------------|
| Screenshot | 150 | 100 | 50 |
| URL | ❌ | 400 | 100 |
| PDF | ❌ | 0 | 0 |

---

## 2. Endpoint inventory

| ID | Method | URL | Auth |
|----|--------|-----|------|
| API-AUTH-001 | POST | `/api/v1/auth/google` | None |
| API-AUTH-002 | POST | `/api/v1/auth/apple` | None |
| API-AUTH-003 | POST | `/api/v1/auth/microsoft` | None |
| API-AUTH-004 | POST | `/api/v1/auth/sign-out` | Bearer or session cookie |
| API-USER-001 | GET | `/api/v1/me` | Required |
| API-USER-002 | PATCH | `/api/v1/me` | Required |
| API-USER-003 | DELETE | `/api/v1/me` | Required |
| API-AUDIT-001 | POST | `/api/v1/audits` | Required |
| API-AUDIT-002 | GET | `/api/v1/audits` | Required |
| API-AUDIT-003 | GET | `/api/v1/audits/{auditId}` | Required |
| API-AUDIT-004 | GET | `/api/v1/audits/{auditId}/status` | Required |
| API-AUDIT-005 | DELETE | `/api/v1/audits/{auditId}` | Required |
| API-RPT-001 | GET | `/api/v1/audits/{auditId}/report` | Required |
| API-RPT-002 | GET | `/api/v1/audits/{auditId}/recommendations` | Required |
| API-RPT-003 | GET | `/api/v1/audits/{auditId}/report/pdf` | Required |
| API-RPT-004 | POST | `/api/v1/audits/{auditId}/report/feedback` | Required |
| API-UPL-001 | POST | `/api/v1/uploads/sign` | Required for avatar; guest allowed for s |
| API-CRED-001 | GET | `/api/v1/credits` | Required |
| API-CRED-002 | GET | `/api/v1/credits/transactions` | Required |
| API-CRED-003 | POST | `/api/v1/credits/topups` | Required |
| API-BILL-001 | GET | `/api/v1/membership` | Required |
| API-BILL-002 | POST | `/api/v1/billing/checkout` | Required |
| API-BILL-003 | POST | `/api/v1/billing/portal` | Required |
| API-BILL-004 | POST | `/api/v1/billing/payment-method` | Required |
| API-BILL-005 | GET | `/api/v1/payments` | Required |
| API-NOTIF-001 | GET | `/api/v1/notifications` | Required |
| API-NOTIF-002 | PATCH | `/api/v1/notifications/{notificationId}` | Required |
| API-NOTIF-003 | POST | `/api/v1/notifications/read-all` | Required |
| API-SET-001 | GET | `/api/v1/settings` | Required |
| API-SET-002 | PATCH | `/api/v1/settings` | Required |
| API-WH-001 | POST | `/api/webhooks/stripe` | Stripe-Signature header |
| API-SYS-001 | GET | `/api/health` | None |

**Total endpoints:** 32

---

## 3. Endpoint specifications

## 3.1 Authentication

### API-AUTH-001 — `POST /api/v1/auth/google`

**Google Login**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/google` |
| **Description** | Authenticate with Google ID token; upsert user; seed Free+300 on first login; set session. |
| **Authentication** | None (establishes session) |
| **Permissions** | Public |
| **Headers** | `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Per-IP auth: ~20/min (staging values TBD) |
| **Database Tables** | Users, Memberships, Credits, CreditTransactions (GRANT), Settings |
| **Business Rules** | BR-AUTH-001, BR-AUTH-002, BR-GUEST-006 (claim guest audit) |
| **Validation Rules** | VAL-AUTH-001 |
| **Analytics Events** | `oauth_started` (client) · `login_success` · `login_failed` |

#### Request body

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "userId": "9f1c2e5a-1111-2222-3333-444455556666",
    "name": "Priya Sharma",
    "email": "priya@gmail.com",
    "credits": 300,
    "plan": "Free",
    "tier": "FREE",
    "isNewUser": true
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Missing/invalid googleToken |
| 401 | `UNAUTHENTICATED` | Invalid Google Token |
| 429 | `RATE_LIMITED` | Auth throttle |
| 500 | `INTERNAL_ERROR` | Server/IdP failure |

### API-AUTH-002 — `POST /api/v1/auth/apple`

**Apple Login**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/apple` |
| **Description** | Authenticate with Apple ID token; same provisioning as Google. |
| **Authentication** | None (establishes session) |
| **Permissions** | Public |
| **Headers** | `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Same as Google auth |
| **Database Tables** | Users, Memberships, Credits, Settings |
| **Business Rules** | BR-AUTH-001, BR-AUTH-002; Apple private-relay email OK |
| **Validation Rules** | VAL-AUTH-002 |
| **Analytics Events** | `login_success` / `login_failed` `{provider:apple}` |

#### Request body

```json
{
  "appleToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullName": { "givenName": "Priya", "familyName": "Sharma" }
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "userId": "9f1c2e5a-1111-2222-3333-444455556666",
    "name": "Priya Sharma",
    "email": "priya@privaterelay.appleid.com",
    "credits": 300,
    "plan": "Free",
    "tier": "FREE",
    "isNewUser": false
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Missing appleToken |
| 401 | `UNAUTHENTICATED` | Invalid Apple Token |
| 429 | `RATE_LIMITED` | Auth throttle |
| 500 | `INTERNAL_ERROR` | Server/IdP failure |

### API-AUTH-003 — `POST /api/v1/auth/microsoft`

**Microsoft Login**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/microsoft` |
| **Description** | Authenticate with Microsoft/Azure ID token. |
| **Authentication** | None (establishes session) |
| **Permissions** | Public |
| **Headers** | `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Same as Google auth |
| **Database Tables** | Users, Memberships, Credits, Settings |
| **Business Rules** | BR-AUTH-001, BR-AUTH-002 |
| **Validation Rules** | VAL-AUTH-003 |
| **Analytics Events** | `login_success` / `login_failed` `{provider:microsoft}` |

#### Request body

```json
{
  "microsoftToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "userId": "9f1c2e5a-1111-2222-3333-444455556666",
    "name": "Priya Sharma",
    "email": "priya@outlook.com",
    "credits": 1000,
    "plan": "Pro",
    "tier": "PRO",
    "isNewUser": false
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Missing microsoftToken |
| 401 | `UNAUTHENTICATED` | Invalid Microsoft Token |
| 429 | `RATE_LIMITED` | Auth throttle |
| 500 | `INTERNAL_ERROR` | Server/IdP failure |

### API-AUTH-004 — `POST /api/v1/auth/sign-out`

**Sign Out**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/sign-out` |
| **Description** | Invalidate session cookies / revoke refresh; return to guest. |
| **Authentication** | Bearer or session cookie |
| **Permissions** | Authenticated user |
| **Headers** | `Authorization: Bearer <token>` (or cookie) |
| **Parameters** | — |
| **Rate Limits** | Standard |
| **Database Tables** | Sessions (Supabase Auth) |
| **Business Rules** | BR-AUTH-004 |
| **Validation Rules** | — |
| **Analytics Events** | `logout` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": { "signedOut": true }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No valid session |
| 500 | `INTERNAL_ERROR` | Server error |

## 3.2 Current user

### API-USER-001 — `GET /api/v1/me`

**Get Current User**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/me` |
| **Description** | Profile, tier, membership status, credit summary for header/home. |
| **Authentication** | Required |
| **Permissions** | Own user only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard read |
| **Database Tables** | Users, Memberships, Credits |
| **Business Rules** | BR-AUTH-003; credit summary server-authoritative (BR-CRED-001) |
| **Validation Rules** | — |
| **Analytics Events** | (implicit identify on hydrate) |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "id": "9f1c2e5a-1111-2222-3333-444455556666",
    "email": "owner@brightcafe.com",
    "name": "Priya Sharma",
    "avatarUrl": "https://…/avatar.webp",
    "role": "USER",
    "emailVerified": true,
    "tier": "PRO",
    "plan": "Pro",
    "membershipStatus": "ACTIVE",
    "credits": {
      "balance": 620,
      "isUnlimited": false,
      "nextResetAt": "2026-08-27T00:00:00Z"
    }
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | Missing/invalid session |
| 500 | `INTERNAL_ERROR` | Server error |

### API-USER-002 — `PATCH /api/v1/me`

**Update Current User**

| Field | Detail |
|-------|--------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/me` |
| **Description** | Update editable profile fields (name, avatar). Email read-only. |
| **Authentication** | Required |
| **Permissions** | Own user only |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Standard write |
| **Database Tables** | Users |
| **Business Rules** | BR-AUTH-005 (email read-only); whitelist fields only |
| **Validation Rules** | VAL-SET-* / profile name & avatar rules |
| **Analytics Events** | `profile_updated` · `avatar_updated` |

#### Request body

```json
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "name": "Priya Sharma",
  "avatarUrl": "users/9f1c…/uploads/avatar.webp"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "id": "9f1c2e5a-1111-2222-3333-444455556666",
    "name": "Priya Sharma",
    "email": "owner@brightcafe.com",
    "avatarUrl": "users/9f1c…/uploads/avatar.webp",
    "tier": "PRO",
    "membershipStatus": "ACTIVE",
    "credits": { "balance": 620, "isUnlimited": false, "nextResetAt": "2026-08-27T00:00:00Z" }
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid name/avatar |
| 401 | `UNAUTHENTICATED` | No session |
| 500 | `INTERNAL_ERROR` | Server error |

### API-USER-003 — `DELETE /api/v1/me`

**Delete Account**

| Field | Detail |
|-------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/me` |
| **Description** | GDPR erasure: delete user data; anonymize payments; require cancel sub first if active. |
| **Authentication** | Required |
| **Permissions** | Own user only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `?confirm=true` (required) |
| **Rate Limits** | Strict (e.g. 5/day) |
| **Database Tables** | Users (+ cascade Audits, Reports, Recommendations, Credits, Notifications, Settings, Files); Payments anonymized |
| **Business Rules** | BR-SEC-006 |
| **Validation Rules** | confirm=true required |
| **Analytics Events** | `delete_account_started` · `account_deleted` |

#### Request body

_None._

#### Success response

HTTP **202**

```json
{
  "data": { "status": "SCHEDULED_FOR_DELETION" }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | confirm missing |
| 401 | `UNAUTHENTICATED` | No session |
| 409 | `CONFLICT` | Active subscription — cancel first |
| 500 | `INTERNAL_ERROR` | Server error |

## 3.3 Audits

### API-AUDIT-001 — `POST /api/v1/audits`

**Create Audit / Start Audit**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/audits` |
| **Product alias** | `POST /api/v1/ai/audit` |
| **Description** | Queue screenshot or URL UX audit; reserve credits; return 202. |
| **Authentication** | Required (guest: 1 screenshot only) |
| **Permissions** | Guest screenshot once; Free screenshot; Pro/Business URL+screenshot; emailVerified for authed audits |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` · `Idempotency-Key: <uuid>` (recommended) · optional guest session cookie |
| **Parameters** | — |
| **Rate Limits** | Per-user + per-IP strict on create |
| **Database Tables** | Audits, CreditTransactions (DEDUCT), Credits, Files (refs) |
| **Business Rules** | BR-URL-*, BR-SHOT-*, BR-CRED-003/004, BR-GUEST-001/003/004, BR-AI-001 |
| **Validation Rules** | VAL-URL-*, VAL-FILE-*, VAL-CRED-001 |
| **Analytics Events** | `audit_started` · `go_clicked` (client) · `guest_url_gated` / `url_attempt_gated` · `insufficient_credits` |

#### Request body

```json
{
  "inputType": "URL",
  "websiteUrl": "https://brightcafe.com"
}

// or screenshot:
{
  "inputType": "SCREENSHOT",
  "screenshotKeys": ["users/9f1c…/uploads/home.png"]
}

// product shorthand:
{
  "website": "https://nike.com"
}
```

#### Success response

HTTP **202**

```json
{
  "data": {
    "id": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
    "status": "QUEUED",
    "creditsCost": 400,
    "estimatedSeconds": 480
  }
}

// product shorthand:
{
  "auditId": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
  "status": "queued"
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid URL / missing input / bad keys |
| 400/403 | `SSRF_BLOCKED / FORBIDDEN` | Private/blocked host |
| 401 | `UNAUTHENTICATED` | Guest URL or quota exhausted |
| 403 | `TIER_NOT_ALLOWED` | Free/Guest URL audit |
| 403 | `EMAIL_NOT_VERIFIED` | Unverified email |
| 422 | `INSUFFICIENT_CREDITS` | Balance < cost |
| 429 | `RATE_LIMITED` | Too many creates |
| 409 | `DUPLICATE_REQUEST` | Idempotency replay conflict handling |
| 500/503 | `INTERNAL_ERROR / AI_UNAVAILABLE` | Queue/provider down |

### API-AUDIT-002 — `GET /api/v1/audits`

**List Audits (History)**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits` |
| **Product alias** | `GET /api/v1/history` |
| **Description** | Cursor-paginated audit history for the authenticated user. |
| **Authentication** | Required |
| **Permissions** | Own audits only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `limit` (default 20) · `cursor` · `status` · `sort` (default `-createdAt`) |
| **Rate Limits** | Standard read |
| **Database Tables** | Audits |
| **Business Rules** | BR-HIST-001, BR-HIST-003 (depth by tier) |
| **Validation Rules** | Cursor/limit bounds |
| **Analytics Events** | `history_viewed` · `history_opened` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": [
    {
      "id": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
      "websiteUrl": "https://brightcafe.com",
      "inputType": "URL",
      "status": "COMPLETED",
      "overallScore": 72,
      "createdAt": "2026-07-27T09:10:00Z",
      "completedAt": "2026-07-27T09:16:30Z"
    }
  ],
  "nextCursor": null
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Bad query params |
| 401 | `UNAUTHENTICATED` | No session |
| 500 | `INTERNAL_ERROR` | Server error |

### API-AUDIT-003 — `GET /api/v1/audits/{auditId}`

**Get Audit**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits/{auditId}` |
| **Description** | Single audit with status and scores (null until COMPLETED). |
| **Authentication** | Required |
| **Permissions** | Owner only (else 404) |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | Path: `auditId` (UUID) |
| **Rate Limits** | Standard read |
| **Database Tables** | Audits |
| **Business Rules** | BR-SEC-001 ownership → 404 |
| **Validation Rules** | UUID path |
| **Analytics Events** | (optional) `history_row_opened` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "id": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
    "websiteUrl": "https://brightcafe.com",
    "inputType": "URL",
    "status": "COMPLETED",
    "overallScore": 72,
    "accessibilityScore": 65,
    "conversionScore": 80,
    "mobileScore": 70,
    "summary": "Your homepage builds trust well, but…",
    "createdAt": "2026-07-27T09:10:00Z",
    "completedAt": "2026-07-27T09:16:30Z"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 404 | `NOT_FOUND` | Missing or not owned |
| 500 | `INTERNAL_ERROR` | Server error |

### API-AUDIT-004 — `GET /api/v1/audits/{auditId}/status`

**Get Audit Status / Check Progress**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits/{auditId}/status` |
| **Product alias** | `GET /api/v1/audit/{auditId}` |
| **Description** | Lightweight progress poll (~every 2s) until terminal state. |
| **Authentication** | Required (or guest session owning audit) |
| **Permissions** | Owner only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | Path: `auditId` |
| **Rate Limits** | Higher poll allowance; still per-user capped |
| **Database Tables** | Audits |
| **Business Rules** | BR-AI-001; terminal COMPLETED/FAILED; FAILED may include error taxonomy code |
| **Validation Rules** | — |
| **Analytics Events** | `audit_processing_watched` · `audit_completed` / `audit_failed` (prefer server emit on transition) |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "status": "PROCESSING",
    "progress": 60,
    "estimatedSecondsRemaining": 120,
    "errorCode": null
  }
}

// product shorthand:
{
  "progress": 45,
  "status": "running"
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 404 | `NOT_FOUND` | Missing or not owned |
| 500 | `INTERNAL_ERROR` | Server error |

### API-AUDIT-005 — `DELETE /api/v1/audits/{auditId}`

**Delete Audit**

| Field | Detail |
|-------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/audits/{auditId}` |
| **Description** | Delete audit + artifacts; no credit refund. |
| **Authentication** | Required |
| **Permissions** | Owner only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | Path: `auditId` |
| **Rate Limits** | Standard write |
| **Database Tables** | Audits, Reports, Recommendations, FileAssets |
| **Business Rules** | No refund on delete (BR-ERR / history notes) |
| **Validation Rules** | — |
| **Analytics Events** | (optional) `audit_deleted` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": { "id": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff", "deleted": true }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 404 | `NOT_FOUND` | Missing or not owned |
| 500 | `INTERNAL_ERROR` | Server error |

## 3.4 Reports & recommendations

### API-RPT-001 — `GET /api/v1/audits/{auditId}/report`

**Get Report**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits/{auditId}/report` |
| **Product alias** | `GET /api/v1/audit/{auditId}/report` |
| **Description** | Detailed report payload for completed audit (paid depth; Free brief). |
| **Authentication** | Required |
| **Permissions** | Owner; Free may get limited payload (BR-AI-003) |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | Path: `auditId` |
| **Rate Limits** | Standard read |
| **Database Tables** | Reports, Audits |
| **Business Rules** | BR-AI-003; BR-AI-006 competitive optional/null |
| **Validation Rules** | — |
| **Analytics Events** | `report_viewed` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "id": "e5c7b2a1-1111-2222-3333-444455556666",
    "auditId": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
    "overallScore": 72,
    "categoryScores": {
      "accessibility": 65,
      "conversion": 80,
      "mobile": 70,
      "navigation": 74
    },
    "aiSummary": "Your homepage builds trust well, but visitors struggle to find how to order…",
    "hasPdf": true,
    "competitiveAnalysis": null
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `TIER_NOT_ALLOWED` | Detailed report gated |
| 404 | `NOT_FOUND` | No report / not completed / not owned |
| 500 | `INTERNAL_ERROR` | Server error |

### API-RPT-002 — `GET /api/v1/audits/{auditId}/recommendations`

**List Recommendations**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits/{auditId}/recommendations` |
| **Description** | Per-finding recommendations for a report. |
| **Authentication** | Required |
| **Permissions** | Owner; Free may receive subset |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `severity` · `category` · `sort` · `limit` · `cursor` |
| **Rate Limits** | Standard read |
| **Database Tables** | Recommendations, Reports |
| **Business Rules** | BR-AI-002 categories/severity |
| **Validation Rules** | Enum filters only |
| **Analytics Events** | `recommendation_expanded` (client) |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": [
    {
      "id": "b6d2f8a3-1111-2222-3333-444455556666",
      "category": "ACCESSIBILITY",
      "severity": "CRITICAL",
      "priority": "HIGH",
      "title": "Low color contrast on primary buttons",
      "description": "Primary buttons fail WCAG contrast ratios…",
      "recommendation": "Increase contrast to at least 4.5:1…",
      "businessImpact": "Hard-to-read buttons reduce click-through…",
      "screenshotRef": "users/9f1c…/annotations/contrast-1.png"
    }
  ],
  "nextCursor": null
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `TIER_NOT_ALLOWED` | Full findings gated |
| 404 | `NOT_FOUND` | No report |
| 400 | `VALIDATION_ERROR` | Bad filters |

### API-RPT-003 — `GET /api/v1/audits/{auditId}/report/pdf`

**Download Report PDF**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/audits/{auditId}/report/pdf` |
| **Product alias** | `GET /api/v1/report/{auditId}/pdf` |
| **Description** | Short-lived signed URL for PDF (Pro/Business). |
| **Authentication** | Required |
| **Permissions** | Owner + paid tier; PAST_DUE per BR-SUB-006 |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | Path: `auditId` |
| **Rate Limits** | Per-user moderate |
| **Database Tables** | Reports (pdf key), FileAssets |
| **Business Rules** | BR-PDF-001/002/003/004 — 0 credits; no audit refund on PDF fail |
| **Validation Rules** | — |
| **Analytics Events** | `pdf_downloaded` · `pdf_download_failed` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "downloadUrl": "https://storage.audient.app/signed/…",
    "expiresIn": 300
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `TIER_NOT_ALLOWED` | Free / gated |
| 404 | `NOT_FOUND` | PDF not ready / not owned |
| 500 | `INTERNAL_ERROR` | PDF generation failure path |

### API-RPT-004 — `POST /api/v1/audits/{auditId}/report/feedback`

**Submit Report Feedback**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/audits/{auditId}/report/feedback` |
| **Description** | Thumbs up/down + optional acted-on flag for quality KPIs. |
| **Authentication** | Required |
| **Permissions** | Owner |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` |
| **Parameters** | Path: `auditId` |
| **Rate Limits** | Standard write |
| **Database Tables** | ReportFeedback (or equivalent) |
| **Business Rules** | Own report only |
| **Validation Rules** | rating enum UP|DOWN; comment max length |
| **Analytics Events** | `report_feedback_submitted` |

#### Request body

```json
{
  "rating": "UP",
  "actedOnRecommendation": true,
  "comment": "Very clear and useful."
}
```

#### Success response

HTTP **201**

```json
{
  "data": {
    "id": "fb-1111-2222-3333-444455556666",
    "rating": "UP",
    "actedOnRecommendation": true
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid rating/comment |
| 401 | `UNAUTHENTICATED` | No session |
| 404 | `NOT_FOUND` | No report |

## 3.5 Uploads

### API-UPL-001 — `POST /api/v1/uploads/sign`

**Create Signed Upload URL**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/uploads/sign` |
| **Description** | Signed PUT URL for screenshot or avatar; returns storage key. |
| **Authentication** | Required for avatar; guest allowed for screenshot (quota) |
| **Permissions** | Own user namespace keys |
| **Headers** | `Authorization: Bearer <token>` or guest session · `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Strict per-user/IP |
| **Database Tables** | FileAssets (optional pending row) |
| **Business Rules** | BR-SHOT-002; BR-SEC-005 private buckets |
| **Validation Rules** | VAL-FILE-* ; purpose screenshot|avatar |
| **Analytics Events** | `upload_screenshot_clicked` (client) · `screenshot_uploaded` · `upload_failed` |

#### Request body

```json
{
  "fileName": "home.png",
  "contentType": "image/png",
  "fileSize": 348122,
  "purpose": "screenshot"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "uploadUrl": "https://storage.audient.app/signed-put/…",
    "key": "users/9f1c…/uploads/home.png",
    "expiresIn": 300
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Bad MIME/size/name |
| 401 | `UNAUTHENTICATED` | Guest quota / no session |
| 429 | `RATE_LIMITED` | Upload RL |

## 3.6 Credits

### API-CRED-001 — `GET /api/v1/credits`

**Get Credit Balance**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/credits` |
| **Product alias** | `GET /api/v1/user/credits` |
| **Description** | Current balance, grant, reset schedule, plan label. |
| **Authentication** | Required |
| **Permissions** | Own credits |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard read |
| **Database Tables** | Credits, Memberships |
| **Business Rules** | BR-CRED-001/002; Business may set isUnlimited false with 10k meter |
| **Validation Rules** | — |
| **Analytics Events** | `credits_viewed` (optional) |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "balance": 620,
    "credits": 620,
    "monthlyGrant": 1000,
    "isUnlimited": false,
    "plan": "Pro",
    "lastResetAt": "2026-07-27T00:00:00Z",
    "nextResetAt": "2026-08-27T00:00:00Z"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 500 | `INTERNAL_ERROR` | Server error |

### API-CRED-002 — `GET /api/v1/credits/transactions`

**List Credit Transactions**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/credits/transactions` |
| **Description** | Append-only ledger of grants, deductions, refunds, top-ups. |
| **Authentication** | Required |
| **Permissions** | Own ledger |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `limit` · `cursor` |
| **Rate Limits** | Standard read |
| **Database Tables** | CreditTransactions |
| **Business Rules** | BR-CRED-* ledger integrity |
| **Validation Rules** | — |
| **Analytics Events** | — |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": [
    {
      "id": "ct-1111-2222-3333-444455556666",
      "type": "AUDIT_DEDUCTION",
      "amount": -400,
      "balanceAfter": 620,
      "auditId": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff",
      "createdAt": "2026-07-27T09:10:00Z"
    }
  ],
  "nextCursor": null
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 400 | `VALIDATION_ERROR` | Bad cursor |

### API-CRED-003 — `POST /api/v1/credits/topups`

**Purchase Credit Top-Up**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/credits/topups` |
| **Product alias** | `POST /api/v1/billing/topup` |
| **Description** | Create Stripe Checkout for credit pack; grant only via webhook. |
| **Authentication** | Required |
| **Permissions** | Pro/Business only (not Free) |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` · `Idempotency-Key` |
| **Parameters** | — |
| **Rate Limits** | Strict on checkout |
| **Database Tables** | Payments (pending), Credits (after webhook) |
| **Business Rules** | BR-CRED-006/007; packs PACK_500/2000/5000 |
| **Validation Rules** | VAL pack whitelist |
| **Analytics Events** | `topup_started` · `credits_purchased` (webhook) |

#### Request body

```json
{
  "packId": "PACK_2000"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_…"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Unknown packId |
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `TIER_NOT_ALLOWED` | Free cannot top up |
| 429 | `RATE_LIMITED` | Checkout RL |

## 3.7 Membership & billing

### API-BILL-001 — `GET /api/v1/membership`

**Get Membership**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/membership` |
| **Description** | Current plan tier, status, period end, cancel flag. |
| **Authentication** | Required |
| **Permissions** | Own membership |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard read |
| **Database Tables** | Memberships |
| **Business Rules** | BR-SUB-001; PAST_DUE limits premium (BR-SUB-006) |
| **Validation Rules** | — |
| **Analytics Events** | `manage_plan_viewed` / `current_plan_viewed` (client) |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "tier": "PRO",
    "status": "ACTIVE",
    "billingInterval": "MONTHLY",
    "currentPeriodEnd": "2026-08-27T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "plan": "Pro"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |

### API-BILL-002 — `POST /api/v1/billing/checkout`

**Create Checkout Session**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/billing/checkout` |
| **Description** | Stripe Checkout for Free→Pro/Business subscription. |
| **Authentication** | Required |
| **Permissions** | Authenticated; not already on target tier |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` · `Idempotency-Key` |
| **Parameters** | — |
| **Rate Limits** | Strict |
| **Database Tables** | Payments (intent), Memberships (after webhook) |
| **Business Rules** | BR-SUB-003/005; BR-BILL-001/002; prices from plans.ts ($29/$99) |
| **Validation Rules** | VAL-BILL-001 tier PRO|ENTERPRISE; MONTHLY only v1 |
| **Analytics Events** | `subscribe_clicked` · `checkout_started` · `payment_succeeded` (webhook) |

#### Request body

```json
{
  "tier": "PRO",
  "billingInterval": "MONTHLY"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_…"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid tier/interval |
| 401 | `UNAUTHENTICATED` | No session |
| 409 | `CONFLICT` | Already on tier |
| 429 | `RATE_LIMITED` | Checkout RL |

### API-BILL-003 — `POST /api/v1/billing/portal`

**Create Billing Portal Session**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/billing/portal` |
| **Description** | Stripe Customer Portal for cancel / payment method / invoices. |
| **Authentication** | Required |
| **Permissions** | User with Stripe customer |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard write |
| **Database Tables** | Memberships (Stripe customer id) |
| **Business Rules** | BR-SUB-*; cancel via portal → webhook |
| **Validation Rules** | — |
| **Analytics Events** | `billing_portal_opened` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "portalUrl": "https://billing.stripe.com/p/session/…"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `FORBIDDEN` | No billing customer |

### API-BILL-004 — `POST /api/v1/billing/payment-method`

**Update Payment Method (tokenized)**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/billing/payment-method` |
| **Description** | Attach/update default payment method via Stripe token/SetupIntent result (SCREEN-011). No raw PAN. |
| **Authentication** | Required |
| **Permissions** | Own billing customer |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Strict |
| **Database Tables** | Memberships / Stripe refs only |
| **Business Rules** | BR-BILL-002 PCI — Elements only |
| **Validation Rules** | VAL-BILL payment method id format |
| **Analytics Events** | `payment_method_updated` |

#### Request body

```json
{
  "paymentMethodId": "pm_1Nxxxx…"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2028
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid paymentMethodId |
| 401 | `UNAUTHENTICATED` | No session |
| 402 | `PAYMENT_FAILED` | Stripe attach declined |
| 403 | `FORBIDDEN` | No customer |

### API-BILL-005 — `GET /api/v1/payments`

**List Payments**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/payments` |
| **Description** | Payment history (subscriptions + top-ups). |
| **Authentication** | Required |
| **Permissions** | Own payments |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `limit` · `cursor` |
| **Rate Limits** | Standard read |
| **Database Tables** | Payments |
| **Business Rules** | Amounts in cents |
| **Validation Rules** | — |
| **Analytics Events** | — |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": [
    {
      "id": "a9f3c1d7-1111-2222-3333-444455556666",
      "type": "SUBSCRIPTION",
      "status": "SUCCEEDED",
      "amount": 2900,
      "currency": "usd",
      "createdAt": "2026-07-27T09:00:00Z"
    }
  ],
  "nextCursor": null
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |

## 3.8 Notifications

### API-NOTIF-001 — `GET /api/v1/notifications`

**List Notifications**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/notifications` |
| **Description** | In-app notification center feed. |
| **Authentication** | Required |
| **Permissions** | Own notifications |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | `read` · `limit` · `cursor` |
| **Rate Limits** | Standard read |
| **Database Tables** | Notifications |
| **Business Rules** | BR-NOTIF-001/003 |
| **Validation Rules** | — |
| **Analytics Events** | `notifications_opened` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": [
    {
      "id": "f1a2b3c4-1111-2222-3333-444455556666",
      "type": "AUDIT_COMPLETE",
      "title": "Your audit is ready",
      "message": "Your UX audit for brightcafe.com is complete — score 72.",
      "read": false,
      "metadata": { "auditId": "d3f5a1c9-aaaa-bbbb-cccc-ddddeeeeffff" },
      "createdAt": "2026-07-27T09:16:30Z"
    }
  ],
  "nextCursor": null
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |

### API-NOTIF-002 — `PATCH /api/v1/notifications/{notificationId}`

**Mark Notification Read**

| Field | Detail |
|-------|--------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/notifications/{notificationId}` |
| **Description** | Mark one notification read. |
| **Authentication** | Required |
| **Permissions** | Owner |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` |
| **Parameters** | Path: `notificationId` |
| **Rate Limits** | Standard write |
| **Database Tables** | Notifications |
| **Business Rules** | BR-NOTIF-003 |
| **Validation Rules** | read boolean |
| **Analytics Events** | `notification_read` · `notification_opened` |

#### Request body

```json
{
  "read": true
}
```

#### Success response

HTTP **200**

```json
{
  "data": { "id": "f1a2b3c4-1111-2222-3333-444455556666", "read": true }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |
| 404 | `NOT_FOUND` | Not owned |
| 400 | `VALIDATION_ERROR` | Bad body |

### API-NOTIF-003 — `POST /api/v1/notifications/read-all`

**Mark All Notifications Read**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/notifications/read-all` |
| **Description** | Mark all notifications read for current user. |
| **Authentication** | Required |
| **Permissions** | Own only |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard write |
| **Database Tables** | Notifications |
| **Business Rules** | BR-NOTIF-003 |
| **Validation Rules** | — |
| **Analytics Events** | `notifications_read_all` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": { "updated": 12 }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |

## 3.9 Settings

### API-SET-001 — `GET /api/v1/settings`

**Get Settings**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/settings` |
| **Description** | User preference row (theme, email notifications, timezone, language). |
| **Authentication** | Required |
| **Permissions** | Own settings |
| **Headers** | `Authorization: Bearer <token>` |
| **Parameters** | — |
| **Rate Limits** | Standard read |
| **Database Tables** | Settings |
| **Business Rules** | Created at signup defaults |
| **Validation Rules** | — |
| **Analytics Events** | `settings_opened` |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "data": {
    "theme": "LIGHT",
    "emailNotifications": true,
    "defaultPdfFormat": "A4",
    "timezone": "Asia/Kolkata",
    "language": "en"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHENTICATED` | No session |

### API-SET-002 — `PATCH /api/v1/settings`

**Update Settings**

| Field | Detail |
|-------|--------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/settings` |
| **Description** | Partial update of preferences. |
| **Authentication** | Required |
| **Permissions** | Own settings |
| **Headers** | `Authorization: Bearer <token>` · `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Standard write |
| **Database Tables** | Settings |
| **Business Rules** | Whitelist fields only |
| **Validation Rules** | Theme/language enums |
| **Analytics Events** | `settings_updated` · `theme_changed` (if UI exists) |

#### Request body

```json
{
  "theme": "LIGHT",
  "emailNotifications": false,
  "timezone": "Asia/Kolkata"
}
```

#### Success response

HTTP **200**

```json
{
  "data": {
    "theme": "LIGHT",
    "emailNotifications": false,
    "defaultPdfFormat": "A4",
    "timezone": "Asia/Kolkata",
    "language": "en"
  }
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid enum |
| 401 | `UNAUTHENTICATED` | No session |

## 3.10 Webhooks & system

### API-WH-001 — `POST /api/webhooks/stripe`

**Stripe Webhook**

| Field | Detail |
|-------|--------|
| **Method** | `POST` |
| **URL** | `/api/webhooks/stripe` |
| **Description** | Stripe event receiver; verifies signature; idempotent entitlement/credit updates. |
| **Authentication** | Stripe-Signature header (no user session) |
| **Permissions** | Stripe only |
| **Headers** | `Stripe-Signature: t=…,v1=…` · `Content-Type: application/json` |
| **Parameters** | — |
| **Rate Limits** | Stripe delivery; handler must be fast |
| **Database Tables** | ProcessedWebhookEvents, Memberships, Credits, CreditTransactions, Payments |
| **Business Rules** | BR-BILL-006 idempotency; BR-SUB-005 entitlements only after verify |
| **Validation Rules** | Signature + event type whitelist |
| **Analytics Events** | `payment_succeeded` · `subscription_renewed` · `subscription_cancelled` · `credits_purchased` · `renewal_failed` (server) |

#### Request body

```json
{
  "id": "evt_1Nxxxx",
  "type": "checkout.session.completed",
  "data": { "object": { /* Stripe object */ } }
}
```

#### Success response

HTTP **200**

```json
{
  "received": true
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Missing/invalid signature |
| 500 | `INTERNAL_ERROR` | Handler failure → Stripe retries |

### API-SYS-001 — `GET /api/health`

**Health Check**

| Field | Detail |
|-------|--------|
| **Method** | `GET` |
| **URL** | `/api/health` |
| **Description** | Liveness probe for uptime monitoring. |
| **Authentication** | None |
| **Permissions** | Public |
| **Headers** | — |
| **Parameters** | — |
| **Rate Limits** | Open but monitor abuse |
| **Database Tables** | — (optional lightweight DB ping) |
| **Business Rules** | DEPLOYMENT.md monitoring |
| **Validation Rules** | — |
| **Analytics Events** | — |

#### Request body

_None._

#### Success response

HTTP **200**

```json
{
  "status": "ok",
  "time": "2026-07-27T09:16:30Z"
}
```

#### Errors

| HTTP | Code | When |
|------|------|------|
| 500 | `INTERNAL_ERROR` | Unhealthy |

---

## 4. Cross-cutting rules

| Rule | Detail |
|------|--------|
| Ownership | Other users' resources → `404 NOT_FOUND` |
| Tier gating | URL audit, full report/PDF, top-ups → Pro/Business |
| Credits | Reserve on create; refund on failed audit; never on delete |
| Email verified | Authed audits require `emailVerified` |
| Guest | 1 screenshot audit; no URL; claim on login |
| Webhooks | Only verified Stripe events grant entitlements |
| PCI | No raw PAN; Elements / Checkout / Portal only |
| SSRF | Public http(s); block private/metadata IPs |
| Rate limits | Auth, audit create, uploads, checkout |
| Async audits | `202` + poll status every ~2s |

---

## 5. Out of scope (do not implement)

| Item | Reason |
|------|--------|
| Email/password, GitHub OAuth | SSO Google/Apple/Microsoft only |
| Teams / invites APIs | BR-ENT-003 FUTURE |
| History search API | No UI |
| Report share API | No UI |
| Competitive analysis required field | BR-AI-006 undecided — nullable |

---

## 6. Related documents

| Doc | Use |
|-----|-----|
| API.md | Original sectioned spec |
| AUTH/AUDIT/USER/BILLING_API.md | Product templates |
| API_MAPPING.md | Screen → API |
| VALIDATION_RULES.md / ERROR_HANDLING.md | Field & error detail |
| ANALYTICS.md | Event catalogue |
| BUSINESS_RULES.md / PRICING.md | Gates & costs |

**End of API_SPECIFICATION.md**