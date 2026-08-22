# SCREEN-002 — Guest Home Upload Success

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-002 (state of Guest Home / SCREEN-001)  
**Screen name:** Guest Home Upload Success  
**Parent:** `docs/HOME_SCREEN.md` (SCREEN-001 — Guest Landing)  
**Figma:** Guest Home upload-success / URL-validated frames (match approved Figma; typically `Screen1` success variants)  
**Priority:** P0  

**Format:** Product specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `docs/SCREEN_MAPPING.md` currently uses **SCREEN-002** for the Guest Profile Dropdown. This document defines the **upload/URL success state** of Guest Home. Prefer treating this as a **state of SCREEN-001** in implementation; rename IDs in SCREEN_MAPPING when product consolidates numbering. Do not invent a separate route for this state.

**Related:** `docs/HOME_SCREEN.md` · `docs/components/PROFILE_DROPDOWN_GUEST.md` · `docs/components/LOGIN_MODAL.md` · `docs/SCREEN_MAPPING.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md`

---

## Purpose

Define the **successful upload / validated-input state** of the Guest Home Screen.

The user provides either:

- **Website Screenshot**, **or**
- **Website URL**

After successful validation, the application prepares the audit request before navigating to the **Processing Screen**.

This is **not** a new page and **not** a new marketing section — only the input area of Home changes.

---

## Source of Truth

| Rule | Spec |
|------|------|
| Layout | Entire Home Screen remains identical to Figma / SCREEN-001 |
| What changes | **Only the Upload Area** (and related success messaging / CTAs as shown in Figma) |
| No redesign | Do not alter header, hero, spacing, typography, or colors outside the success input region |
| XOR | Still only **one** input source (image **or** URL), per `HOME_SCREEN.md` |

---

## Trigger

| Path | Condition |
|------|-----------|
| Image | User uploads a **supported** image |
| URL | User enters a **valid** website URL (HTTPS per Home rules) |
| Shared | **Validation passes** |

On failure, remain on default/error Home states — this SCREEN-002 success UI does **not** apply.

---

## Layout

| Rule | Spec |
|------|------|
| Home chrome | Unchanged (logo, tagline, credits, avatar, hero copy) |
| Upload area | Swaps to success presentation below |
| Do not add | New sections, cards, or marketing blocks |

---

## Upload Card

### Image success

Replace the empty upload control with:

| Element | Spec |
|---------|------|
| Thumbnail preview | ✓ success indicator + image thumbnail per Figma |
| Filename | Display selected file name |
| Image size | Display file size |
| Remove Button | Clears selection; returns to empty upload state |
| Replace Button | Opens file picker to choose another image (or equivalent replace flow) |

### URL success

If a URL was entered and validated, replace the URL input with:

| Element | Spec |
|---------|------|
| Validated URL | ✔ Website URL (display the validated URL) |
| Edit | Returns to editable URL input with current value |
| Remove | Clears URL; returns to empty URL / default Home input state |

Image and URL success UIs are **mutually exclusive** (XOR). Showing one must clear the other.

---

## Success Message

| Source | Copy |
|--------|------|
| Image | **Image uploaded successfully.** |
| | **Ready to analyze.** |
| URL | **Website validated successfully.** |
| | **Ready for AI Audit.** |

Use exact Figma wording if on-canvas copy differs; then update this table.

Announce success to assistive tech via a polite live region when the state appears.

---

## CTA

| Role | Label | Behaviour |
|------|-------|-----------|
| **Primary** | Analyze Website | Starts audit preparation → **Processing Screen** when allowed |
| **Secondary** | Upload Different File | Returns to empty upload / file picker (image path). For URL-only success, prefer **Edit** / **Remove** on the URL row unless Figma also shows this secondary CTA |

Primary may map to the same visual control as Home **GO** if Figma uses that label in success state — **match Figma**. If Figma shows **Analyze Website**, use that label.

### Guest gates (unchanged product rules)

| Case | On Analyze Website |
|------|---------------------|
| Guest screenshot allowed | Proceed → Processing Screen |
| Guest credits / quota exhausted | Open **Upgrade Dialog** (do not navigate to Processing) |
| Authentication required (e.g. guest URL) | Open **Login Modal**; do not start URL audit as guest |
| Valid + allowed | Navigate to Processing Screen |

