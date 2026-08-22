# COMPONENT-001 — Guest Profile Dropdown

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-001  
**Component name:** Guest Profile Dropdown (`ProfileDropdownGuest`)  
**Screen mapping:** SCREEN-002 (Guest Profile Dropdown)  
**Figma:** Guest menu state over Landing (`Screen1` guest menu / approved Figma frame)  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/HOME_SCREEN.md` · `docs/components/LOGIN_MODAL.md` (COMPONENT-002) · `docs/LOGIN_MODAL.md` · `docs/SCREEN_MAPPING.md` (SCREEN-002) · `docs/COMPONENT_BEHAVIOR.md` (BTN-013) · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md`

---

## Purpose

This component is displayed when a **Guest User** clicks the **Profile Avatar** in the application header.

It informs the user which features are available only after authentication while providing a clear **Login** entry point.

This component must **exactly match the approved Figma design**.

**Do not redesign.**

---

## Source of Truth

| Rule | Spec |
|------|------|
| Source | **Approved Figma** |
| Visual match | Pixel-perfect implementation required |
| No creative interpretation | — |
| No spacing / typography / color changes | Tokens only as coded expression of Figma |
| No icons | Unless explicitly shown in Figma — **this menu has no icons** |
| No separators | Unless shown in Figma |

If Figma and older docs conflict on layout/visuals, **Figma wins**.  
If copy conflicts (e.g. tooltip wording), **this COMPONENT-001 brief wins** unless Figma shows different label text on-canvas.

---

## User Type

| Type | Spec |
|------|------|
| **Guest User** | Only audience for this component variant |

Authenticated users use a separate profile menu (SCREEN-004 / authenticated dropdown) — **not** this component’s enabled item set. Do not enable restricted items for guests.

---

## Trigger

| Action | Result |
|--------|--------|
| Click **Profile Avatar** (guest) | Open **Guest Profile Dropdown** below the avatar |

Trigger control: header avatar button (`BTN-013` — Avatar Menu Trigger).  
Trigger must expose `aria-haspopup="menu"` and `aria-expanded` reflecting open/closed.

---

## Behaviour

| Behaviour | Spec |
|-----------|------|
| Placement | Dropdown **below the avatar** (anchored per Figma) |
| Remains open | While interacting with the menu (hover/focus within menu) |
| Closes when | User **clicks outside** |
| Closes when | User presses **Escape** |
| Closes when | User selects **Login** |
| After Login select | Close dropdown → open **Login Modal** (MDL-001) — **no page navigation** |
| Focus on close | Return focus to the Profile Avatar trigger |

---

## Menu Items

Order is fixed as below. Labels match Figma.

### 1. Login

| Aspect | Spec |
|--------|------|
| State | **Enabled** |
| Cursor | Pointer |
| Hover | Yes (per Figma hover style) |
| Click / Activate | Opens **Login Modal** |
| Keyboard | Enter (and Space if menu pattern requires) activates Login |

### 2. Profile

| Aspect | Spec |
|--------|------|
| State | **Disabled** |
| Text | Grey text |
| Hover | No |
| Click | No (no-op) |
| Cursor | Default |
| Tooltip | Login required |

### 3. History

| Aspect | Spec |
|--------|------|
| State | **Disabled** |
| Text | Grey text |
| Hover | No |
| Click | No (no-op) |
| Cursor | Default |
| Tooltip | Login required |

### 4. Manage Plan

| Aspect | Spec |
|--------|------|
| State | **Disabled** |
| Text | Grey text |
| Hover | No |
| Click | No (no-op) |
| Cursor | Default |
| Tooltip | Login required |

### 5. Account Settings

| Aspect | Spec |
|--------|------|
| State | **Disabled** |
| Text | Grey text |
| Hover | No |
| Click | No (no-op) |
| Cursor | Default |
| Tooltip | Login required |

**Do not enable** Profile, History, Manage Plan, or Account Settings for guests.

---

## Visual Specification

