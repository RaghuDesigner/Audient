# COMPONENT — Audit Summary

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-027 (Audit Summary)  
**Component name:** Audit Summary (`AuditSummary`)  
**Primary screen:** Audit Report (`docs/screens/SCREEN-010_AUDIT_REPORT.md` · SCREEN-M02)  
**Figma:** Report header / summary block — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.

**Related:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` (`RPT-STATE-*`) · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-010_AUDIT_REPORT.md` · `docs/components/COMPONENT_OVERALL_SCORE_CARD.md` · `docs/components/COMPONENT_LOCKED_CARD.md`

---

## 1. Purpose

The Audit Summary provides a **concise overview of a completed UX audit**.

It is displayed at the **top of every audit report** and gives users **immediate context** before detailed findings (Overall Score Card follows below on the report).

**Reusable** across:

| Surface | Spec |
|---------|------|
| **Audit Report** | Primary |
| **Compare Reports** | Per-audit header strip when compare UI ships |
| **Shared Reports** | Read-only summary when share exists (security-reviewed links) |
| **PDF Export** | Same fields in print/PDF template for parity |

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Website Thumbnail** | Screenshot/preview; placeholder if missing |
| **Website Name** | Display title / site name |
| **Website URL** | Full URL or hostname (truncate + title for overflow) |
| **Audit ID** | Stable id (copy affordance optional if Figma) |
| **Audit Date & Time** | Localized created/completed timestamp |
| **Audit Duration** | Human-readable processing duration (e.g. “1m 24s”) |
| **Audit Type** | **URL** or **Screenshot** |
| **Membership Used** | Free / Pro / Business (tier at audit time) |
| **AI Engine Version** | Engine/prompt pipeline version string from audit metadata |
| **Overall Audit Status** | Status badge — see §3 |

Overall numeric score lives primarily in **Overall Score Card** (sibling). Summary does not replace that component unless Figma duplicates a mini score here.

---

## 3. Status Badge

Display **one** badge:

| Status | Spec |
|--------|------|
| **Completed** | Report ready |
| **Processing** | Audit still running (summary may appear on progress-adjacent views; on Report route prefer Completed only) |
| **Failed** | Prefer Audit Failed screen; if shown, badge Failed + limited actions |

Status = text + color — not color-only (`Severity`/`Badge` patterns).

---

## 4. Quick Actions

| Action | Spec |
|--------|------|
| **Share Report** | Opens share flow or stub/Upgrade per product; analytics always |
| **Export PDF** | Pro & Business when PDF ready; Guest/Free → Upgrade Modal |
| **Compare Report** | **Business only** → compare flow; others → Upgrade or hide per Figma |

| Tier | Share | Export PDF | Compare |
|------|:-----:|:----------:|:-------:|
| Guest | Gate / Upgrade | Upgrade | Hide / Upgrade |
| Free | Gate / Upgrade | Upgrade | Hide / Upgrade |
| Pro | Per product (may stub if share OOS) | ✅ when ready | Upgrade / hide |
| Business | Per product | ✅ | ✅ when designed |

Disabled/locked actions need accessible names (“Upgrade to export PDF”), not silent disables.

---

## 5. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton thumb + meta rows + action placeholders; `aria-busy` |
| **Completed** | All fields + actions per tier |
| **Processing** | Status Processing; Export/Share/Compare disabled or hidden; duration may still update |
| **Failed** | Status Failed; primary recovery is not this card’s job — link/CTA to failure details if shown |
| **Error** | Failed to load summary metadata; inline error + Retry; no fake Audit ID/URL |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `completed` \| `processing` \| `failed` \| `error` | Yes | |
| `auditId` | string | Success states | |
| `websiteName` | string | Yes | |
| `websiteUrl` | string \| null | Recommended | |
| `thumbnailUrl` | string \| null | No | |
| `auditedAt` | datetime | Yes | Date & time |
| `durationSeconds` | number \| null | Recommended | Duration |
| `auditType` | `url` \| `screenshot` | Yes | |
| `membershipUsed` | `free` \| `pro` \| `business` | Recommended | |
| `aiEngineVersion` | string \| null | Recommended | |
| `status` | `completed` \| `processing` \| `failed` | Yes | Badge |
| `tier` | current user tier | Yes | Gate actions |
| `pdfAvailable` | boolean | No | |
| `onShare` | action | When shown | |
| `onExportPdf` | action | When shown | |
| `onCompare` | action | Business / gated | |
| `onRetry` | action | Error | |
| `variant` | `report` \| `compare` \| `shared` \| `pdf` | No | Density/actions |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All quick actions operable |
| Screen reader | Summary region labelled; announce name, type, status, date, audit id |
| Thumbnail | Meaningful alt or decorative if name/URL adjacent |
| Status | Text badge |
| Visible focus | Required on actions |
| Locked actions | Explain upgrade requirement |
| PDF variant | Reading order: name → url → meta → status (for tagged PDF later) |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Audit Summary Viewed** | Summary visible / impressed | `auditId`, `status`, `tier`, `variant` |
| **Share Clicked** | Share activated | `auditId`, `tier` |
| **Export Clicked** | Export PDF activated | `auditId`, `tier` (success → also `pdf_downloaded`) |
| **Compare Clicked** | Compare activated | `auditId`, `tier` |

Align with Report **Report Viewed** — Summary Viewed may be component-level; avoid double-counting page views (page fires `report_viewed`; summary may attach props or fire once per audit view).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Thumb + meta grid + actions row per Figma |
| **Tablet** | Tighten; actions wrap |
| **Mobile** | Stack thumb → meta → full-width actions |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Audit Report | Top of report |
| Compare Reports | One summary per side/column |
| Shared Reports | Read-only; hide owner-only actions if needed |
| PDF Export | Static fields; no interactive buttons in PDF |

One component — vary `variant` and action visibility, not four unrelated headers.

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Membership / status | Badge primitives from mapping |
| No redesign | Spacing/type per Figma |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Data | **Mock data only** this phase |
| API | None for now; later bind report metadata + `aiEngineVersion` |
| Share / Compare | Stub handlers OK; do not invent insecure public URLs |
| PDF | Gate in UI; real signed URL later |
| Sibling | Overall Score Card remains separate below summary |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All display fields present (incl. Audit ID, duration, AI engine version)  
□ Status badge: Completed / Processing / Failed  
□ Quick actions: Share, Export PDF, Compare (Business) with tier gates  
□ States: Loading, Completed, Processing, Failed, Error  
□ WCAG 2.2 AA; keyboard; SR; visible focus  
□ Analytics: Summary Viewed, Share, Export, Compare  
□ Desktop / tablet / mobile  
□ Reusable across report / compare / shared / PDF  
□ Mock only; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full findings list |
| Overall score ring (Overall Score Card) |
| Live share infrastructure without security design |
| Computing duration/score in the UI |

---

**End of COMPONENT / COMPONENT_AUDIT_SUMMARY.md**
