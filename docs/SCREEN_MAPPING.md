# Audient — Screen Mapping (Production Handoff)

**Status:** Production-ready draft — existing screens documented from uploaded designs; missing screens specified for engineering handoff
**Last updated:** 2026-07-29
**Owner:** Raghunath Kamlekar
**Audience:** Product · UX Design · Frontend · Backend · QA · AI/API
**Related:** PRD.md, PRICING.md, MISSING_SCREENS_PLAN.md, TECHNICAL_ARCHITECTURE.md, DATABASE.md, SCHEMA.md, API.md, AI_WORKFLOW.md, COMPONENT_ARCHITECTURE.md, COMPONENT_MAPPING.md, DESIGN_TOKENS.md, SECURITY.md, CURSOR_RULES.md, DEVELOPMENT_ROADMAP.md

**Product:** Audient — an **AI-powered UX audit platform**. Users paste a **website URL** or upload a **screenshot/image**, spend **credits** to run an AI UX audit, receive a detailed report, download a **PDF**, and manage **subscriptions/credits**. (The uploaded designs are the source of truth; product domain is website/screenshot UX auditing.)

> **Source-of-truth rule:** Existing screens below are documented **exactly as designed** — no redesign. Where a production gap exists (e.g., no audit-progress/report screen was provided), it is listed under **Missing Screens** with a full spec, not invented into the "existing" set.

---

## 0. Design → Screen ID Index (uploaded assets)

| Asset file | SCREEN-ID | Screen | Captured state(s) |
|-----------|-----------|--------|-------------------|
| `Screen1` | SCREEN-001 | Landing (Guest) | Default; upload-success chip; upload-failed chip |
| `Screen2` | SCREEN-004 | Logged-in Home (Free) | Profile dropdown open |
| `Screen1` (guest menu) | SCREEN-002 | Guest Profile Dropdown | Login enabled; others disabled |
| `Screen3` | SCREEN-003 | SSO Login Modal | Google / Apple / Microsoft |
| `Screen4`, `Screen4.1` | SCREEN-005 | Manage Plan | Default (Free/Pro/Business) |
| `Screen4.2` | SCREEN-005 | Manage Plan | Pro = "Active Account" |
| `Screen5` | SCREEN-006 | Payment Modal (card + OTP) | Entry + OTP countdown |
| `Screen5.1`/`5.2` | SCREEN-007 | Payment Failed Modal | Failure confirmation |
| `Screen5.3`/`5.4` | SCREEN-008 | Payment Success Modal | Success confirmation |
| `Screen9` | SCREEN-009 | Pro Home (premium) | Enabled purple GO; Invalid-URL error |
| `Screen6` | SCREEN-010 | Account Settings — Personal | Default |
| `Screen6.1`, `Screen11`, `Screen11.1` | SCREEN-011 | Account Settings — Payment Details | Default; invalid card; valid |
| `Screen8` | SCREEN-012 | History | Populated (grouped by year) |
| `Screen10` | SCREEN-013 | History | Empty ("No History to display") |

> **Note:** No `Screen7`, no Audit-Progress, and no Audit-Report asset were provided. Those are specified in **§ Missing Screens** (SCREEN-M01…).

---

## 1. Global Conventions & Observed Design Facts

Facts read directly from the designs (authoritative for build):

- **Header (all screens):** Logo "Audient — AUDIT · ANALYZE · ELEVATE UX" (top-left) · **Credits** counter (top-right) · **Avatar** (opens Profile dropdown). Premium users additionally show a **gold crown** icon left of Credits.
- **Credits / plans (authoritative):** See **`docs/PRICING.md`** and `src/config/plans.ts`. **Free = 300 @ $0** (150/screenshot); **Pro = 1,000 @ $29/mo** (100/screenshot, 400/URL); **Business = 10,000 @ $99/mo** (50/screenshot, 100/URL). **Guest = 1 anonymous screenshot audit**, then login. Figma Manage Plan cards showing $99/$199 Pro/Business must be updated to **$29/$99** (R1).
- **Plans (Manage Plan):** grouping label **Individual** → **Free $0**, **Pro $29/mo**; **Enterprise** → **Business $99/mo**. Pro & Business carry a **crown**; **Business** has the **Recommended** badge. Schema map: Free→`FREE`, Pro→`PRO`, Business→`ENTERPRISE` (R2).
- **GO button:** **gray/disabled tint** for guest/Free URL; **solid purple/gradient (enabled)** for Pro (SCREEN-009). Screenshot upload is available to all.
- **Auth:** SSO only — **Google, Apple, Microsoft** (no email/password, no GitHub). (⚠️ R3 — prior docs list Google/Microsoft/GitHub. Apple is authoritative per design; update `API.md`/component docs. SSO-only means **no forgot/reset-password screen** is required.)
- **Payments:** collected **in-app** via a custom Payment modal (card number, CVV, expiry) **plus an email OTP** step. (⚠️ **R4 — SECURITY/PCI:** entering raw PAN/CVV in your own form pulls Audient into **PCI-DSS SAQ-D** scope and contradicts `API.md` (Stripe Checkout) + `SECURITY.md` (no card data). **Strongly recommend** Stripe Elements/hosted Checkout or Payment Element; treat the modal as a visual reference to be implemented with a tokenized provider. The OTP maps to **3-D Secure / SCA**.)
- **Feedback chips/badges:** success = **green** (`#16A34A`) "…image uploaded"; error = **red** (`#DC2626`) "Invalid URL", "image failed", "Invalid Credit number"; Recommended badge = **purple**.
- **Type:** Manrope throughout (`DESIGN_TOKENS.md`).
- **Auth guard:** `middleware.ts` protects authenticated routes; ownership scoping returns `404` for others' resources (`API.md` §11).
- **Session/header data:** `GET /me` (avatar, tier, crown, credits) + `GET /credits` hydrate the header on every authenticated screen.

### Reconciliation Flags (carry into backlog)
| # | Flag | Impact | Suggested resolution |
|---|------|--------|----------------------|
| R1 | Header/Figma prices vs PRD | Billing/credit config | **Adopted PRD:** Free **300**, Pro **$29/1,000**, Business **$99/10,000**; guest **1** screenshot audit — `PRICING.md` / `plans.ts`. Update Figma price labels. |
| R2 | Plan labels (Individual/Enterprise + Business) vs enum | Data mapping | Central `tier` map: Free→`FREE`, Pro→`PRO`, Business→`ENTERPRISE` (`plans.ts`) |
| R3 | SSO providers = Google/Apple/Microsoft | Auth config, docs | Enable Apple + Azure in Supabase; update API/component docs; drop GitHub |
| R4 | In-app card capture + email OTP | **PCI-DSS scope, security** | Use Stripe Elements/Checkout + 3DS; never store PAN; align with `SECURITY.md` |
| R5 | No Audit Progress/Report design | Core product output missing | Design + spec SCREEN-M01/M02 before build (specs provided below) |
| R6 | Duplicate "Email" field on Account Settings (Personal) | UX/data bug | Likely a design slip; confirm intent (primary vs billing email?) |

---

# PART A — EXISTING SCREENS (from uploaded designs)

Each screen uses the full handoff template: **Metadata · Purpose · Components · User Actions · Validation · API Integration · States · Accessibility · Responsive · Developer Notes**.

---

## SCREEN-001 — Landing (Guest)

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-001 |
| **Screen Name** | Landing (Guest) |
| **Version** | 1.0 (as designed) |
| **Owner** | Product / Growth |
| **Status** | Existing — designed |
| **Priority** | P0 |
| **Dependencies** | `GET /me` (session detect), `POST /uploads/sign`, `POST /audits`, guest-credit service |

### Purpose
- **Business goal:** Convert first-time visitors by letting them try an audit immediately (teaser) → sign-up/upgrade.
- **User goal:** Understand Audient and run a first UX audit with no friction.
- **Success criteria:** Guest starts an audit (upload or URL attempt) and/or opens the login modal.

