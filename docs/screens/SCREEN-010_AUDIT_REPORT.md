# SCREEN-010 — Authenticated Audit Report

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-010 (product brief)  
**Canonical mapping:** **SCREEN-M02** (Audit Report / Result)  
**Screen name:** Authenticated Audit Report  
**Guest preview:** `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` (not this full layout)  
**Figma:** Approved Audit Report — **strict match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses SCREEN-010 for Account Settings (Personal). Engineering should treat this as **M02**.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Data phase:** **Mocked report data only** — no backend, no Supabase, no API calls.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · all COMPONENT_* report specs below

**Also listed at:** `docs/components/SCREEN-010_AUDIT_REPORT.md` (pointer to this file).

---

## 1. Purpose

The Audit Report is the **core experience** of Audient.

It displays a **complete AI-powered UX audit** for a website or uploaded screenshot (tier-gated depth).

This screen must **strictly follow the approved Figma design**.

All report actions (**PDF**, **Share**, **Compare**) originate from this screen (typically Audit Summary / Report Actions).

---

## 2. Entry Points

```text
Dashboard → (audit flow) → Audit Completed → Audit Report

Audit History → Open Report → Audit Report

Notifications → Audit Ready → Audit Report
```

| Rule | Spec |
|------|------|
| Auth | Authenticated users only for this full layout |
| Guest | Limited preview (SCREEN-007), not this chrome |
| Invalid / missing id | Empty State (§11) |

---

## 3. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Audit Summary
        ↓
Overall UX Score
        ↓
Category Score Cards
        ↓
Strengths
        ↓
Key Findings
        ↓
AI Recommendations
        ↓
Upgrade Banner (if applicable)
        ↓
Report Actions
        ↓
