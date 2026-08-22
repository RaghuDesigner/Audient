# SCREEN-003 — Guest Home Upload Failure

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-003 (state of Guest Home / SCREEN-001)  
**Screen name:** Guest Home Upload Failure  
**Parent:** `docs/HOME_SCREEN.md` (SCREEN-001 — Guest Landing)  
**Sibling states:** `docs/screens/home_upload_success.md`  
**Figma:** Guest Home upload-failed / invalid-URL frames (typically `Screen1` failure chip variants)  
**Priority:** P0  

**Format:** Product specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `docs/SCREEN_MAPPING.md` currently uses **SCREEN-003** for the SSO Login Modal. This document defines the **upload/URL failure state** of Guest Home. Prefer treating this as a **state of SCREEN-001** in implementation; consolidate numbering in SCREEN_MAPPING later. Do not invent a separate route for this state.

**Related:** `docs/HOME_SCREEN.md` · `docs/screens/home_upload_success.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md`

---

## Purpose

Handle **all upload and URL validation failures** on Guest Home.

| Principle | Spec |
|-----------|------|
| Never crash | Failures are handled UI states — no uncaught fatal UI |
| Never clear user input unexpectedly | Keep filename, partial selection, or URL text where still useful for retry/edit |
| Actionable errors | Every failure shows a clear message and recovery actions |

This is **not** a new page — only the upload / URL area reflects the error design (plus inline message). Header, hero, and overall Home layout stay identical to Figma / SCREEN-001.

---

## Source of Truth

| Rule | Spec |
|------|------|
| Layout | Entire Home Screen identical except the failing input region |
| Visual | Match Figma failure chips / error card exactly |
| No redesign | Do not invent new error layouts, toast-only-only flows, or extra sections |
| XOR | Image and URL remain mutually exclusive; a failure on one path does not invent a second source |

---

## Trigger

Validation or upload fails after the user:

- Selects / drops an image, **or**
- Enters / submits a website URL, **or**
- Loses network / times out during upload

Success UI (`home_upload_success.md`) must **not** show while this failure state is active for that input.

---

## Failure Types

| Type | Typical cause |
|------|----------------|
| Unsupported file type | Not PNG / JPG / JPEG / WEBP |
| File too large | Exceeds **10 MB** |
| Corrupted image | Unreadable / invalid image bytes |
| Network interruption | Offline or connection dropped mid-upload |
| Upload timeout | Upload does not complete in time |
| Empty URL | URL required path with empty field |
| Invalid URL | Malformed or non-HTTPS (per Home HTTPS rule) |
| Private URL | Non-public / SSRF-blocked / unreachable private target (server or client gate) |
| Screenshot too small | Dimensions below product minimum (if enforced) |

Map each type to a user-facing message below. Prefer server reason codes when present; never expose stack traces.

---

## Error Design

Per Figma (failure chip / error treatment):

| Element | Spec |
|---------|------|
| Red border | Error container / input / chip |
| Error icon | Per Figma |
| Clear message | One primary message (see Messages) |
| Retry button | Re-attempt upload or re-validate |
| Remove button | Clear the failed file / dismiss error chip |

Do not rely on color alone — icon + text required.

**Analyze / GO** remains disabled while the active input is in a failure state.

---

## Messages

Use these product strings (or exact Figma on-canvas copy if it differs — then update this table):

| Message | Use when |
|---------|----------|
| **Unsupported file format.** | Unsupported file type |
| **Maximum file size exceeded.** | File too large (> 10 MB) |
| **Unable to upload image.** | Corrupted image, generic upload failure |
| **Please try again.** | Network interruption, upload timeout (alone or as secondary line) |
| **Invalid website URL.** | Empty URL (submit), invalid URL |
| **Website cannot be reached.** | Private URL, unreachable / blocked target |

| Failure type | Primary message |
|--------------|-----------------|
| Unsupported file type | Unsupported file format. |
| File too large | Maximum file size exceeded. |
| Corrupted image | Unable to upload image. |
| Network interruption | Unable to upload image. / Please try again. |
| Upload timeout | Unable to upload image. / Please try again. |
| Empty URL | Invalid website URL. |
| Invalid URL | Invalid website URL. |
| Private URL | Website cannot be reached. |
| Screenshot too small | Unable to upload image. (or Figma-specific copy if provided) |