---

## Validation

| Rule | Spec |
|------|------|
| Image formats | **PNG**, **JPG**, **JPEG**, **WEBP** |
| Maximum size | **10 MB** |
| URL | Valid **HTTPS** only (per Home) |
| XOR | Cannot hold image and URL success states at once |
| Server | Final audit create / SSRF checks remain server-authoritative |

Invalid inputs never enter this success state.

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| Keyboard accessible | Thumbnail region, Remove, Replace, Edit, Analyze Website, Upload Different File |
| ARIA labels | Controls named (e.g. Remove image, Replace image, Edit website URL, Analyze Website) |
| Focus visible | Required on all interactive controls |
| Announcements | Success messages announced (polite live region) when upload/URL validates |
| Standard | **WCAG 2.2 AA** |

On entering success state, move focus to a sensible control (primary CTA or success status) without stranding keyboard users in a removed upload button.

---

## Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Match Figma success frame |
| Tablet | Same hierarchy; only upload area differs from default Home |
| Mobile | Same hierarchy; stack preview / URL row / CTAs per Figma — no new IA |

---

## Analytics

| Event | Trigger |
|-------|---------|
| `upload_success` | Image upload validates and success UI shown (and/or URL validated — use property `source: image \| url` if one event) |
| `upload_replaced` | User replaces image (Replace / Upload Different File that selects a new file) |
| `upload_removed` | User removes image or clears URL |
| `audit_started` | User activates **Analyze Website** and audit start is accepted (before/at navigate to Processing) |

Align aliases with `ANALYTICS.md` if names differ (`go_clicked`, etc.).

---

## Navigation

| Action | Destination |
|--------|-------------|
| **Analyze Website** (allowed) | **Processing Screen** |
| Remove / Upload Different File / Edit | Stay on Guest Home; return to editable or empty input state |
| Auth / upgrade gates | Login Modal or Upgrade Dialog — **no** Processing until allowed |

```text
Analyze Website
        ↓
Processing Screen
```

---

## States (summary)

| State | Behaviour |
|-------|-----------|
| Image success | Thumbnail + meta + Remove/Replace + image success copy + CTAs |
| URL success | ✔ URL + Edit/Remove + URL success copy + primary Analyze (per Figma) |
| Replacing | File picker / edit URL; may briefly leave success UI |
| Cleared | Back to SCREEN-001 default empty upload + URL |
| Analyze loading | Primary busy; prevent double submit |
| Gated | Modal/dialog instead of Processing |

---

## Development Rules

| Rule | |
|------|--|
| Do not redesign Home outside the upload area | |
| Do not add new page sections | |
| Do not change typography/spacing of unchanged regions | |
| Pixel-perfect to Figma success frames | |
| Preserve XOR and guest gates from `HOME_SCREEN.md` | |

---

## QA Checklist

□ Home chrome/hero unchanged vs default Guest Home  
□ Only upload area reflects success UI  
□ Image: thumbnail, filename, size, Remove, Replace  
□ URL: ✔ URL, Edit, Remove  
□ Success copy matches image vs URL messages  
□ Primary Analyze Website → Processing when allowed  
□ Secondary Upload Different File / Remove restores editable empty state  
□ Formats + 10 MB enforced before success UI  
□ XOR enforced  
□ Guest URL / exhausted credits gate correctly  
□ Live region announces success  
□ Keyboard + focus visible + WCAG 2.2 AA  
□ Analytics: upload_success, upload_replaced, upload_removed, audit_started  

---

## Developer Notes

1. Implement as a **state** of the shared audit entry control on Guest Home, not a separate route.  
2. Preparing the audit request (sign upload, create audit) happens on **Analyze Website**, then navigate to Processing — do not navigate on file select alone.  
3. If Figma still shows **GO** instead of **Analyze Website**, match Figma and keep analytics as `audit_started` / `go_clicked` with a clear mapping.  
4. Resolve SCREEN-002 ID collision with Guest Profile Dropdown in `SCREEN_MAPPING.md` when product renumbers.

---

**End of SCREEN-002 / home_upload_success.md**
