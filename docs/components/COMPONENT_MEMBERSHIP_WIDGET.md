# COMPONENT-018 — Membership Widget

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-018  
**Component name:** Membership Widget (`MembershipWidget`)  
**Screen:** Authenticated Dashboard (`SCREEN-008_AUTHENTICATED_DASHBOARD.md`); reusable on billing / Account surfaces when Figma matches  
**Figma:** Membership / plan summary widget — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/components/COMPONENT_CREDITS_WIDGET.md` · `docs/components/COMPONENT_UPGRADE_BANNER.md` · `docs/components/COMPONENT_PLAN_COMPARISON.md` · `docs/PRICING.md` · `docs/COMPONENT_MAPPING.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `STATE_MANAGEMENT.md` (membership statuses)

---

## 1. Purpose

Display the user’s **active membership** (plan, renewal, key benefits) and provide clear paths to **upgrade** or **manage plan**.

**Do not redesign.** Match Figma. Entitlements remain **server-authoritative** (`SECURITY.md` / webhooks).

---

## 2. Plans

| Plan | Spec |
|------|------|
| **Guest** | Teaser / no paid membership — rarely on Dashboard; supported for reuse |
| **Free** | `$0` · **300** credits · screenshot · brief report · no PDF/URL |
| **Pro** | **$29/mo** · **1,000** credits · URL + full report + PDF |
| **Business** | **$99/mo** · **10,000** credits · volume (schema `ENTERPRISE`) |

Prices/credits: **`PRICING.md`**. Badge labels match Figma (Business not “Enterprise” in UI).

---

## 3. Display

| Element | Spec |
|---------|------|
| **Plan Badge** | Guest / Free / Pro / Business (+ status modifier when needed) |
| **Renewal Date** | Next renewal / period end when paid & applicable; omit or “—” for Free/Guest |
| **Benefits** | Short list of plan highlights (credits, URL, PDF, etc.) — Figma copy; data from plan config |
| **Upgrade CTA** | Shown for Guest/Free (and Pro→Business upsell **only if Figma shows it**) |
| **Manage Plan CTA** | Opens Manage Plan (SCREEN-005) / billing portal entry |

---

## 4. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton for badge, renewal, benefits, CTAs; `aria-busy` |
| **Active** | Membership in good standing (`ACTIVE`); full benefits + CTAs per plan |
| **Trial** | If product ever offers trial — badge “Trial”; renewal/trial end date; Upgrade to convert. **If no trial in MVP**, keep state in contract but unused |
| **Expired** | Lapsed / `CANCELED` at period end / `PAST_DUE` treated as restricted — show expired/past-due messaging; premium features limited; primary CTA **Renew** / **Update billing** / **Upgrade** per Figma (not fake Active benefits) |

| Rule | Spec |
|------|------|
| PAST_DUE | Prefer Expired (or Active+warning) per Figma — always disclose billing issue in text |
| Free | No renewal date; Upgrade CTA required on Dashboard per Authenticated Dashboard spec |
| Pro / Business Active | Manage Plan primary; Upgrade to Pro hidden |

---

## 5. CTA Behaviour

| CTA | Spec |
|-----|------|
| **Upgrade** | Free/Guest → Upgrade Modal / Plan Comparison / checkout for Pro |
| **Manage Plan** | → SCREEN-005 Manage Plan (current plan highlight) |
| **Renew / Update billing** | Expired / PAST_DUE → Stripe portal or Payment flow |
| **Upgrade to Business** | Optional from Pro when Figma includes Business CTA |

Never grant Pro/Business from the widget alone.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `active` \| `trial` \| `expired` | Yes | Widget state |
| `plan` | `guest` \| `free` \| `pro` \| `business` | Yes | Current plan |
| `renewalDate` | datetime \| null | Optional | Renewal / period end |
| `benefits` | string[] | Recommended | Highlight lines (or derive from plan) |
| `showUpgradeCta` | boolean | No | Default: true for free/guest |
| `showManageCta` | boolean | No | Default: true for authed |
| `onUpgrade` | action | When upgrade shown | Upgrade handler |
| `onManagePlan` | action | When manage shown | Manage Plan handler |
| `statusDetail` | string \| null | Optional | e.g. past_due reason copy |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Badge | Text plan name — not color-only |
| Status | Announce Active / Trial / Expired clearly |
| Renewal | Included in accessible summary |
| Benefits | List semantics when shown as bullets |
| CTAs | Distinct names (“Upgrade to Pro”, “Manage plan”) |
| Keyboard | Both CTAs operable; focus visible |
| Loading / Expired | Busy + assertive/polite status as appropriate |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `membership_widget_impressed` | Widget visible | `plan`, `state` |
| **Upgrade Clicked** | Upgrade CTA | `source: membership_widget`, `plan` |
| `manage_plan_clicked` | Manage Plan CTA | `source: membership_widget`, `plan` |
| `membership_renew_clicked` | Renew / update billing | `plan`, `state: expired` |

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Authenticated Dashboard | Primary Membership Widget |
| Account / Billing | Compact or full variant per Figma |
| Guest | Reusable badge/benefits if shown outside Dashboard |

One component for Guest · Free · Pro · Business — vary plan data and CTAs, not four layouts.

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Plan/status colors from `DESIGN_TOKENS.md` |
| Crown | Pro/Business may show crown affordance if Figma does (header may also show crown — keep consistent meaning) |
| Benefits | Do not invent Team/API/White Label as live MVP benefits (`COMPONENT_PLAN_COMPARISON` / BR-ENT future) |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Data | `GET /me` / `GET /membership` — tier, status, `currentPeriodEnd` |
| Phase 1 | Mock all plans + Active/Expired/Loading |
| Phase 2 | Stripe-backed renewal dates; PAST_DUE handling |
| Sync | Welcome Card membership badge matches this widget |
| Trial | Wire only when product enables trials |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Plans: Guest, Free, Pro, Business badges  
□ Renewal date when applicable; benefits list  
□ Upgrade CTA Free (and Guest); Manage Plan for authed  
□ Loading / Active / Trial (if enabled) / Expired  
□ PAST_DUE / expired does not look fully entitled  
□ Prices/benefits align with PRICING.md  
□ WCAG 2.2 AA  
□ Analytics: impress, upgrade, manage, renew  
□ Reusable; Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full plan comparison table (COMPONENT-013) |
| Payment form fields |
| Credits progress bar (COMPONENT-017) |
| Live teams/API/white-label features |

---

**End of COMPONENT-018 / COMPONENT_MEMBERSHIP_WIDGET.md**
