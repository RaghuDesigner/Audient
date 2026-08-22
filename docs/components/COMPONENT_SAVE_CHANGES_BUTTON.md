# COMPONENT — Save Changes Button

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-050 (Save Changes Button)  
**Component name:** Save Changes Button (`SaveChangesButton`)  
**Primary screen:** Settings (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Profile / Preferences / Notification Settings Cards — may own local Save or feed dirty into this control · Cancel (pair control) — discard unsaved · Unsaved changes dialog — leave-guard  
**Figma:** Save Changes control on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Button patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked save behaviour only** — no backend · no Supabase.  
> **Reuse:** Compose on existing primary `Button` primitive (`isLoading`, disabled, focus ring).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/components/COMPONENT_PROFILE_SETTINGS_CARD.md` · `docs/components/COMPONENT_PREFERENCES_CARD.md`

---

## 1. Purpose

Provides a **consistent primary action for saving Settings changes**.

Reusable across Settings sections (global footer Save and/or section-level Save when Figma shows either).

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Button** | Primary variant (design-system primary) |
| **Label** | **Save Changes** (or Figma exact string) |
| **Loading label** | Optional “Saving…” while busy — keep accessible name clear |

Pair with Cancel when Settings shows both; Cancel is out of scope for this component (separate control).

---

## 3. States

| State | Spec |
|-------|------|
| **Default** | Enabled appearance when dirty (unsaved changes exist) |
| **Hover** | Hover styles from Button primitive |
| **Focused** | Visible focus ring (keyboard) |
| **Pressed** | Active / pressed styles |
| **Loading** | Save in progress; disabled interaction; busy indicator |
| **Disabled** | No unsaved changes (or parent forbids save) |
| **Success** | Brief confirmation after mock save (toast and/or label flash / live region) |
| **Error** | Save failed; button returns to Enabled (dirty) or Error affordance + parent message |

---

## 4. Behaviour

| Condition | Spec |
|-----------|------|
| **Disabled** | No changes have been made (`dirty === false`) |
| **Enabled** | Unsaved changes exist (`dirty === true`) |
| **Loading** | Settings are being saved (mock persist in flight) |
| **Success** | Display save confirmation (e.g. “Settings saved successfully.”) |

| Flow | Spec |
|------|------|
| Click (enabled) | Fire **Save Changes Clicked** → enter Loading → call parent mock `onSave` |
| Mock success | Clear dirty (parent) → **Settings Save Completed** → Success feedback → return to Disabled (clean) |
| Mock failure | **Settings Save Failed** → Error feedback → return to Enabled (still dirty) |
| Validation fail | Parent may block save; button stays Enabled; errors shown on fields — not toast-only |

| Rule | Spec |
|------|------|
| Persist | Mock settings store only |
| Backend | **No** |
| Idempotency | Ignore clicks while Loading |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `dirty` | boolean | Yes | Unsaved changes exist |
| `loading` / `state` | boolean or enum | Recommended | Loading / success / error override |
| `disabled` | boolean | No | Extra disable (e.g. invalid form) |
| `onSave` | action | Yes | Mock save handler |
| `label` | string | No | Override “Save Changes” |
| `className` | string | No | |

Parent owns dirty computation and mock persistence.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Activatable with Enter / Space |
| Focus | **Visible** focus indicator |
| Loading | Must be **announced** (`aria-busy`, and/or live region / `aria-live` for “Saving…”) |
| Disabled | `disabled` or `aria-disabled` with clear unavailable state |
| Success / Error | Status announced (toast live region or `role="status"` / `role="alert"`) |
| Color | Do not rely only on color for success / error |

---

## 7. Analytics

| Event | Trigger |
|-------|---------|
| **Save Changes Clicked** | User activates the button while enabled |
| **Settings Save Completed** | Mock save succeeds |
| **Settings Save Failed** | Mock save fails |

No PII (emails, names) in payloads.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Inline with Cancel / toolbar |
| **Tablet** | Same |
| **Mobile** | Full-width primary when stacked; min 44px hit target |

---

## 9. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Settings screen** | Global or section Save — compose this button |
| **Profile / Preferences cards** | May use card-local Save instead; this component for shared Settings chrome |
| **Cancel** | Sibling discard control — not part of this component |

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Save | Mocked behaviour only |
| No | Backend · Supabase settings API |
| Button | Reuse existing `Button` primary + `isLoading` |
| Tokens | Design tokens only |
| Reusable | Across Settings sections |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Disabled when no changes; Enabled when dirty  
□ Loading shows busy + announced  
□ Success confirmation after mock save  
□ Error path restores Enabled / shows failure  
□ Hover / Focus / Pressed via design-system Button  
□ Analytics: Clicked · Completed · Failed  
□ WCAG 2.2 AA — keyboard + visible focus  
□ No backend  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Cancel button implementation |
| Unsaved-changes leave dialog |
| Field validation UI (parent / inputs) |

---

**End of COMPONENT_SAVE_CHANGES_BUTTON.md**
