# Audient — Detailed Component Specifications

**Status:** Draft (in progress)
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** COMPONENT_MAPPING.md, COMPONENT_ARCHITECTURE.md, DESIGN_TOKENS.md, CURSOR_RULES.md

Field-level specifications for individual components, documented one at a time. Complements the higher-level COMPONENT_MAPPING.md. No React code — props are described conceptually.

---

## Button

### Design Decision: One Component, Many Variants
The design system defines seven button types — **Primary, Secondary, Outline, Ghost, Icon, Danger, Loading**. These are **not seven separate React components**. They map to a **single reusable `Button` component** (`components/ui/button`, built on shadcn/ui) configured through props:

- **Primary / Secondary / Outline / Ghost / Danger** → the `variant` prop.
- **Icon Button** → the `iconOnly` prop (+ `size`), usable with any variant.
- **Loading Button** → the `isLoading` state, usable with any variant.

This honors DRY and reusability (CURSOR_RULES §1, §2): one accessible, token-driven component instead of seven near-duplicates that would drift.

```text
<Button variant="primary" | "secondary" | "outline" | "ghost" | "danger"
        size="sm" | "md" | "lg"
        iconOnly? isLoading? disabled? fullWidth?
        iconLeft? iconRight? />
```

### Shared Props (all buttons)
| Prop | Meaning |
|------|---------|
| `variant` | Visual style: `primary`, `secondary`, `outline`, `ghost`, `danger`. |
| `size` | `sm`, `md`, `lg` — controls padding/height and text size. |
| `isLoading` | Shows a spinner and disables interaction while an action is in flight. |
| `disabled` | Non-interactive, visually muted. |
| `iconLeft` / `iconRight` | Optional leading/trailing icon (Lucide). |
| `iconOnly` | Renders a square icon-only button (requires `aria-label`). |
| `fullWidth` | Stretches to container width (common on mobile). |
| `type` | `button`, `submit`, `reset`. |
| `onClick` | Click handler. |

### Shared States (all buttons)
`default` · `hover` · `active/pressed` · `focus-visible` · `disabled` · `loading`.

### Shared Accessibility Baseline (all buttons)
- Rendered as a native `<button>` (or `<a>` when it navigates) with correct semantics.
- **Visible focus ring** (`focus-visible`) meeting contrast requirements.
- `aria-busy="true"` while `isLoading`; the button is non-interactive during loading.
- `aria-disabled`/`disabled` communicated to assistive tech.
- **Icon-only buttons must have an `aria-label`** (accessible name).
- Text/background contrast ≥ **4.5:1** (WCAG AA); never rely on color alone.
- Fully keyboard operable (Enter/Space activate).

---

### 1. Primary Button
- **Figma:** `Primary Button` → **React:** `Button variant="primary"`
- **Purpose:** The main call-to-action on a screen — the single most important action (Run Audit, Upgrade, Download).
- **Props:** shared props with `variant="primary"`.
- **Variants:** sizes (sm/md/lg); with/without icon; full-width (mobile).
- **States:** default, hover (slightly darker Primary), active, focus, disabled, loading.
- **Accessibility:** High-contrast Primary `#1C018E` on white (meets AA); prominent focus ring.
- **Reusability:** Use once per view as the dominant action; reuse everywhere a primary action exists.
- **Best Practices:** Only **one primary button per view/section** to preserve visual hierarchy; use clear action verbs; avoid for destructive actions (use Danger).

### 2. Secondary Button
- **Figma:** `Secondary Button` → **React:** `Button variant="secondary"`
- **Purpose:** A secondary action shown alongside the primary (Cancel-adjacent, "View details", secondary CTAs).
- **Props:** shared props with `variant="secondary"`.
- **Variants:** sizes; with/without icon.
- **States:** default, hover, active, focus, disabled, loading.
- **Accessibility:** Uses Secondary `#8050E6`; ensure text contrast meets AA on its background.
- **Reusability:** Pair with a Primary button for two-action layouts.
- **Best Practices:** Never compete visually with the Primary; use for the less-important of two adjacent actions.

### 3. Outline Button
- **Figma:** `Outline Button` → **React:** `Button variant="outline"`
- **Purpose:** A lower-emphasis action that still needs a defined boundary (filters, "Add competitor", tertiary actions).
- **Props:** shared props with `variant="outline"`.
- **Variants:** sizes; with/without icon.
- **States:** default (transparent bg, bordered), hover (subtle fill), active, focus, disabled, loading.
- **Accessibility:** Border and text contrast must meet AA; hover state must not be the only affordance.
- **Reusability:** Good default for neutral actions on cards/toolbars.
- **Best Practices:** Use when an action needs to be visible but not dominant; keep border/token consistent.

### 4. Ghost Button
- **Figma:** `Ghost Button` → **React:** `Button variant="ghost"`
- **Purpose:** Minimal, low-emphasis action for dense or subtle contexts (menu items, inline actions, "Dismiss").
- **Props:** shared props with `variant="ghost"`.
- **Variants:** sizes; icon-only (common for toolbars).
- **States:** default (no bg/border), hover (subtle bg), active, focus, disabled, loading.
- **Accessibility:** Because there's no border/fill at rest, ensure a **clear focus and hover state**; text still meets contrast.
- **Reusability:** Ideal in toolbars, table rows, and navbars where chrome should stay light.
- **Best Practices:** Don't use for important actions (too low-emphasis); ensure it's discoverable (not invisible until hover).

### 5. Icon Button
- **Figma:** `Icon Button` → **React:** `Button iconOnly` (+ any `variant`, usually `ghost`/`outline`)
- **Purpose:** Compact action represented by an icon alone (close, more-options, refresh, notifications).
- **Props:** shared props with `iconOnly`; requires an icon and an `aria-label`.
- **Variants:** any variant; sizes (square); shape (square/rounded).
- **States:** default, hover, active, focus, disabled, loading (spinner replaces icon).
- **Accessibility:** **Must have `aria-label`** (no visible text); adequate **tap target** (≥ 44×44px on mobile); tooltip recommended for discoverability.
- **Reusability:** Reuse in navbar, cards, tables, dialogs.
- **Best Practices:** Only use for universally understood icons; provide a tooltip; ensure the tap target isn't smaller than the icon.

### 6. Danger Button
- **Figma:** `Danger Button` → **React:** `Button variant="danger"`
- **Purpose:** Destructive/irreversible actions (Delete audit, Cancel subscription, Delete account).
- **Props:** shared props with `variant="danger"`.
- **Variants:** solid danger, outline-danger; sizes.
- **States:** default (Error `#DC2626`), hover (darker), active, focus, disabled, loading.
- **Accessibility:** Error color paired with a clear text label (never color-only); AA contrast; typically paired with a ConfirmDialog.
- **Reusability:** Reuse for all destructive confirmations.
- **Best Practices:** Always confirm destructive actions (ConfirmDialog); label explicitly ("Delete audit", not "OK"); never make it the default focus in a dialog.

