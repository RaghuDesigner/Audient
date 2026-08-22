# Audient — Login Modal Specification

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Senior frontend · Auth · QA  

**Screen / component IDs:** SCREEN-003 · **MDL-001** · **COMPONENT-002**  
**Figma:** `Screens/Screen3.png`  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, or TypeScript code**.

**Product brief (COMPONENT-002):** `docs/components/LOGIN_MODAL.md` — Figma-first UI rules, triggers, success/error, analytics. **Prefer that brief + Figma** for labels, structure, and “remain on current page” success behaviour when they differ from older sections below.

**Companion doc:** `docs/LOGIN_SCREEN.md` (broader login product context). This document is the **extended modal-centric engineering handoff**.

**Read alongside:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/DESIGN_TOKENS.md` (**no `DESIGN_SYSTEM.md` in repo** — tokens + COMPONENT_* are the design system) · `docs/COMPONENT_MAPPING.md` · `docs/COMPONENT_BEHAVIOR.md` · `docs/LAYOUT_SPECIFICATION.md` · `STATE_MANAGEMENT.md` (repo root; `docs/STATE_MANAGEMENT.md` is a pointer) · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/AUTH_API.md` · `BUSINESS_RULES.md` · `docs/PRICING.md`

---

## Non-goals (explicit)

| Not in product | Rationale |
|----------------|-----------|
| Signup page | Account creation = first successful OAuth (`BR-AUTH-002`) |
| Forgot / reset password | No passwords (`BR-AUTH-001`) |
| Email / password fields | SSO only |
| GitHub OAuth | Providers = Google · Apple · Microsoft only |
| Magic link / SMS OTP | Out of scope for v1 auth UI |

---

## 1. Purpose

The Login Modal is the **only authentication UI** in Audient. It exists to:

1. Convert **guests** into authenticated users when a gated action requires an account.  
2. Re-authenticate users after **sign-out** or **session expiry**.  
3. Establish a **secure Supabase Auth session** via OAuth (Google, Microsoft, Apple).  
4. **Seed** first-time users as Free (Membership `FREE` + **300** credits + Settings).  
5. **Claim** a prior guest screenshot audit onto the new/returning user when applicable.  
6. **Resume** the user intent that opened the modal (Home, audit, upgrade, deep link).

It is a **portaled dialog** over the current page (typically Landing / Guest Home), not a dedicated `/login` marketing page and not part of the AppShell sidebar chrome.

---

## 2. User Flow

Canonical happy path (product language maps “Dashboard” → **Logged-in Home**: Free SCREEN-004 or Pro/Business SCREEN-009):

```text
Guest visits Home / Landing (SCREEN-001)
        │
        ▼
Clicks one of:
  • Login (Guest Profile menu)
  • Start Free Audit — only when guest quota exhausted OR URL used
      (first screenshot audit may run WITHOUT opening this modal)
  • Upgrade / Subscribe while guest
  • Other protected actions
        │
        ▼
Login Modal opens (MDL-001)  ← persist resume intent
        │
        ▼
User chooses OAuth provider (Google | Microsoft | Apple)
        │
        ▼
Supabase Authentication (OAuth / ID token verify)
        │
        ▼
Session cookies set → GET /me (+ claim guest audit)
        │
        ▼
Modal closes → Logged-in Home (or resumed intent)
```

| Step | Notes |
|------|--------|
| First guest screenshot | May complete **without** Login Modal (`BR-GUEST-001`) |
| Guest URL GO | Opens Login Modal; do **not** start URL audit as guest (`BR-GUEST-003`) |
| After login + URL intent | Free users still hit Upgrade gate (`BR-URL-002`); Pro/Business may start URL audit |
| “Dashboard” | Product synonym for authenticated Home — not a separate unimplemented route name unless routing later aliases `/dashboard` |

---

## 3. Entry Points

Every opener must set `source` (analytics) and a **resume intent**.

| Entry point | UI trigger | Typical intent | `source` value |
|-------------|------------|----------------|----------------|
| Header / avatar guest menu | **Login** (SCREEN-002) | Home after auth | `guest_menu` |
| Hero / primary audit CTA | GO when guest blocked | Continue audit | `audit_input` / `go_gated` |
| Audit input — guest URL | URL + GO | URL flow / upgrade | `url_gate` |
| Audit input — 2nd screenshot | Upload/GO after quota used | Screenshot audit | `guest_quota` |
| Pricing / Manage Plan | Subscribe while guest | Checkout / Manage Plan | `subscribe_gate` |
| Upgrade Dialog (M08) | Upgrade CTA while guest | Manage Plan | `upgrade_dialog` |
| Protected routes | History, Settings, Report, Billing | Deep link path | `route_guard` |
| Session expired | Global handler / M16 | Resume interrupted route | `session_expired` |
| Unauthorized API surface | 401 → prompt login | Prior action | `unauthorized` |
| Credits / crown (guest) | If guest taps gated chrome | Manage Plan or Home | `header_gate` |

