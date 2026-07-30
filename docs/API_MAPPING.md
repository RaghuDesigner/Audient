# Audient — API Mapping

**Status:** Draft  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** SCREEN_MAPPING.md, COMPONENT_BEHAVIOR.md, COMPONENT_MAPPING.md, AUTH_API.md, AUDIT_API.md, USER_API.md, BILLING_API.md, API.md, DATABASE.md, SCHEMA.md, PRICING.md, prd.md

Design specification only — **no backend code**.

**Source of truth:** uploaded UI screens (`Screen1`–`Screen11`) + SCREEN_MAPPING. Product alias paths match AUTH/AUDIT/USER/BILLING templates; canonical resource paths in API.md are noted as aliases.

**Do not invent:** Endpoints exist only to support documented screens/flows. **SCREEN-M01/M02** (Progress / Report) have no upload assets but are required after GO (SCREEN_MAPPING R5). **Notifications** UI is missing (**SCREEN-M04**); APIs are listed because PRD + SCREEN_MAPPING specify them — mark as M04-backed.

---

## Conventions

| Topic | Rule |
|-------|------|
| Base | `/api/v1` unless noted |
| Auth | Session JWT via cookie or `Authorization: Bearer` after login |
| IDs | UUID or product ids (e.g. `AUD-001`) |
| Errors | `{ "error": { "code": "...", "message": "..." } }` |
| Money | Integer cents |
| Idempotency | `Idempotency-Key` on charge/create side-effects |
| Plans | Free · Pro · Business (`ENTERPRISE` in schema) — PRICING.md |
| Auth providers | Google · Apple · Microsoft only (uploaded SSO) |

### Screen index (uploaded)

| Screen ID | Name | Asset |
|-----------|------|--------|
| SCREEN-001 | Landing (Guest) | Screen1 |
| SCREEN-002 | Guest Profile Dropdown | Screen1 menu |
| SCREEN-003 | SSO Login Modal | Screen3 |
| SCREEN-004 | Free Home | Screen2 |
| SCREEN-005 | Manage Plan | Screen4 / 4.1 / 4.2 |
| SCREEN-006 | Payment Modal | Screen5 |
| SCREEN-007 | Payment Failed | Screen5.1 / 5.2 |
| SCREEN-008 | Payment Success | Screen5.3 / 5.4 |
| SCREEN-009 | Pro Home | Screen9 |
| SCREEN-010 | Settings — Personal | Screen6 |
| SCREEN-011 | Settings — Payment Details | Screen6.1 / 11 / 11.1 |
| SCREEN-012 | History (populated) | Screen8 |
| SCREEN-013 | History (empty) | Screen10 |
| SCREEN-M01 | Audit Progress | Missing design — required after GO |
| SCREEN-M02 | Audit Report | Missing design — required after progress |

---

## Screen → API matrix (uploaded + M01/M02)

| Screen | APIs used |
|--------|-----------|
| 001 Landing | Upload sign, Start Audit (guest screenshot), session detect `/me` |
| 002 Guest menu | None (opens 003) |
| 003 SSO | Google / Apple / Microsoft Login → Get Current User |
| 004 Free Home | Get Current User, Get Credits, Upload, Start Audit, Sign Out |
| 005 Manage Plan | Get Membership, Create Checkout |
| 006 Payment | Create Checkout / confirm payment (Stripe) |
| 007 Failed | None (retry → 006) |
| 008 Success | Get Membership, Get Credits (poll) |
| 009 Pro Home | Get Current User, Get Credits, Upload, Start Audit |
| 010 Personal | Get / Update Profile, Upload (avatar) |
| 011 Payment Details | Update Payment Method (Stripe tokenize) |
| 012 / 013 History | Get History; PDF; open Report |
| M01 Progress | Check Progress |
| M02 Report | Get Report; PDF; optional feedback |

---

# 1. Authentication

---

## API-AUTH-001 — Google Login

| Field | Detail |
|-------|--------|
| **API Name** | Google Login |
| **Purpose** | Authenticate or sign up with Google; establish session; seed Free + 300 credits on first login |
| **HTTP Method** | `POST` |
| **Endpoint** | `/auth/google` |
| **Screen(s)** | SCREEN-003 (SSO Login Modal); gated from 001/002/004/005 |
| **Component(s)** | MDL-001, BTN-003 Login with Google |
| **Authentication Required** | No |
| **Request Parameters** | None |
| **Request Body** | `{ "googleToken": "<Google ID token>" }` |
| **Success Response** | `{ "userId", "name", "email", "credits": 300, "plan": "Free" }` (+ session cookies) |
| **Error Responses** | Invalid Google Token · User Cancelled · Network · Server (`401` / `500`) |
| **Loading Behaviour** | BTN-003 “Redirecting…” / busy; other OAuth buttons disabled |
| **Retry Logic** | User retries click; no auto-retry of failed token |
| **Validation Rules** | Verify ID token (iss, aud, exp, sig); allow-listed client; upsert User |
| **Analytics Events** | `oauth_started{google}`, `login_success`, `login_failed`, `oauth_succeeded` / `oauth_failed` |
| **Security Notes** | Never store raw `googleToken`; httpOnly cookies; rate-limit `/auth/*` |

