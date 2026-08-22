# AUDIENT — Frontend Integration Specification

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA · Backend (handoff)  

**Document type:** Integration pass specification — **no backend implementation**, **no application code in this document**.  
**Phase:** Final frontend coherence review **before** Supabase · Stripe · AI audit API wiring.

**Related docs:** `docs/SCREEN_MAPPING.md` · `docs/FRONTEND_TASKS.md` (FM-01…FM-10) · `docs/TECHNICAL_ARCHITECTURE.md` · `docs/PRICING.md` · `src/config/plans.ts` · `docs/ACCESSIBILITY.md` · `docs/ERROR_HANDLING.md` · `docs/DESIGN_TOKENS.md` · `docs/CURSOR_RULES.md` · `docs/FOLDER_STRUCTURE.md` · `STATE_MANAGEMENT.md` · `docs/components/COMPONENT_ERROR_STATE.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`

---

## 1. Purpose

Define the **final frontend integration pass** before backend implementation.

This document verifies that all existing screens behave as **one coherent mock application** — shared navigation, auth, membership, credits, audits, errors, tokens, and responsive/a11y behaviour — without connecting Supabase, Stripe, or AI audit APIs yet.

**Goal:** A frontend **integration-ready** deliverable that backend work can plug into safely.

---

## 2. Objectives

Verify that all existing screens:

| Area | Requirement |
|------|-------------|
| **Navigation** | Same header/profile chrome and route map; no forked nav logic per screen |
| **Authentication** | Single auth source — guest vs authenticated; SSO/login modal pattern |
| **Membership** | Tier rules (Guest · Free · Pro · Business) applied consistently |
| **Mock user** | One canonical user shape consumed by header, settings, workspace |
| **Credits** | Balances and costs align with `docs/PRICING.md` / `plans.ts` |
| **Audits** | History, processing, report, failure share audit IDs and status taxonomy |
| **Errors** | Shared error/maintenance components — no one-off failure layouts |
| **Responsive** | Mobile-first; same breakpoints and touch targets |
| **Design tokens** | Tailwind tokens only — no hardcoded colours or spacing |

---

## 3. Technical rules (non-negotiable)

| Rule | Spec |
|------|------|
| **No Supabase** | Do not connect Auth/DB/Storage APIs in this pass |
| **No Stripe** | Do not connect payment intents or webhooks — mock checkout/success/failure only |
| **No AI audit APIs** | Processing/report remain mock timers and fixture data |
| **Mock data** | Use and consolidate existing `src/data/mock-*` fixtures |
| **No redesign** | Match Figma / existing screen specs — integration fixes only |
| **No duplicate components** | Reuse `src/components/ui/*`, common/system/legal/billing modules |
| **Single state system** | Extend `AuthProvider` + existing providers/hooks — **no second global store** (no parallel Redux/Zustand unless already adopted) |
| **Routes stay thin** | Pages compose screens; logic in `services` / `hooks` / `utils` |

---

## 4. Authentication

### 4.1 Supported states

| State | Internal representation | UI signals |
|-------|-------------------------|------------|
| **Guest** | Unauthenticated visitor | Guest avatar · limited profile dropdown · login CTAs |
| **Authenticated (generic)** | Signed-in user | Full header · profile menu |
| **Free** | `planTier: FREE` | URL audit disabled · upgrade prompts · minimal report |
| **Pro** | `planTier: PRO` | URL audit enabled · full report · PDF where permitted |
| **Business** | `planTier: ENTERPRISE` | Workspace · team · business usage widgets |

Map display tiers to schema: Free → `FREE` · Pro → `PRO` · Business → `ENTERPRISE` (`src/config/plans.ts`).

### 4.2 Integration checks

| Check | Pass criteria |
|-------|---------------|
| Single provider | All screens read auth via `useAuth()` / `AuthProvider` — not local hardcoded user |
| Mock mode | `USE_MOCK_AUTH` path works end-to-end without Supabase |
| Login modal | CTAs use `LoginModalProvider` — `source` and `nextPath` preserved |
| Session expired | `session_expired` opens login modal with return path |
| Sign-out | Clears mock session + membership stub; returns to guest-safe route |
| Guest audit | One anonymous screenshot path before login gate (per PRICING) |

**Do not** add email/password auth UI (SSO-only product rule).

---

## 5. Navigation

### 5.1 Route map (verify all resolve — no 404 unless intentional)

