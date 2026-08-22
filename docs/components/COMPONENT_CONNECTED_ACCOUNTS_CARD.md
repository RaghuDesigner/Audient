# COMPONENT — Connected Accounts Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-048 (Connected Accounts Card)  
**Component name:** Connected Accounts Card (`ConnectedAccountsCard`)  
**Primary screen:** Settings — Connected Accounts (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Security Settings Card — sessions / sign-out · OAuth login buttons — sign-in only, not account linking · Profile Settings Card — identity fields  
**Figma:** Connected Accounts block on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + list / badge patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked connection status only** — do **not** implement real account linking or unlinking.  
> **Auth:** No real OAuth changes · **no** Supabase Auth changes.  
> **Secrets:** Never display tokens, OAuth codes, or provider secrets.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/components/COMPONENT_SECURITY_SETTINGS_CARD.md`

---

## 1. Purpose

Shows which **authentication providers** are connected to the user’s Audient account.

Reusable on Settings Connected Accounts section. Does **not** perform live IdP linking.

**Do not redesign.** Match Figma.

---

## 2. Providers

| Provider | Spec |
|----------|------|
| **Google** | Supported |
| **Apple** | Supported |
| **Microsoft** | Supported |

Align keys with SCREEN-019 / `SETTINGS_AUTH_PROVIDERS` when implementing.

---

## 3. Status

| Status | Spec |
|--------|------|
| **Connected** | Provider is linked to the account (mock) |
| **Not Connected** | Provider is not linked (mock) |

| Rule | Spec |
|------|------|
| Current IdP | Signed-in mock user’s primary provider should show **Connected** |
| Text | Status string or badge — **not color alone** |

---

## 4. Display

Each provider row includes:

| Element | Spec |
|---------|------|
| **Provider Icon** | Brand mark / icon (`aria-hidden` when name is adjacent) |
| **Provider Name** | Google / Apple / Microsoft |
| **Connection Status** | Connected or Not Connected (visible text) |
| **Optional Action** | Connect or Disconnect CTA when Figma shows one |

| Layout | Spec |
|--------|------|
| List | One row per provider under card title **Connected Accounts** |
| Order | Google → Apple → Microsoft (or Figma order) |

---

## 5. Behaviour

| Rule | Spec |
|------|------|
| Data | Display connection status from **mocked** settings / auth bundle |
| Connect | If CTA present: disabled, or toast **“Coming soon”** — **no** real OAuth link |
| Disconnect | If CTA present: disabled, or toast **“Coming soon”** — **no** real unlink |
| No | Real account linking · unlinking · OAuth consent · Supabase Auth identity APIs |

Optional action still fires **Provider Action Clicked** when activated (even if mock / coming soon), so analytics can measure intent.

---

## 6. States

| State | Spec |
|-------|------|
| **Connected** | Row shows Connected + optional Disconnect (mock) |
| **Not Connected** | Row shows Not Connected + optional Connect (mock) |
| **Loading** | Card or rows busy while mock status loads; placeholders / disabled actions |

(Card-level Loading can wrap all rows; per-row loading only if Figma requires.)

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `accounts` | map provider → `connected` \| `not_connected` | Yes | Mock statuses |
| `loading` | boolean | No | Loading state |
| `showActions` | boolean | No | Show Connect / Disconnect CTAs |
| `onProviderAction` | (provider, action) => void | Optional | Mock Connect / Disconnect handler |
| `className` | string | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Rows and optional actions operable |
| Status | Announced / visible text — **do not rely only on color** |
| Icons | Decorative when name present (`aria-hidden`) |
| Loading | `aria-busy` on card region |
| Focus | Visible focus on interactive actions |

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| **Connected Accounts Viewed** | Card / section viewed (aligns with SCREEN-019 **Connected Account Viewed**) |
| **Provider Action Clicked** | User activates Connect or Disconnect (or equivalent) for a provider |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `provider` (google \| apple \| microsoft), `action` (connect \| disconnect) — no tokens / emails |

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Icon + name + status + action on one row |
| **Tablet** | Same |
| **Mobile** | Stack status/action under name; min 44px hit targets |

---

## 11. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Security Settings Card** | Session + sign-out — not link status list |
| **Login / OAuth buttons** | Sign-in only — do not reuse as live linkers here |
| **Settings screen** | Compose this card in Connected Accounts section |

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Source | Mock connected map from settings bundle |
| No | Real OAuth changes · Supabase Auth changes · identity link/unlink APIs |
| Icons | Reuse existing brand assets if present |
| Tokens | Design tokens only — no hardcoded colors |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Google, Apple, Microsoft rows present  
□ Connected / Not Connected statuses (text, not color-only)  
□ Icon + name + status (+ optional action)  
□ Mock data only — no real linking/unlinking  
□ States: Connected, Not Connected, Loading  
□ Analytics: Connected Accounts Viewed · Provider Action Clicked  
□ WCAG 2.2 AA  
□ No OAuth / Supabase Auth changes  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Live OAuth account linking |
| Disconnect confirmation + IdP revoke |
| Additional providers beyond Google / Apple / Microsoft |
| Password / email credential management |

---

**End of COMPONENT_CONNECTED_ACCOUNTS_CARD.md**
