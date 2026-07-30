# Audient — Missing Screens & Scenarios Plan

**Status:** Ready for design + engineering
**Last updated:** 2026-07-29
**Owner:** Raghunath Kamlekar
**Related:** SCREEN_MAPPING.md, PRICING.md, PRD.md, API.md, DEVELOPMENT_ROADMAP.md

Existing Figma screens (Landing → History → Settings → Manage Plan → Payment) are **source of truth**. This plan **extends** the product only where production gaps exist — same visual language (header, purple CTAs, Manrope, chips, modals).

---

## 0. Adopted Product Decisions

| Decision | Choice |
|----------|--------|
| Pro price / credits | **PRD: $29 / mo · 1,000 credits** (update Figma Manage Plan cards from $99) |
| Business | **PRD Agency: $99 / mo · 10,000 credits** (UI label = Business) |
| Free | **300 credits · 150 / screenshot** |
| Guest | **1 anonymous screenshot audit**, then SSO required |

See `docs/PRICING.md` and `src/config/plans.ts`.

### Guest scenario (S0)

```text
Landing → Upload screenshot → GO (no login)
  → guest session + audit if count < 1 → Progress → Brief Report
Second GO / URL attempt → SSO Login → claim guest audit into account
```

Abuse: server guest session, rate limit, captcha on abuse, TTL cleanup of guest uploads.

---

## 1. Priority Build Order

| Phase | Screens / scenarios | Why | Est. |
|-------|---------------------|-----|------|
| **P0 — Core product** | M01 Audit Progress, M02 Audit Report, M03 Audit Failure, M08 Upgrade Dialog | Without these, GO has nowhere to land | Sprint 2–4 |
| **P0 — Conversion** | Wire Manage Plan + payment to `PRICING.md`; Guest GO → SSO | Monetization path | Sprint 2 |
| **P1 — Retention** | M04 Notifications, M05 Buy Credits, M06 Billing/Invoices, M07 Checkout Return | Repeat use + mid-cycle revenue | Sprint 4–5 |
| **P1 — Trust** | M12 Consent, M13 Privacy, M14 Terms, M15 Delete Account | Launch / GDPR | Sprint 5 |
| **P2 — Resilience** | M09 404, M10 500, M11 Offline, M16 Session Expired, M17 Maintenance | Production hardening | Sprint 5 |

---

## 2. Design Continuity Rules (do not redesign)

Reuse from existing screens:

- **Header:** Logo + Credits + (crown if paid) + Avatar
- **Breadcrumb:** `Home / {Page}` (History, Account Settings pattern)
- **Modals:** White rounded card, dim overlay, centered (SSO / Payment / Success / Failure)
- **Chips:** Green success / red error pills with ✕
- **Primary button:** Purple gradient fill, white label
- **Secondary:** Outline purple (“Active Account” pattern)
- **Empty:** Centered gray message (History empty pattern) + add CTA where needed

---

## 3. Full Specs — P0 Missing Screens

### SCREEN-M01 — Audit Progress

| Field | Spec |
|-------|------|
| **Route** | `/audit/[auditId]` while `status ∈ {QUEUED, PROCESSING}` |
| **Entry** | After GO on Landing / Free Home / Pro Home |
| **Exit** | Auto → M02 on COMPLETED; → M03 on FAILED; Cancel → Home |

**Layout (match existing shell)**

```text
[Header: Logo | Credits | Avatar]
Breadcrumb: Home / Auditing…

  Website / screenshot label (e.g. brightcafe.com)
  Large circular or linear progress (purple)
  Stage list:
    1. Queued
    2. Capturing screens (screenshot) / Crawling site (URL)
    3. Analyzing UX
    4. Building report
  “About Xs remaining” (from estimatedSecondsRemaining)
  [Cancel audit] text button
```

**Stages by input type**

| Screenshot (≤90s) | URL (≤8 min) |
|-------------------|--------------|
| Queued → Upload received → Analyzing → Summarizing | Queued → Crawling → Screenshots → Accessibility → AI analysis → Report |

**API:** Poll `GET /audits/{id}/status` every 3s (backoff after 60s) + optional Realtime `audit:{id}`.

**States:** queued · processing · reconnecting · cancelled · completed (redirect) · failed (→ M03).

**Scenarios**