### Components
- **Header:** Logo; **Credits = 100**; **Guest Avatar** (gray circle).
- **Navigation:** Avatar → Guest Profile Dropdown (SCREEN-002).
- **Buttons:** **Upload image/Screenshot** (purple gradient tile); **GO** (gray/disabled tint for guest URL).
- **Forms/Inputs:** Website URL text input ("Paste your website link here").
- **Badges/Chips:** Upload status chip — green "…image uploaded ✕" (success) / red "…image failed ✕" (error).
- **Cards/Tables:** none. **Progress bars:** none. **Dialogs:** none (opens SCREEN-003). **Snackbars:** upload chip acts as inline status. **Empty state:** pristine inputs. **Footer:** none in view.
- **Hero:** H1 "Turn Your Website Into a Better User Experience" + subcopy referencing "UX consultant".

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Click Upload tile → pick image | Inline upload | `POST /uploads/sign` → storage PUT | `upload_screenshot_clicked`, `screenshot_uploaded` |
| Remove uploaded chip (✕) | Clears file | — | `screenshot_removed` |
| Type URL + click GO | Guest URL → login/upgrade prompt (SCREEN-003) OR run (screenshot) | `POST /audits` (screenshot) | `go_clicked`, `guest_url_gated` |
| Click Avatar | Opens SCREEN-002 | — | `guest_menu_opened` |

### Validation
- **Required:** at least one input (image OR URL) before GO enables.
- **URL:** valid public `http/https`; **SSRF-safe** (server-enforced); URL audit is **paid** → guests routed to login/upgrade.
- **Credit:** guest teaser balance must cover a screenshot audit (server-authoritative).
- **Auth:** none to view; URL execution requires auth+paid.
- **Network:** upload requires connectivity; failed upload → red chip.
- **Permission:** guest scope only.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint/Method** | `POST /uploads/sign` (POST); `POST /audits` (POST) |
| **Payload** | sign: `{fileName, contentType, fileSize}`; audit: `{inputType:"SCREENSHOT", screenshotKeys[]}` |
| **Success** | sign → `{uploadUrl, key}`; audit → `202 {id, status:"QUEUED", creditsCost, estimatedSeconds}` |
| **Failure** | `400` invalid file/URL; `403 TIER_NOT_ALLOWED` (URL as guest); `422 INSUFFICIENT_CREDITS`; `429` |
| **Retry** | Idempotency-Key on `POST /audits`; upload retriable |
| **Polling** | After create → SCREEN-M01 (audit progress) via `GET /audits/{id}/status` |
| **Timeout** | Upload 30s; create 10s |

### States
Default · Hover (Upload tile, GO) · Focus (URL input ring) · Pressed (GO) · **Disabled** (GO until input valid; guest URL) · Loading (GO spinner; upload progress) · Skeleton (n/a static) · **Success** (green upload chip) · **Failure** (red upload chip; invalid URL) · **Offline** (upload/GO blocked, banner) · **Empty** (no input) · Expired session (n/a guest) · **429** (rate-limit toast) · Webhook delay (n/a) · **API timeout** (retry toast).

### Accessibility (WCAG 2.2 AA)
- Single `<h1>`; landmarks; `inputmode="url"` on URL field.
- **Keyboard:** Upload tile is a real button (Enter/Space) with keyboard file-pick (not drag-only); Tab order Logo → Credits → Avatar → Upload → URL → GO.
- **Screen reader:** Upload chip status announced via `aria-live`; GO has `aria-busy` when running; Credits announced with label.
- **ARIA/Contrast:** chips use icon+text (not color-only); ensure GO label contrast (gray disabled state must still meet 3:1 non-text or show disabled semantics).
- **Focus order/Reduced motion:** logical; disable gradient/hover motion under `prefers-reduced-motion`.

### Responsive
- **Desktop:** centered hero, inputs mid-column.
- **Tablet:** same, reduced side padding.
- **Mobile:** stack hero; Upload tile centered; URL input + GO full-width (GO may wrap below input).

### Developer Notes
Reuse `AuditForm` (Upload + URL + GO) across SCREEN-001/004/009, gated by auth/tier. **Guest credits must be server-authoritative** (anti-tamper) + rate-limited/captcha. Persist guest intent to resume after login. Resolve R1 (credits value).

---

## SCREEN-002 — Guest Profile Dropdown

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-002 |
| **Screen Name** | Guest Profile Dropdown |
| **Version** | 1.0 |
| **Owner** | Product |
| **Status** | Existing — designed |
| **Priority** | P1 |
| **Dependencies** | SCREEN-003 (login) |

### Purpose
- **Business goal:** Push guests toward login; tease post-login value.
- **User goal:** Log in; see what's available after login.
- **Success criteria:** Guest clicks **Login**.

### Components
- **Menu items:** **Login** (enabled) · **Profile** (disabled) · **History** (disabled) · **Manage Plan** (disabled) · **Account Settings** (disabled). Trigger = Guest Avatar.

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Login | Opens SSO modal (SCREEN-003) | — | `guest_login_clicked` |
| Disabled item click | No-op (tooltip "Log in to access") | — | `guest_disabled_item_clicked` |

### Validation
None (UI only).

### API Integration
None directly; Login opens SCREEN-003 which calls Supabase Auth.

### States
Default · Open · Item hover/focus · **Disabled** items · Closed (Esc/outside click). No loading/error.

### Accessibility
`role="menu"` + `menuitem`; roving focus; **Esc** closes and returns focus to avatar; disabled items `aria-disabled` (icon+text, not color-only); trigger `aria-haspopup="menu"` + `aria-expanded`.

### Responsive
Desktop anchored dropdown; mobile → bottom sheet / full-width menu, large tap targets.

### Developer Notes
Single `ProfileMenu` with `state="guest|authenticated"` (see SCREEN-004). Keep disabled items discoverable but inert.

---

## SCREEN-003 — SSO Login Modal

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-003 |
| **Screen Name** | SSO Login Modal |
| **Version** | 1.0 |
| **Owner** | Auth / Platform |
| **Status** | Existing — designed |
| **Priority** | P0 |
| **Dependencies** | Supabase Auth (Google, Apple, Azure), `GET /me` |

### Purpose
- **Business goal:** Frictionless account creation/login → unlock product + conversions.
- **User goal:** Log in in one click and continue.
- **Success criteria:** Session established; return to origin/intent.

### Components
- **Dialog:** centered modal over dimmed overlay.
- **Buttons:** **Login with Google**, **Login with Apple**, **Login with Microsoft** (brand icon + label, full-width, outlined).
- **Overlay:** dismiss on click/Esc; background inert.

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Login with Google | Google OAuth → return | `signInWithOAuth("google")` | `oauth_started{google}`, `oauth_succeeded` |
| Login with Apple | Apple OAuth → return | `signInWithOAuth("apple")` | `oauth_started{apple}` |
| Login with Microsoft | Azure OAuth → return | `signInWithOAuth("azure")` | `oauth_started{microsoft}` |
| Dismiss (overlay/Esc) | Back to origin | — | `login_modal_dismissed` |

### Validation
- **Auth:** provider must be configured/enabled; `redirectTo` on allow-list (PKCE).
- **Permission:** none.
- **Network:** provider reachability; handle popup-blocked.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint** | Supabase Auth OAuth (`google`/`apple`/`azure`) → provider callback |
| **Auth/Headers** | PKCE flow; no bearer needed to start |
| **Success** | Session cookie/JWT set → `GET /me` hydrate → route to intent |
| **Failure** | provider error/denied/cancelled → `Alert` in modal |
| **Retry** | user re-clicks provider |
| **Timeout** | provider-controlled; show "taking longer…" |

### States
Default (3 providers) · Provider **Loading/redirecting** (`aria-busy`, others disabled) · **Failure** (Alert) · Success (close + redirect) · Offline (disabled + banner) · 429 (throttle message).

### Accessibility
`role="dialog"` + `aria-modal`; **focus trap**; focus returns to trigger on close; Esc + overlay dismiss; provider buttons have full accessible names ("Continue with …"); brand icons `aria-hidden`; ≥44px targets; **Apple button** follows Apple styling rules.

### Responsive
Desktop centered; mobile near-full-width sheet; buttons stack full-width.

