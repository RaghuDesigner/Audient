# Audient — Accessibility Specification (WCAG 2.2 AA)

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** SCREEN_MAPPING.md · COMPONENT_MAPPING.md · COMPONENT_BEHAVIOR.md · DESIGN_TOKENS.md · STATE_MANAGEMENT.md · VALIDATION_RULES.md · ERROR_HANDLING.md · prd.md · CURSOR_RULES.md

**Audience:** Product · UX · Frontend · QA · Design  
**Format:** Markdown only — **no application code**.

**Source of truth:** uploaded Figma screens (`Screens/Screen*.png`) + SCREEN_MAPPING accessibility sections.  
**Do not redesign** layouts, copy hierarchy, or visual language from designs.  
**Note:** `DESIGN_SYSTEM.md` is not in-repo; tokens and component contracts below come from `DESIGN_TOKENS.md`, COMPONENT_MAPPING, and SCREEN_MAPPING.

**Compliance target:** **WCAG 2.2 Level AA** (product standard). CURSOR_RULES historically cites 2.1 AA — treat **2.2 AA** as authoritative for Audient (includes 2.2 additions such as Focus Not Obscured, Dragging Movements, Target Size Minimum, Consistent Help where applicable).

---

## 1. Accessibility Goals

| Goal | Why |
|------|-----|
| Ship an **accessible UX-audit product** | Audient audits accessibility for customers; the app must exemplify AA. |
| Keyboard-complete critical paths | Landing → audit → report → PDF; SSO; billing; settings. |
| Perceivable status & errors | Never color-only; live regions for async outcomes. |
| Operable touch & pointer | ≥44×44 px targets; upload not drag-only. |
| Understandable forms | Visible labels, linked errors, autocomplete where required. |
| Robust semantics | Prefer native HTML + Radix/shadcn primitives; ARIA only when needed. |
| Respect user preferences | `prefers-reduced-motion`, system contrast where feasible. |
| Accessible exports | Tagged PDF for Pro/Business reports. |

**Non-goals:** Do not invent alternate UIs, dark-mode skins not in Figma, or accessibility features that change product scope (e.g. teams). Document gaps as **verify / fix in implementation** without redesigning screens.

---

## 2. WCAG 2.2 AA Checklist (Product-Wide)

Use this as the merge-gate checklist. Map failures to screen IDs and component IDs (BTN-*, INP-*, MDL-*).

### Perceivable

| Criterion | Audient requirement |
|-----------|---------------------|
| 1.1.1 Non-text Content | Logo meaningful name; decorative icons `aria-hidden`; upload preview `alt`; report annotations described in text + `alt`. |
| 1.3.1 Info and Relationships | Single `<h1>` per screen; lists for History; tabs/tabpanels; dialogs labeled. |
| 1.3.2 Meaningful Sequence | DOM order = visual reading order (header → main → dialogs). |
| 1.3.3 Sensory Characteristics | Instructions never “click the purple button only” — use names (“GO”, “Subscribe”). |
| 1.3.4 Orientation | Support portrait & landscape; no locked orientation required. |
| 1.3.5 Identify Input Purpose | `autocomplete` on name, email, payment (`cc-*`), OTP (`one-time-code`). |
| 1.4.1 Use of Color | Severity, chips, gates = **text + icon + color**. |
| 1.4.3 Contrast (Minimum) | Text ≥ **4.5:1**; large text ≥ **3:1** (see §3). |
| 1.4.4 Resize Text | Usable at 200% zoom without loss of GO/upload/checkout. |
| 1.4.5 Images of Text | UI copy is real text (not baked into images), except brand marks. |
| 1.4.10 Reflow | At 320 CSS px width, content stacks; no 2D scroll for primary tasks. |
| 1.4.11 Non-text Contrast | Focus rings, input borders, GO/Upload chrome ≥ **3:1** vs adjacent. |
| 1.4.12 Text Spacing | Honor user agent spacing; do not clip labels/errors when spacing increases. |
| 1.4.13 Content on Hover/Focus | Tooltips dismissible (Esc), hoverable, persistent until dismiss. |

### Operable

