# SCREEN-009 — Audit History

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-009 (product brief)  
**Canonical mapping:** **SCREEN-012** (History populated) · **SCREEN-013** (History empty) in `SCREEN_MAPPING.md`  
**Screen name:** Audit History  
**Auth:** Authenticated users only (Guest → Login Modal)  
**Figma:** `Screen8` (populated) · `Screen10` (empty) — **exact match for designed chrome**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses **SCREEN-009** for **Pro Home**. This document is **Audit History** (012/013). Renumber when consolidating.  
> **Figma vs this brief:** Uploaded History Figma is a **grouped list** (period headers + row/title + date + PDF download) **without** search/filter bars. **Visual chrome follows Figma.** Search, filters, sort, duplicate, delete, and compare are specified here as the **target library UX**; implement controls only when present in approved Figma—or as a deliberate enhancement pass after the Figma list ships. Do not invent layout that contradicts Figma spacing.  
> **STATE_MANAGEMENT:** Historically marked History search/filter and delete as FUTURE relative to uploads—this brief supersedes that for product intent once Figma/API support them.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` (`HIST-STATE-*`) · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/components/COMPONENT_RECENT_AUDIT_CARD.md` · `docs/components/COMPONENT_EMPTY_STATE.md` · `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md`

---

## 1. Purpose

The Audit History screen allows authenticated users to **browse, search, filter, and manage** previous UX audits.

It is the **central library** of completed, failed, and processing audits.

The UI must **match the approved Figma design**.

---

## 2. Business Goals

| Goal | How this screen supports it |
|------|-----------------------------|
| Increase return visits | Easy re-entry to past work |
| Encourage revisit of reports | Open Report / row open |
| Promote Pro upgrades | PDF + Compare gated for Free → Upgrade |
| Improve audit management | Search, filters, delete, duplicate (when enabled) |

---

## 3. User Goals

| Goal | Spec |
|------|------|
| Find a past audit | Search + filters + sort |
| Open a report | Primary Open Report |
| Download PDF | Pro / Business |
| Clean up library | Delete (with confirm) |
| Re-run similar audit | Duplicate Audit |
| Compare (paid) | Compare Audit — Pro / Business |

---

## 4. Layout

Vertical structure:

```text
Application Header
        ↓
Page Title
        ↓
Search Bar
        ↓
Filter Bar
        ↓
Sort Dropdown
        ↓
Audit List
        ↓
Pagination
```

| Rule | Spec |
|------|------|
| Shell | Global app shell; header unchanged (credits, authenticated avatar; crown if Pro/Business) |
| Breadcrumb | Home / History when Figma shows it |
| List | Grouped by period (“This year”, calendar year) **if Figma shows groups** — keep grouping with filters applied |
| Footer | App shell footer if used elsewhere |

---

## 5. Search

Allow searching by:

| Field | Spec |
|-------|------|
| Website Name | Case-insensitive partial match |
| URL | Host/path partial match |
| Audit ID | Exact or prefix match |

| Behaviour | Spec |
|-----------|------|
| Trigger | Debounced input (e.g. 300ms) or explicit submit per Figma |
| Empty query | Clear search constraint |
| No matches | Empty state **“No audits found.”** (filtered empty — distinct from never-audited empty) |
| Analytics | **Search Used** |

---

## 6. Filters

### 6.1 Audit Status

- Completed  
- Processing  
- Failed  

(Optional: Cancelled if product stores it.)

### 6.2 Audit Type

- Website (URL audit)  
- Screenshot  

### 6.3 Membership (plan used)

- Free  
- Pro  
- Business  

### 6.4 Date

- Today  
- Last 7 Days  
- Last 30 Days  
- Custom Range  

| Behaviour | Spec |
|-----------|------|
| Combine | AND across filter groups; OR within multi-select status if multi-select allowed |
| Clear | Clear all filters control |
| Analytics | **Filter Applied** (`filter`, `value`) |

---

## 7. Sort Dropdown

| Options (recommended) | Spec |
|----------------------|------|
| Newest first | Default (`-createdAt`) |
| Oldest first | |
| Highest score | Completed with score only |
| Lowest score | |

Match Figma labels if different.

---

## 8. Audit List / Audit Card

Reuse **Recent Audit Card** patterns (`COMPONENT-016`) extended for History actions — **do not** invent a conflicting card system.

### 8.1 Display

| Field | Spec |
|-------|------|
| Website Name | |
| Website Thumbnail | Placeholder if missing |
| Audit Date | Localized |
| Overall Score | When completed |
| Audit Status | Completed / Processing / Failed |
| Audit Type | Website / Screenshot |
| Plan Used | Free / Pro / Business |

### 8.2 Primary Action

| Action | Spec |
|--------|------|
| **Open Report** | Completed → Results; Processing → Processing screen; Failed → Audit Failed |

Analytics: **Report Opened** (`history_row_opened`).

