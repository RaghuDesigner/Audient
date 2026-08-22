# COMPONENT — Danger Zone Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-049 (Danger Zone Card)  
**Component name:** Danger Zone Card (`DangerZoneCard`)  
**Primary screen:** Settings — Danger Zone (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Delete Confirmation Modal (`COMPONENT_DELETE_CONFIRMATION_MODAL.md`) — reuse confirm dialog pattern · Security / Connected Accounts cards — non-deletion settings · Account deletion API (`DELETE /me`) — **future**, out of scope  
**Figma:** Danger Zone block on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Confirm Dialog / Modal primitives in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock only** — do **not** delete anything. No Supabase · no backend · no real account destruction.  
> **Security:** Never perform destructive operations from the frontend mock.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/components/COMPONENT_DELETE_CONFIRMATION_MODAL.md` · `docs/components/COMPONENT_SECURITY_SETTINGS_CARD.md`

---

## 1. Purpose

Provides **destructive account-management actions**.

Primary action this phase: **Delete Account**.

Reusable on Settings Danger Zone. Does **not** replace Security (sign-out) or Connected Accounts.

**Do not redesign.** Match Figma.

---

## 2. Actions

| Action | Spec |
|--------|------|
| **Delete Account** | Destructive CTA that opens confirmation — never deletes immediately |

---

## 3. Warning

Clearly communicate that account deletion is **destructive**.

| Element | Spec |
|---------|------|
| Intro / warning copy | Visible on the card before the CTA |
| Example | “Deleting your account will permanently remove your Audient account and associated data.” |
| Phase note | During frontend development this is **only a mocked action** — copy may still describe irreversible product behaviour |

Do not soften the warning for mock builds; users must still treat the flow as serious.

---

## 4. Delete Behaviour

```
Click Delete Account
        ↓
Open confirmation dialog
        ↓
User must explicitly confirm
```

| Dialog options | Spec |
|----------------|------|
| **Cancel** | Close dialog · no mock deletion · return focus to trigger |
| **Delete Account** | Confirm intent · run **mock** success path only |

| Rule | Spec |
|------|------|
| Immediate delete | **Forbidden** — always confirm first |
| Real deletion | **Forbidden** this phase |

---

## 5. Confirmation

| Requirement | Spec |
|-------------|------|
| Deliberate | User must explicitly confirm in the dialog |
| Pattern | Reuse Confirm Dialog / Delete Confirmation Modal chrome (title, description, Cancel, destructive confirm) |
| Default focus | **Cancel** (safest) unless Figma specifies otherwise |
| Data | **Do not delete anything** during frontend development — toast / success state only |

| Default dialog copy (Figma wins) | Spec |
|----------------------------------|------|
| Title | Delete account? |
| Description | Deleting your account will permanently remove your Audient account and associated data. This cannot be undone. |
| Confirm | Delete Account |
| Cancel | Cancel |

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Warning + Delete Account CTA enabled |
| **Confirmation** | Dialog open; focus trapped |
| **Processing** | Confirm in progress (mock delay); dialog actions disabled / busy |
| **Success** | Mock success feedback (toast / status); dialog closes; **no** real data loss |
| **Error** | Mock failure message + Retry or dismiss; account remains |

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `warning` | string | No | Override warning / dialog description |
| `state` | `default` \| `confirmation` \| `processing` \| `success` \| `error` | Recommended | |
| `onDeleteConfirm` | action | Yes | Mock handler only — must not call real delete APIs |
| `onCancel` | action | Optional | After cancel |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | CTA and dialog fully operable |

**Confirmation dialog must:**

| Rule | Spec |
|------|------|
| Trap focus | Focus stays inside dialog while open |
| Accessible heading | Dialog title (`aria-labelledby` / DialogTitle) |
| Accessible description | Warning body (`aria-describedby` / DialogDescription) |
| Escape | Dismisses (when not Processing) → Cancelled path |
| Return focus | Restore focus to **Delete Account** trigger |

Also: `aria-busy` while Processing; do not rely only on color for error / success.

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| **Delete Account Initiated** | User activates **Delete Account** on the card (opens confirmation) |
| **Delete Account Cancelled** | Cancel / Escape / dismiss without confirming |
| **Delete Account Confirmed** | User confirms in the dialog (mock path starts) |

No PII in payloads. SCREEN-019 historically fired Initiated on confirm — this card uses Initiated = open intent, Confirmed = confirm click (clearer funnel).

---

## 10. Security

| Rule | Spec |
|------|------|
| Frontend mock | **Never** perform destructive operations from the mock |
| Real deletion | **No** |
| Supabase | **No** user/row deletes |
| Backend | **No** `DELETE /me` this phase |
| Secrets | Do not display tokens or credentials in this flow |

---

## 11. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Warning text + destructive button |
| **Tablet** | Same |
| **Mobile** | Full-width Delete Account; dialog stacked actions; min 44px targets |

---

## 12. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Security Settings Card** | Sign out — not account deletion |
| **Delete Confirmation Modal** | Prefer composing same Modal pattern / reusable confirm chrome |
| **Settings screen** | Compose this card last in Danger Zone section |

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Behaviour | Mock only — success toast / state, stay signed in or mock redirect per product choice (prefer stay + toast unless Figma redirects) |
| No | Supabase · backend · permanent data removal |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Warning clearly describes permanent removal  
□ Delete Account opens confirmation (no immediate delete)  
□ Cancel / Escape / Confirm paths work  
□ States: Default, Confirmation, Processing, Success, Error  
□ Dialog: focus trap, heading, description, Escape, return focus  
□ Analytics: Initiated · Cancelled · Confirmed  
□ No real deletion · no Supabase · no backend  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Real account / billing cancellation pipeline |
| Typed-email confirm (“type DELETE”) unless Figma requires |
| Soft-delete admin tooling |

---

**End of COMPONENT_DANGER_ZONE_CARD.md**
