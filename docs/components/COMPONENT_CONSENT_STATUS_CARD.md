# COMPONENT — Consent Status Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Component ID:** COMPONENT-070 (Consent Status Card)  
**Component name:** Consent Status Card (`ConsentStatusCard`)  
**Primary screen:** Legal & Privacy (`docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md`)  
**Related:** Privacy Preference Card (`COMPONENT_PRIVACY_PREFERENCE_CARD.md`) — editable prefs; this card is **read-only summary** · Terms Checkbox (`COMPONENT_TERMS_CHECKBOX.md`) — checkout acceptance source · Card primitive (`src/components/ui/card.tsx`)  
**Figma:** Consent status panel on Legal & Privacy (authenticated) — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card / definition-list patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock consent record only** — keyed to authenticated user id; **no consent backend**, **no Supabase**, **no audit log API**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md` · `docs/components/COMPONENT_PRIVACY_PREFERENCE_CARD.md` · `src/config/legal-privacy-screen.ts` · `src/data/mock-legal-consent.ts`

---

## 1. Purpose

Displays the user's **current consent status** on the Legal & Privacy screen.

Authenticated users see a read-only summary of terms acceptance, privacy acknowledgment, cookie preferences, and consent date. Guests do **not** see this card.

**Do not redesign.** Match Figma.

---

## 2. Display

Compose on design-system **Card** with section title **Consent status** (or Figma exact title).

Four read-only rows:

| Field | Spec |
|-------|------|
| **Terms Accepted** | Whether Terms of Service were accepted in mock record |
| **Privacy Acknowledged** | Whether Privacy Policy was acknowledged in mock record |
| **Cookie Preference** | Summary of optional cookie prefs — e.g. **Analytics: Off · Marketing: Off**; may reflect saved **Privacy Preference Card** values when parent passes live prefs |
| **Consent Date** | Locale-formatted date/time of last mock acceptance |

| Element | Spec |
|---------|------|
| **Card title** | Consent status |
| **Intro** | Short line — mock data only; not persisted to a server (Figma exact copy) |
| **Row layout** | Label left; value right — stack on narrow viewports |
| **Values** | Plain text — use status vocabulary from §3 |

Optional footer note: version ids (`termsVersion` / `privacyVersion`) — only if Figma shows them; not required this phase.

---

## 3. Status Values

Use consistent, accessible status labels — store in config; Figma wins on exact strings.

| State | Display (example) | When |
|-------|-------------------|------|
| **Accepted** | Accepted · or **Yes** if Figma matches existing copy | Boolean true for Terms / Privacy |
| **Not Accepted** | Not accepted · or **No** | Boolean false for Terms / Privacy |
| **Not Available** | Not available | Missing date, missing record field, or indeterminate mock state |

### Field mapping

| Field | Accepted | Not Accepted | Not Available |
|-------|----------|--------------|---------------|
| **Terms Accepted** | `termsAccepted === true` | `termsAccepted === false` | Record missing / load error |
| **Privacy Acknowledged** | `privacyAcknowledged === true` | `privacyAcknowledged === false` | Record missing / load error |
| **Cookie Preference** | Summary string from prefs | — | Prefs unavailable — **Not available** |
| **Consent Date** | Formatted `consentDateIso` | — | Empty or invalid ISO — **Not available** |

Cookie row is a **summary**, not a boolean — do not force Accepted/Not Accepted on the whole row unless Figma shows a single badge.

Align boolean display with `LEGAL_PRIVACY_COPY.yes` / `LEGAL_PRIVACY_COPY.no` if already used on screen — or migrate to **Accepted** / **Not accepted** when Figma updates.

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Visibility | **Authenticated users only** — parent must not render for guests |
| Read-only | **No edits** on this card — users change prefs via **Privacy Preference Card** |
| Live cookie summary | When parent passes updated `preferences` from Privacy Preference Card save, **Cookie Preference** row updates without reload |
| Checkout | Mock record may reflect checkout Terms acceptance (`TERMS_CHECKBOX_LEGAL` version stamps) |
| Data source | `getMockLegalConsent(userId)` — deterministic variety by user id suffix for QA |

No server round-trip this phase.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | All four rows populated from mock consent record |
| **Loading** | Optional skeleton — parent screen loading; card hidden or skeleton body |
| **Error** | Optional — consent bundle failed to load; inline message + Retry (parent-owned) |
| **Partial data** | Individual rows show **Not available** when field missing |

Card itself has no interactive states beyond reading content.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `consent` | mock consent record | Yes | Terms, privacy, prefs, date, versions |
| `preferences` | optional prefs map | No | Override cookie summary after Privacy Preference Card save |
| `statusLabels` | accepted / notAccepted / notAvailable | No | Override display strings |
| `loading` | boolean | No | Skeleton variant |
| `className` | string | No | |

Parent (`LegalPrivacyScreen`) gates rendering on authentication and passes consent from mock bundle.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | Card with `aria-labelledby` on title; rows use semantic label + value pairing |
| Definition list | Optional `<dl>` / `<dt>` / `<dd>` if Figma allows — otherwise two-column rows with associated labels |
| Status text | Conveyed in **visible text** — not icon-only or color-only |
| Screen reader | Row label announced with value — e.g. “Terms accepted, Accepted” |
| Focus | No interactive controls required — card is informational |
| Color | Accepted vs not accepted not color-only if badges added later |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| *(none required)* | Read-only card | Optional parent **Legal Page Viewed** covers exposure |

Do not emit PII. If a viewed event is added later, use opaque flags only (`hasConsentDate`, `termsAccepted` boolean).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Label and value on one row per field |
| **Tablet** | Same |
| **Mobile** | Stack label above value; full-width card below Privacy Preference Card |

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Legal & Privacy Screen** | Renders card only when `isAuthenticated` |
| **Privacy Preference Card** | Editable prefs; saved values flow into Cookie Preference row |
| **Terms Checkbox (Checkout)** | Source of terms acceptance in future backend; mock aligned via version ids |
| **Legal Document Card / Navigation** | Unrelated — same screen, different sections |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Record | `MockLegalConsentRecord` in `mock-legal-consent.ts` |
| Loader | `getMockLegalConsent(userId)` |
| Copy | `LEGAL_PRIVACY_COPY.consentStatus*` · yes/no labels in `legal-privacy-screen.ts` |
| Config | `src/config/consent-status-card.ts` — status label enums (optional) |
| Utils | `formatConsentDate()` · `formatCookiePreferenceSummary()` in `legal-privacy-screen` utils |
| Component | `src/components/legal/ConsentStatusCard.tsx` |
| Section id | `legalPrivacySectionId('consentStatus')` |
| No | Consent backend · Supabase · GDPR erasure on this card |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Card hidden for guest users  
□ Authenticated: four rows — Terms, Privacy, Cookie preference, Consent date  
□ Accepted / Not accepted / Not available display correctly per field  
□ Cookie summary updates after Privacy Preference Card save  
□ Read-only — no toggles or edit actions  
□ WCAG 2.2 AA — label/value readable; not color-only  
□ Desktop / tablet / mobile row layout  
□ Mock data only — no backend  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Editing consent from this card |
| Consent backend / audit trail |
| Supabase persistence |
| Re-accept Terms / Privacy flows |
| PDF export of consent record |
| Guest “no consent on file” empty state |

---

**End of COMPONENT_CONSENT_STATUS_CARD.md**