### Developer Notes
Keep OAuth logic in `useAuth`; buttons = one `OAuthButton` primitive × 3 configs (DRY). Enable **Apple** (Services ID/key) + **Azure** in Supabase. Handle Apple private-relay email + name-on-first-login. First login seeds `Users/Memberships(FREE)/Credits/Settings`. Persist post-login intent (resume guest audit / continue to upgrade).

---

## SCREEN-004 — Logged-in Home (Free) + Profile Dropdown

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-004 |
| **Screen Name** | Logged-in Home (Free) |
| **Version** | 1.0 |
| **Owner** | Product |
| **Status** | Existing — designed |
| **Priority** | P0 |
| **Dependencies** | `GET /me`, `GET /credits`, `POST /uploads/sign`, `POST /audits` |

### Purpose
- **Business goal:** Activate logged-in Free users; nudge to Pro (URL audits).
- **User goal:** Run a screenshot audit; manage account.
- **Success criteria:** Audit started, or navigates to Manage Plan.

### Components
- **Header:** Logo; **Credits (real)**; **Profile Avatar** (photo).
- **Profile Dropdown (authenticated):** **Profile · Manage Plan · History · Account Settings · Logout** (all enabled).
- **Buttons:** Upload tile; **GO** (gray tint for Free URL — screenshot enabled, URL gated).
- **Inputs:** Website URL. **Hero:** same as landing.

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Upload + GO | SCREEN-M01 (progress) → report | `POST /uploads/sign`, `POST /audits{SCREENSHOT}` | `audit_started{screenshot}` |
| URL + GO (Free) | Upgrade dialog (SCREEN-M09) | gated `403` | `url_attempt_gated` |
| Profile | SCREEN-010 (Personal) | `GET /me` | `profile_opened` |
| Manage Plan | SCREEN-005 | — | `manage_plan_opened` |
| History | SCREEN-012/013 | `GET /audits` | `history_opened` |
| Account Settings | SCREEN-010 | `GET /settings` | `settings_opened` |
| Logout | Landing (SCREEN-001) | `signOut` | `logout` |

### Validation
Screenshot: type/size; URL: valid + SSRF + **paid** tier; sufficient credits; verified email may gate execution (`403 EMAIL_NOT_VERIFIED`).

### API Integration
As SCREEN-001 plus `GET /me`, `GET /credits` on load; `signOut` on logout.

### States
Default · Header **Skeleton** (loading me/credits) · GO Disabled (no input / Free URL) · Loading (GO spinner, upload progress) · **Success** (upload chip) · **Failure** (invalid file/URL; `422` credits → upgrade) · **Empty** (no recent activity — see note) · **Expired session** (redirect to login) · **429** · **API timeout** (retry) · **Offline** (banner).

### Accessibility
Landmarks + skip link; labeled inputs; authenticated menu keyboard-navigable (Esc closes, focus returns); Credits announced; GO `aria-busy`; gated URL explained in text.

### Responsive
Header condenses; inputs full-width on mobile; profile menu → sheet.

### Developer Notes
Reuse `AuditForm`; `ProfileMenu` authenticated state = SCREEN-002 component. **Consider adding a recent-audits section** to reduce empty feel (currently the logged-in home mirrors landing). Enforce all gates server-side.

---

## SCREEN-005 — Manage Plan

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-005 |
| **Screen Name** | Manage Plan |
| **Version** | 1.0 |
| **Owner** | Billing / Growth |
| **Status** | Existing — designed (states: default, Pro=Active) |
| **Priority** | P0 |
| **Dependencies** | `GET /membership`, `POST /billing/checkout` (or Payment modal SCREEN-006), plan catalog |

### Purpose
- **Business goal:** Drive upgrades (Business = Recommended).
- **User goal:** Compare plans and subscribe.
- **Success criteria:** Subscribe clicked → payment → active plan.

### Components
- **Cards (3):** **Individual/Free $0** · **Individual/Pro $99/mo** (crown) · **Enterprise/Business $199/mo** (crown, **Recommended** badge).
- **Card body:** plan description + feature copy (Free: "200 free credits…"; Pro: "Unlock Full Website Audits…downloadable PDF"; Business: "Unlimited UX Audits…multiple websites").
- **Buttons:** **Subscribe** (Pro, Business); Free has no CTA; **Active Account** (outlined) shown on the user's current paid plan (SCREEN-005 "Pro active" state).
- **Badges:** Recommended (Business); crown (Pro/Business).

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Subscribe (Pro) | Payment modal (SCREEN-006) | `POST /billing/checkout{PRO}` (recommended) | `subscribe_clicked{pro}` |
| Subscribe (Business) | Payment modal (SCREEN-006) | `POST /billing/checkout{ENTERPRISE}` | `subscribe_clicked{business}` |
| Current plan | Disabled "Active Account" | — | `current_plan_viewed` |

### Validation
- Valid tier; block checkout for current tier (`409`); amounts **server-authoritative** (never client).
- Permission: authenticated; top-ups/paid actions require account.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint** | `GET /membership` (load); `POST /billing/checkout` (subscribe) |
| **Payload** | `{tier, billingInterval:"MONTHLY"}` |
| **Success** | `{checkoutUrl}` (hosted) **or** open in-app Payment modal (as designed) |
| **Failure** | `400` invalid tier; `409` already on tier |
| **Retry** | Idempotency-Key |
| **Caching** | plan catalog from `src/config` (static) |

### States
Default (3 cards) · **Current = "Active Account"** · Hover/focus/pressed (cards, Subscribe) · Loading (Subscribe spinner) · **Failure** (SCREEN-007 modal) · **Success** (SCREEN-008 modal) · Expired session · 429 · **Webhook delay** ("updating your plan…" after success until entitlement confirmed).

### Accessibility
Each plan = heading + real feature list; price screen-reader readable; Recommended/crown conveyed in text (not icon/color-only); Subscribe describes action + loading; card grid keyboard-navigable.

### Responsive
Desktop 3-column; tablet 2+1 or scroll; mobile stacked (Recommended first/highlighted).

### Developer Notes
Reuse `PricingTable`/`PlanCard` (also marketing + upgrade dialog). Map Free→`FREE`, Pro→`PRO`, Business→`ENTERPRISE` centrally (R2). **Prefer hosted checkout** over the in-app Payment modal (R4); if the modal is kept, implement with Stripe Elements. Treat post-payment as **webhook-driven** (eventual consistency).

---

## SCREEN-006 — Payment Modal (Card + OTP)

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-006 |
| **Screen Name** | Payment Modal |
| **Version** | 1.0 |
| **Owner** | Billing / Security |
| **Status** | Existing — designed (⚠️ PCI review required, R4) |
| **Priority** | P0 |
| **Dependencies** | Payment provider (recommend Stripe Elements + 3DS), `POST /billing/checkout`, webhook |

### Purpose
- **Business goal:** Complete the subscription purchase.
- **User goal:** Pay securely and activate the plan.
- **Success criteria:** Payment authorized (3DS/OTP passed) → SCREEN-008.

### Components
- **Dialog:** "Payment" title.
- **Inputs:** **Plan dropdown** (e.g., "Pro"), **price display** ($99/month), **Name on card**, **Card number**, **CVV**, **Expiry Date**, **Save card details** checkbox.
- **OTP:** "Enter OTP sent to registered email" — **4-digit** segmented input + **countdown** (e.g., "119 S").
- **Button:** **Update Changes** (confirm/pay).

### User Actions
| Action | Destination | Backend event | Analytics event |
|--------|-------------|---------------|-----------------|
| Change plan (dropdown) | Updates price | — | `payment_plan_changed` |
| Enter card + Update Changes | 3DS/OTP challenge | create PaymentIntent (tokenized) | `payment_submitted` |
| Enter OTP | Confirm payment | 3DS confirm | `payment_otp_submitted` |
| OTP expires → resend | New OTP | resend challenge | `payment_otp_resend` |
| Success | SCREEN-008 | webhook `payment_intent.succeeded` | `payment_succeeded` |
| Failure | SCREEN-007 | webhook `payment_failed` | `payment_failed` |

