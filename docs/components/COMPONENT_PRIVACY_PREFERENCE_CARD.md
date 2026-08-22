# COMPONENT — Privacy Preference Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Component ID:** COMPONENT-069 (Privacy Preference Card)  
**Component name:** Privacy Preference Card (`PrivacyPreferenceCard`)  
**Primary screen:** Legal & Privacy (`docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md`)  
**Related:** Consent Status Card — read-only summary of acceptances · Notification Settings Card (`COMPONENT_NOTIFICATION_SETTINGS_CARD.md`) — parallel toggle-list pattern · Cookie banner (SCREEN-M12) — separate CMP entry · Switch primitive (`src/components/ui/switch.tsx`)  
**Figma:** Privacy preferences section on Legal & Privacy — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Switch / Card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock preference state only** — **localStorage** or in-memory acceptable; **no consent backend**, **no Supabase**, **no CMP API**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md` · `docs/components/COMPONENT_LEGAL_NAVIGATION.md` · `src/config/legal-privacy-screen.ts` · `src/utils/legal-privacy-screen.ts`

---

## 1. Purpose

Allows users to **review and manage privacy preferences** on the Legal & Privacy screen.

Users see each preference category, its current **enabled/disabled** state, and can change optional settings. Essential preferences remain always on and are not toggleable.

**Do not redesign.** Match Figma.

---

## 2. Preferences

Three preference categories this phase:

| Preference | Control | Spec |
|------------|---------|------|
| **Essential** | Display only | Required for sign-in, security, and core functionality — **always enabled**; show **Enabled** / **On** text; **no switch** |
| **Analytics** | Accessible toggle | Optional usage measurement to improve the product — default **off** in mock |
| **Product Communications** | Accessible toggle | Optional product news and tips by email — default per mock bundle |

| Rule | Spec |
|------|------|
| Fixed set | Do not invent additional preference rows unless Legal/product adds them |
| Guest | Card **visible** to guests — same controls; mock local storage only |
| Copy | Neutral descriptions — do not invent compliance or certification claims |
| CMP | Full cookie banner (SCREEN-M12) is separate — this card is in-app preferences stub |

### Config mapping (implementation)

| UI label | Suggested internal key |
|----------|------------------------|
| Essential | `essential` (read-only; not in toggle map) |
| Analytics | `analyticsCookies` |
| Product Communications | `emailCommunications` |

Align labels with `LEGAL_PRIVACY_*` constants in `legal-privacy-screen.ts`. Figma copy wins over table above.

---

## 3. Display

Compose on design-system **Card** with section title **Privacy preferences** (or Figma exact title).

| Element | Spec |
|---------|------|
| **Card title** | e.g. Privacy preferences |
| **Intro** | One-line description — changes stored locally in demo only |
| **Preference row** | Label + description + enabled/disabled state + control (where applicable) |
| **Essential row** | Label, description, static **Enabled** / **Always on** — no switch |
| **Analytics row** | Label, description, **On/Off** text + Switch |
| **Product Communications row** | Label, description, **On/Off** text + Switch |
| **Save action** | Primary **Save preferences** button — mock persist + toast |

| Layout | Spec |
|--------|------|
| Row | Label + description left; state text + switch right (stack on narrow) |
| List | `<ul>` of preference rows under card header |

---

## 4. Behaviour

| Preference | Spec |
|------------|------|
| **Essential** | Always **enabled** — display only; cannot be turned off |
| **Analytics** | User may enable or disable via toggle |
| **Product Communications** | User may enable or disable via toggle |

| Rule | Spec |
|------|------|
| State display | Each optional row shows visible **On/Off** (or Yes/No) text — **not color alone** |
| Toggle change | Updates local **draft** state; may fire analytics on change |
| Save | Writes mock prefs to **localStorage** (or parent callback); success toast — **no API** |
| Disabled | Whole card disabled when parent screen is loading |
| Scroll target | Section id used by **Manage privacy preferences** quick action (`#legal-privacy-preferences`) |
| Consent Status | Parent **Consent Status Card** may read updated cookie summary after save |

