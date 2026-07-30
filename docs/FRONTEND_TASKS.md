# Audient — Frontend Development Tasks

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Frontend · Design · QA  

**Format:** Markdown only — **no application code**. Task breakdown for UI, client state, and browser behaviour.

**Related sources (read before coding):**  
`SCREEN_MAPPING.md` · `MISSING_SCREENS_PLAN.md` · `COMPONENT_ARCHITECTURE.md` · `COMPONENT_MAPPING.md` · `COMPONENT_BEHAVIOR.md` · `COMPONENT_SPECS.md` · `STATE_MANAGEMENT.md` (repo root) · `API_MAPPING.md` · `DESIGN_TOKENS.md` · `ACCESSIBILITY.md` · `VALIDATION_RULES.md` · `ERROR_HANDLING.md` · `PRICING.md` · `BUSINESS_RULES.md` (repo root) · `FOLDER_STRUCTURE.md` · `CURSOR_RULES.md` · `DEVELOPER_GUIDELINES.md` · `BACKEND_TASKS.md` · `DEVELOPMENT_ROADMAP.md` · `TEST_CASES.md` · `ANALYTICS.md`

**Design source of truth:** uploaded `Screens/Screen*.png` + SCREEN_MAPPING. **Missing but required:** SCREEN-M01 Progress, SCREEN-M02 Report, SCREEN-M03 Failure, SCREEN-M08 Upgrade (and P1 M04–M07) — build from `MISSING_SCREENS_PLAN.md` using **existing components only** (no redesign).

**Stack (UI):** Next.js 15 App Router · React · TypeScript · Tailwind tokens · shadcn/ui · React Hook Form + Zod · Framer Motion · Lucide · Supabase Auth client.

**Authoritative product:** Free **300** / Pro **$29 · 1,000** / Business **$99 · 10,000** · Guest **1** screenshot · SSO Google/Apple/Microsoft only · Stripe Elements/Checkout (**never** raw PAN — treat Screen5 card UI as visual reference, R4).

**Out of scope:** Email/password UI · GitHub OAuth · History search/filter UI · Report share · Teams · Invented dark-mode skins (`DEVELOPER_GUIDELINES` / `ACCESSIBILITY`) · Competitive analysis panel as required (`BR-AI-006`).

---

## How to use this document

Every milestone includes:

| Section | Meaning |
|---------|---------|
| **Layout** | Shell, landmarks, chrome |
| **Components** | Build / wire from COMPONENT_* docs |
| **Pages** | App Router routes / screens |
| **State Management** | Client stores & machines (`STATE_MANAGEMENT.md`) |
| **Hooks** | Reusable client hooks |
| **Forms** | RHF + Zod surfaces |
| **Animations** | Framer Motion / motion tokens |
| **Accessibility** | WCAG **2.2 AA** (`ACCESSIBILITY.md`) |
| **Testing** | Minimum UI proof (`TEST_CASES.md`) |
| **Responsive Behaviour** | Mobile-first breakpoints |
| **Dark Mode** | Theme policy for this slice |
| **Loading States** | Skeletons / busy / APP-STATE-* |
| **Error States** | Inline, modal, page-level (`ERROR_HANDLING`) |
| **Completion Criteria** | Binary DoD |

Also listed per milestone: **Goal**, **Backend dependency**, **Estimated complexity** (S/M/L/XL), **Dependencies**.

**Dark Mode policy (global):** Figma is **light-first**. Do **not** invent a dark visual skin. Wire Settings `theme` (LIGHT / DARK / SYSTEM) plumbing only where noted; until designed tokens exist, UI stays light. Respect `prefers-color-scheme` only when DARK tokens are approved.

**Suggested sequence:**

```text
FM-01 Foundation
  → FM-02 Landing (guest)
  → FM-03 Auth & header chrome
    → FM-04 Home Free / Pro
    → FM-05 Billing UI
    → FM-06 Progress & Failure
      → FM-07 Report & PDF
      → FM-08 History
      → FM-09 Settings
      → FM-10 Notifications, upgrades & system pages
```

Aligns with `BACKEND_TASKS.md`: FM-03 ↔ BM-03 · FM-02/04 ↔ BM-05/07 · FM-05 ↔ BM-06 · FM-06–07 ↔ BM-07–09 · FM-08–10 ↔ BM-10.

---

## Milestone index