**Do not open** the modal for the **first** successful guest screenshot path.

---

## 4. Exit Points

| Exit | Allowed when | Result |
|------|--------------|--------|
| **Successful login** | Session + `/me` OK | Auto-close → navigate per §17 |
| **Close control** (X) | Not in OAuth loading | Close; focus → trigger; fire `login_modal_dismissed` |
| **Esc** | Not in OAuth loading | Same as close |
| **Click outside** (backdrop) | Not in OAuth loading | Same as close |
| **Browser Back** | History entry created on open (recommended) | Close modal **or** leave page; must not strand focus; clear or keep intent consistently |
| Provider cancel/deny | Always | Modal **stays open**; soft error (ERR-AUTH-004); user may retry or dismiss |
| Hard failure | Provider/network | Modal stays open; error Alert |

**While OAuth is in flight:** block Close, Esc, and backdrop dismiss so the user cannot orphan a half-started auth without feedback.

---

## 5. Modal Layout

Use design tokens (`DESIGN_TOKENS.md`). Do not hardcode brand hex in implementation notes beyond token names.

| Property | Spec |
|----------|------|
| **Position** | Viewport-centered on desktop/tablet; mobile may use near-full-width sheet with safe-area insets |
| **Width** | Desktop/tablet: constrained dialog (~360–420px content width, or design-measured from Screen3); never full-bleed on large screens |
| **Height** | Hug content (title + optional description + 3 buttons + error region); max-height ≤ viewport − margins; internal scroll only if needed |
| **Overlay** | Full-viewport dimmer (`foreground` at ~40% opacity or tokenized overlay); blocks pointer events to page |
| **Border radius** | `rounded-lg` (16px — Large token) |
| **Shadow** | `shadow-lg` |
| **Surface** | `bg-background` / white card on `bg-surface` page |
| **Border** | Subtle `border-border` if needed for contrast |
| **Spacing** | Padding `p-lg` (24px) desktop; `p-md` (16px) mobile; stack gap `gap-md` between buttons |
| **Z-index** | `z-modal` (above overlay `z-overlay`, below toast) |
| **Typography** | Title ≈ semibold body-sm/h-level per Figma crop; body muted for description |

Align with **LAYOUT_SPECIFICATION** breakpoints: mobile &lt;768 · tablet 768–1023 · desktop ≥1024 — modal is overlay chrome, independent of sidebar.

---

## 6. Component Hierarchy

```text
LoginModal (MDL-001)
├── Overlay / Backdrop
└── Dialog (role="dialog", aria-modal="true")
    ├── Header row
    │   ├── Logo / wordmark (optional small mark)
    │   ├── Heading (“Log in to Audient” or design copy)
    │   └── Close Button (optional X — recommend present for a11y)
    ├── Description (optional one line: why login)
    ├── Status region
    │   ├── Alert (errors)
    │   ├── Offline / rate-limit message
    │   └── “Taking longer…” (slow OAuth)
    ├── OAuth stack
    │   ├── Google Button (BTN-003)
    │   ├── Microsoft Button (BTN-005)   ← visual order per Figma: confirm Screen3
    │   └── Apple Button (BTN-004)
    ├── Divider (optional — only if design shows “or”; Figma is SSO-only, likely omit)
    └── Terms Text (optional short line + links to Privacy/Terms — do not invent checkbox consent here; CMP is SCREEN-M12)
```

**Figma button order (authoritative):** Google → Apple → Microsoft per SCREEN_MAPPING / COMPONENT_BEHAVIOR. Implement that order unless Screen3 clearly differs — then match Screen3 and update this doc.

| Piece | Reuse |
|-------|--------|
| Dialog | shadcn/Radix Dialog |
| Buttons | Outline Button + brand SVG |
| Icons | `public/brand/Google.svg`, `Apple.svg`, `Microsoft.svg` |
| Alert | Inline alert, not toast-only |

---

## 7. OAuth Buttons

Shared rules: full-width; min height **44px**; outline variant; brand icon `aria-hidden`; accessible name = full label; focus-visible ring (`ring` / Primary).

### 7.1 Google (BTN-003)