---

## API-AUTH-002 — Apple Login

| Field | Detail |
|-------|--------|
| **API Name** | Apple Login |
| **Purpose** | Authenticate or sign up with Apple |
| **HTTP Method** | `POST` |
| **Endpoint** | `/auth/apple` |
| **Screen(s)** | SCREEN-003 |
| **Component(s)** | MDL-001, BTN-004 |
| **Authentication Required** | No |
| **Request Parameters** | None |
| **Request Body** | `{ "appleToken": "<Apple ID token>" }` |
| **Success Response** | Same shape as Google Login |
| **Error Responses** | Invalid Apple Token · User Cancelled · Network · Server |
| **Loading Behaviour** | Same as Google |
| **Retry Logic** | User-initiated retry |
| **Validation Rules** | Verify Apple token; handle private relay email / sparse name |
| **Analytics Events** | `login_success` / `login_failed` `{ provider: "apple" }` |
| **Security Notes** | Same as Google; do not log tokens |

---

## API-AUTH-003 — Microsoft Login

| Field | Detail |
|-------|--------|
| **API Name** | Microsoft Login |
| **Purpose** | Authenticate or sign up with Microsoft / Azure AD |
| **HTTP Method** | `POST` |
| **Endpoint** | `/auth/microsoft` |
| **Screen(s)** | SCREEN-003 |
| **Component(s)** | MDL-001, BTN-005 |
| **Authentication Required** | No |
| **Request Parameters** | None |
| **Request Body** | `{ "microsoftToken": "<Microsoft ID token>" }` |
| **Success Response** | Same shape as Google Login |
| **Error Responses** | Invalid Microsoft Token · User Cancelled · Network · Server |
| **Loading Behaviour** | Same as Google |
| **Retry Logic** | User-initiated retry |
| **Validation Rules** | Verify Azure token audience/issuer |
| **Analytics Events** | `login_success` / `login_failed` `{ provider: "microsoft" }` |
| **Security Notes** | Same as Google |

---

## API-AUTH-004 — Sign Out

| Field | Detail |
|-------|--------|
| **API Name** | Sign Out |
| **Purpose** | End session and clear cookies |
| **HTTP Method** | `POST` |
| **Endpoint** | `/auth/sign-out` |
| **Screen(s)** | SCREEN-004 Profile dropdown → Logout → SCREEN-001 |
| **Component(s)** | Profile menu Logout item |
| **Authentication Required** | Yes (soft-fail if already expired) |
| **Request Parameters** | None |
| **Request Body** | `{}` |
| **Success Response** | `{ "ok": true }` |
| **Error Responses** | Network · Server (still clear local UI) |
| **Loading Behaviour** | Brief disable on Logout |
| **Retry Logic** | Force local clear even if request fails |
| **Validation Rules** | None |
| **Analytics Events** | `logout` |
| **Security Notes** | Invalidate refresh; clear httpOnly cookies |

---

# 2. User Profile

---

## API-USER-001 — Get Current User

| Field | Detail |
|-------|--------|
| **API Name** | Get Current User |
| **Purpose** | Hydrate header / home / settings with profile, plan, credit summary |
| **HTTP Method** | `GET` |
| **Endpoint** | `/me` |
| **Screen(s)** | 001 (session detect), 003 after login, 004, 009, 010, header on all authed |
| **Component(s)** | App shell, Credits/Crown/Avatar, Settings Personal |
| **Authentication Required** | Yes (001 may call to detect guest vs authed) |
| **Request Parameters** | None |
| **Request Body** | None |
| **Success Response** | `{ "userId", "name", "email", "avatarUrl", "credits", "plan", "tier", "emailVerified", … }` |
| **Error Responses** | `401 UNAUTHENTICATED` |
| **Loading Behaviour** | Header skeleton / suppress chrome until resolved |
| **Retry Logic** | Retry once on network; on 401 → Guest chrome |
| **Validation Rules** | N/A |
| **Analytics Events** | Optional `session_restored` |
| **Security Notes** | Never accept client `userId` as authority; first call may upsert User + FREE + 300 credits |

