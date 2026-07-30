# Audient — Analytics Specification

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** SCREEN_MAPPING.md (§ Analytics Taxonomy), COMPONENT_BEHAVIOR.md, API_MAPPING.md, BUSINESS_RULES.md, STATE_MANAGEMENT.md, VALIDATION_RULES.md, ERROR_HANDLING.md, PRICING.md, prd.md

**Audience:** Product · Marketing · UX · Frontend · Backend · QA · Data  
**Format:** Markdown only — **no application code**.

**Source of truth:** uploaded screens + SCREEN_MAPPING analytics taxonomy.  
**Do not invent** product features. Events marked **OUT OF SCOPE** must not be implemented until designs/APIs exist.

> `DESIGN_SYSTEM.md` is not in-repo. Prefer snake_case event names already used across docs.

---

## 1. Analytics Overview

Audient analytics measures **activation** (first valuable audit), **conversion** (Free→Pro/Business), **audit quality** (success/fail/duration), **monetization** (checkout, renewals, top-ups), and **reliability** (errors, timeouts).

| Layer | Role |
|-------|------|
| Client | UI intents: clicks, views, validation fails, funnel steps |
| Server | Authoritative outcomes: `audit_started` 202, webhook `payment_succeeded`, ledger credits |
| Warehouse | KPI rollups, funnels, cohorts |

**Identity:** `anonymous_id` (guest) → `user_id` on login (alias). Never send raw PAN, ID tokens, or full screenshot binaries.

**Common properties (attach when available):**

| Property | Type | Notes |
|----------|------|-------|
| `user_id` | uuid/string | After auth |
| `anonymous_id` | string | Guest |
| `session_id` | string | |
| `audit_id` | string | |
| `plan_name` | Free\|Pro\|Business | UI label |
| `tier` | FREE\|PRO\|ENTERPRISE | Schema |
| `credits_remaining` | number | From server |
| `audit_type` / `mode` | url\|screenshot | |
| `website_url` | string | **Hash or eTLD+1 preferred** for privacy; full URL only if consented + policy allows |
| `device_type` | mobile\|desktop\|tablet | |
| `browser` / `os` | string | |
| `country` / `city` | string | IP geo — consent/sensitive |
| `language` | string | |
| `screen_resolution` | string | |
| `referrer` | string | |
| `utm_source` / `utm_medium` / `utm_campaign` | string | |
| `timestamp` | ISO8601 | Client + server `received_at` |

---

## 2. Event Naming Convention

Format: `{object}_{past_tense_verb}` in **snake_case**.

Examples: `landing_viewed`, `audit_started`, `audit_completed`, `audit_failed`, `pdf_downloaded`, `credits_purchased`, `subscription_upgraded`, `notification_opened`, `profile_updated`.

| Rule | Example |
|------|---------|
| Past tense | `clicked` not `click` |
| Provider in props not name | `oauth_started` + `provider:google` |
| Errors use taxonomy | `audit_failed` + `code:SSRF_BLOCKED` |
| No PII in event name | — |

**Canonical aliases:** Prefer SCREEN_MAPPING names when docs conflict (`payment_succeeded` not `payment_success`).

---

## 3. Event Catalogue

### OUT OF SCOPE (do not implement)

| Requested event | Reason |
|-----------------|--------|
| FAQ Expanded / Footer Link / Scroll Depth (productized) | Not in uploaded Landing frames — optional later |
| Report Shared | No share UI in uploads |
| Enterprise Contact / Team invite / Role / Team created | BR-ENT-003 FUTURE |
| Password Changed | SSO only |
| Search Used / Filter Applied | No History search UI |
| Referral funnel events | No referral product |
| Downgrade UI event | Via Stripe portal — use `subscription_cancelled` / portal |

Optional engineering-only: web vitals (§8) without inventing UI.

---

## 4. Landing Page Events

### EVT-LAND-001 — `landing_viewed`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-LAND-001 |
| **Event Name** | landing_viewed |
| **Category** | Landing |
| **Purpose** | Measure Landing impressions |
| **Business Goal** | Top-of-funnel volume / MAU proxy |
| **Trigger** | SCREEN-001 mount |
| **User Action** | Open Landing |
| **Screen** | SCREEN-001 |
| **Component** | Page |
| **Previous Screen** | Referrer/external |
| **Next Screen** | — |
| **Authentication Required** | No |
| **Plan Required** | Guest |
| **Properties** | authState, utm_*, referrer, device_type |
| **Required Parameters** | authState, session_id, timestamp |
| **Optional Parameters** | utm_source, utm_medium, utm_campaign, referrer, country |
| **API Reference** | Optional GET /me |
| **Database Reference** | — |
| **Business Rule Reference** | BR-GUEST-* |
| **State Reference** | LAND-STATE-001 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | Exactly one event per navigation to Landing |
| **Failure Behaviour** | Queue offline |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | SCREEN_MAPPING taxonomy |
| **QA Test Cases** | TC-AN-LAND-001 |

