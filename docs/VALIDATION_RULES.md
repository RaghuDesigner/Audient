# Audient — Validation Rules

**Status:** Draft (production-ready specification)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** BUSINESS_RULES.md, SCREEN_MAPPING.md, COMPONENT_BEHAVIOR.md, API_MAPPING.md, STATE_MANAGEMENT.md, SCHEMA.md, DATABASE.md, PRICING.md, SECURITY.md, DESIGN_TOKENS.md, CURSOR_RULES.md, prd.md

**Audience:** Frontend · Backend · QA  
**Format:** Markdown only — **no application code**.

**Source of truth:** uploaded Figma screens + SCREEN_MAPPING / COMPONENT_BEHAVIOR / BUSINESS_RULES.  
**Do not invent** features. Items marked **OUT OF SCOPE** are listed so FE/BE/QA do **not** implement them.

> **Note:** `DESIGN_SYSTEM.md` is not in the repo; visual constraints follow **DESIGN_TOKENS.md** + COMPONENT_BEHAVIOR. `STATE_MANAGEMENT.md` lives at repo root (reload if IDE shows empty).

---

## Conventions

| Topic | Rule |
|-------|------|
| Client vs server | Client = UX early feedback; **server is authoritative** for credits, tier, SSRF, tokens, ownership |
| PCI | Never validate/store raw PAN on Audient servers — Stripe Elements; client Luhn is UX-only |
| OTP in Payment UI | Maps to **3DS/SCA** (BR-BILL-003), not a custom email OTP product |
| Error UX | Error token `#DC2626` + text/icon (not color alone); `aria-invalid` + `aria-describedby` |
| Timing labels | Load · Typing · Blur · Before API · After API · Submit · Background |

### Validation type legend

`Required` · `Format` · `Business` · `API` · `Security` · `Database` · `File` · `Permission` · `Accessibility`

### Explicit OUT OF SCOPE (do not invent)

| Topic | Reason |
|-------|--------|
| Password / Confirm Password / Password Reset / Change Password | SSO only (Google/Apple/Microsoft) |
| Company Name | Not on uploaded Settings |
| Coupon codes | Not in PRICING / screens |
| History / Notification / Report **search** UI | Not in uploads |
| Team invite / roles / max team size | FUTURE (BR-ENT-003) |
| Custom email OTP store | Use Stripe 3DS |
| GitHub OAuth | R3 |

---

## 1. Validation Catalogue

| ID range | Module |
|----------|--------|
| VAL-AUTH-001… | Authentication & session |
| VAL-URL-001… | Website URL |
| VAL-FILE-001… | Screenshot / avatar upload |
| VAL-CRED-001… | Credits |
| VAL-AUDIT-001… | Audit job gates |
| VAL-PDF-001… | PDF export |
| VAL-BILL-001… | Billing & payment |
| VAL-PROF-001… | Profile / Personal settings |
| VAL-SET-001… | Preference settings (schema) |
| VAL-NOTIF-001… | Notifications (M04) |
| VAL-PAGE-001… | Pagination (history/list APIs) |
| VAL-SEC-001… | Cross-cutting security |
| VAL-OOS-* | Out-of-scope placeholders (do not implement) |

---

## 2. Authentication Validation