| Criterion | Audient requirement |
|-----------|---------------------|
| 2.1.1 Keyboard | All actions via keyboard (upload picker, menus, tabs, OTP, dialogs). |
| 2.1.2 No Keyboard Trap | Only intentional trap inside `aria-modal` dialogs; Esc + close escape. |
| 2.1.4 Character Key Shortcuts | No single-character app shortcuts in v1. |
| 2.2.1 Timing Adjustable | OTP/3DS countdowns announced; user can complete or resend when allowed. |
| 2.2.2 Pause, Stop, Hide | Progress stage motion optional; no auto-updating carousel in designs. |
| 2.4.1 Bypass Blocks | Skip link to main on authenticated shells (§21). |
| 2.4.2 Page Titled | Unique document titles (e.g. “Manage Plan · Audient”). |
| 2.4.3 Focus Order | Matches SCREEN_MAPPING tab orders (§23). |
| 2.4.4 Link Purpose | History rows / PDF actions have discernible names. |
| 2.4.5 Multiple Ways | N/A for simple SPA flows; History + Home entry points for reports. |
| 2.4.6 Headings and Labels | Descriptive H1/H2; visible field labels. |
| 2.4.7 Focus Visible | `:focus-visible` ring on all interactive controls (§5). |
| 2.4.11 Focus Not Obscured (Minimum) | Sticky headers/CTAs must not fully hide focused controls (2.2). |
| 2.5.1 Pointer Gestures | Upload via button/file input — **not drag-only** (2.2 Dragging Movements). |
| 2.5.2 Pointer Cancellation | Click/tap activates on up; Esc cancels dialogs. |
| 2.5.3 Label in Name | Accessible name contains visible text (e.g. “GO”, “Login with Google”). |
| 2.5.4 Motion Actuation | No device-motion required features. |
| 2.5.7 Dragging Movements | Provide non-drag alternative for upload (2.2). |
| 2.5.8 Target Size (Minimum) | Interactive targets ≥ **24×24 CSS px** (2.2); product standard **≥44×44** (§20). |

### Understandable

| Criterion | Audient requirement |
|-----------|---------------------|
| 3.1.1 Language of Page | `<html lang="en">` (extend when language prefs ship). |
| 3.2.1 On Focus | Focus does not submit payment or start audit. |
| 3.2.2 On Input | Changing plan select updates price text; does not charge until CTA. |
| 3.3.1 Error Identification | Field errors identified in text (VALIDATION_RULES). |
| 3.3.2 Labels or Instructions | Visible labels; OTP/payment instructions. |
| 3.3.3 Error Suggestion | Actionable copy from ERROR_HANDLING / VALIDATION_RULES. |
| 3.3.4 Error Prevention (Legal/Financial) | Confirm payment CTA; Stripe Elements; reversible where product allows. |

### Robust

| Criterion | Audient requirement |
|-----------|---------------------|
| 4.1.1 Parsing | Valid DOM via React; no duplicate IDs. |
| 4.1.2 Name, Role, Value | Buttons, dialogs, menus, tabs, progressbars expose correct roles/states. |
| 4.1.3 Status Messages | Use `aria-live` / `role="status"` / `role="alert"` — not focus-only (§10). |

---

## 3. Colour Contrast Requirements

### Design tokens (reference)

| Token | Hex | Typical use |
|-------|-----|-------------|
| Primary | `#1C018E` | Brand, headings, primary actions |
| Secondary | `#8050E6` | Accents, Pro GO fill, upload tile |
| Success | `#16A34A` | Success chips/modals |
| Warning | `#F59E0B` | Warning badges / crown-adjacent |
| Error | `#DC2626` | Errors, failed chips |
| Background | `#FFFFFF` | Page |
| Surface | `#F8FDFF` | Inputs / cards |

### AA ratios

| Content | Minimum |
|---------|---------|
| Body / smallBody / infoBody text | **4.5:1** vs background |
| Large text (≥18pt/24px regular or ≥14pt/18.66px bold) | **3:1** |
| UI components & graphical objects (borders, icons conveying meaning, focus ring) | **3:1** |
| Disabled controls | Convey with `disabled` / `aria-disabled` semantics; text may be exempt from 1.4.3 but **non-text** chrome should remain perceivable; prefer not relying on white-on-mid-gray alone for **enabled** CTAs |

### Known verify-before-ship (from designs / SCREEN_MAPPING)

| Issue | Screens | Action |
|-------|---------|--------|
| Disabled/gray **GO** + white label | SCREEN-001 | Ensure disabled uses semantics; when enabled (Pro purple GO), verify white on Secondary ≥4.5:1 |
| Light gray instructional copy / empty History text | SCREEN-001, SCREEN-013 | Measure gray on `#FFFFFF`; darken token if &lt;4.5:1 — **no layout redesign**, token/contrast fix only |
| **Warning `#F59E0B`** on white | Badges | May fail for small text — use darker text on warning bg, or darker warning for text |
| Success/Error chip text | Upload chips | Icon **+** text; verify chip text contrast |
| Recommended / crown | SCREEN-005 | Convey “Recommended” / “Premium” in **text** or accessible name, not color/icon alone |
| Tagline “AUDIT. ANALYZE…” | Header | Verify small caps gray ≥4.5:1 or treat as non-essential branding with sufficient contrast |