### EVT-LAND-002 — `go_clicked`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-LAND-002 |
| **Event Name** | go_clicked |
| **Category** | Landing / Audit |
| **Purpose** | Intent to start audit |
| **Business Goal** | Activation funnel |
| **Trigger** | BTN-001 click |
| **User Action** | Click GO |
| **Screen** | 001/004/009 |
| **Component** | BTN-001 |
| **Previous Screen** | Same |
| **Next Screen** | M01 or gate modal |
| **Authentication Required** | Depends |
| **Plan Required** | Per BR gates |
| **Properties** | mode=url|screenshot, tier, credits_remaining, has_url, has_files |
| **Required Parameters** | mode, tier, session_id |
| **Optional Parameters** | credits_remaining, website_host |
| **API Reference** | Before POST /ai/audit |
| **Database Reference** | — |
| **Business Rule Reference** | BR-SHOT-004, BR-URL-* |
| **State Reference** | LAND-STATE-013 |
| **Validation Reference** | VAL-URL-*, VAL-FILE-* |
| **Error Reference** | ERR-URL-*, ERR-CRED-* |
| **Success Criteria** | Fires on click even if later gated |
| **Failure Behaviour** | Still fire; follow with gate events |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Also fire guest_url_gated / url_attempt_gated as separate events |
| **QA Test Cases** | TC-AN-LAND-002 |

### EVT-LAND-003 — `upload_screenshot_clicked`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-LAND-003 |
| **Event Name** | upload_screenshot_clicked |
| **Category** | Landing |
| **Purpose** | Upload intent |
| **Business Goal** | Screenshot path adoption |
| **Trigger** | BTN-002 / INP-002 open |
| **User Action** | Open file picker |
| **Screen** | 001/004/009 |
| **Component** | BTN-002, INP-002 |
| **Previous Screen** | Same |
| **Next Screen** | Same |
| **Authentication Required** | No (guest allowed) |
| **Plan Required** | Any |
| **Properties** | tier, authState |
| **Required Parameters** | authState |
| **Optional Parameters** | — |
| **API Reference** | — |
| **Database Reference** | — |
| **Business Rule Reference** | BR-SHOT-001 |
| **State Reference** | LAND-STATE-007 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | Fires when picker opens |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias screenshot_upload_clicked OK if mapped |
| **QA Test Cases** | TC-AN-LAND-003 |

### EVT-LAND-004 — `website_url_entered`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-LAND-004 |
| **Event Name** | website_url_entered |
| **Category** | Landing |
| **Purpose** | URL engagement |
| **Business Goal** | Understand URL intent |
| **Trigger** | INP-001 blur with non-empty |
| **User Action** | Paste/type URL |
| **Screen** | 001/004/009 |
| **Component** | INP-001 |
| **Previous Screen** | Same |
| **Next Screen** | Same |
| **Authentication Required** | No |
| **Plan Required** | Any |
| **Properties** | valid_client, length, has_https |
| **Required Parameters** | valid_client |
| **Optional Parameters** | website_host (eTLD+1) |
| **API Reference** | — |
| **Database Reference** | — |
| **Business Rule Reference** | BR-URL-003 |
| **State Reference** | LAND-STATE-002/003 |
| **Validation Reference** | VAL-URL-* |
| **Error Reference** | invalid_url |
| **Success Criteria** | Debounced; not every keystroke |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Prefer host hash over full URL |
| **QA Test Cases** | TC-AN-LAND-004 |

| Event ID | Event Name | Trigger | Key props | Notes |
|----------|------------|---------|-----------|-------|
| EVT-LAND-005 | `screenshot_uploaded` | PUT success | sizeKB, mime | SCREEN_MAPPING |
| EVT-LAND-006 | `screenshot_removed` | Chip dismiss | — | |
| EVT-LAND-007 | `screenshot_upload_failed` / `invalid_file` | Reject/fail | reason | |
| EVT-LAND-008 | `guest_menu_opened` | Avatar guest | — | SCREEN-002 |
| EVT-LAND-009 | `hero_cta_clicked` | If primary CTA ≠ GO | cta_id | Map to GO or Login if same control |
| EVT-OOS-LAND-001 | scroll_depth / faq_expanded / footer_link_clicked | — | — | **OOS** until designed |

