# COMPONENT — Error Illustration

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Design · QA  

**Component ID:** COMPONENT-073 (Error Illustration)  
**Component name:** Error Illustration (`ErrorIllustration`)  
**Primary consumer:** Error State (`docs/components/COMPONENT_ERROR_STATE.md` — COMPONENT-072)  
**Also reusable on:** System State screens (`docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`) · inline section failures · Audit Failed surfaces (`docs/screens/SCREEN-003_AUDIT_FAILED.md`) · offline / network banners when Figma uses the same artwork  
**Related:** Empty State illustrations (`COMPONENT_EMPTY_STATE.md`) — separate variant set · Error State (`COMPONENT_ERROR_STATE.md`) — composes this illustration above title/description · `docs/DESIGN_TOKENS.md` · `docs/ACCESSIBILITY.md`  
**Figma:** Error & system state illustration frames — **exact match** per type  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + approved Figma error illustration style.  
> **Phase:** **Static illustrations only** — icon or SVG artwork; **no Lottie**, **no backend**, **no dynamic asset API** this phase unless Figma specifies otherwise.  
> **Visual rule:** Calm, supportive tone — not alarmist. Meaning must not rely on color alone.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md` · `src/config/error-state.ts` · `src/config/error-system-states.ts`

---

## 1. Purpose

Provides **visual context for an error state** — a variant-specific illustration or icon that reinforces the error type without replacing the heading and description.

The illustration supports comprehension and brand consistency. **Error State** owns copy and actions; **Error Illustration** owns the visual glyph only.

**Do not redesign.** Match approved Figma illustration style for each type.

---

## 2. Types

Six first-class illustration types this phase. Map to internal keys used by Error State and SCREEN-025 config.

| Type | Internal key | Visual intent (summary) |
|------|--------------|-------------------------|
| **Not Found** | `not_found` | Missing page / lost document — e.g. file-question motif |
| **Access Denied** | `forbidden` | Permission / lock — e.g. shield or blocked access |
| **Server Error** | `server_error` | System failure — e.g. server / crash motif |
| **Network** | `network_error` | Connectivity — e.g. wifi-off / disconnected signal |
| **Maintenance** | `maintenance` | Scheduled downtime — e.g. wrench / tools motif |
| **Generic** | `generic_error` | Unspecified failure — e.g. alert / neutral error circle |

| Rule | Spec |
|------|------|
| Extended SCREEN-025 keys | `session_expired` · `audit_service_unavailable` — reuse closest Figma type (e.g. Generic or Server Error) unless Figma defines dedicated artwork |
| One type → one default illustration | Do not fork per screen when type matches |
| Custom override | Error State may pass a custom `illustration` node for one-off flows — prefer typed illustration when possible |

Store type keys in config alongside Error State defaults — e.g. `src/config/error-state.ts` · `src/config/error-illustration.ts` (recommended).

---

## 3. Display

| Element | Spec |
|---------|------|
| **Artwork** | Figma-approved SVG, brand illustration, or design-system icon inside a muted circular or rounded container |
| **Container** | Neutral `bg-muted` surface — not error-red fill alone; error cue comes from icon + adjacent text |
| **Sizing** | **Page** (`size: page`): larger container (e.g. 64–80px outer); **Section** (`size: section`): compact (e.g. 56px outer) |
| **Placement** | Centered above Error State title; decorative in standard flows |

| Layout | Spec |
|--------|------|
| **Desktop** | Centered above heading |
| **Tablet** | Same |
| **Mobile** | Same; scale down proportionally if Figma specifies |

### Visual style requirements

| Requirement | Spec |
|-------------|------|
| Figma | Follow approved error illustration style — stroke weight, corner radius, palette from design tokens |
| Tone | Calm and actionable — avoid scary or aggressive imagery |
| Color | Use token colors (`muted`, `muted-foreground`, optional `error` accent on icon stroke only if Figma shows it) — no hardcoded hex |
| Animation | **Do not use excessive animation.** Static by default. If Figma specifies subtle motion (e.g. gentle pulse on network), cap at one short loop; respect `prefers-reduced-motion` |
| Consistency | Same illustration family as Empty State where Figma aligns — do not mix unrelated art styles |

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Static | Illustration does not trigger navigation or actions |
| No interaction | Not a button or link unless Figma explicitly shows tappable illustration (unlikely) |
| Parent-driven type | `type` / `variant` prop selects artwork — parent Error State passes matching key |
| Override | Optional custom artwork prop for edge cases — typed illustration preferred |
| Loading | Do not show illustration during loading skeleton — parent shows skeleton placeholder in same footprint |
| Retry busy | Illustration unchanged while primary action is busy |

No API or asset fetch required this phase — bundle SVGs or map to approved icon set locally.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `type` / `variant` | `not_found` \| `forbidden` \| `server_error` \| `network_error` \| `maintenance` \| `generic_error` | Yes | Which illustration to render |
| `size` | `page` \| `section` | No | Outer container scale — default `section` |
| `decorative` | boolean | No | Default `true` — hides from assistive tech when title+description present |
| `accessibleLabel` | string | When `decorative: false` | Short accessible name for meaningful artwork |
| `className` | string | No | Layout wrapper override |

Error State passes `size` and `type` when composing Error Illustration internally.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Decorative (default) | When Error State heading + description convey full meaning: **`aria-hidden="true"`** on illustration wrapper; no `alt` text on decorative SVG |
| Meaningful | If illustration conveys information **not** in adjacent text: provide **`accessibleLabel`** (or equivalent) and expose to screen readers — do not rely on color or shape alone |
| Motion | Honor **`prefers-reduced-motion: reduce`** — disable non-essential animation |
| Focus | Illustration is not focusable |
| Contrast | Icon strokes and fills meet contrast on muted container where applicable |

**Default Audient error flows:** illustrations are **decorative** because Error State title and description carry the message.

---

## 7. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Error State (COMPONENT-072)** | Primary consumer — illustration sits above title |
| **Empty State (COMPONENT-020)** | Separate illustration set for “no data” — do not reuse error types for empty variants |
| **SystemStateScreen** | Full-page shell composes Error State, which composes Error Illustration |
| **SCREEN-003 Audit Failed** | May reuse Server Error or Generic illustration when service-down copy applies |

---

## 8. Reuse

| Context | Illustration type |
|---------|-------------------|
| Global 404 | `not_found` |
| 403 / RBAC gate | `forbidden` |
| Error boundary / 500 | `server_error` |
| Offline / fetch failure | `network_error` |
| Maintenance page | `maintenance` |
| Unknown / fallback error | `generic_error` |

**Reusable across Audient** — one implementation, config-driven type selection. Do not embed one-off SVGs in screen files.

---

## 9. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/error-illustration.ts` — type keys, default icon/artwork ids, size tokens |
| Component | `src/components/common/ErrorIllustration.tsx` (recommended path alongside Error State) |
| Integration | Error State `illustration` prop delegates to Error Illustration by default when type is set |
| Assets | SVGs under `public/illustrations/errors/` or Lucide mapping until brand SVGs ship — Figma wins when assets exist |
| Animation | None in Phase 1 unless Figma requires subtle motion |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No | Backend asset CDN · user-uploaded error art · flashing or looping distraction |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 10. QA Checklist

□ All six types render distinct, Figma-aligned artwork  
□ Illustration container uses design tokens (muted surface, proportional sizing)  
□ Page vs section sizes match Error State layout  
□ Decorative illustrations hidden from screen readers (`aria-hidden`)  
□ Meaningful variant (if any) exposes accessible label  
□ No excessive animation; reduced-motion respected  
□ Not shown during loading skeleton  
□ Reused via Error State — no per-screen SVG forks  
□ Visual meaning not color-only — paired with Error State text  

---

## 11. Non-goals

| Out of scope |
|--------------|
| Animated Lottie / video error loops |
| Illustration-as-CTA (clickable artwork) |
| Per-route custom 404 artwork |
| Dark-mode-specific artwork (light theme only this phase) |
| Illustrations for form field validation errors |
| Dynamic illustration based on HTTP status code display |

---

**End of COMPONENT-073 / COMPONENT_ERROR_ILLUSTRATION.md**