**Rule:** Never use severity color alone (Critical/Major/Minor badges = label text + color).

---

## 4. Typography Rules

From `DESIGN_TOKENS.md` (Manrope):

| Style | Size / weight | A11y notes |
|-------|---------------|------------|
| Heading 1 | 48 / 700 | Page `<h1>`; one per view |
| Heading 2 | 40 / 600 | Section titles (Manage Plan cards, Settings) |
| Body large | 32 / 400 | Hero support — ensure line length readable |
| Body | 24 / 400 | Primary body |
| smallBody | 18 / 400 | Secondary; meets “large text” threshold when bold/size qualifies |
| infoBody | 12 / 400 | Credits label, hints — **strict 4.5:1**; avoid long paragraphs at 12px |

**Rules**

- Do not replace Manrope with system/default stacks in product UI.
- Placeholder text is **not** a label substitute (INP-*).
- Zoom 200%: no clipped GO, Subscribe, or OTP cells.
- Letter-spacing / all-caps taglines must remain readable to SR (expose normal-case accessible names where helpful).

---

## 5. Focus States

| Rule | Spec |
|------|------|
| Indicator | Visible `:focus-visible` ring (Primary or high-contrast 2px+), offset so it is not clipped by `overflow:hidden` |
| Mouse vs keyboard | Prefer focus-visible (keyboard/assistive); avoid removing outlines globally |
| Inputs | Focus = border + ring (COMPONENT_BEHAVIOR INP-001+) |
| Buttons | Ring on all BTN-* including icon-only (avatar, PDF, dismiss) |
| Cards | Interactive plan cards: focusable control or focus within Subscribe CTA |
| Modals | Initial focus to heading or first meaningful control; restore trigger on close |
| Focus Not Obscured | Sticky “Update Changes” on mobile payment sheet must not fully cover focused field (scroll into view) |
| Disabled | Not focusable if truly inert; if focusable for explanation, use `aria-disabled` + message |

---

## 6. Keyboard Navigation

### Global keys

| Key | Behaviour |
|-----|-----------|
| Tab / Shift+Tab | Move through focusable controls in focus order (§23) |
| Enter / Space | Activate buttons, upload tile, menu items |
| Esc | Close menus/dialogs (MDL-*, SCREEN-002); return focus to trigger |
| Arrow keys | Tabs (Settings); menu roving tabindex; Select options; OTP cell move |
| Home / End | Optional in menus/lists where implemented |

### Pattern matrix

| Pattern | Keys | Notes |
|---------|------|-------|
| Upload tile (BTN-002 / FileUploader) | Enter/Space opens file picker | Not drag-only |
| Guest/Auth menu | Arrows + Enter; Esc | `role="menu"` |
| SSO providers | Tab between; Enter starts OAuth | Others `disabled` + `aria-busy` while one loads |
| Settings tabs | Left/Right arrows | `tablist` / `tab` / `tabpanel` |
| OTP (INP-009) | Digits advance; Backspace retreats; paste fills | Group labelled |
| Stripe Elements | Tab through fields | Dialog-level Esc still closes when provider allows |
| History row | Enter opens report | Download is separate button |
| Progress cancel (if present) | Focusable control | Confirm if destructive |

**No keyboard trap** outside modal. Radix Dialog provides trap; do not nest traps without escape.

---

## 7. Screen Reader Support

| Requirement | Implementation guidance |
|-------------|-------------------------|
| Page structure | Landmarks + headings announced in order |
| Brand | Logo link/name “Audient home” |
| Credits | “Credits: {n}” (not number alone) |
| Guest avatar | Button name e.g. “Account menu” |
| Upload | Name “Upload image or screenshot”; status chips live |
| URL | Label “Website URL” / visible “Paste your website link here” associated |
| GO | Name “GO” or “Start audit”; `aria-busy` while submitting |
| Gates | Announce gate reason (guest URL, Free URL, insufficient credits) in text |
| Progress | `role="progressbar"` + throttled polite stage text |
| Report | Scores as text; recommendations as headings/disclosures |
| Payment | Errors and success via live regions (ERROR_HANDLING §18) |
| Loading skeletons | Decorative `aria-hidden`; polite “Loading…” status |