| Aspect | Spec |
|--------|------|
| Icon | Google mark |
| Label | **Login with Google** |
| Hover | Background tint `primary/5` or muted; cursor pointer |
| Focus | Visible ring; keyboard operable |
| Disabled | When another provider loading, offline, or rate-limited |
| Loading | This button `aria-busy`; label “Redirecting…” (or equivalent); spinner optional if text conveys busy |
| Error | Modal Alert (ERR-AUTH-001); button returns to idle for retry |

### 7.2 Microsoft (BTN-005)

| Aspect | Spec |
|--------|------|
| Icon | Microsoft mark |
| Label | **Login with Microsoft** |
| Hover / Focus / Disabled / Loading / Error | Same pattern as Google |
| Provider id | Supabase `azure` / Microsoft identity |
| Error | ERR-AUTH-003 |

### 7.3 Apple (BTN-004)

| Aspect | Spec |
|--------|------|
| Icon | Apple mark |
| Label | **Login with Apple** |
| Hover / Focus / Disabled / Loading / Error | Same pattern as Google |
| Styling | Respect Apple HIG contrast/label constraints where applicable |
| Special | Private Relay email; name often only on first authorize |
| Error | ERR-AUTH-002 |

**Mutual exclusion:** Only one provider may be loading. Siblings disabled until settle.

---

## 8. Modal Behaviour

| Behaviour | Spec |
|-----------|------|
| **Open animation** | Short fade and/or subtle scale-in (~150–200ms); token durations `duration-fast` / `duration` |
| **Close animation** | Reverse; on `prefers-reduced-motion: reduce` → instant show/hide |
| **Prevent background scroll** | Lock `body` overflow while open; restore on close |
| **Focus trapping** | Tab/Shift+Tab cycle only within dialog |
| **Auto focus** | Initial focus = **first enabled OAuth button** (Google) |
| **Focus restore** | On close, return focus to the control that opened the modal |
| **Inert background** | Page content not focusable/clickable (overlay + aria-hidden/inert pattern) |
| **Portal** | Render at document root so AppShell sticky header does not clip |
| **History (recommended)** | Push state on open so Browser Back closes modal predictably |

---

## 9. Validation

Client/UX checks before or during auth (server remains authoritative):

| Condition | Validation / handling |
|-----------|------------------------|
| **OAuth popup blocked** | Detect failed window open / blocker; show Alert with “Allow pop-ups or try again”; offer redirect-based retry if supported |
| **Cancelled login** | User closes provider UI → ERR-AUTH-004; modal remains; no session |
| **Network unavailable** | Disable providers; show offline message; do not start OAuth |
| **Session expired** | Opening this modal is valid; clear stale client user store; after success resume intent |
| **Authentication timeout** | After provider-controlled wait, show “Taking longer…”; allow cancel only if Product permits; else keep busy until callback/error |
| **Redirect allow-list** | `redirectTo` must be env-allow-listed (VALIDATION_RULES / SECURITY) |
| **Provider configured** | Only surface providers enabled in Supabase for that environment |

No email/password field validation exists on this modal.

---

## 10. Error States

| Error | User-facing guidance | UI | Analytics |
|-------|----------------------|-----|-----------|
| **Popup blocked** | Allow pop-ups for this site, then retry | Alert | `login_failed{reason:popup_blocked}` |
| **Provider unavailable** | That sign-in option isn’t available right now | Alert | `login_failed{provider}` |
| **Network error** | Check connection and try again | Alert + offline if applicable | `login_failed{reason:network}` |
| **Cancelled** | Optional soft copy or none | Stay open | `login_failed{reason:cancelled}` |
| **Unknown error** | Something went wrong. Try again. | Alert | `login_failed{reason:unknown}` |
| **Supabase unavailable** | Sign-in is temporarily unavailable | Alert; disable retries briefly | `login_failed{reason:auth_service}` |
| **Rate limited (429)** | Too many attempts — try again soon | Alert | `login_failed{reason:rate_limited}` |
| **ERR-AUTH-001/002/003** | Provider-specific failure copy from ERROR_HANDLING | Alert | `login_failed{provider}` |

Errors use **`role="alert"`** (assertive). Do not close the modal on error.

---

## 11. Loading States

| State | Behaviour |
|-------|-----------|
| **Google authentication** | Google button busy; Microsoft + Apple disabled |
| **Microsoft authentication** | Microsoft busy; others disabled |
| **Apple authentication** | Apple busy; others disabled |
| **Loading spinner** | Optional on active button; text busy state required for a11y |
| **Disable all buttons** | Yes — all providers + close while in flight |
| **Hydrating `/me`** | Keep busy until user store ready; then success path |
| **AUTH-STATE mapping** | 003 Google · 004 Apple · 005 Microsoft · 006 generic loading |

