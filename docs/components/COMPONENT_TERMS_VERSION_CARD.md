# COMPONENT — Terms Version Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Component ID:** COMPONENT-071 (Terms Version Card)  
**Component name:** Terms Version Card (`TermsVersionCard`)  
**Primary screen:** Legal & Privacy (`docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md`)  
**Also reusable on:** Checkout legal summary (optional) · Terms Checkbox adjacent context · Footer / legal hub  
**Related:** Legal Document Card (`COMPONENT_LEGAL_DOCUMENT_CARD.md`) — hub discovery tile · Legal Document Viewer — full policy body + inline version block · Terms Checkbox (`COMPONENT_TERMS_CHECKBOX.md`) — `TERMS_CHECKBOX_LEGAL` version stamps · Card primitive (`src/components/ui/card.tsx`)  
**Figma:** Legal document version metadata card — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock version metadata only** — until legal content is finalized; **no CMS**, **no backend**, **no Supabase**.  
> **Legal rule:** **Do not invent legal claims.** Metadata only — full policy text remains in document viewer / placeholder mock.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md` · `docs/components/COMPONENT_TERMS_CHECKBOX.md` · `src/config/legal-privacy-screen.ts` · `src/config/terms-checkbox.ts`

---

## 1. Purpose

Displays the **current version of Audient legal terms** (and associated version metadata) in a compact read-only card.

Primary use: **Terms of Service** version transparency before or alongside the full document. May accept other legal document slugs when Figma reuses the pattern.

**Do not redesign.** Match Figma.

---

## 2. Display

Compose on design-system **Card**.

| Element | Spec |
|---------|------|
| **Document** | Legal document name — default **Terms of Service** from `LEGAL_DOCUMENT_LABELS.terms` |
| **Version** | Display version — e.g. **Version 1.0** — from `LEGAL_DOCUMENT_VERSIONS[slug].version` |
| **Effective Date** | Date terms become effective — locale-formatted; mock ISO in config (`effectiveDateIso`) |
| **Last Updated** | Date document was last revised — locale-formatted from `lastUpdatedIso` |
| **View Document** | Primary action — navigates to document route (default `/legal/terms`) |

| Layout | Spec |
|--------|------|
| **Desktop** | Label/value rows or stacked meta block + action aligned end/bottom |
| **Mobile** | Full-width card; stacked fields; min **44px** touch target on action |

Card shows **metadata only** — not the full terms body (that is **Legal Document Viewer**).

### Default mock values (Terms — align with checkout)

| Field | Source (example) |
|-------|------------------|
| Document | Terms of Service |
| Version | `1.0` (`LEGAL_DOCUMENT_DISPLAY_VERSION`) |
| Effective Date | `2026-08-01` — align with `TERMS_CHECKBOX_LEGAL.termsVersion` unless Legal provides separate effective date |
| Last Updated | Same as effective date this mock phase, or `LEGAL_DOCUMENT_VERSIONS.terms.lastUpdatedIso` |

Store field labels in config — e.g. Document · Version · Effective date · Last updated · View document.

---

## 3. Behaviour

| Action | Spec |
|--------|------|
| **View Document** | Navigate to `/legal/{slug}` (default `terms`) — in-app route |
| **Read-only** | Card does not edit version metadata |

| Rule | Spec |
|------|------|
| Guest | Visible to guests — not auth-gated |
| Data | Mock/config only until legal CMS or approved copy ships |
| Checkout | Version shown here should match Terms Checkbox audit stamps when slug is `terms` |
| Analytics | Optional **Legal Document Opened** on View — `source: terms_version_card` |

No server round-trip this phase.

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | All fields populated from config |
| **Loading** | Skeleton placeholders for title, meta rows, action |
| **Unavailable** | Missing metadata — show **Not available** per field or single card message |
| **Disabled** | Optional — parent screen loading; action disabled |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `slug` | legal document slug | No | Default `terms` |
| `documentTitle` | string | No | Override document name |
| `version` | string | No | Override version label |
| `effectiveDateIso` | ISO date | No | Override effective date |
| `lastUpdatedIso` | ISO date | No | Override last updated |
| `href` | url | No | Override View Document target |
| `loading` | boolean | No | Skeleton state |
| `disabled` | boolean | No | Inert action |
| `onViewDocument` | `(slug) => void` | No | Optional click handler |
| `className` | string | No | |

Parent may derive all metadata from `LEGAL_DOCUMENT_VERSIONS` + `buildLegalDocumentRoute(slug)`.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | Card with titled heading; definition list (`dl`) or label/value rows |
| Dates | Use `<time datetime="…">` for effective and last-updated when rendered as dates |
| Action | **View Document** — discernible name, e.g. “View Terms of Service” |
| Keyboard | View action focusable with visible focus ring |
| Color | Metadata not conveyed by color alone |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Legal Document Opened** | View Document activated | `documentSlug`, `version`, `source: terms_version_card` |

Dev stub only — no PII.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Compact card; meta rows side-by-side where space allows |
| **Tablet** | Same or stacked meta |
| **Mobile** | Stacked label/value pairs; full-width View action |

---

## 9. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Legal Document Viewer** | Shows same version/last-updated in document header — avoid duplicate on same viewport unless Figma shows both |
| **Legal Document Card** | Hub tile with shorter metadata + View — this card is version-focused summary |
| **Terms Checkbox** | Checkout links to terms; version stamps must stay aligned |
| **Consent Status Card** | Consent summary — separate from version metadata |

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | Extend `LEGAL_DOCUMENT_VERSIONS` with optional `effectiveDateIso` per slug · or `src/config/terms-version-card.ts` |
| Utils | Reuse `formatLegalVersionLabel()` · `formatLegalLastUpdated()` · `buildLegalDocumentRoute()` |
| Component | `src/components/legal/TermsVersionCard.tsx` |
| Default slug | `terms` |
| No | CMS · legal API · invented compliance claims |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Document, Version, Effective date, Last updated displayed  
□ View Document navigates to `/legal/terms` (or configured slug)  
□ Version aligns with `TERMS_CHECKBOX_LEGAL` for terms  
□ Guest and authenticated users can view card  
□ Loading skeleton when applicable  
□ WCAG 2.2 AA — labelled rows, accessible View action  
□ Desktop / tablet / mobile  
□ Mock metadata only — no backend  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Full terms policy body on card |
| Version history / changelog list |
| PDF download |
| CMS-managed versions API |
| User acceptance capture on this card |
| Invented legal or compliance statements |

---

**End of COMPONENT_TERMS_VERSION_CARD.md**