### Validation
- **Card number:** Luhn-valid, length by network (see SCREEN-011 "Invalid Credit number").
- **CVV:** 3–4 digits; **Expiry:** future date (design shows `31/11/40` — enforce MM/YY & valid month).
- **Name:** required.
- **OTP:** required N digits before confirm; expiry countdown enforced.
- **Permission/Auth:** authenticated user; amount server-set.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint** | (recommended) create/confirm PaymentIntent via provider; server `POST /billing/checkout`; entitlement via **Stripe webhook** (`API.md` §9) |
| **Auth/Headers** | Bearer session; provider client token |
| **Request** | tokenized card (Elements) — **never raw PAN to Audient**; `{tier, interval}` server-side |
| **Success** | `payment_intent.succeeded` → membership `ACTIVE`, credits granted |
| **Failure** | card declined / 3DS failed / network → SCREEN-007 |
| **Retry** | Idempotency-Key; new PaymentIntent on retry |
| **Timeout** | OTP window (~120s); provider timeout → fail gracefully |

### States
Default · Field focus/hover/pressed · **Validation errors** (inline, red) · Loading ("processing payment", button `aria-busy`) · **OTP pending** (countdown) · **OTP expired** (resend) · **Success** (SCREEN-008) · **Failure** (SCREEN-007) · Offline · **API timeout** · Expired session.

### Accessibility
`role="dialog"` + `aria-modal`, focus trap, Esc; labeled fields with `autocomplete` (`cc-name`, `cc-number`, `cc-csc`, `cc-exp`); OTP grouped with single label + `inputmode="numeric"` + `autocomplete="one-time-code"`; countdown announced (`aria-live`, throttled); errors via `aria-describedby`.

### Responsive
Desktop centered modal; mobile full-height sheet, sticky "Update Changes"; numeric keyboards for card/CVV/OTP.

### Developer Notes
**R4 (critical):** replace raw card capture with **Stripe Payment Element/Checkout** to stay out of PCI SAQ-D; "Save card details" → provider tokenization/off-session mandate. The email OTP corresponds to **3-D Secure/SCA** — implement via provider's 3DS, not a bespoke email code, unless a bank-driven challenge. Entitlements only on verified webhook.

---

## SCREEN-007 — Payment Failed Modal

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-007 |
| **Screen Name** | Payment Failed Modal |
| **Version** | 1.0 · Owner Billing · Status Existing · Priority P0 · Deps SCREEN-006 |

### Purpose
- **Business goal:** Recover a failed purchase.
- **User goal:** Understand failure and retry.
- **Success criteria:** User retries or picks another method.

### Components
Dialog with **red ✕ icon** + message **'Payment for "Pro" subscription failed'**; (recommended) **Try again** + **Change method** buttons; dismiss.

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| Try again | SCREEN-006 | new PaymentIntent | `payment_retry_clicked` |
| Dismiss | Manage Plan (SCREEN-005) | — | `payment_failed_dismissed` |

### Validation / API
No new inputs; reads failed PaymentIntent reason (declined, 3DS-failed, insufficient funds, network).

### States
Visible (failure) · Retry loading · Dismissed. Show **specific decline reason** where provider allows (avoid leaking sensitive detail).

### Accessibility
Dialog semantics; error conveyed in **text** (not just red icon); focus moves to heading; actions labeled; `aria-live="assertive"` for the failure.

### Responsive
Centered modal; mobile sheet; full-width buttons.

### Developer Notes
Map provider decline codes → friendly messages. **No credits/entitlement** granted on failure. Keep the underlying Manage Plan mounted behind overlay.

---

## SCREEN-008 — Payment Success Modal

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-008 |
| **Screen Name** | Payment Success Modal |
| **Version** | 1.0 · Owner Billing · Status Existing · Priority P0 · Deps SCREEN-006, webhook |

### Purpose
- **Business goal:** Confirm purchase; transition to premium.
- **User goal:** Confidence the plan is active.
- **Success criteria:** User proceeds as Pro (SCREEN-009).

### Components
Dialog with **green ✓ icon** + **'Payment for "Pro" subscription is Successful'**; (recommended) **Continue** → Pro Home.

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| Continue / dismiss | Pro Home (SCREEN-009) | membership `ACTIVE`, credits granted | `payment_succeeded`, `plan_activated` |

### Validation / API
Entitlement applied by **verified Stripe webhook** (not the modal). If webhook lags, show **"activating your plan…"** (see Global States: Webhook Delay).

### States
Visible (success) · Continue · **Webhook-pending** (entitlement not yet reflected → poll `GET /membership`).

### Accessibility
Dialog semantics; success in text; focus to heading; `aria-live="polite"`.

### Developer Notes
Do **not** grant access purely on this modal; reconcile with webhook. Update header (crown, credits→1000) once membership confirms. Fix copy typo "Succesfull"→"Successful".

---

## SCREEN-009 — Pro Home (Premium)

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-009 |
| **Screen Name** | Pro Home (Premium) |
| **Version** | 1.0 · Owner Product · Status Existing · Priority P0 |
| **Dependencies** | `GET /me`, `GET /credits`, `POST /audits{URL}`, SCREEN-M01 |

### Purpose
- **Business goal:** Deliver the paid core value (full URL audits).
- **User goal:** Run a full website audit.
- **Success criteria:** URL audit created → progress → report.

### Components
- **Header:** Logo; **gold crown**; **Credits = 1000**; Avatar.
- **Buttons:** Upload tile; **GO (solid purple/enabled)**.
- **Inputs:** Website URL (**enabled**). **Chips:** red "Invalid URL ✕" on bad input.
- **Hero:** same.

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| URL + GO | SCREEN-M01 → report | `POST /audits{URL, websiteUrl}` | `url_audit_started` |
| Upload + GO | SCREEN-M01 → report | `POST /audits{SCREENSHOT}` | `audit_started{screenshot}` |
| Crown click | Manage Plan (SCREEN-005) | — | `premium_badge_clicked` |

### Validation
URL required, valid public `http/https`, **SSRF-safe**, well-formed (design shows "wwz.goggle.com" → **Invalid URL**); credits sufficient (Business `isUnlimited` bypasses); Business tracks usage.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint** | `POST /audits` (POST) → `202` |
| **Payload** | `{inputType:"URL", websiteUrl, competitors?}` |
| **Success** | `{id, status:"QUEUED", creditsCost, estimatedSeconds}` |
| **Failure** | `400` invalid/SSRF; `422` credits; `429`; `403` if lapsed (`PAST_DUE`) |
| **Retry** | Idempotency-Key |
| **Polling** | SCREEN-M01: `GET /audits/{id}/status` |
| **Timeout** | create 10s; audit ≤8min async |

### States
Default (enabled purple GO) · Hover/focus/pressed · **Invalid URL** (red chip) · Loading (GO spinner) · Success (navigate to progress) · **Failure** (create error) · **PAST_DUE/lapsed** (premium features limited + billing prompt) · Offline · 429 · API timeout · Expired session.

### Accessibility
Crown has text/`aria-label` ("Premium plan") — not icon-only; purple GO meets contrast on its fill; `inputmode="url"`; error via `aria-describedby`; GO `aria-busy`.

### Responsive
Header keeps crown+credits (crown may fold into menu on small screens); URL+GO full-width on mobile.

### Developer Notes
Same `AuditForm`/`WebsiteUrlInput` as Free, **ungated** by tier. Purple GO = `Button` variant (Primary/Secondary token), not bespoke. Handle `PAST_DUE` gracefully. Consider merging Free/Pro home into one adaptive home (DRY).

---

## SCREEN-010 — Account Settings · Personal

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-010 |
| **Screen Name** | Account Settings — Personal |
| **Version** | 1.0 · Owner Account · Status Existing · Priority P1 |
| **Dependencies** | `GET /me`, `PATCH /me`, avatar upload |

### Purpose
- **Business goal:** Let users maintain profile → trust/retention.
- **User goal:** Update name/email/avatar.
- **Success criteria:** Changes saved.