| ID | Milestone | Complexity |
|----|-----------|------------|
| **FM-01** | Design system, tokens & app shell | M |
| **FM-02** | Landing (guest) & audit input | L |
| **FM-03** | SSO auth UI & session chrome | M |
| **FM-04** | Logged-in Home (Free & Pro) | L |
| **FM-05** | Manage Plan & payment flows | L |
| **FM-06** | Audit Progress & Failure (M01/M03) | L |
| **FM-07** | Audit Report & PDF (M02) | XL |
| **FM-08** | History | M |
| **FM-09** | Account Settings | M |
| **FM-10** | Notifications, upgrades & system hardening | L |

---

## FM-01 — Design system, tokens & app shell

### Goal

Establish Tailwind/shadcn foundation, Manrope typography, design tokens, providers, AppShell/Navbar stubs, and global loading/error boundaries so all screens share one composition language.

### Layout

- Root `layout.tsx`: fonts (Manrope), providers, skip link target `#main`.  
- `AppShell` / `Container` / `Footer` stubs.  
- Marketing vs `(dashboard)` route groups without inventing extra marketing chrome.

### Components

| Layer | Components |
|-------|------------|
| UI | Button, Input, Card, Badge, Dialog, Toast/Sonner, Skeleton, Tooltip, Tabs (shadcn) |
| Layout | AppShell, Navbar (logo + slots), Container |
| Common | EmptyState skeleton API |

Map names from `COMPONENT_MAPPING.md`. Tokens from `DESIGN_TOKENS.md` (Primary `#1C018E`, Secondary `#8050E6`, Success/Warning/Error, radii, spacing 8/16/24).

### Pages

- Placeholder home route that proves shell + tokens.  
- No product screens required yet.

### State Management

- Provider tree: theme class hook (light default), toast, query/client session placeholder.  
- APP-STATE-001 Application Loading shell.

### Hooks

- `useMediaQuery` / breakpoint helper.  
- `useReducedMotion`.  
- Theme `useTheme` stub (LIGHT only active).

### Forms

- Shared Zod + RHF form field primitives (Label, ErrorMessage, FormField wrapper) — no product forms yet.

### Animations

- Global motion defaults; honor `prefers-reduced-motion` from day one.  
- No decorative noise.

### Accessibility

- Skip to main content.  
- Landmarks (`banner`, `main`).  
- Focus-visible ring tokens.  
- Contrast check on primary/error/success vs white.

### Testing

- Story/smoke: Button, Input, Dialog open/close focus restore.  
- Axe on shell page.  
- Visual token spot-check vs Screen1 header chrome.

### Responsive Behaviour

- Container max-width; padding 16 mobile / 24 desktop.  
- Touch targets ≥44px on primary controls.

### Dark Mode

- CSS variable hooks only; **light theme shipped**.  
- Do not invent dark palette.

### Loading States

- Full-page APP-STATE-001 skeleton (logo + pulse).  
- Skeleton primitive documented.

### Error States

- Root error boundary → APP-STATE-010 friendly page stub (copy finalized in FM-10).  
- Toast channel for global API errors.

### Backend dependency

None (BM-01 helpful).

### Estimated Complexity

**M**

### Dependencies

- Figma tokens / `DESIGN_TOKENS.md`  
- shadcn init

### Completion Criteria

- [ ] Tokens applied via Tailwind; no hardcoded hex in feature code  
- [ ] Manrope loaded; shell renders logo slot + main landmark  
- [ ] Skip link + focus-visible work  
- [ ] Reduced-motion flag available to children  
- [ ] Toast + Skeleton primitives usable  

---

## FM-02 — Landing (guest) & audit input

### Goal

Ship SCREEN-001 Landing: hero composition with brand, URL field, screenshot upload, GO, guest credit teaser, upload success/fail chips — guest may start **one** screenshot audit.

### Layout

- Single-composition first viewport: brand-forward header + centered audit controls (not a dashboard).  
- Guest Navbar: logo · credits teaser · avatar (opens guest menu in FM-03).

### Components

| Component | Notes |
|-----------|-------|
| AuditForm | URL + GO |
| FileUploader | Screenshot tile |
| CreditMeter | Guest “1 free audit” / 150 display — not fake large balance |
| Feedback chips | Green upload OK · red upload fail / invalid URL |
| Button GO | Disabled until valid input |

Per `COMPONENT_BEHAVIOR.md` INP/BTN/upload rules.

### Pages

- `/` or marketing landing = SCREEN-001.  
- Wire navigate → Progress when BM-07 ready (or stub route).

### State Management

- LAND-STATE-001…014 (idle, typing, valid/invalid URL, upload, GO enabled/disabled, credits checking).  
- AUTH-STATE-001 Guest.  
- Local form state; no fake entitlement store.

