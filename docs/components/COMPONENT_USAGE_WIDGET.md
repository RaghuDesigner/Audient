# COMPONENT — Usage Widget

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-034 (Usage Widget)  
**Component name:** Usage Widget (`UsageWidget`)  
**Primary screen:** Manage Membership — Usage & Credits (`docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md`)  
**Related:** Credits Widget (`COMPONENT_CREDITS_WIDGET.md`) — credits-focused; Usage Widget = broader period usage (credits + reports + storage + future API)  
**Figma:** Usage / credits usage block on Manage Plan — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **Pricing / grants:** `docs/PRICING.md` (Free 300 · Pro 1,000 · Business 10,000).

**Related:** `docs/components/COMPONENT_CURRENT_PLAN_CARD.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `STATE_MANAGEMENT.md`

---

## 1. Purpose

Displays **monthly subscription usage** so users understand how much of their plan they have consumed and when they are near or at limits.

**Reusable** on Manage Membership, Dashboard (if Figma), Billing, and Account surfaces.

**Do not redesign.** Match Figma. Values are mock now; **server-authoritative** later (`SECURITY.md`).

---

## 2. Display

| Field | Spec |
|-------|------|
| **Credits Used** | Credits consumed in the current billing cycle |
| **Credits Remaining** | Spendable balance |
| **Reports Generated** | Count of audits/reports in the cycle |
| **Storage Used** | Storage consumption if product tracks it (mock/placeholder OK) |
| **API Calls (Future)** | Placeholder row/metric — hidden or “Coming soon” until public API ships (BR-ENT-004) |
| **Current Billing Cycle** | Date range or “Monthly · renews {date}” |
| **Progress Indicators** | Bars/meters for credits (and storage/reports if Figma shows) |

Optional CTA slot: Buy Credits / Upgrade — parent may compose Credits Widget CTAs instead of duplicating.

---

## 3. States

| State | Spec |
|-------|------|
| **Normal** | Usage comfortably under limits |
| **Near Limit** | Approaching credit (or storage) limit — warning styling + optional “Credits Low” analytics |
| **Limit Reached** | Remaining credits 0 or below cheapest audit cost / storage cap — exhausted styling; nudge Upgrade / Buy Credits |
| **Loading** | Skeleton meters + labels; `aria-busy` |
| **Error** | Failed to load usage; Retry; no fake zeros as truth |

| Thresholds | Spec |
|------------|------|
| Near Limit | Configurable (e.g. remaining ≤ 20% of monthly grant or ≤ one screenshot cost) — centralize with Credits Widget |
| Top-ups | Remaining may exceed monthly grant — progress UI must remain coherent (don’t show broken &gt;100% without Figma guidance) |

---

## 4. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `normal` \| `near_limit` \| `limit_reached` \| `loading` \| `error` | Yes | Or derive from remaining |
| `creditsUsed` | number \| null | Recommended | |
| `creditsRemaining` | number \| null | Recommended | |
| `monthlyGrant` | number \| null | Recommended | For progress max |
| `reportsGenerated` | number \| null | Optional | |
| `storageUsed` | string \| number \| null | Optional | |
| `storageLimit` | string \| number \| null | Optional | |
| `apiCallsUsed` | number \| null | Future | Omit UI if null + future flag |
| `billingCycleLabel` | string | Recommended | e.g. cycle dates |
| `tier` | `free` \| `pro` \| `business` | Recommended | |
| `showApiCallsPlaceholder` | boolean | No | Business future |
| `onRetry` | action | Error | |
| `onBuyCredits` / `onUpgrade` | action | Optional | |
| `variant` | `default` \| `compact` | No | |

---

## 5. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Text | Announce used/remaining/cycle (e.g. “240 of 300 credits remaining; 2 reports generated”) |
| Progress | `progressbar` or text equivalent — not color-only for Near Limit / Limit Reached |
| Status | Warning/exhausted conveyed in text |
| Keyboard | Retry / Buy Credits / Upgrade operable when present |
| Loading / Error | Busy + alert |

---

## 6. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Usage Viewed** | Widget impressed | `tier`, `state`, `creditsRemaining` |
| **Credits Low** | Enter Near Limit or Limit Reached (once per cycle/session) | `tier`, `creditsRemaining`, `threshold` |

Align with `credits_viewed` / low-balance events in `ANALYTICS.md`.

---

## 7. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Multi-metric row/grid + progress bars per Figma |
| **Tablet** | Wrap metrics |
| **Mobile** | Stack metrics; full-width bars |

---

## 8. Reuse

| Context | Spec |
|---------|------|
| Manage Membership | Primary Usage & Credits section |
| Dashboard / Billing | Compact variant |
| vs Credits Widget | Prefer one source of credit numbers; Usage Widget may embed or sit beside Credits Widget without conflicting totals |
| Free / Pro / Business | Same component; Buy Credits only when entitled |

---

## 9. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Normal / warning / error (limit) from `DESIGN_TOKENS.md` |
| API Calls | Future — do not invent live API metering UI |
| No redesign | |

---

## 10. Developer Notes

| Note | Spec |
|------|------|
| Phase | Mock usage figures |
| Later | Bind credits ledger + audit counts; storage/API when product defines them |
| Sync | Same remaining as Current Plan Card / Credits Widget |
| Authority | Never invent balances client-side in production |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Credits used/remaining, reports, storage, cycle, progress  
□ API Calls hidden or Coming soon  
□ Normal / Near Limit / Limit Reached / Loading / Error  
□ Thresholds fire Credits Low once appropriately  
□ WCAG 2.2 AA  
□ Usage Viewed analytics  
□ Desktop / tablet / mobile  
□ Reusable; numbers consistent with other credit UIs; Figma match  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Live public API metering |
| Stripe invoices |
| Editing usage counters in UI |
| Full Credits purchase checkout (parent / Manage Membership) |

---

**End of COMPONENT / COMPONENT_USAGE_WIDGET.md**
