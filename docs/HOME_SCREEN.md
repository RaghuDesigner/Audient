# SCREEN-001 — Home Screen (Guest Landing Page)

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-001  
**Screen name:** Home Screen (Guest Landing Page)  
**Figma:** `Screens/Screen1.png` (and guest menu / upload chip states as provided)  
**Priority:** P0  

**Format:** Product specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/SCREEN_MAPPING.md` · `docs/DESIGN_TOKENS.md` · `docs/COMPONENT_MAPPING.md` · `docs/COMPONENT_BEHAVIOR.md` · `docs/LOGIN_MODAL.md` · `docs/ACCESSIBILITY.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/PRICING.md` · `BUSINESS_RULES.md` · `docs/MISSING_SCREENS_PLAN.md` (Upgrade Dialog M08)

---

## Purpose

This is the **public landing page** of Audient.

It is the **first screen every visitor sees**.

Users can use the application as a **guest** without logging in.

**Authentication is NOT displayed on this screen.**

Auth is handled only by the reusable **Login Modal** (`LOGIN_MODAL.md` / MDL-001) when a gated action or Avatar → Login requires it.

The page must **exactly match the approved Figma design**.

**Cursor / implementers must never redesign layouts or spacing.**

---

## Source of Truth

| Rule | Spec |
|------|------|
| Source | **Figma design** (`Screen1` and related states) |
| Visual match | Implementation must visually match the Figma screen |
| No creative interpretation | — |
| No UI redesign | — |
| No spacing changes | — |
| No typography changes | — |
| No color changes | Use existing design tokens that match Figma (`DESIGN_TOKENS.md`) — do not invent new values |

If Figma and older docs conflict on **layout/visuals**, **Figma wins**.  
If Figma and adopted product rules conflict on **prices/credits**, **`PRICING.md`** wins for copy numbers (e.g. guest teaser / Free 300) while **layout stays Figma**.

---

## User Type

| Type | On this screen |
|------|----------------|
| **Guest** | Default visitor experience (SCREEN-001) |
| **Authenticated user** | Same visual Home pattern may adapt to Free/Pro chrome (SCREEN-004 / SCREEN-009) — **do not redesign**; apply tier gates only. Auth chrome (OAuth) still never inlined on the page. |

---

## Goal

Allow users to:

- **Upload screenshots**, **or**
- **Paste a website URL**

…and start a UX Audit (subject to guest / tier rules below).

---

## Header

### Left

| Element | Spec |
|---------|------|
| **Audient Logo** | Per Figma |
| **Tagline** | Per Figma (e.g. AUDIT · ANALYZE · ELEVATE UX) |

### Right

| Element | Spec |
|---------|------|
| **Credits** | Guest teaser display per product rules / Figma placement; server-authoritative |
| **Profile Avatar** | Guest: gray avatar per Figma |

**Guest users clicking avatar** → opens **Guest Profile Dropdown** (`docs/components/PROFILE_DROPDOWN_GUEST.md` / COMPONENT-001). **Login** in that menu opens the **Login Modal** (not an inline auth panel).

---

## Hero Section

| Element | Copy (exact) |
|---------|----------------|
| **Heading** | Turn Your Website Into a Better User Experience |
| **Subheading** | Our AI analyzes your website like an experienced UX consultant and provides prioritized recommendations to improve usability, accessibility, trust, and conversions. |

Layout, type size, and spacing: **as Figma** — no changes.

---

## Upload Section

| Aspect | Spec |
|--------|------|
| Presentation | **Centered upload card** per Figma |
| Formats | **PNG**, **JPG**, **JPEG**, **WEBP** |
| Maximum file size | **10 MB** |
| Drag & drop | Enabled |
| Click to upload | Enabled |
| Success / failure | Inline chips per Figma (e.g. uploaded / failed) — no redesign |

---

## URL Section

| Aspect | Spec |
|--------|------|
| Control | **Single URL input** |
| Placeholder | Paste your website link here |
| Button | **GO** |
| GO enabled | Only when **valid input** exists (see Validations) |
| GO disabled | Until valid input; styling per Figma (e.g. gray/disabled tint) |

---

## Validations

| Rule | Spec |
|------|------|
| **Single input source** | Only **one** input source allowed |
| **Mutual exclusion** | User **cannot** upload an image **and** provide a URL at the same time. Choosing one clears or blocks the other (product XOR). |
| **URL protocol** | Only valid **HTTPS** URLs accepted |
| **Errors** | Display **inline** validation errors (chips / messages per Figma) |
| **File type / size** | Reject non-allowed types and files over 10 MB with inline error |
| **Server authority** | SSRF and security checks remain server-side on audit create; client validates UX early |

---

## Guest Behaviour

| Case | Behaviour |
|------|-----------|
| Guest can start an audit | Yes — within guest teaser rules (screenshot path when credits/quota allow) |
| Guest credits / quota exhausted | Open **Upgrade Dialog** (SCREEN-M08) |
| Authentication required | Open **Login Modal** (e.g. URL audit as guest, or other gated actions) |
| Avatar → Login | Open **Login Modal** |
| After successful OAuth | Resume intent; do not show auth UI on Home |

**Note:** Guest URL attempts require authentication (and paid tier after login for URL). Do not run a live URL audit as an anonymous guest.

---

## Components

| Component | Role on SCREEN-001 |
|-----------|---------------------|
| Header | Top chrome |
| Logo | Brand |
| Credits Badge | Teaser / balance display |
| Avatar | Opens Login Modal (guest) |
| Hero | Heading + subheading |
| Upload Card | Screenshot input |
| URL Input | Website field |
| Primary Button (GO) | Start audit |
| Validation Message | Inline errors / chips |
| Login Modal Trigger | Avatar / gated actions — modal is separate reusable component |

**Do not add** Features, FAQ, testimonial, or other sections not in Figma.

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| Keyboard accessible | All controls operable by keyboard |
| Tab navigation | Logo → Credits → Avatar → Upload → URL → GO (logical order per Figma reading order) |
| ARIA labels | Upload, URL, GO, Credits, Avatar named |
| Visible focus | Focus-visible rings per design system / a11y tokens |
| Screen reader support | Chips/status via live regions where status changes |
| Standard | **WCAG 2.2 AA** |

Upload must be a real button (click + keyboard), not drag-only.  
GO exposes `aria-busy` while submitting.  
Disabled GO must remain understandable (text/semantics, not color alone).

---

## Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Match Figma desktop composition |
| Tablet | Maintain same visual hierarchy; reduce padding only as Figma responsive frames specify |
| Mobile | Maintain same visual hierarchy as Figma; stack upload / URL / GO as designed — **no new layout invention** |

---

## Analytics

Track at minimum:

| Event | Trigger |
|-------|---------|
| Page Viewed | Landing view (`landing_viewed` / equivalent) |
| Upload Started | User initiates upload |
| Upload Completed | Successful upload |
| URL Entered | User enters/commits URL (debounce policy as analytics doc) |
| GO Clicked | Primary GO activate |
| Login Modal Opened | Avatar Login or auth gate |

Align names with `ANALYTICS.md` where aliases exist (`go_clicked`, `login_modal_opened`, etc.).

---

## Navigation

| Action | Destination |
|--------|-------------|
| **GO** (valid, allowed) | **Audit Processing Screen** (SCREEN-M01) |
| **Avatar** (guest) | **Guest Profile Dropdown** → **Login** opens **Login Modal** |
| **Credits** | **Pricing** (Manage Plan / pricing surface — SCREEN-005; guest may need Login Modal first if pricing is protected) |
| Auth required gate | **Login Modal** |
| Guest credits exhausted | **Upgrade Dialog** |

---

## Development Rules

| Rule | |
|------|--|
| Do **NOT** redesign the UI | |
| Do **NOT** create new sections | |
| Do **NOT** modify typography | |
| Do **NOT** change spacing | |
| Pixel-perfect implementation from Figma | |
| Do **NOT** put OAuth / signup / password UI on this screen | Use Login Modal |
| Reuse shared pieces | Header slots, Upload Card, URL + GO, Login Modal — without altering Figma composition |

---

## States (summary)

| State | Behaviour |
|-------|-----------|
| Default | Empty upload + empty URL; GO disabled |
| Upload selected | URL cleared/blocked (XOR); success chip; GO enabled if file valid |
| URL entered | Upload cleared/blocked (XOR); GO enabled only if HTTPS URL valid |
| Invalid URL / file | Inline error; GO disabled |
| Loading | Upload progress and/or GO busy |
| Offline | Block upload/GO per ERROR_HANDLING |
| Guest quota exhausted | Upgrade Dialog |
| Auth required | Login Modal |

---

## QA Checklist (SCREEN-001)

□ Visual match to Figma (spacing, type, color, hierarchy)  
□ No auth providers on page  
□ Avatar → Guest Profile Dropdown → Login → Login Modal  
□ XOR: image and URL cannot both be active  
□ HTTPS-only URL; inline errors  
□ File types + 10 MB enforced  
□ Drag & drop and click upload  
□ GO disabled until valid input  
□ GO → Audit Processing when allowed  
□ Credits → Pricing (with guest gate if required)  
□ Guest exhausted → Upgrade Dialog  
□ Keyboard + WCAG 2.2 AA  
□ Desktop / tablet / mobile hierarchy preserved  
□ Analytics events fire  

---

## Developer Notes

1. Treat Figma as pixel authority; tokens only as the coded expression of those values.  
2. Implement XOR in the shared audit entry control used on Landing (and later Free/Pro Home) without changing Landing layout.  
3. Login Modal and Upgrade Dialog are **overlays** — they must not become new Landing sections.  
4. Guest teaser credits / “1 free audit” copy: follow `PRICING.md` / BUSINESS_RULES for numbers if Figma shows stale values; do not change layout to accommodate copy.  
5. Map processing screen to SCREEN-M01; do not invent a different post-GO experience.

---

**End of SCREEN-001 / HOME_SCREEN.md**