---

## 12. Success State

| Step | Spec |
|------|------|
| Authentication successful | Supabase/session established; AUTH-STATE-007 |
| Close modal automatically | Yes — do not show a separate success dialog |
| Hydrate | `GET /me` (credits/plan/avatar); claim guest audit if present |
| First login seed | FREE + **300** credits + Settings (server) |
| Redirect | Per §17 — typically Logged-in Home (“Dashboard”) |
| Analytics | `login_success` (+ `oauth_succeeded`); alias guest → user id |
| Focus | Prefer move to new page main content; do not restore opener if navigating away |

---

## 13. Accessibility (WCAG 2.2 AA)

| Topic | Requirement |
|-------|-------------|
| **Standard** | WCAG **2.2 AA** (`ACCESSIBILITY.md`) |
| **Keyboard** | Tab cycle; Enter/Space activate; Esc closes when idle |
| **ARIA** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → heading; optional `aria-describedby` |
| **Focus order** | Close (if present) → Google → Apple → Microsoft → alert actions |
| **Screen reader** | Announce dialog on open; assertive errors; busy on active provider |
| **Escape** | Closes when not loading |
| **Tab trapping** | Required |
| **Contrast** | Text/icons/borders meet AA; gray disabled semantics clear |
| **Reduced motion** | Disable/ shorten open-close animation |
| **Target size** | ≥44×44 px controls |
| **Icons** | Decorative; names on buttons |

---

## 14. Responsive Behaviour

| Viewport | Behaviour |
|----------|-----------|
| **Desktop** (≥1024px) | Centered modal; dimmed Landing/App behind; max-width constrained |
| **Tablet** (768–1023px) | Centered; slightly tighter margins; full-width buttons inside dialog |
| **Mobile** (&lt;768px) | Near-full-width sheet; `pt-safe` / `pb-safe`; stacked CTAs; backdrop tap dismiss when idle |

Touch targets remain ≥44px. Landscape phone: ensure dialog fits with scroll if needed.

---

## 15. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Modal Open** | `login_modal_opened` | `source` |
| **Modal Close** | `login_modal_dismissed` | `source`, optional `reason=user` |
| **OAuth Provider Click** | `oauth_started` | `provider`: google \| apple \| microsoft |
| **OAuth Success** | `login_success` / `oauth_succeeded` | `provider`, `isNewUser` |
| **OAuth Failure** | `login_failed` | `provider`, `reason` |
| **Modal Abandonment** | Dismiss without success | Same as close; funnel drop-off |
| **Guest Conversion** | `login_success` with `isNewUser=true` from guest | Link `anonymous_id` → `user_id` |

Never send ID tokens, auth codes, or raw emails beyond allowed identity policies. Respect CMP for non-essential client analytics; server may still record auth outcomes.

---

## 16. Security

| Control | Spec |
|---------|------|
| **OAuth only** | No passwords stored or accepted |
| **CSRF** | SameSite cookies + framework protections on state-changing auth routes |
| **Secure session** | httpOnly, Secure, HTTPS-only cookies; JWT verified server-side |
| **HTTPS** | Required in all deployed environments |
| **Token handling** | Verify ID tokens / OAuth codes server-side; never log full tokens; never put tokens in `localStorage` if cookies are the session vehicle |
| **No password storage** | Delegated to IdPs / Supabase Auth |
| **Open redirect** | Allow-listed `redirectTo` only |
| **Rate limiting** | `/auth/*` throttled |
| **Identity** | `sub` from verified token only (`BR-SEC-002`) |
| **PKCE** | Required for redirect OAuth |

---

## 17. Navigation Rules

After successful login:

| Prior intent | Destination |
|--------------|-------------|
| None / Login menu | **Logged-in Home** (Free or paid chrome) |
| Guest started **screenshot** audit (in progress or just gated) | Continue into **audit Progress (M01)** or create audit then Progress |
| Guest completed audit; opened Login later | Home; claimed audit in History |
| Guest URL GO | Home with URL prefilled → Free sees Upgrade; paid may start audit |
| Subscribe / Upgrade | Manage Plan or Checkout resume |
| Protected deep link | Original path (History, Settings, Report, Billing) |
| Session expired mid-flow | Interrupted route |

**Return to previous page** when intent is “browse” or deep link.  
**Continue directly into Audit** when intent is audit create / in-flight guest audit claim + continue.

Clear intent after successful resume to avoid stale redirects on later logins.

---

## 18. Edge Cases

