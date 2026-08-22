# SCREEN-004 — Audit Completed

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-004 (product brief) · transition before **SCREEN-M02** (Audit Report / Results Dashboard)  
**Screen name:** Audit Completed  
**Prior screen:** Audit Processing (`docs/screens/SCREEN-002_AUDIT_PROCESSING.md` / SCREEN-M01)  
**Next screen:** Results Dashboard / Audit Report (SCREEN-M02)  
**Figma:** Completion / success frame when designed; until then reuse Processing / Home chrome — **do not invent a new app shell**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **State:** `AUDIT-STATE-012` (Audit Completed) → report ready (`RPT-STATE-*`) in `STATE_MANAGEMENT.md`.  
> **ID note:** `SCREEN_MAPPING.md` uses **SCREEN-004** for Logged-in Home (Free). This document is the **post-processing success transition**. Prefer a dedicated id (e.g. SCREEN-M01b / COMPLETED interstitial) when renumbering; do not confuse with Free Home.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/PRICING.md` · `docs/screens/SCREEN-002_AUDIT_PROCESSING.md` · `docs/screens/SCREEN-003_AUDIT_FAILED.md` · `docs/ANALYTICS.md`

---

## 1. Purpose

Display **successful completion** after the audit finishes processing and **before** opening the **Results Dashboard** (SCREEN-M02).

This screen is a **short transition**: celebrate success, preview the overall score, and offer immediate actions (open results, download PDF when allowed, start a new audit).

It is **not** the full report. Detailed findings live on Results / M02.

---

## 2. Layout

| Rule | Spec |
|------|------|
| Shell | **Reuse Processing Screen** layout (Home chrome: logo, tagline, credits, avatar; same content band) |
| Change | **Replace the processing animation** (active stage motion / indeterminate feel) with the **success state** |
| Progress | Show **100%** on the circular progress (completed ring) — monotonic end state from Processing |
| Hide | Stage ETA / tips carousel (or freeze to a success tip only if Figma shows it — default: hide tips) |
| Do not | Redesign header/hero; do not embed the full Results Dashboard here |

---

## 3. Entry / Exit

### 3.1 Entry

```text
Audit Processing
        │
        ▼ (terminal COMPLETED + report available or imminent)