No server round-trip this phase.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Toggles reflect saved mock prefs; interactive |
| **Saving** | Save in flight; switches and Save button disabled |
| **Saved** | Brief success toast; return to Default |
| **Error** | Optional load/save failure — inline message + Retry |
| **Disabled** | Parent loading — controls inert |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `preferences` | map key → boolean | Yes | Analytics + Product Communications on/off |
| `descriptions` | map key → string | No | Override default descriptions |
| `isGuest` | boolean | No | Analytics context for preferences viewed |
| `disabled` | boolean | No | Whole card (e.g. page loading) |
| `onChange` | (key, enabled) => void | No | Per-toggle callback |
| `onSave` | (preferences) => void | No | After mock persist |
| `onPreferencesChange` | (preferences) => void | No | Notify parent (Consent Status sync) |
| `className` | string | No | |

Parent (`LegalPrivacyScreen`) may pass initial prefs from mock consent bundle; card merges with localStorage on mount.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Controls | Accessible **Switch** for Analytics and Product Communications |
| Essential | Static text conveys always-on state — not a disabled switch (avoid implying user error) |
| Keyboard | Each switch operable (Space/Enter) |
| Screen reader | Toggle state announced (`role="switch"` + `aria-checked` + labelled by label/description) |
| State text | Visible On/Off adjacent to switch — referenced via `aria-describedby` |
| Color | Do **not** rely only on color for on/off |
| Focus | Visible focus on each control and Save button |
| Landmark | Card section with `aria-labelledby` pointing to title |
| Saving | `aria-busy` on card region while saving |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Privacy Preferences Viewed** | Card first enters view / mount | `isGuest` |
| **Privacy Preference Changed** | User toggles Analytics or Product Communications | `preferenceKey`, `value` (boolean) |

Align with SCREEN-024 (`legal-privacy-events.ts`); dev stub only — no PII.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Label/description + switch on one row per preference |
| **Tablet** | Same |
| **Mobile** | Stack description under label; switch aligned end; min **44px** touch target |

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Legal & Privacy Screen** | Composes this card below document viewer |
| **Consent Status Card** | Read-only summary; cookie line may reflect saved Analytics state |
| **Legal Navigation / Legal Document Card** | Unrelated to prefs — same screen |
| **Notification Settings Card** | App notification types — not cookie/email marketing prefs |
| **Cookie banner (M12)** | Site-wide CMP — may deep-link to this section later |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `LEGAL_PRIVACY_PREFERENCE_*` · `LEGAL_PRIVACY_ESSENTIAL_*` · `LEGAL_PRIVACY_COPY` in `legal-privacy-screen.ts` |
| Storage | `LEGAL_PRIVACY_PREFS_STORAGE_KEY` — localStorage demo only |
| Utils | `readLegalPrivacyPreferencesFromStorage()` · `writeLegalPrivacyPreferencesFromStorage()` · `cloneLegalPrivacyPreferences()` |
| Component | `src/components/legal/PrivacyPreferenceCard.tsx` (target); current `LegalPrivacyPreferences.tsx` is refactor candidate |
| Switch | Reuse `Switch` from `src/components/ui/switch.tsx` |
| No | Consent backend · Supabase · CMP API · invented legal claims |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. Suggested descriptions (defaults — Figma wins)

| Preference | Example description |
|------------|----------------------|
| **Essential** | Required for sign-in, security, and core site functionality. Always enabled. |
| **Analytics** | Help us understand how the product is used so we can improve it. Optional. |
| **Product Communications** | Receive occasional product news and tips. You can unsubscribe anytime. |

---

## 13. QA Checklist

□ Essential row shows always enabled — no toggle  
□ Analytics and Product Communications toggles with label, description, On/Off text  
□ Save persists mock prefs locally and shows success toast  
□ Guest and authenticated users can use card  
□ Keyboard accessible switches with visible focus  
□ WCAG 2.2 AA — state not color-only  
□ Analytics: Preferences Viewed, Preference Changed  
□ Manage privacy preferences scroll target works  
□ Mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Consent backend / audit log |
| Supabase persistence |
| Cookie banner implementation (SCREEN-M12) |
| GDPR export / erasure |
| Marketing cookie category (unless Figma adds a fourth row) |
| Pre-checked toggles without user action |

---

**End of COMPONENT_PRIVACY_PREFERENCE_CARD.md**
