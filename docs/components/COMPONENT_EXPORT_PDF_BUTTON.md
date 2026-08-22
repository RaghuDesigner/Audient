# COMPONENT — Export PDF Button

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-030 (Export PDF Button)  
**Component name:** Export PDF Button (`ExportPdfButton` / `PdfDownloadButton` in `COMPONENT_MAPPING.md`)  
**Primary surfaces:** Audit Report · Audit Summary actions · History (when PDF offered)  
**Figma:** PDF download / Export PDF control — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Button primitives in `COMPONENT_MAPPING.md`.

**Related:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` (PDF Download Button) · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-010_AUDIT_REPORT.md` · `docs/components/COMPONENT_AUDIT_SUMMARY.md`

---

## 1. Purpose

Allows users to **export an audit report as a professionally formatted PDF**.

**Reusable** across:

| Surface | Spec |
|---------|------|
| **Audit Report** | Primary |
| **Compare Reports** | Export compare PDF when that product exists |
| **Shared Reports** | Export when share viewer allows (tier/link policy) |

Also usable from History / Audit Summary quick actions via the same component.

**Do not redesign.** Match Figma.

---

## 2. Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | **Hidden** — do not show Export PDF on guest surfaces |
| **Free** | **Disabled / Locked** with **Upgrade CTA** (click → Upgrade Modal, not download) |
| **Pro** | **Enabled** (when report completed / PDF ready) |
| **Business** | **Enabled** (same as Pro) |

| Rule | Spec |
|------|------|
| Authority | When APIs exist, signed URL + tier check server-side (`SECURITY.md`); Free never receives a download URL |
| Cost | PDF export **0 credits** for entitled tiers (`PRICING.md`) |
| This phase | **Mock only** — no real generation backend |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Button label** | **Export PDF** |
| **Button icon** | Download PDF icon (decorative `aria-hidden` if label present) |
| **Tooltip** | **Download a professional PDF version of this report.** |

Locked/Free: tooltip may read upgrade messaging (e.g. “Upgrade to Pro to export PDF”) if Figma differs — keep accessible name clear.

---

## 4. Interaction

| Step | Spec |
|------|------|
| On click (Pro/Business, enabled) | Enter **Loading** — show export progress |
| Generate PDF | **Placeholder** mock delay (e.g. progress indeterminate or % fake) |
| Download PDF | **Future backend** — signed URL download; mock may trigger a sample file or success toast without a real report PDF |
| On click (Free/Locked) | **Upgrade Clicked** → Upgrade Modal / Plan Comparison — no progress, no file |
| Guest | Control not rendered — no click path |

Cancel mid-mock optional; not required unless Figma shows cancel.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Enabled idle (Pro/Business) |
| **Hover** | Figma hover |
| **Focused** | Visible focus ring |
| **Pressed** | Active press style |
| **Loading** | Export in progress; `aria-busy`; prevent double-click |
| **Success** | Brief success (toast or check) then return to Default; file download started (mock/real) |
| **Error** | Export failed message + retry; button re-enabled |
| **Disabled** | Not clickable — e.g. report still Processing, or PDF not ready |
| **Locked** | Free tier — looks gated; activates Upgrade, not export |

Disabled ≠ Locked: Disabled = temporarily unavailable; Locked = entitlement gate.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `auditId` | string | Yes | Target audit |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Yes | Visibility/gates |
| `state` | `default` \| `loading` \| `success` \| `error` \| `disabled` \| `locked` | Yes | |
| `pdfReady` | boolean | No | False → Disabled with “Preparing PDF…” |
| `label` | string | No | Default “Export PDF” |
| `tooltip` | string | No | Default tooltip copy |
| `onExport` | action | Pro/Business enabled | Start mock/real export |
| `onUpgrade` | action | Locked/Free | Open Upgrade |
| `errorMessage` | string \| null | Error | |
| `variant` | `button` \| `icon` | No | History icon-only if Figma |
| `surface` | `report` \| `compare` \| `shared` \| `history` | Analytics | |

Guest: parent **does not mount** the component (`hidden`).

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Enter/Space activate |
| Screen reader label | e.g. “Export PDF report” / “Upgrade to export PDF” when Locked |
| Tooltip | Not the only label — accessible name on control required |
| Visible focus | Required |
| Loading | `aria-busy="true"`; announce “Exporting PDF” |
| Success / Error | Polite/assertive status as appropriate |
| Icon-only variant | Discernible name required (History download icon) |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Export Button Viewed** | Control impressed (dedupe) | `auditId`, `tier`, `surface`, `state` |
| **Export Started** | Enabled click → loading | `auditId`, `tier` |
| **Export Completed** | Mock/real success | `auditId` |
| **Export Failed** | Error state | `auditId`, `reason` |
| **Upgrade Clicked** | Locked/Free click | `source: export_pdf`, `auditId` |

Align `pdf_downloaded` on real success (`ANALYTICS.md`).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop / Tablet | Label + icon per Figma |
| Mobile | Full-width or icon+label; ≥44px target |

Same component all breakpoints.

---

## 10. Reuse

| Rule | Spec |
|------|------|
| One button | Report / Compare / Shared / History |
| No forks | Free Locked vs Pro Enabled via props only |
| PDF template | Export action is web UI; PDF *content* is separate template |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Phase | **Mock functionality only** — progress then fake success/toast |
| Backend | **No integration** this phase; later `GET /audits/{id}/report/pdf` signed URL |
| Accessibility of PDF file | Tagged PDF when real export ships (`ACCESSIBILITY.md`) |
| PDF_FAILED | Report remains; button Error + retry (`SCREEN_MAPPING` taxonomy) |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Label “Export PDF” + download icon + tooltip  
□ Guest hidden · Free locked→Upgrade · Pro/Business enabled  
□ States: default, hover, focus, pressed, loading, success, error, disabled, locked  
□ Mock progress; no backend  
□ Keyboard + SR label + visible focus · WCAG 2.2 AA  
□ Analytics: viewed, started, completed, failed, upgrade  
□ Reusable on report / compare / shared  
□ Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Real PDF renderer this phase |
| Emailing the PDF |
| Charging credits for PDF |
| Showing Export to Guests |

---

**End of COMPONENT / COMPONENT_EXPORT_PDF_BUTTON.md**