---

## API-USER-002 — Update Profile

| Field | Detail |
|-------|--------|
| **API Name** | Update Profile |
| **Purpose** | Save Personal settings (name, avatar URL) |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/me` |
| **Screen(s)** | SCREEN-010 |
| **Component(s)** | INP-010/011, INP-013, BTN-009 Update Changes |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | `{ "firstName"?, "lastName"?, "name"?, "avatarUrl"? }` — email **not** accepted |
| **Success Response** | Updated user object (same as Get Current User) |
| **Error Responses** | `400 VALIDATION_ERROR`, `401` |
| **Loading Behaviour** | BTN-009 spinner / `aria-busy`; fields disabled |
| **Retry Logic** | User retry; keep form dirty values |
| **Validation Rules** | Name length limits; `avatarUrl` must be user-owned upload key/URL; email read-only (R6: UI may show duplicate Email — do not PATCH) |
| **Analytics Events** | `profile_updated`, `avatar_updated` |
| **Security Notes** | Whitelist fields only; no email change via this API |

---

## API-USER-003 — Create Signed Upload URL

| Field | Detail |
|-------|--------|
| **API Name** | Create Signed Upload URL |
| **Purpose** | Upload screenshot (audit) or avatar to private storage |
| **HTTP Method** | `POST` |
| **Endpoint** | `/uploads/sign` |
| **Screen(s)** | 001, 004, 009 (screenshot); 010 (avatar) |
| **Component(s)** | INP-002, BTN-002; INP-013, BTN-016 |
| **Authentication Required** | Yes for avatar; **Guest allowed** for screenshot path (1 audit) |
| **Request Parameters** | None |
| **Request Body** | `{ "fileName", "contentType", "fileSize", "purpose": "screenshot" \| "avatar" }` |
| **Success Response** | `{ "uploadUrl", "key", "expiresIn": 300 }` then client `PUT` file to `uploadUrl` |
| **Error Responses** | `400` bad type/size, `401`, `429` |
| **Loading Behaviour** | Upload tile / avatar busy; progress optional |
| **Retry Logic** | Re-sign + PUT on failure; idempotent key strategy per attempt |
| **Validation Rules** | `image/png` \| `jpeg` \| `webp`; max size per SECURITY; purpose-scoped key prefix |
| **Analytics Events** | `screenshot_uploaded`, `upload_failed`, `avatar_updated` (after PATCH) |
| **Security Notes** | Short-lived signed URL; user-scoped keys; no public bucket |

---

# 3. Credits

---

## API-CRED-001 — Get User Credits

| Field | Detail |
|-------|--------|
| **API Name** | Get User Credits |
| **Purpose** | Drive Credits badge and gate messaging |
| **HTTP Method** | `GET` |
| **Endpoint** | `/user/credits` (alias `/credits`) |
| **Screen(s)** | 004, 008, 009, header; after audit / payment |
| **Component(s)** | BTN-014 Credits badge |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | None |
| **Success Response** | `{ "credits", "monthlyGrant", "isUnlimited", "plan", "nextResetAt" }` |
| **Error Responses** | `401` |
| **Loading Behaviour** | Badge skeleton / last-known value |
| **Retry Logic** | Retry on network; refresh after Start Audit & payment success |
| **Validation Rules** | N/A |
| **Analytics Events** | Optional `credits_viewed`; related `insufficient_credits` |
| **Security Notes** | Server is source of truth; never trust client balance |

---

## API-CRED-002 — Credit Top-Up

| Field | Detail |
|-------|--------|
| **API Name** | Credit Top-Up |
| **Purpose** | Buy mid-cycle credit packs (Pro/Business) |
| **HTTP Method** | `POST` |
| **Endpoint** | `/billing/topup` (alias `/credits/topups`) |
| **Screen(s)** | SCREEN-M05 (Buy Credits — missing UI); reachable from credits UX when designed |
| **Component(s)** | Credits / billing CTA (when present) |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | `{ "packId": "PACK_500" \| "PACK_2000" \| "PACK_5000" }` |
| **Success Response** | `{ "checkoutUrl" }` |
| **Error Responses** | Invalid pack · Free tier `403` · `401` · `429` |
| **Loading Behaviour** | CTA spinner → redirect Stripe |
| **Retry Logic** | `Idempotency-Key`; do not double-open without user action |
| **Validation Rules** | Pack from server config; Free cannot top up (PRICING) |
| **Analytics Events** | `topup_started`, `topup_completed`, `topup_failed` |
| **Security Notes** | Credits only after Stripe webhook; amounts server-side |

> **Note:** No uploaded Buy Credits screen; included because PRD/PRICING define top-ups and BILLING_API already specifies this path. Do not build UI until M05 is designed.

---

# 4. UX Audit

---

## API-AUDIT-001 — Start Audit

| Field | Detail |
|-------|--------|
| **API Name** | Start Audit |
| **Purpose** | Queue an AI UX audit from website URL and/or screenshot |
| **HTTP Method** | `POST` |
| **Endpoint** | `/ai/audit` (alias `/audits`) |
| **Screen(s)** | 001, 004, 009 → opens M01 |
| **Component(s)** | BTN-001 GO, INP-001, INP-002 |
| **Authentication Required** | Yes for URL / repeat audits; **Guest:** 1 screenshot only |
| **Request Parameters** | Header: `Idempotency-Key` (recommended) |
| **Request Body** | URL: `{ "website": "https://nike.com" }` · Screenshot: `{ "screenshotKeys": ["…"] }` |
| **Success Response** | `{ "auditId": "AUD-001", "status": "queued" }` (HTTP **202**) |
| **Error Responses** | Invalid URL · No Credits (`422`) · Website Blocked · Timeout · `429` · AI Unavailable · `403 TIER_NOT_ALLOWED` (Free/Guest URL) · `401` |
| **Loading Behaviour** | GO busy; disable inputs; then navigate Progress |
| **Retry Logic** | Idempotency-Key on retry; do not double-charge |
| **Validation Rules** | http(s) only; SSRF checks; credit reserve by tier (PRICING); URL = Pro/Business |
| **Analytics Events** | `go_clicked`, `audit_started`, `guest_url_gated`, `url_attempt_gated`, `invalid_url` |
| **Security Notes** | Server-side tier/credits; guest counter server-authoritative; SSRF denylist |

---

# 5. Audit Progress

---

## API-PROG-001 — Check Progress

| Field | Detail |
|-------|--------|
| **API Name** | Check Progress |
| **Purpose** | Poll job progress for Progress screen |
| **HTTP Method** | `GET` |
| **Endpoint** | `/audit/{auditId}` (alias `/audits/{auditId}/status`) |
| **Screen(s)** | SCREEN-M01 |
| **Component(s)** | Progress UI (M01) |
| **Authentication Required** | Yes (or guest session that owns audit) |
| **Request Parameters** | `auditId` path |
| **Request Body** | None |
| **Success Response** | `{ "progress": 45, "status": "running" }` — status: `queued` \| `running` \| `completed` \| `failed` |
| **Error Responses** | `401`, `404` (not owned / missing), Network · Server |
| **Loading Behaviour** | Progress bar from `progress`; first paint may show 0 |
| **Retry Logic** | **Poll every 2 seconds** until `progress === 100` or `failed`; clear on unmount |
| **Validation Rules** | Ownership scoped; no cross-user leak (`404`) |
| **Analytics Events** | `audit_progress_polled` (optional), `audit_completed`, `audit_failed` |
| **Security Notes** | Lightweight endpoint; rate-limit abusive polling |

---

# 6. Audit Report

---

## API-RPT-001 — Get Audit Report

| Field | Detail |
|-------|--------|
| **API Name** | Get Audit Report |
| **Purpose** | Load completed audit results for Report screen |
| **HTTP Method** | `GET` |
| **Endpoint** | `/audit/{auditId}/report` (alias `/audits/{auditId}/report`) |
| **Screen(s)** | SCREEN-M02; History row open (012) |
| **Component(s)** | Report views; CARD-002 / BTN-017 |
| **Authentication Required** | Yes |
| **Request Parameters** | `auditId` path |
| **Request Body** | None |
| **Success Response** | `{ "auditId", "status": "completed", "overallScore", "summary", … }` — full fields API.md §3 / SCHEMA Report |
| **Error Responses** | Not ready · `404` · `403 TIER_NOT_ALLOWED` (detailed gated for Free) · `401` |
| **Loading Behaviour** | Report skeleton until data |
| **Retry Logic** | Retry if called before complete; else user refresh |
| **Validation Rules** | Only `COMPLETED` audits; Free may get summary-only per PRD |
| **Analytics Events** | `report_viewed` `{ auditId }` |
| **Security Notes** | Ownership; no existence leak |

---

## API-RPT-002 — List Recommendations

| Field | Detail |
|-------|--------|
| **API Name** | List Recommendations |
| **Purpose** | Findings list for Report (severity / category) |
| **HTTP Method** | `GET` |
| **Endpoint** | `/audits/{auditId}/recommendations` |
| **Screen(s)** | SCREEN-M02 |
| **Component(s)** | Recommendation list (M02) |
| **Authentication Required** | Yes |
| **Request Parameters** | Query: `severity`, `category`, `sort` optional |
| **Request Body** | None |
| **Success Response** | `{ "items": [ { "id", "category", "severity", "title", "description", "recommendation", … } ] }` |
| **Error Responses** | `401`, `403`, `404` |
| **Loading Behaviour** | List skeleton |
| **Retry Logic** | Standard GET retry |
| **Validation Rules** | Owned audit; Free may see limited subset |
| **Analytics Events** | `recommendation_viewed` (optional) |
| **Security Notes** | Same ownership rules |

> Supports M02 report content from SCHEMA/PRD — not a separate uploaded screen.

---

## API-RPT-003 — Submit Report Feedback

| Field | Detail |
|-------|--------|
| **API Name** | Submit Report Feedback |
| **Purpose** | Thumbs / usefulness feedback (PRD quality KPI) |
| **HTTP Method** | `POST` |
| **Endpoint** | `/audits/{auditId}/report/feedback` |
| **Screen(s)** | SCREEN-M02 (when feedback control designed) |
| **Component(s)** | Report feedback control |
| **Authentication Required** | Yes |
| **Request Parameters** | `auditId` path |
| **Request Body** | `{ "rating": "UP" \| "DOWN" }` (per API.md) |
| **Success Response** | `{ "id", "rating" }` |
| **Error Responses** | `400`, `401`, `404` |
| **Loading Behaviour** | Control busy |
| **Retry Logic** | Idempotent upsert per user/report |
| **Validation Rules** | Own completed audit |
| **Analytics Events** | `report_feedback_submitted` |
| **Security Notes** | One feedback per user per report |

---

# 7. PDF Export

---

## API-PDF-001 — Download Report PDF

| Field | Detail |
|-------|--------|
| **API Name** | Download Report PDF |
| **Purpose** | Obtain short-lived signed URL for report PDF |
| **HTTP Method** | `GET` |
| **Endpoint** | `/report/{auditId}/pdf` (alias `/audits/{auditId}/report/pdf`) |
| **Screen(s)** | SCREEN-012 History; SCREEN-M02 Report |
| **Component(s)** | BTN-011 History PDF Download |
| **Authentication Required** | Yes |
| **Request Parameters** | `auditId` path |
| **Request Body** | None |
| **Success Response** | `{ "downloadUrl", "expiresIn": 300 }` |
| **Error Responses** | `401`, `403 TIER_NOT_ALLOWED` (Free), `404` PDF not ready |
| **Loading Behaviour** | Icon spinner `aria-busy` |
| **Retry Logic** | User retry; re-fetch URL if expired |
| **Validation Rules** | Pro/Business only; `hasPdf`; ownership |
| **Analytics Events** | `pdf_downloaded`, `pdf_download_failed`, `history_pdf_clicked` |
| **Security Notes** | Private storage; short TTL; never permanent public PDF URL |

---

# 8. Audit History

---

## API-HIST-001 — Get History

| Field | Detail |
|-------|--------|
| **API Name** | Get History |
| **Purpose** | List past audits for History screen |
| **HTTP Method** | `GET` |
| **Endpoint** | `/history` (alias `/audits`) |
| **Screen(s)** | SCREEN-012, SCREEN-013 |
| **Component(s)** | CARD-002 History audit card; History page |
| **Authentication Required** | Yes |
| **Request Parameters** | `limit`, `cursor`, `status`, `sort` (default `-createdAt`) |
| **Request Body** | None |
| **Success Response** | `{ "items": [ { "auditId", "title", "website", "status", "overallScore", "hasPdf", "createdAt" } ], "nextCursor" }` — empty `items` → empty state (013), not an error |
| **Error Responses** | `401`, `400` bad params |
| **Loading Behaviour** | Card skeletons |
| **Retry Logic** | Retry GET; cursor pagination for next page |
| **Validation Rules** | Own audits only |
| **Analytics Events** | `history_viewed`, `history_row_opened`, `empty_history_cta_clicked` |
| **Security Notes** | Scoped list; no other users’ rows |

---

# 9. Notifications

> **UI missing (SCREEN-M04).** APIs below support PRD long-audit completion + SCREEN_MAPPING M04. Do not invent notification types beyond schema.

---

## API-NOTIF-001 — List Notifications

| Field | Detail |
|-------|--------|
| **API Name** | List Notifications |
| **Purpose** | Notification center / bell list |
| **HTTP Method** | `GET` |
| **Endpoint** | `/notifications` |
| **Screen(s)** | SCREEN-M04 (missing); optional header when designed |
| **Component(s)** | Notification menu (M04) |
| **Authentication Required** | Yes |
| **Request Parameters** | `read`, `limit`, `cursor` |
| **Request Body** | None |
| **Success Response** | `{ "items": [ { "id", "type", "title", "message", "read", "metadata", "createdAt" } ], "nextCursor" }` — types include `AUDIT_COMPLETE`, `LOW_CREDITS`, `PAYMENT_SUCCEEDED`, … |
| **Error Responses** | `401` |
| **Loading Behaviour** | List skeleton |
| **Retry Logic** | Standard GET |
| **Validation Rules** | Own notifications |
| **Analytics Events** | `notifications_opened` |
| **Security Notes** | No cross-user access |

---

## API-NOTIF-002 — Mark Notification Read

| Field | Detail |
|-------|--------|
| **API Name** | Mark Notification Read |
| **Purpose** | Mark one notification read |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/notifications/{notificationId}` |
| **Screen(s)** | SCREEN-M04 |
| **Component(s)** | Notification row |
| **Authentication Required** | Yes |
| **Request Parameters** | `notificationId` path |
| **Request Body** | `{ "read": true }` |
| **Success Response** | Updated notification |
| **Error Responses** | `401`, `404` |
| **Loading Behaviour** | Optimistic UI ok |
| **Retry Logic** | Retry PATCH |
| **Validation Rules** | Ownership |
| **Analytics Events** | `notification_read` |
| **Security Notes** | Ownership |