Secondary line **Please try again.** may combine with upload failures when Figma shows two lines.

---

## Recovery

| Action | Spec |
|--------|------|
| **Retry** | Re-run upload or URL validation with the same input when still available |
| **Replace File** | Open file picker; selecting a valid file exits failure → success or idle |
| **Remove File** | Clear failed image (and error UI); return toward empty upload state |
| **Cancel** | Dismiss failure treatment / cancel in-flight retry without navigating away; preserve Home |

For URL failures: prefer **edit-in-place** (keep URL text) + clear error on change; Remove clears the field. Do not wipe a typed URL on a soft validation error unless the user chooses Remove/Cancel that clears it.

---

## Behaviour Rules

| Rule | Spec |
|------|------|
| Stability | Never crash the page or blank the whole Home |
| Input retention | On validation error, keep the user’s URL text; on file type/size reject, keep enough context to Replace/Remove (filename may show in error chip per Figma) |
| No surprise clear | Do not auto-clear a valid other field; XOR still clears the opposite source only when user commits a new source |
| No navigation | Failure never navigates to Processing |
| Escape hatch | User can always Remove / Cancel back to idle Home input |

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| ARIA alerts | Error message in `role="alert"` / assertive live region (or `aria-invalid` + `aria-describedby` for URL field) |
| Focus | Focus moves to the error message or first recovery control when failure appears |
| Screen reader | Announce the error message; name Retry / Remove / Replace |
| Keyboard | All recovery actions operable; focus visible |
| Color | Not the only error cue |
| Standard | **WCAG 2.2 AA** |

---

## Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Match Figma failure treatment |
| Tablet | Same hierarchy; only input area shows error UI |
| Mobile | Same messages and recovery actions; large enough tap targets — no new IA |

---

## Analytics

| Event | Trigger |
|-------|---------|
| `upload_failed` | Image upload/validation fails (include `reason`) |
| `upload_retry` | User activates Retry (image path) |
| `upload_removed` | User removes failed file / clears via Remove |
| `validation_failed` | URL or client validation fails (include `reason`: empty, invalid, private, too_small, etc.) |

Align aliases with `ANALYTICS.md` (e.g. `screenshot_upload_failed`, `invalid_file`).

---

## Navigation

| Action | Destination |
|--------|-------------|
| Retry / Replace / Remove / Cancel | Stay on Guest Home |
| After successful recovery | Success state (`home_upload_success.md`) or idle Home |
| Never from this state alone | Processing Screen |

---

## Development Rules

| Rule | |
|------|--|
| Do not redesign | Match Figma failure chips |
| Do not crash | Catch and surface all listed failure types |
| Do not clear input unexpectedly | Follow Recovery / Behaviour Rules |
| Do not invent messages | Use Messages table / Figma |
| Pixel-perfect | Error border, icon, spacing per Figma |

---

## QA Checklist

□ Each failure type shows the mapped message  
□ Red border + error icon + text (not color-only)  
□ Retry / Replace / Remove / Cancel behave as specified  
□ URL text retained on invalid URL  
□ Page never crashes; Home chrome unchanged  
□ GO / Analyze disabled while failure active  
□ Focus moves to error; alert announced  
□ Analytics: upload_failed, upload_retry, upload_removed, validation_failed  
□ Desktop / tablet / mobile hierarchy preserved  
□ WCAG 2.2 AA  

---

## Developer Notes

1. Implement as a **state** of the shared audit entry control on Guest Home, paired with success/idle.  
2. Client checks (type, size, empty/invalid URL) before upload; server may still return private/unreachable — map to **Website cannot be reached.**  
3. Network / timeout: show **Unable to upload image.** + **Please try again.**; keep Retry enabled when online.  
4. Resolve SCREEN-003 ID collision with Login Modal in `SCREEN_MAPPING.md` when product renumbers.

---

**End of SCREEN-003 / home_upload_failure.md**
