# Audient — Login Screen Specification

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Screen ID:** SCREEN-003  
**Component ID:** MDL-001 (SSO Login Modal)  
**Figma asset:** `Screens/Screen3.png`  
**Priority:** P0  

**Format:** Functional specification only — **no application / React code**.

**Related:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/DESIGN_TOKENS.md` (no separate `DESIGN_SYSTEM.md` in repo) · `docs/COMPONENT_MAPPING.md` · `docs/COMPONENT_BEHAVIOR.md` · `docs/ACCESSIBILITY.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/AUTH_API.md` · `docs/API_SPECIFICATION.md` · `BUSINESS_RULES.md` · `STATE_MANAGEMENT.md`

---

## Product framing

Audient’s “Login Screen” is **not** an email/password page. Per Figma and `BR-AUTH-001`, login is an **SSO-only modal** over the current surface (typically Landing), with three providers: **Google**, **Apple**, and **Microsoft**. There is no forgot-password, sign-up form, magic link, or GitHub OAuth in v1.

| Attribute | Value |
|-----------|--------|
| Presentation | Modal dialog + dimmed overlay |
| Auth model | OAuth / OIDC via Supabase Auth |
| Session | httpOnly Secure cookies + JWT; identity from token `sub` only |
| First login | Seeds User + Membership `FREE` + **300** credits + Settings (`BR-AUTH-002`, `PRICING.md`) |

---

## 1. Purpose

Allow any visitor or gated user to **create an account or sign in** in one action using a trusted identity provider, establish a secure Audient session, hydrate profile/credits, optionally **claim a prior guest audit**, and **resume the intent** that opened login (Home, URL upgrade path, Subscribe, second audit, session restore).

---

## 2. User Goals

| Goal | Success signal |
|------|----------------|
| Sign in quickly without inventing a password | One provider click → session |
| Continue what they were doing | Resume intent after success |
| Understand what login unlocks | Clear modal title/copy (e.g. Log in to Audient) |
| Recover from cancel/deny | Stay on origin; retry or dismiss |
| Trust the brand | Familiar Google / Apple / Microsoft buttons |

---

## 3. Business Goals

| Goal | How login supports it |
|------|------------------------|
| Convert guest teasers to accounts | Guest URL / 2nd audit / Subscribe → SSO |
| Activate Free funnel | Seed 300 credits; path to screenshot audits |
| Monetization | Resume Subscribe / Manage Plan after auth |
| Reduce auth support cost | Managed SSO; no password reset flows |
| Abuse control | Rate-limit auth; email verification gates audits (`BR-AUTH-006`) |
| Identity continuity | Alias `anonymous_id` → `user_id` in analytics |

---

## 4. Supported User Types

| User type | Before login | After successful login |
|-----------|--------------|------------------------|
| **Guest** (never authenticated) | 0–1 screenshot audits; menus gated | Free user; guest audit claimed if any (`BR-GUEST-006`) |
| **Returning Free** | Session expired or signed out | Same Free entitlements; credits from server |
| **Returning Pro / Business** | Session expired or signed out | Paid tier restored from Membership |
| **Unverified email** (provider) | May complete OAuth | Session OK; audits blocked until `emailVerified` |
| **Already authenticated** | Should not need modal | Opening login is no-op or closes immediately after `/me` confirms session |

**Not supported on this screen:** Anonymous “browse as guest” toggle inside the modal; password users; GitHub users.

---

## 5. Entry Points

| Entry | Trigger | Intent to persist |
|-------|---------|-------------------|
| Guest Profile → **Login** | SCREEN-002 enabled item | Stay on Landing / open Home after |
| Guest **URL + GO** | `BR-GUEST-003` | Resume URL flow → after login Free still upgrade-gated (`BR-URL-002`) |
| Guest **2nd screenshot / GO** | `BR-GUEST-004` | Resume audit create |
| Guest **Subscribe** | Plan card while guest | Resume Manage Plan / Checkout |
| Protected route (no session) | Middleware (`BR-AUTH-003`) | Deep-link resume (History, Settings, Report) |
| **Session expired** | APP-STATE-006 / ERR-AUTH-006 | Resume interrupted action |
| Unauthorized API/UI gate | 401 path | Resume |
| Analytics / marketing CTA | “Log in” (if present) | Default Home |

Analytics `source` examples: `guest_menu` · `url_gate` · `subscribe_gate` · `session_expired` · `route_guard`.

---

## 6. Exit Points

| Exit | Condition | Destination |
|------|-----------|-------------|
| Success | Session + `/me` OK | Intent target (Home Free/Pro, Checkout, Progress, deep link) |
| Dismiss | Esc / backdrop / close (when not loading) | Previous screen; trigger refocused |
| Cancel at provider | User aborts OAuth | Modal stays open + soft error/cancel message |
| Provider failure | Token/network/config error | Modal stays open + Alert; retry allowed |
| Offline | No network | Providers disabled + offline banner; cannot complete |
| Rate limited | 429 | Throttle message; retry later |

Sign-out is **not** an exit of this screen (handled from Profile menu → Landing).

---

## 7. Information Architecture

```text
SSO Login Modal (MDL-001)
├── Dialog chrome
│   ├── Title (e.g. “Log in to Audient”)
│   ├── Optional short supporting copy
│   └── Optional close control
├── Authentication actions
│   ├── Login with Google (BTN-003)
│   ├── Login with Apple (BTN-004)
│   └── Login with Microsoft (BTN-005)
├── Status region
│   ├── Inline Alert (errors)
│   ├── Loading / “Taking longer…”
│   └── Offline / rate-limit messages
└── Overlay (dimmed, inert background)
```

**Out of IA for this screen:** Email field, password, “Create account” tab, social GitHub, Terms checkbox (Terms linked from Footer elsewhere; consent banner is SCREEN-M12).

---

## 8. Screen Layout

| Region | Content | Notes |
|--------|---------|--------|
| Overlay | Dimmed scrim over Landing/Home | Background inert while open |
| Dialog | Centered card on Surface/Background | Tokens: `bg-background`, `border-border`, `rounded-lg`, `shadow-lg` |
| Header | Brand/title | Visible accessible name for `aria-labelledby` |
| Body | Stacked full-width OAuth buttons | Order: Google → Apple → Microsoft (Figma) |
| Footer of dialog | Optional legal one-liner | Do not invent heavy marketing chrome |

**Underlying page:** Remains visible but non-interactive (Landing header/logo may show through dimmer — not a second login form).

---

## 9. Component Hierarchy

```text
LoginModal (MDL-001)
├── Overlay / Backdrop
└── Dialog (role=dialog, aria-modal)
    ├── DialogTitle
    ├── DialogDescription (optional)
    ├── Alert (conditional — error / cancel / throttle)
    ├── OfflineBanner (conditional)
    ├── OAuthButton Google (BTN-003)
    ├── OAuthButton Apple (BTN-004)
    ├── OAuthButton Microsoft (BTN-005)
    └── DialogClose (optional X)
