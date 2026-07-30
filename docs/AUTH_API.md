# Audient — Authentication API

**Status:** Draft  
**Last updated:** 2026-07-29  
**Owner:** Raghunath Kamlekar  
**Related:** API.md, TECHNICAL_ARCHITECTURE.md §7, SECURITY.md, PRICING.md, COMPONENT_BEHAVIOR.md (MDL-001, BTN-003–005)

Authentication endpoints for Audient. Format: API Name · Purpose · Method · Endpoint · Called From · Request · Success · Failure · Frontend Action · Analytics.

**Providers (uploaded SSO modal):** Google · Apple · Microsoft.  
**First login:** upsert app `User` + Membership `FREE` + **300** credits (PRICING.md).  
**Session:** httpOnly cookies after verify; subsequent APIs use `Authorization: Bearer` / cookie (never trust client `userId`).

**Implementation note:** `googleToken` / provider tokens are **ID tokens** from the provider SDK (e.g. Google Identity Services). Server verifies the token (Supabase `signInWithIdToken` or equivalent), then issues the Audient/Supabase session. Do not store raw provider tokens.

### Auth inventory

| ID | API Name | Method | Endpoint |
|----|----------|--------|----------|
| AUTH-001 | Google Login | `POST` | `/auth/google` |
| AUTH-002 | Apple Login | `POST` | `/auth/apple` |
| AUTH-003 | Microsoft Login | `POST` | `/auth/microsoft` |
| AUTH-004 | Get Current User | `GET` | `/me` |
| AUTH-005 | Sign Out | `POST` | `/auth/sign-out` |

---

# Authentication

---

## API Name

Google Login

---

## Purpose

Authenticate users using Google.

---

## Method

POST

---

## Endpoint

`/auth/google`

(Full path: `/api/v1/auth/google` if using API versioning.)

---

## Called From

Login Screen — SSO Login Modal (**MDL-001**), **Login with Google** (**BTN-003**).  
Also opened from gated actions (URL audit, Subscribe while guest).

---

## Request

```json
{
  "googleToken": "xxxxx"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `googleToken` | string | Yes | Google ID token (JWT) from GIS / Google button; not an access token for Google APIs |

---

## Success Response

```json
{
  "userId": "123",
  "name": "John",
  "email": "john@gmail.com",
  "credits": 300,
  "plan": "Free"
}
```

| Field | Notes |
|-------|--------|
| `userId` | App user UUID (string) |
| `name` | Display name from Google (may be empty) |
| `email` | Verified email from Google |
| `credits` | Balance after login; **300** on first Free grant |
| `plan` | UI label: `Free` · `Pro` · `Business` |

Optional envelope (if matching API.md): wrap in `{ "data": { … } }`. Session cookies are set on success.

---

## Failure

| Case | Client handling |
|------|-----------------|
| Invalid Google Token | Show error; stay on Login; do not navigate |
| User Cancelled | Soft dismiss; no error toast required |
| Network Error | Retryable message; keep modal open |
| Server Error | Generic “Sign-in failed”; log server-side |

Example error body:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Invalid Google Token"
  }
}
```

---

## Frontend Action

Navigate to Dashboard (Free / Pro Home).  
Close SSO modal; hydrate header (credits, avatar). If login was opened from a gate, resume that intent after navigate.

---

## Analytics

`login_success` — `{ provider: "google", isNewUser? }`  
`login_failed` — `{ provider: "google", reason }`

Also (COMPONENT_BEHAVIOR): `oauth_started` / `oauth_succeeded` / `oauth_failed` `{ provider: "google" }`.

---

# AUTH-002 — Apple Login

## API Name

Apple Login

---

## Purpose

Authenticate users using Apple.

---

## Method

POST

---

## Endpoint

`/auth/apple`

---

## Called From

Login Screen — SSO Login Modal (**MDL-001**), **Login with Apple** (**BTN-004**).

---

## Request

```json
{
  "appleToken": "xxxxx"
}
```

---

## Success Response

```json
{
  "userId": "123",
  "name": "John",
  "email": "john@privaterelay.appleid.com",
  "credits": 300,
  "plan": "Free"
}
```

---

## Failure

Invalid Apple Token · User Cancelled · Network Error · Server Error

---

## Frontend Action

Navigate to Dashboard (same as Google Login).

---

## Analytics

`login_success` · `login_failed` `{ provider: "apple" }`

---

# AUTH-003 — Microsoft Login

## API Name

Microsoft Login

---

## Purpose

Authenticate users using Microsoft.

---

## Method

POST

---

## Endpoint

`/auth/microsoft`

---

## Called From

Login Screen — SSO Login Modal (**MDL-001**), **Login with Microsoft** (**BTN-005**).

---

## Request

```json
{
  "microsoftToken": "xxxxx"
}
```

---

## Success Response

```json
{
  "userId": "123",
  "name": "John",
  "email": "john@outlook.com",
  "credits": 300,
  "plan": "Free"
}
```

---

## Failure

Invalid Microsoft Token · User Cancelled · Network Error · Server Error

---

## Frontend Action

Navigate to Dashboard (same as Google Login).

---

## Analytics

`login_success` · `login_failed` `{ provider: "microsoft" }`

---

# AUTH-004 — Get Current User

## API Name

Get Current User

---

## Purpose

Return the authenticated user’s profile, credits, and plan (session restore / app shell).

---

## Method

GET

---

## Endpoint

`/me`

---

## Called From

App shell after login; page load when session cookie present.

---

## Request

(No body. Session via cookie or `Authorization: Bearer`.)

---

## Success Response

```json
{
  "userId": "123",
  "name": "John",
  "email": "john@gmail.com",
  "credits": 300,
  "plan": "Free"
}
```

---

## Failure

Not authenticated · Network Error · Server Error

---

## Frontend Action

Hydrate user store; show Guest chrome if 401.

---

## Analytics

(Optional) `session_restored`

---

# AUTH-005 — Sign Out

## API Name

Sign Out

---

## Purpose

End the user session and clear auth cookies.

---

## Method

POST

---

## Endpoint

`/auth/sign-out`

---

## Called From

Profile menu / Account Settings.

---

## Request

```json
{}
```

---

## Success Response

```json
{
  "ok": true
}
```

---

## Failure

Network Error · Server Error (still clear local UI state)

---

## Frontend Action

Navigate to Landing / Guest Home; clear credits and avatar.

---

## Analytics

`logout`

---

## Server rules (all provider logins)

1. Verify provider ID token (issuer, audience, expiry, signature).
2. Upsert `User` by email / provider subject; first login → FREE + **300** credits + Settings.
3. Set session cookies; return profile JSON above.
4. Never persist `googleToken` / `appleToken` / `microsoftToken`.
5. Rate-limit `/auth/*` → `429` when abused.

```text
Login with Google → GIS ID token
  → POST /auth/google { googleToken }
  → verify + session
  → { userId, name, email, credits, plan }
  → Navigate to Dashboard
```