**Virtual cursor:** Ensure custom controls are in tab order or correctly `role`d; prefer native elements.

---

## 8. ARIA Labels (Required Names)

| Control | Accessible name (minimum) |
|---------|---------------------------|
| Logo | Audient (home) |
| Credits meter | Credits, {count} remaining |
| Guest / user avatar | Account menu |
| Upload tile | Upload image or screenshot |
| Remove chip (✕) | Remove uploaded image |
| URL field | Website URL (or visible label text) |
| GO | GO / Start audit |
| Login with Google/Apple/Microsoft | Login with {Provider} (visible text in name) |
| Crown / premium | Premium plan (or plan name) |
| Subscribe | Subscribe to {Plan} |
| Active Account | Indicates current plan (disabled + name) |
| PDF download | Download PDF report for {audit title/date} |
| History row link | Open UX Audit for {title}, {date} |
| Notification bell (when built) | Notifications{, N unread} |
| Avatar edit | Change profile photo |
| Close dialog | Close |
| Cookie preferences | Cookie preferences / Accept / Reject analytics |

Icon-only controls **must** have `aria-label` (or visually hidden text). Brand icons inside SSO buttons: `aria-hidden="true"`.

---

## 9. ARIA Roles

| UI | Role / pattern |
|----|----------------|
| SSO, Payment, Manage Plan overlays, Payment Failed/Success | `dialog` + `aria-modal="true"` + labelled by title |
| Guest/Auth profile menu | `menu` / `menuitem`; trigger `aria-haspopup="menu"` + `aria-expanded` |
| Settings Personal ↔ Payment | `tablist` / `tab` / `tabpanel` |
| Alerts / toasts | `status` or `alert` as appropriate |
| Offline / session banners | `alert` when blocking |
| Audit progress | `progressbar` (`aria-valuemin/max/now` + valuetext) |
| Plan select | Native `<select>` or listbox/option (Radix Select) |
| Checkbox save card | Native checkbox or `checkbox` + `aria-checked` |
| Recommendation expand | `button` + `aria-expanded` |
| Landmark regions | See §22 |

**Do not** add redundant roles on native `<button>`, `<a>`, `<input>`.

---

## 10. Live Regions

Align with ERROR_HANDLING §18 and SCREEN_MAPPING.

| Priority | `aria-live` | Use |
|----------|-------------|-----|
| Assertive | `assertive` / `role="alert"` | Payment failed (MDL-004); audit failure (M03); offline banner; session expired; blocking validation on submit when needed |
| Polite | `polite` / `role="status"` | Upload success/fail chips; credits updates; progress stage (throttled); save profile toast; “Activating your plan…”; payment success (MDL-005); refund toasts |

**Throttling:** Progress and OTP countdown — update every few seconds or on stage change, not every poll tick (avoid SR spam).

**Skeleton / loading:** One polite “Loading…” — not per-skeleton shape.

---

## 11. Forms Accessibility

| Rule | Applies to |
|------|------------|
| Visible `<label>` (or `aria-label` if design has no adjacent label — associate instructional text via `aria-labelledby`) | INP-001…012 |
| `htmlFor` / `id` pairing | All text fields |
| `aria-invalid="true"` + `aria-describedby` → error element id | VALIDATION_RULES |
| Placeholder ≠ label | URL, payment, profile |
| `autocomplete` | Profile names/email; `cc-name`, `cc-number`, `cc-csc`, `cc-exp`; OTP `one-time-code` |
| `inputmode` | `url` (URL); `numeric` (card, CVV, OTP) |
| Required indication | Text or `aria-required` — do not color-only |
| Fieldset/legend | OTP group; payment method group when multiple fields |
| Read-only email | Conveyed as read-only (`readOnly` + SR text), not silently disabled without reason |
| Stripe Elements | Each Element wrapped with visible label; errors described; never raw PAN in DOM outside Stripe |

**Submit:** On validation failure, move focus to **first invalid field** (VALIDATION_RULES §15; ERROR_HANDLING).

---

## 12. Error Accessibility

| Layer | Behaviour |
|-------|-----------|
| Inline field errors | Text + Error token `#DC2626` + icon; linked via `aria-describedby` |
| Chips (upload/URL) | Icon + text; polite/assertive per severity |
| Toasts | Dismissible; keyboard reachable; polite unless blocking |
| Modals (MDL-004, M03) | Focus heading or Primary CTA; assertive live; Esc per modal rules |
| Gate messages | Plain language (“Upgrade to audit live URLs”) — not only disabled GO |
| Refund clauses | Included in announced message when shown to sighted users |
| Color | Never sole channel |