| Destination | Route (current) | Auth |
|-------------|-----------------|------|
| **Home** | `/` | Guest + auth |
| **Dashboard** | `/dashboard` | Auth |
| **Audit processing** | `/audit/[auditId]` | Guest + auth |
| **Audit report** | `/audit/[auditId]/report` | Guest + auth (tier-gated content) |
| **Audit history** | Dashboard/history surfaces + audit cards | Auth |
| **Manage membership** | `/billing` (membership section) | Auth |
| **Billing & payments** | `/billing` | Auth |
| **Checkout** | `/checkout` · `/billing/checkout` | Auth |
| **Payment processing** | `/payment/processing` | Auth |
| **Payment success / failure** | `/payment-success` · `/payment-failure` | Auth |
| **Invoice history** | `/invoice-history` | Auth |
| **Notifications** | `/notifications` | Auth |
| **Settings** | `/settings` | Auth |
| **Business workspace** | `/workspace` | Business tier |
| **Roles & permissions** | `/workspace/roles` | Business admin mock |
| **Help & support** | `/help` | Guest + auth |
| **Legal & privacy** | `/legal` · `/legal/[document]` | Guest + auth |
| **Terms / privacy shortcuts** | `/terms` · `/privacy` → legal redirects | Guest + auth |
| **Error states (QA)** | `/system/error?state=` | Guest + auth |
| **Maintenance** | `/maintenance` | Guest + auth |
| **Global 404** | `not-found.tsx` | Guest + auth |
| **Sign-in** | `/sign-in` | Guest |

### 5.2 Navigation integration checks

| Check | Pass criteria |
|-------|---------------|
| Header consistency | Guest `Header` vs auth `DashboardHeader` — credits, avatar, tier badge match mock user |
| Profile dropdown | Same menu items and gates on every authenticated screen |
| Active route | Nav highlights / breadcrumbs correct where spec defines them |
| Deep links | Refresh on any route above does not break layout or auth |
| Back navigation | Browser back from modals and wizards restores sensible state |
| No dead links | Every button/link in header, footer, and profile reaches a real route or modal |
| Error recovery | 404/500/maintenance actions route to `/dashboard` or `/` per tier rules |

---

## 6. Membership rules

Authoritative: `docs/PRICING.md` · `src/config/plans.ts` · `docs/BUSINESS_RULES.md`.

| Tier | Audit results | URL audit | Upgrade prompts | Workspace / team | PDF export |
|------|---------------|-----------|-----------------|------------------|------------|
| **Guest** | Minimal / teaser | Disabled | Visible | Hidden | Gated |
| **Free** | Minimal | Disabled | Visible | Hidden | Gated |
| **Pro** | Full | Enabled | Contextual | Hidden | Enabled where spec allows |
| **Business** | Full | Enabled | Contextual | Enabled | Enabled where spec allows |

### Integration checks

| Check | Pass criteria |
|-------|---------------|
| GO button | Gray/disabled for Guest/Free URL; enabled for Pro/Business |
| Locked cards | `LockedCard` / upgrade banner on gated sections — not duplicate blur UIs |
| Plan labels | UI shows Free / Pro / Business; maps to `FREE` / `PRO` / `ENTERPRISE` |
| Credits cost | Screenshot vs URL debit matches plan config |
| Workspace gate | `/workspace` and `/workspace/roles` redirect or locked for non-Business |
| Checkout | Selected plan in checkout matches membership widget and current plan card |

---

## 7. Global mock state

### 7.1 Purpose

Create (or consolidate into) a **centralized mock state model** so screens stop importing unrelated fixtures. Recommended shape — single module or facade (e.g. `src/data/mock-app-state.ts` or extend `mock-dashboard` bundle):

| Domain | Canonical source (today) | Integration target |
|--------|------------------------|-------------------|
| **User** | `AuthProvider` + `lib/auth/mock-session` | Profile, settings, header |
| **Membership** | `lib/auth/mock-membership` | Billing, plan cards, widgets |
| **Credits** | `mock-credits-widget` · `resolveMockCreditsRemaining` | Header, dashboard, billing |
| **Audits** | `mock-recent-audits` · `mock-audit-report` · `mock-audit-history-card` | Dashboard, history, report, processing |
| **Team** | `mock-team-members` · `mock-team-activity` · `mock-business-workspace` | Workspace, roles |
| **Notifications** | `mock-notifications-screen` · `notification-inbox-provider` | Notifications, badge |
| **Billing** | `mock-billing-payments` · `mock-invoice-history` · `mock-checkout` | Billing, invoices, checkout |
| **Permissions** | `mock-roles-permissions` · `config/roles-permissions-screen` | Roles screen |
| **Legal / consent** | `mock-legal-documents` · `mock-legal-consent` | Legal hub |
| **System status** | `mock-system-status` · `mock-maintenance-state` | Banner, maintenance page |

### 7.2 Rules

| Rule | Spec |
|------|------|
| One user story | Same `userId`, name, email, tier across dashboard, settings, billing |
| One credit balance | Header credits = billing widget = checkout context |
| Audit ID continuity | Audit opened from history matches report/processing routes |
| Team roster | Workspace members align with roles matrix mock |
| No drift | Changing tier in mock session updates all tier-gated UI on refresh/navigation |
| Facade API | Screens request `getMockAppState({ tier?, userId? })` — not ad hoc imports of 10 files |