### Components
- **Breadcrumb:** Home / **Account Settings**. **Tabs:** **Personal** (active) · Payment Details (SCREEN-011).
- **Avatar:** circular with **edit pencil**.
- **Inputs:** First Name, Last Name, **Email**, **Email (second field — ⚠️ R6 duplicate)**.
- **Button:** **Update Changes**.

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| Edit avatar | Upload image | `POST /uploads/sign` → `PATCH /me{avatarUrl}` | `avatar_updated` |
| Update Changes | Save profile | `PATCH /me{name,...}` | `profile_updated` |
| Tab → Payment Details | SCREEN-011 | — | `settings_tab_changed` |

### Validation
First/Last name required, length-bounded; Email valid format (email is Supabase-managed — likely **read-only**; clarify the two email fields, R6); avatar type/size.

### API Integration
`GET /me` (load); `PATCH /me` (save, whitelisted fields); avatar via signed upload. Success → updated user; Failure `400 VALIDATION_ERROR`.

### States
Default · Field focus/hover · Loading (Update spinner) · **Success** ("Saved" toast) · **Failure** (inline errors) · Skeleton (load) · Expired session.

### Accessibility
Tabs use `role="tablist"/tab/tabpanel` + arrow keys; labeled fields with `autocomplete` (`given-name`, `family-name`, `email`); avatar edit is a labeled button; read-only email conveyed non-visually; `aria-live` save status.

### Responsive
Desktop two-column (avatar left, form right); mobile single column, avatar on top.

### Developer Notes
**Resolve R6** (duplicate Email) — likely primary vs billing/notification email; or a design slip. If email is auth-managed, render read-only with explanation. Keep logic in `useUser`.

---

## SCREEN-011 — Account Settings · Payment Details

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-011 |
| **Screen Name** | Account Settings — Payment Details |
| **Version** | 1.0 · Owner Billing/Security · Status Existing (⚠️ R4 PCI) · Priority P1 |
| **Dependencies** | Payment provider tokenization, `GET/PATCH` billing profile |

### Purpose
- **Business goal:** Maintain a valid payment method for renewals.
- **User goal:** Add/update the card on file.
- **Success criteria:** Valid card saved (tokenized).

### Components
- **Breadcrumb/Tabs:** Personal · **Payment Details** (active).
- **Visual:** "Credit Card Details" graphic.
- **Inputs:** Name on card, **Card number** (shows red **"Invalid Credit number"** when bad), CVV, Expiry Date.
- **Button:** Update Changes.

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| Enter card + Update | Save method | provider tokenize → store token | `payment_method_updated` |

### Validation
Card number Luhn + network length (design: "3456 5678 128" invalid → "3456 5678 1289" valid); CVV 3–4; Expiry future MM/YY; Name required.

### API Integration
| Concern | Detail |
|---|---|
| **Endpoint** | provider tokenization (client) → server stores **token only** |
| **Request** | tokenized method; **never raw PAN to Audient** |
| **Success** | default method updated |
| **Failure** | invalid card / declined validation |
| **Rate limiting** | throttle updates |

### States
Default · Field focus · **Invalid card** (inline red) · Valid · Loading · Success · Failure · Offline.

### Accessibility
Labeled fields + `autocomplete` (`cc-*`); inline errors `aria-describedby`; card graphic decorative (`alt=""`); numeric `inputmode`.

### Responsive
Desktop graphic left / form right; mobile stacked; numeric keyboards.

### Developer Notes
**R4:** use Stripe Elements — do not persist PAN/CVV. "Update Changes" replaces the default token/mandate. Show last-4 + brand instead of full number after save.

---

## SCREEN-012 — History (Populated)

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-012 |
| **Screen Name** | History |
| **Version** | 1.0 · Owner Product · Status Existing · Priority P0 |
| **Dependencies** | `GET /audits`, `GET /audits/{id}/report/pdf` |

### Purpose
- **Business goal:** Retention via revisiting/re-downloading reports.
- **User goal:** Find a past audit and download its PDF.
- **Success criteria:** Opens/downloads a report.

### Components
- **Breadcrumb:** Home / **History**. Header with **crown** (premium) + Credits.
- **Grouped list:** section headers by period (**"This year"**, **"2025"**).
- **Row cards:** report title link **"UX Audit for apple.pdf"**, **date** ("July 25, 2026"), **download icon** (right).

### User Actions
| Action | Destination | Backend event | Analytics |
|--------|-------------|---------------|-----------|
| Click report title | Report view (SCREEN-M02) | `GET /audits/{id}` | `history_row_opened` |
| Click download | PDF download | `GET /audits/{id}/report/pdf` (signed URL) | `pdf_downloaded` |

### Validation
Ownership (`404` otherwise); PDF exists + tier permits.

### API Integration
`GET /audits?limit=&cursor=&sort=-createdAt` (cursor pagination); PDF via short-lived **signed URL**. Failure `401/404`.

### States
Default (grouped list) · Loading **Skeleton** rows · **Empty** (SCREEN-013) · Row hover/focus · Download loading (spinner on icon) · **Failure** (download error toast) · Offline · Expired session · Pagination (load more).

### Accessibility
Group headers as headings; each row a labeled link ("Open UX Audit for apple.pdf, July 25 2026"); download button has discernible name; keyboard-activatable; list semantics.

### Responsive
Desktop wide rows; mobile full-width stacked rows; download icon remains reachable (min 44px).

### Developer Notes
Group client-side by year/period from `createdAt`. Titles currently all "apple.pdf" (mock) — bind to real site/date. Add filters/search + pagination as data grows (see Missing/Enhancements). Reuse row with any dashboard recent-list.

---

## SCREEN-013 — History (Empty)

### Metadata
| | |
|---|---|
| **Screen ID** | SCREEN-013 · **Screen Name** History (Empty) · Version 1.0 · Owner Product · Status Existing · Priority P1 · Deps `GET /audits` |

### Purpose
Communicate no audits yet and (recommended) nudge to run one.

### Components
Breadcrumb Home / History; centered message **"No History to display"**; header crown + Credits.

### User Actions
| Action | Destination | Analytics |
|--------|-------------|-----------|
| (recommended) "Run your first audit" CTA | Home (SCREEN-009/004) | `empty_history_cta_clicked` |

### Validation / API
`GET /audits` returns empty list → render empty state (distinct from load error).

### States
**Empty** (as shown) · Loading skeleton (before resolve) · Error (fetch failed — distinct from empty).

### Accessibility
Message is a heading; if CTA added, it's a real button; ensure the empty text has sufficient contrast (currently light gray — verify ≥4.5:1).

### Responsive
Centered on all breakpoints.

### Developer Notes
Add a primary CTA to convert the dead-end into activation. Distinguish empty vs error vs loading explicitly.

---

# PART B — MISSING SCREENS (required for engineering handoff)

Not present in the uploads but required for a complete production flow. Specs below are **new** (design still needed) — flagged so they aren't mistaken for existing designs. IDs continue as **SCREEN-M01…**. (Some items the brief listed as "missing" — History, Settings — **already exist** above; noted in the table.)

> **Full layouts, scenario matrix (S1–S12), and build phases:** see **`docs/MISSING_SCREENS_PLAN.md`**. **Pricing/credits:** see **`docs/PRICING.md`**.

