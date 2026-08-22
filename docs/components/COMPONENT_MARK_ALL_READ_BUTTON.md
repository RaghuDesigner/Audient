# COMPONENT — Mark All Read Button

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-043 (Mark All Read Button)  
**Component name:** Mark All Read Button (`MarkAllReadButton`)  
**Primary screen:** Notifications (`docs/screens/SCREEN-018_NOTIFICATIONS.md`)  
**Related:** Notification Badge (`COMPONENT_NOTIFICATION_BADGE.md`) — unread count clears · Notification Item — row indicators clear  
**Figma:** “Mark all as read” control on Notifications header — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Button patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock state only** — no backend · no Supabase · no `PATCH /notifications` API.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md` · `docs/components/COMPONENT_NOTIFICATION_BADGE.md` · `docs/components/COMPONENT_NOTIFICATION_FILTER.md`

---

## 1. Purpose

Allows users to **mark all unread notifications as read** in one action.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Button** | Secondary or text button per Figma |
| **Label** | **Mark all as read** |

Placed in Notifications page header toolbar beside unread count / filters (SCREEN-018 layout).

---

## 3. Behaviour

When clicked:

| Step | Spec |
|------|------|
| 1 | Update **all mocked notifications** to `read: true` in client store |
| 2 | Update **unread count** to 0 (Notification Badge sync) |
| 3 | **Remove unread indicators** on all NotificationItem rows |
| 4 | Show **confirmation feedback** — toast or inline success per Figma |

| Rule | Spec |
|------|------|
| Scope | **All** notifications in inbox — **not** only visible filter subset (SCREEN-018 default) |
| Delete | Does **not** delete notifications |
| Filter | Active NotificationFilter unchanged; list may still show read items |
| Idempotent | Click when already all-read should not run (button disabled) |

Parent owns mock store mutation; button triggers `onMarkAllRead` callback.

---

## 4. States

| State | Spec |
|-------|------|
| **Enabled** | `unreadCount > 0`; button interactive |
| **Disabled** | `unreadCount === 0` — see §5 |
| **Loading** | Brief busy while mock update; `aria-busy`; prevent double click |
| **Success** | After completion — feedback message shown |
| **Error** | Mock update failure (rare) — inline error + Retry; do not falsely show success |

---

## 5. Disabled Rule

**Disable the button when there are no unread notifications** (`unreadCount === 0`).

| Spec | Detail |
|------|--------|
| Visual | Disabled styling + not focusable or focusable with `aria-disabled` per design system |
| SR | State conveyed (“Mark all as read, disabled, no unread notifications”) |

Also disable during **Loading**.

---

## 6. Success Message

| Element | Spec |
|---------|------|
| **Message** | **All notifications marked as read.** |

| Delivery | Spec |
|----------|------|
| Toast | Preferred if global toast system exists |
| Inline | Live region near button acceptable per Figma |
| Duration | Auto-dismiss toast; inline may persist until navigation |

Fire **Mark All Read Completed** analytics after successful mock update.

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `unreadCount` | number | Yes | Disables when 0 |
| `onMarkAllRead` | action | Yes | Parent marks all read in mock store |
| `state` | `idle` \| `loading` \| `success` \| `error` | Recommended | Or derive from async mock |
| `disabled` | boolean | No | Extra disable (e.g. page error) |
| `onRetry` | action | Error | |
| `className` | string | No | |
| `variant` | button variant | No | Figma |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full button operable; Enter/Space activate |
| Visible focus | Required |
| Screen reader | Announce success via live region / toast; loading `aria-busy` |
| Disabled | Programmatic disabled when unread = 0 |
| Success | “All notifications marked as read.” announced (polite) |

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| **Mark All Read Clicked** | Button pressed (unread &gt; 0) |
| **Mark All Read Completed** | Mock store updated successfully |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `unreadCountBefore`, `mock: true` |

Do not fire Completed on click alone — only after success.

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Header toolbar inline |
| **Tablet** | Same or wrap below title |
| **Mobile** | Full-width or compact text button; min 44px touch target |

---

## 11. Relationship to Siblings

| Component | Effect |
|-----------|--------|
| **NotificationBadge** | Count → 0; badge hidden |
| **NotificationItem** | All rows → read styling |
| **NotificationFilter** | Unchanged; Unread filter may show empty after |
| **NotificationEmptyState** | Filtered Unread empty may appear |

---

## 12. Mock Data

| Rule | Spec |
|------|------|
| Update | Set `read: true` on all items for current mock user |
| No | `PATCH /notifications/read-all` until backend ships |
| Persist | Session/mock store only this phase |

---

## 13. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Shared Button primitive |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Parent | Owns notification list state + badge count |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Label “Mark all as read”  
□ Disabled when unread = 0  
□ Click → all read, count 0, indicators gone  
□ Success message shown  
□ Loading / Error states  
□ Analytics Clicked + Completed  
□ WCAG 2.2 AA · keyboard · SR feedback  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Mark visible/filtered subset only (unless product changes SCREEN-018) |
| Undo |
| Server sync / Supabase |
| Delete notifications |

---

**End of COMPONENT_MARK_ALL_READ_BUTTON.md**