### Hooks

- `useAuditForm` (URL validate client-side).  
- `useScreenshotUpload` (signed URL → PUT → chip states).  
- `useGuestSession` (quota remaining).

### Forms

- React Hook Form + Zod: URL optional vs screenshot XOR per VALIDATION_RULES / BR-SHOT-004.  
- Esc clears URL error (product rule).

### Animations

- Upload/GO hover gradients (cosmetic).  
- Chip enter/exit fade.  
- Disable under reduced motion.

### Accessibility

- Label associations Upload → URL → GO focus order.  
- Upload `aria-busy` while uploading; errors in `aria-live`.  
- GO name updates when busy (“Analyzing…” later).  
- Chip dismiss buttons named.

### Testing

- Guest upload → success chip.  
- Invalid URL chip.  
- GO disabled when empty.  
- Second guest attempt opens SSO (when FM-03 linked).  
- Keyboard-only path through form.

### Responsive Behaviour

- Mobile: stack Upload; URL+GO full width; GO may wrap below.  
- Desktop: match Screen1 composition.

### Dark Mode

- Light only; no alternate landing skin.

### Loading States

- Upload progress on tile.  
- GO `aria-busy` + disabled siblings on submit.  
- Credits meter skeleton if session probe in flight.

### Error States

- LAND-STATE-004 Invalid URL.  
- LAND-STATE-009 Upload failed.  
- Offline: disable GO (APP-STATE-003) when detector exists.  
- API errors → toast + chip per ERROR_HANDLING.

### Backend dependency

BM-05 uploads · BM-07 create audit (can mock until ready).

### Estimated Complexity

**L**

### Dependencies

- FM-01  
- SCREEN-001 assets

### Completion Criteria

- [ ] Landing matches Screen1 structure & tokens  
- [ ] Guest screenshot path enforceable in UI  
- [ ] URL invalid + upload fail chips work  
- [ ] GO gating matches guest/Free rules  
- [ ] Prices/credits copy from `PRICING.md` not stale Figma $99/$199  

---

## FM-03 — SSO auth UI & session chrome

### Goal

SCREEN-003 SSO modal (Google / Apple / Microsoft), guest & logged-in profile dropdowns (SCREEN-002 / Screen2 menu), session restore, sign-out, claim-guest messaging hooks.

### Layout

- Modal centered over dimmed overlay; focus trap.  
- Header avatar menu (popover) — guest vs authed item enablement.

### Components

| Component | Notes |
|-----------|-------|
| OAuthButtons | Google, Apple, Microsoft only |
| Dialog (SSO) | MDL-001 |
| Profile dropdown | Guest: Login on; History/Settings/Manage Plan disabled |
| AuthGuard | Client + middleware alignment |

No password / SignUpForm / GitHub.

### Pages

- Modal global (opened from gates).  
- Post-login redirect resume (URL gate, Subscribe, second guest GO).

### State Management

- AUTH-STATE-002…010 (modal open, provider loading, success, failed, logout, session expired).  
- Clear client stores on logout.  
- Hydrate user from `GET /me`.

### Hooks

- `useAuth` / `useSession`.  
- `useOAuthLogin(provider)`.  
- `useProfileMenu`.

### Forms

- None (SSO buttons only).

### Animations

- Modal open/close short fade; reduced-motion = instant.  
- Provider button busy state (no spinner-only).

### Accessibility

- Dialog: initial focus heading/first provider; Esc/backdrop close unless redirecting.  
- Restore focus to avatar/trigger.  
- Provider buttons named; `aria-busy` on active provider; others disabled while loading.  
- Menu: `aria-expanded`, roving tabindex.

### Testing

- Open/close SSO; Esc restores focus.  
- Guest menu disables History/Settings/Billing.  
- Failed auth shows AUTH-STATE-008.  
- Sign-out → Landing guest chrome.

### Responsive Behaviour

- Modal full-width sheet on small screens if design requires; ≥44px provider hits.

### Dark Mode

- Light modal; no dark variant.

### Loading States

- AUTH-STATE-006 Authentication Loading (APP-STATE-001 if full redirect).  
- Header skeleton for avatar/credits until `/me` returns.

### Error States

- AUTH-STATE-008 failed provider.  
- APP-STATE-006 Session Expired → re-open SSO.  
- Rate limit toast (429).

### Backend dependency

**BM-03** Auth APIs.

### Estimated Complexity

**M**

### Dependencies

