# COMPONENT — Business Usage Widget

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-056 (Business Usage Widget)  
**Component name:** Business Usage Widget (`BusinessUsageWidget`)  
**Primary screen:** Team / Business hub · Manage Membership (Business)  
**Related:** Usage Widget (`COMPONENT_USAGE_WIDGET.md`) — general monthly usage; this widget is **Business-scoped** (team audits, seats, workspace credits) · Credits Widget — credit totals must not conflict · Team Overview Card — high-level credits remaining  
**Figma:** Business usage / analytics widget — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + progress / chart patterns in `COMPONENT_MAPPING.md`.  
> **Pricing:** Credits align with **`docs/PRICING.md`** (Business **10,000** monthly credits; UI label Business / schema `ENTERPRISE`).  
> **Phase:** **Mock usage data only** — no backend · no live metering API.  
> **Audience:** **Business** accounts only (hide or upgrade gate for Free/Pro).

**Related docs:** `docs/prd.md` · `docs/PRICING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/components/COMPONENT_USAGE_WIDGET.md` · `docs/components/COMPONENT_TEAM_OVERVIEW_CARD.md`

---

## 1. Purpose

Displays **Business account usage**.

Gives workspace owners/admins a snapshot of audits, credits, storage, and seat activity for the current period — with visual progress and simple charts. Informative only this phase (mock).

**Do not redesign.** Match Figma.

---

## 2. Metrics

| Metric | Spec |
|--------|------|
| **Total Audits** | Lifetime or workspace-total audits (mock definition — label clearly) |
| **Monthly Audits** | Audits in current billing cycle |
| **Credits Used** | Credits consumed this cycle |
| **Credits Remaining** | Spendable balance (align with plan grant / Team Overview) |
| **Storage Used** | Mock storage consumption (e.g. GB used of quota) |
| **Active Members** | Current active seat count |

| Rule | Spec |
|------|------|
| Labels | Visible label per metric |
| Numbers | Locale-friendly formatting |
| Sync | Credits Remaining must not contradict Credits Widget / Team Overview when shown together |
| Prices | Never invent prices outside `PRICING.md` |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Summary Metrics** | Key numbers (grid or strip) |
| **Progress Bars** | Credits used vs grant; storage used vs quota; optional monthly audits vs soft cap |
| **Charts** | Simple mock chart(s) — e.g. audits over recent days/weeks or credits burn — **decorative data from mock series** |

| Rule | Spec |
|------|------|
| Chart lib | Prefer existing stack patterns; keep lightweight; no live analytics pipeline |
| Color | Progress / chart meaning also available as text (percent or fraction) — not color-only |
| CTA | Optional Buy Credits / Manage seats if Figma — parent-owned handlers |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Metrics + bars + chart(s) from mock data |
| **Loading** | Skeletons; `aria-busy`; no zero metrics as truth |
| **Error** | Unable to load usage — message + Retry |

Optional near-limit styling when credits remaining is low (align threshold with Credits / Usage Widget) — still Default state with emphasis, not a separate required state unless Figma names it.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `totalAudits` | number | Yes | |
| `monthlyAudits` | number | Yes | |
| `creditsUsed` | number | Yes | |
| `creditsRemaining` | number | Yes | |
| `creditsGrant` | number | Recommended | Denominator for credit bar (e.g. 10000) |
| `storageUsed` | number | Yes | |
| `storageQuota` | number | Recommended | For storage bar |
| `activeMembers` | number | Yes | |
| `chartSeries` | mock points[] | No | Chart data |
| `state` | `default` \| `loading` \| `error` | Recommended | |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Region | Named region (e.g. “Business usage”) |
| Metrics | Each value tied to label |
| Progress | `role="progressbar"` (or equivalent) with accessible name + value text |
| Charts | Provide text summary / data table alternative or `aria` description — do not convey meaning by color alone |
| Loading / Error | Announced; Retry keyboard operable |
| Focus | Visible focus on interactive controls |

---

## 7. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Business Usage Viewed** | Widget viewed |

Optional: **Business Usage Retry Clicked** on Error Retry.

No PII.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Summary + bars + chart in multi-column composition |
| **Tablet** | Stack chart under metrics |
| **Mobile** | Single-column; full-width bars; chart readable or summarized as list |

---

## 9. Entitlement

| Tier | Spec |
|------|------|
| **Business** | Show widget |
| **Free / Pro** | Hide or Upgrade prompt — do not fake Business seat metrics |
| **Guest** | Not shown |

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Data | Mock usage object + optional chart series |
| No | Backend metering · Stripe usage records · realtime sync |
| Reuse | Existing `Progress` if available; Usage Widget patterns where helpful — **do not duplicate conflicting credit sources** |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Metrics: Total Audits, Monthly Audits, Credits Used/Remaining, Storage Used, Active Members  
□ Display: summary + progress bars + chart(s)  
□ States: Default, Loading, Error  
□ WCAG 2.2 AA — progress/chart not color-only  
□ Mock only — no backend  
□ Business-only entitlement  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Live Stripe usage sync |
| Editable quotas |
| Replacing Credits Widget on non-Business surfaces |
| Real storage CDN metering |

---

**End of COMPONENT_BUSINESS_USAGE_WIDGET.md**
