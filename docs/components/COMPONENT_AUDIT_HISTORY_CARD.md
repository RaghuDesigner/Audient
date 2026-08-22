# COMPONENT — Audit History Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-024 (Audit History Card)  
**Component name:** Audit History Card (`AuditHistoryCard`)  
**Primary screen:** Audit History (`docs/screens/SCREEN-009_AUDIT_HISTORY.md`)  
**Related:** Recent Audit Card (`docs/components/COMPONENT_RECENT_AUDIT_CARD.md`) — share field/status patterns; History card adds URL + secondary actions  
**Figma:** History row/card (`Screen8`) — **exact match**; denser row vs Dashboard recent card is OK if Figma differs  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.

**Related docs:** `docs/PRICING.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/components/COMPONENT_EMPTY_STATE.md` · `docs/components/COMPONENT_LOCKED_CARD.md` (gated actions pattern)

---

## 1. Purpose

Displays **one** audit in History — **completed**, **processing**, or **failed** — with identity, score/status, and actions to open, duplicate, delete, download PDF, or compare.

**Reusable** in History lists (and optionally denser Dashboard recent rows if product unifies). Prefer composing shared primitives (status badge, score text) with Recent Audit Card rather than forking unrelated designs.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Website Thumbnail** | Preview image; placeholder when missing |
| **Website Name** | Display title / site name |
| **Website URL** | URL or hostname (truncate with title tooltip if long) |
| **Audit Date** | Localized created/completed date |
| **Overall Score** | 0–100 when Completed; “—” / hidden while Processing; no fake score on Failed unless partial exists |
| **Audit Status** | Completed / Processing / Failed (text + badge, not color-only) |
| **Membership Badge** | Plan used: Free / Pro / Business |
| **Audit Type** | Website (URL) / Screenshot |

---

## 3. Primary Action

| Action | Spec |
|--------|------|
| **Open Report** | **Completed** → Results report · **Processing** → Processing screen · **Failed** → Audit Failed |

Always available for owner’s audits (destination varies by status). Analytics: **Open Report**.

---

## 4. Secondary Actions

| Action | Tier | Spec |
|--------|------|------|
| **Duplicate** | All authenticated | Start new audit prefilled with URL or re-upload prompt for screenshot; credits/tier checks on start |
| **Delete** | All authenticated | Confirm dialog → remove from library; **no credit refund** |
| **Download PDF** | **Pro & Business** | Signed URL when PDF ready; **Free** → Upgrade Modal (action may show Locked) |
| **Compare Report** | **Business** | Enter compare flow / select peer audit; Free/Pro → Upgrade or hide per Figma (Pro does **not** get Compare on this card) |

Overflow menu (⋯) allowed if Figma uses it for secondary actions.

---

## 5. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton thumb + lines + actions |
| **Completed** | Score + Open Report → report; PDF/Compare per tier |
| **Processing** | Status Processing; Open → progress; PDF/Compare disabled or hidden |
| **Failed** | Status Failed; Open → failure details; PDF typically unavailable |
| **Locked** | Gated secondary action affordance (PDF/Compare) — lock icon or disabled+tooltip “Upgrade to unlock”; **do not** reveal signed PDF URLs |
| **Hovered** | Figma hover row/card chrome |
| **Focused** | Visible focus on card/actions (keyboard) |

Hovered/Focused are interaction states on top of Completed/Processing/Failed.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `auditId` | string | Yes | |
| `websiteName` | string | Yes | |
| `websiteUrl` | string \| null | Recommended | |
| `thumbnailUrl` | string \| null | No | |
| `auditDate` | datetime | Yes | |
| `score` | 0–100 \| null | No | |
| `status` | `loading` \| `completed` \| `processing` \| `failed` | Yes | |
| `planUsed` | `free` \| `pro` \| `business` | Recommended | Membership badge |
| `auditType` | `website` \| `screenshot` | Yes | |
| `tier` | current user tier | Yes | Gate PDF/Compare |
| `pdfAvailable` | boolean | No | PDF ready |
| `onOpenReport` | action | Yes | |
| `onDuplicate` | action | Yes | |
| `onDelete` | action | Yes | |
| `onDownloadPdf` | action | When entitled or gated click | |
| `onCompare` | action | Business / gated click | |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Name | Card/row summary: name, status, score, type, date |
| Thumbnail | Meaningful alt or decorative if name/URL adjacent |
| Status / badge | Text labels |
| Actions | Named buttons (“Open report”, “Delete audit”, “Download PDF”, “Compare report”, “Duplicate audit”) |
| Keyboard | Primary + secondary operable; menu pattern if overflow |
| Delete | Confirm dialog focus trap |
| Locked | Explain upgrade requirement to AT — not silent disabled |
| Visible focus | Required |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Open Report** | Primary action | `auditId`, `status` |
| **Delete** | Delete confirmed | `auditId` |
| **Duplicate** | Duplicate activated | `auditId`, `auditType` |
| **Download** | PDF download initiated/success | `auditId`, `tier` |
| **Compare** | Compare activated | `auditId`, `tier` |

Also: gated click attempts may fire `upgrade_clicked` with `source: history_card_pdf|compare`.

Align `history_row_opened`, `pdf_downloaded`, `audit_deleted` in `ANALYTICS.md`.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Wide row: thumb + meta + score + actions per Figma |
| **Tablet** | Tighten gaps; secondary in overflow if needed |
| **Mobile** | Stack thumb/meta; actions in menu or full-width buttons; ≥44px targets |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Audit History | Primary list item |
| Search/filter results | Same card |
| Dashboard Recent | Prefer COMPONENT-016; promote to this card only if Figma unifies |

One History card component — Free/Pro/Business differ by **action availability**, not layout forks.

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma (Screen8 rows) |
| Tokens | Status/plan colors + text |
| URL | Truncate visually; full value in accessible name/title |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Phase 1 | Mock cards all statuses + tier-gated actions |
| Phase 2 | Bind `GET /audits`; PDF signed URL; delete API; compare when designed |
| Compare | Business-only on this card; do not invent full compare UI — CTA may route to stub/Upgrade |
| Security | Ownership + PDF tier server-side |
| Share primitives | Score/status with Recent Audit Card |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All display fields present  
□ Open Report routes by status  
□ Duplicate / Delete (confirm)  
□ PDF: Pro & Business only; Free locked → Upgrade  
□ Compare: Business only  
□ States: Loading, Completed, Processing, Failed, Locked, Hovered, Focused  
□ WCAG 2.2 AA  
□ Analytics: Open, Delete, Duplicate, Download, Compare  
□ Desktop / tablet / mobile  
□ Reusable; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full report body inside the card |
| Filter/Search UI |
| Building complete Compare product UI without Figma |
| Guest History |

---

**End of COMPONENT / COMPONENT_AUDIT_HISTORY_CARD.md**