- FM-01 · FM-02 (open from gates)

### Completion Criteria

- [ ] Three SSO providers only  
- [ ] Guest vs authed menus match SCREEN-002/004  
- [ ] Session hydrate updates header  
- [ ] Focus trap + restore verified  
- [ ] Claim-guest UX hook ready when backend claims  

---

## FM-04 — Logged-in Home (Free & Pro)

### Goal

SCREEN-004 Free Home and SCREEN-009 Pro Home: same audit input, tier-aware GO (gray vs purple), crown + credits, profile menu (History, Settings, Manage Plan, Sign out), upgrade gates for Free URL.

### Layout

- Authenticated AppShell: logo · CreditMeter · crown (Pro/Business) · avatar.  
- Home main = AuditForm composition (not multi-widget dashboard unless Figma shows it — prefer Screen2/9).

### Components

| Component | Notes |
|-----------|-------|
| CreditMeter | Live balance bands |
| AuditForm / FileUploader | Shared with landing |
| UpgradeDialog trigger | Free URL → M08 (FM-10 can finish dialog) |
| QuickAuditWidget | Only if mapped; else reuse AuditForm |

### Pages

- `/dashboard` or `/` post-login Home.  
- Prefill URL on re-audit query params (later).

### State Management

- LAND-STATE-* under authed context.  
- Credits Available / Exhausted (LAND-STATE-010/011).  
- Membership tier in session store.  
- PAST_DUE premium soft-block messaging when applicable.

### Hooks

- `useCredits` (poll/revalidate).  
- `useMembership`.  
- `useStartAudit` (Idempotency-Key, navigate Progress).

### Forms

- Same XOR validation as landing; Free URL submit → upgrade, not API.

### Animations

- GO enabled gradient for Pro.  
- Credit meter number change subtle.

### Accessibility

- Crown decorative (`aria-hidden`) with tier text elsewhere.  
- CreditMeter accessible name with balance.  
- Disabled GO explained (tooltip or `aria-describedby`).

### Testing

- Free: screenshot GO works; URL GO → upgrade path.  
- Pro: purple GO; URL allowed.  
- Credits 0 → exhausted UI.  
- Crown visible for Pro/Business only.

### Responsive Behaviour

- Header collapses gracefully; meter + avatar remain usable.  
- Same mobile stack as landing form.

### Dark Mode

- Light only.

### Loading States

- Header credits skeleton.  
- GO busy on submit; prevent double-submit.

### Error States

- Insufficient credits → upgrade / buy credits CTA.  
- Unverified email banner if API returns EMAIL_NOT_VERIFIED.  
- Invalid URL chip (Pro).

### Backend dependency

BM-03 · BM-04 · BM-07 (create).

### Estimated Complexity

**L**

### Dependencies

- FM-03  

### Completion Criteria

- [ ] Free and Pro homes match Screen2 / Screen9 behaviour  
- [ ] Tier gating correct in UI (server still authoritative)  
- [ ] Header always shows credits + avatar after hydrate  
- [ ] Prices/credits never contradict `PRICING.md`  

---

## FM-05 — Manage Plan & payment flows

### Goal

SCREEN-005 Manage Plan ($29 / $99 labels), payment entry via **Stripe Elements/Checkout** mapped to Screen5–5.4 success/fail modals, webhook-delay “activating…” state.

### Layout

- Manage Plan page/panel with Individual + Enterprise groupings.  
- Payment as modal/sheet; success/fail confirmation modals.

### Components

| Component | Notes |
|-----------|-------|
| PricingTable / PlanCard | Free / Pro / Business; Active Account non-purchase |
| CheckoutButton | Starts Stripe session / Elements |
| Payment success / fail modals | SCREEN-007/008 |
| BillingSummary | Optional |

**PCI:** No custom PAN/CVV inputs — Stripe Element or redirect Checkout; OTP UI maps to 3DS (R4).

### Pages

- `/billing` or `/settings/plan` = SCREEN-005.  
- Checkout return route (SCREEN-M07) stub → complete in FM-10.

### State Management

- BILL-STATE-001… (loading plans, selected, upgrade started, payment pending/success/failed).  
- APP-STATE-013 Webhook Delay (poll membership).  
- Active Account state for current tier (BR-SUB-004).

### Hooks

- `usePlans`.  
- `useCheckout(tier)`.  
- `useBillingPortal`.  
- `useMembershipPoll` (post-payment).

### Forms

- Stripe Elements fields only (provider-managed).  
- No Audient-owned card Zod schema for PAN.

### Animations