### 7. Loading Button
- **Figma:** `Loading Button` → **React:** `Button isLoading` (state of any variant)
- **Purpose:** Communicate an in-progress action (submitting an audit, redirecting to checkout) and prevent double submission.
- **Props:** shared props with `isLoading={true}`; optionally a `loadingText`.
- **Variants:** applies to any variant (primary-loading, danger-loading, etc.).
- **States:** loading (spinner shown, interaction blocked) → resolves back to default/disabled.
- **Accessibility:** `aria-busy="true"`; spinner has an accessible label ("Loading"); button is non-interactive to prevent duplicate actions; keep the label or show `loadingText` so context isn't lost.
- **Reusability:** Any async action button uses this state — never build a separate spinner button.
- **Best Practices:** Disable during loading to prevent double-clicks; preserve button width to avoid layout shift; pair with idempotency on the server for charge/audit actions.

---

### Button Mapping Summary
| Figma Button | React Configuration | Primary Use |
|--------------|---------------------|-------------|
| Primary Button | `Button variant="primary"` | Main CTA (Run Audit, Upgrade) |
| Secondary Button | `Button variant="secondary"` | Secondary action beside primary |
| Outline Button | `Button variant="outline"` | Lower-emphasis bordered action |
| Ghost Button | `Button variant="ghost"` | Minimal/inline action |
| Icon Button | `Button iconOnly` (+ variant) | Compact icon-only action |
| Danger Button | `Button variant="danger"` | Destructive action (Delete) |
| Loading Button | `Button isLoading` (+ variant) | In-progress async action |

### Dependencies
- shadcn/ui Button (Radix Slot for `asChild` when rendering as a link).
- Design tokens (DESIGN_TOKENS.md): Primary `#1C018E`, Secondary `#8050E6`, Error `#DC2626`, radii, Manrope type scale — applied via `tailwind.config.ts`.
- Icon set: Lucide.
- Variant handling: a class-variance utility (`cva`) + `cn` for composing variant/size classes.

### Anti-Patterns to Avoid
- ❌ Creating separate components like `PrimaryButton`, `DangerButton` (duplicates variants → drift).
- ❌ Hardcoding colors instead of tokens.
- ❌ Icon-only buttons without an `aria-label`.
- ❌ Multiple primary buttons competing in one view.
- ❌ A bespoke spinner button instead of the `isLoading` state.

---

## Input Components

All input components are built on shadcn/ui primitives, styled with design tokens (Manrope; Error `#DC2626` for invalid states; radii 4/8px), and validated with a shared schema library (Zod) via React Hook Form. They share a consistent contract: a **label**, optional **helper text**, an **error** message linked for assistive tech, and standard states (default / focus / filled / error / disabled).

### Shared Conventions (all inputs)
- **Validation:** schema-based (Zod) at the field and form level; server re-validates (never trust the client).
- **Error states:** `error` prop renders Error-colored border + message; `aria-invalid="true"`; message linked via `aria-describedby`.
- **Loading states:** inputs are typically disabled during form submission (`isSubmitting`); async inputs (URL check, search) may show an inline spinner/adornment.
- **Accessibility baseline:** every field has an associated `<label>` (via `htmlFor`); helper/error text linked with `aria-describedby`; visible focus ring; contrast ≥ 4.5:1; never color-only for errors (icon + text).
- **Dependencies (shared):** shadcn/ui primitives, React Hook Form, Zod, design tokens, Lucide icons.

---

### 1. Text Input
- **Figma:** `Text Input` / `Text Field` → **React Component Name:** `Input` (`components/ui/input`)
- **Props:** `value`, `onChange`, `label`, `placeholder`, `type` (text), `error`, `helperText`, `disabled`, `required`, `maxLength`, `iconLeft`.
- **Validation:** required/optional, min/max length, pattern; trimmed on submit.
- **Error States:** invalid → Error border + message; `aria-invalid`.
- **Loading States:** disabled during form submit; no inline spinner by default.
- **Accessibility:** labeled; error via `aria-describedby`; placeholder not a label substitute.
- **Dependencies:** shadcn/ui Input, RHF, Zod, tokens.

### 2. Website URL Input
- **Figma:** `URL Input` → **React Component Name:** `UrlInput` (`components/audit/url-input`, wraps `Input`)
- **Props:** `value`, `onChange`, `label`, `placeholder`, `error`, `helperText`, `disabled`, `isValidating`, `onValidate`.
- **Validation:** must be a valid `http/https` URL; normalized (add scheme, trim); **client-side SSRF-aware hints** (reject obviously invalid/local hosts) with authoritative **server-side SSRF validation** (SECURITY.md §3). Tier gate: enabled only for Pro/Enterprise.
- **Error States:** invalid URL format, unreachable host, or `TIER_NOT_ALLOWED` (Free) → contextual message; optionally an upgrade prompt.
- **Loading States:** `isValidating` shows an inline spinner/adornment while checking reachability before submit.
- **Accessibility:** labeled; `inputmode="url"`; errors announced; disabled state (Free) explains why.
- **Dependencies:** `Input`, RHF, Zod, URL/SSRF validation util, `useAudit`.

### 3. Password
- **Figma:** `Password Field` → **React Component Name:** `PasswordField` (`components/auth/password-field`)
- **Props:** `value`, `onChange`, `label`, `error`, `helperText`, `showStrength`, `disabled`, `autoComplete`.
- **Validation:** min length + strength rules on sign-up; required on sign-in; matches confirm field where applicable.
- **Error States:** weak/mismatch/required → message; strength meter reflects quality.
- **Loading States:** disabled during auth submission.
- **Accessibility:** show/hide toggle is a button with `aria-pressed` and label ("Show password"); strength conveyed in **text**, not color-only; correct `autoComplete` (`current-password`/`new-password`).
- **Dependencies:** `Input`, toggle button, RHF, Zod, Supabase Auth.

### 4. Search
- **Figma:** `Search` / `Search Bar` → **React Component Name:** `SearchInput` (`components/common/search-input`, wraps `Input`)
- **Props:** `value`, `onChange`, `placeholder`, `onSearch`, `isLoading`, `debounceMs`, `clearable`.
- **Validation:** lightweight (trim, optional min length before querying); no hard validation.
- **Error States:** typically none inline; empty-result handled by the consuming list (EmptyState).
- **Loading States:** `isLoading` shows an inline spinner while results fetch (debounced input).
- **Accessibility:** `role="searchbox"` (or `type="search"`); labeled (visible or `aria-label`); clear button labeled; results announced via a live region on the list.
- **Dependencies:** `Input`, debounce util, Lucide (search/clear icons).

