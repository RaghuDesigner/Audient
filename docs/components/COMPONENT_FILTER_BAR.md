# COMPONENT — Filter Bar

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-022 (Filter Bar)  
**Component name:** Filter Bar (`FilterBar`)  
**Primary screen:** Audit History (`docs/screens/SCREEN-009_AUDIT_HISTORY.md`)  
**Sibling:** Search Bar (`docs/components/COMPONENT_SEARCH_BAR.md`)  
**Figma:** History filter chrome when designed — **exact match**; do not invent controls that break Screen8 list layout  
**Priority:** P0 (with History filter enhancement)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.

**Related:** `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_SEARCH_BAR.md` · `docs/components/COMPONENT_EMPTY_STATE.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/PRICING.md`

---

## 1. Purpose

Allows users to **filter Audit History** by status, audit type, membership (plan used), and date range.

**Reusable** for other list modules (e.g. Reports) by swapping filter definitions — same bar chrome and clear behaviour.

**Do not redesign.** Match Figma. Parent owns applying filters to the list/API.

---

## 2. Display

| Control | Spec |
|---------|------|
| **Status Filter** | Multi- or single-select per Figma |
| **Audit Type Filter** | Website / Screenshot |
| **Membership Filter** | Free / Pro / Business (plan used at audit time) |
| **Date Filter** | Presets + Custom range |
| **Clear Filters Button** | Resets all filters to default; visible when any filter active (or always per Figma) |

Compose with Search Bar and Sort Dropdown as siblings on History — Filter Bar does not include search/sort unless Figma merges them.

---

## 3. Filter Options

### 3.1 Status

| Value |
|-------|
| Completed |
| Processing |
| Failed |

### 3.2 Audit Type

| Value |
|-------|
| Website |
| Screenshot |

### 3.3 Membership

| Value |
|-------|
| Free |
| Pro |
| Business |

### 3.4 Date

| Value | Spec |
|-------|------|
| Today | Local calendar day |
| Last 7 Days | Rolling 7 days |
| Last 30 Days | Rolling 30 days |
| Custom | Start + end date picker (inclusive range); validate start ≤ end |

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Apply | Changing a filter emits updated filter state immediately (or on Apply if Figma uses Apply — default: immediate) |
| Combine | AND across groups; within Status, multi-select = OR if multi allowed |
| Clear Filters | All groups → unset/default; emit **Filter Cleared** |
| Custom date | Opening Custom expands date pickers; incomplete range does not apply until both ends valid |
| Results | Parent updates list; zero matches → Empty State “No audits found.” |
| Default | No filters = full History (or product default “All”) |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | No filters active (or All); Clear hidden/disabled if none active |
| **Expanded** | A filter dropdown/panel open (Status/Type/Membership/Date) |
| **Collapsed** | All menus closed; bar shows summary chips of active filters if Figma uses chips |
| **Loading** | Filters disabled or non-interactive while list reloads; optional busy on bar |
| **Disabled** | Entire bar inert (offline, error, unauthorized) |
| **Empty** | Not “no audits” — means **no filter options loaded** (config error) or show bar with defaults; list empty is parent Empty State |

Active filters may show count badge on the bar (if Figma).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `filters` | `{ status[], type[], membership[], datePreset, customRange }` | Yes | Controlled state |
| `state` | `default` \| `loading` \| `disabled` | No | Bar-level state |
| `expandedPanel` | `status` \| `type` \| `membership` \| `date` \| null | No | Which panel open |
| `onChange` | (filters) => void | Yes | Filter update |
| `onClear` | () => void | Yes | Clear all |
| `onExpandedChange` | (panel) => void | Optional | Expand/collapse |
| `module` | `history` \| `reports` \| … | Analytics | Context |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Labels | Each filter named (button/listbox/combobox patterns) |
| Expanded panels | `aria-expanded`; Escape closes panel; focus return to trigger |
| Keyboard | Tab between filters; arrows within options; Enter/Space select |
| Clear | Named “Clear filters” |
| Custom dates | Labelled start/end inputs; error text if invalid range |
| Announce | Parent polite live region for result count after apply |
| Visible focus | Required |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Filter Applied** | Any filter value set/changed | `module`, `filter` (status\|type\|membership\|date), `value` |
| **Filter Cleared** | Clear Filters (or last filter removed) | `module` |

Do not spam on every checkbox flicker if multi-select batches — emit on committed change.

Align with SCREEN-009 **Filter Applied**.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Horizontal filter row per Figma |
| **Tablet** | Wrap controls; same options |
| **Mobile** | Collapsed “Filters” entry → sheet/drawer with same groups + Clear; large tap targets |

**Reusable** — mobile collapse is a layout variant of the same component, not a separate Filter product.

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Audit History | Primary |
| Reports / other libraries | Same bar; different option sets via config |
| Free / Pro / Business users | Same filters (Membership filter is about **plan used on the audit**, not only current tier) |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Chips | Active filter chips only if Figma shows them |
| No redesign | Do not add extra filter dimensions beyond §3 unless product extends |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Controlled state | Parent holds filter object |
| Phase 1 | Client-side filter on mock History data |
| Phase 2 | Query params on `GET /audits` |
| Custom range | Local timezone boundaries |
| Pair with | Search Bar (debounced q) + Sort — independent state |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Status / Type / Membership / Date + Clear Filters  
□ All option values listed in §3  
□ Default / Expanded / Collapsed / Loading / Disabled  
□ Clear resets and fires Filter Cleared  
□ Custom date validation  
□ Keyboard + WCAG 2.2 AA  
□ Desktop / tablet / mobile (sheet on mobile OK)  
□ Analytics Filter Applied / Cleared  
□ Reusable; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Search text input (Search Bar) |
| Sort dropdown (sibling) |
| Rendering audit cards |
| Server-side facet counts unless API adds them later |

---

**End of COMPONENT / COMPONENT_FILTER_BAR.md**
