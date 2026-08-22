# COMPONENT — Notification Filter

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-040 (Notification Filter)  
**Component name:** Notification Filter (`NotificationFilter`)  
**Primary screen:** Notifications (`docs/screens/SCREEN-018_NOTIFICATIONS.md`)  
**Related:** Filter Bar (`COMPONENT_FILTER_BAR.md`) — **audit history** filters; this control is **notification-specific** single-select category chips/tabs  
**Figma:** Notification filter row on Notifications — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + tab/chip patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Client-side filtering** on mocked notification data — **no backend**, **no API**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md` · `docs/components/COMPONENT_NOTIFICATION_GROUP.md`

---

## 1. Purpose

Allows users to **filter notifications** on the Notifications screen (and optionally the header dropdown if Figma shows filters there).

**Do not redesign.** Match Figma. Parent applies filter to mock list and re-buckets **NotificationGroup** sections.

---

## 2. Filters

| Filter | Spec |
|--------|------|
| **All** | Every notification — **default** |
| **Unread** | `read === false` only |
| **Audits** | Audit Completed · Audit Failed |
| **Billing** | Payment Successful · Payment Failed · Invoice Available |
| **Membership** | Low Credits · Subscription Activated · Subscription Renewal · Membership Upgrade · Membership Expiry |
| **Team** | Team Activity |
| **System** | System Notification |

Category → type mapping must stay aligned with `SCREEN-018_NOTIFICATIONS.md` and `COMPONENT_NOTIFICATION_ITEM.md`.

---

## 3. Behaviour

| Rule | Spec |
|------|------|
| Selection | **Only one filter active at a time** (single-select) |
| Default | **All** on first load |
| On change | Parent updates notification list; **NotificationGroup** re-renders with empty date buckets omitted |
| Unread count (page header) | **Total unread** across all notifications — **not** reduced by active filter unless Figma explicitly shows filtered unread count |
| Clear filter | **Filtered empty** on Notifications screen uses **Clear Filter** in EmptyState → sets filter back to **All** (not a separate “Clear” on this bar unless Figma shows it) |
| Disabled | Entire bar or individual chips disabled during Loading / Error retry per parent |

No server round-trip this phase.

---

## 4. Display

| Element | Spec |
|---------|------|
| Filter controls | Tab list, segmented control, or chips per Figma — one control per filter value |
| Labels | All · Unread · Audits · Billing · Membership · Team · System |
| Selected affordance | Distinct selected styling — not color-only |
| Optional counts | Per-filter unread counts on chips optional if Figma — mock only |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Inactive filter option |
| **Selected** | Active filter (exactly one) |
| **Hover** | Pointer hover on inactive option |
| **Focused** | Keyboard focus ring |
| **Disabled** | Non-interactive during parent Loading/Error or when product disables Team for non-Business (optional) |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `value` | `all` \| `unread` \| `audits` \| `billing` \| `membership` \| `team` \| `system` | Yes | Active filter |
| `onChange` | action | Yes | Parent updates list |
| `disabled` | boolean | No | Whole control |
| `variant` | `tabs` \| `chips` \| `dropdown` | No | Responsive mode hint |
| `showCounts` | boolean | No | Optional badge per filter |

Filtering logic may live in parent or shared helper — component is presentational + controlled value.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Arrow keys between tabs (if tab pattern) or Tab through chips; Enter/Space selects |
| Visible focus | Required |
| Screen reader | Each option labeled; selected state announced (`aria-selected` / `aria-current`) |
| Single-select | Radio group or tablist semantics — not multi checkbox |
| Mobile dropdown | Native or custom listbox with same labels |

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Notification Filter Used** | User selects a filter different from current (including return to All) |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `filter` (`all`, `unread`, `audits`, …), `previousFilter` |

Fire once per user selection, not on programmatic reset unless user clicked Clear Filter (parent may fire with `filter: all`).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Horizontal tab/chip row |
| **Tablet** | Wrap or scroll per Figma |
| **Mobile** | **Horizontal scroll** chip row **or** **dropdown** select — Figma wins |

Ensure touch targets ≥44px where tappable.

---

## 10. Relationship to Siblings

| Component | Spec |
|-----------|------|
| **NotificationGroup** | Receives filtered items only |
| **NotificationEmptyState** | “No notifications found” when filter yields zero |
| **Filter Bar** | Do not reuse for notifications — different filter model (multi vs single, audit-specific fields) |
| **MarkAllReadButton** | Independent; marks all read regardless of current filter (unless product later scopes — default: all) |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Filter | Pure client filter on mock notification array |
| QA | Mock set includes at least one item per category + unread mix |
| No | Backend query params · Supabase |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | One NotificationFilter for Notifications screen |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Controlled | Parent owns `value` + filtered list |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Filters: All, Unread, Audits, Billing, Membership, Team, System  
□ Default All; single-select only  
□ List updates on selection; groups re-bucket  
□ States: Default, Selected, Hover, Focused, Disabled  
□ Filtered empty + Clear Filter → All  
□ Notification Filter Used analytics  
□ WCAG 2.2 AA · keyboard · SR · visible focus  
□ Desktop / Tablet / Mobile scroll or dropdown  
□ Client-side mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Multi-select filters |
| Date range filter (unless product adds later) |
| Search within notifications (separate control if needed) |
| Server-side filter API |

---

**End of COMPONENT_NOTIFICATION_FILTER.md**
