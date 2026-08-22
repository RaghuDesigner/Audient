# COMPONENT — Notification Item

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-038 (Notification Item)  
**Component name:** Notification Item (`NotificationItem`)  
**Primary surfaces:** Notifications screen (`docs/screens/SCREEN-018_NOTIFICATIONS.md` when published) · Notification dropdown · Dashboard notification preview  
**Related:** App Navbar notifications entry (`COMPONENT_MAPPING` top nav) · toast system is separate (ephemeral, non-history)  
**Figma:** Individual notification row / list item — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + list/row patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked notification data only** — no backend, no Supabase, no push infrastructure in this phase.  
> **Unread:** Must not rely on color alone (dot + text weight / “Unread” for AT).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-015_PAYMENT_SUCCESS.md` · `docs/screens/SCREEN-016_PAYMENT_FAILURE.md` · `docs/screens/SCREEN-017_INVOICE_HISTORY.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md`

---

## 1. Purpose

Displays an **individual Audient notification**.

**Reusable** in:

| Surface | Spec |
|---------|------|
| **Notifications screen** | Full list row |
| **Notification dropdown** | Compact row in header popover |
| **Dashboard notification preview** | Limited recent items |

One component — density via `variant` (`default` \| `compact` \| `preview`), not three unrelated items.

**Do not redesign.** Match Figma.

---

## 2. Notification Types

| Type | Spec |
|------|------|
| **Audit Completed** | Audit finished successfully |
| **Audit Failed** | Audit failed / retry needed |
| **Low Credits** | Credits near or at limit |
| **Payment Successful** | Payment completed |
| **Payment Failed** | Payment could not complete |
| **Subscription Activated** | Plan activated after purchase |
| **Subscription Renewal** | Renewal upcoming or completed |
| **Invoice Available** | Invoice ready to view |
| **Membership Upgrade** | Upgrade available or completed messaging |
| **Membership Expiry** | Subscription ending / expired |
| **Team Activity** | Team/seat activity (Business; mock placeholder OK) |
| **System Notification** | Product/maintenance/system message |

| Rule | Spec |
|------|------|
| Icon | Type-driven icon/token per Figma |
| Deep link | Type maps to destination (§4) when `href` / target provided |
| Unknown type | Fall back to System Notification styling |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Notification Icon** | Visual by type |
| **Notification Title** | Short headline |
| **Notification Description** | One-line support copy (clamp on compact) |
| **Timestamp** | Relative (e.g. “2h ago”) and/or absolute for SR |
| **Unread Indicator** | Dot, bold title, or both — plus non-color cue |
| **Optional Action** | Secondary control when needed (e.g. “View report”, “Buy credits”) — must not steal primary row activation if Figma uses whole-row click |

| Rule | Spec |
|------|------|
| Truncation | Description ellipsis on compact/preview; full on Notifications screen if Figma |
| Metadata | Optional plan name, audit id, invoice number in description only — mock |

---

## 4. Behaviour

Clicking / activating a notification should:

1. **Mark the notification as read** (mock client state).  
2. **Navigate to the relevant screen when applicable**.

| Type | Destination (example) |
|------|------------------------|
| Audit Completed | **Audit Report** |
| Audit Failed | **Audit History** (or failed audit detail if product prefers) |
| Payment Successful | **Invoice History** |
| Low Credits | **Manage Membership** |
| Subscription Activated | **Dashboard** |
| Payment Failed | Billing & Payments / Payment Failure recover path |
| Invoice Available | Invoice History or Invoice Details |
| Subscription Renewal | Manage Membership |
| Membership Upgrade | Manage Membership / Plan Comparison |
| Membership Expiry | Manage Membership |
| Team Activity | Team / settings placeholder when designed |
| System Notification | Optional deep link or stay on Notifications only |

| Rule | Spec |
|------|------|
| Already read | Navigate still; no-op (or reconfirm) mark-read |
| No destination | Mark read only; remain in list/dropdown |
| Dropdown | Close dropdown after navigate (parent) |
| Optional Action button | Same mark-read + navigate (or specific action); if separate from row, only that control navigates |
| Whole-row target | Prefer single interactive control wrapping the item for simplicity |

---

## 5. States

| State | Spec |
|-------|------|
| **Unread** | Indicator visible; heavier title weight or background per Figma |
| **Read** | Indicator gone/dimmed; default weight |
| **Hover** | Row hover affordance |
| **Focused** | Visible keyboard focus ring |
| **Pressed** | Active press styling |
| **Loading** | Skeleton row when notification payload pending |

Disabled/stale system notices may use muted read styling without interaction if Figma requires.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `id` | string | Yes | Stable notification id (mock) |
| `type` | enum of §2 types | Yes | |
| `title` | string | Yes | |
| `description` | string | Recommended | |
| `timestamp` | string / datetime | Recommended | Display + SR |
| `read` | boolean | Yes | |
| `href` / `target` | route key | Optional | Overrides default type map |
| `actionLabel` | string \| null | Optional | Optional Action |
| `variant` | `default` \| `compact` \| `preview` | No | Surface density |
| `state` | includes `loading` | No | Or parent skeleton |
| `onActivate` | action | Recommended | Parent: mark read + navigate |
| `onMarkRead` | action | Optional | Explicit mark without navigate |
| `onActionClick` | action | Optional | Optional Action only |

No real-time WebSocket props this phase.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full item activatable (Enter/Space); optional Action in tab order if separate |
| Visible focus | Required |
| Screen reader label | Include type/title, description (if needed), time, **read/unread** state |
| Unread | **Not color-only** — text cue or `aria` (“Unread”) + visual indicator |
| Icon | Decorative if title conveys meaning; else labeled |
| List context | Parent list uses `list` / `listitem` or menu semantics for dropdown |

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Notification Viewed** | Item enters viewport (list) or shown in dropdown/preview (dedupe per session/id preferred) |
| **Notification Clicked** | Primary activate (row) |
| **Notification Marked Read** | Read state flips unread → read |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `notificationId`, `type`, `surface` (`list` \| `dropdown` \| `preview`), `wasUnread` — no sensitive audit content bodies in marketing analytics |

Consent: marketing destinations after cookie consent.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full or compact row per surface |
| **Tablet** | Same hierarchy |
| **Mobile** | Compact; large touch target (≥44px height); description clamp |

Dropdown on mobile may become full-screen list sheet (parent) — item still reuses this component.

---

## 10. Mock Data

| Rule | Spec |
|------|------|
| Source | Mock notification objects with mixed types and read states |
| No | Backend feed · Supabase Realtime · email/push pipelines |
| Ids | Stable mock ids for mark-read persistence in client session |

---

## 11. Security & Privacy

| Rule | Spec |
|------|------|
| Auth | Shown only to authenticated users |
| Scope | Only current user’s notifications in mock filter |
| Content | Avoid leaking other users’ team activity beyond intended Business mock |
| Links | Deep links must open only resources the user may access (later authz) |

---

## 12. Relationship to System Toast

| Surface | Spec |
|---------|------|
| **Notification Item** | Persistent inbox history / dropdown |
| **Toast** | Ephemeral momentary feedback — not a substitute for this list |

A single product event (e.g. Payment Successful) may produce both a toast (immediate) and a Notification Item (history) — product wiring later.

---

## 13. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | One item component across list, dropdown, preview |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Architecture | Presentational + callbacks; parent owns mark-read store and navigation |
| Type map | Centralize type → icon + default destination |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ All notification types representable with icon + copy  
□ Display: icon, title, description, timestamp, unread, optional action  
□ Click → mark read + navigate per type examples  
□ States: Unread, Read, Hover, Focused, Pressed, Loading  
□ Unread not color-only  
□ Analytics: Viewed, Clicked, Marked Read  
□ WCAG 2.2 AA · keyboard · SR · visible focus  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend/Supabase  
□ Reusable across screen, dropdown, dashboard preview  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Push notifications / email delivery |
| Real-time server sync |
| Bulk select / swipe actions unless Figma requires (parent list may add later) |
| Toast implementation inside this component |

---

**End of COMPONENT_NOTIFICATION_ITEM.md**