| ID | Screen | Why required | Brief's ID | Already exists? |
|----|--------|--------------|-----------|-----------------|
| **SCREEN-M01** | **Audit Progress** | Core: audit is async (≤90s screenshot / ≤8min URL) | (implied) | ❌ must design |
| **SCREEN-M02** | **Audit Report / Result** | Core deliverable (score, summary, findings, PDF) | (implied) | ❌ must design |
| **SCREEN-M03** | **Audit Failure** (taxonomy) | Structured error handling + refunds | (implied) | ❌ must design |
| SCREEN-M04 | Notifications | Audit-complete/low-credit/payment events | SCREEN-011 | ❌ |
| SCREEN-M05 | Buy Credits (Top-up) | Mid-cycle credit purchase (PRD §9.3) | SCREEN-014 | ❌ |
| SCREEN-M06 | Billing Management / Invoices | Cancel/downgrade, receipts, method | SCREEN-013 | ⚠️ partial (SCREEN-011) |
| SCREEN-M07 | Checkout Return (Success/Cancel) | Hosted-checkout redirect + webhook lag | SCREEN-015 | ❌ |
| SCREEN-M08 | Upgrade Dialog | Contextual gate (Free URL, out-of-credits) | SCREEN-016 | ❌ |
| SCREEN-M09 | 404 Not Found | Unknown/owned-resource | SCREEN-017 | ❌ |
| SCREEN-M10 | 500 Error / Boundary | Runtime/server errors | SCREEN-018 | ❌ |
| SCREEN-M11 | Offline | Network loss | SCREEN-019 | ❌ |
| SCREEN-M12 | Legal & Consent (cookie banner) | GDPR/CCPA consent gating | SCREEN-020/023 | ❌ |
| SCREEN-M13 | Privacy Policy | Compliance | SCREEN-021 | ❌ |
| SCREEN-M14 | Terms of Service | Compliance | SCREEN-022 | ❌ |
| SCREEN-M15 | Delete Account | GDPR erasure | SCREEN-024 | ❌ |
| SCREEN-M16 | Session Expired | Re-auth prompt | SCREEN-025 | ❌ |
| SCREEN-M17 | Maintenance | Planned downtime | (global) | ❌ |

### SCREEN-M01 — Audit Progress (P0)
- **Purpose:** Show live audit status (QUEUED → PROCESSING → COMPLETED/FAILED) with ETA and reassurance during long URL audits.
- **Components:** progress bar / stepper (`AuditProgress`), stage timeline (`AuditTimeline`), estimated time, cancel (optional), website/screenshot context.
- **API:** `GET /audits/{id}/status` (poll) and/or Supabase Realtime; `GET /audits/{id}` on completion.
- **States:** queued, processing (% + ETA), completed (auto-redirect to M02), **failed** (→ M03), offline/reconnect, timeout.
- **A11y:** `role="progressbar"` + throttled `aria-live` stage updates; not color-only.
- **Analytics:** `audit_processing_watched`, `audit_completed`, `audit_failed`, `audit_cancelled`.
- **Notes:** This is the missing bridge between GO and the report. See **§ Real-Time Audit Contract**.

### SCREEN-M02 — Audit Report / Result (P0)
- **Purpose:** Present results — Overall UX Score, Executive Summary, Category Scores, **Strengths**, **Weaknesses**, **Recommendations**, and **Download PDF**.
- **Components:** `AuditScore`/`ScoreCard`, `CategoryScore[]`, `SeverityBadge`, strengths list, `IssueCard[]` (weaknesses), `RecommendationCard[]`, `ScreenshotViewer`/annotations, `DownloadPdfButton`, feedback.
- **API:** `GET /audits/{id}/report`, `GET /audits/{id}/recommendations`, `GET /audits/{id}/report/pdf`, `POST /audits/{id}/report/feedback`.
- **Tier gating:** Free = brief summary + limited findings; paid = full report + PDF.
- **A11y:** scores as text; annotated screenshots have alt + text-described annotations; **PDF must be a tagged/accessible PDF**.
- **Schema note:** add a **`strengths`** array to `reportJson`/schema (current `SCHEMA.md` is fix-oriented) to back the Strengths section (R5-adjacent).
- **Analytics:** `report_viewed`, `recommendation_expanded`, `pdf_downloaded`, `report_feedback_submitted`.

### SCREEN-M03 — Audit Failure (P0)
Structured failure surface — see **§ Audit Failure Taxonomy** for the full matrix (title, message, recovery, retry, refund, escalation, analytics).

### SCREEN-M04 — Notifications (P1)
Bell + panel/page; types AUDIT_COMPLETE / LOW_CREDITS / SUBSCRIPTION_EXPIRING / PAYMENT_SUCCEEDED; `GET/PATCH /notifications*`; deep-link via metadata; empty state "No notifications".

### SCREEN-M05 — Buy Credits (Top-up) (P1)
Credit packs (e.g., +500/+2000/+5000) → payment (Elements/Checkout); `POST /credits/topups`; paid-tier only; purchased credits **roll over** (PRD §9.3).

### SCREEN-M06 — Billing Management / Invoices (P1)
Current plan/status/renewal, cancel/downgrade (Stripe Portal `POST /billing/portal`), payment history `GET /payments`, method (SCREEN-011). Empty state "No payments yet".

### SCREEN-M07 — Checkout Return (P1)
Success/cancel landing after hosted checkout; handle **webhook delay** ("activating your plan…"), poll `GET /membership`.

### SCREEN-M08 — Upgrade Dialog (P0)
Contextual gate reused at: Free URL attempt, out-of-credits, PDF gated. Reuses `PricingTable`/`PlanCard`; CTA → SCREEN-005/006.

### SCREEN-M09…M17 — System/Legal (P1–P2)
404, 500/boundary, Offline, Maintenance, Legal & Consent (cookie banner + preferences), Privacy, Terms, Delete Account (GDPR erasure `DELETE /me`, cancel-sub-first `409`), Session Expired (re-auth), each with heading, recovery CTA, and a11y focus management.

---

# PART C — CROSS-CUTTING SPECIFICATIONS

## Screen Flow (Navigation Map)

```text
                         ┌────────────────────────── Landing (SCREEN-001, Guest) ──────────────────────────┐
                         │  Upload → GO (screenshot teaser) ──────────────► Audit Progress (M01)            │
                         │  URL → GO (paid) ─────────► SSO Login (003)                                       │
                         │  Avatar → Guest Dropdown (002) → Login ─────► SSO Login (003)                     │
                         └───────────────────────────────────────────────────────────────────────────────┘
                                                          │ (auth success)
                                                          ▼
                          Logged-in Home (004, Free) ─────────────────────────────────────────────┐
                            │  Upload → GO ─► Audit Progress (M01) ─► Report (M02) ─► Download PDF   │
                            │  URL → GO (Free) ─► Upgrade Dialog (M08) ─► Manage Plan (005)          │
                            │  Profile menu → Profile/Account Settings (010/011), History (012/013) │
                            └──────────────────────────────────────────────────────────────────────┘
                                                          │ (upgrade)
                    Manage Plan (005) ─► Subscribe ─► Payment Modal (006) ─► [OTP/3DS]
                                                          ├─ success ─► Payment Success (008) ─► Pro Home (009)
                                                          └─ failure ─► Payment Failed (007) ─► (retry 006)
                                                          ▼
                          Pro Home (009, Premium) ─► URL/Upload → GO ─► Audit Progress (M01) ─► Report (M02) ─► PDF ─► History (012)
```

### Alternate Paths
| Path | Flow |
|------|------|
| **Failed Login** | SSO (003) → provider error → Alert → retry / dismiss → Landing (001) |
| **Cancelled Audit** | Audit Progress (M01) → Cancel → confirm → credits refunded → Home |
| **Credits Exhausted** | GO → `422` → Upgrade Dialog (M08) / Buy Credits (M05) |
| **Payment Failed** | Payment (006) → Failed (007) → retry (006) / change method |
| **Audit Failed** | Progress (M01) → Failure (M03, taxonomy) → retry / refund |
| **Retry** | M03/007 → new attempt (Idempotency-Key) |
| **Logout** | Any authed → Profile menu → Logout → Landing (001) |
| **Session Expired** | Any authed → 401 → Session Expired (M16) → SSO (003) → resume |

## State Diagram — Audit Lifecycle

```text
        POST /audits (credits reserved)
QUEUED ───────────────► PROCESSING ───────────► COMPLETED ──► Report (M02) ──► PDF ready
   │                        │                        
   │ cancel                 │ error                  
   ▼                        ▼                        
CANCELLED (refund)     FAILED (M03) ──► refund-eligible? ──► credits refunded
                                          └─ retry (new audit, Idempotency-Key)
```

## Audit Failure Taxonomy (replaces generic FAILED)

> Adapted to **website/screenshot UX audits** (not GitHub). Refund policy per PRD §8.5 (failed audits auto-refund).