**This pass implements consolidation — not backend persistence.**

---

## 8. Components

Verify components **consume shared state** rather than duplicated hardcoded data.

| Area | Shared primitives | Verify |
|------|-------------------|--------|
| **Layout** | `Header`, `DashboardHeader`, `Footer`, `SkipLink`, `Breadcrumb` | All full-page screens |
| **Auth** | `LoginModal`, `LoginModalProvider` | CTAs app-wide |
| **Billing** | `CurrentPlanCard`, `UsageWidget`, `PlanComparisonModal` | Billing, checkout, membership |
| **Audit** | `RecentAuditCard`, `AuditStatusBadge`, processing/failure panels | Dashboard, history, audit flows |
| **Empty / error** | `EmptyState`, `ErrorState`, `ErrorIllustration`, `ErrorActions` | Lists and failures |
| **System** | `SystemStatusBanner`, `MaintenanceState`, `SystemStateScreen` | Shell + QA routes |
| **Legal** | `LegalDocumentCard`, `LegalNavigation`, consent/privacy cards | Legal hub |
| **Forms** | shadcn `Input`, `Button`, RHF patterns | Settings, checkout, help |

### Integration checks

| Check | Pass criteria |
|-------|---------------|
| No inline mock arrays in page files | Data from `src/data/*` or centralized facade |
| Tier props | Components receive tier from auth/mock state — not hardcoded `"pro"` |
| DRY | No third empty-state layout; no fourth error panel |
| Exports | Import via `@/components/*` barrel paths per `FOLDER_STRUCTURE.md` |

---

## 9. Loading states

Verify consistent loading UX (`docs/FRONTEND_TASKS.md` · APP-STATE loading taxonomy).

| Surface | Expected pattern | Routes / components |
|---------|-------------------|---------------------|
| **Page loading** | Route-level skeleton or shell placeholder | Dashboard, billing, settings, notifications |
| **Component loading** | Card/section skeletons | Widgets, tables, FAQ, legal viewer |
| **Audit processing** | Progress screen with poll mock | `/audit/[auditId]` |
| **Payment processing** | Busy state + status copy | `/payment/processing` |
| **Data loading** | Skeleton → content or empty/error | History, invoices, notifications list |

### Checks

| Check | Pass criteria |
|-------|---------------|
| No flash of empty | Loading completes before empty state |
| Busy buttons | Submit/checkout/save disable with `aria-busy` |
| Reduced motion | Spinners respect `prefers-reduced-motion` |

---

## 10. Error states

Verify shared error system (SCREEN-025 · COMPONENT-072…076).

| Error | Surface | Verify route / component |
|-------|---------|--------------------------|
| **404** | Global not-found | `not-found.tsx` |
| **403** | Forbidden page / gate | `/system/error?state=forbidden` |
| **500** | Error boundary | `error.tsx` |
| **Network** | Banner or full page | `/system/error?state=network_error` · `SystemStatusBanner` |
| **Session expired** | Login modal | `/system/error?state=session_expired` |
| **Audit failure** | Processing band | `AuditFailedPanel` / SCREEN-003 |
| **Payment failure** | Payment failure screen | `/payment-failure` |
| **Maintenance** | Full page + banner | `/maintenance` · `?systemStatus=maintenance` |
| **Generic** | Fallback | `/system/error?state=generic_error` |

### Checks

| Check | Pass criteria |
|-------|---------------|
| Sanitized copy | No stack traces, tokens, or internal IDs in UI |
| Shared components | `ErrorState` / `MaintenanceState` — not one-off layouts |
| Actions work | Retry, Back to Dashboard, Login (mock handlers) |
| Analytics dev stubs | `errorSystemAnalytics` / `systemStatusAnalytics` fire in development |
| WCAG | `role="alert"`, focus on heading, keyboard actions |

---

## 11. Responsive behaviour

Verify at **mobile · tablet · desktop** (Tailwind breakpoints in `DESIGN_TOKENS.md`).

| Area | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Header / nav | Collapsed/profile accessible | Full chrome | Full chrome |
| Dashboard grids | Single column | 2-col where spec | Multi-column |
| Tables (invoices, history) | Scroll or stacked rows | Readable | Full table |
| Modals | Full-width / bottom sheet pattern | Centred | Centred |
| Error/maintenance | Stacked actions | Same | Inline actions |
| Touch targets | ≥ 44px | ≥ 44px | ≥ 44px |

### Checks

| Check | Pass criteria |
|-------|---------------|
| No horizontal overflow | On 320px viewport |
| Readable type | Token scale — no zoom required |
| Forms usable | Inputs and buttons full-width on mobile where spec requires |

