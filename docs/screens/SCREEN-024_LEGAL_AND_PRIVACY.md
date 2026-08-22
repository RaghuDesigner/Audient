# SCREEN-024 — Legal & Privacy

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Screen ID:** SCREEN-024 (product brief)  
**Canonical mapping:** Legal documents hub + privacy/consent summary (related: SCREEN-M12 Consent banner · SCREEN-M13 Privacy · SCREEN-M14 Terms · SCREEN-M15 Delete Account)  
**Screen name:** Legal & Privacy  
**Route (recommended):** `/legal` — hub; document deep-links e.g. `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/acceptable-use`, `/legal/data-processing`  
**Figma:** Legal & Privacy frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` backlog reserved **SCREEN-024** for **Delete Account** (SCREEN-M15). This document is **Legal & Privacy**. Renumber or split routes when consolidating IDs.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Placeholder legal content** + **mock consent display** — **no legal consent backend**, **no Supabase**, **no persistence API** this phase.  
> **Legal rule:** **Do not invent legal claims.** Use neutral placeholder copy until Legal approves final text. Align version strings with checkout `TermsCheckbox` constants when present.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_TERMS_CHECKBOX.md` · `docs/screens/SCREEN-013_CHECKOUT.md` · `docs/screens/SCREEN-019_SETTINGS.md`

---

## 1. Purpose

Provides access to Audient's **legal documents** and **privacy controls**.

Users can read available policies, navigate between documents, review document version metadata, and (when signed in) see a summary of their **consent status**. Privacy preference controls are shown where applicable — mock/local only this phase.

The UI must **match the approved Figma exactly**.

---

## 2. Entry Points

```text
Application Footer
        ↓
Legal & Privacy (or individual policy links)

Checkout / Terms Checkbox
        ↓
Terms of Service / Privacy Policy links
        ↓
Legal document view (this screen or child route)

Settings → Legal & Privacy (optional)
        ↓
/legal

Direct URL
        ↓
/legal or /legal/{document}
```

| Surface | Spec |
|---------|------|
| **Footer** | Terms · Privacy · Legal hub link |
| **Terms Checkbox (Checkout)** | `termsHref` / `privacyHref` — align with document routes |
| **Cookie banner (future M12)** | “Manage preferences” may deep-link to privacy section |
| **Profile / Settings** | Optional “Legal & Privacy” nav item |

---

## 3. Access Rules

| User | Spec |
|------|------|
| **Guest** | **Full access to legal documents** — read-only; no consent status panel |
| **Authenticated** | Documents **plus** **Consent Status** summary and **Manage Privacy Preferences** |

| Rule | Spec |
|------|------|
| Auth gate | **No login required** to read legal documents |
| Tier | Not plan-gated |
| Delete Account | Out of scope on this screen — separate flow (SCREEN-M15) |

---

## 4. Layout

```text
Application Header (Guest or Authenticated shell)
        ↓
Breadcrumb
        ↓
Page Title — Legal & Privacy
        ↓
Section A — Legal navigation (document list / tabs)
        ↓
Section B — Active document viewer OR hub cards
        ↓
Section C — Document version metadata (version + last updated)
        ↓
Section D — Privacy preferences (where applicable)
        ↓
Section E — Consent status (Authenticated only)
        ↓
Actions — View Terms · View Privacy · Manage Privacy Preferences
```

| Rule | Spec |
|------|------|
| Shell | Guest header when signed out; authenticated shell when signed in |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Navigation | One active document at a time on detail view; hub lists all documents |

### Breadcrumb (recommended)

| Context | Trail |
|---------|-------|
| **Hub** | Legal & Privacy |
| **Document** | Legal & Privacy > {Document name} |
| **Authenticated hub** | Dashboard > Legal & Privacy |

---

## 5. Legal Documents

Five document types this phase:

| Document | Slug (recommended) | Notes |
|----------|-------------------|--------|
| **Terms of Service** | `terms` | Linked from Checkout Terms Checkbox |
| **Privacy Policy** | `privacy` | Linked from Checkout Terms Checkbox |
| **Cookie Policy** | `cookies` | Describes cookie categories — no live CMP backend |
| **Acceptable Use Policy** | `acceptable-use` | Placeholder neutral copy |
| **Data Processing Information** | `data-processing` | High-level DPA-style info — **no invented compliance claims** |

| Rule | Spec |
|------|------|
| Content | **Placeholder** sections (headings + lorem-neutral boilerplate) until Legal approves |
| Claims | Do **not** invent GDPR certification, SOC2, PCI ownership, or regional compliance statements |
| Updates | Version metadata displayed per §7 — content body is static mock |
| Format | Semantic headings (`h2`/`h3`), paragraphs, lists — readable long-form |

---

## 6. Legal Navigation

Users can **navigate between available documents**.

| Pattern | Spec |
|---------|------|
| **Hub** | Card or list of five documents with title + short description |
| **Detail** | Side nav (desktop) or select/tabs (mobile) switching active document without losing page context |
| **Deep link** | URL reflects document — shareable `/legal/privacy` etc. |
| **Active state** | Visible indicator — not color-only (text + aria-current) |

Selecting a document updates the viewer and version block; fire **Legal Document Opened** analytics.

---

## 7. Document Version

Each document displays version metadata:

| Field | Example |
|-------|---------|
| **Version** | Version 1.0 |
| **Last updated** | Last updated: August 14, 2026 |

| Rule | Spec |
|------|------|
| Source | Mock config — e.g. `LEGAL_DOCUMENT_VERSION = "1.0"` aligned with `TERMS_CHECKBOX_LEGAL` if defined |
| Display | Near document title or footer of viewer |
| Locale | Format dates with user locale |

---

## 8. Privacy Preferences

Display **privacy / consent preferences** where applicable (Figma wins placement).

| Control (mock) | Spec |
|----------------|------|
| **Analytics cookies** | Toggle or tri-state — Essential always on; Analytics optional |
| **Marketing cookies** | Optional toggle — off by default |
| **Email communications** | Optional — informational; may mirror Settings notification prefs later |

| Rule | Spec |
|------|------|
| Phase | **Local/mock state only** — `localStorage` or in-memory acceptable for demo |
| Save | Mock “Preferences saved” toast — **no API** |
| CMP | Full cookie banner (SCREEN-M12) is separate — this section is in-app preferences stub |
| Copy | Neutral — describe what each category does without overpromising |

**Manage Privacy Preferences** action scrolls to or focuses this section.

---

## 9. Consent Status (Authenticated)

Visible **only when signed in**.

| Field | Spec |
|-------|------|
| **Terms Accepted** | Yes / No — mock from local consent record |
| **Privacy Policy Acknowledged** | Yes / No |
| **Cookie Preference** | Summary — e.g. “Analytics: Off · Marketing: Off” |
| **Consent Date** | Locale-formatted date of last mock acceptance |

| Rule | Spec |
|------|------|
| Data | Mock bundle keyed to user id — no Supabase |
| Guest | Section hidden — not “No consent on file” for guests |
| Checkout | If user accepted Terms on Checkout mock, status may show Yes with same version id |
| Read-only | No edit on this panel — change via Privacy Preferences or re-accept flows later |

---

## 10. Actions

| Action | Spec |
|--------|------|
| **View Terms** | Navigates to Terms of Service document (`/legal/terms`) |
| **View Privacy Policy** | Navigates to Privacy Policy document (`/legal/privacy`) |
| **Manage Privacy Preferences** | Scroll/focus privacy preferences section or open preferences panel |

Primary buttons/links use design-system **Button** / accessible links. Available to Guest (view actions) and Authenticated (all actions).

---

## 11. Screen States

| State | Spec |
|-------|------|
| **Default (Guest)** | Hub or document viewer; no consent status |
| **Default (Authenticated)** | Hub + consent status + preferences |
| **Loading** | Skeleton for document body on first paint |
| **Error** | Inline error + Retry — e.g. failed mock load (`?state=error`) |
| **Unknown document slug** | 404-style inline message + link back to hub |