| Code | Title | User Message | Recovery | Retry | Refund | Escalation | Analytics |
|------|-------|--------------|----------|-------|--------|-----------|-----------|
| `URL_INVALID` | Invalid URL | "That doesn't look like a valid website link." | Fix URL | Yes | N/A (pre-charge) | No | `audit_failed{url_invalid}` |
| `URL_UNREACHABLE` | Site Unreachable | "We couldn't reach this site." | Check site/try later | Yes | Yes | If persistent | `audit_failed{unreachable}` |
| `SSRF_BLOCKED` | Blocked Address | "This address isn't allowed." | Use a public URL | No | N/A | Security log | `audit_failed{ssrf}` |
| `SITE_BLOCKS_BOT` | Access Blocked | "The site blocked automated access." | Try screenshot upload | Yes | Yes | Docs link | `audit_failed{bot_blocked}` |
| `AUTH_REQUIRED` | Login-Walled Page | "This page needs a login we can't pass." | Audit a public page | No | Yes | No | `audit_failed{auth_wall}` |
| `PAGE_TOO_HEAVY` | Page Too Large | "This page is too large/complex to render." | Try a single page | Yes | Yes | Eng if common | `audit_failed{too_heavy}` |
| `SCREENSHOT_INVALID` | Unsupported Image | "Use PNG/JPEG/WebP under the size limit." | Re-upload | Yes | N/A | No | `audit_failed{img_invalid}` |
| `CRAWL_TIMEOUT` | Scan Timed Out | "The audit took too long and stopped." | Retry / fewer pages | Yes | Yes | Eng | `audit_failed{timeout}` |
| `AI_UNAVAILABLE` | AI Service Unavailable | "Our AI is temporarily unavailable." | Try again shortly | Yes | Yes | On-call | `audit_failed{ai_unavailable}` |
| `CREDIT_DEDUCT_FAILED` | Credit Error | "We couldn't process your credits." | Retry | Yes | Ensure no double-charge | Billing | `audit_failed{credit_error}` |
| `PDF_FAILED` | Report Export Failed | "Your report is ready, PDF failed." | Retry PDF (report intact) | Yes (PDF only) | No (report delivered) | Eng | `audit_failed{pdf_failed}` |
| `RATE_LIMITED` | Too Many Requests | "You're going a bit fast — try again soon." | Wait | Yes | N/A | No | `audit_failed{rate_limited}` |
| `INTERNAL_ERROR` | Something Went Wrong | "An unexpected error occurred." | Retry / support | Yes | Yes | On-call + correlationId | `audit_failed{internal}` |

Each failure surfaces on **SCREEN-M03** with title, message, primary recovery action, and (where refund-eligible) a "credits refunded" confirmation.

## Real-Time Audit Contract

| Concern | Spec |
|---|---|
| **Queue** | `POST /audits` enqueues (BullMQ + Redis); returns `202 {id, status:QUEUED, estimatedSeconds}` |
| **Polling** | `GET /audits/{id}/status` every **3s** while non-terminal; back off to 5–10s after 60s |
| **WebSocket/Realtime** | Supabase Realtime channel `audit:{id}` → events `status_changed`, `progress`, `completed`, `failed` (supersedes polling when connected) |
| **Webhook events** | Worker → app on stage transitions; Stripe webhooks for billing (separate) |
| **Retry strategy** | Job retried up to N times on transient errors (AI/crawl); terminal failure → taxonomy code |
| **Reconnect** | On WS drop, resume polling; on reconnect, resubscribe + reconcile with `GET /status` |
| **Progress updates** | `{status, progress: 0..1, estimatedSecondsRemaining}` |
| **Estimated completion** | From `estimatedSeconds` (≤90s screenshot / ≤480s URL) minus elapsed |
| **Completion notification** | In-app (SCREEN-M04) + optional email (per `Settings.emailNotifications`); `AUDIT_COMPLETE` |
| **PDF lifecycle** | Report JSON first → PDF generated async → `hasPdf` flips true → `DownloadPdfButton` enabled; `PDF_FAILED` handled separately |

## Credit System

| Flow | Spec |
|---|---|
| **Deduction** | Reserved transactionally at `POST /audits` (row-lock); cost from `src/config` per input type/tier |
| **Refund** | Auto on FAILED (refund-eligible codes) → ledger entry; not on user-deleted audits |
| **Insufficient** | `422 INSUFFICIENT_CREDITS` → Upgrade (M08) / Buy Credits (M05) |
| **Purchase (top-up)** | `POST /credits/topups` → payment → **granted on webhook**; roll over across resets |
| **Upgrade plan** | Subscribe (005/006) → webhook → tier + monthly grant applied |
| **Renewal** | Stripe recurring → webhook → membership `ACTIVE`, credits reset to `monthlyGrant` |
| **Enterprise/Business** | `isUnlimited=true` → balance not enforced; usage tracked via `lifetimeUsed` |
| **Observed values** | Guest/Free header **100** (⚠️R1), Pro **1000**; reconcile with plan grants |

## User Permission Matrix

| Capability | Guest | Free | Pro | Business | (Enterprise) | Admin |
|------------|:-----:|:----:|:---:|:--------:|:------------:|:-----:|
| Screenshot audit | ✅ teaser | ✅ | ✅ | ✅ | ✅ | ✅ |
| URL audit | ⛔ (login) | ⛔ upgrade | ✅ | ✅ | ✅ | ✅ |
| View report (brief) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View report (full) | ⛔ | ⛔ | ✅ | ✅ | ✅ | ✅ |
| Download PDF | ⛔ | ⛔ | ✅ | ✅ | ✅ | ✅ |
| Purchase credits | ⛔ | ⛔ | ✅ | ✅ | ✅ | ✅ |
| Billing / manage plan | ⛔ | ✅ (upgrade) | ✅ | ✅ | ✅ | ✅ |
| View audit history | ⛔ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete reports | ⛔ | ✅ own | ✅ own | ✅ own | ✅ own | ✅ any |
| Manage users / invite | ⛔ | ⛔ | ⛔ | ✅ (future) | ✅ (future) | ✅ |
| Admin tooling | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |

> **Note:** "Business" (UI) maps to `ENTERPRISE` (schema). Team/seat management (Manage Users, Invite Members) is **future** — no design yet; flag for roadmap.

## Global Application States (reusable)

| State | Pattern |
|-------|---------|
| **Loading** | Spinner on action buttons (`aria-busy`) |
| **Skeleton** | Header, history rows, report cards |
| **Empty** | Friendly message + CTA (history, notifications, reports) |
| **Offline** | Global banner; block network actions; auto-recover |
| **Maintenance** | Full-page notice + status link (SCREEN-M17) |
| **429** | "Too many requests" toast + retry-after |
| **403** | Tier/permission gate → Upgrade dialog / explanation |
| **401 / Expired session** | Redirect to SSO (M16) preserving intent |
| **404** | Not-found screen (M09) |
| **500** | Error boundary (M10) + correlationId |
| **Webhook Delay** | "Activating your plan…" + poll membership |
| **AI Processing** | Audit progress (M01) |
| **Credit Refresh** | Toast on reset/refund; header credit re-fetch |
| **No Notifications / History / Reports** | Distinct empty states |

## Analytics Taxonomy (mapped to PRD KPIs)

