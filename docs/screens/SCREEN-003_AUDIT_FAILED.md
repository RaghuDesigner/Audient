# SCREEN-003 — Audit Failed

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-003 (product brief) · **SCREEN-M03** (canonical in `SCREEN_MAPPING.md`)  
**Screen name:** Audit Failed  
**Prior screen:** Audit Processing (`docs/screens/SCREEN-002_AUDIT_PROCESSING.md` / SCREEN-M01)  
**Figma:** Audit failure frame when designed; until then reuse Processing / Home chrome — **do not invent a new app shell**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **Failure taxonomy authority:** `docs/SCREEN_MAPPING.md` § Audit Failure Taxonomy · `docs/ERROR_HANDLING.md` (ERR-AUDIT-*) · refund rules in PRD / BUSINESS_RULES.  
> **State:** `AUDIT-STATE-013` in repo-root `STATE_MANAGEMENT.md`.  
> **ID note:** Other drafts used SCREEN-003 for Login Modal / Home upload failure. In `SCREEN_MAPPING.md`, audit failure is **SCREEN-M03**. One reusable failure surface; renumber later if needed.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/screens/SCREEN-002_AUDIT_PROCESSING.md` · `docs/ANALYTICS.md`

---

## 1. Purpose

Display a **friendly recovery screen** when the audit **cannot complete**.

The user should understand what went wrong, whether credits were refunded (when applicable), and what to do next — without crashing, blank screens, or technical stack traces in the primary UI.

This screen is the terminal **FAILED** outcome of Audit Processing (and may also be deep-linked from History for a failed audit).

---

## 2. Layout

| Rule | Spec |
|------|------|
| Shell | **Reuse Processing Screen layout** (same Home chrome: logo, tagline, credits, avatar; same content band) |
| Change | **Replace the progress indicator** (circular progress, %, stage, ETA) **with the failure illustration / failure content** |
| Keep | Processing illustration slot may become failure art; tips carousel **hidden** on failure (failure content takes priority) |
| Do not | Redesign header/hero; do not invent a separate dashboard shell |

---

## 3. Entry / Exit

### 3.1 Entry

```text
Audit Processing
        │
        ▼ (terminal FAILED / unrecoverable worker error)
