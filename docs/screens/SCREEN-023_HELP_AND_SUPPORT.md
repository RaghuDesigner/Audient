# SCREEN-023 — Help & Support

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-023 (product brief)  
**Canonical mapping:** In-app Help & Support center (future CMS/helpdesk integration)  
**Screen name:** Help & Support  
**Route (recommended):** `/help` — deep-linkable; public + authenticated  
**Figma:** Help & Support frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock help content only** — **no support backend**, **no ticketing integration**, **no external helpdesk** (Zendesk, Intercom, etc.).  
> **Pricing:** Answers must align with `docs/PRICING.md` / `src/config/plans.ts` — do not invent plan features.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/PRICING.md` ·  
`docs/components/COMPONENT_FAQ_ACCORDION.md` ·  
`docs/components/COMPONENT_SEARCH_BAR.md` ·  
`docs/components/COMPONENT_EMPTY_STATE.md`

---

## 1. Purpose

Provides users with **self-service help** and access to **Audient support**.

Users can search mocked help articles, browse support categories, read frequently asked questions, contact support, and (when signed in) review mocked prior support requests.

The UI must **match the approved Figma exactly**.

---

## 2. Entry Points

```text
Application Header / Profile Menu
        ↓
Help & Support

Footer link (if Figma)
        ↓
Help & Support

Direct URL
        ↓
/help
```

| Surface | Spec |
|---------|------|
| **Profile dropdown** | “Help & Support” menu item (Guest + Authenticated) |
| **Audit failure / payment failure** | “Contact Support” may deep-link here or scroll to Contact section |
| **Manage Membership FAQ** | Cross-link to Help for broader topics — optional |

---

## 3. Access Rules

| User | Spec |
|------|------|
| **Guest** | **Limited public help** — categories, search, and public FAQ subset; **no** Recent Support Requests; Contact Support may prompt sign-in or open public contact stub (Figma wins) |
| **Authenticated (Free / Pro / Business)** | **Full help and support** — all categories, full FAQ, Contact Support, Recent Support Requests |

| Rule | Spec |
|------|------|
| Auth gate | Screen is **reachable without login**; authenticated sections render only when signed in |
| Tier | Help content is **not tier-gated** this phase — Business/Team topics appear as informational articles for all authenticated users |
| Resume | Guest Contact Support → Login → return to `/help` with intent preserved |

---

## 4. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Page Title (+ optional description — Figma)
        ↓
Search
        ↓
Support Categories
        ↓
Frequently Asked Questions
        ↓
Contact Support
        ↓
Recent Support Requests (Authenticated only)
```

| Rule | Spec |
|------|------|
| Shell | Guest shell when signed out; authenticated app shell when signed in (credits, profile menu) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Compose | Reuse **Search Bar**, **FAQ Accordion**, **Empty State**, **Button** — do not recreate |

### Breadcrumb (recommended)

| User | Trail |
|------|-------|
| **Guest** | Help & Support |
| **Authenticated** | Dashboard > Help & Support |

Figma wins on exact labels.

---

## 5. Page Header

| Element | Spec |
|---------|------|
| **Title** | Help & Support |
| **Description** | Optional supporting line — e.g. “Find answers, browse guides, or contact our team.” (Figma exact copy) |

Use semantic page heading (`h1`).

---

## 6. Search

| Element | Spec |
|---------|------|
| **Component** | Reuse **Search Bar** (`COMPONENT_SEARCH_BAR.md`) |
| **Placeholder** | **Search help articles** |
| **Scope** | Mock help articles only — titles, summaries, category labels, FAQ question/answer text |

### Search behaviour

| Rule | Spec |
|------|------|
| Data source | In-memory mock help index — **no API** |
| Live filter | Results update while typing (debounced **300ms** per Search Bar spec) |
| Match | Case-insensitive partial match on article title, summary, tags, category name, FAQ question |
| Category filter | Selecting a category may pre-filter search scope (optional — Figma wins) |
| Clear | Clear (X) restores full unfiltered view |
| Empty results | Show inline empty message — e.g. “No articles match your search.” + link to Contact Support |
| Guest | Search runs on **public** mock corpus only |

| Analytics | Trigger |
|-----------|---------|
| **Help Search** | Debounced query emitted (include `queryLength`, `resultCount`; **never** log full query if policy restricts — dev stub may log slug only) |

---

## 7. Support Categories

Display a **grid or list** of category cards/chips — Figma layout wins.