---

## API-NOTIF-003 — Mark All Notifications Read

| Field | Detail |
|-------|--------|
| **API Name** | Mark All Notifications Read |
| **Purpose** | Clear unread badge |
| **HTTP Method** | `POST` |
| **Endpoint** | `/notifications/read-all` |
| **Screen(s)** | SCREEN-M04 |
| **Component(s)** | “Mark all read” |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | `{}` |
| **Success Response** | `{ "ok": true }` |
| **Error Responses** | `401` |
| **Loading Behaviour** | Button busy |
| **Retry Logic** | Safe to retry |
| **Validation Rules** | N/A |
| **Analytics Events** | `notifications_read_all` |
| **Security Notes** | Scoped to current user |

---

# 10. Subscription & Billing

---

## API-BILL-001 — Get Membership

| Field | Detail |
|-------|--------|
| **API Name** | Get Membership |
| **Purpose** | Current plan for Manage Plan / Active Account / post-payment poll |
| **HTTP Method** | `GET` |
| **Endpoint** | `/membership` |
| **Screen(s)** | 005, 008, 009 crown state |
| **Component(s)** | CARD-001, CARD-003, MDL-002, MDL-005, BTN-007 Active Account |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | None |
| **Success Response** | `{ "tier", "status", "billingInterval", "currentPeriodEnd", "cancelAtPeriodEnd" }` |
| **Error Responses** | `401` |
| **Loading Behaviour** | Plan card skeletons |
| **Retry Logic** | Poll after payment until `ACTIVE` (webhook lag) |
| **Validation Rules** | N/A |
| **Analytics Events** | `manage_plan_viewed`, `current_plan_viewed`, `plan_activated` |
| **Security Notes** | Entitlements only after verified Stripe webhook — never from client alone |

