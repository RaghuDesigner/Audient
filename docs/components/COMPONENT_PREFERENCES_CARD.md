# COMPONENT — Preferences Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-045 (Preferences Card)  
**Component name:** Preferences Card (`PreferencesCard`)  
**Primary screen:** Settings — Preferences (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Profile Settings Card (`COMPONENT_PROFILE_SETTINGS_CARD.md`) — profile identity; this card = **app preferences** · ThemeProvider / `useTheme` — Appearance  
**Figma:** Preferences block on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + select / card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Local mock state only** — no backend · no Supabase.  
> **Appearance:** Prefer existing application theme setting (`ThemeProvider` / `useTheme`: light · dark · system). Dark visual skin may remain light until dark tokens ship — preference still stored.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/components/COMPONENT_PROFILE_SETTINGS_CARD.md`

---

## 1. Purpose

Allows users to **manage application preferences**:

| Preference | Spec |
|------------|------|
| **Language** | App UI language |
| **Time Zone** | Display / scheduling timezone |
| **Appearance** | System / Light / Dark |
| **Date Format** | Date display format |

Reusable on Settings Preferences section (and any future Account Settings prefs tab).

**Do not redesign.** Match Figma.

---

## 2. Preferences

### 2.1 Language

| Spec | Detail |
|------|--------|
| Control | Select |
| Options | Supported product languages only (e.g. en / es / fr / de) — align with SCREEN-019 / VAL-SET |
| Default | Product default (typically English) |

### 2.2 Time Zone

| Spec | Detail |
|------|--------|
| Control | Select |
| Options | Curated list (mock IANA subset) — do not invent unsupported zones |
| Default | e.g. America/New_York or user locale mock |

### 2.3 Appearance

| Value | Spec |
|-------|------|
| **System** | Follow OS preference |
| **Light** | Light theme |
| **Dark** | Dark theme preference |

| Rule | Spec |
|------|------|
| Integration | **Use the existing application Appearance setting** (`useTheme` / ThemeProvider) where possible |
| Tokens | Visual output uses design tokens; do not invent a one-off dark palette if `darkPaletteReady` is false |
| Persist | Preference stored with mock settings + theme localStorage via existing provider |

### 2.4 Date Format

| Spec | Detail |
|------|--------|
| Control | Select |
| Options | Supported presets (e.g. MM/DD/YYYY · DD/MM/YYYY · YYYY-MM-DD) |
| Scope | Affects date display in mock UI later; store in mock prefs now |

---

## 3. Display

| Element | Spec |
|---------|------|
| Card chrome | Section title **Preferences** (or Figma label) |
| Four controls | Language · Time Zone · Appearance · Date Format |
| Labels | Visible label per control |
| Actions | Edit / Save / Cancel **or** live-apply + parent Save — **Figma wins** |

Align action model with Profile Settings Card when Figma shows card-level Edit/Save; Settings screen may also use a global Save.

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | View or idle with saved values; Edit available if card-level |
| **Editing** | Controls interactive; Cancel / Save when using edit mode |
| **Saving** | Busy while committing mock state; prevent double submit |
| **Saved** | Success feedback (toast or inline) then Default |
| **Error** | Load or save failure — message + Retry |

---

## 5. Behaviour

| Rule | Spec |
|------|------|
| Storage | **Local mock state** for now (Settings mock store / card draft) |
| Appearance change | Update mock prefs **and** call existing `setTheme` when applying Appearance |
| Cancel | Revert draft to last saved mock snapshot |
| Dirty | Track changes for parent unsaved-leave dialog |
| No backend | Do not call `PATCH /settings` |

**Preference Changed** analytics fires when a control value changes (or on Save with changed keys — prefer per-control change for clarity).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `language` | supported codes | Yes | |
| `timezone` | curated IANA | Yes | |
| `appearance` | `system` \| `light` \| `dark` | Yes | |
| `dateFormat` | supported presets | Yes | |
| `state` | `default` \| `editing` \| `saving` \| `saved` \| `error` | Recommended | |
| `languageOptions` / etc. | lists | Optional | Defaults from shared settings config |
| `onChange` | field updates | Editing | Controlled draft |
| `onSave` | action | When card Save | Persist mock |
| `onCancel` | action | When card Cancel | Revert |
| `onEdit` | action | When card Edit | |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All selects + Edit/Save/Cancel operable |
| Labels | Proper labels (`aria-labelledby` / visible Caption) |
| Visible focus | Required |
| Appearance | Not color-only — text labels System / Light / Dark |
| Saving | `aria-busy` on card |

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Preferences Viewed** | Card / Preferences section shown |
| **Preference Changed** | User changes Language, Time Zone, Appearance, or Date Format |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `preference` (`language` \| `timezone` \| `appearance` \| `dateFormat`), `value` (non-PII codes) |

SCREEN-019 also lists **Preferences Updated** on save — parent Settings may fire that; this card owns Viewed + Changed.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Two-column control grid when Figma allows |
| **Tablet** | Same or stacked pairs |
| **Mobile** | Single-column full-width selects; full-width actions |

---

## 10. Relationship to Siblings

| Component / system | Spec |
|--------------------|------|
| **ThemeProvider** | Appearance source of truth for theme preference |
| **Profile Settings Card** | Separate concern — do not merge |
| **Notification Preferences** | Separate toggles card/section — not this component |
| **Settings screen** | Compose this card in Preferences section |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Source | `getMockSettingsScreen` preferences slice / defaults from settings config |
| No | Backend · Supabase |
| Options | Reuse `SETTINGS_*_OPTIONS` from settings screen config when implementing |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Shared select pattern (billing SelectField / native select + input tokens), Button, toast |
| Appearance | Wire to `useTheme().setTheme` on apply/save |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Language, Time Zone, Appearance, Date Format present  
□ Appearance: System / Light / Dark; uses app theme setting  
□ States: Default, Editing, Saving, Saved, Error  
□ Mock local state only — no backend  
□ Preferences Viewed · Preference Changed analytics  
□ WCAG 2.2 AA · keyboard · labels · focus  
□ Desktop / Tablet / Mobile  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full IANA timezone database |
| Runtime i18n string catalogs (store preference only this phase) |
| Notification preference toggles |
| Server persistence |

---

**End of COMPONENT_PREFERENCES_CARD.md**
