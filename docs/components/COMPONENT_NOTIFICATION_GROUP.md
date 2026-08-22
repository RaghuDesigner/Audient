# COMPONENT — Notification Group

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-039 (Notification Group)  
**Component name:** Notification Group (`NotificationGroup`)  
**Primary surfaces:** Notifications screen (`docs/screens/SCREEN-018_NOTIFICATIONS.md` when published) · Notification dropdown (optional compact grouping) · Dashboard notification preview (optional)  
**Related:** Notification Item (`COMPONENT_NOTIFICATION_ITEM.md`) — **composed child** of each group  
**Figma:** Date-grouped notification sections — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + list patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked data only** — no backend · no Supabase.  
> **Composition:** Parent buckets notifications by date; this component renders one bucket.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md`

---

## 1. Purpose

**Groups notifications by date** to improve scanning and organization.

Each group is a titled section containing zero or more **NotificationItem** rows.

**Do not redesign.** Match Figma.

---

## 2. Groups

Buckets (relative to user’s local calendar / product timezone rules):

| Group | Spec |
|-------|------|
| **Today** | Notifications with date = current local day |
| **Yesterday** | Previous local calendar day |
| **This Week** | Within the current week (after yesterday), excluding Today/Yesterday |
| **Earlier** | Older than this week |

| Rule | Spec |
|------|------|
| Empty buckets | **Omit** the group from the list (do not show “Today (0)” unless Figma requires Empty state for whole feed) |
| Order of groups | Always: **Today → Yesterday → This Week → Earlier** (only those with items) |
| Timezone | Prefer user locale local time for bucketing; document mock as browser local |
| “This Week” boundary | Start-of-week product convention (e.g. Monday or locale default) — pick one and keep consistent |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Group Heading** | Today / Yesterday / This Week / Earlier |
| **Notification Count** | Count of items in the group (e.g. badge or “3” next to heading per Figma) |
| **Notification Items** | Ordered list of `NotificationItem` children |

| Rule | Spec |
|------|------|
| Count scope | Items currently shown in the group after parent filters (e.g. unread-only) |
| Unread in group | Optional unread sub-count only if Figma; default = total item count |
| Heading level | Semantic heading appropriate to page outline (e.g. `h2`/`h3` under page title) |

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Children | Each group holds **multiple NotificationItem** components |
| Chronological order | Within a group: **newest first** (descending by timestamp) |
| Across groups | Group sequence preserves overall newest-first feed structure |
| Interaction | No mark-read-at-group-level unless Figma adds “Mark all read in section” (out of scope unless specified) |
| Filtering | Parent applies search/filter; groups re-bucket remaining items; empty groups hide |
| Expand/collapse | Not required unless Figma shows collapsible sections; default = always expanded |

Mark-read and navigation stay on **NotificationItem** / parent handlers.

---

## 5. States

| State | Spec |
|-------|------|
| **Populated** | Heading + count + ≥1 NotificationItem |
| **Empty** | This component instance is **not rendered** when its bucket has no items. (Whole-page empty belongs to Notifications screen empty state, not empty groups.) |
| **Loading** | Skeleton heading + skeleton NotificationItem rows for the section; `aria-busy` |

If product needs a single skeleton for entire feed, parent may render one Loading group or pure parent skeleton instead of multiple groups.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `groupKey` | `today` \| `yesterday` \| `this_week` \| `earlier` | Yes | Bucket id |
| `heading` | string | Recommended | Label override if needed |
| `count` | number | Recommended | Displayed count (usually `items.length`) |
| `items` | notification payloads | Yes | Data for children |
| `state` | `populated` \| `loading` | Recommended | Empty = do not mount |
| `variant` | `default` \| `compact` | No | List vs dropdown density |
| `showCount` | boolean | No | Default true if Figma shows count |
| `renderItem` / children | NotificationItems | Recommended | Reuse NotificationItem only |

Sorting/bucketing may be pure helpers used by parent before pass-in; either pattern is fine if behaviour matches.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Semantic grouping | Section with labeled heading; list of items under the section |
| Logical reading order | Heading → count → items (newest to oldest) |
| Keyboard | Focus moves through items in visual order |
| Count | Included in accessible name or adjacent text (“Today, 3 notifications”) |
| Loading | Region busy; announce when content arrives at parent level if needed |

---

## 8. Analytics

| Rule | Spec |
|------|------|
| Group-level | Optional; prefer **NotificationItem** events (Viewed / Clicked / Marked Read) |
| Parent list | Notifications screen may track group visibility later |

No requirement to fire a separate “group viewed” event unless product adds it.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full-width section under Notifications layout |
| **Tablet** | Same hierarchy |
| **Mobile** | Sticky or static group headings per Figma; items use NotificationItem compact density |

---

## 10. Composition

```text
NotificationGroup
  ├─ Group Heading + Count
  └─ NotificationItem
  └─ NotificationItem
  └─ …
```

| Rule | Spec |
|------|------|
| Reuse | **Only** NotificationItem for rows — do not reimplement row UI inside the group |
| Surfaces | Notifications screen lists ordered groups; dropdown may use groups or a flat list of recent items |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Source | Mock timestamps spanning all four buckets for QA |
| No | Backend date aggregation APIs |
| Edge cases | Exactly midnight boundaries; empty Today with only Earlier; single item |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Compose NotificationItem |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Architecture | Presentational section; parent owns data, filters, mark-read store |
| Order | Newest first within group; standard group sequence |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Groups: Today, Yesterday, This Week, Earlier  
□ Heading + count + NotificationItems  
□ Empty buckets omitted  
□ Newest first within group  
□ Group order Today → … → Earlier  
□ States: Populated, Empty (omit), Loading skeleton  
□ Semantic grouping + keyboard order  
□ WCAG 2.2 AA  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend  
□ Reuses NotificationItem only  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Custom user-defined groups |
| Infinite scroll virtualization (parent concern) |
| Mark entire group as read (unless later product brief) |
| Backend pagination of groups |

---

**End of COMPONENT_NOTIFICATION_GROUP.md**
