# COMPONENT — Legal Document Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Component ID:** COMPONENT-067 (Legal Document Card)  
**Component name:** Legal Document Card (`LegalDocumentCard`)  
**Primary screen:** Legal & Privacy (`docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md`)  
**Related:** Legal Document Nav (`LegalDocumentNav`) — list/nav variant on detail view · Legal Document Viewer — full document body · Terms Checkbox (`COMPONENT_TERMS_CHECKBOX.md`) — links to Terms / Privacy routes · Card primitive (`src/components/ui/card.tsx`) · Footer legal links  
**Figma:** Legal & Privacy document hub tiles — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock metadata only** — version and last-updated from config; **no backend**, **no CMS**, **no consent persistence API**.  
> **Legal rule:** **Do not invent legal claims.** Descriptions are neutral summaries; full document body lives in `mock-legal-documents` with placeholder notice until Legal approves.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md` · `docs/components/COMPONENT_TERMS_CHECKBOX.md` · `src/config/legal-privacy-screen.ts` · `src/data/mock-legal-documents.ts`

---

## 1. Purpose

Provides **access to an individual legal document** on the Legal & Privacy screen.

Each card represents one fixed legal document. Activating the card navigates to that document’s deep link (or selects it in the parent viewer when composed in a split layout).

**Do not redesign.** Match Figma.

---

## 2. Documents

Five fixed document types — align slugs, titles, and descriptions with `LEGAL_DOCUMENT_SLUGS`, `LEGAL_DOCUMENT_LABELS`, and `LEGAL_DOCUMENT_DESCRIPTIONS` in `legal-privacy-screen.ts`:

| Slug (internal) | Title (display) |
|-----------------|-----------------|
| `terms` | Terms of Service |
| `privacy` | Privacy Policy |
| `cookies` | Cookie Policy |
| `acceptable-use` | Acceptable Use Policy |
| `data-processing` | Data Processing Information |

| Rule | Spec |
|------|------|
| Fixed set | Do not invent additional documents this phase |
| Guest | All five cards **visible** and navigable — not auth-gated |
| Icons | Optional decorative icon per document — Figma / Lucide equivalent; **`aria-hidden`** |
| Body copy | Card shows **summary metadata only** — not full policy text |

### Suggested descriptions (config — Figma wins)

| Document | Description (example) |
|----------|-------------------------|
| **Terms of Service** | Rules for using Audient and our services. |
| **Privacy Policy** | How we collect, use, and protect your information. |
| **Cookie Policy** | How we use cookies and similar technologies. |
| **Acceptable Use Policy** | Permitted and prohibited uses of the platform. |
| **Data Processing Information** | Overview of how Audient processes customer data. |

Store in config — do not hardcode in component body.

---

## 3. Display

| Element | Spec |
|---------|------|
| **Title** | Document name from `LEGAL_DOCUMENT_LABELS` |
| **Description** | One-line summary from `LEGAL_DOCUMENT_DESCRIPTIONS` |
| **Version** | Display label — e.g. **Version 1.0** — from `LEGAL_DOCUMENT_VERSIONS[slug].version` |
| **Last Updated** | Locale-formatted date — e.g. **Last updated: August 1, 2026** — from `LEGAL_DOCUMENT_VERSIONS[slug].lastUpdatedIso` |
| **View action** | Primary affordance — e.g. **View** button or full-card link with visible “View {title}” label; Figma wins |

Compose on design-system **Card** — interactive / navigable.

| Layout (responsive) | Spec |
|---------------------|------|
| **Desktop** | Grid cell — multi-column hub with sibling cards |
| **Tablet** | 2-column grid |
| **Mobile** | Single column; full-width card; min **44px** touch height for action |

Version and last updated may appear as a stacked meta row below description or in the card footer — **Figma exact placement**.

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| **Click / tap (card or View)** | Navigate to `/legal/{slug}` (or invoke parent `onView`) |
| **Keyboard** | Enter / Space on focused card or View control activates navigation |
| **Active document** | When current route matches slug, card shows selected/active state (`aria-current="page"`) |
| **External** | In-app navigation only this phase — no new tab unless Figma specifies |

| Rule | Spec |
|------|------|
| Routes | Use `buildLegalDocumentRoute(slug)` helper — align with footer `/terms` → `/legal/terms` redirects |
| Analytics | Fire **Legal Document Opened** on activation — see §8 |
| Content | Card does **not** render full policy sections — viewer component owns body |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Standard Card; document not currently open |
| **Active** | Current document matches card slug — elevated/outline + `aria-current="page"` |
| **Hover** | Interactive elevation / hover token |
| **Focused** | Visible focus ring on card or View control |
| **Pressed** | Active press styles |
| **Disabled** | Optional — parent screen loading; `aria-disabled`; no navigation |
| **Loading** | Optional skeleton variant — title + meta placeholders when parent `state=loading` |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `slug` | legal document slug | Yes | Internal id |
| `title` | string | Yes | Display title |
| `description` | string | No | One-line summary |
| `version` | string | Yes | Display version (e.g. `1.0`) |
| `lastUpdatedIso` | ISO date string | Yes | Source for formatted last-updated |
| `active` | boolean | No | Current document selected |
| `disabled` | boolean | No | Loading / inactive |
| `viewLabel` | string | No | Override View action label — default from config |
| `href` | url | No | Override route — default `/legal/{slug}` |
| `onView` | `(slug) => void` | No | Optional handler instead of default Link navigation |
| `icon` | ReactNode | No | Override default icon |
| `className` | string | No | |

Parent grid or hub section passes one card per document; parent may derive version/last-updated from `LEGAL_DOCUMENT_VERSIONS`.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Control | Full-card **link** (`Card` + `Link`) **or** card with dedicated **View** button — prefer single clear activation target |
| Name | Accessible name includes **document title** — e.g. “Terms of Service, Version 1.0” |
| Description | Visible description text or `aria-describedby` linking title to summary |
| Meta | Version and last updated exposed as visible text — not icon-only |
| Active | `aria-current="page"` when `active={true}` |
| Icon | Decorative — meaning in title + description |
| Focus | Visible focus ring on link/button |
| Color | Active state not color-only — border/elevation + `aria-current` + text |
| Touch | Min 44px hit target on mobile for View action |

View action must have an **discernible accessible name** — e.g. “View Terms of Service”, not unlabeled “View” alone unless `aria-labelledby` references the title.

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Legal Document Opened** | Card or View activated | `documentSlug`, `version`, `source: legal_document_card` |

Align with SCREEN-024 screen analytics (`legal-privacy-events.ts`); dev stub only — no PII.

Optional: **Legal Page Viewed** remains parent screen responsibility on first hub paint.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | 2–3 column grid (parent) — five cards with balanced whitespace |
| **Tablet** | 2 columns |
| **Mobile** | 1 column; stacked title, description, meta, View action |

Description may wrap; avoid truncating version or last-updated on mobile.

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Legal & Privacy Screen** | Hub layout composes five `LegalDocumentCard` instances **or** side nav (`LegalDocumentNav`) on detail — Figma wins; refactor inline nav to cards if hub tiles shown |
| **Legal Document Viewer** | Renders full document after navigation — not duplicated on card |
| **Legal Document Nav** | Compact list/select for in-document switching — complementary to hub cards |
| **Terms Checkbox** | Checkout links to Terms / Privacy — same slugs and routes |
| **Footer** | May link directly to Terms / Privacy or Legal hub |
| **Card (ui)** | Base primitive — do not fork styling |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `LEGAL_DOCUMENT_SLUGS` · `LEGAL_DOCUMENT_LABELS` · `LEGAL_DOCUMENT_DESCRIPTIONS` · `LEGAL_DOCUMENT_VERSIONS` |
| Config | Extend `src/config/legal-privacy-screen.ts` — `viewActionLabel`, card copy if needed |
| Utils | `src/utils/legal-privacy-screen.ts` — `buildLegalDocumentRoute()`, `formatLegalLastUpdated()`, `formatLegalVersionLabel()` |
| Component | `src/components/legal/LegalDocumentCard.tsx` |
| Grid | `LegalDocumentGrid.tsx` (or hub section in `LegalPrivacyScreen`) composes cards |
| No | Backend · CMS · invented compliance claims · full policy body on card |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ All five documents render with title, description, version, last updated, View action  
□ View navigates to correct `/legal/{slug}`  
□ Active card when on matching document route  
□ Keyboard accessible with visible focus  
□ WCAG 2.2 AA — not color-only active state; discernible View name  
□ Guest and authenticated users can open all cards  
□ Terms / Privacy version dates align with `TERMS_CHECKBOX_LEGAL`  
□ Desktop / tablet / mobile grid  
□ Analytics: Legal Document Opened on activation  
□ Mock metadata only — no backend  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full policy text on card |
| PDF download |
| Document diff / changelog UI |
| CMS-managed metadata API |
| Consent acceptance on card |
| Tier-gated document hiding |
| Inventing GDPR/SOC2/PCI certification badges |

---

**End of COMPONENT_LEGAL_DOCUMENT_CARD.md**
