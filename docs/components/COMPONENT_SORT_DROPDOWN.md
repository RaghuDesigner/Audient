# COMPONENT — Sort Dropdown

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-023 (Sort Dropdown)  
**Component name:** Sort Dropdown (`SortDropdown`)  
**Primary screen:** Audit History (`docs/screens/SCREEN-009_AUDIT_HISTORY.md`)  
**Siblings:** Search Bar · Filter Bar  
**Figma:** History sort control when designed — **exact match**  
**Priority:** P0 (with History toolbar)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md` (Select / Dropdown primitives).

**Related:** `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_FILTER_BAR.md` · `docs/components/COMPONENT_SEARCH_BAR.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md`

---

## 1. Purpose

Allows users to **change audit ordering** on list surfaces (primarily Audit History).

**Reusable** for Reports or other libraries by swapping option sets — same dropdown chrome.

**Do not redesign.** Match Figma. Parent applies sort to the list/API.

---

## 2. Options

| Option | Sort semantics |
|--------|----------------|
| **Newest** | Newest first by audit created/completed date (default for History) |
| **Oldest** | Oldest first by date |
| **Highest Score** | Highest overall score first; audits without score (Processing/Failed) sort last or excluded per product rule — document: **null scores last** |
| **Lowest Score** | Lowest score first; null scores last |
| **Recently Viewed** | Last opened/viewed by current user first; never-viewed last. Requires client or server `lastViewedAt` — if unavailable in Phase 1, hide option or fall back to Newest |

| Rule | Spec |
|------|------|
| Labels | Exact Figma wording if different |
| Single select | Exactly one active option |
| Persist | Optional session/user preference for last sort — product choice |

---

## 3. Display

| Element | Spec |
|---------|------|
| Trigger | Button/combobox showing current sort label (e.g. “Newest”) + chevron |
| Menu | List of options when Expanded |
| Selected | Checkmark or selected style on active option |

Prefix “Sort by:” only if Figma shows it.

---

## 4. States

| State | Spec |
|-------|------|
| **Closed** | Menu hidden; trigger shows current value |
| **Expanded** | Menu open; options focusable |
| **Focused** | Trigger or option has visible focus |
| **Disabled** | Cannot open (loading list error, offline, empty with no sort meaning) |
| **Loading** | Trigger busy or disabled while sort request in flight; keep previous selection visible |

---

## 5. Behaviour

| Rule | Spec |
|------|------|
| Open | Click / Enter / Space / Arrow Down on trigger |
| Select | Activate option → close menu → emit new sort → parent reorders |
| Close | Select, Escape, click outside, Tab away |
| Default | **Newest** until user changes |
| Stable sort | Tie-break by `auditId` or createdAt for deterministic order |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `value` | `newest` \| `oldest` \| `score_desc` \| `score_asc` \| `recently_viewed` | Yes | Current sort |
| `options` | subset of above | No | Default = all five; omit Recently Viewed if unsupported |
| `state` | `closed` \| `expanded` \| `disabled` \| `loading` | No | Or derive expanded internally |
| `onChange` | (value) => void | Yes | Sort changed |
| `onOpenChange` | (open) => void | Optional | Expanded/closed |
| `module` | `history` \| `reports` \| … | Analytics | Context |
| `label` | string | No | Accessible name override (“Sort audits”) |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Pattern | `button` + menu, or `listbox` / select — consistent ARIA (`aria-haspopup`, `aria-expanded`, `aria-controls`) |
| Keyboard | Enter/Space toggle; Arrow Up/Down options; Enter select; Escape close; focus returns to trigger |
| Visible focus | Trigger and options |
| Name | Trigger announces current sort, e.g. “Sort by, Newest” |
| Disabled / Loading | Exposed to AT; loading not focus-trapping |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Sort Changed** | User selects a different option | `module`, `sort` (newest\|oldest\|score_desc\|score_asc\|recently_viewed), `previousSort` |

Do not fire on initial mount/default set.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Inline with Search / Filter toolbar |
| **Tablet** | Same; may wrap |
| **Mobile** | Full-width trigger or icon+label; menu as dropdown or bottom sheet per Figma — same options |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Audit History | Primary — all options when data supports them |
| Reports / other lists | Same component; optional option subset |
| Free / Pro / Business | Same sort control (not tier-gated) |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Menu | Max height + scroll if needed; z-index above list |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Controlled | Parent holds `value` and sorts client mock or passes `sort=` to API |
| Phase 1 | Client sort on mock; Recently Viewed via local `lastViewedAt` map or omit |
| Phase 2 | API sort params; persist recently viewed server-side if required |
| Pair with | Filter Bar + Search Bar — independent state |
| Map API | e.g. `newest` → `-createdAt`; `score_desc` → `-score` |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Options: Newest, Oldest, Highest Score, Lowest Score, Recently Viewed  
□ Default Newest  
□ Closed / Expanded / Focused / Disabled / Loading  
□ Keyboard + ARIA menu/listbox pattern  
□ Null scores ordered last for score sorts  
□ Sort Changed analytics once per user change  
□ Desktop / tablet / mobile  
□ Reusable; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Filter dimensions (Filter Bar) |
| Search query (Search Bar) |
| Multi-column table sort headers (unless Figma later) |
| Changing sort of another user’s library |

---

**End of COMPONENT / COMPONENT_SORT_DROPDOWN.md**
