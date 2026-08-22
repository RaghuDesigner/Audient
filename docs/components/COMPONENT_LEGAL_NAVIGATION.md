# COMPONENT — Legal Navigation

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Component ID:** COMPONENT-068 (Legal Navigation)  
**Component name:** Legal Navigation (`LegalDocumentNav`)  
**Primary screen:** Legal & Privacy (`docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md`)  
**Related:** Legal Document Card (`COMPONENT_LEGAL_DOCUMENT_CARD.md`) — hub tiles for document discovery · Legal Document Viewer — body updates when nav selection changes · Settings section nav — responsive list/select pattern · Notification Filter — mobile `<select>` fallback pattern  
**Figma:** Legal & Privacy side navigation / mobile document picker — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + navigation patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Client-side route navigation** on mock legal content — **no backend**, **no CMS**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md` · `docs/components/COMPONENT_LEGAL_DOCUMENT_CARD.md` · `src/config/legal-privacy-screen.ts`

---

## 1. Purpose

Provides **navigation between legal documents** on the Legal & Privacy screen.

Users switch the active document without leaving the screen shell. The parent viewer and version metadata update to match the selected item. URL deep links remain shareable (`/legal/{slug}`).

**Do not redesign.** Match Figma.

---

## 2. Navigation Items

Five fixed items — align slugs and labels with `LEGAL_DOCUMENT_SLUGS` and `LEGAL_DOCUMENT_LABELS` in `legal-privacy-screen.ts`:

| Slug (internal) | Label (display) | Brief label (optional mobile) |
|-----------------|-----------------|-----------------------------|
| `terms` | Terms of Service | Terms |
| `privacy` | Privacy Policy | Privacy |
| `cookies` | Cookie Policy | Cookies |
| `acceptable-use` | Acceptable Use Policy | Acceptable Use |
| `data-processing` | Data Processing Information | Data Processing |

| Rule | Spec |
|------|------|
| Fixed set | Do not invent additional nav items this phase |
| Guest | All five items **visible** and navigable — not auth-gated |
| Order | Same order as `LEGAL_DOCUMENT_SLUGS` unless Figma reorders |
| Icons | Optional per item — decorative only; **`aria-hidden`** if shown |

Store labels in config — do not hardcode in component body.

---

## 3. Display

| Element | Spec |
|---------|------|
| **Landmark** | `<nav>` with accessible label — e.g. “Legal documents” |
| **Item list** | Vertical list of document links (desktop / tablet side nav) |
| **Mobile control** | Native `<select>` or equivalent single-choice picker — label “Choose a legal document” |
| **Active item** | Visually distinct — border/background + underline or weight change — **not color-only** |

| Layout (responsive) | Spec |
|---------------------|------|
| **Desktop** | Side column beside document viewer — fixed-width nav |
| **Tablet** | Side nav or horizontal tabs if Figma — default side list |
| **Mobile** | Dropdown `<select>` — full width; min **44px** control height |

Nav shows **document titles only** — no description, version, or last-updated on nav items (those live on **Legal Document Card** hub tiles and **Legal Document Viewer**).

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| **Select item (desktop link)** | Navigate to `/legal/{slug}`; parent updates active document |
| **Select item (mobile select)** | Same route change on `change` |
| **Deep link** | Initial `activeSlug` derived from URL — nav reflects current route |
| **Disabled** | Parent loading — nav inert; `disabled` on select; links non-interactive |

| Rule | Spec |
|------|------|
| Single active | Exactly **one** item marked active at a time |
| Selection | Nav does **not** toggle off — always one document selected |
| Viewer sync | Parent passes `activeSlug`; viewer + version block follow selection |
| Analytics | Fire **Legal Document Opened** on item change — see §8 |
| Hub vs detail | **Legal Document Grid** (cards) may appear above nav on hub — nav remains compact switcher for detail layout |

No server round-trip this phase.

---

## 5. States

| State | Spec |
|-------|------|
| **Default (inactive item)** | Standard link styling |
| **Active / selected** | Current document — elevated border, background, underline, or font weight + `aria-current="page"` |
| **Hover** | Hover token on inactive links |
| **Focused** | Visible focus ring on link or select |
| **Disabled** | Parent `loading` or error retry — whole nav disabled |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `activeSlug` | legal document slug | Yes | Currently open document |
| `disabled` | boolean | No | Loading / inactive |
| `onNavigate` | `(slug) => void` | No | Optional callback before/after route change |
| `className` | string | No | Layout wrapper |

Parent (`LegalPrivacyScreen`) owns route and passes `activeSlug` from URL. Items are derived from config — not passed individually unless override needed later.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Landmark | `<nav aria-labelledby="…">` with visible or sr-only section label |
| List semantics | Desktop: `<ul>` / `<li>` wrapping links — not div-only click targets |
| Current page | `aria-current="page"` on active link |
| Mobile select | `<select aria-labelledby="…">` with visible label |
| Keyboard | Tab to each link; Enter activates link; select operable with keyboard |
| Focus | Visible focus ring — design tokens |
| Color | Active state not color-only — underline/weight/border + `aria-current` |
| Touch | Min 44px hit target on mobile select and link rows |

Screen readers should announce the active document when focus moves to the nav (native link + `aria-current` behavior).

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Legal Document Opened** | Nav item selected | `documentSlug`, `version`, `source: legal_document_nav` |

Align with SCREEN-024 (`legal-privacy-events.ts` or dedicated nav stub); dev-only — no PII.

**Legal Page Viewed** remains parent screen responsibility.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop (≥768px)** | Vertical side nav with link list |
| **Mobile (<768px)** | Labeled `<select>` bound to `activeSlug` |
| **Tablet** | Follow desktop side nav unless Figma shows tabs |

Breakpoint should match existing `useMediaQuery('(max-width: 767px)')` convention used in Settings and Notifications filters.

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Legal & Privacy Screen** | Composes nav beside **Legal Document Viewer** in split layout |
| **Legal Document Grid** | Hub discovery — complementary; nav is compact in-document switcher |
| **Legal Document Card** | Full metadata tile — nav is title-only shortcut |
| **Legal Document Viewer** | Updates when nav selection changes |
| **Footer / Terms Checkbox** | External entry to same slugs — nav reflects state after landing |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `LEGAL_DOCUMENT_SLUGS` · `LEGAL_DOCUMENT_LABELS` · `LEGAL_PRIVACY_COPY.navLabel` · `LEGAL_PRIVACY_COPY.documentNavLabel` |
| Routes | `buildLegalDocumentRoute(slug)` from `legal-privacy-screen` utils |
| Component | `src/components/legal/LegalDocumentNav.tsx` |
| Config | `src/config/legal-privacy-screen.ts` — item labels and nav copy |
| Analytics | Extend `legal-privacy-events.ts` or add `legal-document-nav-events.ts` with distinct `source` |
| No | Backend · CMS · dynamic document list API |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ All five items render with correct labels  
□ Active item visually identified and `aria-current="page"`  
□ Desktop: vertical link nav with keyboard access  
□ Mobile: labeled select switches document  
□ Navigation updates URL to `/legal/{slug}`  
□ Viewer and version block follow selection  
□ Guest and authenticated users can use all items  
□ WCAG 2.2 AA — proper nav semantics; not color-only active state  
□ Analytics: Legal Document Opened on change  
□ Mock only — no backend  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Hub card grid (see Legal Document Card) |
| Full policy body in nav |
| Collapsible nav sections / nested policies |
| CMS-driven nav items |
| Auth-gated document hiding |
| External links opening new tabs (unless Figma mandates) |

---

**End of COMPONENT_LEGAL_NAVIGATION.md**