---

## 5. Authentication Events

### EVT-AUTH-001 — `login_modal_opened`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUTH-001 |
| **Event Name** | login_modal_opened |
| **Category** | Authentication |
| **Purpose** | SSO modal exposure |
| **Business Goal** | Auth funnel |
| **Trigger** | MDL-001 open |
| **User Action** | Login / gate |
| **Screen** | SCREEN-003 |
| **Component** | MDL-001 |
| **Previous Screen** | 001/004/005 |
| **Next Screen** | 003 |
| **Authentication Required** | No |
| **Plan Required** | — |
| **Properties** | source=guest_menu|url_gate|subscribe_gate|session_expired |
| **Required Parameters** | source |
| **Optional Parameters** | — |
| **API Reference** | — |
| **Database Reference** | — |
| **Business Rule Reference** | BR-AUTH-001 |
| **State Reference** | AUTH-STATE-002 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | Once per open |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Also login_started on provider click |
| **QA Test Cases** | TC-AN-AUTH-001 |

### EVT-AUTH-002 — `oauth_started`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUTH-002 |
| **Event Name** | oauth_started |
| **Category** | Authentication |
| **Purpose** | Provider chosen |
| **Business Goal** | Provider mix |
| **Trigger** | BTN-003/004/005 |
| **User Action** | Click provider |
| **Screen** | 003 |
| **Component** | BTN-003/004/005 |
| **Previous Screen** | 003 |
| **Next Screen** | IdP |
| **Authentication Required** | No |
| **Plan Required** | — |
| **Properties** | provider=google|apple|microsoft |
| **Required Parameters** | provider |
| **Optional Parameters** | — |
| **API Reference** | POST /auth/{provider} |
| **Database Reference** | — |
| **Business Rule Reference** | BR-AUTH-001 |
| **State Reference** | AUTH-STATE-003…006 |
| **Validation Reference** | VAL-AUTH-001…003 |
| **Error Reference** | ERR-AUTH-001…004 |
| **Success Criteria** | Fire before redirect/token |
| **Failure Behaviour** | Follow login_failed |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias login_started |
| **QA Test Cases** | TC-AN-AUTH-002 |