- Modal transitions; success checkmark short.  
- Reduced motion: static icons.

### Accessibility

- Plan cards: Subscribe CTA focusable; Recommended badge not colour-only.  
- Payment dialog focus trap; errors announced.  
- Status “Activating your plan…” as `role="status"`.

### Testing

- Free sees Subscribe on Pro/Business.  
- Current plan shows Active Account (no charge).  
- Fail modal → retry.  
- Success → poll until Pro chrome (crown).  
- Top-up entry point disabled for Free (link to upgrade).

### Responsive Behaviour

- Plan cards stack on mobile.  
- Payment sheet full-height on mobile; sticky CTA must not obscure focused Stripe fields (2.4.11).

### Dark Mode

- Light billing UI only.

### Loading States

- BILL-STATE-001 plan skeletons.  
- Checkout button busy.  
- Webhook delay spinner + copy.

### Error States

- Payment failed modal (SCREEN-007).  
- Stripe load failure toast.  
- 429 on checkout.

### Backend dependency

**BM-06** Billing + webhooks.

### Estimated Complexity

**L**

### Dependencies

- FM-03 · FM-04  
- Stripe publishable key

### Completion Criteria

- [ ] Manage Plan shows **$29 / $99** (not Figma $99/$199)  
- [ ] No raw card data in Audient DOM/state  
- [ ] Success/fail/activating states implemented  
- [ ] Entitlements UI updates only after membership reflects webhook  

---

## FM-06 — Audit Progress & Failure (M01 / M03)

### Goal

SCREEN-M01 Progress and SCREEN-M03 Failure: poll status, stage copy (screenshot vs URL), cancel, auto-navigate to Report or Failure with refund messaging.

### Layout

- Focused progress composition (one job): status, stage list/timeline, cancel.  
- Failure: message + Retry + Home (History-empty-like calm layout).

### Components

| Component | Notes |
|-----------|-------|
| AuditProgress | Stages from STATE_MANAGEMENT AUDIT-STATE-* |
| ConfirmDialog | Cancel confirm |
| EmptyState-style failure panel | M03 |

### Pages

- `/audit/[auditId]/progress` (or equivalent).  
- `/audit/[auditId]/failed`.

### State Management

- AUDIT-STATE-001…016 mapped to UI stages.  
- Poll every ~2s while QUEUED/PROCESSING.  
- Reconnecting state on transient network blip.  
- Cancel → Home + refund expectation messaging.

### Hooks

- `useAuditStatus(auditId)` (interval / visibility-aware).  
- `useCancelAudit`.  
- `useAuditNavigation` (COMPLETED→report, FAILED→failure).

### Forms

- None.

### Animations

- Stage progress motion optional; **must** have text equivalent.  
- Pause/stop under reduced motion (static current stage).

### Accessibility

- Live region for stage changes (polite; throttle).  
- Cancel reachable by keyboard.  
- Failure `role="alert"` for primary message.  
- Do not rely on colour alone for failed.

### Testing

- Mock status stream QUEUED→COMPLETED redirects.  
- FAILED shows taxonomy message + Retry.  
- Tab blur/refocus resumes poll.  
- Cancel confirm works.

### Responsive Behaviour

- Centered column; readable on mobile; no horizontal scroll.

### Dark Mode

- Light only; reuse surface tokens.

### Loading States

- Initial progress skeleton before first status.  
- Stage “busy” indicators.

### Error States

- AUDIT-STATE-013 Failed (M03).  
- Poll 404 → No report / deleted.  
- Timeout copy per ERROR_HANDLING.  
- Refund callout when API indicates refund.

### Backend dependency

**BM-07** (screenshot) · **BM-08** (URL stages).

### Estimated Complexity

**L**

### Dependencies

- FM-04  
- `MISSING_SCREENS_PLAN.md` M01/M03

### Completion Criteria

- [ ] Progress polls and redirects correctly  
- [ ] Screenshot vs URL stage sets differ  
- [ ] Failure + retry/home paths clear  
- [ ] Live regions + reduced motion verified  

---

## FM-07 — Audit Report & PDF (M02)

### Goal

SCREEN-M02 Report: scores, recommendations, brief vs full depth, PDF download for paid, feedback optional, Free teaser + upgrade, re-audit CTA.

### Layout

- Breadcrumb Home / Report.  
- Score summary → prioritized recommendation list → optional annotated screenshot.  
- Sticky or header PDF action for Pro/Business.

### Components