---

## API-BILL-002 — Create Checkout (Subscribe)

| Field | Detail |
|-------|--------|
| **API Name** | Create Checkout |
| **Purpose** | Start Pro / Business subscription payment |
| **HTTP Method** | `POST` |
| **Endpoint** | `/billing/checkout` |
| **Screen(s)** | 005 → 006; Success 008 / Failed 007 |
| **Component(s)** | BTN-006 Subscribe, MDL-003, INP-003 Plan select |
| **Authentication Required** | Yes (guest Subscribe → SSO first) |
| **Request Parameters** | `Idempotency-Key` recommended |
| **Request Body** | `{ "tier": "PRO" \| "ENTERPRISE", "billingInterval": "MONTHLY" }` |
| **Success Response** | `{ "checkoutUrl" }` **or** client secret for Stripe Elements (implementation choice; Figma shows in-modal card + OTP ≈ Elements + 3DS) |
| **Error Responses** | `400`, `401`, `409` already on tier |
| **Loading Behaviour** | Subscribe / Update Changes spinner |
| **Retry Logic** | New attempt on failure; Idempotency-Key |
| **Validation Rules** | Tier/price from `plans.ts` / PRICING ($29 Pro, $99 Business); never trust client amounts |
| **Analytics Events** | `subscribe_clicked`, `checkout_started`, `payment_submitted`, `payment_succeeded`, `payment_failed` |
| **Security Notes** | PCI via Stripe; no raw PAN on Audient servers; OTP in UI = SCA/3DS |

