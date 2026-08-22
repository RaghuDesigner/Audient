# COMPONENT — Support Category Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-063 (Support Category Card)  
**Component name:** Support Category Card (`SupportCategoryCard`)  
**Primary screen:** Help & Support (`docs/screens/SCREEN-023_HELP_AND_SUPPORT.md`)  
**Related:** Help Search (`COMPONENT_HELP_SEARCH.md`) — category filter scopes search · FAQ Accordion — filtered by selected category · Card primitive (`src/components/ui/card.tsx`) · Help Support Categories grid — composes multiple cards  
**Figma:** Help & Support category tiles — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — article counts derived from in-memory mock index; **no backend**, **no CMS**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-023_HELP_AND_SUPPORT.md` · `src/config/help-support-screen.ts` · `src/data/mock-help-support.ts`

---

## 1. Purpose

Provides **navigation to help categories** on the Help & Support screen.

Each card represents one fixed support category. Selecting a card filters Help Search results and the FAQ Accordion to that category (toggle off to clear filter).

**Do not redesign.** Match Figma.

---

## 2. Categories

Seven fixed categories — align keys and labels with `HELP_SUPPORT_CATEGORIES` / `HELP_SUPPORT_CATEGORY_LABELS` in `help-support-screen.ts`:

| Key (internal) | Label |
|----------------|-------|
| `getting_started` | Getting Started |
| `audits` | Audits |
| `reports` | Reports |
| `membership` | Membership |
| `billing_payments` | Billing & Payments |
| `team_business` | Team & Business |
| `account_security` | Account & Security |

| Rule | Spec |
|------|------|
| Fixed set | Do not invent additional categories this phase |
| Guest | All categories **visible**; counts may reflect guest-visible articles only when `guest={true}` |
| Icons | One decorative icon per category — Figma / Lucide equivalent; **`aria-hidden`** |

### Suggested descriptions (mock — Figma wins)

| Category | Description (example) |
|----------|------------------------|
| **Getting Started** | First audit, account setup, credits overview |
| **Audits** | Screenshot vs URL audits, processing, failures |
| **Reports** | Scores, findings, strengths, export |
| **Membership** | Free, Pro, and Business plans |
| **Billing & Payments** | Invoices, payment methods, refunds |
| **Team & Business** | Workspace, invites, roles |
| **Account & Security** | Profile, SSO, privacy |

Store in config — do not hardcode in component body.

---

## 3. Display

| Element | Spec |
|---------|------|
| **Icon** | Leading category icon in muted token surface — decorative |
| **Category** | Visible category title (label from config) |
| **Description** | One-line supporting copy below title — optional if Figma omits |
| **Article count** | Count of mock articles in category — e.g. **3 articles**; include FAQs in count optionally if product prefers **3 items** — Figma wins |

Compose on design-system **Card** — interactive / clickable when used as filter toggle.

| Layout (responsive) | Spec |
|---------------------|------|
| **Desktop** | Grid cell — multi-column with sibling cards |
| **Tablet** | 2-column grid |
| **Mobile** | Single column; full-width card; min **44px** touch height |

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| **Click / tap** | Select category → parent applies filter to Help Search + FAQ |
| **Toggle** | Second activation on selected card **clears** filter (deselect) — per SCREEN-023 |
| **Selected** | Elevated Card variant + visible focus/selection ring (`aria-pressed="true"`) |
| **Keyboard** | Enter / Space activates card (Card `clickable` pattern) |
| **Navigate** | **No** route change this phase — filter-only unless Figma shows deep-link |

Article count is **computed** from mock articles (+ optional FAQ tags) — not fetched from API.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Unselected; standard Card |
| **Selected** | Filter active for this category |
| **Hover** | Interactive elevation / hover token |
| **Focused** | Visible focus ring |
| **Pressed** | Active press styles |
| **Disabled** | Optional — parent screen loading; `aria-disabled` |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `category` | category key | Yes | Internal id |
| `label` | string | Yes | Display title |
| `description` | string | No | One-line summary |
| `articleCount` | number | Yes | Mock-derived count |
| `selected` | boolean | No | Filter active |
| `disabled` | boolean | No | Loading / inactive |
| `onSelect` | `(category) => void` | Yes | Activation handler |
| `icon` | ReactNode | No | Override default icon |
| `className` | string | No | |

Parent grid passes one card per category; parent owns selected state.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Control | Activatable **button** or clickable Card with keyboard support |
| Name | Accessible name includes **category label** — e.g. “Getting Started, 3 articles” |
| Selected | `aria-pressed="true"` when selected; `false` when not |
| Icon | Decorative — meaning in text (label + count) |
| Focus | Visible focus ring on activation target |
| Color | Selection not color-only — ring/elevation + `aria-pressed` + label |
| Touch | Min 44px hit target on mobile |

Article count should be exposed to screen readers (visible text or `aria-label` suffix).

---

## 8. Analytics (optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| **Help Category Selected** | Card activated (select) | `category`, `articleCount` |
| **Help Category Cleared** | Selected card deselected | `category` |

Align with Help & Support screen analytics; dev stub only.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | 3–4 column grid (parent) |
| **Tablet** | 2 columns |
| **Mobile** | 1 column; stacked icon + text |

Card content may wrap description; truncate with `title` tooltip only if Figma allows.

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Help Support Categories** | Grid section composing multiple `SupportCategoryCard` instances — refactor target for current inline Card map |
| **Help Search** | Receives `category` filter from parent when card selected |
| **FAQ Accordion** | Items filtered by same category |
| **Card (ui)** | Base primitive — do not fork styling |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `HELP_SUPPORT_CATEGORIES` · `HELP_SUPPORT_CATEGORY_LABELS` · `mock-help-support` articles |
| Config | `src/config/support-category-card.ts` — descriptions, icon map, count label copy |
| Utils | `src/utils/support-category-card.ts` — `countArticlesByCategory()`, guest-aware counts |
| Component | `src/components/help/SupportCategoryCard.tsx` |
| Grid | `HelpSupportCategories.tsx` composes cards |
| No | Backend · CMS · dynamic category API |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ All seven categories render with icon, label, description, article count  
□ Select filters Help Search + FAQ; deselect clears  
□ Selected state: visual + `aria-pressed`  
□ Keyboard accessible with visible focus  
□ WCAG 2.2 AA — not color-only selection  
□ Guest counts respect public corpus when applicable  
□ Desktop / tablet / mobile grid  
□ Mock data only — no backend  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Category detail / article list pages |
| CMS-managed categories |
| Badges for “new” content |
| External help portal links |
| Tier-gated category hiding (all visible this phase) |

---

**End of COMPONENT_SUPPORT_CATEGORY_CARD.md**