### 5. Text Area
- **Figma:** `Text Area` → **React Component Name:** `Textarea` (`components/ui/textarea`)
- **Props:** `value`, `onChange`, `label`, `placeholder`, `rows`, `error`, `helperText`, `disabled`, `maxLength`, `autoResize`.
- **Validation:** min/max length; required/optional (e.g., feedback comment).
- **Error States:** invalid/over-limit → Error border + message; optional character counter.
- **Loading States:** disabled during submit.
- **Accessibility:** labeled; error via `aria-describedby`; counter announced politely; resize preserves usability.
- **Dependencies:** shadcn/ui Textarea, RHF, Zod, tokens.

### 6. Dropdown (Select)
- **Figma:** `Dropdown` / `Select` → **React Component Name:** `Select` (`components/ui/select`)
- **Props:** `options`, `value`, `onChange`, `label`, `placeholder`, `error`, `helperText`, `disabled`, `searchable` (optional).
- **Validation:** required selection where applicable; value must be within `options`.
- **Error States:** no selection when required → message; `aria-invalid`.
- **Loading States:** `isLoading` for async options (disabled + spinner in trigger).
- **Accessibility:** Radix Select — `role="listbox"/"option"`; keyboard nav (arrows/Enter/Esc/type-ahead); selection announced; labeled.
- **Dependencies:** shadcn/ui Select (Radix), RHF, tokens.

### 7. Checkbox
- **Figma:** `Checkbox` → **React Component Name:** `Checkbox` (`components/ui/checkbox`)
- **Props:** `checked`, `onCheckedChange`, `label`, `error`, `helperText`, `disabled`, `indeterminate`.
- **Validation:** required (e.g., accept Terms) → must be checked; group min/max where applicable.
- **Error States:** required-unchecked → message beside the group; `aria-invalid` on the control.
- **Loading States:** disabled during submit; rarely async.
- **Accessibility:** Radix Checkbox; associated label clickable; `aria-checked` (incl. `mixed` for indeterminate); keyboard toggle (Space).
- **Dependencies:** shadcn/ui Checkbox (Radix), RHF, tokens.

### 8. Radio
- **Figma:** `Radio` / `Radio Group` → **React Component Name:** `RadioGroup` (`components/ui/radio-group`)
- **Props:** `options`, `value`, `onChange`, `name`, `label` (group), `error`, `disabled`, `orientation`.
- **Validation:** required selection within the group; single value.
- **Error States:** none selected when required → group-level message.
- **Loading States:** disabled during submit.
- **Accessibility:** `role="radiogroup"` with a group label (`aria-labelledby`); arrow-key navigation between options; each option labeled; only one selectable.
- **Dependencies:** shadcn/ui RadioGroup (Radix), RHF, tokens.

### 9. Switch (Toggle)
- **Figma:** `Switch` / `Toggle` → **React Component Name:** `Switch` (`components/ui/switch`)
- **Props:** `checked`, `onCheckedChange`, `label`, `helperText`, `disabled`.
- **Validation:** boolean; no complex validation (used for settings like `emailNotifications`, dark mode, billing interval).
- **Error States:** rarely errors; if a toggle triggers an async save that fails, revert + show a toast.
- **Loading States:** optional `isPending` while an immediate-save toggle persists (disabled + subtle spinner); revert on failure.
- **Accessibility:** `role="switch"` with `aria-checked`; labeled; keyboard toggle (Space/Enter); state conveyed beyond color (on/off + label).
- **Dependencies:** shadcn/ui Switch (Radix), tokens; optional optimistic-update hook.

---

### Input Components Summary
| Figma | React Component | Key Validation | Async/Loading |
|-------|-----------------|----------------|---------------|
| Text Input | `Input` | length/pattern/required | disabled on submit |
| URL Input | `UrlInput` | URL + SSRF + tier gate | `isValidating` spinner |
| Password | `PasswordField` | length/strength/match | disabled on submit |
| Search | `SearchInput` | trim/min length | `isLoading` (debounced) |
| Text Area | `Textarea` | min/max length | disabled on submit |
| Dropdown | `Select` | required/in-options | async options spinner |
| Checkbox | `Checkbox` | required/group rules | disabled on submit |
| Radio | `RadioGroup` | required single choice | disabled on submit |
| Switch | `Switch` | boolean | optional optimistic save |

### Form Composition Notes
- Wrap inputs in a shared **`FormField`** pattern (label + control + helper/error) so every field is consistent and accessible by default.
- **React Hook Form + Zod** drives validation; the same Zod schemas are reused on the **server** for authoritative validation (DRY — CURSOR_RULES §2).
- All inputs use design tokens (no hardcoded colors); error styling always pairs color with an icon and text (WCAG AA).

---

## Card Components

All cards are built on the base **`Card`** primitive (`components/ui/card`, shadcn/ui) — a container providing consistent padding, radius (Large 16px), surface color (`#F8FDFF`), and optional shadow. The specialized cards below **compose** the base `Card` rather than reimplementing it, keeping styling consistent and honoring reusability (CURSOR_RULES §1).

### Base Card Anatomy (shared)
`Card` → optional `CardHeader` (title/actions) + `CardContent` + optional `CardFooter`. All specialized cards use this anatomy.

