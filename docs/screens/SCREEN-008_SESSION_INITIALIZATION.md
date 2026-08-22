# SCREEN-008 — Session Initialization

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Auth · QA  

**Screen ID:** SCREEN-008 (product brief)  
**Screen name:** Session Initialization  
**Prior step:** Successful OAuth (Google / Apple / Microsoft) via Login Modal / OAuth callback  
**Next screen:** Authenticated Dashboard = **Logged-in Home** (Free SCREEN-004 or Pro/Business SCREEN-009), or **resume intent** when set  
**Figma:** Session / workspace loading interstitial when designed; until then follow this copy and centered layout — **do not invent app chrome**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING.md` uses **SCREEN-008** for the **Payment Success Modal**. This document is the **post-OAuth session bootstrap** interstitial. Prefer a dedicated id (e.g. SCREEN-M16-adjacent / AUTH-INIT) when renumbering.  
> **“Dashboard”:** Product language for authenticated Home — not a separate unimplemented route name unless `/dashboard` is later aliased (`LOGIN_MODAL.md`).

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/SECURITY.md` · `STATE_MANAGEMENT.md` (`AUTH-STATE-*`, `APP-STATE-*`) · `docs/ANALYTICS.md` · `docs/LOGIN_MODAL.md` · `docs/components/LOGIN_MODAL.md` · `docs/PRICING.md` · `docs/ACCESSIBILITY.md`

---

## 1. Purpose

This screen appears **immediately after a successful OAuth login**.

Its purpose is to **initialize the authenticated user session** before navigating to the authenticated dashboard (Home), including:

- Validate authentication  
- Load user profile  
- Load membership plan  
- Load remaining credits  
- Load user preferences  
- Initialize application state  
- Optionally claim a prior guest audit and load recent audits  

Users must not interact with gated app chrome until hydration succeeds (or fails gracefully).

---

## 2. Business Goals

| Goal | Spec |
|------|------|
| Validate authentication | Confirm Supabase/session cookies + server identity before treating UI as authed |
| Load user profile | Name, email, avatar, settings (`GET /me` or equivalent) |
| Load membership plan | Tier + status (`FREE` / `PRO` / `ENTERPRISE`·Business, ACTIVE/PAST_DUE, etc.) |
| Load remaining credits | Server-authoritative balance (`GET /credits` / embedded in `/me`) |
| Load user preferences | Settings (notifications, locale, etc.) |
| Initialize application state | Move `APP-STATE` / auth store from loading → ready (`STATE_MANAGEMENT.md`) |
| Guest continuity | Claim guest screenshot audit when applicable (non-blocking if claim fails) |
| First-time seed | Server seeds Free + **300** credits + Settings on first login (`PRICING.md` / LOGIN_MODAL) |

---

## 3. Layout

| Rule | Spec |
|------|------|
| Composition | **Centered** loading experience on a full-viewport surface |
| Headline | **Preparing your workspace...** |
| Subtitle | **We're securely loading your account and latest audit data.** |
| Show | **Animated loader** · **Progress text** (current loading step) · **Audient logo** |
| Do **not** show | Navigation, header credits/avatar chrome, sidebar, audit form, or Login Modal |

Background/atmosphere: match brand tokens / Figma if provided; keep focus on loader + copy. No marketing sections.

---

## 4. Loading Steps

Progress text advances through these steps (forward-only; do not jump backwards). Map steps to real work; coalesce if APIs batch.

| # | Progress text |
|---|----------------|
| 1 | Authentication successful |
| 2 | Creating secure session |
| 3 | Loading user profile |
| 4 | Loading membership |
| 5 | Loading available credits |
| 6 | Loading recent audits |
| 7 | Preparing dashboard |
| 8 | Redirecting |

| Rule | Spec |
|------|------|
| Display | Show current step as progress text under the loader |
| Timing | Steps may complete quickly; avoid artificial long delays in production; mocks may pace for QA |
| A11y | Announce step changes via **throttled** polite live region (not every millisecond) |
| Reduced motion | Static logo + text steps; loader may be non-animated spinner alternative |

---

## 5. Entry / Exit

### 5.1 Entry

```text
OAuth provider success
        ↓
Session cookies / tokens set (httpOnly, Secure, SameSite — SECURITY.md)
        ↓
Session Initialization (this screen)
```

Also valid after OAuth **redirect callback** lands in-app (full-page return), not only in-modal flows.

Fire **Login Success** when auth is server-confirmed (may fire at step 1–2; **dedupe** once per login).  
Fire **Session Started** when bootstrap begins or when session is established (align with `ANALYTICS.md` / `session_id`).

### 5.2 Success

| Rule | Spec |
|------|------|
| Navigate | **Automatically** to Authenticated Dashboard |
| Destination | Free Home (SCREEN-004) or Pro/Business Home (SCREEN-009) by membership |
| Resume intent | If Login Modal stored intent (URL audit, Upgrade, History, guest claim continue), prefer that destination after hydrate (`LOGIN_MODAL.md` § resume) |
| Analytics | **Dashboard Loaded** when destination Home (or resumed screen) is ready |
| Clear intent | Clear resume intent after successful navigation to avoid stale redirects |