Cross-ref: ERROR_HANDLING **Accessibility Behaviour** rows + §18.

---

## 13. Tables Accessibility

**Current designs:** History (SCREEN-012) is a **grouped list**, not a data `<table>`. Prefer:

| Pattern | Requirement |
|---------|-------------|
| Group headers | Headings (`h2`/`h3`) for date groups |
| Rows | Links or list items with full accessible names |
| Download | Separate named button — not untitled icon |
| Empty (SCREEN-013) | Heading + message; contrast ≥4.5:1; CTA is real button if present |

**If** a true data table is added later (billing invoices, admin):

- Use `<table>` / `<th scope>` / caption  
- Sortable headers announce sort direction  
- Do not use CSS-only grid tables without roles  

---

## 14. Charts Accessibility

Designs use **ScoreGauge** / score bands (COMPONENT_MAPPING), not complex chart libraries.

| Control | Requirement |
|---------|-------------|
| Overall / category score | Numeric value in **text**; gauge decorative or supplemented |
| `aria-label` | e.g. “Usability score 72 out of 100” |
| Color bands | Paired with number + optional text band name |
| Trends | Not color-only (icon/text “up/down”) |
| Motion gauges | Disabled under `prefers-reduced-motion` |

**If** charts are added to reports later: provide text summary or data table equivalent (WCAG 1.1.1 / 1.3.1).

---

## 15. PDF Accessibility

| Requirement | Detail |
|-------------|--------|
| Tagged PDF | Export must be a **tagged / accessible PDF** (SCREEN_MAPPING checklist) |
| Reading order | Logical: title → scores → findings → recommendations |
| Text | Extractable; not image-only pages |
| Alt text | Annotated screenshots have alternate descriptions |
| Language | Document language set |
| Contrast | Body text meets AA in export theme |
| Free tier | If PDF gated, button disabled **with** explanation (not silent) |
| Failure | `pdf_download_failed` UX — announce retry; report remains available (SCREEN_MAPPING taxonomy) |

---

## 16. Motion & Animation

Observed / planned motion (Framer Motion, gradients, progress):

| Motion | Where | A11y rule |
|--------|-------|-----------|
| Upload / GO hover gradients | Landing / Home | Cosmetic — disable under reduced motion |
| Progress stage transitions | SCREEN-M01 | Prefer opacity/crossfade; keep textual stage |
| Modal open/close | MDL-* | Short fade OK; focus management mandatory |
| Score gauge animation | M02 | Optional; final value must be immediate for SR |
| Error shake | Avoid | ERROR_HANDLING: no error-only shake |
| Payment processing spinner | Buttons | `aria-busy`; visible loading text |

Do not autoplay video/audio (none in current designs).

---

## 17. Reduced Motion

```text
@media (prefers-reduced-motion: reduce)
```

| Disable / simplify | Keep |
|--------------------|------|
| Gradient/hover motion | Instant state changes |
| Gauge / stage ornamental animation | Progress value + text stage |
| Parallax / large transitions | Dialog show/hide without long delay |
| Confetti / success flourish (if any) | Success text + polite live region |

Functional spinners may remain if brief and paired with text; prefer static “Loading” under reduced motion.

---

## 18. Responsive Accessibility

| Breakpoint behaviour (from SCREEN_MAPPING) | A11y impact |
|--------------------------------------------|-------------|
| Desktop centered hero / modals | Focus order unchanged |
| Tablet reduced padding | Targets remain ≥44px |
| Mobile: stack Upload; URL+GO full width; GO may wrap below | Maintain label associations; focus order Upload → URL → GO |
| Payment mobile full-height sheet + sticky CTA | Scroll focused fields into view (2.4.11) |
| History / Settings stack | Tabs remain arrow-key operable |

**Reflow:** At 320px width and 400% zoom (where required), primary audit and auth flows remain usable without horizontal scrolling of the whole page.

---

## 19. Mobile Accessibility

| Topic | Requirement |
|-------|-------------|
| Touch targets | §20 |
| Input types | Correct `inputmode` / virtual keyboards for URL, numeric card/OTP |
| SSO | Full-width provider buttons ≥44px height |
| VoiceOver / TalkBack | Same roles/names as desktop |
| Orientation | Both supported |
| Safe areas | Focus rings and CTAs not under home indicator |
| Drag upload | Optional enhancement only — button required |