### VAL-AUTH-001 — Google ID Token

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-001 |
| **Validation Name** | Google ID Token |
| **Purpose** | Accept only a verifiable Google ID token for login |
| **Feature** | SSO Login |
| **Screen** | SCREEN-003 |
| **Component** | BTN-003, MDL-001 |
| **Field Name** | googleToken |
| **Required (Yes/No)** | Yes |
| **Validation Type** | Required + Security + API |
| **Business Rule Reference** | BR-AUTH-001, BR-AUTH-002 |
| **API Dependency** | POST /auth/google |
| **Database Dependency** | Upsert User; seed Membership FREE + Credits 300 on first login |
| **Allowed Values** | Valid Google ID token JWT for configured client ID |
| **Rejected Values** | Empty, access tokens, expired/forged JWTs, wrong aud |
| **Minimum Length** | N/A (JWT) |
| **Maximum Length** | Provider limit |
| **Accepted Format** | JWT (three base64url segments) |
| **Regular Expression (if applicable)** | N/A — cryptographic verify |
| **Default Value** | None |
| **Validation Trigger** | Submit Login with Google / before session set |
| **Real-time Validation** | No |
| **Submit Validation** | Yes — server verifies iss, aud, exp, signature |
| **Error Message** | Sign-in failed. Please try again. |
| **Warning Message** | — |
| **Success Message** | — (navigate Home) |
| **Recovery Instructions** | Retry Google sign-in; check popup blockers |
| **Accessibility Notes** | Announce failure assertively; keep focus in modal; aria-busy while verifying |
| **Analytics Event** | login_failed{provider:google} / login_success |
| **Security Notes** | Never log full token; rate-limit /auth/*; httpOnly cookies |
| **Developer Notes** | Do not invent password fallback |
| **QA Test Cases** | TC-AUTH-001: valid token → session; TC-AUTH-002: expired → error; TC-AUTH-003: cancel consent → soft fail |

### VAL-AUTH-002 — Apple ID Token

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-002 |
| **Validation Name** | Apple ID Token |
| **Purpose** | Verify Apple Sign In token |
| **Feature** | SSO Login |
| **Screen** | SCREEN-003 |
| **Component** | BTN-004, MDL-001 |
| **Field Name** | appleToken |
| **Required (Yes/No)** | Yes |
| **Validation Type** | Required + Security + API |
| **Business Rule Reference** | BR-AUTH-001 |
| **API Dependency** | POST /auth/apple |
| **Database Dependency** | User upsert; tolerate private relay email |
| **Allowed Values** | Valid Apple identity token |
| **Rejected Values** | Empty/expired/wrong audience |
| **Minimum Length** | N/A |
| **Maximum Length** | Provider limit |
| **Accepted Format** | JWT |
| **Regular Expression (if applicable)** | N/A |
| **Default Value** | None |
| **Validation Trigger** | Apple button success callback |
| **Real-time Validation** | No |
| **Submit Validation** | Yes |
| **Error Message** | Sign-in failed. Please try again. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Retry Apple sign-in |
| **Accessibility Notes** | Same as Google |
| **Analytics Event** | login_failed{apple} / login_success |
| **Security Notes** | Handle sparse name; never store raw token |
| **Developer Notes** | Name may be empty on later logins |
| **QA Test Cases** | TC-AUTH-004: Apple success; TC-AUTH-005: cancel |

### VAL-AUTH-003 — Microsoft ID Token

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-003 |
| **Validation Name** | Microsoft ID Token |
| **Purpose** | Verify Microsoft/Azure AD token |
| **Feature** | SSO Login |
| **Screen** | SCREEN-003 |
| **Component** | BTN-005, MDL-001 |
| **Field Name** | microsoftToken |
| **Required (Yes/No)** | Yes |
| **Validation Type** | Required + Security + API |
| **Business Rule Reference** | BR-AUTH-001 |
| **API Dependency** | POST /auth/microsoft |
| **Database Dependency** | User upsert |
| **Allowed Values** | Valid Azure AD ID token for app registration |
| **Rejected Values** | Empty/expired/wrong tenant/aud |
| **Minimum Length** | N/A |
| **Maximum Length** | Provider limit |
| **Accepted Format** | JWT |
| **Regular Expression (if applicable)** | N/A |
| **Default Value** | None |
| **Validation Trigger** | Microsoft button callback |
| **Real-time Validation** | No |
| **Submit Validation** | Yes |
| **Error Message** | Sign-in failed. Please try again. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Retry Microsoft sign-in |
| **Accessibility Notes** | Same as Google |
| **Analytics Event** | login_failed{microsoft} / login_success |
| **Security Notes** | Validate issuer tenant config |
| **Developer Notes** | SDK provider id may be `azure` |
| **QA Test Cases** | TC-AUTH-006: Microsoft success/fail |

### VAL-AUTH-004 — Payment SCA / OTP Step

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-004 |
| **Validation Name** | Payment SCA / OTP Step |
| **Purpose** | Ensure payment challenge completed before confirming Subscribe |
| **Feature** | Billing Payment |
| **Screen** | SCREEN-006 |
| **Component** | INP-009, BTN-008, MDL-003 |
| **Field Name** | otp / 3DS challenge |
| **Required (Yes/No)** | Yes when Stripe requires SCA |
| **Validation Type** | Required + Security + API |
| **Business Rule Reference** | BR-BILL-003 |
| **API Dependency** | Stripe PaymentIntent confirm / 3DS |
| **Database Dependency** | No custom OTP table |
| **Allowed Values** | Successful 3DS result / complete challenge |
| **Rejected Values** | Incomplete, expired challenge, wrong code |
| **Minimum Length** | 4 (Figma segments) if UI shown |
| **Maximum Length** | 4 (Figma) — provider may differ |
| **Accepted Format** | Digits if segmented UI |
| **Regular Expression (if applicable)** | ^\d{4}$ (UI only) |
| **Default Value** | Empty |
| **Validation Trigger** | Before payment confirm completes |
| **Real-time Validation** | Per digit optional |
| **Submit Validation** | Yes |
| **Error Message** | Verification failed or expired. Try again. |
| **Warning Message** | Countdown expiring |
| **Success Message** | — |
| **Recovery Instructions** | Complete bank/app challenge or retry payment |
| **Accessibility Notes** | Label verification group; announce countdown politely (throttled); don’t rely on color of timer |
| **Analytics Event** | payment_otp_failed / payment_otp_succeeded |
| **Security Notes** | Prefer Stripe hosted 3DS; do not email-store OTP |
| **Developer Notes** | Figma OTP ≈ SCA UX |
| **QA Test Cases** | TC-AUTH-007: 3DS success; TC-AUTH-008: expire/retry |

### VAL-AUTH-005 — Email Verified for Audits

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-005 |
| **Validation Name** | Email Verified for Audits |
| **Purpose** | Block audits until emailVerified |
| **Feature** | Start Audit |
| **Screen** | SCREEN-004, 009 |
| **Component** | BTN-001 |
| **Field Name** | emailVerified (session) |
| **Required (Yes/No)** | Yes for Start Audit (authed) |
| **Validation Type** | Business + Permission + Database |
| **Business Rule Reference** | BR-AUTH-006 |
| **API Dependency** | POST /ai/audit → 403 EMAIL_NOT_VERIFIED |
| **Database Dependency** | Users.emailVerified |
| **Allowed Values** | true |
| **Rejected Values** | false |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | Boolean |
| **Regular Expression (if applicable)** | — |
| **Default Value** | from provider |
| **Validation Trigger** | Before API Start Audit |
| **Real-time Validation** | No (on submit) |
| **Submit Validation** | Yes |
| **Error Message** | Verify your email to run audits. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Complete provider email verification; refresh session |
| **Accessibility Notes** | Announce error on GO |
| **Analytics Event** | audit_validation_failed{reason:email_unverified} |
| **Security Notes** | Server enforce; never trust client flag alone |
| **Developer Notes** | Guest path uses guest rules instead |
| **QA Test Cases** | TC-AUTH-009: unverified → 403; verified → allow |

### VAL-AUTH-006 — Session JWT Valid

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-006 |
| **Validation Name** | Session JWT Valid |
| **Purpose** | Authenticated APIs require non-expired session |
| **Feature** | App shell |
| **Screen** | All authed |
| **Component** | Middleware / app shell |
| **Field Name** | access token / cookie |
| **Required (Yes/No)** | Yes for protected routes |
| **Validation Type** | Security + API |
| **Business Rule Reference** | BR-AUTH-003 |
| **API Dependency** | Any authed endpoint |
| **Database Dependency** | — |
| **Allowed Values** | Valid signature + unexpired JWT |
| **Rejected Values** | Missing/expired/tampered |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | JWT in cookie or Bearer |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | On page load (session restore); before API; background refresh |
| **Real-time Validation** | Background refresh |
| **Submit Validation** | Implicit on each API |
| **Error Message** | Your session expired. Please sign in again. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Open SSO; resume intent |
| **Accessibility Notes** | Focus login control; announce session ended |
| **Analytics Event** | session_expired |
| **Security Notes** | httpOnly Secure SameSite; rotate refresh |
| **Developer Notes** | Maps to APP-STATE-006 |
| **QA Test Cases** | TC-AUTH-010: expire → SSO; TC-AUTH-011: resume after login |

### VAL-AUTH-007 — Logout Request

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-AUTH-007 |
| **Validation Name** | Logout Request |
| **Purpose** | Clear session safely |
| **Feature** | Logout |
| **Screen** | SCREEN-004 menu → 001 |
| **Component** | Profile Logout |
| **Field Name** | — |
| **Required (Yes/No)** | N/A |
| **Validation Type** | API + Security |
| **Business Rule Reference** | BR-AUTH-004 |
| **API Dependency** | POST /auth/sign-out |
| **Database Dependency** | Optional lastLogoutAt if tracked |
| **Allowed Values** | Authenticated or soft-fail |
| **Rejected Values** | — |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Logout click |
| **Real-time Validation** | No |
| **Submit Validation** | Yes |
| **Error Message** | — (still clear local UI) |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | — |
| **Accessibility Notes** | Announce signed out |
| **Analytics Event** | logout |
| **Security Notes** | Invalidate refresh; clear cookies |
| **Developer Notes** | Optimistic local clear |
| **QA Test Cases** | TC-AUTH-012: logout → guest Landing |

### OUT OF SCOPE — Password Reset / Password Login

| ID | Name | Status |
|----|------|--------|
| VAL-OOS-001 | Password Reset | Do not implement |
| VAL-OOS-002 | Password / Confirm Password fields | Do not implement |

---

## 3. Website URL Validation

### Decision tree — URL path before Start Audit

```text
Paste / type URL → GO
  → Empty AND no screenshots? → Required error (need URL or image)
  → Has screenshots only? → Screenshot path (skip URL rules)
  → URL present?
       → Length > 2048? → Invalid
       → Trim / disallow spaces
       → Scheme in {http, https}? → else Invalid (ftp, file, javascript, about…)
       → Host is localhost / private IP / metadata? → Blocked (SSRF)
       → Client format OK?
            → Guest? → SSO (no create)
            → Free? → Upgrade (no create)
            → Pro/Business + credits + emailVerified?
                 → POST /ai/audit
                 → Server re-check SSRF + reachability in worker
```

### Valid examples

`https://google.com` · `https://apple.com` · `https://www.airbnb.com` · `https://sub.example.com`

### Invalid examples

`google` · `apple` · `localhost` · `127.0.0.1` · `ftp://website.com` · `file://test.html` · `about:blank` · `javascript:void(0)` · `www` · `abc` · `wwz.goggle.com` (product invalid chip examples)

### VAL-URL-001 — URL Required for URL Audit Path

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-001 |
| **Validation Name** | URL Required for URL Audit Path |
| **Purpose** | URL audits need a website value |
| **Feature** | Start Audit (URL) |
| **Screen** | 001, 004, 009 |
| **Component** | INP-001, BTN-001 |
| **Field Name** | website / websiteUrl |
| **Required (Yes/No)** | Yes for URL path; No if screenshotKeys provided |
| **Validation Type** | Required |
| **Business Rule Reference** | BR-SHOT-004, BR-URL-001 |
| **API Dependency** | POST /ai/audit |
| **Database Dependency** | Audits.websiteUrl |
| **Allowed Values** | Non-empty trimmed URL string |
| **Rejected Values** | Empty, whitespace-only |
| **Minimum Length** | 1 (after trim) |
| **Maximum Length** | 2048 |
| **Accepted Format** | Absolute URL |
| **Regular Expression (if applicable)** | See VAL-URL-002 |
| **Default Value** | Empty |
| **Validation Trigger** | Submit GO; optionally blur |
| **Real-time Validation** | Optional while typing (debounce) |
| **Submit Validation** | Yes |
| **Error Message** | Please enter a valid website URL beginning with https:// |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Check the URL and try again. |
| **Accessibility Notes** | aria-invalid; describe with error id; chip dismissible BTN-012 |
| **Analytics Event** | invalid_url |
| **Security Notes** | — |
| **Developer Notes** | Technical: required when inputType=URL |
| **QA Test Cases** | TC-URL-001: empty GO with no file → error; with file → OK |

### VAL-URL-002 — URL Format & Protocol

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-002 |
| **Validation Name** | URL Format & Protocol |
| **Purpose** | Only http/https absolute URLs |
| **Feature** | Website URL Input |
| **Screen** | 001, 004, 009 |
| **Component** | INP-001 |
| **Field Name** | website |
| **Required (Yes/No)** | When provided |
| **Validation Type** | Format + Security |
| **Business Rule Reference** | BR-URL-003 |
| **API Dependency** | POST /ai/audit → 400 VALIDATION_ERROR |
| **Database Dependency** | — |
| **Allowed Values** | http:// or https:// with valid host |
| **Rejected Values** | Bare domains, ftp, file, javascript, data, about, missing scheme |
| **Minimum Length** | — |
| **Maximum Length** | 2048 |
| **Accepted Format** | WHATWG URL with http(s) protocol |
| **Regular Expression (if applicable)** | Prefer URL parser over regex. Illustrative: ^https?:\/\/([^\s\/])+(\S*)?$ (insufficient alone — use parser + SSRF) |
| **Default Value** | Empty |
| **Validation Trigger** | Blur; Submit; Before API |
| **Real-time Validation** | Debounced optional |
| **Submit Validation** | Yes |
| **Error Message** | Invalid URL / That doesn't look like a valid website link. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Use a full link like https://example.com |
| **Accessibility Notes** | Error chip + field association; colour + text |
| **Analytics Event** | invalid_url |
| **Security Notes** | Reject javascript: and data: before any fetch |
| **Developer Notes** | Normalize: trim; optional add https only if product allows — designs expect explicit scheme |
| **QA Test Cases** | TC-URL-002: valid https OK; TC-URL-003: google invalid; TC-URL-004: ftp invalid; TC-URL-005: javascript invalid |

### VAL-URL-003 — Maximum URL Length

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-003 |
| **Validation Name** | Maximum URL Length |
| **Purpose** | Cap URL size |
| **Feature** | Website URL |
| **Screen** | 001, 004, 009 |
| **Component** | INP-001 |
| **Field Name** | website |
| **Required (Yes/No)** | — |
| **Validation Type** | Format + Database |
| **Business Rule Reference** | BR-URL-003 / COMPONENT_BEHAVIOR |
| **API Dependency** | 400 if exceeded |
| **Database Dependency** | String column limit ≥ 2048 |
| **Allowed Values** | ≤ 2048 chars |
| **Rejected Values** | > 2048 |
| **Minimum Length** | — |
| **Maximum Length** | 2048 |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Typing (maxLength) + Submit |
| **Real-time Validation** | Yes (prevent excess) |
| **Submit Validation** | Yes |
| **Error Message** | URL is too long. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Shorten the link |
| **Accessibility Notes** | Announce too long |
| **Analytics Event** | invalid_url{reason:too_long} |
| **Security Notes** | DoS guard |
| **Developer Notes** | input maxLength=2048 |
| **QA Test Cases** | TC-URL-006: 2049 chars rejected |

### VAL-URL-004 — SSRF / Blocked Hosts / Localhost / Private IPs

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-004 |
| **Validation Name** | SSRF / Blocked Hosts / Localhost / Private IPs |
| **Purpose** | Block internal and metadata targets |
| **Feature** | URL Audit |
| **Screen** | 009, M03 |
| **Component** | INP-001 |
| **Field Name** | website |
| **Required (Yes/No)** | — |
| **Validation Type** | Security + Business + API |
| **Business Rule Reference** | BR-URL-004 |
| **API Dependency** | POST /ai/audit; worker DNS re-check |
| **Database Dependency** | — |
| **Allowed Values** | Public routable hosts |
| **Rejected Values** | localhost, 127.0.0.1, 10/8, 172.16/12, 192.168/16, link-local, 169.254.169.254, ::1 |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Before API + Background (resolve DNS again at crawl) |
| **Real-time Validation** | Client can hint localhost; server authoritative |
| **Submit Validation** | Yes |
| **Error Message** | This address isn't allowed. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Use a public website URL |
| **Accessibility Notes** | Assertive error |
| **Analytics Event** | audit_validation_failed{reason:ssrf} |
| **Security Notes** | DNS rebinding protection; block redirects to private IPs |
| **Developer Notes** | Reject IP literals that are private; public IPs policy = allow only if product agrees — default reject raw IP unless documented |
| **QA Test Cases** | TC-URL-007: localhost; TC-URL-008: 127.0.0.1; TC-URL-009: 169.254.169.254 |

### VAL-URL-005 — HTTPS Preference / HTTP Allowed

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-005 |
| **Validation Name** | HTTPS Preference / HTTP Allowed |
| **Purpose** | Allow http and https; prefer https in messaging |
| **Feature** | URL Input |
| **Screen** | 001, 004, 009 |
| **Component** | INP-001 |
| **Field Name** | website |
| **Required (Yes/No)** | — |
| **Validation Type** | Format |
| **Business Rule Reference** | BR-URL-003 |
| **API Dependency** | — |
| **Database Dependency** | — |
| **Allowed Values** | http:// and https:// |
| **Rejected Values** | Other schemes |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Blur/Submit |
| **Real-time Validation** | Optional |
| **Submit Validation** | Yes |
| **Error Message** | Please enter a valid website URL beginning with https:// |
| **Warning Message** | Prefer https:// when possible |
| **Success Message** | — |
| **Recovery Instructions** | Add https:// |
| **Accessibility Notes** | — |
| **Analytics Event** | invalid_url |
| **Security Notes** | http allowed for crawl may upgrade/redirect — follow VAL-URL-006 |
| **Developer Notes** | Error copy emphasises https; http still valid per parser rules |
| **QA Test Cases** | TC-URL-010: http://example.com accepted by format (tier gates still apply) |

### VAL-URL-006 — Redirect Handling (server)

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-006 |
| **Validation Name** | Redirect Handling (server) |
| **Purpose** | Follow redirects safely without hopping to blocked IPs |
| **Feature** | URL crawl |
| **Screen** | M01/M03 |
| **Component** | Worker |
| **Field Name** | final URL |
| **Required (Yes/No)** | — |
| **Validation Type** | Security + API |
| **Business Rule Reference** | BR-URL-004, BR-URL-005 |
| **API Dependency** | Worker crawl |
| **Database Dependency** | May store final URL |
| **Allowed Values** | Public http(s) chain within hop limit |
| **Rejected Values** | Redirect to private/blocked; infinite redirects |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Background during crawl |
| **Real-time Validation** | No |
| **Submit Validation** | N/A |
| **Error Message** | We couldn't reach this site. / This address isn't allowed. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Try again or use screenshot upload |
| **Accessibility Notes** | Surface on M03 |
| **Analytics Event** | audit_failed{reason:redirect_blocked} |
| **Security Notes** | Re-validate IP after each redirect |
| **Developer Notes** | Max hops e.g. 5 |
| **QA Test Cases** | TC-URL-011: redirect to localhost blocked |

### VAL-URL-007 — Tier Gate for URL Audits

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-007 |
| **Validation Name** | Tier Gate for URL Audits |
| **Purpose** | Only Pro/Business ACTIVE may URL-audit |
| **Feature** | Start Audit |
| **Screen** | 001, 004, 009 |
| **Component** | BTN-001 |
| **Field Name** | tier + membership.status |
| **Required (Yes/No)** | — |
| **Validation Type** | Business + Permission |
| **Business Rule Reference** | BR-URL-001, BR-URL-002, BR-SUB-006 |
| **API Dependency** | POST /ai/audit → 403 TIER_NOT_ALLOWED |
| **Database Dependency** | Memberships.tier, status |
| **Allowed Values** | PRO/ENTERPRISE + ACTIVE|TRIALING |
| **Rejected Values** | Guest, FREE, PAST_DUE (premium limited) |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Before API / Submit GO |
| **Real-time Validation** | Disable/gate GO UX |
| **Submit Validation** | Yes |
| **Error Message** | Upgrade to audit live URLs. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Open Manage Plan and subscribe |
| **Accessibility Notes** | Announce gate |
| **Analytics Event** | url_attempt_gated / guest_url_gated |
| **Security Notes** | Server enforce |
| **Developer Notes** | Guest → SSO first |
| **QA Test Cases** | TC-URL-012: Free gated; TC-URL-013: Pro allowed |

### VAL-URL-008 — Duplicate Audit Prevention (Idempotency)

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-URL-008 |
| **Validation Name** | Duplicate Audit Prevention (Idempotency) |
| **Purpose** | Prevent double charge on retry |
| **Feature** | Start Audit |
| **Screen** | 001, 004, 009 |
| **Component** | BTN-001 |
| **Field Name** | Idempotency-Key header |
| **Required (Yes/No)** | Recommended Yes |
| **Validation Type** | API + Business |
| **Business Rule Reference** | BR-ERR-003, BR-CRED-004 |
| **API Dependency** | POST /ai/audit |
| **Database Dependency** | Idempotency store / audit dedupe window |
| **Allowed Values** | UUID key per user intent |
| **Rejected Values** | Reuse key with different body (409/conflict policy) |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | UUID |
| **Regular Expression (if applicable)** | UUID |
| **Default Value** | Client-generated per GO click |
| **Validation Trigger** | Before API |
| **Real-time Validation** | No |
| **Submit Validation** | Yes |
| **Error Message** | — (return original 202) |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Use new key for a truly new audit |
| **Accessibility Notes** | — |
| **Analytics Event** | — |
| **Security Notes** | Per-user key namespace |
| **Developer Notes** | Not content-hash dedupe of same URL forever — only idempotent retries |
| **QA Test Cases** | TC-URL-014: double-click same key → one audit |

### Reachability / domain / subdomain

| ID | Name | Timing | Error | Notes |
|----|------|--------|-------|-------|
| VAL-URL-009 | Host must have resolvable DNS (server) | Background / Before crawl | We couldn't reach this site. | After accept or in worker |
| VAL-URL-010 | Subdomains allowed if public | Format | — | `sub.example.com` valid |
| VAL-URL-011 | Reject bare labels without scheme | Format | Invalid URL | `www` alone invalid |

---

## 4. Screenshot Upload Validation

### VAL-FILE-001 — Allowed Image Formats

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-FILE-001 |
| **Validation Name** | Allowed Image Formats |
| **Purpose** | Only PNG/JPEG/WEBP for audit screenshots |
| **Feature** | Screenshot Upload |
| **Screen** | 001, 004, 009 |
| **Component** | INP-002, BTN-002 |
| **Field Name** | file / contentType |
| **Required (Yes/No)** | Yes for screenshot path |
| **Validation Type** | File + Format |
| **Business Rule Reference** | BR-SHOT-002 |
| **API Dependency** | POST /uploads/sign |
| **Database Dependency** | Storage object + Audits.screenshotKeys |
| **Allowed Values** | image/png, image/jpeg, image/webp |
| **Rejected Values** | pdf, svg, gif, heic (unless later added), executables |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | MIME + sniff magic bytes server-side |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | On file select; Before sign API |
| **Real-time Validation** | Yes on select |
| **Submit Validation** | Yes before Start Audit |
| **Error Message** | Use PNG/JPEG/WebP under the size limit. |
| **Warning Message** | — |
| **Success Message** | Image uploaded (chip) |
| **Recovery Instructions** | Choose a supported image and try again |
| **Accessibility Notes** | Announce fail/success chips; not color-only |
| **Analytics Event** | invalid_file / screenshot_uploaded |
| **Security Notes** | MIME sniff; block HTML disguised as image |
| **Developer Notes** | Avatar may use same set (INP-013 ≤5MB recommend) |
| **QA Test Cases** | TC-FILE-001: png OK; TC-FILE-002: pdf rejected; TC-FILE-003: spoofed MIME rejected |

### VAL-FILE-002 — Maximum File Size

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-FILE-002 |
| **Validation Name** | Maximum File Size |
| **Purpose** | Cap upload size |
| **Feature** | Screenshot |
| **Screen** | 001, 004, 009 |
| **Component** | INP-002 |
| **Field Name** | fileSize |
| **Required (Yes/No)** | — |
| **Validation Type** | File + Security |
| **Business Rule Reference** | BR-SHOT-002 |
| **API Dependency** | POST /uploads/sign → 400 |
| **Database Dependency** | — |
| **Allowed Values** | ≤ 10 MB (10 * 1024 * 1024 bytes) per file |
| **Rejected Values** | > 10 MB |
| **Minimum Length** | — |
| **Maximum Length** | 10485760 bytes |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | On select; Before API |
| **Real-time Validation** | Yes |
| **Submit Validation** | Yes |
| **Error Message** | Use PNG/JPEG/WebP under the size limit. |
| **Warning Message** | Large image may take longer |
| **Success Message** | — |
| **Recovery Instructions** | Compress or resize the image |
| **Accessibility Notes** | Announce size error |
| **Analytics Event** | invalid_file{reason:size} |
| **Security Notes** | Oversized upload protection |
| **Developer Notes** | Avatar recommend 5 MB max |
| **QA Test Cases** | TC-FILE-004: 10MB+1 rejected |

### VAL-FILE-003 — Minimum File Size

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-FILE-003 |
| **Validation Name** | Minimum File Size |
| **Purpose** | Reject empty/corrupt tiny files |
| **Feature** | Screenshot |
| **Screen** | 001, 004, 009 |
| **Component** | INP-002 |
| **Field Name** | fileSize |
| **Required (Yes/No)** | — |
| **Validation Type** | File |
| **Business Rule Reference** | BR-SHOT-002 |
| **API Dependency** | sign / worker decode |
| **Database Dependency** | — |
| **Allowed Values** | > 0; recommend ≥ 1 KB practical minimum |
| **Rejected Values** | 0-byte files |
| **Minimum Length** | 1 byte (hard); 1024 recommended |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | On select |
| **Real-time Validation** | Yes |
| **Submit Validation** | Yes |
| **Error Message** | This image couldn't be read. Try another file. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Re-export the screenshot |
| **Accessibility Notes** | — |
| **Analytics Event** | invalid_file{reason:empty} |
| **Security Notes** | — |
| **Developer Notes** | Decode verify in worker too |
| **QA Test Cases** | TC-FILE-005: 0-byte rejected |

### VAL-FILE-004 — Maximum Number of Images

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-FILE-004 |
| **Validation Name** | Maximum Number of Images |
| **Purpose** | Limit batch uploads |
| **Feature** | Screenshot |
| **Screen** | 001, 004, 009 |
| **Component** | INP-002 |
| **Field Name** | files[] |
| **Required (Yes/No)** | — |
| **Validation Type** | File + Business |
| **Business Rule Reference** | BR-SHOT-002 |
| **API Dependency** | Start Audit screenshotKeys |
| **Database Dependency** | — |
| **Allowed Values** | 1–5 files |
| **Rejected Values** | > 5 |
| **Minimum Length** | 1 for screenshot path |
| **Maximum Length** | 5 files |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | On select |
| **Real-time Validation** | Yes |
| **Submit Validation** | Yes |
| **Error Message** | You can upload up to 5 images. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Remove extra images |
| **Accessibility Notes** | — |
| **Analytics Event** | invalid_file{reason:count} |
| **Security Notes** | — |
| **Developer Notes** | — |
| **QA Test Cases** | TC-FILE-006: 6th file rejected |

### VAL-FILE-005 — Image Decodable / Not Corrupted

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-FILE-005 |
| **Validation Name** | Image Decodable / Not Corrupted |
| **Purpose** | Ensure image decodes |
| **Feature** | Screenshot |
| **Screen** | 001, 004, 009, M03 |
| **Component** | INP-002 / worker |
| **Field Name** | file bytes |
| **Required (Yes/No)** | — |
| **Validation Type** | File + API |
| **Business Rule Reference** | BR-ERR SCREENSHOT_INVALID |
| **API Dependency** | Worker / optional precheck |
| **Database Dependency** | — |
| **Allowed Values** | Decodable PNG/JPEG/WEBP |
| **Rejected Values** | Truncated/corrupt; password-protected archives (N/A for images) |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | After upload / Background |
| **Real-time Validation** | Client preview try |
| **Submit Validation** | Server/worker |
| **Error Message** | This image couldn't be read. Try another file. |
| **Warning Message** | — |
| **Success Message** | Preview shown |
| **Recovery Instructions** | Re-capture screenshot |
| **Accessibility Notes** | Failed chip |
| **Analytics Event** | invalid_file{reason:corrupt} |
| **Security Notes** | Do not execute embedded data |
| **Developer Notes** | Password-protected PDF N/A — images only |
| **QA Test Cases** | TC-FILE-007: truncated png fails |

| ID | Name | Rule | Message |
|----|------|------|---------|
| VAL-FILE-006 | Min/Max resolution | Recommend reject if either side < 32px or > 8192px (server) | Image resolution not supported |
| VAL-FILE-007 | Duplicate images in one batch | Optional hash dedupe within selection | You already added this image |
| VAL-FILE-008 | Unsupported files | Non-image extensions | Use PNG/JPEG/WebP under the size limit |
| VAL-FILE-009 | Preview validation | Object URL preview must render | Same as corrupt |
| VAL-FILE-010 | Avatar upload | Same formats; recommend max **5 MB**; purpose=avatar | Same format errors |

---

## 5. Credits Validation

### VAL-CRED-001 — Credits Available for Action

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-001 |
| **Validation Name** | Credits Available for Action |
| **Purpose** | Ensure balance ≥ tier cost before queue |
| **Feature** | Start Audit |
| **Screen** | 001, 004, 009 |
| **Component** | BTN-001, BTN-014 |
| **Field Name** | credits.balance |
| **Required (Yes/No)** | — |
| **Validation Type** | Business + Database + API |
| **Business Rule Reference** | BR-CRED-001…004 |
| **API Dependency** | POST /ai/audit → 422 INSUFFICIENT_CREDITS; GET /user/credits |
| **Database Dependency** | Credits.balance; ledger |
| **Allowed Values** | balance ≥ cost (see PRICING) |
| **Rejected Values** | balance < cost; negative balance |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | Non-negative integer credits |
| **Regular Expression (if applicable)** | — |
| **Default Value** | Server |
| **Validation Trigger** | Before API (transactional) |
| **Real-time Validation** | Badge refresh |
| **Submit Validation** | Yes |
| **Error Message** | Not enough credits for this audit. |
| **Warning Message** | Low credits |
| **Success Message** | — |
| **Recovery Instructions** | Upgrade plan or buy a credit pack (Pro/Business) |
| **Accessibility Notes** | Announce insufficient credits |
| **Analytics Event** | insufficient_credits |
| **Security Notes** | Row-lock; never trust client balance |
| **Developer Notes** | Costs: Free shot 150; Pro 100/400; Business 50/100 |
| **QA Test Cases** | TC-CRED-001: exact balance OK; TC-CRED-002: balance-1 → 422 |

### VAL-CRED-002 — Credit Deduction Integrity

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-002 |
| **Validation Name** | Credit Deduction Integrity |
| **Purpose** | Deduct only on accepted 202; ledger AUDIT_DEDUCTION |
| **Feature** | Start Audit |
| **Screen** | M01 |
| **Component** | Services |
| **Field Name** | amount |
| **Required (Yes/No)** | — |
| **Validation Type** | Database + Business |
| **Business Rule Reference** | BR-CRED-004 |
| **API Dependency** | POST /ai/audit |
| **Database Dependency** | Credits + CreditTransaction |
| **Allowed Values** | Positive deduction matching plans.ts |
| **Rejected Values** | Client-supplied amounts |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | Integer |
| **Regular Expression (if applicable)** | — |
| **Default Value** | From plans.ts |
| **Validation Trigger** | Before API commit |
| **Real-time Validation** | No |
| **Submit Validation** | Server |
| **Error Message** | We couldn't process your credits. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Retry; contact support if repeated |
| **Accessibility Notes** | — |
| **Analytics Event** | audit_started{creditsCost} |
| **Security Notes** | Server config only |
| **Developer Notes** | Idempotency prevents double deduct |
| **QA Test Cases** | TC-CRED-003: ledger row matches cost |

### VAL-CRED-003 — Credit Refund Eligibility

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-003 |
| **Validation Name** | Credit Refund Eligibility |
| **Purpose** | Refund only for eligible failures/cancels |
| **Feature** | Audit failure |
| **Screen** | M03 |
| **Component** | — |
| **Field Name** | refund |
| **Required (Yes/No)** | — |
| **Validation Type** | Business + Database |
| **Business Rule Reference** | BR-ERR-001, BR-PDF-004 |
| **API Dependency** | Worker |
| **Database Dependency** | REFUND ledger |
| **Allowed Values** | Full prior cost |
| **Rejected Values** | Refund on PDF-only failure; refund on delete |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | After API failure classification |
| **Real-time Validation** | No |
| **Submit Validation** | N/A |
| **Error Message** | — |
| **Warning Message** | — |
| **Success Message** | Credits refunded (on failure UI) |
| **Recovery Instructions** | Retry audit |
| **Accessibility Notes** | Announce refund |
| **Analytics Event** | — |
| **Security Notes** | Idempotent refund per audit |
| **Developer Notes** | Never negative balance |
| **QA Test Cases** | TC-CRED-004: FAILED refunds; TC-CRED-005: PDF_FAILED no refund |

### VAL-CRED-004 — Guest Free Trial Credits

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-004 |
| **Validation Name** | Guest Free Trial Credits |
| **Purpose** | Exactly one guest screenshot; display 150 / 1 free audit |
| **Feature** | Guest audit |
| **Screen** | 001 |
| **Component** | BTN-014 guest |
| **Field Name** | guestAuditCount |
| **Required (Yes/No)** | — |
| **Validation Type** | Business + Security |
| **Business Rule Reference** | BR-GUEST-001…004 |
| **API Dependency** | Guest session + Start Audit |
| **Database Dependency** | Guest session store |
| **Allowed Values** | guestAuditCount < 1 for create |
| **Rejected Values** | Second guest audit |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | 0 |
| **Validation Trigger** | Before API |
| **Real-time Validation** | Disable GO when exhausted |
| **Submit Validation** | Yes |
| **Error Message** | Log in to continue. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Sign in with Google, Apple, or Microsoft |
| **Accessibility Notes** | — |
| **Analytics Event** | guest_url_gated / login required |
| **Security Notes** | Server-authoritative guest counter |
| **Developer Notes** | Not a large fake balance |
| **QA Test Cases** | TC-CRED-006: second guest blocked |

### VAL-CRED-005 — Business / Enterprise Credits Metered

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-005 |
| **Validation Name** | Business / Enterprise Credits Metered |
| **Purpose** | Business uses 10,000 monthly credits — not unlimited |
| **Feature** | Credits |
| **Screen** | 009 |
| **Component** | BTN-014 |
| **Field Name** | balance / monthlyGrant |
| **Required (Yes/No)** | — |
| **Validation Type** | Business |
| **Business Rule Reference** | BR-CRED-002, BR-ENT-001 |
| **API Dependency** | GET /user/credits |
| **Database Dependency** | Credits |
| **Allowed Values** | 0…10000 plan pool + top-ups |
| **Rejected Values** | isUnlimited true unless product overturns plans.ts |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | 10000 grant |
| **Validation Trigger** | Before API |
| **Real-time Validation** | Badge |
| **Submit Validation** | Yes |
| **Error Message** | Not enough credits for this audit. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Buy top-up pack |
| **Accessibility Notes** | — |
| **Analytics Event** | insufficient_credits |
| **Security Notes** | — |
| **Developer Notes** | Ignore Figma Unlimited copy |
| **QA Test Cases** | TC-CRED-007: Business at 0 → 422 |

### VAL-CRED-006 — Negative Credits Forbidden

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-CRED-006 |
| **Validation Name** | Negative Credits Forbidden |
| **Purpose** | Balance never goes negative |
| **Feature** | Credits ledger |
| **Screen** | — |
| **Component** | Services |
| **Field Name** | balance |
| **Required (Yes/No)** | — |
| **Validation Type** | Database + Business |
| **Business Rule Reference** | BR-CRED-001 |
| **API Dependency** | — |
| **Database Dependency** | CHECK / txn |
| **Allowed Values** | >= 0 |
| **Rejected Values** | < 0 |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | int |
| **Regular Expression (if applicable)** | — |
| **Default Value** | 0+ |
| **Validation Trigger** | Background / Before commit |
| **Real-time Validation** | No |
| **Submit Validation** | Server |
| **Error Message** | We couldn't process your credits. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Retry |
| **Accessibility Notes** | — |
| **Analytics Event** | — |
| **Security Notes** | Transactional |
| **Developer Notes** | — |
| **QA Test Cases** | TC-CRED-008: concurrent spends one fails |

---

## 6. Audit Validation

| ID | Name | Type | Trigger | Error Message | BR / API |
|----|------|------|---------|---------------|----------|
| VAL-AUDIT-001 | Website reachable | API/Business | Worker | We couldn't reach this site. | URL_UNREACHABLE |
| VAL-AUDIT-002 | Auth wall on target site | Business | Worker | This page needs a login we can't pass. | AUTH_REQUIRED |
| VAL-AUDIT-003 | Crawl / audit timeout | Business | Worker ≤8 min URL / ≤90s shot | The audit took too long and stopped. | BR-URL-005, BR-SHOT-003 |
| VAL-AUDIT-004 | Website blocked / bot | Business | Worker | The site blocked automated access. | SITE_BLOCKS_BOT |
| VAL-AUDIT-005 | Page too large | Business | Worker | This page is too large/complex to render. | PAGE_TOO_HEAVY |
| VAL-AUDIT-006 | Unsupported / AI unavailable | API | Worker | Our AI is temporarily unavailable. | AI_UNAVAILABLE |
| VAL-AUDIT-007 | Input must be URL or screenshots | Required | Submit | Add a website link or upload a screenshot. | BR-SHOT-004 |
| VAL-AUDIT-008 | Concurrent audits | Business | Before API | Optional product limit — if enforced, show wait message | Document limit in config if enabled |
| VAL-AUDIT-009 | Retry after failure | Business | Retry CTA | Re-validate credits + URL/file | New Idempotency-Key |
| VAL-AUDIT-010 | Max audit duration | Business | Background | Same as timeout | Fail + refund if eligible |

**Unsupported technology:** no separate product validation beyond crawl/AI failure codes — do not invent browser-matrix UI.

---

## 7. PDF Validation

| ID | Name | Required checks | Error | BR |
|----|------|-----------------|-------|-----|
| VAL-PDF-001 | Audit complete | status COMPLETED | Report not ready | |
| VAL-PDF-002 | PDF exists | hasPdf true | PDF not ready | VAL → disable BTN-011 |
| VAL-PDF-003 | Generation success | worker OK | — | |
| VAL-PDF-004 | Generation failed | PDF_FAILED | Your report is ready, PDF failed. | BR-PDF-004 no credit refund |
| VAL-PDF-005 | Download permission | Pro/Business ACTIVE | Upgrade to download PDF | BR-PDF-001 → 403 |
| VAL-PDF-006 | Download URL expiry | expiresIn ~300s | Link expired — try again | BR-PDF-003 |

API: `GET /report/{auditId}/pdf`

---

## 8. Billing Validation

### VAL-BILL-001 — Plan Exists & Price Server-Side

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-BILL-001 |
| **Validation Name** | Plan Exists & Price Server-Side |
| **Purpose** | Only configured tiers checkout |
| **Feature** | Subscribe |
| **Screen** | 005, 006 |
| **Component** | CARD-001, INP-003, BTN-006 |
| **Field Name** | tier |
| **Required (Yes/No)** | Yes |
| **Validation Type** | Business + API |
| **Business Rule Reference** | BR-SUB-001, BR-BILL-001 |
| **API Dependency** | POST /billing/checkout |
| **Database Dependency** | plans.ts / Stripe Price IDs |
| **Allowed Values** | PRO, ENTERPRISE (Business) |
| **Rejected Values** | FREE, unknown, client price amounts |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | Enum |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Subscribe / Submit payment |
| **Real-time Validation** | Plan select |
| **Submit Validation** | Yes |
| **Error Message** | This plan isn't available. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Choose Pro or Business |
| **Accessibility Notes** | — |
| **Analytics Event** | payment_validation_failed |
| **Security Notes** | Never trust client cents |
| **Developer Notes** | Prices $29 / $99 |
| **QA Test Cases** | TC-BILL-001: forged amount ignored |

### VAL-BILL-002 — Plan Not Already Active

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-BILL-002 |
| **Validation Name** | Plan Not Already Active |
| **Purpose** | Block re-subscribe same tier |
| **Feature** | Manage Plan |
| **Screen** | 005 |
| **Component** | BTN-007 Active Account |
| **Field Name** | tier |
| **Required (Yes/No)** | — |
| **Validation Type** | Business + API |
| **Business Rule Reference** | BR-SUB-004 |
| **API Dependency** | POST /billing/checkout → 409 |
| **Database Dependency** | Memberships |
| **Allowed Values** | Different target tier |
| **Rejected Values** | Same as current ACTIVE tier |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | — |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Subscribe click |
| **Real-time Validation** | Show Active Account CTA |
| **Submit Validation** | Yes |
| **Error Message** | You're already on this plan. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | — |
| **Accessibility Notes** | — |
| **Analytics Event** | — |
| **Security Notes** | — |
| **Developer Notes** | — |
| **QA Test Cases** | TC-BILL-002: Pro Active Account no checkout |

### VAL-BILL-003 — Card Fields (Client UX via Stripe Elements)

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-BILL-003 |
| **Validation Name** | Card Fields (Client UX via Stripe Elements) |
| **Purpose** | UX validation before confirm; PCI via Stripe |
| **Feature** | Payment |
| **Screen** | 006, 011 |
| **Component** | INP-004…008 |
| **Field Name** | paymentMethodId (server) / Elements (client) |
| **Required (Yes/No)** | Yes to pay/save |
| **Validation Type** | Format + Security + Required |
| **Business Rule Reference** | BR-BILL-002 |
| **API Dependency** | Stripe + POST /billing/payment-method or checkout |
| **Database Dependency** | Store PM id / customer only |
| **Allowed Values** | Valid Stripe PM |
| **Rejected Values** | Raw PAN/CVV in Audient API body |
| **Minimum Length** | Name 2; CVV 3; etc. (Elements) |
| **Maximum Length** | Name 64; PAN display 19 digits |
| **Accepted Format** | Luhn for number UX; MM/YY expiry future |
| **Regular Expression (if applicable)** | CVV ^\d{3,4}$; expiry parsed MM/YY |
| **Default Value** | — |
| **Validation Trigger** | Blur + Submit Update Changes |
| **Real-time Validation** | Yes |
| **Submit Validation** | Yes |
| **Error Message** | Invalid Credit number (and field-level Stripe messages) |
| **Warning Message** | — |
| **Success Message** | Payment method saved / processing |
| **Recovery Instructions** | Check card details or try another card |
| **Accessibility Notes** | Each Element labelled; errors described |
| **Analytics Event** | payment_validation_failed |
| **Security Notes** | No PAN to Audient logs/DB |
| **Developer Notes** | Screen11.1 Invalid Credit number |
| **QA Test Cases** | TC-BILL-003: bad Luhn shows Invalid Credit number; TC-BILL-004: network token only posted |

### VAL-BILL-004 — Duplicate Payment / Idempotent Checkout

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-BILL-004 |
| **Validation Name** | Duplicate Payment / Idempotent Checkout |
| **Purpose** | Avoid double charges |
| **Feature** | Checkout |
| **Screen** | 006 |
| **Component** | BTN-008 |
| **Field Name** | Idempotency-Key |
| **Required (Yes/No)** | Recommended |
| **Validation Type** | API + Security |
| **Business Rule Reference** | BR-BILL-006, BR-ERR-003 |
| **API Dependency** | POST /billing/checkout |
| **Database Dependency** | Payments unique by Stripe ids |
| **Allowed Values** | One success per intent |
| **Rejected Values** | Double confirm without key |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | UUID key |
| **Regular Expression (if applicable)** | — |
| **Default Value** | New per attempt |
| **Validation Trigger** | Before API |
| **Real-time Validation** | Disable double submit |
| **Submit Validation** | Yes |
| **Error Message** | Payment is already processing. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Wait or check Manage Plan |
| **Accessibility Notes** | aria-busy on CTA |
| **Analytics Event** | — |
| **Security Notes** | Webhook idempotent by event.id |
| **Developer Notes** | — |
| **QA Test Cases** | TC-BILL-005: double click one PaymentIntent |

### VAL-BILL-005 — Top-Up Pack ID

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-BILL-005 |
| **Validation Name** | Top-Up Pack ID |
| **Purpose** | Only known packs |
| **Feature** | Credits top-up |
| **Screen** | M05 |
| **Component** | — |
| **Field Name** | packId |
| **Required (Yes/No)** | Yes |
| **Validation Type** | Business + API |
| **Business Rule Reference** | BR-CRED-006, BR-CRED-007 |
| **API Dependency** | POST /billing/topup |
| **Database Dependency** | Config packs |
| **Allowed Values** | PACK_500, PACK_2000, PACK_5000 |
| **Rejected Values** | Unknown; Free tier |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | Enum |
| **Regular Expression (if applicable)** | — |
| **Default Value** | — |
| **Validation Trigger** | Submit |
| **Real-time Validation** | No |
| **Submit Validation** | Yes |
| **Error Message** | Upgrade to buy credits. / Invalid pack. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Subscribe or choose a listed pack |
| **Accessibility Notes** | — |
| **Analytics Event** | payment_validation_failed |
| **Security Notes** | Server prices |
| **Developer Notes** | UI missing M05 — API ready |
| **QA Test Cases** | TC-BILL-006: Free 403; TC-BILL-007: bad packId 400 |

| ID | Name | Notes |
|----|------|-------|
| VAL-BILL-006 | Payment success/failure | Driven by Stripe + webhook; UI SCREEN-007/008 — no client “force success” |
| VAL-BILL-007 | Refund (Stripe) | Financial refunds ≠ credit ledger refunds; follow Stripe + Payments table |
| VAL-BILL-008 | Invoice generation | Via Stripe; list GET /payments / portal — M06 |
| VAL-OOS-003 | Coupon code | **OUT OF SCOPE** — not in product |

---

## 9. Profile Validation

### VAL-PROF-001 — First Name

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-PROF-001 |
| **Validation Name** | First Name |
| **Purpose** | Validate personal first name |
| **Feature** | Settings Personal |
| **Screen** | SCREEN-010 |
| **Component** | INP-010, BTN-009 |
| **Field Name** | firstName |
| **Required (Yes/No)** | Yes (recommended) |
| **Validation Type** | Required + Format |
| **Business Rule Reference** | BR-AUTH-005 (related profile) |
| **API Dependency** | PATCH /me |
| **Database Dependency** | Users.name (combined or fields) |
| **Allowed Values** | Letters, spaces, common punctuation ’- |
| **Rejected Values** | Empty (if required); control chars; HTML |
| **Minimum Length** | 1 |
| **Maximum Length** | 50 |
| **Accepted Format** | Trimmed text |
| **Regular Expression (if applicable)** | Unicode letters, spaces, `.` `'` `-` ; max 50 — prefer allow-list sanitizer over brittle regex |
| **Default Value** | From OAuth |
| **Validation Trigger** | Blur + Submit |
| **Real-time Validation** | Optional |
| **Submit Validation** | Yes |
| **Error Message** | Enter a valid first name. |
| **Warning Message** | — |
| **Success Message** | Profile updated |
| **Recovery Instructions** | Edit and save again |
| **Accessibility Notes** | Labelled; error describedby |
| **Analytics Event** | profile_updated / validation fail |
| **Security Notes** | Sanitize; store text not HTML |
| **Developer Notes** | May map into single name field |
| **QA Test Cases** | TC-PROF-001: empty fail; TC-PROF-002: <script> stripped/rejected |

### VAL-PROF-002 — Last Name

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-PROF-002 |
| **Validation Name** | Last Name |
| **Purpose** | Validate last name |
| **Feature** | Settings Personal |
| **Screen** | 010 |
| **Component** | INP-011 |
| **Field Name** | lastName |
| **Required (Yes/No)** | Yes (recommended) |
| **Validation Type** | Required + Format |
| **Business Rule Reference** | — |
| **API Dependency** | PATCH /me |
| **Database Dependency** | Users.name |
| **Allowed Values** | Same as first name |
| **Rejected Values** | Same |
| **Minimum Length** | 1 |
| **Maximum Length** | 50 |
| **Accepted Format** | Trimmed text |
| **Regular Expression (if applicable)** | Same family as first name |
| **Default Value** | From OAuth |
| **Validation Trigger** | Blur + Submit |
| **Real-time Validation** | Optional |
| **Submit Validation** | Yes |
| **Error Message** | Enter a valid last name. |
| **Warning Message** | — |
| **Success Message** | Profile updated |
| **Recovery Instructions** | Edit and save |
| **Accessibility Notes** | Same |
| **Analytics Event** | — |
| **Security Notes** | Sanitize |
| **Developer Notes** | — |
| **QA Test Cases** | TC-PROF-003 |

### VAL-PROF-003 — Email Read-Only

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-PROF-003 |
| **Validation Name** | Email Read-Only |
| **Purpose** | Email not editable via Settings |
| **Feature** | Settings Personal |
| **Screen** | 010 |
| **Component** | INP-012 |
| **Field Name** | email |
| **Required (Yes/No)** | Display only |
| **Validation Type** | Permission + Business |
| **Business Rule Reference** | BR-AUTH-005 |
| **API Dependency** | GET /me; PATCH /me must reject email |
| **Database Dependency** | Users.email unique |
| **Allowed Values** | Provider email |
| **Rejected Values** | Any PATCH email change |
| **Minimum Length** | — |
| **Maximum Length** | — |
| **Accepted Format** | email display |
| **Regular Expression (if applicable)** | — |
| **Default Value** | From auth |
| **Validation Trigger** | Submit |
| **Real-time Validation** | Field disabled/readOnly |
| **Submit Validation** | Server strips email |
| **Error Message** | Email can’t be changed here. |
| **Warning Message** | — |
| **Success Message** | — |
| **Recovery Instructions** | Manage email with your SSO provider |
| **Accessibility Notes** | Indicate read-only |
| **Analytics Event** | — |
| **Security Notes** | Prevent account takeover via email change |
| **Developer Notes** | R6 duplicate Email UI = bug |
| **QA Test Cases** | TC-PROF-004: PATCH email → 400 |

### VAL-PROF-004 — Profile Photo

| Field | Detail |
|-------|--------|
| **Validation ID** | VAL-PROF-004 |
| **Validation Name** | Profile Photo |
| **Purpose** | Validate avatar image |
| **Feature** | Settings Personal |
| **Screen** | 010 |
| **Component** | INP-013, BTN-016 |
| **Field Name** | avatar file / avatarUrl |
| **Required (Yes/No)** | No |
| **Validation Type** | File + Format |
| **Business Rule Reference** | — |
| **API Dependency** | POST /uploads/sign purpose=avatar; PATCH /me avatarUrl |
| **Database Dependency** | Users.avatarUrl |
| **Allowed Values** | png/jpeg/webp ≤5MB recommend |
| **Rejected Values** | Other types; > max |
| **Minimum Length** | — |
| **Maximum Length** | 5MB recommend |
| **Accepted Format** | Image |
| **Regular Expression (if applicable)** | — |
| **Default Value** | OAuth avatar |
| **Validation Trigger** | On select + Save |
| **Real-time Validation** | Yes |
| **Submit Validation** | Yes |
| **Error Message** | Use a PNG, JPEG, or WebP image under 5 MB. |
| **Warning Message** | — |
| **Success Message** | Photo updated |
| **Recovery Instructions** | Choose another image |
| **Accessibility Notes** | Alt on avatar; announce update |
| **Analytics Event** | avatar_updated |
| **Security Notes** | User-scoped key only |
| **Developer Notes** | — |
| **QA Test Cases** | TC-PROF-005 |

| ID | Status |
|----|--------|
| VAL-OOS-004 Company Name | OUT OF SCOPE |
| VAL-OOS-005 Password / Confirm Password | OUT OF SCOPE |
| VAL-OOS-006 Language/Theme on Personal screen | Prefer Settings prefs APIs if UI added — not on Screen6 |

---

## 10. Search Validation

**OUT OF SCOPE for v1 uploads** — History has no search/filter UI.

| ID | Name | Status |
|----|------|--------|
| VAL-OOS-010 | History Search | Do not implement |
| VAL-OOS-011 | Notification Search | Do not implement |
| VAL-OOS-012 | Report Search | Do not implement |
| VAL-PAGE-001 | History pagination cursor | **In scope** — `limit` 1–50 default 20; opaque `cursor`; `sort=-createdAt` | API GET /history |
| VAL-PAGE-002 | Reject bad pagination | `limit` non-int / >50 → 400 | |

---

## 11. Notification Validation

| ID | Name | Rules | API |
|----|------|-------|-----|
| VAL-NOTIF-001 | Mark as read | `notificationId` UUID owned by user; body `{read:true}` | PATCH |
| VAL-NOTIF-002 | Mark all read | Authed only | POST /notifications/read-all |
| VAL-NOTIF-003 | Unread count | Derived from list `read=false`; ≥ 0 | GET |
| VAL-OOS-013 | Delete / Archive notification | Not specified — do not invent |

---

## 12. Settings Validation

| ID | Field | Allowed | API |
|----|-------|---------|-----|
| VAL-SET-001 | theme | LIGHT \| DARK \| SYSTEM | PATCH /settings |
| VAL-SET-002 | language | Allow-listed BCP-47 tags from config | PATCH /settings |
| VAL-SET-003 | timezone | IANA timezone allow-list | PATCH /settings |
| VAL-SET-004 | emailNotifications | boolean | PATCH /settings |
| VAL-SET-005 | defaultPdfFormat | A4 \| LETTER | PATCH /settings |
| VAL-SET-006 | Delete account confirm | require confirm=true; may block if ACTIVE paid sub (409) | DELETE /me |
| VAL-OOS-014 | Change Password | OUT OF SCOPE |

> Personal (010) + Payment Details (011) are the uploaded Settings UIs; preference enums apply when prefs UI exists.

---

## 13. Enterprise Validation

**FUTURE / OUT OF SCOPE (BR-ENT-003)**

| ID | Name | Status |
|----|------|--------|
| VAL-OOS-020 | Invite Members | Do not implement |
| VAL-OOS-021 | Maximum Team Size | Do not implement |
| VAL-OOS-022 | Duplicate Members | Do not implement |
| VAL-OOS-023 | Role Assignment | Do not implement |
| VAL-OOS-024 | Permission matrix UI | Do not implement |

Business plan validation that **is** in scope = credits + tier gates (VAL-CRED-005, VAL-URL-007, VAL-BILL-001).

---

## 14. Security Validation (cross-cutting)

| ID | Threat | Rule | Timing |
|----|--------|------|--------|
| VAL-SEC-001 | SQL Injection | Parameterized queries ORM only; no string-concat SQL | All DB |
| VAL-SEC-002 | XSS / HTML injection | Escape UI; sanitize names; CSP | Profile, errors |
| VAL-SEC-003 | JS injection via URL | Reject `javascript:` `data:` schemes | URL validate |
| VAL-SEC-004 | CSRF | SameSite cookies; origin checks on mutating routes | POST/PATCH/DELETE |
| VAL-SEC-005 | Invalid tokens | Verify OAuth/JWT signatures | Auth |
| VAL-SEC-006 | Expired sessions | 401 → SSO | API |
| VAL-SEC-007 | Brute force | Rate limit auth + audits → 429 | Before API |
| VAL-SEC-008 | Malicious uploads | MIME sniff; size cap; private bucket | Upload |
| VAL-SEC-009 | Oversized uploads | 10MB shot / 5MB avatar | Upload |
| VAL-SEC-010 | SSRF | VAL-URL-004/006 | URL audit |
| VAL-SEC-011 | IDOR | Ownership → 404 | All resources |
| VAL-SEC-012 | Client amount tampering | Ignore client prices/credits | Billing/credits |

---

## 15. Accessibility Validation

| Topic | Rule |
|-------|------|
| ARIA | `aria-invalid`, `aria-describedby` → error id; `aria-busy` while validating/submitting |
| Live regions | Polite for success chips; assertive for blocking errors |
| Keyboard | Errors reachable; focus first invalid field on submit |
| Focus | Restore after modal validation failures |
| SR | Announce error text, not color alone |
| Colour | Error `#DC2626` + icon/text |
| WCAG | Align acceptance tests to **WCAG 2.1 AA** (CURSOR_RULES); treat 2.2 as stretch |

---

## 16. Analytics Mapping

| Failure / event | Analytics |
|-----------------|-----------|
| URL invalid | `invalid_url` |
| File invalid | `invalid_file` |
| Audit gate fail | `audit_validation_failed` |
| Payment field/SCA fail | `payment_validation_failed` |
| Login token fail | `login_validation_failed` / `login_failed` |
| Credits | `insufficient_credits` |
| Tier gate | `url_attempt_gated`, `guest_url_gated` |
| Rate limit | `rate_limited` |

---

## 17. Decision Trees

### Screenshot path

```text
Select files
  → count 1–5? else error
  → each MIME png/jpeg/webp? else error
  → each size ≤10MB and >0? else error
  → sign + PUT
  → preview OK?
  → Guest quota / credits / emailVerified
  → POST /ai/audit {screenshotKeys}
```

### Billing Subscribe

```text
Subscribe
  → Authed? else SSO
  → tier in {PRO,ENTERPRISE}? else error
  → tier ≠ current? else Active Account
  → checkout / Elements
  → card Elements valid?
  → SCA if required
  → webhook → membership ACTIVE
```

---

## 18. Edge Cases

| Case | Validation behaviour |
|------|----------------------|
| Offline | Block submit; show offline; no optimistic pay/audit success |
| Slow internet | Timeouts; Idempotency-Key on retry |
| Duplicate requests | Idempotency + button disable |
| Browser refresh mid-pay | Rely on Stripe + webhook; poll membership |
| Session expired mid-form | 401 → SSO; preserve non-sensitive draft URL only |
| Multiple tabs | Credit row-lock; one wins |
| Back button from Progress | Leave poll; don’t double-create |
| Webhook delay | Don’t invent credits client-side |
| Rate limiting | 429 message; backoff |
| Timeout | Safe error; retry guidance |

---

## 19. QA Checklist (summary)

| Test Case ID | Scenario | Expected | Pass criteria |
|--------------|----------|----------|---------------|
| TC-URL-002…005 | Invalid URL set | Error chip; no Start Audit | Matches examples list |
| TC-URL-007…009 | SSRF hosts | Blocked message | No worker fetch to private |
| TC-FILE-001…006 | Formats/size/count | Accept/reject per rules | |
| TC-CRED-001…008 | Balances/refunds/guest | 422/refund/login | Ledger correct |
| TC-BILL-001…007 | Plans/PCI/idempotency | No PAN stored; 409 on same plan | |
| TC-PROF-001…005 | Names/email/avatar | Email read-only | |
| TC-AUTH-001…012 | SSO/session/3DS | | |
| TC-PDF-001 | Free PDF | 403 / upgrade | |
| TC-SEC-001 | XSS in name | Escaped | |

---

## 20. Developer Notes

1. Share Zod (or equivalent) schemas between FE and BE for URL, profile, packId, pagination.  
2. SSRF and credits **must** be server-side even if FE validates.  
3. Stripe Elements for all card UI validation; Audient APIs accept `paymentMethodId` only.  
4. Keep error copy aligned with BUSINESS_RULES failure taxonomy.  
5. Do not implement VAL-OOS-* items.  
6. Config source for costs/limits: `src/config/plans.ts` + this doc.  

---

## Related documents

| Doc | Role |
|-----|------|
| BUSINESS_RULES.md | When validation passes/fails product-wise |
| COMPONENT_BEHAVIOR.md | Field-level UX states |
| API_MAPPING.md | Status codes |
| STATE_MANAGEMENT.md | UI states after validation |
| PRICING.md | Credit numbers |

---

**End of VALIDATION_RULES.md**