| Case | Expected behaviour |
|------|-------------------|
| **Rapid multiple clicks** | Ignore after first; single in-flight provider |
| **Popup blocked** | Alert + retry/redirect path |
| **Browser refresh** mid-modal | Modal closed; intent should survive if stored for OAuth return; otherwise user re-opens |
| **Offline** | Disable providers; show offline |
| **Expired session** | Modal is the recovery UI; success restores |
| **Duplicate login** (already authed) | Close immediately; hydrate Home |
| **Slow network** | Busy state + “Taking longer…” |
| **OAuth returns to wrong env** | Fail closed; no session |
| **Apple private relay** | Account OK; email read-only later |
| **Guest claim fails** | Login still succeeds; non-blocking warning |
| **Two tabs** | Shared cookie session; both hydrate |
| **Back button** | Closes modal without completing OAuth |

---

## 19. QA Checklist

### Visual

□ Matches Screen3 structure (title, three SSO buttons, overlay)  
□ Tokens only (radius Large, shadow LG, spacing 8/16/24)  
□ No password / signup / forgot-password UI  

### Responsive

□ Desktop centered  
□ Tablet usable  
□ Mobile sheet + safe areas  

### Accessibility

□ Dialog labelled  
□ Focus trap + initial focus Google  
□ Esc / backdrop when idle  
□ Focus restore to trigger  
□ Alert assertive on errors  
□ Reduced motion  
□ ≥44px targets  

### Analytics

□ Open / close / oauth_started / success / failure / abandonment  
□ `source` present on open  
□ Guest conversion `isNewUser`  

### Security

□ No tokens in logs/analytics  
□ HTTPS session cookies  
□ Allow-listed redirects  

### OAuth

□ Google / Apple / Microsoft staging success  
□ Cancel / deny recoverable  
□ First login seeds 300 credits  
□ Guest audit claim when applicable  

### Animations

□ Open/close smooth; reduced-motion instant  

### Performance

□ Modal opens &lt; 100ms perceived after click (excluding OAuth network)  
□ No background scroll leak  
□ Body scroll unlock on all close paths  

---

## 20. Developer Notes

1. **Single modal controller** — global/UI store: `open`, `source`, `intent`, `activeProvider`, `error`; opened from many entry points without duplicating OAuth logic.  
2. **Portaled Dialog** — use Radix/shadcn Dialog for trap, Esc, focus restore; do not build a custom focus hack.  
3. **Provider order** — Google → Apple → Microsoft unless Screen3 measurement overrides; keep DRY `OAuthButton` × 3 configs.  
4. **Supabase** — Enable Google, Apple, Azure; configure redirect URLs per env (`DEPLOYMENT.md`). Prefer one primary flow (browser OAuth redirect **or** ID-token POST to `/api/v1/auth/*`) and document it in the PR.  
5. **Intent persistence** — Must survive full-page OAuth redirect (sessionStorage or signed cookie). Schema: `{ type, payload, source, createdAt }`.  
6. **Dismiss guard** — `onInteractOutside` / Esc ignored while `activeProvider != null`.  
7. **History Back** — Decide pushState vs not; document behaviour in QA. Recommended: push on open, pop closes.  
8. **AppShell** — Login Modal is **not** inside sidebar layout; works over marketing Landing without sidebar.  
9. **Terms line** — If adding Privacy/Terms links under buttons, use existing Footer routes; do **not** add a required checkbox that blocks OAuth unless Legal mandates it (CMP remains M12).  
10. **Divider** — Omit unless design shows it; SSO-only UI does not need “or continue with email”.  
11. **Email verification** — Success may still leave `emailVerified=false`; show Home banner for audits — not a Login Modal success step.  
12. **Dark mode** — Light only until designed tokens exist (`ACCESSIBILITY` §25 / ThemeProvider `darkPaletteReady=false`).  
13. **Testing** — Map to `TEST_CASES.md` auth + ERR-AUTH; mock IdP in CI; one manual pass per provider on staging before release.  
14. **Relationship to LOGIN_SCREEN.md** — Prefer this doc for modal layout/behaviour; prefer LOGIN_SCREEN for product IA and full entry matrix; keep both in sync when providers or rules change.

---

## Traceability

| Concern | Reference |
|---------|-----------|
| Screen | SCREEN-003 |
| Modal | MDL-001 |
| Buttons | BTN-003, BTN-004, BTN-005 |
| Rules | BR-AUTH-001…006, BR-GUEST-001…007 |
| Errors | ERR-AUTH-* |
| States | AUTH-STATE-002…008, 010 |
| Analytics | EVT-AUTH-* |
| A11y | ACCESSIBILITY dialog / focus / 2.2 AA |
| Tokens | DESIGN_TOKENS.md |

---

**End of LOGIN_MODAL.md**