---

## 20. Touch Target Sizes

| Standard | Size |
|----------|------|
| **Product minimum** (SCREEN_MAPPING / COMPONENT_BEHAVIOR) | **≥ 44×44 CSS px** |
| WCAG 2.2 AA 2.5.8 | ≥ 24×24 CSS px (floor — do not ship to floor) |

Applies to: GO, Upload tile, Avatar, SSO buttons, Subscribe, Update Changes, OTP cells (adequate hit area), chip dismiss, PDF icon button, menu items, tab hits.

Spacing: adjacent targets should not overlap hit areas; use padding if visual chrome is smaller.

---

## 21. Skip Navigation

| Surface | Requirement |
|---------|-------------|
| Authenticated app shell (Home, History, Settings, Report) | First focusable: **Skip to main content** link → `#main` |
| Marketing Landing (SCREEN-001) | Skip to main audit form / `#main` |
| Visibility | Visually hidden until focus |
| Modals | Skip link not required inside dialog; focus trap applies |

---

## 22. Landmark Regions

| Landmark | Usage |
|----------|--------|
| `header` / `banner` | App header (logo, credits, avatar) |
| `nav` | Primary nav / profile menu where applicable |
| `main` | Unique per page — hero + audit form / settings / history / report |
| `contentinfo` | Footer when present (legal); cookie banner may be complementary |
| `complementary` | Optional side panels if added later |
| `form` | Audit form, payment form, settings form — when it aids SR structure |

Dialogs are **not** inside `main` for modality purposes (portaled overlay).

---

## 23. Focus Order

### SCREEN-001 / 004 / 009 (AuditForm shared)

1. Skip link (if present)  
2. Logo  
3. Credits  
4. Avatar (menu)  
5. Upload tile  
6. URL input  
7. GO  

Then: chips / dismiss when present.

### SCREEN-002 Menu

Trigger → first enabled item → … → Esc returns to Avatar.

### SCREEN-003 SSO

Close (optional) → Google → Apple → Microsoft → (error alert in order).

### SCREEN-005 Manage Plan

Close → plan cards / Subscribe CTAs in visual order → Active Account (disabled may be in tab order with name).

### SCREEN-006 Payment

Plan select → card fields → OTP group → Save checkbox → Update Changes → close.

### SCREEN-007 / 008

Heading → Primary CTA → Secondary/dismiss.

### SCREEN-010 / 011 Settings

Tabs → fields in visual order → Update → payment fields when on Payment tab.

### SCREEN-012 History

Group headings (not all focusable) → row link → download button per row.

### SCREEN-M01 Progress

Status/progress → Cancel (if any) → no unrelated background.

### SCREEN-M02 Report

Title → scores → recommendation disclosures → PDF → feedback controls.

**Return focus:** Always restore to opener when closing MDL-* / menus.

---

## 24. High Contrast Mode

| Topic | Requirement |
|-------|-------------|
| Windows / forced-colors | Prefer semantic borders; ensure buttons/inputs remain visible under `forced-colors: active` |
| Focus | Use `Highlight` / system focus where forced-colors apply |
| Do not | Rely solely on box-shadow for state if shadows disappear in HCM |
| Icons | Pair with text; ensure stroke remains visible |

No separate “high contrast theme” in Figma — honor **OS forced colors** without redesigning brand screens.

---

## 25. Dark Mode Accessibility

| Fact | Implication |
|------|-------------|
| Uploaded Figma screens are **light** (white / Surface) | **No dark-mode product UI** in current source of truth |
| `theme_changed` in analytics is future/prefs | If theme ships later, re-verify **all** contrast pairs; do not invert blindly |
| System `prefers-color-scheme` | Do not auto-switch until designed tokens exist |

Until a dark palette is designed: ship light theme only; still meet AA in light.

---

## 26. Screen-by-Screen Compliance Map

