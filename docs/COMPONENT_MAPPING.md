# Audient — Figma → React Component Mapping

**Status:** Draft
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** COMPONENT_ARCHITECTURE.md, DESIGN_TOKENS.md, FOLDER_STRUCTURE.md

This document maps every Figma component to its React implementation. It is the bridge between the Figma Design System / Component Library and the codebase (`src/components`). It is documentation only — no React code. "Props" are described conceptually (name — meaning).

---

## How to Use This Document
- **Figma Component Name** — the exact name/layer in the Figma library.
- **React Component Name** — the corresponding component in `src/components` (built on shadcn/ui where applicable).
- **Purpose / Props / Variants / States / Accessibility / Reusability / Dependencies** — the implementation contract for each component.
- All components consume **design tokens** from DESIGN_TOKENS.md via `tailwind.config.ts` (font: **Manrope**; Primary `#1C018E`, Secondary `#8050E6`, Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`; radii 4/8/16; spacing 8/16/24).

### Token Mapping Reference
| Figma Token | Tailwind Token | Value |
|-------------|----------------|-------|
| Primary | `primary` | `#1C018E` |
| Secondary | `secondary` | `#8050E6` |
| Success | `success` | `#16A34A` |
| Warning | `warning` | `#F59E0B` |
| Error / Critical | `error`/`destructive` | `#DC2626` |
| Background | `background` | `#FFFFFF` |
| Surface | `surface`/`card` | `#F8FDFF` |
| Radius Small/Medium/Large | `rounded-sm/md/lg` | 4/8/16px |

### Severity Color Mapping
| Severity | Token | Color |
|----------|-------|-------|
| Critical | `error` | `#DC2626` |
| Major | `warning` | `#F59E0B` |
| Minor | `secondary`/neutral | `#8050E6` / gray |

---

## 1. Core UI Components

### Button
- **Figma Component Name:** `Button`
- **React Component Name:** `Button` (`components/ui/button`)
- **Purpose:** Primary interactive control for actions (submit, upgrade, download, navigate).
- **Props:** `variant`, `size`, `isLoading`, `disabled`, `iconLeft`, `iconRight`, `fullWidth`, `type`, `onClick`.
- **Variants:** `primary` (Primary `#1C018E`), `secondary` (Secondary `#8050E6`), `ghost`, `outline`, `destructive` (Error `#DC2626`).
- **States:** default, hover, active/pressed, focus, disabled, loading.
- **Accessibility Requirements:** Native `<button>`; visible focus ring; `aria-busy` while loading; `aria-disabled` when disabled; icon-only buttons need `aria-label`; contrast ≥ 4.5:1.
- **Reusability Guidelines:** Use everywhere; never create bespoke buttons — extend variants instead.
- **Dependencies:** shadcn/ui Button, design tokens, icon set (Lucide).

### Input / Text Field
- **Figma Component Name:** `Input` / `Text Field`
- **React Component Name:** `Input` (`components/ui/input`)
- **Purpose:** Single-line text entry (URL, name, search).
- **Props:** `value`, `onChange`, `label`, `placeholder`, `type`, `error`, `helperText`, `iconLeft`, `disabled`, `required`.
- **Variants:** default, with-icon, with-error.
- **States:** empty, focus, filled, error, disabled.
- **Accessibility Requirements:** `<label>` linked via `htmlFor`; error linked via `aria-describedby`; `aria-invalid` on error; placeholder is not a label substitute.
- **Reusability Guidelines:** Base for all text entry; compose into form fields, don't fork.
- **Dependencies:** shadcn/ui Input, `Label`, tokens.

### Select / Dropdown
- **Figma Component Name:** `Select` / `Dropdown`
- **React Component Name:** `Select` (`components/ui/select`)
- **Purpose:** Choose one option (theme, PDF format, timezone, filters).
- **Props:** `options`, `value`, `onChange`, `label`, `placeholder`, `disabled`, `error`.
- **Variants:** default, with-error.
- **States:** closed, open, focused, selected, disabled.
- **Accessibility Requirements:** `role="listbox"`/`option`; keyboard nav (arrows/Enter/Esc); focus management; selection announced.
- **Reusability Guidelines:** Use for all single-select needs; use multi-select variant for filters if needed.
- **Dependencies:** shadcn/ui Select (Radix), tokens.

### Card
- **Figma Component Name:** `Card`
- **React Component Name:** `Card` (`components/ui/card`)
- **Purpose:** Grouping container with consistent padding/elevation (the primary layout unit).
- **Props:** `header`, `footer`, `children`, `padding`, `interactive`, `onClick`.
- **Variants:** default, elevated (Shadow MD/LG), interactive/clickable, surface (`#F8FDFF`).
- **States:** static; hover/elevated if interactive.
- **Accessibility Requirements:** Interactive cards expose button/link semantics + keyboard activation; otherwise a neutral region.
- **Reusability Guidelines:** Use for all boxed content; build ScoreCard/StatCard on top.
- **Dependencies:** shadcn/ui Card, tokens (radius Large 16px, shadows).

### Badge / Tag
- **Figma Component Name:** `Badge` / `Tag`
- **React Component Name:** `Badge` (`components/ui/badge`)
- **Purpose:** Compact status/label (tier, category, status).
- **Props:** `variant`, `children`, `icon`.
- **Variants:** neutral, success, warning, error, info (mapped to semantic tokens).
- **States:** static.
- **Accessibility Requirements:** Never color-only — include text/icon; contrast ≥ 4.5:1.
- **Reusability Guidelines:** Base for SeverityBadge and status indicators.
- **Dependencies:** shadcn/ui Badge, tokens.

### Modal / Dialog
- **Figma Component Name:** `Modal` / `Dialog`
- **React Component Name:** `Dialog` (`components/ui/dialog`)
- **Purpose:** Focused overlay for confirmations, upgrade prompts, forms.
- **Props:** `isOpen`, `onClose`, `title`, `children`, `footer`, `size`.
- **Variants:** default, destructive (confirm), sizes (sm/md/lg).
- **States:** closed, opening, open, closing.
- **Accessibility Requirements:** `role="dialog"` + `aria-modal`; focus trap; focus returns to trigger on close; Esc closes; background inert.
- **Reusability Guidelines:** Base for ConfirmDialog and UpgradeDialog; don't build ad-hoc overlays.
- **Dependencies:** shadcn/ui Dialog (Radix), tokens.

### Toast / Snackbar
- **Figma Component Name:** `Toast` / `Snackbar`
- **React Component Name:** `Toast` (`components/ui/toast` / `sonner`)
- **Purpose:** Transient action feedback (success/error/info).
- **Props:** `type`, `message`, `duration`, `action`.
- **Variants:** success, error, info, warning.
- **States:** entering, visible, exiting.
- **Accessibility Requirements:** `aria-live="polite"` (or `assertive` for errors); dismissible via keyboard.
- **Reusability Guidelines:** Single global toast system; no custom inline notifications.
- **Dependencies:** shadcn/ui Toast/Sonner, tokens.

### Skeleton / Loader
- **Figma Component Name:** `Skeleton` / `Loading`
- **React Component Name:** `Skeleton` (`components/ui/skeleton`)
- **Purpose:** Loading placeholder for async content.
- **Props:** `variant`, `count`, `width`, `height`.
- **Variants:** text, rect, circle.
- **States:** animating.
- **Accessibility Requirements:** Decorative shapes `aria-hidden`; a live region announces "Loading…".
- **Reusability Guidelines:** Use in every async view for consistent loading UX.
- **Dependencies:** shadcn/ui Skeleton, tokens.

### Tooltip
- **Figma Component Name:** `Tooltip`
- **React Component Name:** `Tooltip` (`components/ui/tooltip`)
- **Purpose:** Contextual hints (explain scores/metrics).
- **Props:** `content`, `side`, `children`.
- **Variants:** default.
- **States:** hidden, visible.
- **Accessibility Requirements:** Hover- and keyboard-triggerable; `aria-describedby`; never the sole source of critical info.
- **Reusability Guidelines:** Use for supplementary hints only.
- **Dependencies:** shadcn/ui Tooltip (Radix), tokens.

### Tabs
- **Figma Component Name:** `Tabs`
- **React Component Name:** `Tabs` (`components/ui/tabs`)
- **Purpose:** Switch between related views (report sections, settings groups).
- **Props:** `tabs`, `activeTab`, `onChange`.
- **Variants:** underline, pill.
- **States:** active, inactive, focused, disabled.
- **Accessibility Requirements:** `role="tablist"/"tab"/"tabpanel"`; arrow-key navigation; active tab announced.
- **Reusability Guidelines:** Use for in-page view switching; not for primary navigation.
- **Dependencies:** shadcn/ui Tabs (Radix), tokens.

---

## 2. Layout Components

### App Shell
- **Figma Component Name:** `App Shell` / `Dashboard Layout`
- **React Component Name:** `AppShell` (`components/layout/app-shell`)
- **Purpose:** Standard authenticated page wrapper (navbar + sidebar + content).
- **Props:** `title`, `actions`, `sidebar`, `children`.
- **Variants:** with/without sidebar; full-width.
- **States:** sidebar expanded/collapsed (responsive).
- **Accessibility Requirements:** Landmarks (`header`/`nav`/`main`); skip-to-content link.
- **Reusability Guidelines:** Wrap all dashboard pages.
- **Dependencies:** Navbar, Sidebar, tokens.

### Navbar / Top Bar
- **Figma Component Name:** `Navbar` / `Top Bar`
- **React Component Name:** `Navbar` (`components/layout/navbar`)
- **Purpose:** Top nav — logo, credit meter, notifications, user menu.
- **Props:** `user`, `credits`, `onOpenNotifications`.
- **Variants:** marketing, app; default/scrolled; mobile-condensed.
- **States:** default, scrolled, mobile.
- **Accessibility Requirements:** `nav` landmark; keyboard-operable menus; current page indicated.
- **Reusability Guidelines:** Persistent across app; reuse marketing variant on landing.
- **Dependencies:** CreditMeter, DropdownMenu, Avatar, tokens.

### Sidebar
- **Figma Component Name:** `Sidebar` / `Navigation Menu`
- **React Component Name:** `Sidebar` (`components/layout/sidebar`)
- **Purpose:** Primary section navigation (Dashboard, Audits, History, Billing, Settings).
- **Props:** `items`, `activePath`, `collapsed`.
- **Variants:** expanded, collapsed (icon-only).
- **States:** active-item, hover, collapsed.
- **Accessibility Requirements:** `nav` landmark; `aria-current="page"`; keyboard navigable; accessible collapse control.
- **Reusability Guidelines:** Single source for app navigation.
- **Dependencies:** icon set, tokens.

### Footer
- **Figma Component Name:** `Footer`
- **React Component Name:** `Footer` (`components/layout/footer`)
- **Purpose:** Marketing/legal links, secondary navigation.
- **Props:** `links`.
- **Variants:** marketing, minimal.
- **States:** static.
- **Accessibility Requirements:** `contentinfo` landmark; descriptive link text.
- **Reusability Guidelines:** Mainly marketing pages.
- **Dependencies:** tokens.

### Container / Grid
- **Figma Component Name:** `Container` / `Grid`
- **React Component Name:** `Container` (`components/layout/container`)
- **Purpose:** Responsive width constraints + grid layout.
- **Props:** `maxWidth`, `columns`, `gap`, `children`.
- **Variants:** narrow, default, wide; column counts.
- **States:** responsive breakpoints.
- **Accessibility Requirements:** Layout-only; preserves logical reading order.
- **Reusability Guidelines:** Wrap page content; use for consistent gutters/spacing (8/16/24).
- **Dependencies:** tokens (spacing).

---

## 3. Feature Components

### Credit Meter
- **Figma Component Name:** `Credit Meter` / `Credits Widget`
- **React Component Name:** `CreditMeter` (`components/common/credit-meter`)
- **Purpose:** Show remaining credits (or "Unlimited") and reset date.
- **Props:** `balance`, `isUnlimited`, `nextResetAt`, `onTopUp`.
- **Variants:** compact (navbar), full (billing), unlimited.
- **States:** normal, low-balance (warning), unlimited.
- **Accessibility Requirements:** Low state not color-only (icon/text); `aria-live` on updates; value screen-reader readable.
- **Reusability Guidelines:** Reuse in navbar, billing, and audit screens.
- **Dependencies:** Badge, tokens, `useCredits`.

### Severity Badge
- **Figma Component Name:** `Severity Badge`
- **React Component Name:** `SeverityBadge` (`components/audit/severity-badge`)
- **Purpose:** Consistent Critical/Major/Minor indicator.
- **Props:** `severity`.
- **Variants:** Critical (Error `#DC2626`), Major (Warning `#F59E0B`), Minor (Secondary/neutral).
- **States:** static.
- **Accessibility Requirements:** Text label + color; contrast ≥ 4.5:1.
- **Reusability Guidelines:** Reuse in results, history, recommendations, and PDF template.
- **Dependencies:** Badge, tokens.

### Score Card / Gauge
- **Figma Component Name:** `Score Card` / `Score Gauge`
- **React Component Name:** `ScoreCard` (`components/audit/score-card`)
- **Purpose:** Prominently display a 0–100 UX score (overall/category).
- **Props:** `score`, `label`, `size`, `trend`.
- **Variants:** overall (large), category (small); score-band colors.
- **States:** loading, loaded.
- **Accessibility Requirements:** Numeric value in text (not gauge-only); `aria-label` with score + label; color bands paired with number.
- **Reusability Guidelines:** Reuse on results, dashboard, history, and PDF.
- **Dependencies:** Card, tokens, charting/gauge primitive.

### Confirm Dialog
- **Figma Component Name:** `Confirm Dialog`
- **React Component Name:** `ConfirmDialog` (`components/common/confirm-dialog`)
- **Purpose:** Reusable confirmation for destructive actions.
- **Props:** `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `isDestructive`.
- **Variants:** default, destructive.
- **States:** open/closed, confirming (loading).
- **Accessibility Requirements:** Dialog semantics; default focus on safest action; consequences stated clearly.
- **Reusability Guidelines:** Reuse for delete audit, cancel subscription, delete account.
- **Dependencies:** Dialog, Button.

### Empty State
- **Figma Component Name:** `Empty State`
- **React Component Name:** `EmptyState` (`components/common/empty-state`)
- **Purpose:** Placeholder when no data exists.
- **Props:** `icon`, `title`, `description`, `action`.
- **Variants:** default, with-action.
- **States:** static.
- **Accessibility Requirements:** Meaningful heading; action is a real button/link.
- **Reusability Guidelines:** Reuse across history, notifications, any list.
- **Dependencies:** Button, tokens.

### PDF Download Button
- **Figma Component Name:** `PDF Download` / `Download Report`
- **React Component Name:** `PdfDownloadButton` (`components/report/pdf-download`)
- **Purpose:** Request and trigger report PDF download (paid tiers).
- **Props:** `auditId`, `disabled`, `onUpgradeRequired`.
- **Variants:** enabled, gated (Free).
- **States:** idle, fetching URL, ready, error, gated.
- **Accessibility Requirements:** Button semantics; loading announced; gated state explains why disabled.
- **Reusability Guidelines:** Reuse on results and history.
- **Dependencies:** Button, tokens, API `report/pdf`.

---

## 4. Dashboard Components

### Stat Card
- **Figma Component Name:** `Stat Card` / `Metric Card`
- **React Component Name:** `StatCard` (`components/dashboard/stat-card`)
- **Purpose:** Single metric (audits run, avg score, credits used).
- **Props:** `label`, `value`, `icon`, `trend`.
- **Variants:** default, with-trend.
- **States:** loading, loaded.
- **Accessibility Requirements:** Label + value in text; trend not color-only.
- **Reusability Guidelines:** Reuse across dashboard and analytics.
- **Dependencies:** Card, tokens.

### Recent Audits List
- **Figma Component Name:** `Recent Audits` / `Audit List`
- **React Component Name:** `RecentAuditsList` (`components/dashboard/recent-audits-list`)
- **Purpose:** Compact list of latest audits with status/score.
- **Props:** `audits`, `onSelect`.
- **Variants:** compact, full-row.
- **States:** loading, loaded, empty.
- **Accessibility Requirements:** List semantics; rows keyboard-activatable; status via badge (text+color).
- **Reusability Guidelines:** Share the row component with history.
- **Dependencies:** ScoreCard/Badge, SeverityBadge, EmptyState.

### Quick Audit Widget
- **Figma Component Name:** `Quick Audit` / `New Audit Widget`
- **React Component Name:** `QuickAuditWidget` (`components/dashboard/quick-audit-widget`)
- **Purpose:** Start a new audit from the dashboard.
- **Props:** `tier`, `onSubmit`.
- **Variants:** URL, upload.
- **States:** idle, validating, submitting, tier-gated.
- **Accessibility Requirements:** Proper form labeling; gated messaging for Free/URL.
- **Reusability Guidelines:** Reuse AuditInput internally.
- **Dependencies:** AuditInput, Button.

---

## 5. Audit Components

### Audit Input / Form
- **Figma Component Name:** `Audit Input` / `Audit Form`
- **React Component Name:** `AuditForm` (`components/audit/audit-form`)
- **Purpose:** Capture audit input — URL (paid) or screenshot upload (all tiers).
- **Props:** `inputType`, `tier`, `competitors`, `onSubmit`, `isSubmitting`.
- **Variants:** URL, screenshot; free (gated), paid.
- **States:** idle, validating, uploading, submitting, error, tier-gated.
- **Accessibility Requirements:** Labeled fields; errors via `aria-describedby`; keyboard-accessible upload alternative to drag-drop.
- **Reusability Guidelines:** Reuse on new-audit page and QuickAuditWidget.
- **Dependencies:** Input, FileUploader, Button, `useAudit`.

### File Uploader
- **Figma Component Name:** `File Upload` / `Screenshot Upload`
- **React Component Name:** `FileUploader` (`components/audit/file-uploader`)
- **Purpose:** Upload screenshots via drag-drop or picker to signed URL.
- **Props:** `accept`, `maxSize`, `maxFiles`, `files`, `onUploaded`.
- **Variants:** single, multiple.
- **States:** idle, dragging, uploading (progress), success, error.
- **Accessibility Requirements:** Keyboard-operable picker (not drag-only); progress announced; clear errors.
- **Reusability Guidelines:** Reuse anywhere screenshots are uploaded.
- **Dependencies:** tokens, API `uploads/sign`.

### Audit Progress
- **Figma Component Name:** `Audit Progress` / `Processing State`
- **React Component Name:** `AuditProgress` (`components/audit/audit-progress`)
- **Purpose:** Live progress while an audit runs.
- **Props:** `status`, `progress`, `estimatedSecondsRemaining`.
- **Variants:** queued, processing, completed, failed.
- **States:** same as variants.
- **Accessibility Requirements:** `aria-live` for status; `role="progressbar"` with values; failure clearly communicated.
- **Reusability Guidelines:** Reuse on results page and history rows.
- **Dependencies:** Skeleton, tokens, `useAudit` (status poll/realtime).

### Recommendation Card / Issue Card
- **Figma Component Name:** `Recommendation Card` / `Issue Card`
- **React Component Name:** `RecommendationCard` (`components/audit/recommendation-card`)
- **Purpose:** Present a single UX finding (title, severity, description, fix, business impact, evidence).
- **Props:** `recommendation` (category, severity, priority, title, description, recommendation, businessImpact, screenshotRef).
- **Variants:** by severity; collapsed/expanded.
- **States:** collapsed, expanded.
- **Accessibility Requirements:** Disclosure with `aria-expanded`; SeverityBadge (text+color); annotated image has descriptive `alt`.
- **Reusability Guidelines:** Reuse in results list and PDF template (single source of truth).
- **Dependencies:** Card, SeverityBadge, AnnotatedScreenshot.

### Annotated Screenshot
- **Figma Component Name:** `Annotated Screenshot`
- **React Component Name:** `AnnotatedScreenshot` (`components/report/annotated-screenshot`)
- **Purpose:** Screenshot with highlighted issue regions.
- **Props:** `imageUrl`, `annotations`, `alt`.
- **Variants:** desktop, mobile.
- **States:** loading, loaded, error.
- **Accessibility Requirements:** Meaningful `alt`; annotations described in text (not visual-only); marker contrast.
- **Reusability Guidelines:** Reuse in results and PDF.
- **Dependencies:** tokens, image loader.

### Competitive Analysis Panel
- **Figma Component Name:** `Competitive Analysis`
- **React Component Name:** `CompetitiveAnalysisPanel` (`components/report/competitive-analysis`)
- **Purpose:** Compare user's UX vs. competitors.
- **Props:** `analysis` (competitors, strengths, gaps, positioning).
- **Variants:** default; empty (not requested).
- **States:** loading, loaded, not-requested.
- **Accessibility Requirements:** Structured, readable content; tables have proper headers.
- **Reusability Guidelines:** Report-specific; reuse in web + PDF.
- **Dependencies:** Card, Table, tokens.

### Audit History Table
- **Figma Component Name:** `Audit History Table`
- **React Component Name:** `AuditHistoryTable` (`components/audit/audit-history-table`)
- **Purpose:** Filterable/paginated list of past audits.
- **Props:** `audits`, `filters`, `onFilterChange`, `onSelect`, `pagination`.
- **Variants:** default, filtered.
- **States:** loading, loaded, empty, filtered.
- **Accessibility Requirements:** Table semantics (headers, scope); sortable columns keyboard-operable + state-announced.
- **Reusability Guidelines:** Shares row component with RecentAuditsList.
- **Dependencies:** Table, Badge, ScoreCard, EmptyState.

---

## 6. Pricing Components

### Pricing Table
- **Figma Component Name:** `Pricing Table` / `Plan Comparison`
- **React Component Name:** `PricingTable` (`components/pricing/pricing-table`)
- **Purpose:** Present Free/Pro/Enterprise plans for comparison.
- **Props:** `plans`, `currentTier`, `billingInterval`, `onSelectPlan`.
- **Variants:** monthly, yearly; marketing, in-app.
- **States:** default, highlighted, current-plan, loading.
- **Accessibility Requirements:** Accessible table/structured layout; current plan in text; CTAs labeled.
- **Reusability Guidelines:** Reuse on marketing page and in-app upgrade.
- **Dependencies:** PlanCard, BillingIntervalToggle.

### Plan Card
- **Figma Component Name:** `Plan Card`
- **React Component Name:** `PlanCard` (`components/pricing/plan-card`)
- **Purpose:** Single plan's price, features, CTA.
- **Props:** `plan`, `isCurrent`, `isRecommended`, `onSelect`.
- **Variants:** default, recommended (Primary accent), current, disabled.
- **States:** default, recommended, current, disabled.
- **Accessibility Requirements:** Heading per plan; features as a real list; price screen-reader readable.
- **Reusability Guidelines:** Composes the pricing table.
- **Dependencies:** Card, Button, Badge.

### Billing Interval Toggle
- **Figma Component Name:** `Billing Toggle` / `Monthly-Yearly Toggle`
- **React Component Name:** `BillingIntervalToggle` (`components/pricing/billing-interval-toggle`)
- **Purpose:** Switch monthly/yearly pricing.
- **Props:** `value`, `onChange`, `yearlyDiscountLabel`.
- **Variants:** monthly, yearly.
- **States:** monthly, yearly.
- **Accessibility Requirements:** Grouped toggle with labels; state announced; not color-only.
- **Reusability Guidelines:** Reuse wherever plans are shown.
- **Dependencies:** shadcn/ui Switch/ToggleGroup, tokens.

### Upgrade Dialog
- **Figma Component Name:** `Upgrade Prompt` / `Upgrade Modal`
- **React Component Name:** `UpgradeDialog` (`components/pricing/upgrade-dialog`)
- **Purpose:** Contextual upgrade prompt at gated actions.
- **Props:** `reason`, `recommendedTier`, `onUpgrade`, `onDismiss`.
- **Variants:** by reason (URL audit, PDF, out-of-credits).
- **States:** open/closed, redirecting.
- **Accessibility Requirements:** Dialog semantics; explains why upgrade is needed; keyboard operable.
- **Reusability Guidelines:** Trigger from all gated points.
- **Dependencies:** Dialog, PlanCard/CheckoutButton.

### Checkout Button
- **Figma Component Name:** `Checkout Button`
- **React Component Name:** `CheckoutButton` (`components/pricing/checkout-button`)
- **Purpose:** Start Stripe Checkout for a plan/top-up.
- **Props:** `tier`, `billingInterval`, `isLoading`, `onClick`.
- **Variants:** plan, top-up.
- **States:** idle, redirecting, error.
- **Accessibility Requirements:** Button semantics; redirect/loading announced.
- **Reusability Guidelines:** Reuse in pricing, upgrade dialog, top-ups.
- **Dependencies:** Button, API `billing/checkout`.

### Billing Summary
- **Figma Component Name:** `Billing Summary`
- **React Component Name:** `BillingSummary` (`components/pricing/billing-summary`)
- **Purpose:** Current plan, renewal date, manage-subscription entry.
- **Props:** `membership`, `onManage`.
- **Variants:** active, past-due, canceled.
- **States:** same as variants.
- **Accessibility Requirements:** Status in text; clear renewal/action labeling.
- **Reusability Guidelines:** Billing page.
- **Dependencies:** Card, Button, Badge.

---

## 7. Authentication Components

### Auth Card / Layout
- **Figma Component Name:** `Auth Card` / `Auth Layout`
- **React Component Name:** `AuthCard` (`components/auth/auth-card`)
- **Purpose:** Centered branded wrapper for auth screens.
- **Props:** `title`, `subtitle`, `children`, `footer`.
- **Variants:** sign-in, sign-up, reset.
- **States:** static.
- **Accessibility Requirements:** Single main heading; logical focus order; responsive.
- **Reusability Guidelines:** Wrap all auth screens.
- **Dependencies:** Card, tokens.

### Sign In Form
- **Figma Component Name:** `Sign In Form`
- **React Component Name:** `SignInForm` (`components/auth/sign-in-form`)
- **Purpose:** Email/password (and magic link) sign-in.
- **Props:** `onSubmit`, `isSubmitting`, `error`.
- **Variants:** password, magic-link.
- **States:** idle, validating, submitting, error.
- **Accessibility Requirements:** Labeled fields; errors linked; loading reflected; accessible password toggle.
- **Reusability Guidelines:** Reuse Core inputs/buttons; don't fork field styles.
- **Dependencies:** Input, PasswordField, Button, OAuthButtons, Supabase Auth.

### Sign Up Form
- **Figma Component Name:** `Sign Up Form`
- **React Component Name:** `SignUpForm` (`components/auth/sign-up-form`)
- **Purpose:** Create account (email/password) → email verification.
- **Props:** `onSubmit`, `isSubmitting`, `error`.
- **Variants:** default.
- **States:** idle, validating, submitting, success (verify-email), error.
- **Accessibility Requirements:** Clear field labels/requirements; verification instructions announced; inline validation.
- **Reusability Guidelines:** Shares primitives with SignInForm.
- **Dependencies:** Input, PasswordField, Button, OAuthButtons, Supabase Auth.

### OAuth Buttons
- **Figma Component Name:** `Social Login` / `OAuth Buttons`
- **React Component Name:** `OAuthButtons` (`components/auth/oauth-buttons`)
- **Purpose:** Sign in with Google, Microsoft, GitHub.
- **Props:** `providers`, `onProviderSelect`, `isLoading`.
- **Variants:** per provider.
- **States:** idle, redirecting (per provider), error.
- **Accessibility Requirements:** Accessible names ("Continue with Google"); icons have text; keyboard operable.
- **Reusability Guidelines:** Reuse on sign-in and sign-up.
- **Dependencies:** Button, provider icons, Supabase Auth.

### Password Field
- **Figma Component Name:** `Password Field`
- **React Component Name:** `PasswordField` (`components/auth/password-field`)
- **Purpose:** Password entry with show/hide + strength hint.
- **Props:** `value`, `onChange`, `showStrength`, `error`.
- **Variants:** with/without strength meter.
- **States:** hidden, visible, valid, error.
- **Accessibility Requirements:** Toggle labeled with `aria-pressed`; strength in text, not color-only.
- **Reusability Guidelines:** Reuse in sign-in, sign-up, reset.
- **Dependencies:** Input, tokens.

### Email Verification Notice
- **Figma Component Name:** `Email Verification Notice`
- **React Component Name:** `EmailVerificationNotice` (`components/auth/email-verification-notice`)
- **Purpose:** Prompt users to verify email before running audits.
- **Props:** `email`, `onResend`, `resendCooldown`.
- **Variants:** default.
- **States:** idle, resending, resent, cooldown.
- **Accessibility Requirements:** Clear instructions; resend state announced via live region.
- **Reusability Guidelines:** Reuse post-signup and at gated audit attempts.
- **Dependencies:** Card, Button, Supabase Auth.

---

## Mapping Summary

| Figma Component | React Component | Category |
|-----------------|-----------------|----------|
| Button | `Button` | Core UI |
| Input / Text Field | `Input` | Core UI |
| Select / Dropdown | `Select` | Core UI |
| Card | `Card` | Core UI |
| Badge / Tag | `Badge` | Core UI |
| Modal / Dialog | `Dialog` | Core UI |
| Toast / Snackbar | `Toast` | Core UI |
| Skeleton / Loading | `Skeleton` | Core UI |
| Tooltip | `Tooltip` | Core UI |
| Tabs | `Tabs` | Core UI |
| App Shell | `AppShell` | Layout |
| Navbar / Top Bar | `Navbar` | Layout |
| Sidebar | `Sidebar` | Layout |
| Footer | `Footer` | Layout |
| Container / Grid | `Container` | Layout |
| Credit Meter | `CreditMeter` | Feature |
| Severity Badge | `SeverityBadge` | Feature |
| Score Card / Gauge | `ScoreCard` | Feature |
| Confirm Dialog | `ConfirmDialog` | Feature |
| Empty State | `EmptyState` | Feature |
| PDF Download | `PdfDownloadButton` | Feature |
| Stat Card | `StatCard` | Dashboard |
| Recent Audits | `RecentAuditsList` | Dashboard |
| Quick Audit | `QuickAuditWidget` | Dashboard |
| Audit Input / Form | `AuditForm` | Audit |
| File Upload | `FileUploader` | Audit |
| Audit Progress | `AuditProgress` | Audit |
| Recommendation Card | `RecommendationCard` | Audit |
| Annotated Screenshot | `AnnotatedScreenshot` | Audit |
| Competitive Analysis | `CompetitiveAnalysisPanel` | Audit |
| Audit History Table | `AuditHistoryTable` | Audit |
| Pricing Table | `PricingTable` | Pricing |
| Plan Card | `PlanCard` | Pricing |
| Billing Toggle | `BillingIntervalToggle` | Pricing |
| Upgrade Prompt | `UpgradeDialog` | Pricing |
| Checkout Button | `CheckoutButton` | Pricing |
| Billing Summary | `BillingSummary` | Pricing |
| Auth Card / Layout | `AuthCard` | Auth |
| Sign In Form | `SignInForm` | Auth |
| Sign Up Form | `SignUpForm` | Auth |
| Social Login | `OAuthButtons` | Auth |
| Password Field | `PasswordField` | Auth |
| Email Verification Notice | `EmailVerificationNotice` | Auth |

---

## Notes on Fidelity
- **Figma names are indicative:** these reflect the standard component set from COMPONENT_ARCHITECTURE.md. Where the actual Figma library uses different layer names, update the "Figma Component Name" column to match exactly — the React mapping stays the same.
- **Tokens are the contract:** all components must render using the DESIGN_TOKENS.md values (Manrope type scale, color palette, radii, spacing) via Tailwind — no hardcoded values.
- **Single source of truth for shared widgets:** `SeverityBadge`, `ScoreCard`, and `RecommendationCard` are reused in both the web UI and the PDF report template so both stay visually identical.
