# COMPONENT — Pagination

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-025 (Pagination)  
**Component name:** Pagination (`Pagination`)  
**Primary screen:** Audit History (`docs/screens/SCREEN-009_AUDIT_HISTORY.md`)  
**Figma:** History / list pagination when designed — **exact match**  
**Priority:** P0 (with History list)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **API note:** `SCREEN_MAPPING` describes **cursor** pagination for `GET /audits`. UI may still show page numbers by mapping page ↔ cursor/offset in the parent, or use page-based API later. Do not expose raw cursors in the UI.

**Related:** `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_FILTER_BAR.md` · `docs/components/COMPONENT_SEARCH_BAR.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md`

---

## 1. Purpose

Allows users to **navigate between pages of Audit History** (and other long lists).

**Reusable** for Reports, Billing invoices, Notifications, etc. — same chrome; parent supplies counts and page changes.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Previous** | Go to previous page (disabled on first page) |
| **Page Numbers** | Numbered page controls; ellipsis when many pages (per Figma windowing, e.g. show current ± N) |
| **Next** | Go to next page (disabled on last page) |
| **Items Per Page** | Selector for page size (e.g. 10 / 25 / 50 — match Figma) |
| **Current Page** | Indicated in page numbers and/or “Page X of Y” text |
| **Total Pages** | Derived from total items ÷ items per page (ceil); show in summary text if Figma |

Optional summary: “Showing 1–10 of 128” when Figma includes it.

---

## 3. Behaviour

| Rule | Spec |
|------|------|
| Change page | Previous / Next / page number → emit `page` (1-based) |
| Items per page | Change size → reset to **page 1** → emit new page size |
| Filters/search/sort change | Parent resets to page 1 (Pagination reflects `currentPage=1`) |
| Bounds | Ignore/no-op navigation beyond 1…totalPages |
| Single page | See §4 — hide or disable nav as specified |
| Scroll | On page change, parent should move focus/scroll to top of list (a11y) |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Multi-page; Previous/Next/page numbers interactive as appropriate |
| **Disabled** | Entire control inert (list error, offline) |
| **Loading** | Controls disabled or busy while next page loads; keep current selection visible |
| **Single Page** | `totalPages <= 1` — hide page numbers / Previous / Next **or** show them disabled; Items Per Page may remain if useful |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `currentPage` | number (≥1) | Yes | Current page |
| `totalPages` | number (≥1) | Yes | Total pages |
| `totalItems` | number \| null | Recommended | For “of N” summary |
| `pageSize` | number | Yes | Items per page |
| `pageSizeOptions` | number[] | No | Default e.g. [10, 25, 50] |
| `state` | `default` \| `loading` \| `disabled` \| `single_page` | No | Or derive single_page |
| `onPageChange` | (page) => void | Yes | Page changed |
| `onPageSizeChange` | (size) => void | Yes | Items per page changed |
| `module` | `history` \| `reports` \| … | Analytics | Context |

Parent computes `totalPages` from total count + page size (or from API).

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Navigation | `nav` with `aria-label="Pagination"` (or “Audit history pagination”) |
| Current page | `aria-current="page"` on current page control |
| Previous / Next | Named buttons; disabled when not applicable |
| Page numbers | Buttons with names “Page 3”, etc. |
| Items per page | Labelled select/combobox (“Items per page”) |
| Keyboard | All controls operable; visible focus |
| Loading | `aria-busy` on nav; announce “Loading page” politely if needed |
| After change | Move focus to list heading or first result (parent responsibility) |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Page Changed** | User selects new page (not initial mount) | `module`, `page`, `pageSize`, `totalPages` |
| **Items Per Page Changed** | User changes page size | `module`, `pageSize`, `previousPageSize` |

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full: Previous, windowed page numbers, Next, items per page, current/total text |
| **Tablet** | May compress page number window |
| **Mobile** | Prefer Previous / Next + “Page X of Y”; items-per-page in select; omit long page number runs if Figma simplifies |

Same component — responsive variants, not separate pagination products.

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Audit History | Primary |
| Reports / Billing / Notifications | Same Pagination |
| Free / Pro / Business | Not tier-gated |

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Ellipsis | Non-interactive “…” between page clusters |
| No redesign | |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Controlled | Parent holds page + pageSize + totals |
| Phase 1 | Client-side slice of mock History array |
| Phase 2 | Map UI page to cursor/offset API; keep filters/search/sort in query |
| Reset | On filter/search/sort change → page 1 |
| Hide when | `totalItems === 0` (empty state owns the region) |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Previous, page numbers, Next, items per page, current/total  
□ First/last page disables Previous/Next correctly  
□ Page size change resets to page 1  
□ Default / Disabled / Loading / Single Page  
□ WCAG 2.2 AA; `aria-current` on active page  
□ Analytics: Page Changed, Items Per Page Changed  
□ Desktop / tablet / mobile  
□ Reusable; Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Infinite scroll (unless Figma replaces pagination later) |
| Rendering audit cards |
| Exposing API cursors in the UI |
| Server-side sorting (Sort Dropdown / parent) |

---

**End of COMPONENT / COMPONENT_PAGINATION.md**