Audit Completed (this screen)
```

| Prerequisite | Spec |
|--------------|------|
| Audit status | `COMPLETED` (`AUDIT-STATE-012`) |
| Score | Overall UX score available for preview (from report payload or status payload) |
| Failure | Never show this screen for FAILED — use Audit Failed (SCREEN-003 / M03) |

Fire **`audit_completed`** when this success UI is shown (include `score`, `durationSec`, `auditId` per `ANALYTICS.md`).

### 3.2 Auto-navigation (transition)

| Rule | Spec |
|------|------|
| Dwell | Screen **remains visible for 2–3 seconds**, then navigates to Results Dashboard |
| Default destination | **Open Results** path → SCREEN-M02 |
| Interrupt | User click on **Open Results** navigates immediately (cancel timer) |
| Interrupt | User click on **Download PDF** / **New Audit** cancels auto-navigate and follows that action |
| Interrupt | Keyboard focus moving into actions **pauses** the auto-advance timer (a11y — avoid yanking focus mid-interaction) |
| Reduced motion | Still show success content; may shorten flourish; **do not** rely on animation alone; auto-nav timing may stay 2–3s or use instant option — status text must announce completion |
| Skip | Do not skip this screen entirely in v1 unless product later opts for Processing → M02 direct; this brief requires the interstitial |

### 3.3 Exit

| Action | Destination |
|--------|-------------|
| Auto-nav / **Open Results** | Results Dashboard (M02) |
| **Download PDF** | Signed PDF download when allowed; else Upgrade / gate (stay or open Upgrade Dialog) |
| **New Audit** | Home — clear completion interstitial; ready for new input |

---

## 4. Components

| Component | Role |
|-----------|------|
| **Success Illustration** | Replaces processing illustration / animation |
| **Completion Checkmark** | Clear success cue (not color-only) |
| **Success Message** | Friendly completion copy (e.g. audit ready / analysis complete — match Figma) |
| **Audit Score Preview** | Overall UX score (0–100) as **text** + optional decorative gauge |
| **Open Results** | Primary CTA → Results Dashboard |
| **Download PDF** | Secondary — tier-gated |
| **New Audit** | Secondary → Home for another run |
| **Progress** | **100%** completed circular indicator |

---

## 5. Progress

| Rule | Spec |
|------|------|
| Value | **100%** |
| Behaviour | Final monotonic value from Processing; never decrease |
| Semantics | `role="progressbar"` with `aria-valuenow="100"`, valuetext indicating complete |

---

## 6. Audit Score Preview

| Rule | Spec |
|------|------|
| Content | Overall UX score prominently |
| A11y | Numeric text required (e.g. “UX score 72 out of 100”); gauge decorative if present (`ACCESSIBILITY.md`) |
| Missing score | If score briefly unavailable, show success without fake number; navigate when score ready or show “—” only if Figma allows — prefer wait until score present before entering this screen |
| Tier | Preview score is allowed for Guest/Free/Pro; depth of Results still tier-gated on M02 |

---

## 7. Actions

### 7.1 Open Results

| Aspect | Spec |
|--------|------|
| Role | Primary |
| Effect | Cancel dwell timer → navigate to Results Dashboard (M02) |
| Analytics | `open_results` (then `report_viewed` on M02) |

### 7.2 Download PDF

| Aspect | Spec |
|--------|------|
| Pro / Business | Enabled when `hasPdf` (or PDF ready); fetch signed URL |
| Guest / Free | **Gated** — disabled with explanation **or** opens Upgrade Dialog (M08); never silent failure (`ACCESSIBILITY.md` / permission matrix) |
| PDF still generating | Busy/disabled with “Preparing PDF…”; do not error as audit failure |
| PDF failed | Soft error / retry PDF; report still openable (`PDF_FAILED` taxonomy — report intact) |
| Analytics | `download_pdf` on successful initiate/download (align `pdf_downloaded`) |

### 7.3 New Audit

| Aspect | Spec |
|--------|------|
| Effect | Cancel dwell → Home idle / empty audit entry |
| Analytics | `new_audit` |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| **ARIA Live** | Polite (or status) announcement on entry: success message + score (e.g. “Audit complete. Score 72 out of 100.”) |
| Focus | Move focus to success heading or **Open Results** |
| Keyboard | All CTAs operable; Tab order: Open Results → Download PDF → New Audit (logical) |
| Auto-advance | Pause when user focuses controls; announce before navigation if possible |
| Reduced motion | No essential info only in motion/checkmark animation (`ACCESSIBILITY.md`) |
| Standard | **WCAG 2.2 AA** |

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| `audit_completed` | Completion screen shown / audit reaches COMPLETED (dedupe with Processing terminal if already fired — **fire once** per audit) |
| `open_results` | Open Results activated (or auto-nav equivalent with `source: auto`) |
| `download_pdf` | PDF download action (success path; align `pdf_downloaded`) |
| `new_audit` | New Audit activated |

Deduping: If Processing already emitted `audit_completed` / `processing_completed`, do not double-count activation KPIs — one canonical `audit_completed` per audit id.

---

## 10. Developer Notes

| Rule | Spec |
|------|------|
| Role | **Transition** between Processing and Results — not the report itself |
| Dwell | **2–3 seconds** then auto-navigate to Results unless interrupted |
| Layout | Same shell as Processing; swap processing animation → success state at 100% |
| Data | Needs `auditId`, overall score, tier, `hasPdf` / pdfStatus |
| Tier gates | Enforce PDF server-side; UI mirrors Guest/Free vs Pro/Business |
| Phase 1 | Mock COMPLETED + sample score + timer → Results stub |
| Phase 2 | Enter when status poll/realtime reports COMPLETED and score available |

**Do not generate implementation code in this document.**

---

## 11. States

| State | Behaviour |
|-------|-----------|
| Success default | Illustration, checkmark, message, score, 100%, CTAs; dwell timer running |
| Timer paused | User focused/interacted with actions |
| PDF gated | Download PDF disabled or upgrade path |
| PDF preparing | Download busy |
| Navigating | Transition to M02 |
| Left via New Audit | Home |

---

## 12. Navigation Summary

```text
Processing (COMPLETED)
        ↓
Audit Completed (SCREEN-004)  ←── visible 2–3s
        ├─ (auto) / Open Results → Results Dashboard (M02)
        ├─ Download PDF → file / upgrade gate
        └─ New Audit → Home
```

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop / Tablet / Mobile | Same Processing band hierarchy; score and CTAs readable; stack actions per Figma |

---

## 14. QA Checklist

□ Reuses Processing layout; animation → success at 100%  
□ Checkmark, success message, score preview present  
□ Auto-navigates to Results in 2–3s  
□ Open Results immediate; pauses/cancels timer  
□ Focus on actions pauses auto-nav  
□ PDF gated correctly for Guest/Free; works for Pro when ready  
□ New Audit → Home  
□ ARIA live announces completion + score  
□ Keyboard + WCAG 2.2 AA  
□ Analytics once per audit: audit_completed; open_results; download_pdf; new_audit  
□ Never shown for FAILED audits  

---

## 15. Non-goals

| Out of scope on this screen |
|-----------------------------|
| Full strengths / weaknesses / recommendations list |
| Category score breakdown (belongs on Results / M02) |
| Audit Failed recovery CTAs |
| Redesign of Home chrome |

---

**End of SCREEN-004 / SCREEN-004_AUDIT_COMPLETED.md**