| Aspect | Spec |
|--------|------|
| Background | White |
| Corners | Rounded (radius per Figma) |
| Shadow | Subtle shadow (per Figma) |
| Icons | **None** |
| Separators | **None** unless shown in Figma |
| Spacing | Exactly matches Figma |
| Typography | Exactly matches Figma |
| Disabled items | Grey text; not color-only meaning — also `aria-disabled` / non-interactive |

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| Keyboard accessible | Yes |
| Arrow navigation | Up/Down within enabled focusables; roving tabindex / menu pattern |
| Enter | Activates **Login** when focused |
| Disabled items | **Skipped** during keyboard navigation |
| Escape | Closes dropdown; focus returns to avatar |
| ARIA | `role="menu"` on container |
| ARIA | `role="menuitem"` on items (Login enabled; disabled items `aria-disabled="true"` or omitted from tab order per pattern — prefer present in DOM for discoverability with `aria-disabled`) |
| Tooltips | Disabled items expose “Login required” to pointer users; ensure equivalent for AT (e.g. accessible name/description includes login required) |
| Focus visible | Visible focus ring on Login / trigger |
| Standard | **WCAG 2.2 AA** |

**Note:** If disabled items are skipped for keyboard nav, they remain **visible** in the menu so guests understand gated features. Pointer on disabled items does not activate; tooltip still may show on hover/focus if focusable for tooltip — prefer **not** focusing disabled items; show tooltip on hover only for pointer users, and include “Login required” in accessible description if items remain in the accessibility tree.

---

## Analytics

| Event | Trigger |
|-------|---------|
| Guest Menu Opened | Dropdown opens (`guest_menu_opened` / equivalent) |
| Guest Menu Closed | Dropdown closes (outside, Esc, Login, or other dismiss) |
| Login Clicked | Login activated (`guest_login_clicked` / Login Clicked) |

Optional (if product wants discoverability metrics): disabled-item click attempts — not required by this brief.

Align names with `ANALYTICS.md` where aliases exist.

---

## Navigation

| Action | Destination |
|--------|-------------|
| **Login** | Open **Login Modal** |
| | **No page navigation** |
| Disabled items | Stay on current page; menu may stay open or ignore — **no navigation** |
| Outside / Escape | Close menu; stay on current page |

---

## Component Structure

| Piece | Role |
|-------|------|
| **ProfileDropdownGuest** | Root guest menu (panel + items + open/close behaviour) |
| **MenuItem** | Enabled item (Login) |
| **DisabledMenuItem** | Restricted items (Profile, History, Manage Plan, Account Settings) with grey styling + “Login required” tooltip |

Trigger avatar lives in the header (shared layout); it is not redesigned here.

---

## States

| State | Behaviour |
|-------|-----------|
| Closed | Default; `aria-expanded=false` |
| Open | Panel visible below avatar; focus moves into menu (Login) |
| Login hover / focus | Enabled item highlight per Figma |
| Closed via outside | Panel dismissed |
| Closed via Escape | Panel dismissed; focus → avatar |
| Closed via Login | Panel dismissed → Login Modal opens |

No loading or error states for this menu itself.

---

## Responsive

| Surface | Spec |
|---------|------|
| Desktop / tablet | Dropdown anchored below avatar per Figma |
| Mobile | Maintain same items, hierarchy, and behaviour; placement/sizing per Figma mobile frame if provided — **do not invent** a different IA or add icons |

---

## Development Rules

| Rule | |
|------|--|
| Do not redesign | |
| Do not change spacing | |
| Do not change typography | |
| Do not add icons | |
| Do not enable restricted items | |
| Do not put OAuth providers in this menu | Login opens Login Modal only |
| Implement exactly as designed in Figma | |

---

## QA Checklist (COMPONENT-001)

□ Visual match to Figma (white panel, radius, shadow, spacing, type)  
□ No icons; no extra separators  
□ Avatar click opens dropdown below avatar  
□ Closes on outside click, Escape, and Login  
□ Login → Login Modal; no route change  
□ Profile / History / Manage Plan / Account Settings disabled, grey, no hover activate, cursor default  
□ Tooltip “Login required” on disabled items  
□ Keyboard: arrows, Enter on Login, disabled skipped, Esc closes, focus returns to avatar  
□ `menu` / `menuitem` ARIA; focus visible  
□ Analytics: opened, closed, Login clicked  
□ WCAG 2.2 AA  

---

## Developer Notes

1. Prefer composing with a shared profile-menu shell used later for authenticated menus, but **guest item enablement and copy must match this spec** — do not share enabled sets with Free/Pro menus.  
2. Login Modal is a separate overlay (`LOGIN_MODAL.md`); closing the dropdown must complete before or as the modal opens without leaving a stuck focus trap.  
3. HOME_SCREEN Avatar behaviour: **Avatar → Guest Profile Dropdown** (this component); **Login → Login Modal** — not Avatar → Login Modal directly.  
4. Do not navigate to `/sign-in` or inline SSO on the Landing page from this menu.

---

**End of COMPONENT-001 / PROFILE_DROPDOWN_GUEST.md**