Audit Failed (this screen)
```

Also enter when opening a failed audit from History (same component, audit id + error code).

Fire **`audit_failed`** when the failure UI is shown (include `reason` / taxonomy code).

### 3.2 Exit

| Action | Destination |
|--------|-------------|
| **Retry** | New audit attempt (Idempotency-Key) → Processing, or Home with prior input restored when retry needs re-submit |
| **Upload Different File** | Home — empty / file-picker ready (clear failed screenshot intent) |
| **Contact Support** | Support channel (mailto / help URL / in-app support) with correlation id |
| **View Error Details** | Expand inline details panel (or accessible disclosure) — stay on screen |

---

## 4. Components

| Component | Role |
|-----------|------|
| **Failure icon** | Visual error cue (not color-only) |
| **Title** | Short failure title (mapped per failure type) |
| **Description** | Friendly, actionable explanation |
| **Retry button** | Primary recovery when retry is allowed |
| **Upload Different File** | Secondary — return to Home to choose another screenshot |
| **Contact Support** | Escalation path (especially unknown / persistent errors) |
| **View Error Details** | Disclosure for code, correlation id, optional technical message |

**Optional (taxonomy-driven, do not invent layout sections):** “Credits refunded” confirmation when refund-eligible per SCREEN_MAPPING / ERROR_HANDLING.

---

## 5. Possible Failures (product → taxonomy)

Map each product failure to a stable code. UI is **one reusable template** parameterized by `code`, title, description, retryAllowed, refundEligible.

| Product failure | Taxonomy code(s) | Title (example) | Description (example) | Retry | Refund* |
|-----------------|------------------|-----------------|----------------------|-------|---------|
| Unsupported website | `SSRF_BLOCKED`, `AUTH_REQUIRED`, related URL rejects | Unsupported website / Blocked address | This address isn’t allowed, or we can’t audit this page type. Try a public homepage. | Per code | Per taxonomy |
| Timeout | `CRAWL_TIMEOUT` | Scan timed out | The audit took too long and stopped. Try again or use a simpler page / screenshot. | Yes | Yes |
| Website blocked | `SITE_BLOCKS_BOT` | Access blocked | The site blocked automated access. Try uploading a screenshot instead. | Yes | Yes |
| Network error | `URL_UNREACHABLE` / offline class | Site unreachable / Connection problem | We couldn’t reach this site. Check the URL or your connection, then retry. | Yes | Yes (if charged) |
| AI unavailable | `AI_UNAVAILABLE` | AI temporarily unavailable | Our AI is temporarily unavailable. Please try again shortly. | Yes | Yes |
| Screenshot unreadable | `SCREENSHOT_INVALID` | Screenshot unreadable | We couldn’t read this image. Use a clear PNG, JPG, JPEG, or WEBP. | Yes | N/A / per policy |
| Large image | `SCREENSHOT_INVALID` / `PAGE_TOO_HEAVY` (as applicable) | Image too large / Page too large | Use an image under the size limit, or try a simpler page. | Yes | Per taxonomy |
| Unknown error | `INTERNAL_ERROR` | Something went wrong | An unexpected error occurred. Retry or contact support with the error details. | Yes | Yes |

\*Refund when the audit had reserved credits and the code is refund-eligible (`SCREEN_MAPPING` / PRD failed-audit auto-refund). Show confirmation copy when refund completed.

**Fallback:** Any unmapped server code → **Unknown error** template (`INTERNAL_ERROR`) so the screen stays reusable.

Exact on-canvas strings: prefer Figma when available; otherwise use taxonomy messages from `SCREEN_MAPPING.md`.

---

## 6. Behaviour by Action

### 6.1 Retry

| Rule | Spec |
|------|------|
| When shown | `retryAllowed === true` for the failure code |
| When hidden/disabled | e.g. hard SSRF block where retry with same URL is futile — still offer Upload Different File / change URL via Home |
| Effect | Start a **new** audit (new idempotency key); do not resurrect the failed job as COMPLETED |
| Analytics | `retry_clicked` |

### 6.2 Upload Different File

| Rule | Spec |
|------|------|
| Effect | Navigate to Home; clear failed file association; ready for new upload |
| Analytics | `upload_new` |

### 6.3 Contact Support

| Rule | Spec |
|------|------|
| Effect | Open support with prefilled context: audit id, error code, correlation id, timestamp |
| Analytics | `support_clicked` |

### 6.4 View Error Details

| Rule | Spec |
|------|------|
| Default | Collapsed |
| Contents | Error code, correlation / request id, optional safe developer message (no secrets) |
| A11y | `button` + `aria-expanded` disclosure pattern |

---

## 7. Credits / Refund Messaging

| Case | Spec |
|------|------|
| Refund eligible + applied | Show calm confirmation (e.g. credits returned) — not a second error |
| Not eligible / pre-charge | Omit refund line |
| Credit ledger error | Follow ERROR_HANDLING; may emphasize Contact Support |

Never claim a refund unless the ledger confirms it (or product policy guarantees auto-refund for that code).

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| **ARIA Alert** | Failure title/description in `role="alert"` / assertive live region on entry (`ACCESSIBILITY.md` — M03) |
| Focus | Move focus to failure **heading** or primary **Retry** (or first available recovery CTA) |
| Keyboard | All actions operable; View Error Details toggleable; focus visible |
| Not color-only | Icon + text |
| Standard | **WCAG 2.2 AA** |

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| `audit_failed` | Failure screen shown (`reason` / taxonomy code, `auditId`) |
| `retry_clicked` | Retry activated |
| `upload_new` | Upload Different File activated |
| `support_clicked` | Contact Support activated |

Optional: `error_details_expanded` — not required by this brief.

Align with SCREEN_MAPPING aliases (`audit_failed{…}`) via properties, not duplicate conflicting events.

---

## 10. Reusability (Developer Notes)

| Rule | Spec |
|------|------|
| Single surface | **One** Audit Failed view/component for **all** audit failures |
| Configuration | Driven by `{ auditId, code, title, description, retryAllowed, refundStatus, correlationId }` |
| No per-error screens | Do not ship separate routes/layouts per failure type |
| Layout parity | Same shell as Processing; swap progress → failure content |
| History | Reuse for failed rows in History |
| PDF-only failure | If report exists but PDF failed (`PDF_FAILED`), prefer report-centric recovery (Retry PDF) — may specialize CTAs via props without a new shell |
| Phase 1 | May show mock failure codes for UI QA |
| Phase 2 | Bind to terminal status from `GET /audits/{id}` / status poll |

**Do not generate implementation code in this document.**

---

## 11. States

| State | Behaviour |
|-------|-----------|
| Default failure | Icon + title + description + CTAs |
| Details expanded | Error details visible |
| Refund noted | Refund confirmation line visible |
| Retry loading | Retry `aria-busy`; prevent double submit |
| Retry not allowed | Retry hidden or disabled with explanation in description |
| Offline | Banner per ERROR_HANDLING; Retry may wait until online |

---

## 12. Navigation Summary

```text
Processing (FAILED)
        ↓
Audit Failed (SCREEN-003 / M03)
        ├─ Retry → Processing (new attempt)
        ├─ Upload Different File → Home
        ├─ Contact Support → support channel
        └─ View Error Details → expand (stay)
```

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop / Tablet / Mobile | Same components and hierarchy as Processing band; stack CTAs per Figma; large tap targets |

---

## 14. QA Checklist

□ Reuses Processing / Home layout; progress replaced by failure UI  
□ Each product failure type maps to title/description/CTAs  
□ Unknown/unmapped codes use Unknown error fallback  
□ Retry / Upload Different File / Contact Support / View Error Details work  
□ Refund line only when eligible  
□ ARIA alert + focus to heading/Retry  
□ Keyboard + WCAG 2.2 AA  
□ Analytics: audit_failed, retry_clicked, upload_new, support_clicked  
□ Reusable from Processing and History  
□ Never crashes; no stack trace in primary UI  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Full report content |
| Login Modal / Upgrade Dialog (pre-Processing gates) |
| Home upload validation chips (those are Home failure state, not M03) |
| Redesign of Processing chrome |

---

**End of SCREEN-003 / SCREEN-003_AUDIT_FAILED.md**