| Component | Notes |
|-----------|-------|
| ScoreCard / ScoreGauge | Overall + category |
| RecommendationCard | SeverityBadge, priority |
| AnnotatedScreenshot | If refs exist |
| PdfDownloadButton | Paid only |
| CompetitiveAnalysisPanel | **Omit or nullable placeholder** — BR-AI-006 |
| Upgrade teaser | Free deep-link |

### Pages

- `/audit/[auditId]` report view.  
- Entry from Progress, History, notification.

### State Management

- RPT-STATE-001…008 (loading, ready, missing, PDF generating/ready/downloading/failed).  
- Free vs paid depth flags from membership + report payload.

### Hooks

- `useReport(auditId)`.  
- `useRecommendations(auditId)`.  
- `usePdfDownload(auditId)`.  
- `useReportFeedback`.

### Forms

- Optional feedback: rating + comment (Zod).  
- Re-audit is navigation + new POST, not an edit form.

### Animations

- Score count-up optional; disable under reduced motion.  
- List stagger subtle only.

### Accessibility

- Scores: text alternative (not colour-only gauges).  
- Recommendations as list/headings; severity text + badge.  
- PDF button announces busy/generating.  
- Charts/gauges: ACCESSIBILITY §14.

### Testing

- Free sees brief + upgrade; PDF hidden/disabled.  
- Pro sees full + PDF signed download.  
- PDF fail does **not** claim credit refund.  
- Empty recommendations edge.  
- Ownership 404 page.

### Responsive Behaviour

- Cards stack; scores row → column on mobile.  
- PDF control reachable without horizontal scroll.

### Dark Mode

- Light report; PDF template follows export theme separately (backend).

### Loading States

- RPT-STATE-001 report skeletons (scores + card placeholders).  
- PDF generating spinner on button.

### Error States

- RPT-STATE-003 No report.  
- PDF download failed — retry PDF only.  
- Forbidden Free full content → teaser + M08.

### Backend dependency

**BM-09** (and BM-07/08 data).

### Estimated Complexity

**XL**

### Dependencies

- FM-06  
- Report design continuity rules in MISSING_SCREENS_PLAN

### Completion Criteria

- [ ] Brief vs full depth enforced in UI  
- [ ] Recommendations render with severity/priority  
- [ ] PDF gated + loading/error states  
- [ ] No required competitive-analysis block  
- [ ] Re-audit CTA returns Home with prefill when specified  

---

## FM-08 — History

### Goal

SCREEN-012 populated History (grouped by year) and SCREEN-013 empty state; open report, PDF (paid), delete with confirm; guests cannot open.

### Layout

- AppShell + main history list.  
- Year group headings.  
- Empty: centered “No History to display”.

### Components

| Component | Notes |
|-----------|-------|
| AuditHistoryTable / list rows | Row → report; download icon |
| EmptyState | SCREEN-013 |
| ConfirmDialog | Delete |

**Do not** build search/filter UI (OOS / no API).

### Pages

- `/history`.  
- Guest/menu disabled → SSO if navigated.

### State Management

- HIST-STATE-001 Loading · 002 Empty · 003 Loaded · 006 Deleting · 007 Error.  
- Ignore HIST-STATE-004/005 search/filter for MVP (no UI).

### Hooks

- `useAuditHistory`.  
- `useDeleteAudit`.

### Forms

- None (delete confirm only).

### Animations

- Row remove fade; reduced-motion = instant unmount.

### Accessibility

- Table/list semantics (ACCESSIBILITY §13).  
- Group headings; per-row link + download named.  
- Delete confirm focus trap.

### Testing

- Empty vs populated.  
- Guest blocked.  
- Delete removes row; no “credits refunded” claim.  
- PDF icon hidden/disabled for Free.

### Responsive Behaviour

- Rows stack metadata on mobile; actions remain ≥44px.

### Dark Mode

- Light only.

### Loading States

- HIST-STATE-001 list skeletons.

### Error States

- HIST-STATE-007 load error + retry.  
- Delete failure toast; row restored.

### Backend dependency

BM-07 list/delete · BM-09 PDF.

### Estimated Complexity

**M**

### Dependencies

- FM-03 · FM-07 (navigation)

### Completion Criteria

- [ ] Matches Screen8/10 grouping & empty  
- [ ] No search/filter chrome  
- [ ] Delete confirm + ownership errors handled  
- [ ] Paid PDF from row works  

---

## FM-09 — Account Settings

### Goal

SCREEN-010 Personal and SCREEN-011 Payment Details: profile fields, avatar upload, read-only email, payment method via Stripe (no raw PAN), sticky save where designed.