| Screen | Key a11y obligations |
|--------|----------------------|
| **SCREEN-001** Landing | H1; landmarks; labeled URL; keyboard upload; chip live regions; GO busy/disabled semantics; contrast on gray GO / body gray |
| **SCREEN-002** Guest menu | menu pattern; disabled items `aria-disabled` + text; Esc |
| **SCREEN-003** SSO | dialog + trap; named providers; assertive errors |
| **SCREEN-004** Free Home | Same AuditForm; gate copy for URL; skip link; credits live |
| **SCREEN-005** Manage Plan | Plan headings + lists; Recommended in text; Subscribe names |
| **SCREEN-006** Payment | dialog; labeled cc + OTP; live countdown; `aria-busy` |
| **SCREEN-007** Payment Failed | assertive; focus heading/CTA; text error |
| **SCREEN-008** Payment Success | polite live; focus heading; Continue |
| **SCREEN-009** Pro Home | Crown name; purple GO contrast; URL errors describedby |
| **SCREEN-010** Settings Personal | tabs; autocomplete; avatar button name; save status live |
| **SCREEN-011** Payment Details | labeled cc fields; decorative card art `alt=""` |
| **SCREEN-012** History | named rows + PDF buttons; skeletons + loading status |
| **SCREEN-013** Empty History | contrast on empty copy; CTA button if present |
| **SCREEN-M01** Progress | progressbar; throttled live; cancel accessible |
| **SCREEN-M02** Report | scores text; disclosures; annotated alts; PDF a11y |
| **SCREEN-M03** Audit failure | assertive; focus Retry; taxonomy message |
| **M04** Notifications | when built — list + unread names |
| **M09–M16** System/legal | headings; focus management; consent before analytics (M12) |
| **M12** Consent | keyboard operable; clear Accept/Reject; do not block essential auth chrome inappropriately |

---

## 27. Component Compliance Map (Reusable)

| ID / Component | A11y contract |
|----------------|---------------|
| **Button** (ui) | Native button; focus ring; `aria-busy`; icon-only label; contrast |
| **Input + Label** | Label, describedby, invalid |
| **Select** | Keyboard listbox pattern |
| **Dialog** | modal, trap, Esc, restore focus |
| **Alert / Toast** | live region; dismiss keyboard |
| **Tabs** | arrows + selected state |
| **CreditMeter** | named value; live updates; not color-only low state |
| **SeverityBadge** | text + color |
| **ScoreGauge** | numeric text + label |
| **FileUploader** | button picker; progress busy; chip live |
| **AuditForm** | form labels; gate messaging |
| **PdfDownloadButton** | named; gated explanation |
| **History row** | link + download names |
| **ConfirmDialog** | safe default focus; clear consequences |
| **INP-001…012 / BTN-001… / CARD- / MDL-001…005** | Per COMPONENT_BEHAVIOR Accessibility + Keyboard sections |

---

## 28. Accessibility Testing Checklist

### Pre-merge (every UI PR)

- [ ] Keyboard-only path for the changed flow  
- [ ] Focus visible on all new controls  
- [ ] Names/roles (axe + manual SR spot-check)  
- [ ] Contrast for new text/icons (include warning/disabled)  
- [ ] Errors linked (`aria-describedby`) + focus on first invalid  
- [ ] Live region for async success/failure  
- [ ] `prefers-reduced-motion` smoke  
- [ ] Target size ≥44px  
- [ ] No color-only status  

### Release (P0 flows)

- [ ] Guest screenshot audit → report  
- [ ] SSO open/close/trap  
- [ ] Free URL gate messaging  
- [ ] Pro URL audit → PDF  
- [ ] Checkout fail → retry → success  
- [ ] History open + PDF  
- [ ] Settings save + payment details  
- [ ] Consent banner accept/reject  

---

## 29. Lighthouse Testing

| Item | Spec |
|------|------|
| Tool | Chrome Lighthouse Accessibility category |
| Environments | Landing, Home (Free/Pro), Manage Plan, Report, History, Settings |
| Target | **≥ 90** Accessibility score as gate; investigate any serious items even if score passes |
| Zoom / mobile | Emulate mobile + desktop |
| Limits | Lighthouse ≠ full WCAG; pair with axe + manual |

Record scores in QA notes per release candidate.

---

## 30. Axe Testing

| Item | Spec |
|------|------|
| Tool | axe DevTools and/or `@axe-core/react` / Playwright axe in CI |
| Ruleset | WCAG 2.2 AA tags |
| Scope | Critical user routes (above) |
| CI policy | **No Serious/Critical** violations on P0 routes; Moderate triage within sprint |
| Exclusions | Document iframe Stripe internals carefully — test labels around Elements, not third-party internals |

---

## 31. Manual Testing

| Method | Coverage |
|--------|----------|
| Keyboard only | All §6 patterns |
| VoiceOver (macOS/iOS) | Landing, SSO, Payment, Report, Progress |
| NVDA or JAWS (Windows) | Spot-check dialogs + form errors |
| TalkBack (Android) | Mobile audit form + SSO |
| Zoom 200% | Home + Payment sheet |
| Forced colors | Buttons/inputs visible |
| Reduced motion | OS setting on — no essential info lost |
| Screen reader + sighted | Compare announced errors to visible copy |