| Scenario | Behaviour |
|----------|-----------|
| User refreshes mid-audit | Resume same progress from status API |
| Tab backgrounded | Poll continues; on focus, immediate status fetch |
| Offline | Banner; reconnect resumes poll |
| Cancel | Confirm dialog → refund credits → Home |
| Stuck > max time | Show timeout failure (taxonomy `CRAWL_TIMEOUT`) |

**A11y:** `role="progressbar"`; `aria-live="polite"` only on **stage** changes (not every %).

**Analytics:** `audit_progress_viewed`, `audit_cancelled`, `audit_completed`, `audit_failed`.

---

### SCREEN-M02 — Audit Report / Result

| Field | Spec |
|-------|------|
| **Route** | `/audit/[auditId]` when `COMPLETED` |
| **Entry** | From M01, History row, notification deep-link |
| **Exit** | PDF download; Re-audit → Home with URL prefilled; Upgrade (Free) |

**Layout**

```text
[Header]
Breadcrumb: Home / Report

  Row: [Website URL or “Screenshot audit”]     [Download PDF] | [Upgrade for PDF]
  Overall UX Score (large) + band color
  Executive Summary (aiSummary paragraph)

  Category scores grid (Accessibility · Conversion · Mobile · Navigation …)

  Strengths          Weaknesses (severity badges)
  ─────────          ────────────────────────────
  bullet list        Issue cards (Critical/Major/Minor)

  Recommendations
  ────────────────
  Recommendation cards (title, fix, business impact, optional screenshot)

  [Was this useful? 👍 👎]   [Re-audit]
```

**Tier gating**

| Section | Free | Pro / Business |
|---------|------|----------------|
| Overall score + executive summary | ✅ | ✅ |
| Category scores | Top 2 only | All |
| Strengths / weaknesses | 1–2 teaser items | Full |
| Recommendations | 2 locked behind blur + Upgrade | Full |
| Download PDF | Upgrade CTA | Enabled |

**API:** `GET /audits/{id}`, `GET .../report`, `GET .../recommendations`, `GET .../report/pdf`, `POST .../feedback`.

**Schema note:** Persist `reportJson.strengths: string[]` (or positive findings) — required for Strengths section.

**Scenarios**

| Scenario | Behaviour |
|----------|-----------|
| Free user opens full deep-link | Show teaser + M08 Upgrade |
| PDF not ready yet | Button disabled “Generating PDF…” then enable |
| PDF failed | Toast + Retry PDF (report still viewable) |
| Downgraded user opens old Pro report | Keep historical access to owned completed reports (recommended) OR gate — **recommend keep access** |
| Empty strengths | Hide section (don’t show empty heading) |

**Analytics:** `report_viewed{tier,score}`, `recommendation_expanded`, `pdf_downloaded`, `report_upgrade_prompt`, `report_feedback`, `reaudit_clicked`.

---

### SCREEN-M03 — Audit Failure

Reuse **Payment Failed** modal pattern (red ✕ + message) but as full-page or modal on `/audit/[auditId]`.

```text
[Red error icon]
Title from failure taxonomy
User message
“Credits refunded” chip when refund-eligible
[Try again]  [Upload screenshot instead]  [Back home]
Support: “Reference: {correlationId}”
```

Map every code in SCREEN_MAPPING § Failure Taxonomy. Primary recovery depends on code (e.g. bot-blocked → suggest screenshot upload).

---

### SCREEN-M08 — Upgrade Dialog

Triggered when: Free clicks GO on URL · Free clicks PDF · `422 INSUFFICIENT_CREDITS` · Free expands locked recommendation.

```text
Modal (same shell as SSO/Payment)
Title: “Unlock full website audits” (or reason-specific)
1–2 sentence benefit
Mini plan strip: Pro $29 · Business $99 (Recommended)
[Upgrade to Pro] → Manage Plan or Payment
[Maybe later]
```

Reuse Manage Plan card styling at compact size — **do not invent new pricing UI**.

---

## 4. Specs — P1 Missing Screens (summary)

### SCREEN-M04 — Notifications
- Header **bell** (new icon left of Credits) with unread badge.
- Dropdown: recent items; “See all” → `/notifications`.
- Types: AUDIT_COMPLETE → M02; LOW_CREDITS → M05/M08; PAYMENT_SUCCEEDED → Home; SUBSCRIPTION_EXPIRING → M06.
- Empty: “No notifications” (History-empty pattern).

### SCREEN-M05 — Buy Credits
- Route `/billing/credits` or modal from low-credit.
- Three packs from `PRICING.md` / `TOP_UP_PACKS`.
- CTA → Stripe Checkout / Payment Element (not raw card fields if possible).
- Success → credit refresh toast + header update.