| Event | Trigger | Properties | Consent | Destination |
|-------|---------|-----------|:-------:|-------------|
| `landing_viewed` | Landing render | `authState` | Yes (analytics) | Product analytics |
| `login_started` | SSO provider click | `provider` | Yes | Analytics |
| `login_success` | Session established | `provider`, `isNewUser` | Yes | Analytics + CRM |
| `screenshot_uploaded` | Upload success | `sizeKB` | Yes | Analytics |
| `go_clicked` | GO pressed | `mode(url/screenshot)`, `tier` | Yes | Analytics |
| `audit_started` | `POST /audits` 202 | `mode`, `creditsCost` | Yes | Analytics |
| `audit_cancelled` | Cancel on M01 | `elapsedSec` | Yes | Analytics |
| `audit_completed` | Status COMPLETED | `score`, `durationSec` | Yes | Analytics (activation KPI) |
| `audit_failed` | Status FAILED | `code` (taxonomy) | Yes | Analytics + alerting |
| `report_viewed` | M02 render | `tier` | Yes | Analytics |
| `pdf_downloaded` | PDF fetch | `auditId` | Yes | Analytics |
| `upgrade_clicked` | Subscribe / upgrade | `fromTier`, `toTier` | Yes | Analytics (conversion) |
| `payment_succeeded` | Webhook confirmed | `tier`, `amount` | Yes | Analytics + revenue |
| `subscription_renewed` | Renewal webhook | `tier` | Yes | Revenue/retention |
| `credits_purchased` | Top-up webhook | `pack`, `amount` | Yes | Revenue |
| `notification_opened` | Open notification | `type` | Yes | Analytics |
| `logout` | Logout | — | Yes | Analytics |

> **Consent:** fire analytics **only after** cookie/consent acceptance (SCREEN-M12). Payment/audit **operational** events may be server-logged regardless, but marketing/analytics destinations require consent (GDPR/CCPA, PRD §8.3).

## API Mapping (per screen)

| Screen | Endpoint(s) | Auth | Key request | Success | Failure | Retry | Timeout | Caching / RL |
|--------|-------------|------|-------------|---------|---------|-------|---------|--------------|
| 001 Landing | `POST /uploads/sign`, `POST /audits` | Guest→session | `{SCREENSHOT, keys[]}` | `202 audit` | 400/403/422/429 | Idem-Key | 10–30s | RL guest+IP |
| 003 SSO | Supabase OAuth | PKCE | provider | session | denied/timeout | re-click | provider | RL auth |
| 004 Home | `GET /me`,`GET /credits`,`POST /audits` | Bearer | as 001 | data/202 | 401/403/422 | Idem-Key | 10s | cache me 30s |
| 005 Manage Plan | `GET /membership`,`POST /billing/checkout` | Bearer | `{tier,interval}` | `{checkoutUrl}` | 400/409 | Idem-Key | 10s | catalog static |
| 006 Payment | provider intent + webhook | Bearer+token | tokenized | intent ok | declined/3DS | new intent | ~120s OTP | RL |
| 009 Pro Home | `POST /audits{URL}` | Bearer | `{URL,websiteUrl}` | `202` | 400/422/429 | Idem-Key | 10s | — |
| 010 Settings | `GET/PATCH /me` | Bearer | `{name,...}` | user | 400 | manual | 10s | — |
| 011 Payment Details | provider tokenize | Bearer+token | token | saved | invalid | manual | 10s | RL |
| 012 History | `GET /audits`, `GET .../report/pdf` | Bearer | cursor | list/URL | 401/404 | manual | 10s | cache page |
| M01 Progress | `GET /audits/{id}/status` + Realtime | Bearer | — | status | 404 | poll/backoff | — | no-cache |
| M02 Report | `GET .../report`,`.../recommendations`,`.../pdf`,`POST .../feedback` | Bearer | — | report | 403/404 | manual | 15s | cache report |

## Design System References

| UI element (in designs) | DS component (`components/ui` + domain) | Tokens |
|---|---|---|
| Buttons (GO, Subscribe, Update Changes, Continue) | `Button` (variants: primary/secondary/outline/disabled) | Primary `#1C018E`, Secondary `#8050E6`, radius md/lg |
| Upload tile | `FileUploader` on `Button`/`Card` | Secondary gradient, radius lg |
| URL field, card fields, name/email | `Input` (+`Label`, error) | Surface `#F8FDFF`, radius md |
| Plan dropdown | `Select` | tokens |
| OTP boxes | `OTPInput` (segmented) | tokens, numeric |
| Plan cards | `PlanCard` / `PricingTable` | Card radius lg, Shadow MD |
| History rows | `Card`/list row + download `Button` (icon) | radius md |
| Recommended / crown | `Badge` / icon | Recommended purple; crown amber `#F59E0B` |
| Success/error chips | inline `Alert`/`Badge` | Success `#16A34A`, Error `#DC2626` |
| Success/Failure modals | `Dialog` + status icon | Success/Error tokens |
| Payment/SSO modals | `Dialog` (Radix) | overlay, radius lg |
| Credits display | `CreditMeter` | Primary text, `infoBody` |
| Typography | Manrope H1 48/700, H2 40/600, Body 24/400, small 18/400, info 12/400 | `DESIGN_TOKENS.md` |
| Spacing / Grid | 8 / 16 / 24 scale | tokens |
| Icons | Lucide + brand SVGs (`public/brand`) | — |

---

# PART D — DELIVERABLE CHECKLISTS

## Engineering Notes (build order)
1. Shell + header (`GET /me`, `GET /credits`, crown/tier), `AuditForm` (shared 001/004/009), `ProfileMenu` (guest/auth).
2. SSO (003) + session/middleware + first-login seeding.
3. **Audit pipeline + M01 Progress + M02 Report** (the current biggest gap) with Realtime/polling contract.
4. Billing: **replace in-app card capture with Stripe Elements/Checkout** (R4); Manage Plan (005) → Payment (006) → Success/Failure (007/008) → webhooks.
5. History (012/013), Account Settings (010/011), Notifications (M04).
6. System/legal screens (M09–M16), consent (M12) before analytics go-live.

## QA Checklist
- [ ] Guest teaser audit + credit decrement (server-authoritative); URL gated for guest/Free.
- [ ] SSO for all three providers incl. Apple private-relay; cancel/denied/popup-blocked.
- [ ] Credit reserve/refund correctness; no double-charge on retry (Idempotency-Key).
- [ ] Each failure taxonomy code renders correct message/recovery/refund.
- [ ] Payment: decline, 3DS/OTP pass+expire+resend, webhook lag ("activating…").
- [ ] URL validation (invalid, SSRF, unreachable); screenshot type/size limits.
- [ ] History grouping, pagination, PDF signed-URL expiry, ownership `404`.
- [ ] Session expiry mid-flow resumes intent; offline banner; 429 handling.
- [ ] Cross-tier access control (report/PDF/top-up) enforced server-side.
- [ ] Card details never sent to Audient servers (PCI); last-4 only after save.

## Accessibility Checklist (WCAG 2.2 AA)
- [ ] Single `<h1>` per screen; landmarks + skip link on authed screens.
- [ ] All modals: `aria-modal`, focus trap, Esc, focus return.
- [ ] Keyboard: upload (not drag-only), OTP paste, menus (roving + Esc), tabs (arrows).
- [ ] `aria-live` for chips, credits, progress (throttled), save/payment status.
- [ ] Contrast: re-check **Warning `#F59E0B`** and disabled gray GO; severity/status = badge fills + text (not color-only).
- [ ] Focus-visible rings; ≥44px targets; `autocomplete` on all form fields.
- [ ] `prefers-reduced-motion` disables gradients/gauge/stage motion.
- [ ] **Accessible (tagged) PDF** export.
- [ ] `lang` attribute; empty-state text contrast (SCREEN-013).

## Future Enhancements
- Merge Free/Pro home into one adaptive home (DRY).
- History filters/search, date ranges, per-audit re-audit & compare.
- Auto-detect competitors; multi-page/scheduled audits.
- Team/seats for Business (Manage Users, Invite Members) + roles.
- Yearly plans + proration; credit-usage forecasts.
- Realtime web-push notifications; in-report "mark as fixed".

## Open Decisions (resolve before/at build)
1. **R4 PCI** — adopt Stripe Elements/Checkout (strongly recommended).
2. **R1** — authoritative Free credit value (100 vs 200/300).
3. **R2** — Business↔ENTERPRISE mapping centralization.
4. **R3** — confirm Apple (drop GitHub) across docs/config.
5. **R5** — design + spec Audit Progress (M01) & Report (M02); add `strengths` to schema.
6. **R6** — duplicate Email field on Account Settings (intent?).
7. Guest model — server-authoritative anonymous credits + abuse controls, or GO-triggers-login.

---
