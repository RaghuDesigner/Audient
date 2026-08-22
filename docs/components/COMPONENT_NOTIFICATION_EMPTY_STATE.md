# COMPONENT — Notification Empty State

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-041 (Notification Empty State)  
**Component name:** Notification Empty State (`NotificationEmptyState`)  
**Primary screen:** Notifications (`docs/screens/SCREEN-018_NOTIFICATIONS.md`)  
**Related:** Empty State (`COMPONENT_EMPTY_STATE.md`) — generic list empty pattern; this component is **notification-inbox-specific** copy and Clear Filter behaviour  
**Figma:** Notifications empty / filtered-empty blocks — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + empty-state patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock only** — no backend · no Supabase.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_NOTIFICATION_FILTER.md` · `docs/components/COMPONENT_NOTIFICATION_GROUP.md`

---

## 1. Purpose

Provides feedback when there are **no notifications to display** in the inbox list.

**Reusable** on:

| Surface | Spec |
|---------|------|
| **Notifications screen** | Primary — replaces empty group list |
| **Notification dropdown** | Optional compact empty (same copy or shortened) |

Distinct from **Error State** (“Unable to load notifications”) and **Loading** (skeletons).

**Do not redesign.** Match Figma.

---

## 2. Default Empty State

When the user has **no notifications at all** (filter = **All**, mock inbox empty).

| Element | Spec |
|---------|------|
| **Icon / Illustration** | Decorative empty / inbox icon per Figma |
| **Heading** | **You're all caught up** |
| **Description** | **You don't have any new notifications.** |
| **Action** | Optional secondary link per Figma (e.g. Dashboard) — **not required** unless Figma shows CTA |

| Rule | Spec |
|------|------|
| Not an error | Positive / neutral tone |
| No Clear Filter | Default empty has no active filter to clear |

SCREEN-018 optional CTA “Manage Membership” or Dashboard link — only if Figma; brief default has no mandatory CTA.

---

## 3. Filtered Empty State

When notifications exist in the mock store but **none match** the active filter (not **All**).

| Element | Spec |
|---------|------|
| **Heading** | **No notifications found** |
| **Description** | **There are no notifications matching this filter.** |
| **Action** | **Clear Filter** — resets filter to **All** via parent (`NotificationFilter`) |

| Rule | Spec |
|------|------|
| Clear Filter | Primary/secondary button per Figma; fires filter change to `all` only — does not delete notifications |
| Distinct copy | Must differ from Default Empty so users know data may exist elsewhere |
| Search | If search is added later, reuse Filtered variant with “Clear filters” — out of scope unless product adds search |

---

## 4. States

| State | Spec |
|-------|------|
| **Default Empty** | No notifications in inbox; filter = All |
| **Filtered Empty** | Filter active (Unread / category) yields zero rows |

| Not this component | Spec |
|--------------------|------|
| Loading | Skeleton notification rows — parent |
| Error | “Unable to load notifications” + Retry — parent |
| Populated | NotificationGroup list — parent |

Parent chooses variant from: `notifications.length === 0` → Default; `filtered.length === 0 && filter !== 'all'` → Filtered.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `variant` | `default` \| `filtered` | Yes | Which empty UX |
| `onClearFilter` | action | Filtered | Resets NotificationFilter to All |
| `onPrimaryAction` | action | Optional | e.g. Go to Dashboard on default empty |
| `primaryLabel` | string | Optional | Override CTA label |
| `className` | string | No | Layout hook |
| `compact` | boolean | No | Dropdown density |

Copy defaults from §2–§3; override only with product approval.

---

## 6. Behaviour

| Rule | Spec |
|------|------|
| Clear Filter | `onClearFilter()` → parent sets filter to `all`; list re-renders |
| Keyboard | Clear Filter / optional CTA fully operable |
| Groups | NotificationGroup sections omitted when empty — this component replaces the list region |
| Dropdown | May hide filter empty or show one-line “No notifications” — Figma |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Screen reader | Heading announced; description readable; action buttons labeled (“Clear filter”, not “Clear” alone) |
| Keyboard | Tab to Clear Filter / optional CTA; Enter/Space activate |
| Illustration | `aria-hidden` if decorative |
| Region | `role="status"` or section with labelled heading — not a live region spam on mount unless page-level announce is desired |

---

## 8. Analytics

| Event | Trigger (optional — parent or component) |
|-------|---------------------------------------------|
| Filter cleared from empty | May reuse **Notification Filter Used** with `filter: all` when user clicks Clear Filter |

No separate “empty viewed” required unless product adds later.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered empty block in list column |
| **Tablet** | Same |
| **Mobile** | Full-width; compact padding; Clear Filter full-width if Figma |

---

## 10. Relationship to Siblings

| Component | Spec |
|-----------|------|
| **NotificationFilter** | Clear Filter resets to All |
| **NotificationGroup** | Hidden when list empty |
| **EmptyState (generic)** | May share illustration tokens; do not duplicate unrelated variants (No Audits, etc.) |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Default empty | Mock catalog empty array or new user with zero rows |
| Filtered empty | Full mock catalog + active Unread/category with zero matches |
| No | API empty responses |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Single component, two variants |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Parent | Owns filter state and empty vs filtered detection |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Default: “You're all caught up” + description  
□ Filtered: “No notifications found” + description + Clear Filter  
□ Clear Filter → All; list repopulates when mock has items  
□ Not shown during Loading or Error  
□ WCAG 2.2 AA · keyboard · SR  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Fetch/retry error UI |
| Mark all as read |
| Creating mock notifications from empty state |

---

**End of COMPONENT_NOTIFICATION_EMPTY_STATE.md**