---

## API-BILL-003 — Update Payment Method

| Field | Detail |
|-------|--------|
| **API Name** | Update Payment Method |
| **Purpose** | Save card on Account Settings → Payment Details (SCREEN-011) |
| **HTTP Method** | `POST` |
| **Endpoint** | `/billing/payment-method` |
| **Screen(s)** | SCREEN-011 |
| **Component(s)** | INP-004–008, BTN-010 Update Changes, CARD-004 decorative |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | `{ "paymentMethodId": "<Stripe PM id>" }` — **not** raw card fields |
| **Success Response** | `{ "ok": true, "brand", "last4", "expMonth", "expYear" }` |
| **Error Responses** | Invalid PM · `401` · Stripe decline |
| **Loading Behaviour** | BTN-010 busy |
| **Retry Logic** | User retry after fixing card |
| **Validation Rules** | Stripe Elements collect card; Luhn/network on client for UX only |
| **Analytics Events** | `payment_method_updated` |
| **Security Notes** | **PCI:** never POST PAN/CVV to Audient; Elements only (R4) |

> Path not previously named in API.md; required by uploaded SCREEN-011. Prefer Stripe Customer + attach PM; optional: redirect users to Billing Portal instead (API-BILL-004).

---

## API-BILL-004 — Billing Portal