### 5.3 Failure

| Rule | Spec |
|------|------|
| UI | Friendly error on the same chrome-less surface (replace loader) |
| Message | Plain language (e.g. couldn’t load your account) — no stack traces |
| **Retry** | Re-run bootstrap steps 2–8 (session already may exist) |
| **Back to Home** | Navigate to public Landing (Guest Home SCREEN-001); sign out locally if session is unusable |
| Analytics | **Session Failed** with `reason` |
| Security | Do not leave a half-hydrated authed shell with spoofable credits |

---

## 6. Technical Bootstrap (product contract)

| Step | Backend / auth concern |
|------|-------------------------|
| Auth validate | Session JWT/cookie verified server-side |
| Secure session | Refresh/rotate as needed; no tokens in `localStorage` for access (`SECURITY.md`) |
| Profile | `GET /me` |
| Membership | Membership tier/status (via `/me` or `GET /membership`) |
| Credits | Server balance only — never trust client |
| Preferences | Settings on user |
| Recent audits | Lightweight list for Home/History teaser (optional if slow — do not block forever; timeout → Failure or proceed with empty recent) |
| Guest claim | Attach prior guest audit when cookie/session allows |
| RLS | Subsequent queries scoped to `auth.uid()` |

**Providers (product):** Google · Apple · Microsoft only — ignore outdated SECURITY mentions of password/GitHub for this product UI.

---

## 7. States

| State | Behaviour |
|-------|-----------|
| Loading | Logo + loader + headline/subtitle + advancing progress text |
| Success redirect | Brief “Redirecting” then navigate |
| Error | Friendly error + Retry + Back to Home |
| Offline | Error or offline message; Retry when online |

Map to auth loading → success → Authed Home in `STATE_MANAGEMENT.md` (insert this interstitial between AuthSuccess and AuthedHome).

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| **ARIA live region** | Polite updates for progress text / completion / errors (assertive on failure) |
| Status | Loader region `aria-busy="true"` while loading; announce headline |
| Keyboard | Retry and Back to Home operable on failure; no focus trap that blocks recovery |
| **Reduced motion** | Honor `prefers-reduced-motion` — no essential info only in animation |
| Focus | On error, move focus to error heading or Retry |

---

## 9. Analytics

| Brief event | Canonical / notes |
|-------------|-------------------|
| **Login Success** | `login_success` — once per successful OAuth + session (`isNewUser`, `provider`) |
| **Session Started** | Session/bootstrap start — include `session_id`; alias `session_restored` only for cold restore if distinct |
| **Session Failed** | Bootstrap failure — `reason` |
| **Dashboard Loaded** | Authenticated Home (or resumed destination) interactive — `tier`, `home_viewed` / equivalent |

Do not double-fire `login_success` from both Login Modal and this screen — **one** canonical emission after server-confirmed session.

---

## 10. Security

| Rule | Spec |
|------|------|
| Cookies | httpOnly, Secure, SameSite session handling |
| Hydration | Entitlements and credits from server only |
| No nav chrome | Prevents acting on stale guest UI while authed cookies exist |
| Failure | Safe return to Guest Home; clear bad client state |
| Seeding | First user seed via auth hook/trigger server-side (`SECURITY.md`) |

---

## 11. Developer Notes

| Rule | Spec |
|------|------|
| Phase 1 | **Mocked** step progression + fake profile/membership/credits → navigate to Authed Home stub |
| Phase 2 | **Supabase Auth** callback + real `GET /me`, credits, membership, settings, recent audits |
| Timeout | Bound total wait; then Failure with Retry |
| Resume | Read post-login intent from secure client store set before OAuth |
| Minimal UI | No AppShell nav on this screen |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. Navigation Summary

```text
OAuth success
        ↓
Session Initialization (SCREEN-008)
        ├─ success → Authenticated Dashboard (Home) or resume intent
        └─ failure → Retry | Back to Home (Landing)
```

---

## 13. QA Checklist

□ Appears immediately after successful OAuth  
□ Centered loader, logo, exact headline/subtitle  
□ No navigation chrome  
□ Progress text walks steps 1–8 (forward-only)  
□ Success auto-navigates to Free/Pro Home or resume intent  
□ First login seeds Free 300 (server); guest claim when applicable  
□ Failure: friendly error, Retry, Back to Home  
□ Live region + reduced motion  
□ Analytics: login_success (once), session started/failed, dashboard loaded  
□ Mock path works; API path ready  
□ Credits never invented client-side  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Payment Success Modal (other SCREEN-008 in mapping) |
| Full Results / audit processing UI |
| OAuth provider buttons (Login Modal) |
| Editable profile on this screen |

---

**End of SCREEN-008 / SCREEN-008_SESSION_INITIALIZATION.md**