### SCREEN-M06 — Billing Management
- Extend Account Settings with tab **Billing** (alongside Personal / Payment Details) *or* section under Manage Plan.
- Current plan, renewal date, **Manage in Stripe Portal**, invoice list (`GET /payments`).
- Cancel → Portal (cancel at period end).

### SCREEN-M07 — Checkout Return
- `/billing/return?status=success|cancel`
- Success: poll `GET /membership` until ACTIVE or 30s → “Activating…” then Pro Home.
- Cancel: “Checkout cancelled” → Manage Plan.

---

## 5. Specs — P2 System / Legal (summary)

| ID | Pattern |
|----|---------|
| M09 404 | Centered message + Go home (History-empty layout) |
| M10 500 | Error boundary + correlationId + Try again |
| M11 Offline | Sticky top banner “You’re offline” |
| M12 Consent | Cookie banner first visit; Preferences link |
| M13 / M14 | Static SSR pages; footer links on Landing |
| M15 Delete | Account Settings → Danger zone → type DELETE → `DELETE /me` |
| M16 Session | Modal “Session expired” → SSO → resume intent |
| M17 Maintenance | Full-page during deploy windows |

---

## 6. Scenario Matrix (end-to-end)

| # | Scenario | Happy path | Edge / failure |
|---|----------|------------|----------------|
| S0 | Guest 1 free screenshot | Upload → GO (no login) → M01 → brief M02 | 2nd attempt → SSO; URL → SSO |
| S1 | Guest explores / login | Landing → Login → Free Home (claim guest audit) | SSO cancel/deny |
| S2 | Free screenshot audit | Upload → GO → M01 → M02 teaser | Upload fail chip; credits 0 → M08 |
| S3 | Free tries URL | Type URL → GO → M08 → Manage Plan | Invalid URL chip |
| S4 | Upgrade to Pro | Subscribe → Payment → Success → Pro Home (crown, 2000 credits) | Payment failed modal → retry |
| S5 | Pro URL audit | Paste URL → purple GO → M01 (long) → full M02 → PDF | Unreachable / bot-blocked → M03 + refund |
| S6 | Re-audit | Report → Re-audit → Home prefilled | Insufficient credits → M05 |
| S7 | History | Profile → History → open / download | Empty state CTA |
| S8 | Low credits | After audits → LOW_CREDITS notification → Buy pack | Free: upgrade only |
| S9 | Business unlimited | GO never blocked on balance | Fair-use rate limit still applies |
| S10 | Webhook lag | Payment Success → “Activating…” → crown appears | Timeout → support link |
| S11 | Logout | Profile → Logout → Landing guest | — |
| S12 | Delete account | Settings → Delete → confirm → Landing | Active sub must cancel first |

---

## 7. Engineering Implementation Checklist

- [ ] Adopt `src/config/plans.ts` + `docs/PRICING.md` everywhere (header credits, Manage Plan copy, API deduction).
- [ ] Design Figma frames for **M01, M02, M03, M08** using existing components only.
- [ ] Implement routes: `/audit/[auditId]` (progress|report|failure), upgrade dialog component.
- [ ] Wire Realtime/polling contract from SCREEN_MAPPING.
- [ ] Add `strengths` to report JSON / schema.
- [ ] Stripe products: Pro $29, Business $99, top-up packs; webhooks only for entitlements.
- [ ] Guest: allow **1** anonymous screenshot audit; claim into user on login.
- [ ] Prefer Stripe Elements for Payment modal (PCI) while matching Figma layout.
- [ ] Notifications bell in header (P1).
- [ ] Legal pages + cookie banner before public launch.
- [ ] QA: run scenario matrix S1–S12.

---

## 8. Definition of Done (MVP)

MVP is complete when:

1. Guest can log in (Google/Apple/Microsoft).
2. Guest can complete **exactly 1** screenshot audit without login (brief report); second attempt requires SSO.
3. Free user can complete **~2 screenshot audits** (300 credits) and see a **brief report**.
4. Free URL attempt shows **Upgrade dialog**.
5. User can subscribe to **Pro $29**, see crown + **1,000 credits**, run a **URL audit**, see **full report**, **download PDF**.
6. Failed audits **refund credits** with clear M03 messaging.
7. History lists past audits (existing screens).

Business ($99 / 10,000) + top-ups + notifications can ship in private beta hardening.