| Category | Typical topics (mock) |
|----------|------------------------|
| **Getting Started** | First audit, account setup, credits overview |
| **Audits** | Screenshot vs URL audits, processing, failures |
| **Reports** | Reading scores, findings, strengths |
| **Membership** | Free vs Pro vs Business, upgrades |
| **Billing & Payments** | Invoices, payment methods, refunds policy (informational) |
| **Team & Business** | Workspace, invites, roles (informational; link SCREEN-020/022 when live) |
| **Account & Security** | Profile, SSO, sign-out, data privacy (high level) |

| Rule | Spec |
|------|------|
| Interaction | Click/tap category filters FAQ + article list below **or** navigates to category anchor section — Figma wins |
| Guest | All categories visible; article detail may truncate or show “Sign in for more” on locked items if Figma shows gating |
| Icons | Optional leading icon per category — decorative (`aria-hidden`) unless named in visible label |

---

## 8. Frequently Asked Questions

| Element | Spec |
|---------|------|
| **Component** | Reuse **FAQ Accordion** (`COMPONENT_FAQ_ACCORDION.md`) with `module="help"` |
| **Heading** | Frequently Asked Questions (or Figma exact) |

### Sample questions (mock — align with product)

| Question | Answer guidance |
|----------|-----------------|
| **How do I run an audit?** | Upload a screenshot or enter a URL on Home/Dashboard; spend credits per `PRICING.md`; processing screen shows progress. |
| **What is included in Pro?** | Pro tier credits, URL audits, PDF export, history — per `PRICING.md`; no invented features. |
| **How does Business membership work?** | Business (`ENTERPRISE`) team workspace, higher credit pool, roles — informational; link Business Workspace when implemented. |
| **How are credits calculated?** | Per-audit costs by tier and audit type (`PRICING.md`); monthly grants vs top-up rollover. |
| **How do I export an audit report?** | From completed audit report — Export PDF (tier gates per product rules). |
| **How do I manage team members?** | Business Workspace → invite/manage members; roles on Roles & Permissions screen. |

| Rule | Spec |
|------|------|
| Search | FAQ items participate in search index |
| Category | Each FAQ tagged with a category for filtering |
| Guest | Show public FAQ subset; hide Business-only answers if product prefers — default: show all as informational |
| Expand | One or multi-expand per Figma / FaqAccordion default |

| Analytics | Trigger |
|-----------|---------|
| **FAQ Opened** | Accordion item expands (`faqId`, `module: help`) |

---

## 9. Contact Support

| Element | Spec |
|---------|------|
| **Heading / prompt** | **Still need help?** |
| **Body** | Optional short copy — e.g. “Our team typically responds within one business day.” (Figma wins) |
| **Primary CTA** | **Contact Support** |

### Behaviour

| User | Spec |
|------|------|
| **Authenticated** | Opens mock **Contact Support** flow — modal or `/help/contact` stub with subject + message form (**mock submit only**; toast “Request received”) |
| **Guest** | CTA opens **Login Modal** with return intent **or** public mailto / static contact info per Figma — **no real ticket creation** |

| Rule | Spec |
|------|------|
| Backend | **No** ticketing API, email pipeline, or helpdesk webhook |
| Success | Mock confirmation only — does not create a real ticket |
| Analytics | **Support Contact Clicked** on CTA activate |

---

## 10. Recent Support Requests (Authenticated)

Visible **only when signed in**.

### List columns / fields

| Field | Spec |
|-------|------|
| **Ticket ID** | Mock opaque id — e.g. `AUD-1042` |
| **Subject** | Request subject line |
| **Date** | Submitted date (locale-formatted) |
| **Status** | Badge or label — see §10.1 |

### Status values

| Status | Meaning (mock) |
|--------|----------------|
| **Open** | Newly submitted |
| **Pending** | Awaiting user or team response |
| **Resolved** | Closed / completed |

Use token-based status badges — **not color-only** (text label required).

### Row interaction

| Action | Spec |
|--------|------|
| **View** | Row click or “View” control opens mock ticket detail panel/modal (read-only) |
| **Analytics** | **Support Ticket Viewed** with `ticketId` |

Sorting: newest first (default).

---

## 11. Empty State — Support Requests

When authenticated user has **no** mocked requests:

| Element | Spec |
|---------|------|
| **Component** | Reuse **Empty State** (`COMPONENT_EMPTY_STATE.md`) |
| **Message** | **No support requests yet.** |
| **Primary CTA** | **Contact Support** — same handler as §9 |

Do not show the empty requests section to guests.

---

## 12. Screen States

| State | Spec |
|-------|------|
| **Default (Guest)** | Public categories, search, FAQ, Contact Support |
| **Default (Authenticated)** | Full layout including Recent Support Requests |
| **Loading** | Skeleton for FAQ, categories, and request list on first paint |
| **Error** | Inline error + Retry — e.g. “Unable to load help content.” (mock failure via `?state=error`) |
| **Search — no results** | Empty search message (not global Error) |
| **Requests empty** | §11 |