---

## 32. QA Checklist (Test Cases)

| Test Case ID | Flow | Steps | Pass criteria |
|--------------|------|-------|---------------|
| TC-A11Y-001 | Landing keyboard | Tab Skip→Logo→Credits→Avatar→Upload→URL→GO | Order matches §23; rings visible |
| TC-A11Y-002 | Upload keyboard | Focus Upload, Enter, select file | File attached; success chip announced |
| TC-A11Y-003 | URL error | Invalid URL + blur/GO | `aria-invalid`; error text linked; not color-only |
| TC-A11Y-004 | Guest menu | Open, arrow, Esc | Focus returns to avatar; disabled items announced disabled |
| TC-A11Y-005 | SSO dialog | Open, Tab trap, Esc | Focus trapped; restore trigger |
| TC-A11Y-006 | Provider names | SR on Google/Apple/Microsoft | Full “Login with …” names; icons hidden |
| TC-A11Y-007 | Free URL gate | GO with URL as Free | Gate reason announced / visible text |
| TC-A11Y-008 | Progress | Start audit | progressbar values; throttled live updates |
| TC-A11Y-009 | Report | Open M02 | Scores spoken as numbers; expand `aria-expanded` |
| TC-A11Y-010 | PDF | Download | Named control; loading busy; tagged PDF sample verified |
| TC-A11Y-011 | Payment errors | Decline | Assertive alert; focus CTA; retry operable |
| TC-A11Y-012 | OTP | Enter code | Group label; paste works; countdown polite |
| TC-A11Y-013 | Settings tabs | Arrows | Correct tabpanel shown; fields labelled |
| TC-A11Y-014 | History | Open row + PDF | Discernible names include title/date |
| TC-A11Y-015 | Empty history | View 013 | Text contrast ≥4.5:1 |
| TC-A11Y-016 | Contrast tokens | Audit Warning/Error/infoBody | Documented ratios pass AA |
| TC-A11Y-017 | Reduced motion | OS reduce on | No essential motion-only info |
| TC-A11Y-018 | Target size | Mobile audit CTAs | ≥44×44 |
| TC-A11Y-019 | Consent M12 | Tab Accept/Reject | Analytics gated; controls named |
| TC-A11Y-020 | Session expired | Trigger | Focus Login; announced |
| TC-A11Y-021 | Offline | Disconnect | Assertive banner; actions disabled with reason |
| TC-A11Y-022 | axe CI | P0 routes | Zero Serious/Critical |
| TC-A11Y-023 | Lighthouse | Landing + Report | ≥90 a11y or justified waivers |
| TC-A11Y-024 | Focus obscured | Mobile payment sticky CTA | Focused field not fully hidden |

---

## 33. Developer Notes

1. Prefer **shadcn/ui + Radix** primitives (Dialog, Tabs, Select, Checkbox) — already wired for focus trap and keyboard.  
2. Extend variants in `Button`/`Input` — do not fork inaccessible one-offs.  
3. Match **COMPONENT_BEHAVIOR** Accessibility + Keyboard sections when implementing INP/BTN/MDL.  
4. Align error a11y with **ERROR_HANDLING** live-region priority.  
5. Contrast fixes = **token / text color adjustments**, not layout redesign.  
6. Stripe: never rebuild card fields as plain inputs for “a11y” — use Elements + labels.  
7. PDF tagging is a **backend/export** acceptance criterion, not only a button label.  
8. Target **WCAG 2.2 AA**; keep automated rulesets updated to 2.2.  
9. Cookie/consent (M12) before client analytics — operational server logs may differ (ANALYTICS.md).  
10. Document any waived axe rules with owner + expiry.

---

## 34. Related Documents

| Doc | Use |
|-----|-----|
| SCREEN_MAPPING.md | Per-screen a11y + checklist § Accessibility Checklist |
| COMPONENT_MAPPING.md | Primitive a11y requirements |
| COMPONENT_BEHAVIOR.md | Control-level keyboard/ARIA |
| DESIGN_TOKENS.md | Color/type baseline |
| VALIDATION_RULES.md | Error linking / form a11y |
| ERROR_HANDLING.md | Live regions / focus on errors |
| STATE_MANAGEMENT.md | Per-state accessibility rows |
| CURSOR_RULES.md | AA non-negotiable in code review |
| prd.md | Product audits accessibility for customer sites — dogfood obligation |

---

**End of ACCESSIBILITY.md**