### 8.3 Secondary Actions

| Action | Tier | Spec |
|--------|------|------|
| **Duplicate Audit** | All authed | Prefill new audit with same URL or prompt re-upload screenshot; new audit + credits check |
| **Delete Audit** | All authed | Confirm dialog; permanent remove from library; **no credit refund** on delete (`STATE_MANAGEMENT`) |
| **Download PDF** | **Pro & Business** | Signed URL; Free → Upgrade Modal |
| **Compare Audit** | **Pro & Business** | Enter compare flow (select second audit); Free → Upgrade; if compare UI not in Figma yet, CTA opens Upgrade or “Coming soon” only per product—do not invent full compare UI |

Analytics: **Audit Deleted**, **Download PDF**, **Compare Audit**.

---

## 9. Pagination

| Rule | Spec |
|------|------|
| Mode | Cursor pagination (`limit` + cursor) per SCREEN_MAPPING — or page numbers if Figma shows pages |
| Load | Skeleton on first load; append or page replace without losing filters |
| Empty page | Should not occur if total count respected |

---

## 10. Empty States

| Case | Spec |
|------|------|
| **No audits ever** | Prefer Figma: **“No History to display”** + CTA **Start New Audit** (align COMPONENT-020 / SCREEN-013) |
| **No search/filter matches** | **“No audits found.”** + Primary CTA **Start New Audit** (and/or Clear filters) |

Distinguish **loading**, **error** (retry), and **empty**.

---

## 11. States

| State | Spec |
|-------|------|
| Loading | Skeleton list / HIST-STATE-001 |
| Loaded | Cards + optional year groups |
| Empty (never) | SCREEN-013 copy |
| Empty (filtered) | “No audits found.” |
| Error | Fetch failed — retry (not empty) |
| Row busy | Delete/PDF in progress on that row |
| Offline | Banner; disable mutations |

---

## 12. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Search, filters, sort, cards, pagination, row actions operable |
| Visible focus | Required |
| Screen reader | Status/score/plan as text; group headers as headings; named PDF/Delete/Open |
| Dialogs | Delete confirm = accessible dialog; focus trap |
| Filters | Fieldsets/labels; announce result count when filters change (polite) |

---

## 13. Analytics

| Event | Trigger |
|-------|---------|
| **History Viewed** | Screen open (`history_viewed` / `history_opened`) |
| **Search Used** | Search query applied |
| **Filter Applied** | Any filter change |
| **Report Opened** | Open Report / row open |
| **Audit Deleted** | Delete confirmed |
| **Download PDF** | PDF success path (`pdf_downloaded`) |
| **Compare Audit** | Compare action (`tier`, `auditId`) |

---

## 14. Security

| Rule | Spec |
|------|------|
| Auth | Required; Guest gated at route |
| Ownership | `GET /audits` scoped to user; others **404** |
| PDF | Tier check server-side; Free never receives signed URL |
| Delete | Authenticated owner only |

---

## 15. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Full filters + wide rows per Figma |
| Tablet | Filters wrap / collapse per Figma |
| Mobile | Stack filters; full-width cards; 44px actions |

---

## 16. Developer Notes

| Rule | Spec |
|------|------|
| Phase 1 | **Mocked data** — mix of statuses/types/plans; wire search/filter client-side on mock |
| Phase 2 | `GET /audits` with query params; PDF signed URL; delete endpoint when available |
| Reuse | `RecentAuditCard`, `EmptyState`, Upgrade Modal — no duplicate card systems |
| Figma-first | Ship Screen8/10 list first if search chrome not designed; add search/filter without breaking row visuals |
| Compare | Do not build full compare product until designed — gate CTA only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 17. Navigation Summary

```text
Dashboard / Profile → History
        ↓
Audit History
        ├─ Open Report → Results | Processing | Failed
        ├─ Download PDF → file (Pro/Business) | Upgrade (Free)
        ├─ Duplicate → New audit flow
        ├─ Delete → confirm → list refresh
        ├─ Compare → compare flow / Upgrade
        └─ Start New Audit → Dashboard / audit entry
```

---

## 18. QA Checklist

□ Auth-only; Guest → Login  
□ Header + page title; list matches Figma grouping/rows  
□ Search by name / URL / audit id (when shipped)  
□ Filters: status, type, membership, date  
□ Sort + pagination  
□ Card fields + Open Report  
□ Secondary: Duplicate, Delete (confirm), PDF/Compare tier-gated  
□ Empty: never-audited vs no matches  
□ Loading / error distinct from empty  
□ WCAG 2.2 AA  
□ Analytics events  
□ Mock data works  

---

## 19. Non-goals

| Out of scope |
|--------------|
| Guest History |
| Full compare UI without Figma |
| Team shared libraries |
| Inventing search UI that breaks Screen8 layout |

---

**End of SCREEN-009 / SCREEN-009_AUDIT_HISTORY.md**
