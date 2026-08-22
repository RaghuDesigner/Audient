# COMPONENT — Current Plan Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-033 (Current Plan Card)  
**Component name:** Current Plan Card (`CurrentPlanCard`)  
**Primary screen:** Manage Membership (`docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · SCREEN-005)  
**Related:** Membership Widget (`COMPONENT_MEMBERSHIP_WIDGET.md`) — Dashboard may use the lighter widget; this card is the fuller subscription summary  
**Figma:** Current / Active plan card on Manage Plan — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `PlanCard` / Badge patterns in `COMPONENT_MAPPING.md`.  
> **Pricing:** `docs/PRICING.md` — Free $0/300 · Pro $29/1,000 · Business $99/10,000.

**Related docs:** `docs/prd.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_CREDITS_WIDGET.md` · `docs/components/COMPONENT_PLAN_COMPARISON.md`

---

## 1. Purpose

Displays the user’s **current subscription information**.

**Reusable** across:

| Surface | Spec |
|---------|------|
| **Dashboard** | Compact or full per Figma (or defer to Membership Widget) |
| **Manage Membership** | Primary Current Plan Card |
| **Billing** | Same card when billing surface exists |
| **Account Settings** | Plan summary strip if Figma shows it |

One component — density via `variant`, not four unrelated cards.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Plan Name** | Free / Pro / Business (Guest only if ever shown pre-login teaser) |
| **Plan Badge** | Visual badge + crown for Pro/Business if Figma |
| **Monthly / Yearly Billing** | Billing cycle label |
| **Subscription Status** | See §4 |
| **Renewal Date** | Next renewal / period end (N/A copy for Free) |
| **Credits Remaining** | Current balance (mock → server later) |
| **Reports Used** | Audits/reports count this period |
| **Storage Used** | If Figma shows; else omit (placeholder metric) |
| **Current Price** | $0 / $29/mo / $99/mo (or yearly equivalent when cycle is yearly) |

---

## 3. Actions

| Action | Spec |
|--------|------|
| **Upgrade Plan** | Free→Pro or Pro→Business; opens Manage Membership highlight / Plan Comparison / mock checkout |
| **Downgrade Plan** | Paid→lower plan; confirm before mock change |
| **Manage Billing** | Billing portal / payment method placeholder |
| **Buy Credits** | Top-up — **Pro & Business only**; hidden/disabled for Free (`PRICING.md`) |

| Plan | Typical CTAs |
|------|----------------|
| Free | Upgrade Plan; Manage Billing optional/hidden |
| Pro | Upgrade Plan (Business), Downgrade, Manage Billing, Buy Credits |
| Business | Downgrade, Manage Billing, Buy Credits (Upgrade hidden) |
| Cancelled / Expired | Upgrade / Resubscribe emphasized; Buy Credits per entitlement rules |

Never grant entitlements from the client alone (`SECURITY.md`).

---

## 4. Subscription Status

Display one status:

| Status | Spec |
|--------|------|
| **Active** | Entitled, in good standing |
| **Trial** | Trial period (if product enables trials; else unused) |
| **Expired** | Period ended / lapsed / past_due treated as restricted |
| **Cancelled** | Cancel at period end or cancelled — show access-until date when known |
| **Paused** | If billing pause exists; else unused until Stripe pause supported |

Status = text badge — not color-only.

---

## 5. States (UI)

| State | Spec |
|-------|------|
| **Loading** | Skeleton for fields + actions |
| **Active** | Active status + normal CTAs |
| **Expired** | Expired messaging + Upgrade/Resubscribe |
| **Cancelled** | Cancelled messaging + Reactivate/Upgrade |
| **Error** | Failed to load membership; Retry |

Paused/Trial map into Success-like layouts with status badge when used.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `active` \| `expired` \| `cancelled` \| `error` | Yes | |
| `plan` | `free` \| `pro` \| `business` | Yes | |
| `billingCycle` | `monthly` \| `yearly` | Recommended | |
| `status` | `active` \| `trial` \| `expired` \| `cancelled` \| `paused` | Yes | |
| `renewalDate` | datetime \| null | Optional | |
| `creditsRemaining` | number \| null | Recommended | |
| `reportsUsed` | number \| null | Optional | |
| `storageUsed` | string \| number \| null | Optional | |
| `currentPrice` | string \| number | Recommended | Display price |
| `onUpgrade` | action | When shown | |
| `onDowngrade` | action | When shown | |
| `onManageBilling` | action | When shown | |
| `onBuyCredits` | action | Pro/Business | |
| `onRetry` | action | Error | |
| `variant` | `default` \| `compact` | No | Dashboard vs Manage Membership |
| `showBuyCredits` | boolean | No | Default by plan |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All action buttons operable |
| Visible focus | Required |
| Screen reader | Announce plan name, status, price, credits, renewal |
| Badge / status | Text labels |
| Progress | If credits/storage bars present — text + progressbar |
| Loading / Error | Busy + alert semantics |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Current Plan Viewed** | Card impressed / rendered | `plan`, `status`, `billingCycle` |
| **Upgrade Clicked** | Upgrade Plan | `plan`, `target` |
| **Downgrade Clicked** | Downgrade Plan | `plan`, `target` |
| **Manage Billing Clicked** | Manage Billing | `plan` |
| **Buy Credits Clicked** | Buy Credits | `plan` |

Align with Manage Membership / `current_plan_viewed` (`ANALYTICS.md` / SCREEN_MAPPING).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full field grid + action row per Figma |
| **Tablet** | Tighten; actions wrap |
| **Mobile** | Stack fields; full-width CTAs |

---

## 10. Reuse

| Rule | Spec |
|------|------|
| One card | Dashboard / Manage Membership / Billing / Settings |
| vs Membership Widget | Widget = lighter Dashboard summary; Current Plan Card = fuller billing-oriented card — share tokens/badges, don’t fork conflicting plan names/prices |
| Data | Same membership store |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` — no hardcoded brand colors |
| Prices | Match `PRICING.md` |
| Crown / Recommended | Text-equivalent for AT |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Data | **Mocked membership data** this phase |
| Stripe | None — Manage Billing / Buy Credits are placeholders |
| Later | `GET /membership`, portal session, top-up checkout; webhook-authoritative tier |
| Downgrade | Confirm dialog recommended before mock apply |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All display fields (omit storage if not in Figma)  
□ Actions: Upgrade, Downgrade, Manage Billing, Buy Credits (tier-correct)  
□ Status: Active, Trial, Expired, Cancelled, Paused  
□ UI states: Loading, Active, Expired, Cancelled, Error  
□ Prices/credits match PRICING.md  
□ WCAG 2.2 AA · keyboard · visible focus · SR labels  
□ Analytics events  
□ Desktop / tablet / mobile  
□ Mock only; reusable; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full plan comparison matrix (Plan Comparison) |
| Stripe Elements / real portal |
| Editing payment method form inside this card |
| Guest current-plan management |

---

**End of COMPONENT / COMPONENT_CURRENT_PLAN_CARD.md**
