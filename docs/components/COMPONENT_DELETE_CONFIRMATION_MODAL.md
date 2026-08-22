# COMPONENT — Delete Confirmation Modal

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-026 (Delete Confirmation Modal)  
**Component name:** Delete Confirmation Modal (`DeleteConfirmationModal`)  
**Maps to:** Confirm Dialog pattern (`ConfirmDialog` in `COMPONENT_MAPPING.md`) — destructive variant  
**Primary use:** Audit History — delete audit (`COMPONENT_AUDIT_HISTORY_CARD` / `SCREEN-009_AUDIT_HISTORY`)  
**Figma:** Confirm / delete dialog when designed — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Dialog primitives in `COMPONENT_MAPPING.md`.

**Related:** `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_AUDIT_HISTORY_CARD.md` · `docs/COMPONENT_MAPPING.md` (Confirm Dialog) · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `STATE_MANAGEMENT.md` (no credit refund on delete)

---

## 1. Purpose

Confirms before **permanently deleting an audit**.

Prevents accidental loss of reports/history. Deletion is irreversible from the user’s perspective; **credits are not refunded** on delete.

**Reusable** for other destructive confirms (e.g. delete account later) by swapping title/description/confirm label — same modal chrome. Default copy below is for **audit** delete.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Title** | **Delete Audit?** |
| **Description** | **This action cannot be undone.** |
| Optional context | Website name / audit date in description or subtitle if Figma shows it (helps confirm the right item) |
| Overlay | Dimmed backdrop; blocks page interaction |

### Buttons

| Button | Spec |
|--------|------|
| **Cancel** | Safe action — closes modal without deleting |
| **Delete Audit** | Destructive primary — confirms deletion |

Focus default: **Cancel** (safest) unless Figma specifies otherwise (`COMPONENT_MAPPING` Confirm Dialog guidance).

---

## 3. Behaviour

| Action | Spec |
|--------|------|
| Open | From History card Delete (or equivalent) — pass `auditId` (+ label) |
| **Cancel** | Close modal; no API delete; focus returns to opener |
| **Delete Audit** | Enter **Deleting** → call delete → **Success** (close + refresh list) or **Error** (stay open with message) |
| Backdrop click | Same as Cancel (unless Figma disables dismiss while Deleting) |
| **Esc** | Closes modal when not Deleting (same as Cancel) |
| While Deleting | Block Cancel/Esc/backdrop dismiss to avoid orphaned requests — or allow Cancel only if API supports abort |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Title, description, Cancel + Delete Audit enabled |
| **Deleting** | Delete Audit `aria-busy` / loading label (e.g. “Deleting…”); Cancel disabled or hidden per Figma; trap remains |
| **Success** | Brief success optional — typically close immediately and toast “Audit deleted”; parent removes row |
| **Error** | Inline/alert error (“Couldn’t delete audit. Try again.”); Delete Audit re-enabled for retry; modal stays open |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `open` | boolean | Yes | Visibility |
| `auditId` | string | Yes | Target audit |
| `auditLabel` | string \| null | Recommended | Website name for context |
| `state` | `default` \| `deleting` \| `success` \| `error` | Yes | |
| `errorMessage` | string \| null | Error | User-facing error |
| `onCancel` | action | Yes | Cancel / dismiss |
| `onConfirm` | action | Yes | Confirm delete |
| `title` | string | No | Default “Delete Audit?” |
| `description` | string | No | Default “This action cannot be undone.” |
| `confirmLabel` | string | No | Default “Delete Audit” |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Dialog | `role="dialog"`, `aria-modal="true"`, labelled by title, described by description |
| **Focus trap** | Keyboard focus trapped while open |
| Initial focus | Cancel (safe) or title — per a11y guidance |
| **Esc** | Closes when allowed (not mid-delete if dismiss blocked) |
| Focus restore | Return to Delete trigger on History card |
| Buttons | Distinct names; destructive confirm not color-only |
| Error | `role="alert"` |
| Backdrop | Not a second tab stop inside trap |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Delete Started** | Modal opens (user intent to delete) | `auditId` |
| **Delete Cancelled** | Cancel, Esc, or backdrop dismiss | `auditId` |
| **Delete Confirmed** | User activates Delete Audit (request started) | `auditId` |

Optional: `delete_succeeded` / `delete_failed` after API — align with History **Audit Deleted** on success (`ANALYTICS.md`).

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered modal, constrained width |
| **Tablet** | Same |
| **Mobile** | Near full-width dialog with safe-area; stacked buttons if Figma stacks; large tap targets |

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Audit History | Primary |
| Dashboard recent | If delete offered later |
| Other destructive confirms | Same shell; different copy via props |

One modal instance globally preferred (open with payload).

---

## 10. Security

| Rule | Spec |
|------|------|
| Ownership | Delete only if audit belongs to current user (server 404 otherwise) |
| Auth | Required |
| Irreversible | No credit refund; PDF/report removed with audit |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Compose | shadcn/Radix Dialog + destructive Button |
| Phase 1 | Mock confirm → remove from mock list |
| Phase 2 | `DELETE /audits/{id}` (or equivalent); refresh History |
| Pair | Opened only from explicit Delete — never auto-open |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Title “Delete Audit?” · Description “This action cannot be undone.”  
□ Cancel and Delete Audit  
□ Default / Deleting / Success (close) / Error (retry)  
□ Focus trap; Esc cancels when allowed; focus restore  
□ No delete on Cancel/Esc  
□ Analytics: Started, Cancelled, Confirmed  
□ Desktop / tablet / mobile  
□ Reusable; WCAG 2.2 AA; Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Soft-delete restore UI |
| Bulk delete |
| Credit refund on delete |
| Account deletion flow (separate confirm copy) |

---

**End of COMPONENT / COMPONENT_DELETE_CONFIRMATION_MODAL.md**