QA query params (recommended): `?state=loading|success|error` · `?doc=terms|privacy|…`

---

## 12. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Headings | Semantic hierarchy — page `h1`, document title `h2`, sections `h3` |
| Navigation | Document nav is keyboard reachable; `aria-current="page"` on active doc |
| Long documents | Skip link to main content; readable line length |
| Preferences | Toggles/checkboxes labelled; state announced on change (live region optional) |
| Focus | Visible focus on links, buttons, nav items |
| Color | Active nav not color-only |

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Side nav + document column; consent panel sidebar or below doc |
| **Tablet** | Collapsible nav or horizontal tabs |
| **Mobile** | Document select dropdown or stacked tabs; full-width content; min 44px targets |

---

## 14. Analytics

| Event | Trigger | Properties (recommended) |
|-------|---------|---------------------------|
| **Legal Page Viewed** | Hub first meaningful paint | `isGuest`, `tier` |
| **Legal Document Opened** | Document selected or deep-link load | `documentSlug`, `version` |
| **Privacy Preferences Viewed** | Preferences section enters view or panel opened | `isGuest` |
| **Privacy Preference Changed** | Mock save / toggle change | `preferenceKey`, `value` (no PII) |

Dev stub `console.info` in development. Marketing analytics still consent-gated per `ANALYTICS.md` when CMP ships.

---

## 15. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Content | `src/data/mock-legal-documents.ts` — placeholder sections per document |
| Config | `src/config/legal-privacy-screen.ts` — slugs, titles, version, last updated, copy |
| Consent mock | `src/data/mock-legal-consent.ts` — authenticated consent summary |
| Utils | `src/utils/legal-privacy-screen.ts` — slug resolve, nav helpers |
| Route | `src/app/legal/page.tsx` + optional `[document]/page.tsx` |
| Reuse | Footer links · Terms Checkbox hrefs (`/terms` may redirect to `/legal/terms`) · Settings patterns for toggles |
| No | Supabase · consent API · CMS · invented legal claims |
| Legal review | Replace placeholders before production launch (`GO_LIVE_CHECKLIST.md`) |
| No implementation code in this document | |

Suggested placeholder version block:

```text
Version 1.0
Last updated: August 14, 2026
```

---

## 16. Relationship to Other Screens

| Screen | Relationship |
|--------|--------------|
| **SCREEN-013 Checkout** | Terms Checkbox links to Terms / Privacy documents |
| **SCREEN-M12 Consent banner** | Cookie preferences complement in-app section |
| **SCREEN-019 Settings** | Notification / privacy prefs may converge later |
| **SCREEN-023 Help & Privacy** | Account & Security articles may link here |
| **SCREEN-M15 Delete Account** | Separate erasure flow — not on this screen |

---

## 17. QA Checklist

□ Guest: all five documents readable  
□ Authenticated: consent status panel visible  
□ Legal navigation between documents  
□ Version + last updated shown per document  
□ Privacy preferences section (mock save)  
□ Actions: View Terms, View Privacy, Manage Preferences  
□ Placeholder content — no invented legal claims  
□ WCAG 2.2 AA — headings, keyboard, document nav  
□ Desktop / tablet / mobile  
□ Analytics: Legal Page Viewed, Document Opened, Preferences Viewed/Changed  
□ Mock only — no backend / Supabase  

---

## 18. Non-goals

| Out of scope |
|--------------|
| Legal consent backend / audit log API |
| Supabase persistence |
| CMS / legal document authoring |
| Cookie banner implementation (SCREEN-M12) |
| Delete account / GDPR erasure (SCREEN-M15) |
| E-signature or clickwrap enforcement beyond Checkout UI gate |
| Inventing compliance certifications |

---

**End of SCREEN-024_LEGAL_AND_PRIVACY.md**