| Field | Detail |
|-------|--------|
| **API Name** | Billing Portal |
| **Purpose** | Stripe Customer Portal (cancel / update method / invoices) |
| **HTTP Method** | `POST` |
| **Endpoint** | `/billing/portal` |
| **Screen(s)** | SCREEN-M06 (missing); optional from Payment Details |
| **Component(s)** | Billing manage CTA |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | `{}` |
| **Success Response** | `{ "portalUrl" }` |
| **Error Responses** | `401`, `403` no Stripe customer |
| **Loading Behaviour** | Redirect after load |
| **Retry Logic** | User retry |
| **Validation Rules** | Must have billing account |
| **Analytics Events** | `billing_portal_opened` |
| **Security Notes** | Portal URL short-lived; own customer only |

---

## API-BILL-005 — List Payments

| Field | Detail |
|-------|--------|
| **API Name** | List Payments |
| **Purpose** | Payment / invoice history |
| **HTTP Method** | `GET` |
| **Endpoint** | `/payments` |
| **Screen(s)** | SCREEN-M06 (missing) |
| **Component(s)** | Billing history list |
| **Authentication Required** | Yes |
| **Request Parameters** | `limit`, `cursor` |
| **Request Body** | None |
| **Success Response** | `{ "items": [ { "id", "type", "status", "amount", "currency", "createdAt" } ], "nextCursor" }` |
| **Error Responses** | `401` |
| **Loading Behaviour** | Table skeleton |
| **Retry Logic** | Standard GET |
| **Validation Rules** | Own payments; amounts in cents |
| **Analytics Events** | `payments_viewed` |
| **Security Notes** | No Stripe secrets in response |

---

## API-BILL-006 — Stripe Webhook

| Field | Detail |
|-------|--------|
| **API Name** | Stripe Webhook |
| **Purpose** | Apply subscription / top-up / payment outcomes |
| **HTTP Method** | `POST` |
| **Endpoint** | `/webhooks/stripe` (outside versioned public API) |
| **Screen(s)** | Drives 007 / 008 entitlements (no direct UI call) |
| **Component(s)** | None (server) |
| **Authentication Required** | Stripe signature (not user JWT) |
| **Request Parameters** | None |
| **Request Body** | Raw Stripe event |
| **Success Response** | `200` ack |
| **Error Responses** | Invalid signature → `400` |
| **Loading Behaviour** | N/A |
| **Retry Logic** | Stripe retries; handlers idempotent |
| **Validation Rules** | Verify signing secret; idempotent by `event.id` |
| **Analytics Events** | Server: `plan_activated`, credit grant |
| **Security Notes** | No user session; verify signature; never trust client success alone |

---

# 11. Settings

---

## API-SET-001 — Get Preference Settings

| Field | Detail |
|-------|--------|
| **API Name** | Get Preference Settings |
| **Purpose** | Load non-profile preferences (theme, email notifications, …) |
| **HTTP Method** | `GET` |
| **Endpoint** | `/settings` |
| **Screen(s)** | SCREEN-004 analytics reference `settings_opened`; no dedicated prefs upload — Personal uses `/me` |
| **Component(s)** | Settings shell (when prefs UI exists) |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | None |
| **Success Response** | `{ "theme", "emailNotifications", "defaultPdfFormat", "timezone", "language" }` per SCHEMA |
| **Error Responses** | `401` |
| **Loading Behaviour** | Form skeleton |
| **Retry Logic** | Standard GET |
| **Validation Rules** | N/A |
| **Analytics Events** | `settings_opened` |
| **Security Notes** | Own settings row only |