### Layout

- Settings tabs or subnav: Personal | Payment Details.  
- Mobile: sticky “Update Changes” without obscuring focused fields.

### Components

| Component | Notes |
|-----------|-------|
| Settings forms | Name, avatar |
| FileUploader | Avatar variant |
| Stripe payment method Element | Replace card mock fields |
| Tabs | Personal / Payment |

Resolve duplicate Email field (R6): **one** read-only email.

### Pages

- `/settings` · `/settings/payment`.

### State Management

- Settings load/edit/dirty/saving/success/error (STATE_MANAGEMENT § Settings).  
- Avatar uploading state.

### Hooks

- `useSettings`.  
- `useUpdateProfile`.  
- `usePaymentMethodSession`.

### Forms

- RHF + Zod: name constraints per VALIDATION_RULES.  
- Email disabled/read-only.  
- Payment: Stripe-only.

### Animations

- Save success toast; minimal motion.

### Accessibility

- Tabs keyboard pattern.  
- Read-only email announced.  
- Invalid fields focus first error.  
- Sticky CTA vs Focus Not Obscured.

### Testing

- Email not editable.  
- Avatar MIME/size errors.  
- Payment invalid → inline/Stripe error (Screen11.1 patterns without storing PAN).  
- Sign-out from menu still works.

### Responsive Behaviour

- Stack sections; sticky footer CTA on mobile payment.

### Dark Mode

- Wire Settings `theme` select (LIGHT / SYSTEM / DARK) **control** for future; selecting DARK may no-op visually until tokens exist — document in UI helper text if needed. **Do not** ship invented dark CSS.

### Loading States

- Settings form skeleton.  
- Avatar upload busy.  
- Payment Element load spinner.

### Error States

- Field validation inline.  
- API save failure toast.  
- Payment method update failure.

### Backend dependency

BM-03 `/me` · BM-05 avatar upload · BM-06 payment-method · BM-10 settings API.

### Estimated Complexity

**M**

### Dependencies

- FM-03  

### Completion Criteria

- [ ] Personal + Payment screens match Screen6 / 6.1 / 11 behaviour without PCI violations  
- [ ] Email read-only  
- [ ] Theme control present; light UI remains default  
- [ ] Sticky mobile CTA a11y verified  

---

## FM-10 — Notifications, upgrades & system hardening

### Goal

Close MVP UI: SCREEN-M08 Upgrade, M04 Notifications, M05 Buy Credits, M06 Billing/invoices entry, M07 Checkout return, system pages (404/500/offline/session/maintenance), full responsive + a11y pass, analytics hooks.

### Layout

- Notification panel/drawer in header.  
- Upgrade dialog over current route.  
- System pages centered calm layouts (reuse EmptyState).  
- Optional billing invoices list page.

### Components

| Component | Notes |
|-----------|-------|
| UpgradeDialog | Free URL / PDF / credits exhausted |
| Notifications list | Mark read / read-all |
| Buy Credits packs | Pro/Business only; Free → Upgrade |
| System EmptyStates | M09–M11, M16–M17 |

### Pages

- Notification UI (panel or `/notifications`).  
- `/billing/credits` (M05).  
- `/billing/return` (M07).  
- `not-found` · `error` · offline banner · maintenance.

### State Management

- NOTIF-STATE-001…006.  
- APP-STATE-003 Offline · 004 Poor network · 005 Maintenance · 006 Session · 009 404 · 010 500 · 012 429.  
- Upgrade dialog open reason enum.

### Hooks

- `useNotifications`.  
- `useMarkNotificationRead`.  
- `useOnlineStatus`.  
- `useUpgradeDialog`.  
- Analytics `useTrack` aligned with `ANALYTICS.md`.

### Forms

- Buy credits: pack selection → checkout (no card form).

### Animations

- Notification badge pulse optional; reduced-motion off.  
- Dialog motions consistent with FM-03.

### Accessibility

- Full WCAG 2.2 AA regression on P0 flows.  
- Notification list live region for new items (polite).  
- Upgrade dialog focus trap.  
- System pages: single H1 + link to Home.

### Testing

- Deep-link notification → Report.  
- Free buy-credits → Upgrade.  
- Offline disables GO + banner.  
- Session expired mid-audit → SSO.  
- 404/500 pages render.  
- Keyboard marathon: Landing → SSO → Home → Plan → Progress → Report → History → Settings.  
- axe + manual SR smoke.

### Responsive Behaviour