Footer
```

| Rule | Spec |
|------|------|
| Figma | If Figma reorders columns (e.g. actions in Summary), **Figma wins** — keep the same sections |
| Tokens | Design tokens only — **no hardcoded colors**, **no inline CSS** in implementation |
| Architecture | Modular — compose reusable components only |

---

## 4. Header

Display:

| Element | Spec |
|---------|------|
| **Logo** | Brand home / Dashboard |
| **Search** | Global or History search entry per Figma (reuse Search Bar patterns if present) |
| **Notifications** | Bell / panel when M04 exists; placeholder OK in mock |
| **Profile Menu** | Authenticated: Profile · Manage Plan · History · Account Settings · Logout |

Not Guest Profile Dropdown.

---

## 5. Breadcrumb

```text
Dashboard > Audit History > Audit Report
```

| Rule | Spec |
|------|------|
| Links | Dashboard → Authenticated Dashboard; Audit History → History; current page not a link |
| A11y | `nav` labelled “Breadcrumb”; current page `aria-current="page"` |

---

## 6. Sections & Components

Reuse existing specs — **do not duplicate components**.

### 6.1 Audit Summary

**Reuse:** `COMPONENT_AUDIT_SUMMARY.md`

Context: thumbnail, name, URL, audit id, date/time, duration, type, membership, AI engine version, status, Share / Export / Compare entry points as designed.

### 6.2 Overall UX Score

**Reuse:** `COMPONENT_OVERALL_SCORE_CARD.md`

| Display | Spec |
|---------|------|
| Score | 0–100 |
| Grade | A+ … F |
| Score Description | Short AI summary (2–3 lines) |
| **Previous Score** | If available (prior audit / last viewed compare baseline) — show delta or prior value per Figma; omit when none |

### 6.3 Category Scores

**Reuse:** `COMPONENT_CATEGORY_SCORE_CARD.md`

Display category cards for (as data/Figma provide):

| Category |
|----------|
| Accessibility |
| Performance |
| Visual Design |
| Navigation |
| Content |
| SEO |
| Mobile UX |
| Forms |
| Trust |
| Consistency |

Parent may show a subset if mock/Figma limits visible tiles; component supports the whitelist.

### 6.4 Strengths

**Reuse:** `COMPONENT_STRENGTH_CARD.md`

Positive UX findings. **Expandable.**

### 6.5 Key Findings

**Reuse:** `COMPONENT_FINDING_CARD.md` (+ Locked Card for gated remainder)

| Field | Spec |
|-------|------|
| Title | |
| Category | |
| Severity | |
| Description | |
| Screenshot | Optional |
| **Affected Device** | e.g. Desktop / Mobile / Both — per finding mock |
| Priority | |
| Expand / Collapse | |

### 6.6 AI Recommendations

**Reuse:** `COMPONENT_RECOMMENDATION_CARD.md`

| Display | Spec |
|---------|------|
| Recommendation | Title + detail |
| Estimated Impact | |
| Implementation Effort | |
| AI Confidence | |
| Priority | |

### 6.7 Upgrade Banner

**Reuse:** `COMPONENT_UPGRADE_BANNER.md` — when Free (and Guest if ever on this shell). Hidden for Pro/Business unless Figma shows Business upsell.

### 6.8 Report Actions

**Reuse:**

| Component | Spec |
|-----------|------|
| `COMPONENT_EXPORT_PDF_BUTTON` | Export PDF |
| `COMPONENT_SHARE_REPORT_MODAL` | Share (opened from Share control) |
| `COMPONENT_COMPARE_REPORT_BUTTON` | Compare (Business enabled) |

May visually live in Summary and/or a dedicated Report Actions row — **Figma wins**; same components.

### 6.9 Footer

App shell footer.

---

## 7. Premium / Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | Preview only — use Guest Results screen, not this authenticated layout |
| **Free** | Limited report · locked advanced recommendations · PDF/Share gated · Compare locked |
| **Pro** | Complete report · PDF enabled · Share per Share Modal rules · Compare locked |
| **Business** | Complete report · collaboration placeholders · Compare enabled · Share org/team options |

Mock payloads must not leak full Pro JSON into Free for CSS-only locks (`SECURITY.md` practice).

---

## 8. States

| State | Spec |
|-------|------|
| **Loading** | **Skeleton UI** for summary, scores, lists |
| **Completed** | Full report for tier (mock) |
| **Empty** | §9 |
| **Error** | §10 |
| **Locked** | Section-level locks + Upgrade |

Pipeline failures use Audit Failed screen, not Error on Report.

---

## 9. Empty State

| Element | Spec |
|---------|------|
| Illustration | Per Figma / Empty State component |
| Headline | **No Audit Report Found** |
| Primary Button | **Return Dashboard** |

Reuse `COMPONENT_EMPTY_STATE` with variant `no_reports` / custom copy.

---

## 10. Error State

| Element | Spec |
|---------|------|
| Friendly message | Per ERROR_HANDLING tone |
| **Retry** | Re-load mock/report |
| **Return Dashboard** | Navigate to Authenticated Dashboard |

---

## 11. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full path operable |
| Visible focus | Required |
| Screen reader | Labels for scores, statuses, expands, actions |
| Logical tab order | Header → breadcrumb → summary/actions → scores → strengths → findings → recommendations → upgrade → footer |
| Disclosures | `aria-expanded` on Finding / Strength / Recommendation |
| PDF | Tagged when real export ships |

---

## 12. Analytics

| Event | Trigger |
|-------|---------|
| **Audit Report Viewed** | Report ready (`report_viewed`) |
| **Finding Expanded** / **Collapsed** | Finding Card |
| **Strength Expanded** | Strength Card |
| **Recommendation Expanded** | Recommendation Card |
| **Recommendation Accepted** | User marks accept / done if Figma has control; else defer until UI exists |
| **PDF Export Started** | Export PDF |
| **Share Report Opened** | Share modal open |
| **Compare Report Started** | Compare selector open |
| **Upgrade Banner Clicked** | Upgrade Banner CTA |

---

## 13. Mock Data

| Rule | Spec |
|------|------|
| Use | **Mocked report data** only |
| No | Backend integration · Supabase · API calls |
| Include | Scores, categories, strengths, findings (w/ affected device), recommendations, optional previousScore |
| Tier demos | Switch mock `tier` to validate Free locks vs Pro/Business |

---

## 14. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Full Figma composition |
| Tablet | Same sections; reflow cards |
| Mobile | Stack all sections; actions full-width |

---

## 15. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Every listed COMPONENT_* — **no duplicate components** |
| Style | Design tokens only — no hardcoded colors, no inline CSS |
| Modular | Thin page composing section components |
| Later | Wire `GET /audits/{id}/report` without changing layout contracts |
| Validation / errors | Follow VALIDATION_RULES / ERROR_HANDLING when APIs exist |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 16. Navigation Summary

```text
Entry (Dashboard completed / History / Notification)
        ↓
Authenticated Audit Report
        ├─ Expand strengths / findings / recommendations
        ├─ Export PDF → mock/real download or Upgrade
        ├─ Share → Share Report Modal
        ├─ Compare → selector (Business) or Upgrade
        ├─ Upgrade Banner → Upgrade / Plan Comparison
        └─ Breadcrumb → Dashboard | History
```

---

## 17. QA Checklist

□ Figma-strict layout; tokens only  
□ Header: Logo, Search, Notifications, Profile  
□ Breadcrumb: Dashboard > Audit History > Audit Report  
□ Sections in order with correct COMPONENT reuse  
□ Overall score + previous score when mocked  
□ Category set as listed  
□ Findings include Affected Device  
□ Free limited/locked · Pro full · Business + compare/collab placeholders  
□ Report Actions: PDF, Share, Compare components  
□ Loading skeleton · Empty “No Audit Report Found” · Error + Retry/Dashboard  
□ Mock only — no API/Supabase  
□ WCAG 2.2 AA · analytics events  
□ Desktop / tablet / mobile  

---

## 18. Non-goals (this phase)

| Out of scope |
|--------------|
| Live APIs / Supabase |
| Real PDF/share backends |
| Full Compare workspace |
| Guest full authenticated chrome |
| Duplicate one-off report widgets |

---

**End of SCREEN-010 / screens/SCREEN-010_AUDIT_REPORT.md**