```

Parent surfaces that open it: `ProfileMenu` (guest), `AuditForm` gates, route guard, session-expired handler.

---

## 10. Reusable Components Used

| Component | Mapping | Role on Login |
|-----------|---------|----------------|
| Dialog | `components/ui/dialog` (shadcn/Radix) | Modal shell, focus trap, Esc |
| Button / OAuthButtons | `OAuthButtons` / Button outline | Provider CTAs |
| Alert / Toast | Alert inline preferred | ERR-AUTH feedback |
| Brand icons | `public/brand/Google.svg`, `Apple.svg`, `Microsoft.svg` | Decorative marks |
| Skip link | Not inside modal | On underlying App/Landing shell only |

**Not used:** TextField, PasswordField, SignInForm, SignUpForm, CreditMeter (header behind overlay may still show guest teaser).

---

## 11. Button Variants

| ID | Label | Variant | Behaviour |
|----|-------|---------|-----------|
| BTN-003 | Login with Google | Outline / full-width + Google mark | Starts Google OAuth |
| BTN-004 | Login with Apple | Outline / full-width + Apple mark (Apple HIG constraints) | Starts Apple OAuth |
| BTN-005 | Login with Microsoft | Outline / full-width + Microsoft mark | Starts Microsoft/Azure OAuth |
| Close (optional) | Close / Dismiss | Ghost icon | Closes when not loading |

**Shared BTN rules (COMPONENT_BEHAVIOR):**

| State | Visual / a11y |
|-------|----------------|
| Default | Outlined; ≥44px height; brand icon `aria-hidden` |
| Hover / Focus | Focus-visible ring (Primary) |
| Loading (active provider) | Label “Redirecting…” or equivalent; `aria-busy="true"` |
| Disabled (sibling providers) | Disabled while another OAuth in flight |
| Disabled (offline) | All providers disabled |

---

## 12. Input Variants

| Input | On Login Screen? |
|-------|------------------|
| Email / password / OTP | **No** — SSO only |
| Hidden OAuth state / PKCE | Handled by auth client — not user-visible fields |
| Intent payload | Client/session storage — not a form control |

There are **no** TextField variants on this screen.

---

## 13. Logo Placement

| Placement | Spec |
|-----------|------|
| Modal | Prefer **wordmark or product name in dialog title** (“Log in to Audient”); optional small logo above title if design shows it |
| Underlying Landing header | Logo remains top-left per SCREEN-001 (“Audient — AUDIT · ANALYZE · ELEVATE UX”) behind dimmer |
| Provider buttons | Provider brand marks only — not Audient logo inside buttons |

Do not place a second competing hero logo that overpowers the dialog title.

---

## 14. Hero Section Behaviour

The Login Screen **has no dedicated hero**. Hero content belongs to Landing (SCREEN-001) underneath.

| Behaviour | Spec |
|-----------|------|
| Landing hero | Remains dimmed/inert while modal open |
| Modal motion | Short open/close fade; respect `prefers-reduced-motion` |
| Focus | Moves into dialog on open; does not land on hero |

---

## 15. Authentication Methods

### 15.1 Google

| Item | Spec |
|------|------|
| UI | BTN-003 “Login with Google” |
| Protocol | Google Identity / OIDC ID token or Supabase `signInWithOAuth("google")` |
| API | `POST /api/v1/auth/google` (AUTH-001) and/or Supabase OAuth redirect |
| Validation | VAL Google token (VALIDATION_RULES) — server verifies ID token |
| Analytics | `oauth_started{provider:google}` → `login_success` / `login_failed` |
| Errors | ERR-AUTH-001 |
| Notes | Never log full token; rate-limit |

### 15.2 Apple

| Item | Spec |
|------|------|
| UI | BTN-004 “Login with Apple” |
| Protocol | Sign in with Apple; Supabase `signInWithOAuth("apple")` |
| API | `POST /api/v1/auth/apple` (AUTH-002) |
| Special cases | **Private Relay** email; name often only on first authorize |
| Analytics | `oauth_started{provider:apple}` |
| Errors | ERR-AUTH-002 |
| Notes | Apple button styling/contrast guidance; Services ID configured in Supabase |

### 15.3 Microsoft

| Item | Spec |
|------|------|
| UI | BTN-005 “Login with Microsoft” |
| Protocol | Azure AD / Microsoft identity; Supabase `signInWithOAuth("azure")` |
| API | `POST /api/v1/auth/microsoft` (AUTH-003) |
| Analytics | `oauth_started{provider:microsoft}` |
| Errors | ERR-AUTH-003 |

**Explicitly excluded:** GitHub, email/password, magic link, SAML enterprise SSO (unless later Business feature).

---

## 16. Guest User Behaviour

| Rule | Behaviour on / around Login |
|------|------------------------------|
| BR-GUEST-001 | Guest may complete **1** screenshot audit without opening login |
| BR-GUEST-003 | Guest URL → open Login (do not call Start Audit) |
| BR-GUEST-004 | Second GO/upload → open Login |
| BR-GUEST-005 | Guest menu: only Login enabled; other items disabled with tooltip |
| BR-GUEST-006 | On success, **claim** guest `auditId` + FileAssets onto User |
| BR-GUEST-007 | Guest session rate limits / captcha may apply before or after; abuse does not bypass SSO |
| After login | Free **300** credits for subsequent audits; claimed guest report appears in History when eligible |

Guest credit display before login is teaser (“1 free audit” / 150 cost) — **not** a fake large balance (`BR-GUEST-002`).

---

## 17. Validation Rules

| ID / topic | Rule |
|------------|------|
| Providers only | Only Google / Apple / Microsoft (`BR-AUTH-001`) |
| Token presence | Provider ID token / OAuth code required server-side |
| Token integrity | Signature, audience, expiry verified server-side |
| Redirect allow-list | `redirectTo` must match env allow-list (local, preview, staging, prod) |
| PKCE | Required for OAuth redirect flows |
| Intent | Persist structured resume intent; validate route is internal |
| Network | Block start when offline |
| Rate limit | Auth endpoints throttled → 429 |
| No client userId | Identity from verified session only (`BR-SEC-002`) |

Client does not “validate email format” because there is no email field.

---

## 18. Error States

| Error ID | User-facing (summary) | UI | Retry |
|----------|----------------------|-----|-------|
| ERR-AUTH-001 | Google sign-in failed | Inline Alert in modal | Yes — re-click Google |
| ERR-AUTH-002 | Apple sign-in failed | Alert | Yes |
| ERR-AUTH-003 | Microsoft sign-in failed | Alert | Yes |
| ERR-AUTH-004 | Cancelled login | Soft message or silent stay | Yes |
| ERR-AUTH-005 / 006 / 007 | Session expired / invalid | Re-open Login (this screen) | Yes |
| Popup blocked | Allow pop-ups / try again | Alert | Yes |
| Offline | You’re offline | Banner; buttons disabled | After reconnect |
| 429 | Too many attempts | Throttle message | After wait |
| Provider misconfig (5xx) | Something went wrong | Alert + support if persistent | Yes |

**Accessibility:** Errors in `role="alert"` / assertive live region; focus moves to alert or remains on failed control with `aria-describedby`.

**Dismiss while error:** Allowed; clears transient error unless Product wants sticky until retry.

---

## 19. Loading States

| State ID | When | UI |
|----------|------|-----|
| AUTH-STATE-002 | Modal open, idle | Three enabled providers |
| AUTH-STATE-003/004/005 | Provider chosen | That button busy; others disabled; block Esc/backdrop dismiss |
| AUTH-STATE-006 | Auth loading / redirect | Same as above; optional “Taking longer…” after timeout threshold |
| Hydrating `/me` | After provider return | Brief global or modal busy until user store ready |

Do not show a full-page spinner that loses modal context unless the browser navigates away for OAuth redirect (then Landing → callback → Home).

---

## 20. Success States

| Step | Behaviour |
|------|-----------|
| AUTH-STATE-007 | Session cookies set; `login_success` |
| Close modal | Remove dialog; restore focus only if staying on same view briefly |
| Hydrate | `GET /me` (+ credits) → header avatar, credits, crown if paid |
| Seed (first login) | FREE + 300 credits + Settings (`BR-AUTH-002`) |
| Claim guest | Associate guest audit/files (`BR-GUEST-006`) |
| Navigate | Resume intent (see §30) |
| Alias analytics | Link `anonymous_id` → `user_id` |

Success is **not** a separate success modal — navigate/hydrate immediately.

---

## 21. Empty States

| Concept | Applicability |
|---------|----------------|
| Empty provider list | Should not ship — always three configured providers |
| Empty user profile fields | Name may be blank (esp. Apple); UI must tolerate |
| No guest audit to claim | Claim step no-ops silently |
| Empty error region | Hidden when no error |

There is no “empty inbox” pattern on Login.

---

## 22. Accessibility Requirements (WCAG 2.2 AA)

| Requirement | Spec |
|-------------|------|
| Name | Dialog labelled by visible title (`aria-labelledby`) |
| Modal | `role="dialog"`, `aria-modal="true"` |
| Focus trap | Tab cycles within dialog |
| Initial focus | First OAuth button (or close if design places it first — prefer first provider) |
| Focus restore | Return to trigger (avatar, GO, Subscribe, etc.) on close |
| Focus visible | 2px+ ring, Primary/`ring` token |
| Target size | ≥44×44 CSS px (2.5.8 floor exceeded by product rule) |
| Non-text contrast | Icons decorative; button borders/text meet 3:1 / 4.5:1 |
| Motion | Open/close respects `prefers-reduced-motion` |
| Status | Errors via `role="alert"`; loading via `aria-busy` |
| Apple | Follow Apple labeling/contrast guidance where applicable |
| Forced colors | Borders remain visible; do not rely on shadow alone |

---

## 23. Keyboard Navigation

| Key | Behaviour |
|-----|-----------|
| Tab / Shift+Tab | Cycle: Close (if any) → Google → Apple → Microsoft → (alert links if present) |
| Enter / Space | Activate focused OAuth or Close |
| Esc | Dismiss modal **unless** provider loading/redirect in flight |
| Arrow keys | Optional within button group — not required if Tab order is clear |

No drag-only interactions.

---

## 24. Screen Reader Behaviour

| Event | Announcement |
|-------|--------------|
| Open | Dialog name + description |
| Provider loading | Busy state on active button; others disabled announced |
| Error | Assertive alert with message |
| Cancel | Optional polite status |
| Success | May announce briefly before navigation; route change should expose new page H1 |
| Close | Focus returns to trigger; trigger name should remain meaningful |

Brand icons: `aria-hidden="true"`. Accessible names are full strings (“Login with Google”), not “Google” alone if design uses icon-only (design uses icon+label).

---

## 25. Responsive Behaviour

### Mobile (&lt; 768px)

| Aspect | Spec |
|--------|------|
| Dialog | Near-full-width sheet; comfortable bottom margin; safe-area padding |
| Buttons | Full width, stacked, ≥44px |
| Overlay | Full viewport; tap dismiss when allowed |
| Underlying Landing | Dimmed; no interaction |

### Tablet (768–1023px)

| Aspect | Spec |
|--------|------|
| Dialog | Centered; max-width constrained; still stacked buttons |
| Touch | Same target sizes |

### Desktop (≥ 1024px)

| Aspect | Spec |
|--------|------|
| Dialog | Centered modal; medium width; shadow elevation |
| Buttons | Full width within dialog |
| Pointer | Hover styles; focus-visible for keyboard users |

---

## 26. Analytics Events

| Event | When | Key properties |
|-------|------|----------------|
| `login_modal_opened` | Modal opens | `source` |
| `oauth_started` | Provider click | `provider`: google\|apple\|microsoft |
| `login_success` | Session confirmed | `provider`, `isNewUser` |
| `oauth_succeeded` | Alias OK with login_success | `provider` |
| `login_failed` | Failure/cancel | `provider`, `reason` |
| `login_modal_dismissed` | Esc/backdrop/close | `source` |
| `session_expired` | Re-entry from expiry | — |
| `guest_login_clicked` | From guest menu | — |
| `guest_url_gated` | Before open from URL | — |

**Privacy:** Never send ID tokens, access tokens, or raw auth codes. Consent banner (M12) may gate non-essential analytics; auth outcome events may still be server-side.

---

## 27. Security Requirements

| Control | Spec |
|---------|------|
| Providers | Managed by Supabase Auth — Audient does not store passwords |
| Session | httpOnly, Secure, SameSite cookies; short-lived access + rotating refresh |
| Identity | Derive user from verified JWT `sub` only |
| Tokens | Verify ID tokens server-side; never log full tokens |
| Redirects | Allow-listed `redirectTo` only (open redirect prevention) |
| CSRF | SameSite + framework CSRF on state-changing routes |
| Rate limit | Per-IP / per-device on `/auth/*` |
| PKCE | Use for OAuth |
| XSS | React escaping; no `eval` of provider payloads |
| Popup | Prefer redirect or documented GIS one-tap patterns; handle blocked popups |
| Seed | Server-side atomic Free seed — client cannot choose plan on login |
| PCI | N/A on this screen (no card data) |

---

## 28. API Endpoints Used

| ID | Method | Endpoint | Role |
|----|--------|----------|------|
| API-AUTH-001 | POST | `/api/v1/auth/google` | Exchange/verify Google credential → session |
| API-AUTH-002 | POST | `/api/v1/auth/apple` | Apple |
| API-AUTH-003 | POST | `/api/v1/auth/microsoft` | Microsoft |
| API-USER-001 | GET | `/api/v1/me` | Hydrate user after success |
| (optional) | GET | `/api/v1/credits` | Header credits if not embedded in `/me` |
| Supabase Auth | OAuth redirect | Provider authorize/callback | Browser round-trip |

**Not called from Login UI:** audits, billing checkout (may run **after** resume), uploads.

Sign-out uses `POST /api/v1/auth/sign-out` from Profile — not this screen.

---

## 29. State Management

Reference: `STATE_MANAGEMENT.md` AUTH-STATE-*.

| State | Meaning |
|-------|---------|
| AUTH-STATE-001 Guest | Modal closed; guest chrome |
| AUTH-STATE-002 Login Modal Open | Dialog visible |
| AUTH-STATE-003 Google Login | Google in flight |
| AUTH-STATE-004 Apple Login | Apple in flight |
| AUTH-STATE-005 Microsoft Login | Microsoft in flight |
| AUTH-STATE-006 Authentication Loading | Generic busy |
| AUTH-STATE-007 Authentication Success | Session ready |
| AUTH-STATE-008 Authentication Failed | Error shown |
| AUTH-STATE-010 Session Expired | Re-open Login with source |

**Client stores (conceptual):**

| Store | Data |
|-------|------|
| Auth/session | Session presence; clear on logout |
| User | `/me` profile, tier, emailVerified |
| UI | `loginModalOpen`, `source`, `activeProvider`, `error` |
| Intent | `{ type, payload }` for resume (URL string, auditId, checkout tier, path) |
| Guest | Guest session id; audit claim candidate |

Server remains source of truth for credits and membership.

---

## 30. Navigation Flow

```text
[Origin]
   │ open Login (persist intent)
   ▼
SCREEN-003 Modal
   ├─ Dismiss ──────────────────────────► Origin (focus restore)
   ├─ Provider fail/cancel ─────────────► Modal + Alert (stay)
   └─ Provider success
         │
         ▼
   GET /me (+ claim guest)
         │
         ├── intent=home / none ────────► SCREEN-004 Free Home
         │                                 or SCREEN-009 if Pro/Business
         ├── intent=url_audit ──────────► Home + URL gate / Upgrade (Free)
         │                                 or start URL audit (paid)
         ├── intent=screenshot_audit ───► Create audit → Progress (M01)
         ├── intent=subscribe ──────────► Manage Plan / Checkout
         ├── intent=deep_link ──────────► History / Settings / Report
         └── intent=session_resume ─────► Interrupted route
```

---

## 31. Edge Cases

| Case | Expected behaviour |
|------|-------------------|
| User already signed in opens Login | Close immediately or show “Signed in” then navigate Home |
| Double-click provider | Ignore second click; keep single in-flight |
| OAuth returns to wrong env URL | Fail closed; show error; do not set session |
| Apple hides email | Account still created; email may be relay; Settings shows read-only |
| Name missing | Fallback display (email local-part or “Account”) |
| Guest claim fails | Login still succeeds; soft toast; support can relink later |
| Popup blocked | Alert with instructions; offer redirect-based retry |
| Slow provider | “Taking longer…”; allow cancel only if Product permits mid-flight |
| Middleware opens Login on Landing deep-link | Preserve full path + query |
| User denies Google permissions | ERR-AUTH-004 / failed; modal remains |
| Concurrent tabs | Session cookie shared; both tabs hydrate |
| 429 during login | Show throttle; do not spin forever |
| Offline mid-redirect | Error on return; retry |

---

## 32. QA Checklist

### Functional

□ Modal opens from guest menu, URL gate, 2nd audit, subscribe, session expired  
□ Only Google, Apple, Microsoft shown — no password UI  
□ Each provider can complete login on staging  
□ First login seeds Free + **300** credits  
□ Returning login does not re-grant monthly incorrectly  
□ Guest audit claimed into History after login  
□ Dismiss via Esc / backdrop restores focus to trigger  
□ Dismiss blocked while provider loading  
□ Cancel at provider shows recoverable state  
□ Failed provider shows ERR-AUTH-* message + retry  
□ Offline disables providers  
□ Intent resume: Home, URL gate, Subscribe, deep link  

### Accessibility

□ Dialog name announced  
□ Focus trap works  
□ Tab order Google → Apple → Microsoft  
□ Enter activates provider  
□ Esc closes when idle  
□ Focus-visible rings visible  
□ Targets ≥44px  
□ Alert assertive on error  
□ Reduced motion respected  

### Responsive

□ Mobile sheet usable one-handed  
□ Tablet centered  
□ Desktop centered modal  

### Security / analytics

□ No tokens in analytics or console logs (prod)  
□ `login_modal_opened` includes `source`  
□ `oauth_started` / `login_success` / `login_failed` fire correctly  
□ Rate limit returns friendly 429  

### Regression

□ Does not break Landing behind overlay  
□ Authenticated user header updates after success  
□ Sign-out still returns to Landing (separate flow)  

---

## 33. Developer Notes

1. **Source of truth UI:** `Screens/Screen3.png` + SCREEN_MAPPING SCREEN-003 + COMPONENT_BEHAVIOR MDL-001 / BTN-003–005.  
2. **Tokens:** Use `DESIGN_TOKENS.md` / Tailwind tokens — no hardcoded hex. There is no `DESIGN_SYSTEM.md` file; treat design tokens + COMPONENT_* as the system.  
3. **DRY:** One `OAuthButton` × three configs; shared `useAuth` / login modal controller.  
4. **Supabase:** Enable Google, Apple, Azure providers; configure redirect URLs per env (`DEPLOYMENT.md`).  
5. **API dual paths:** Product may use Supabase browser OAuth **or** `POST /auth/{provider}` with ID token — both must end in httpOnly session + `/me`. Prefer one primary path; document in implementation PR.  
6. **Intent storage:** Survive full-page OAuth redirect (sessionStorage or encrypted cookie). Clear after successful resume.  
7. **Apple:** Handle private relay + missing name on subsequent logins.  
8. **Do not invent:** Password fields, GitHub, “Remember me”, CAPTCHA inside modal unless BR-GUEST-007 signals escalate.  
9. **AppShell:** Login is a **portaled dialog**, not a dashboard route; underlying page may be marketing Landing without sidebar.  
10. **Testing:** Map to `TEST_CASES.md` auth module + ERR-AUTH cases; automate open/dismiss/focus; mock providers in CI.  
11. **Email verification:** Login can succeed while audits remain gated (`BR-AUTH-006`) — show banner on Home, not inside success of this modal.  
12. **Dark mode:** Light theme only until designed; do not invent a dark login skin (`ACCESSIBILITY.md` §25).

---

## Traceability matrix (summary)

| Concern | Doc / ID |
|---------|----------|
| Screen | SCREEN-003 |
| Modal | MDL-001 |
| Buttons | BTN-003, BTN-004, BTN-005 |
| Rules | BR-AUTH-001…006, BR-GUEST-001…007 |
| Errors | ERR-AUTH-001…008 |
| States | AUTH-STATE-001…010 |
| Analytics | EVT-AUTH-001…008 |
| APIs | AUTH-001…003, USER `/me` |
| A11y | ACCESSIBILITY § dialog, focus, landmarks |

---

**End of LOGIN_SCREEN.md**