---

## 12. Accessibility

Verify against **`docs/ACCESSIBILITY.md`** (WCAG **2.2 AA**).

| Area | Verify |
|------|--------|
| **Keyboard navigation** | All interactive elements reachable in logical order |
| **Focus states** | Visible focus rings on links, buttons, inputs |
| **ARIA labels** | Icon-only controls named; decorative icons hidden |
| **Form labels** | Every input has associated label / `aria-describedby` for errors |
| **Button states** | `disabled`, `aria-busy` on loading |
| **Modal focus** | Login, upgrade, share, delete confirm — focus trap + restore |
| **Accordion** | FAQ and legal nav — expanded/collapsed announced |
| **Tables** | Invoice/history tables — headers associated with cells |
| **Error announcements** | Full-page errors alert or move focus to H1 |

### Checks

| Check | Pass criteria |
|-------|---------------|
| Skip link | Visible on focus; targets `#main` |
| Colour contrast | Text and controls on surfaces meet AA |
| Not colour-only | Status, severity, tier cues include text/icon |

---

## 13. Integration verification matrix

Use this checklist during the pass (QA + engineering sign-off).

### 13.1 Application coherence

- [ ] All routes in §5.1 load without unexpected 404
- [ ] Guest can complete: home → upload mock → results teaser → login modal
- [ ] Free user sees upgrade gates on URL audit and full report
- [ ] Pro user can reach report and PDF mock
- [ ] Business user can reach workspace and roles
- [ ] Credits in header match billing widget for same mock user
- [ ] Sign out returns to guest; no stale auth UI
- [ ] No `console.error` on happy paths through primary flows

### 13.2 Navigation & auth

- [ ] Profile dropdown items match tier
- [ ] Login modal `nextPath` returns user to originating screen
- [ ] Protected routes handle guest (redirect or modal — consistent pattern)
- [ ] No duplicated `router.push` dashboard logic — use shared handlers

### 13.3 Mock state

- [ ] Central facade (or documented bundle) is single entry for cross-screen demos
- [ ] Switching mock tier updates gates without code edits in components
- [ ] Audit IDs consistent across dashboard → report → history

### 13.4 Errors & system

- [ ] All eight SCREEN-025 QA states render
- [ ] Maintenance page and banner behave per spec
- [ ] Payment and audit failures use shared patterns

### 13.5 Quality gates (run before handoff)

```bash
npm run typecheck
npm run lint
npm run format
```

- [ ] Zero TypeScript errors in `src/`
- [ ] No new ESLint warnings above project threshold
- [ ] Manual smoke: §5.1 routes on mobile + desktop

---

## 14. Success criteria

The frontend is **integration-ready** when:

| Criterion | Met when |
|-----------|----------|
| **Coherent app** | Screens feel like one product — shared chrome, copy, and behaviour |
| **No broken routes** | §5.1 map passes |
| **No dead buttons** | Every CTA performs an action or opens documented modal |
| **Consistent mock states** | §7 facade rules pass |
| **No console errors** | Happy-path smoke clean |
| **No duplicated nav logic** | Header/profile/routing centralized |
| **No duplicated auth logic** | `AuthProvider` + login modal only |
| **No duplicated membership logic** | `plans.ts` + mock membership helpers only |
| **Backend-safe seams** | Services/hooks ready for API swap — UI unchanged |

---

## 15. Deliverable

| Deliverable | Description |
|-------------|-------------|
| **Integrated mock application** | All existing screens wired to shared auth, nav, and mock state |
| **Central mock state facade** | Documented module consolidating user, tier, credits, audits, team, billing |
| **Integration checklist** | §13 signed off by frontend + QA |
| **Known gaps log** | Short list of deferred items (real API, Stripe, Supabase) — not blockers for mock sign-off |
| **Handoff note for backend** | Map each mock facade method to future API endpoint (`docs/API_MAPPING.md`) |

**Outcome:** Frontend can move into backend integration **without** redesigning screens or introducing a second state architecture.

---

## 16. Out of scope (this pass)

| Item | Deferred to |
|------|-------------|
| Supabase Auth / DB / Storage | Backend integration |
| Stripe Checkout / webhooks | Billing backend |
| AI audit worker / polling API | Audit backend |
| Real error monitoring (Sentry) | Production ops |
| CMS for legal copy | Content pipeline |
| Dark mode visual design | Design system phase 2 |
| New screens not in repo | `MISSING_SCREENS_PLAN.md` backlog |

---

## 17. Non-goals

| Do not |
|--------|
| Implement backend functionality in this pass |
| Redesign Figma layouts |
| Add email/password authentication |
| Introduce a parallel global state library |
| Connect third-party monitoring or status APIs |
| Generate implementation code in this document |

---

**End of FRONTEND_INTEGRATION.md**