### EVT-AUTH-003 — `login_success`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUTH-003 |
| **Event Name** | login_success |
| **Category** | Authentication |
| **Purpose** | Session established |
| **Business Goal** | Activation / CRM identify |
| **Trigger** | Auth 200 + session |
| **User Action** | Complete OAuth |
| **Screen** | 003→004/009 |
| **Component** | MDL-001 |
| **Previous Screen** | 003 |
| **Next Screen** | Home / resume |
| **Authentication Required** | Result Yes |
| **Plan Required** | FREE seeded if new |
| **Properties** | provider, isNewUser, credits_remaining, plan_name |
| **Required Parameters** | provider, isNewUser, user_id |
| **Optional Parameters** | credits_remaining |
| **API Reference** | POST /auth/* ; GET /me |
| **Database Reference** | Users, Memberships, Credits |
| **Business Rule Reference** | BR-AUTH-002, BR-GUEST-006 |
| **State Reference** | AUTH-STATE-007 |
| **Validation Reference** | VAL-AUTH-* |
| **Error Reference** | — |
| **Success Criteria** | Server-confirmed session |
| **Failure Behaviour** | N/A |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias identities guest→user; fire oauth_succeeded too OK |
| **QA Test Cases** | TC-AN-AUTH-003 new vs returning |

| Event ID | Event Name | Key props | Refs |
|----------|------------|-----------|------|
| EVT-AUTH-004 | `login_failed` | provider, reason | ERR-AUTH-* |
| EVT-AUTH-005 | `login_modal_dismissed` | source | |
| EVT-AUTH-006 | `logout` | — | BR-AUTH-004 |
| EVT-AUTH-007 | `session_expired` | — | APP-STATE-006 |
| EVT-AUTH-008 | `unauthorized_blocked` | route | |

---

## 6. Website & Screenshot Audit Events

### EVT-AUDIT-001 — `audit_started`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUDIT-001 |
| **Event Name** | audit_started |
| **Category** | Audit |
| **Purpose** | Authoritative audit accept |
| **Business Goal** | Activation KPI |
| **Trigger** | POST /ai/audit 202 |
| **User Action** | GO accepted |
| **Screen** | →M01 |
| **Component** | BTN-001 |
| **Previous Screen** | 001/004/009 |
| **Next Screen** | SCREEN-M01 |
| **Authentication Required** | Guest shot once / else Yes |
| **Plan Required** | Per mode |
| **Properties** | audit_id, mode, creditsCost, tier, estimatedSeconds? |
| **Required Parameters** | audit_id, mode, creditsCost |
| **Optional Parameters** | website_host |
| **API Reference** | POST /ai/audit |
| **Database Reference** | Audits QUEUED; CreditTransaction |
| **Business Rule Reference** | BR-CRED-004 |
| **State Reference** | AUDIT-STATE-001/002 |
| **Validation Reference** | VAL-CRED-001 |
| **Error Reference** | — |
| **Success Criteria** | Server emit preferred (or client on 202) |
| **Failure Behaviour** | No event on 4xx |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | url_audit_started may alias mode=url; screenshot via mode |
| **QA Test Cases** | TC-AN-AUDIT-001 |

### EVT-AUDIT-002 — `audit_completed`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUDIT-002 |
| **Event Name** | audit_completed |
| **Category** | Audit |
| **Purpose** | Successful job |
| **Business Goal** | Activation / success rate |
| **Trigger** | status COMPLETED |
| **User Action** | — |
| **Screen** | M01→M02 |
| **Component** | Progress |
| **Previous Screen** | M01 |
| **Next Screen** | M02 |
| **Authentication Required** | Yes/guest session |
| **Plan Required** | — |
| **Properties** | audit_id, mode, durationSec, overallScore?, tier |
| **Required Parameters** | audit_id, durationSec |
| **Optional Parameters** | overallScore |
| **API Reference** | GET /audit/{id} |
| **Database Reference** | Audits COMPLETED |
| **Business Rule Reference** | BR-AI-001 |
| **State Reference** | AUDIT-STATE-012 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | Server-side emit on COMPLETED |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Primary activation event per SCREEN_MAPPING |
| **QA Test Cases** | TC-AN-AUDIT-002 |

### EVT-AUDIT-003 — `audit_failed`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-AUDIT-003 |
| **Event Name** | audit_failed |
| **Category** | Audit |
| **Purpose** | Terminal failure |
| **Business Goal** | Reliability / support |
| **Trigger** | status FAILED |
| **User Action** | — |
| **Screen** | M03 |
| **Component** | M03 |
| **Previous Screen** | M01 |
| **Next Screen** | M03 |
| **Authentication Required** | — |
| **Plan Required** | — |
| **Properties** | audit_id, code (taxonomy), durationSec, refunded |
| **Required Parameters** | audit_id, code |
| **Optional Parameters** | refunded |
| **API Reference** | status |
| **Database Reference** | FAILED + optional REFUND |
| **Business Rule Reference** | BR-ERR-001/002 |
| **State Reference** | AUDIT-STATE-013 |
| **Validation Reference** | — |
| **Error Reference** | ERR-AUDIT-*, ERR-URL-* |
| **Success Criteria** | code from § ERROR_HANDLING taxonomy |
| **Failure Behaviour** | N/A |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Never omit code |
| **QA Test Cases** | TC-AN-AUDIT-003 each code |

| Event ID | Event Name | Trigger | Key props |
|----------|------------|---------|-----------|
| EVT-AUDIT-004 | `audit_queued` | Optional when worker enqueued | audit_id |
| EVT-AUDIT-005 | `audit_processing` / `audit_processing_watched` | Progress view / poll | audit_id, progress |
| EVT-AUDIT-006 | `audit_cancelled` | Cancel if supported | elapsedSec |
| EVT-AUDIT-007 | `audit_retried` | Retry CTA | prior_audit_id, code |
| EVT-AUDIT-008 | `invalid_url` | Client/server reject | reason |
| EVT-AUDIT-009 | `guest_url_gated` | Guest URL GO | — |
| EVT-AUDIT-010 | `url_attempt_gated` | Free URL GO | tier |
| EVT-AUDIT-011 | `screenshot_audit_started` | Alias | use audit_started mode=screenshot |
| EVT-AUDIT-012 | `audit_duration` | Measure | Prefer durationSec on completed/failed |

---

## 7. Report & PDF Events

### EVT-RPT-001 — `report_viewed`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-RPT-001 |
| **Event Name** | report_viewed |
| **Category** | Reports |
| **Purpose** | Report engagement |
| **Business Goal** | Aha / retention |
| **Trigger** | M02 render |
| **User Action** | Open report |
| **Screen** | SCREEN-M02 |
| **Component** | Report |
| **Previous Screen** | M01/012 |
| **Next Screen** | M02 |
| **Authentication Required** | Yes |
| **Plan Required** | Brief Free; full paid |
| **Properties** | audit_id, tier, overallScore?, source=progress|history |
| **Required Parameters** | audit_id, tier |
| **Optional Parameters** | overallScore, source |
| **API Reference** | GET /audit/{id}/report |
| **Database Reference** | Reports |
| **Business Rule Reference** | BR-AI-003 |
| **State Reference** | RPT-STATE-002 |
| **Validation Reference** | — |
| **Error Reference** | ERR-DB-002 |
| **Success Criteria** | Once per open |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | — |
| **QA Test Cases** | TC-AN-RPT-001 |

| Event ID | Event Name | Notes |
|----------|------------|-------|
| EVT-RPT-002 | `recommendation_expanded` | M02 |
| EVT-RPT-003 | `recommendation_copied` | If copy control exists |
| EVT-RPT-004 | `report_feedback_submitted` | rating UP/DOWN — API feedback |
| EVT-RPT-005 | `pdf_downloaded` | After signed URL success — BTN-011 |
| EVT-RPT-006 | `pdf_download_failed` | 403/network |
| EVT-RPT-007 | `history_pdf_clicked` | History icon |
| EVT-OOS-RPT-001 | `report_shared` | **OOS** — no share UI |
| EVT-RPT-008 | `pdf_generation_started` / `pdf_generated` | Server worker optional |

---

## 8. Credits Events

### EVT-CRED-001 — `insufficient_credits`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-CRED-001 |
| **Event Name** | insufficient_credits |
| **Category** | Credits |
| **Purpose** | Paywall signal |
| **Business Goal** | Conversion |
| **Trigger** | 422 INSUFFICIENT_CREDITS or client precheck |
| **User Action** | GO blocked |
| **Screen** | 004/009 |
| **Component** | BTN-001 |
| **Previous Screen** | Same |
| **Next Screen** | Upgrade/M05 |
| **Authentication Required** | Yes |
| **Plan Required** | Any |
| **Properties** | tier, credits_remaining, mode, cost |
| **Required Parameters** | tier, credits_remaining, mode |
| **Optional Parameters** | cost |
| **API Reference** | POST /ai/audit |
| **Database Reference** | Credits |
| **Business Rule Reference** | BR-CRED-001 |
| **State Reference** | LAND-STATE-011 |
| **Validation Reference** | VAL-CRED-001 |
| **Error Reference** | ERR-CRED-001 |
| **Success Criteria** | Fire on block |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias credits_exhausted when balance 0 |
| **QA Test Cases** | TC-AN-CRED-001 |

| Event ID | Event Name | Trigger |
|----------|------------|---------|
| EVT-CRED-002 | `credits_badge_clicked` | BTN-014 |
| EVT-CRED-003 | `credits_viewed` | Optional on badge hydrate |
| EVT-CRED-004 | `credits_deducted` | Server on 202 (creditsCost) — prefer props on audit_started |
| EVT-CRED-005 | `credits_refunded` | Server on REFUND ledger |
| EVT-CRED-006 | `credits_purchased` / `topup_completed` | Webhook top-up |
| EVT-CRED-007 | `buy_credits_clicked` / `topup_started` | M05 when designed |
| EVT-CRED-008 | `credits_refund_failed` | ERR-CRED-003 |

---

## 9. Pricing & Billing Events

### EVT-BILL-001 — `manage_plan_viewed`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-BILL-001 |
| **Event Name** | manage_plan_viewed |
| **Category** | Pricing |
| **Purpose** | Pricing exposure |
| **Business Goal** | Conversion |
| **Trigger** | MDL-002 / SCREEN-005 open |
| **User Action** | Manage Plan |
| **Screen** | 005 |
| **Component** | CARD-003 |
| **Previous Screen** | 004/009 |
| **Next Screen** | 005 |
| **Authentication Required** | Yes |
| **Plan Required** | Any |
| **Properties** | tier, membership_status |
| **Required Parameters** | tier |
| **Optional Parameters** | — |
| **API Reference** | GET /membership |
| **Database Reference** | Memberships |
| **Business Rule Reference** | BR-SUB-001 |
| **State Reference** | BILL-STATE-001 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | Once per open |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias pricing_viewed |
| **QA Test Cases** | TC-AN-BILL-001 |

### EVT-BILL-002 — `subscribe_clicked`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-BILL-002 |
| **Event Name** | subscribe_clicked |
| **Category** | Pricing |
| **Purpose** | Upgrade intent |
| **Business Goal** | Conversion |
| **Trigger** | BTN-006 |
| **User Action** | Subscribe |
| **Screen** | 005 |
| **Component** | BTN-006, CARD-001 |
| **Previous Screen** | 005 |
| **Next Screen** | 006 |
| **Authentication Required** | Yes (else SSO first) |
| **Plan Required** | Free→paid |
| **Properties** | fromTier, toTier=PRO|ENTERPRISE |
| **Required Parameters** | fromTier, toTier |
| **Optional Parameters** | — |
| **API Reference** | Before checkout |
| **Database Reference** | — |
| **Business Rule Reference** | BR-SUB-003 |
| **State Reference** | BILL-STATE-003 |
| **Validation Reference** | VAL-BILL-001 |
| **Error Reference** | — |
| **Success Criteria** | Fire on click |
| **Failure Behaviour** | — |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Alias upgrade_clicked |
| **QA Test Cases** | TC-AN-BILL-002 |

### EVT-BILL-003 — `payment_succeeded`

| Field | Detail |
|-------|--------|
| **Event ID** | EVT-BILL-003 |
| **Event Name** | payment_succeeded |
| **Category** | Billing |
| **Purpose** | Authoritative revenue |
| **Business Goal** | Revenue / NRR |
| **Trigger** | Stripe webhook verified |
| **User Action** | — |
| **Screen** | 008 |
| **Component** | MDL-005 |
| **Previous Screen** | 006 |
| **Next Screen** | 009 |
| **Authentication Required** | Yes |
| **Plan Required** | PRO/ENTERPRISE |
| **Properties** | tier, amount, currency, interval=MONTHLY, stripe_event_id |
| **Required Parameters** | tier, amount, currency |
| **Optional Parameters** | stripe_event_id |
| **API Reference** | POST /webhooks/stripe |
| **Database Reference** | Payments SUCCEEDED; Membership ACTIVE |
| **Business Rule Reference** | BR-SUB-005, BR-BILL-006 |
| **State Reference** | BILL-STATE-006 |
| **Validation Reference** | — |
| **Error Reference** | — |
| **Success Criteria** | **Server-only** after signature verify |
| **Failure Behaviour** | No client-only success event as revenue |
| **Analytics Platform** | Product analytics (e.g. Segment/PostHog/Amplitude) + optional warehouse |
| **Consent Required** | Yes — analytics category (see §20 Privacy & Consent) |
| **Retention Period** | 13 months raw events (configurable); aggregates longer |
| **Developer Notes** | Client may fire payment_success_modal_viewed separately |
| **QA Test Cases** | TC-AN-BILL-003 webhook |

| Event ID | Event Name | Notes |
|----------|------------|-------|
| EVT-BILL-004 | `checkout_started` | POST /billing/checkout 200 |
| EVT-BILL-005 | `payment_modal_opened` | MDL-003 |
| EVT-BILL-006 | `payment_submitted` | Confirm click |
| EVT-BILL-007 | `payment_failed` | Decline / ERR-BILL-003 |
| EVT-BILL-008 | `payment_retry_clicked` | MDL-004 |
| EVT-BILL-009 | `plan_activated` | Membership poll ACTIVE |
| EVT-BILL-010 | `current_plan_viewed` | Active Account visible |
| EVT-BILL-011 | `premium_badge_clicked` | Crown → Manage Plan |
| EVT-BILL-012 | `subscription_renewed` | invoice.paid webhook |
| EVT-BILL-013 | `subscription_cancelled` | cancel webhook / portal |
| EVT-BILL-014 | `renewal_failed` | PAST_DUE |
| EVT-BILL-015 | `payment_method_updated` | SCREEN-011 |
| EVT-BILL-016 | `billing_portal_opened` | M06 |
| EVT-OOS-BILL-001 | `enterprise_contact_clicked` | **OOS** |
| EVT-OOS-BILL-002 | `refund_requested` (user) | Support process — optional ops |
| EVT-BILL-017 | `free_plan_selected` | Only if UI selects Free (usually default) |

---

## 10. Home / History / Notifications (Dashboard)

| Event ID | Event Name | Screen | Notes |
|----------|------------|--------|-------|
| EVT-HOME-001 | `home_viewed` | 004/009 | Free/Pro Home (no separate Dashboard design) |
| EVT-HIST-001 | `history_viewed` / `history_opened` | 012/013 | |
| EVT-HIST-002 | `history_row_opened` | 012 | → report |
| EVT-HIST-003 | `empty_history_cta_clicked` | 013 | |
| EVT-NOTIF-001 | `notifications_opened` | M04 | when built |
| EVT-NOTIF-002 | `notification_opened` | M04 | type |
| EVT-NOTIF-003 | `notification_read` | PATCH | |
| EVT-OOS-DASH-001 | `search_used` / `filter_applied` | — | **OOS** |

---

## 11. Settings Events

| Event ID | Event Name | Notes |
|----------|------------|-------|
| EVT-SET-001 | `settings_opened` | 010 |
| EVT-SET-002 | `settings_tab_changed` | Personal ↔ Payment |
| EVT-SET-003 | `profile_updated` | PATCH /me success |
| EVT-SET-004 | `avatar_updated` | |
| EVT-SET-005 | `profile_update_failed` | |
| EVT-SET-006 | `theme_changed` | When prefs UI exists |
| EVT-SET-007 | `language_changed` | When prefs UI exists |
| EVT-SET-008 | `delete_account_started` | M15 |
| EVT-SET-009 | `account_deleted` / confirmed | DELETE /me |
| EVT-OOS-SET-001 | `password_changed` | **OOS** |

---

## 12. Enterprise Events

**All OUT OF SCOPE** until teams UI: `invite_sent`, `invite_accepted`, `role_changed`, `team_created`, `team_member_removed`.

---

## 13. Error Analytics Events

| Event Name | When | Required props |
|------------|------|----------------|
| `api_error` | 5xx / unexpected | http_status, route, error_id? |
| `validation_error` / `invalid_url` / `invalid_file` / `payment_validation_failed` | Client/server validation | field?, reason |
| `audit_failed` | Taxonomy | code |
| `timeout_error` | Timeouts | context |
| `rate_limit_hit` | 429 | endpoint |
| `network_error` / `offline_detected` | Offline | — |
| `login_failed` | Auth | provider, reason |
| `payment_failed` | Billing | reason |
| `credits_refund_failed` | Compensation fail | audit_id |
| `audit_validation_failed` | Gates/SSRF | reason |

See ERROR_HANDLING.md §19.

---

## 14. User Journey Funnels

### Guest → Activation
```text
landing_viewed
  → upload_screenshot_clicked → screenshot_uploaded
  → go_clicked → audit_started → audit_completed → report_viewed
  → (2nd audit) login_modal_opened → login_success → home_viewed
```

### Guest URL gate → Auth → Paid URL
```text
go_clicked{mode:url} → guest_url_gated → login_success
  → url_attempt_gated (if Free) → manage_plan_viewed → subscribe_clicked
  → checkout_started → payment_succeeded → plan_activated
  → audit_started{mode:url} → audit_completed → pdf_downloaded
```

### Free → Pro
```text
manage_plan_viewed → subscribe_clicked{toTier:PRO}
  → payment_succeeded → plan_activated → home_viewed{tier:PRO}
```

### Pro → Business (Enterprise tier)
```text
manage_plan_viewed → subscribe_clicked{toTier:ENTERPRISE}
  → payment_succeeded → plan_activated
```
*(Not “sales contact” — self-serve Business plan.)*

### Audit completion
```text
go_clicked → audit_started → audit_completed | audit_failed
```

### Billing
```text
subscribe_clicked → checkout_started → payment_submitted
  → payment_succeeded | payment_failed → payment_retry_clicked?
```

### Referral
**OOS** — no referral product.

---

## 15. KPI Mapping

| KPI | Primary events / formula |
|-----|--------------------------|
| Activation rate | users with `audit_completed` / `login_success` (or landing) |
| Audit success rate | completed / (completed+failed) |
| Audit failure rate | failed / started |
| Avg audit time | avg `durationSec` on completed |
| Credits usage | sum creditsCost on `audit_started` |
| Free→Pro conversion | `plan_activated{PRO}` / Free users |
| Subscription conversion | checkout → payment_succeeded |
| Retention D1/D7/D30 | return sessions / cohort |
| DAU/WAU/MAU | unique users with any event |
| Churn | `subscription_cancelled` / active start |
| NRR | renewals + upgrades − churn (Finance) |
| CLV | revenue model from Payments |
| Feature adoption | pdf_downloaded, url audits / users |
| PDF attach rate | pdf_downloaded / report_viewed (Pro) |

---

## 16. Dashboard Recommendations

| Dashboard | Widgets |
|-----------|---------|
| Executive | MAU, activation, Free→Pro %, MRR, churn, audit success |
| Product | Funnels §14, feature adoption, credits usage |
| UX | Time to first audit, drop-offs (gates), report_viewed |
| Engineering | api_error, audit_failed by code, p95 durations, 429 |
| Support | Top failure codes, refund failures, payment_failed |
| Marketing | utm → landing → login → activate |
| Finance | payment_succeeded, renewals, top-ups, failed renewals |

---

## 17. AI Metrics (server)

| Metric | Source |
|--------|--------|
| AI response / stage time | Worker spans |
| Avg processing time | audit completed durationSec |
| Recommendation count | Recommendations rows / audit |
| Categories mix | category histogram |
| AI failure rate | code AI_UNAVAILABLE / schema fail |
| AI retry rate | worker retry counters |

Emit as props on `audit_completed` / `audit_failed` or internal metrics (Datadog) — not necessarily product analytics.

---

## 18. Performance Metrics

| Metric | How |
|--------|-----|
| Page load / LCP / INP / CLS | Web Vitals on Landing/Home/Report |
| API response time | Server RUM / APM |
| Time to first audit | login_success → first audit_started |
| Time to report | audit_started → report_viewed |
| PDF generation time | worker PDF span |

---

## 19. Revenue Metrics

| Metric | Events |
|--------|--------|
| Gross bookings | payment_succeeded amount |
| Top-up revenue | credits_purchased |
| Failed payment rate | payment_failed / checkout_started |
| Activation after pay | plan_activated → audit_started within 24h |

**Server webhook is source of truth for revenue events.**

---

## 20. Privacy & Consent

| Topic | Rule |
|-------|------|
| Consent categories | Necessary · Analytics · Marketing (if any) |
| Cookies | Session auth necessary; analytics only after consent |
| GDPR | Lawful basis; access/erase via account delete BR-SEC-006 |
| CCPA | Honor do-not-sell if marketing pixels added |
| Banner | Block analytics until accept (except essential) |
| Anonymization | Prefer website_host / hash; no PAN; scrub email from props |
| Deletion | On DELETE /me purge/anonymize analytics identity |
| Retention | Raw 13 months default; document in privacy policy |

`Consent Required: Yes` on product events unless strictly necessary security logs.

---

## 21. Data Retention

| Store | Retention |
|-------|-----------|
| Raw product events | 13 months (configurable) |
| Aggregates / KPIs | 36+ months |
| Auth/security logs | Per SECURITY.md |
| Warehouse PII | Minimize; join keys only |

---

## 22. QA Checklist

| Test Case ID | Trigger | Expected payload | Pass |
|--------------|---------|------------------|------|
| TC-AN-LAND-001 | Open Landing | landing_viewed once | |
| TC-AN-LAND-002 | GO | go_clicked mode/tier | |
| TC-AN-AUTH-002 | Google click | oauth_started provider=google | |
| TC-AN-AUTH-003 | Login OK | login_success isNewUser | |
| TC-AN-AUDIT-001 | 202 | audit_started audit_id, creditsCost | |
| TC-AN-AUDIT-002 | COMPLETED | audit_completed durationSec | |
| TC-AN-AUDIT-003 | FAILED SSRF | audit_failed code=SSRF_BLOCKED | |
| TC-AN-RPT-001 | Open M02 | report_viewed | |
| TC-AN-BILL-002 | Subscribe Pro | subscribe_clicked toTier=PRO | |
| TC-AN-BILL-003 | Webhook | payment_succeeded server-side | |
| TC-AN-CRED-001 | 422 | insufficient_credits | |
| TC-AN-PRIV-001 | Reject cookies | no analytics events | |

**Failure scenarios:** offline queue; double-mount dedupe; no revenue event from client-only success.

---

## 23. Developer Notes

1. Prefer **server emission** for `audit_*` outcomes, `payment_succeeded`, credits refunds.  
2. Use SCREEN_MAPPING names as canonical; map COMPONENT_BEHAVIOR aliases in one dictionary.  
3. Never implement OOS events (password, teams, share, search).  
4. Business plan = `toTier:ENTERPRISE` + `plan_name:Business`.  
5. Gate events (`guest_url_gated`, `url_attempt_gated`) are first-class — do not fold into go_clicked only.  
6. Attach `request_id` on error events for support.  
7. Document analytics provider choice in env (Segment/PostHog/etc.) without hardcoding in product UI.

---

## 24. Related documents

| Doc | Use |
|-----|-----|
| SCREEN_MAPPING.md | Canonical taxonomy seed |
| ERROR_HANDLING.md | Error event props / codes |
| BUSINESS_RULES.md | When gates fire |
| PRICING.md | Plan/credit dimensions |

---

**End of ANALYTICS.md**