### Shared Accessibility Baseline (all cards)
- Cards are containers, not controls — use headings inside for structure (don't skip heading levels).
- **Interactive/clickable cards** expose button or link semantics with keyboard activation and a visible focus ring; non-interactive cards remain neutral regions.
- Any status/score conveyed by color is paired with **text** (WCAG AA); contrast ≥ 4.5:1.
- Decorative icons are `aria-hidden`; meaningful values are in text.

---

### 1. Audit Score Card
- **Figma:** `Audit Score Card` → **React:** `ScoreCard` (`components/audit/score-card`)
- **Purpose:** Prominently display a UX score (0–100) — overall or a category (accessibility, conversion, mobile).
- **Props:** `score`, `label`, `size` (overall/large vs. category/small), `trend` (optional vs. previous audit), `isLoading`.
- **Variants:** overall (large gauge), category (compact); score-band color (e.g., red/amber/green ranges); with/without trend.
- **Reusability:** Very high — results page, dashboard overview, history rows, and the PDF report template (single source of truth).
- **Child Components:** `Card`, gauge/progress visual, `Badge` (optional band), `Skeleton` (loading), trend indicator.
- **Accessibility:** Numeric score in **text** (not gauge-only); `aria-label` describing score + label (e.g., "Overall UX score 72 out of 100"); color bands paired with the number; trend not conveyed by color alone.

### 2. Recommendation Card
- **Figma:** `Recommendation Card` / `Issue Card` → **React:** `RecommendationCard` (`components/audit/recommendation-card`)
- **Purpose:** Present a single UX finding — title, severity, description, recommended fix, business impact, and evidence.
- **Props:** `recommendation` (category, severity, priority, title, description, recommendation, businessImpact, screenshotRef), `defaultExpanded`.
- **Variants:** by severity (Critical/Major/Minor accent); collapsed/expanded; compact (list) vs. full (PDF).
- **Reusability:** Very high — results recommendation list and the PDF report (identical rendering in both).
- **Child Components:** `Card`, `SeverityBadge`, `Badge` (category/priority), `AnnotatedScreenshot`, disclosure/expander, `Button` (optional actions).
- **Accessibility:** Expand/collapse via accessible disclosure (`aria-expanded`); severity via `SeverityBadge` (text+color); annotated image has descriptive `alt`; logical heading for the title.

### 3. Pricing Card
- **Figma:** `Pricing Card` / `Plan Card` → **React:** `PlanCard` (`components/pricing/plan-card`)
- **Purpose:** Present a single plan (Free/Pro/Enterprise) — price, features, and CTA.
- **Props:** `plan` (name, price, credits, features, billingInterval), `isCurrent`, `isRecommended`, `onSelect`.
- **Variants:** default, recommended (Primary accent + highlight), current-plan, disabled; monthly/yearly price display.
- **Reusability:** High — composes the marketing PricingTable and the in-app UpgradeDialog.
- **Child Components:** `Card`, `Badge` ("Recommended"/"Current"), feature list, `CheckoutButton`/`Button`.
- **Accessibility:** Heading per plan; features as a real `<ul>`; price/period readable by screen readers; "current"/"recommended" conveyed in **text**, not color-only; CTA clearly labeled per plan.

### 4. Dashboard Card
- **Figma:** `Dashboard Card` → **React:** `DashboardCard` (`components/dashboard/dashboard-card`)
- **Purpose:** Generic sectioned container on the dashboard (wraps a widget/section with a title and optional actions).
- **Props:** `title`, `actions`, `children`, `padding`, `isLoading`.
- **Variants:** default, with-header-actions, compact; loading (skeleton).
- **Reusability:** High — wraps RecentAuditsList, QuickAuditWidget, charts, and other dashboard sections.
- **Child Components:** `Card`, `CardHeader` (title + actions), `Skeleton`, arbitrary `children`.
- **Accessibility:** Section has a heading (`CardHeader` title); actions are real buttons/links; loading state announced.

### 5. Credit Card
- **Figma:** `Credit Card` / `Credits Widget` → **React:** `CreditCard` (`components/billing/credit-card`) — wraps `CreditMeter`
- **Purpose:** Show the user's credit status — remaining balance (or "Unlimited"), monthly grant, reset date, and a top-up action.
- **Props:** `balance`, `monthlyGrant`, `isUnlimited`, `nextResetAt`, `onTopUp`.
- **Variants:** normal, low-balance (warning), unlimited (Enterprise); compact vs. full.
- **Reusability:** High — billing page (full) and dashboard (compact); the navbar uses the lighter `CreditMeter` directly.
- **Child Components:** `Card`, `CreditMeter`, progress bar, `Button` (Top up), `Badge` (Unlimited/low).
- **Accessibility:** Low-balance not color-only (icon + text); balance and reset date in text; `aria-live` when the balance updates; "Unlimited" stated in text.
- **Note:** "Credit Card" here means the **audit-credits** widget — unrelated to payment cards (which are handled entirely by Stripe; never stored).

### 6. Metric Card
- **Figma:** `Metric Card` / `Stat Card` → **React:** `StatCard` (`components/dashboard/stat-card`)
- **Purpose:** Display a single KPI/metric (audits run, average score, credits used).
- **Props:** `label`, `value`, `icon`, `trend`, `isLoading`.
- **Variants:** default, with-trend (up/down), with-icon; loading.
- **Reusability:** High — dashboard overview and any analytics view.
- **Child Components:** `Card`, icon, trend indicator, `Skeleton`.
- **Accessibility:** Label and value both in text; trend direction conveyed with icon + text (not color alone); decorative icon `aria-hidden`.

### 7. Report Card
- **Figma:** `Report Card` → **React:** `ReportCard` (`components/report/report-card`)
- **Purpose:** Summarize a completed audit/report as an entry in history — website, date, overall score, status, and quick actions (view/download).
- **Props:** `audit` (websiteUrl, status, overallScore, createdAt), `onView`, `onDownload`, `tier`.
- **Variants:** completed, processing, failed; with/without PDF download (tier-gated).
- **Reusability:** High — the primary row/tile in AuditHistoryTable and RecentAuditsList.
- **Child Components:** `Card`, `ScoreCard` (compact), `Badge` (status), `PdfDownloadButton`, `Button` (View).
- **Accessibility:** The card (or its title) is a keyboard-activatable link to the audit; status via badge (text+color); score in text; actions individually labeled.

---

### Card Components Summary
| Figma Card | React Component | Composes / Children | Primary Location |
|------------|-----------------|---------------------|------------------|
| Audit Score Card | `ScoreCard` | Card, gauge, Badge | Results, dashboard, PDF |
| Recommendation Card | `RecommendationCard` | Card, SeverityBadge, AnnotatedScreenshot | Results list, PDF |
| Pricing Card | `PlanCard` | Card, Badge, CheckoutButton | Pricing, UpgradeDialog |
| Dashboard Card | `DashboardCard` | Card, CardHeader, Skeleton | Dashboard sections |
| Credit Card | `CreditCard` | Card, CreditMeter, Button | Billing, dashboard |
| Metric Card | `StatCard` | Card, icon, trend | Dashboard, analytics |
| Report Card | `ReportCard` | Card, ScoreCard, Badge, PdfDownloadButton | History, dashboard |

### Composition & Reuse Notes
- **All specialized cards compose the base `Card`** — never re-create padding/radius/shadow; extend via children and props.
- **Shared sub-widgets** (`ScoreCard`, `SeverityBadge`, `Badge`, `PdfDownloadButton`) are reused across multiple cards and in the PDF template, so web and PDF stay visually identical.
- **Design tokens only** — surface (`#F8FDFF`), radius (16px), shadows, and Manrope type come from tokens; no hardcoded values.
- **Interactive cards** (Report Card, clickable list tiles) must be keyboard-accessible with visible focus, not click-only.

---

## Navigation Components

Navigation components orient users and move them through the app. They are built on shadcn/ui + Radix primitives where interactivity/overlays are involved, styled with design tokens, and are **mobile-first responsive** (PRD §6.5). Landmarks and keyboard support are mandatory.

### Shared Accessibility Baseline (all navigation)
- Use semantic landmarks: `nav` for navigation regions, `header`/`footer` for banner/contentinfo.
- The **current location** is indicated with `aria-current="page"` (not color alone).
- All items are keyboard operable with a **visible focus ring**; overlays/menus trap focus and close on Esc.
- Provide a **skip-to-content** link so keyboard/screen-reader users can bypass navigation.

---

### 1. Navbar
- **React:** `Navbar` (`components/layout/navbar`)
- **Props:** `user`, `credits`, `onOpenNotifications`, `variant` (marketing/app).
- **Variants:** marketing (public: logo + nav links + sign-in/CTA) vs. app (authenticated: logo + CreditMeter + NotificationMenu + ProfileMenu); default vs. scrolled (elevated).
- **Accessibility:** `header` banner + `nav` landmark; keyboard-operable menus; logo links home; current section indicated.
- **Responsive Behaviour:** Full horizontal bar on desktop; on mobile, collapses secondary items into a **hamburger menu** (Sheet/drawer); credit meter condenses to an icon+number; touch-friendly targets (≥44px).

### 2. Sidebar
- **React:** `Sidebar` (`components/layout/sidebar`)
- **Props:** `items`, `activePath`, `collapsed`, `onToggle`.
- **Variants:** expanded (icon + label), collapsed (icon-only); with section groups; with footer (e.g., upgrade prompt).
- **Accessibility:** `nav` landmark with a label ("Main navigation"); `aria-current="page"` on the active item; collapse control is a labeled button (`aria-expanded`); keyboard navigable.
- **Responsive Behaviour:** Persistent on desktop (expanded or collapsible to icons); on mobile, hidden by default and opened as an **off-canvas drawer** (Sheet) via the navbar menu; closes on selection/overlay tap.

### 3. Footer
- **React:** `Footer` (`components/layout/footer`)
- **Props:** `links` (grouped), `variant` (marketing/minimal).
- **Variants:** marketing (multi-column: product, company, legal, social) vs. minimal (in-app: copyright + key links).
- **Accessibility:** `contentinfo` landmark; descriptive link text (no "click here"); link groups have headings.
- **Responsive Behaviour:** Multi-column on desktop; **stacks into a single column** on mobile with adequate spacing; social icons keep labels.

### 4. Breadcrumb
- **React:** `Breadcrumb` (`components/ui/breadcrumb`)
- **Props:** `items` (label + href), `separator`.
- **Variants:** default; with truncation/ellipsis for long paths; with leading home icon.
- **Accessibility:** `nav` with `aria-label="Breadcrumb"`; ordered list; the **current page** is `aria-current="page"` and not a link; separators are decorative (`aria-hidden`).
- **Responsive Behaviour:** Full trail on desktop; on mobile, **collapses middle items to an ellipsis** (showing first + current, or just a back link) to save space.

### 5. Tabs
- **React:** `Tabs` (`components/ui/tabs`)
- **Props:** `tabs` (label + panel), `activeTab`, `onChange`.
- **Variants:** underline, pill/segmented; full-width vs. inline; with icons/counts.
- **Accessibility:** Radix Tabs — `role="tablist"/"tab"/"tabpanel"`; **arrow-key** navigation; active tab has `aria-selected`; panel linked to its tab.
- **Responsive Behaviour:** Inline on desktop; on mobile, becomes **horizontally scrollable** (swipeable) or condenses; avoid wrapping that breaks alignment. For many sections, may switch to a Select on very small screens.

### 6. Pagination
- **React:** `Pagination` (`components/ui/pagination`)
- **Props:** `page`, `pageCount`, `onPageChange`, `hasNext`, `hasPrev` (or cursor-based: `onNext`/`onPrev`).
- **Variants:** numbered (with ellipsis), simple prev/next, load-more/infinite (for history feeds).
- **Accessibility:** `nav` with `aria-label="Pagination"`; current page `aria-current="page"`; prev/next buttons labeled and disabled at bounds; changes announced via a live region.
- **Responsive Behaviour:** Numbered pages on desktop; on mobile, **reduce to prev/next (+ current indicator)** or a "Load more" button to fit small screens and touch.

### 7. Profile Menu
- **React:** `ProfileMenu` (`components/layout/profile-menu`)
- **Props:** `user` (name, email, avatar), `items` (account, settings, billing, sign-out), `onSelect`.
- **Variants:** avatar-only trigger vs. avatar + name; with tier badge.
- **Accessibility:** Radix DropdownMenu — trigger is a labeled button with `aria-haspopup`/`aria-expanded`; menu items keyboard navigable (arrows/Enter/Esc); focus returns to trigger on close.
- **Responsive Behaviour:** Dropdown from the navbar on desktop; on mobile, may render as a **bottom sheet** or within the hamburger drawer; large tap targets.

### 8. Notification Menu
- **React:** `NotificationMenu` (`components/layout/notification-menu`)
- **Props:** `notifications`, `unreadCount`, `onMarkRead`, `onMarkAllRead`, `onSelect`, `isLoading`.
- **Variants:** dropdown panel (desktop) vs. full sheet (mobile); empty, loading, with-unread (badge).
- **Accessibility:** Trigger button shows unread count with an accessible label ("Notifications, 3 unread"); `aria-haspopup`/`aria-expanded`; list items keyboard navigable; unread state conveyed with text/icon, not color alone; new items announced via `aria-live`.
- **Responsive Behaviour:** Anchored dropdown panel on desktop; on mobile, opens as a **full-height sheet**; deep-links to the related audit/report on selection.

---

### Navigation Components Summary
| Component | React | Key Responsive Behaviour |
|-----------|-------|--------------------------|
| Navbar | `Navbar` | Collapses to hamburger on mobile |
| Sidebar | `Sidebar` | Off-canvas drawer on mobile |
| Footer | `Footer` | Stacks to single column |
| Breadcrumb | `Breadcrumb` | Collapses middle items to ellipsis |
| Tabs | `Tabs` | Horizontally scrollable / Select on small screens |
| Pagination | `Pagination` | Reduces to prev/next or "Load more" |
| Profile Menu | `ProfileMenu` | Dropdown → bottom sheet / drawer |
| Notification Menu | `NotificationMenu` | Dropdown → full-height sheet |

### Navigation Notes
- **Single source of navigation:** `Sidebar` and `Navbar` derive from one nav config (in `src/config`) so routes stay consistent and DRY.
- **Overlays share primitives:** ProfileMenu and NotificationMenu use the same Radix DropdownMenu/Sheet base for consistent focus/keyboard behavior.
- **Mobile drawers:** the mobile Navbar menu, Sidebar, ProfileMenu, and NotificationMenu all use the shared Sheet primitive for a consistent off-canvas pattern.
- **Tokens only:** spacing (8/16/24), radii, and Manrope type from tokens; active/hover states never rely on color alone.

---

## UX Audit Components

The domain components that power Audient's core experience — submitting an audit, tracking progress, and presenting results. They compose Core UI + Card components, consume the audit data model (SCHEMA.md), and follow the async audit lifecycle (AI_WORKFLOW.md). All are token-driven and WCAG AA.

### Shared Notes (all audit components)
- **Data source:** most read from `useAudit`/`useAudit(auditId)` hooks that fetch/poll the audit, its recommendations, and report.
- **Loading pattern:** consistent `Skeleton` placeholders while data loads; explicit empty and error states.
- **Reuse across web + PDF:** score, severity, recommendation, and screenshot components are reused in both the on-screen results and the PDF template (single source of truth).

---

### 1. WebsiteUrlInput
- **Purpose:** Capture and validate a website URL to audit (paid tiers).
- **Props:** `value`, `onChange`, `error`, `helperText`, `disabled`, `isValidating`, `onSubmit`, `tier`.
- **Dependencies:** `Input`, RHF + Zod, URL/SSRF validation util, `useAudit`, tokens.
- **Loading States:** `isValidating` shows an inline spinner while checking URL format/reachability before submit; disabled during submission.
- **Accessibility:** Labeled; `inputmode="url"`; errors linked via `aria-describedby`; disabled (Free) state explains the tier gate.
- **Reusability:** Reused on the new-audit page and the dashboard QuickAuditWidget.

### 2. AuditProgress
- **Purpose:** Show the live status of a running audit (queued → processing → completed/failed).
- **Props:** `status`, `progress`, `estimatedSecondsRemaining`, `errorMessage`.
- **Dependencies:** `Skeleton`, progress bar, tokens, `useAudit` (status poll / Supabase Realtime).
- **Loading States:** this component *is* the loading experience — animated stages with estimated time; transitions to results on completion.
- **Accessibility:** `role="progressbar"` with value/min/max; `aria-live="polite"` announces stage changes; failure state clearly communicated in text.
- **Reusability:** Results page (while processing) and history rows (in-progress audits).

### 3. AuditScore
- **Purpose:** Display the overall UX score (0–100) prominently.
- **Props:** `score`, `label`, `size`, `trend`, `isLoading`.
- **Dependencies:** `ScoreCard`/`Card`, gauge visual, `Skeleton`, tokens.
- **Loading States:** `isLoading` → skeleton gauge until the score is available.
- **Accessibility:** Numeric value in text (not gauge-only); `aria-label` ("Overall UX score 72 of 100"); color band paired with the number.
- **Reusability:** Results header, dashboard overview, history, and PDF.

### 4. CategoryScore
- **Purpose:** Display a per-category sub-score (accessibility, conversion, mobile, etc.).
- **Props:** `category`, `score`, `size`, `isLoading`.
- **Dependencies:** `ScoreCard` (compact), `Badge`, tokens.
- **Loading States:** skeleton bars while scores load.
- **Accessibility:** Category name + numeric score in text; color-coded band paired with value; grouped under a heading ("Category scores").
- **Reusability:** Results breakdown, dashboard, and PDF; often rendered as a set.

### 5. RecommendationCard
- **Purpose:** Present a single actionable recommendation (fix) with its rationale and impact.
- **Props:** `recommendation` (category, severity, priority, title, description, recommendation, businessImpact, screenshotRef), `defaultExpanded`.
- **Dependencies:** `Card`, `SeverityBadge`, `Badge` (priority/category), `ScreenshotViewer`, disclosure.
- **Loading States:** rendered after data loads; parent shows skeletons meanwhile.
- **Accessibility:** Disclosure with `aria-expanded`; severity via badge (text+color); annotated image has descriptive `alt`; title is a heading.
- **Reusability:** Results recommendation list and PDF (identical rendering).

### 6. SeverityBadge
- **Purpose:** Consistent Critical/Major/Minor indicator.
- **Props:** `severity`.
- **Dependencies:** `Badge`, tokens (Critical → Error `#DC2626`, Major → Warning `#F59E0B`, Minor → Secondary/neutral).
- **Loading States:** none (atomic; parent handles loading).
- **Accessibility:** Text label + color (never color-only); contrast ≥ 4.5:1.
- **Reusability:** Very high — RecommendationCard, IssueCard, history, filters, PDF.

### 7. ScreenshotViewer
- **Purpose:** Display audit screenshots (desktop/mobile), optionally with issue annotations and zoom.
- **Props:** `imageUrl`, `annotations`, `alt`, `viewport` (desktop/mobile), `zoomable`.
- **Dependencies:** image loader, annotation overlay, tokens; signed URLs from storage.
- **Loading States:** skeleton/blur placeholder until the image loads; error fallback if it fails.
- **Accessibility:** Meaningful `alt`; annotations described in text (not visual-only); zoom controls keyboard-accessible; markers meet contrast.
- **Reusability:** RecommendationCard/IssueCard, results, and PDF.

### 8. IssueCard
- **Purpose:** Present a single identified UX **problem** (the diagnosis), emphasizing what's wrong and where.
- **Props:** `issue` (category, severity, title, description, screenshotRef, location), `defaultExpanded`.
- **Dependencies:** `Card`, `SeverityBadge`, `ScreenshotViewer`, `Badge` (category).
- **Loading States:** parent-driven skeletons.
- **Accessibility:** Heading for the issue title; severity via badge; evidence image `alt`; disclosure `aria-expanded`.
- **Reusability:** Results issue list and PDF. (IssueCard = the *problem*; RecommendationCard = the *fix* — often paired or two faces of the same finding.)

### 9. ImprovementCard
- **Purpose:** Show a positive/priority improvement opportunity with expected impact — a forward-looking "do this next" framing (e.g., quick wins).
- **Props:** `improvement` (title, description, expectedImpact, effort, priority), `onAction`.
- **Dependencies:** `Card`, `Badge` (priority/effort), tokens.
- **Loading States:** parent-driven skeletons.
- **Accessibility:** Heading; impact/effort conveyed in text (not color-only); any action is a labeled button.
- **Reusability:** Results "improvements/quick wins" section and PDF; complements RecommendationCard with an impact/effort lens.

### 10. DownloadPdfButton
- **Purpose:** Request and trigger the report PDF download (Pro/Enterprise).
- **Props:** `auditId`, `disabled` (Free), `onUpgradeRequired`.
- **Dependencies:** `Button`, tokens, API `audits/{id}/report/pdf` (signed URL).
- **Loading States:** idle → fetching signed URL (spinner) → ready; error state on failure; gated state for Free.
- **Accessibility:** Button semantics; loading announced (`aria-busy`); gated state explains why disabled and offers upgrade.
- **Reusability:** Results page, history rows, ReportCard.

### 11. AuditTimeline
- **Purpose:** Visualize the audit's processing stages over time (queued → crawling → analysis → report), or a history of an audited site's score over multiple audits.
- **Props:** `stages` (name, status, timestamp) or `history` (audits with scores/dates), `orientation`.
- **Dependencies:** `Card`, timeline visual, `Badge`, tokens.
- **Loading States:** skeleton timeline while stages/history load; live-updating during processing.
- **Accessibility:** Ordered list semantics; each stage's status in text; `aria-live` for in-progress updates; not color-only.
- **Reusability:** Processing view (stage timeline) and results/history (score-over-time trend).

### 12. HistoryTable
- **Purpose:** Filterable, paginated list of past audits with status, score, date, and actions.
- **Props:** `audits`, `filters`, `onFilterChange`, `onSelect`, `pagination`, `isLoading`.
- **Dependencies:** `Table`/`ReportCard` rows, `SeverityBadge`/status `Badge`, `ScoreCard` (compact), `DownloadPdfButton`, `EmptyState`, `Pagination`.
- **Loading States:** `isLoading` → skeleton rows; empty state when no audits; filtered-empty state distinct from no-data.
- **Accessibility:** Table semantics (headers, `scope`); sortable columns keyboard-operable and state-announced; rows keyboard-activatable; pagination labeled.
- **Reusability:** History page; shares row rendering with the dashboard RecentAuditsList.

---

### UX Audit Components Summary
| Component | React | Reused In | Key Loading State |
|-----------|-------|-----------|-------------------|
| WebsiteUrlInput | `WebsiteUrlInput` | New audit, QuickAuditWidget | `isValidating` spinner |
| AuditProgress | `AuditProgress` | Results, history | is the loading UX |
| AuditScore | `AuditScore` | Results, dashboard, PDF | skeleton gauge |
| CategoryScore | `CategoryScore` | Results, dashboard, PDF | skeleton bars |
| RecommendationCard | `RecommendationCard` | Results, PDF | parent skeletons |
| SeverityBadge | `SeverityBadge` | Everywhere findings appear | none (atomic) |
| ScreenshotViewer | `ScreenshotViewer` | Recommendation/Issue, PDF | image placeholder |
| IssueCard | `IssueCard` | Results, PDF | parent skeletons |
| ImprovementCard | `ImprovementCard` | Results, PDF | parent skeletons |
| DownloadPdfButton | `DownloadPdfButton` | Results, history, ReportCard | fetching URL spinner |
| AuditTimeline | `AuditTimeline` | Processing, history | skeleton timeline |
| HistoryTable | `HistoryTable` | History, dashboard | skeleton rows |

### Domain Composition Notes
- **Single source of truth:** `SeverityBadge`, `AuditScore`/`CategoryScore` (ScoreCard), `RecommendationCard`, and `ScreenshotViewer` render identically in the web UI and the PDF report template.
- **IssueCard vs. RecommendationCard vs. ImprovementCard:** *problem* vs. *fix* vs. *opportunity* — three lenses on findings; keep their data mapping consistent with the Recommendations table (SCHEMA.md).
- **Async everywhere:** all data components support loading/empty/error; `AuditProgress`/`AuditTimeline` handle the long-running (≤8 min) processing UX with realtime/poll updates.
- **Tokens & AA:** severity/score colors from tokens, always paired with text; images carry meaningful alt text — exemplifying the accessibility Audient audits for.

---

## Authentication Components

The components that power sign-in, sign-up, OAuth, password recovery, and OTP verification. They wrap **Supabase Auth** (Google, Microsoft/Azure, GitHub, Email) per TECHNICAL_ARCHITECTURE.md and SECURITY.md. All are token-driven, WCAG AA, and keep auth logic in `useAuth`/services — the components stay presentational.

### Shared Notes (all auth components)
- **Auth client:** all flows call the Supabase Auth client via a `useAuth` hook (`signInWithPassword`, `signInWithOAuth`, `signUp`, `resetPasswordForEmail`, `verifyOtp`, `signOut`). Components never talk to Supabase directly.
- **State model:** every form/button shares a common lifecycle — `idle → submitting → success | error`. Only one submission in flight at a time (buttons disabled + `aria-busy` while pending).
- **Security-by-default (SECURITY.md):** generic error messages (no user-enumeration), rate-limited attempts, redirect allow-list for OAuth callbacks, no secrets/tokens in client state, CSRF/PKCE handled by Supabase.
- **Validation:** RHF + Zod; errors linked via `aria-describedby`; `aria-invalid` on invalid fields; form-level errors in an `aria-live` region.

---

### 1. LoginForm
- **Purpose:** Primary sign-in surface that composes email/password + OAuth options + recovery link.
- **Props:**
  - `mode` — `"sign-in" | "sign-up"` (shared shell for both).
  - `redirectTo` — post-auth destination (validated against allow-list).
  - `onSuccess`, `onError` — callbacks after auth resolves.
  - `enabledProviders` — which OAuth buttons to render (e.g. `["google","microsoft","github"]`).
  - `showForgotPassword` — toggles the recovery link (sign-in only).
- **States:** `idle`, `submitting` (fields + buttons disabled, spinner), `error` (generic message in live region), `success` (redirect/onSuccess). Field-level: `invalid`/`valid`, `focused`, `disabled`.
- **Dependencies:** `EmailLogin`, `OAuthButtons` (`GoogleLogin`/`MicrosoftLogin`/`GitHubLogin`), `Button`, `Input`, RHF + Zod, `useAuth`, tokens.
- **Accessibility:** `<form>` with heading; single H1 per auth page; logical tab order; errors announced; "or continue with" divider is decorative (`aria-hidden`).
- **Reusability:** Both `/sign-in` and `/sign-up` (via `mode`); embeddable in an auth modal.

### 2. GoogleLogin
- **Purpose:** One-click Google OAuth sign-in/up.
- **Props:** `redirectTo`, `label` (default "Continue with Google"), `disabled`, `fullWidth`, `onError`.
- **States:** `idle`, `redirecting` (spinner + `aria-busy` while handing off to Google), `disabled`, `error`.
- **Dependencies:** `Button` (outline), Google brand SVG (`public/brand/Google.svg`), `useAuth.signInWithOAuth("google")`, tokens.
- **Accessibility:** Accessible name includes provider ("Continue with Google"); brand icon `aria-hidden`; ≥44px target; focus-visible ring.
- **Reusability:** Rendered inside `OAuthButtons`; also usable standalone. Same pattern as Microsoft/GitHub — variants of one `OAuthButton` primitive.

### 3. MicrosoftLogin
- **Purpose:** One-click Microsoft/Azure AD OAuth sign-in/up.
- **Props:** `redirectTo`, `label` (default "Continue with Microsoft"), `disabled`, `fullWidth`, `onError`.
- **States:** `idle`, `redirecting`, `disabled`, `error`.
- **Dependencies:** `Button` (outline), Microsoft brand SVG (`public/brand/Microsoft.svg`), `useAuth.signInWithOAuth("azure")`, tokens.
- **Accessibility:** Provider in accessible name; icon `aria-hidden`; ≥44px target; keyboard-operable.
- **Reusability:** Inside `OAuthButtons`; a `provider="microsoft"` variant of the shared `OAuthButton`.

### 4. GitHubLogin
- **Purpose:** One-click GitHub OAuth sign-in/up (developer-friendly for freelancer/agency users).
- **Props:** `redirectTo`, `label` (default "Continue with GitHub"), `disabled`, `fullWidth`, `onError`.
- **States:** `idle`, `redirecting`, `disabled`, `error`.
- **Dependencies:** `Button` (outline), GitHub brand mark, `useAuth.signInWithOAuth("github")`, tokens.
- **Accessibility:** Provider in accessible name; icon `aria-hidden`; contrast holds in light/dark; focus-visible.
- **Reusability:** Inside `OAuthButtons`; a `provider="github"` variant of the shared `OAuthButton`.

> **OAuthButtons wrapper:** Google/Microsoft/GitHub are variants of one `OAuthButton` primitive rendered by an `OAuthButtons` group (props: `providers`, `redirectTo`, `disabled`, `onError`). This keeps DRY per CURSOR_RULES.md — one implementation, three configured instances.

### 5. EmailLogin
- **Purpose:** Email + password credential form (the non-OAuth path); doubles as sign-up when `mode="sign-up"`.
- **Props:**
  - `mode` — `"sign-in" | "sign-up"`.
  - `onSubmit(values)` — resolves via `useAuth`.
  - `defaultValues`, `isSubmitting`, `serverError`.
  - `showPasswordStrength` — meter on sign-up.
- **States:** Field: `idle/valid/invalid`, `focused`, `disabled`; password `visible/hidden` (toggle). Form: `idle`, `submitting` (disabled + spinner), `error` (generic, live region), `success`. Sign-up adds `password-strength` feedback and `email-confirmation-sent`.
- **Dependencies:** `Input` (email + password with show/hide), `PasswordStrength` (sign-up), `Button`, RHF + Zod, `useAuth.signInWithPassword`/`signUp`, tokens.
- **Accessibility:** Labeled fields; `autocomplete="email"` / `current-password` / `new-password`; password toggle announces state; errors via `aria-describedby`; strength meter conveyed in text, not color-only.
- **Reusability:** Core of `LoginForm` for both sign-in and sign-up.

### 6. ForgotPassword
- **Purpose:** Request a password-reset email, then set a new password from the callback link.
- **Props:**
  - `step` — `"request" | "reset"` (request email → set new password).
  - `token` — recovery token (reset step).
  - `onSuccess`, `onError`, `resendCooldownSeconds`.
- **States:**
  - **Request:** `idle`, `submitting`, `sent` (always shows generic "if an account exists, we sent a link" — no enumeration), `error`, `resend-cooldown` (timer disables resend).
  - **Reset:** `idle`, `validating-token`, `token-invalid/expired`, `submitting`, `success` (→ sign-in), `error`.
- **Dependencies:** `Input`, `Button`, `PasswordStrength`, RHF + Zod, `useAuth.resetPasswordForEmail`/`updateUser`, tokens.
- **Accessibility:** Clear step headings; success/error in `aria-live`; cooldown communicated in text; new-password field uses `autocomplete="new-password"`.
- **Reusability:** `/forgot-password` and the reset-callback route; the request form is reusable in an account-security settings panel.

### 7. OTPVerification
- **Purpose:** Verify a 6-digit one-time code (email OTP / magic-link code, and MFA if enabled).
- **Props:**
  - `length` — code digits (default 6).
  - `channel` — `"email"` (extensible to SMS).
  - `identifier` — masked destination shown to the user (e.g. `j•••@site.com`).
  - `onVerify(code)`, `onResend`, `resendCooldownSeconds`, `autoSubmit`.
- **States:** `idle`, `entering` (per-cell focus, paste-to-fill), `verifying` (`aria-busy`), `success`, `error` (invalid/expired code, cells shake + message), `resend-cooldown`, `locked` (too many attempts → generic lockout message per SECURITY.md rate limits).
- **Dependencies:** segmented `OTPInput` (shadcn `input-otp`), `Button`, `useAuth.verifyOtp`, countdown hook, tokens.
- **Accessibility:** Grouped inputs with a single accessible label ("Verification code"); `inputmode="numeric"`, `autocomplete="one-time-code"`; paste distributes across cells; errors and lockout in `aria-live`; resend timer announced.
- **Reusability:** Email OTP/magic-link confirmation and future MFA challenge; usable in a modal.

### 8. ProfileMenu
- **Purpose:** Authenticated-user dropdown (avatar → account, billing, settings, sign-out); shows plan/credits at a glance.
- **Props:**
  - `user` — name, email, avatarUrl.
  - `plan` — `"free" | "pro" | "enterprise"` (badge).
  - `creditsRemaining` — quick summary (hidden for Enterprise/unlimited).
  - `items` — nav entries (Account, Billing, Settings, etc.).
  - `onSignOut`.
- **States:** `closed`, `open`, `item-focused` (roving), `loading` (avatar/user still fetching → skeleton), `signing-out` (item disabled + spinner). Avatar: image → initials fallback on error.
- **Dependencies:** `DropdownMenu` (shadcn), `Avatar`, `Badge` (plan), `useAuth` (session + `signOut`), Next `Link`, tokens.
- **Accessibility:** `aria-haspopup="menu"` trigger with `aria-expanded`; roving-tabindex items; Esc closes and returns focus; sign-out clearly labeled; plan/credits available as text.
- **Reusability:** App navbar and mobile drawer; the sole session-aware surface for account actions.

---

### Authentication Components Summary
| Component | React | Auth Action (Supabase) | Key States |
|-----------|-------|------------------------|------------|
| Login Form | `LoginForm` | composes email + OAuth | idle · submitting · error · success |
| Google Login | `GoogleLogin` (`OAuthButton`) | `signInWithOAuth("google")` | idle · redirecting · disabled · error |
| Microsoft Login | `MicrosoftLogin` (`OAuthButton`) | `signInWithOAuth("azure")` | idle · redirecting · disabled · error |
| GitHub Login | `GitHubLogin` (`OAuthButton`) | `signInWithOAuth("github")` | idle · redirecting · disabled · error |
| Email Login | `EmailLogin` | `signInWithPassword` / `signUp` | idle · submitting · error · success (+ strength) |
| Forgot Password | `ForgotPassword` | `resetPasswordForEmail` / `updateUser` | request/sent · reset · token-invalid · success |
| OTP Verification | `OTPVerification` | `verifyOtp` | entering · verifying · success · error · locked |
| Profile Menu | `ProfileMenu` | session + `signOut` | closed · open · loading · signing-out |

### Auth Composition & Security Notes
- **DRY OAuth:** Google/Microsoft/GitHub are one `OAuthButton` primitive configured per provider — no duplicated logic (CURSOR_RULES.md).
- **Logic out of UI:** all sign-in/up/reset/verify/sign-out logic lives in `useAuth`/auth services; components are presentational and testable in isolation.
- **No enumeration:** login and forgot-password always return generic, identical messaging regardless of whether the account exists (SECURITY.md).
- **Rate limiting & lockout:** repeated failures on login/OTP surface a generic locked state; timing/attempts enforced server-side.
- **Safe redirects:** `redirectTo` is validated against an allow-list; OAuth uses PKCE; no tokens stored in client-accessible state.
- **AA throughout:** labeled fields, `aria-live` errors, ≥44px targets, focus-visible rings, and non-color-only feedback across every flow.

---