- Final pass all SCREEN-* + M0* at 320 / 768 / 1280.  
- No horizontal scroll; header usable; tables/lists adapt.

### Dark Mode

- Confirm no accidental dark CSS.  
- Theme setting still non-inventive; SYSTEM follows OS only when dark tokens approved — until then force light.

### Loading States

- Notifications skeleton.  
- Checkout return “confirming payment…”.  
- Global poor-network subtle indicator.

### Error States

- Notification load error.  
- Top-up failure.  
- Maintenance full-page.  
- Rate limited toast with retry timing.

### Backend dependency

**BM-10** notifications/settings · BM-06 return/top-ups.

### Estimated Complexity

**L**

### Dependencies

- FM-04…FM-09  
- Private beta checklist

### Completion Criteria

- [ ] M04–M08 and system pages shipable  
- [ ] Upgrade dialog covers Free URL / PDF / credits gates  
- [ ] Offline/session/404/500 handled  
- [ ] Responsive + a11y pass documented  
- [ ] Analytics events wired for core funnels without blocking UI  
- [ ] MVP frontend DoD (below) satisfied  

---

## Cross-cutting checklist (every milestone)

| Concern | Rule |
|---------|------|
| Tokens | Tailwind theme only — no one-off hex |
| Logic | Keep presentational; hooks/services own machines |
| Server truth | Never trust client for credits/tier |
| PCI | Stripe Elements/Checkout/Portal only |
| Motion | ≥ intentional motions where visual; always `prefers-reduced-motion` |
| Components | ≤250 lines; reuse shadcn |
| OOS | No History search, share, password, GitHub, teams |

---

## Screen → milestone map

| Screen | Milestone |
|--------|-----------|
| SCREEN-001 Landing | FM-02 |
| SCREEN-002 Guest menu | FM-03 |
| SCREEN-003 SSO | FM-03 |
| SCREEN-004 Free Home | FM-04 |
| SCREEN-005 Manage Plan | FM-05 |
| SCREEN-006–008 Payment | FM-05 |
| SCREEN-009 Pro Home | FM-04 |
| SCREEN-010–011 Settings | FM-09 |
| SCREEN-012–013 History | FM-08 |
| SCREEN-M01 Progress | FM-06 |
| SCREEN-M02 Report | FM-07 |
| SCREEN-M03 Failure | FM-06 |
| SCREEN-M04 Notifications | FM-10 |
| SCREEN-M05 Buy Credits | FM-10 |
| SCREEN-M06 Billing mgmt | FM-10 |
| SCREEN-M07 Checkout return | FM-10 |
| SCREEN-M08 Upgrade | FM-10 |
| M09–M11, M16–M17 System | FM-10 |

---

## Backend ↔ frontend dependency cheat sheet

| Frontend | Needs backend |
|----------|----------------|
| FM-02 guest audit | BM-05 · BM-07 |
| FM-03 SSO | BM-03 |
| FM-04 Home | BM-04 · BM-07 |
| FM-05 Billing UI | BM-06 |
| FM-06 Progress | BM-07/08 status |
| FM-07 Report/PDF | BM-09 |
| FM-08 History | BM-07 list/delete |
| FM-09 Settings | BM-03/05/06/10 |
| FM-10 Notifications | BM-10 |

UI may develop against mocks; **Completion Criteria** that cite live data require the matching BM.

---

## Definition of frontend MVP done

1. Guest can complete **one** screenshot audit → Progress → brief Report.  
2. SSO Google/Apple/Microsoft; header credits + menus correct.  
3. Free Home + Pro Home gating (URL/PDF/crown) match BUSINESS_RULES.  
4. Manage Plan at **$29 / $99**; Stripe payment without raw PAN; success/fail/activating.  
5. Progress/Failure/Report/PDF/History/Settings usable on mobile and desktop.  
6. Upgrade + notifications + empty/error system pages.  
7. WCAG 2.2 AA critical paths; reduced motion; no invented dark skin.  
8. Loading and error states from STATE_MANAGEMENT covered for P0 flows.

---

## Related documents

| Doc | Role |
|-----|------|
| SCREEN_MAPPING / MISSING_SCREENS_PLAN | Screens |
| COMPONENT_* | Build inventory & behaviour |
| STATE_MANAGEMENT.md | Machines & UI states |
| ACCESSIBILITY.md | AA bar |
| API_MAPPING.md | Screen → API |
| BACKEND_TASKS.md | Parallel backend milestones |
| TEST_CASES.md | QA IDs |

---

**End of FRONTEND_TASKS.md**