> Uploaded Account Settings (010/011) are **Personal** + **Payment Details**. Prefer API-USER-002 / API-BILL-003 for those screens. Keep `/settings` for schema-backed prefs without inventing new Settings tabs in UI.

---

## API-SET-002 — Update Preference Settings

| Field | Detail |
|-------|--------|
| **API Name** | Update Preference Settings |
| **Purpose** | Persist preference settings |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/settings` |
| **Screen(s)** | Future prefs UI only |
| **Component(s)** | Settings form |
| **Authentication Required** | Yes |
| **Request Parameters** | None |
| **Request Body** | Whitelisted preference fields |
| **Success Response** | Updated settings object |
| **Error Responses** | `400`, `401` |
| **Loading Behaviour** | Save busy |
| **Retry Logic** | User retry |
| **Validation Rules** | Enum/whitelist only |
| **Analytics Events** | `settings_updated` |
| **Security Notes** | No privilege escalation fields |

---

## API-SET-003 — Delete Account

| Field | Detail |
|-------|--------|
| **API Name** | Delete Account |
| **Purpose** | GDPR erasure (PRD / SCREEN-M15) |
| **HTTP Method** | `DELETE` |
| **Endpoint** | `/me` |
| **Screen(s)** | SCREEN-M15 (missing) — not on uploaded Settings |
| **Component(s)** | Confirm delete dialog |
| **Authentication Required** | Yes |
| **Request Parameters** | Optional `?confirm=true` |
| **Request Body** | None |
| **Success Response** | `{ "status": "SCHEDULED_FOR_DELETION" }` |
| **Error Responses** | `401`, `409` active subscription must cancel first |
| **Loading Behaviour** | Confirm dialog busy |
| **Retry Logic** | Do not double-submit |
| **Validation Rules** | May require portal cancel first |
| **Analytics Events** | `account_deleted` |
| **Security Notes** | Cascade app data; anonymize Payments; delete auth user |

---

# End-to-end flows (uploaded screens)

### Guest screenshot audit

```text
SCREEN-001 → upload sign → PUT → POST /ai/audit
  → M01 poll GET /audit/{id} every 2s
  → M02 GET /audit/{id}/report
```

### Guest URL / second audit

```text
GO → gate → SCREEN-003 → POST /auth/{provider} → GET /me
  → Free Home / resume intent
```

### Subscribe

```text
SCREEN-005 → POST /billing/checkout
  → SCREEN-006 (Stripe Elements / 3DS)
  → webhook → SCREEN-008 → poll GET /membership + GET /user/credits
  → SCREEN-009
```

### History PDF

```text
SCREEN-012 → GET /history
  → BTN-011 → GET /report/{auditId}/pdf → downloadUrl
```

---

# Inventory summary

| Group | API IDs | Product endpoints |
|-------|---------|-------------------|
| 1 Authentication | AUTH-001–004 | `/auth/google`, `/apple`, `/microsoft`, `/auth/sign-out` |
| 2 User Profile | USER-001–003 | `/me`, `/uploads/sign` |
| 3 Credits | CRED-001–002 | `/user/credits`, `/billing/topup` |
| 4 UX Audit | AUDIT-001 | `/ai/audit` |
| 5 Audit Progress | PROG-001 | `/audit/{auditId}` |
| 6 Audit Report | RPT-001–003 | `/audit/{id}/report`, recommendations, feedback |
| 7 PDF Export | PDF-001 | `/report/{auditId}/pdf` |
| 8 Audit History | HIST-001 | `/history` |
| 9 Notifications | NOTIF-001–003 | `/notifications*` (M04) |
| 10 Subscription & Billing | BILL-001–006 | `/membership`, `/billing/*`, webhook |
| 11 Settings | SET-001–003 | `/settings`, `DELETE /me` |

---

# Explicit non-goals (not invented)

- Email/password or GitHub login (not in SSO uploads)
- Password reset / magic link screens
- Competitor URL multi-input UI (API.md optional field — omit until designed)
- Admin APIs
- Real-time WebSocket (optional supplement to 2s poll; not required by uploads)

---

# Related product API docs

| Doc | Role |
|-----|------|
| AUTH_API.md | Auth template detail |
| AUDIT_API.md | Audit / progress / report / PDF / history |
| USER_API.md | Credits |
| BILLING_API.md | Top-up |
| API.md | Canonical `/api/v1` shapes & envelopes |