QA query params (recommended): `?state=loading|success|error|empty-requests`

---

## 13. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All interactive elements reachable; logical tab order: Search → Categories → FAQ → Contact → Requests |
| Search | Labelled search field (`aria-label` or visible label); results count announced politely when filter changes |
| FAQ | Accordion buttons with `aria-expanded`, `aria-controls`; keyboard toggle Enter/Space |
| Categories | Buttons/links with visible names — not icon-only |
| Status badges | Visible text for Open / Pending / Resolved |
| Focus | Visible focus rings on all controls |
| Live regions | Search result changes and mock submit success via `role="status"` / toast |
| Color | Status and category emphasis supplement text — never sole indicator |

---

## 14. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Multi-column category grid; sidebar or stacked sections per Figma |
| **Tablet** | 2-column category grid; full-width search |
| **Mobile** | Single column; full-width search and CTAs; `min-h-11` touch targets; FAQ full-width accordion |

Sticky header search optional — Figma wins.

---

## 15. Analytics

| Event | Trigger | Properties (recommended) |
|-------|---------|---------------------------|
| **Help Viewed** | First meaningful paint of help content | `tier`, `isGuest` |
| **Help Search** | Debounced search executed | `resultCount`, `queryLength` |
| **FAQ Opened** | FAQ accordion expands | `faqId`, `module: help` |
| **Support Contact Clicked** | Contact Support CTA | `source: help_screen`, `isGuest` |
| **Support Ticket Viewed** | Request row / detail opened | `ticketId`, `status` |

No PII (email, message body) in analytics payloads.

Align with `docs/ANALYTICS.md` naming; dev stub `console.info` in development only.

---

## 16. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Content | `src/data/mock-help-support.ts` — articles, categories, FAQs, tickets |
| Config | `src/config/help-support-screen.ts` — copy, routes, category keys, status labels |
| Utils | `src/utils/help-support-screen.ts` — search index, filter helpers, guest vs auth visibility |
| Route | `src/app/help/page.tsx` + client shell |
| Components | Compose existing Search Bar, FaqAccordion, Empty State, Badge, Button |
| Contact | Mock modal/form — toast on submit; append to local mock ticket list optional |
| Reuse FAQ | Extend `faq-accordion` config with `help` module items — do not contradict membership FAQ answers |
| No | Support backend · Supabase tickets · Zendesk/Intercom · real email send · CMS fetch |
| Tokens | Design tokens only |
| No implementation code in this document | |

Suggested mock ticket example:

| Ticket ID | Subject | Date | Status |
|-----------|---------|------|--------|
| AUD-1042 | Export PDF not downloading | Aug 10, 2026 | Pending |
| AUD-1038 | Question about Business credits | Aug 2, 2026 | Resolved |

---

## 17. Relationship to Other Screens

| Screen | Relationship |
|--------|--------------|
| **SCREEN-011 Manage Membership** | Membership FAQ overlap — Help is superset; deep-link “Billing & Payments” category |
| **SCREEN-020 Business Workspace** | Team & Business articles link to workspace |
| **SCREEN-022 Roles & Permissions** | Team roles FAQ answer links here |
| **SCREEN-003 Audit Failed** | Contact Support entry may route to Help |
| **Settings (SCREEN-019)** | Account & Security articles reference settings paths |

---

## 18. QA Checklist

□ Guest: limited public help; no Recent Support Requests  
□ Authenticated: full layout with mocked requests  
□ Search placeholder: “Search help articles”  
□ Search filters mock content  
□ All seven categories displayed  
□ FAQ sample questions present and expandable  
□ Contact Support: “Still need help?” + CTA  
□ Requests: Ticket ID, Subject, Date, Status (Open / Pending / Resolved)  
□ Empty requests: “No support requests yet.” + Contact Support  
□ States: Loading, Error, empty search, empty requests  
□ WCAG 2.2 AA — keyboard, search, accordion  
□ Desktop / tablet / mobile layouts  
□ Analytics: Help Viewed, Help Search, FAQ Opened, Support Contact Clicked, Support Ticket Viewed  
□ Mock only — no backend / helpdesk  

---

## 19. Non-goals

| Out of scope |
|--------------|
| Live helpdesk / Zendesk / Intercom embed |
| Real ticket creation, email, or SLA tracking |
| CMS / headless content API |
| AI chat support |
| Article CMS authoring UI |
| File attachments on support requests |
| Agent/admin support console |

---

**End of SCREEN-023_HELP_AND_SUPPORT.md**
