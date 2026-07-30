# Audient — Component Behavior

**Status:** In progress — Inputs · Buttons · Cards · **Modals** (pass 4)  
**Last updated:** 2026-07-29  
**Owner:** Raghunath Kamlekar  
**Related:** SCREEN_MAPPING.md, COMPONENT_MAPPING.md, DESIGN_TOKENS.md, API.md, PRICING.md, SECURITY.md

Runtime behavior for UI components, identified from uploaded Figma screens (`Screen1`–`Screen11`) and cross-checked with SCREEN_MAPPING / COMPONENT_MAPPING.

**Documented:** Part 1 Inputs (INP-*) · Part 2 Buttons (BTN-*) · Part 3 Cards (CARD-*) · Part 4 Modals (MDL-*).

**Tokens:** Primary `#1C018E` · Secondary `#8050E6` · Success `#16A34A` · Warning `#F59E0B` · Error `#DC2626` · Background `#FFFFFF` · Surface `#F8FDFF` · Radii 4/8/16 · Spacing 8/16/24 · Font **Manrope**.

> Badges, menus, and progress/report surfaces remain for later passes.

---

## Input inventory (from uploaded screens)

| ID | Component | Screens (uploaded) |
|----|-----------|-------------------|
| INP-001 | Website URL Input | Landing (Screen1), Free Home (Screen2), Pro Home (Screen9) |
| INP-002 | Screenshot File Upload | Landing, Free Home, Pro Home |
| INP-003 | Plan Select (Dropdown) | Payment Modal (Screen5) |
| INP-004 | Name on Card | Payment Modal (Screen5); Account Settings → Payment Details (Screen6.1 / 11 / 11.1) |
| INP-005 | Card Number | Payment Modal; Account Settings → Payment Details |
| INP-006 | CVV | Payment Modal; Account Settings → Payment Details |
| INP-007 | Expiry Date | Payment Modal; Account Settings → Payment Details |
| INP-008 | Save Card Details (Checkbox) | Payment Modal (Screen5) |
| INP-009 | OTP Code (4-digit) | Payment Modal (Screen5) |
| INP-010 | First Name | Account Settings → Personal (Screen6) |
| INP-011 | Last Name | Account Settings → Personal (Screen6) |
| INP-012 | Email | Account Settings → Personal (Screen6) — design shows two Email fields (R6) |
| INP-013 | Profile Avatar Upload | Account Settings → Personal (Screen6) |

**Not in uploaded screens (omit this pass):** Password, Search, Textarea, Radio, Switch/Billing interval toggle, magic-link email (SSO-only auth in designs).

**PCI note (R4):** INP-004–008 should be implemented with **Stripe Elements / Payment Element** (tokenized). Behavior below matches the **designed** fields; Audient must not persist raw PAN/CVV.

---

# INP-001 — Website URL Input

### Purpose
Capture a public website URL for a live UX audit (Pro/Business). Shown on Landing and Home next to GO; label in designs: “Paste your website link here”.

### States
| State | Behaviour |
|-------|-----------|
| Default / Empty | Placeholder (e.g. `https://example.com` or empty with label only); grey border |
| Hover | Border → Primary |
| Focus | 2px border + focus ring; caret visible |
| Filled | Value shown; ready for GO |
| Disabled | Grey background; not editable (loading / offline) |
| Loading | Disabled while audit create in flight |
| Error | Red border + “Invalid URL” chip/text (Screen9) |
| Success | Optional brief green border before navigate to Progress |

### Validation Rules
- Required for URL audit path (not for screenshot-only).
- Must be valid `http://` or `https://` URL; no spaces; max **2048** chars.
- Reject unsupported protocols (`ftp`, `javascript`, etc.).
- Server: SSRF checks (no private/localhost); tier gate (Guest/Free cannot run URL audits).
- Invalid examples from product: `google`, `abc`, `www`, `ftp://…`.

### Accessibility
- Visible label (not placeholder-only); or `aria-label="Website URL"`.
- `type`/`inputmode="url"`; `autocomplete="url"`.
- Errors via `aria-invalid` + `aria-describedby`; announce chip with `aria-live` polite.
- Focus-visible ring; WCAG AA contrast.

### API Dependency
- Submit path: `POST /audits` with `{ inputType: "URL", websiteUrl }` (after auth + credits).
- Does not call API on every keystroke.

### Analytics
- `website_url_entered` (blur / meaningful change)
- `invalid_url` (client or server reject)
- Related: `go_clicked`, `audit_started` (on success create)

### Keyboard Behaviour
- **Tab** / **Shift+Tab** — move focus to/from GO.
- **Enter** — submit (same as GO).
- **Esc** — clear value and error (product rule).

---

# INP-002 — Screenshot File Upload

### Purpose
Select and upload PNG/JPEG/WEBP screenshots for a free (screenshot) UX audit. Purple tile + “Upload image or Screenshot”; success/fail chips in designs.

### States
| State | Behaviour |
|-------|-----------|
| Default | Empty purple tile + image icon |
| Hover / Focus | Tile highlight; focus ring |
| Drag-over | Border accent |
| Compressing | “Optimizing…” |
| Uploading | Progress; region `aria-busy` |
| Success | Green chip e.g. “image uploaded ✕” + preview |
| Error | Red chip e.g. “image failed ✕” |
| Disabled | Grey — no credits / guest quota used / audit running / offline |

### Validation Rules
- **Allowed:** `image/png`, `image/jpeg`, `image/webp`.
- **Max size:** 10 MB per file; **max files:** 5.
- Reject unsupported format and oversized files.
- **Compress before upload**; **preview** before/during upload.
- Support **remove** and **replace**.
- Guest: counts toward **1** anonymous screenshot audit; then SSO.
- Server re-validates MIME/size on sign + storage.

### Accessibility
- `aria-label="Upload image or screenshot"`.
- Not drag-only — real control + `<input type="file">`.
- Preview images have meaningful `alt`; errors in text + `aria-live`.
- Progress announced.

### API Dependency
1. `POST /uploads/sign` `{ fileName, contentType, fileSize }`
2. `PUT` to signed URL
3. `POST /audits` `{ inputType: "SCREENSHOT", screenshotKeys: [...] }`

### Analytics
- `screenshot_upload_clicked`, `screenshot_selected`, `screenshot_rejected`
- `screenshot_compressed`, `screenshot_uploaded`, `screenshot_upload_failed`
- `screenshot_removed`, `screenshot_replaced`
- `audit_started` when screenshot audit accepted

### Keyboard Behaviour
- **Tab** — tile → previews → remove.
- **Enter** / **Space** on tile — open file picker.
- **Delete** / **Backspace** on focused preview — remove image.

---

# INP-003 — Plan Select (Dropdown)

### Purpose
Choose subscription tier inside the Payment modal (e.g. value “Pro”) before paying; updates displayed price.

### States
| State | Behaviour |
|-------|-----------|
| Default / Closed | Shows selected plan label + chevron |
| Open | Listbox of paid plans (Pro, Business) |
| Hover / Focus | Option and trigger focus styles |
| Disabled | While payment processing |
| Error | Rare; if checkout tier invalid, inline error |

### Validation Rules
- Must be a purchasable tier: `PRO` or `ENTERPRISE` (UI: Business).
- Free is not a checkout option here.
- Selection must match server plan catalog (`plans.ts`: Pro **$29**, Business **$99**).

### Accessibility
- Native select or Radix Select: label “Plan”; `aria-expanded` when open.
- Keyboard list navigation; selected option announced.
- Price change associated with plan via visible text.

### API Dependency
- No direct write on change.
- Selected tier passed to `POST /billing/checkout` `{ tier, billingInterval: "MONTHLY" }` (or PaymentIntent create).

### Analytics
- `payment_plan_changed` `{ tier }`
- Feeds `pricing_clicked` / `checkout_started` on confirm

### Keyboard Behaviour
- **Tab** — focus trigger.
- **Enter** / **Space** — open.
- **Arrow Up/Down** — move options.
- **Enter** — select.
- **Esc** — close without change (or keep prior selection).

---

# INP-004 — Name on Card

### Purpose
Cardholder name for payment / saved payment method (Payment modal + Account Settings → Payment Details).

### States
| State | Behaviour |
|-------|-----------|
| Default | Empty or pre-filled (e.g. “John David”) |
| Hover / Focus | Border Primary; focus ring |
| Filled | Valid-looking name |
| Disabled | During submit |
| Error | Red border + message (required / invalid characters) |
| Success | Part of form-valid state |

### Validation Rules
- Required.
- Trimmed; reasonable max length (e.g. 2–64); letters/spaces/common punctuation.
- Must match card network expectations when using Elements (provider validates).

### Accessibility
- Label “Name on the card”; `autocomplete="cc-name"`.
- `aria-invalid` / `aria-describedby` on error.

### API Dependency
- Tokenized via Stripe Elements — name may be collected by Element or passed to SetupIntent/PaymentIntent; **not** stored as raw card data in Audient DB.
- Settings save: update default payment method via billing API (token only).

### Analytics
- `payment_field_completed` `{ field: "card_name" }` (optional, no value logged)
- Errors: `payment_validation_failed` `{ field: "card_name" }`

### Keyboard Behaviour
- **Tab** order: Name → Card number → CVV → Expiry (as in designs).
- Standard text editing keys; no special submit on Enter unless form submit.

---

# INP-005 — Card Number

### Purpose
Primary account number entry for checkout or updating payment method. Designs show masking/partial numbers and inline “Invalid Credit number”.

### States
| State | Behaviour |
|-------|-----------|
| Default | Empty |
| Focus | Focus ring; formatted groups as typed |
| Filled valid | e.g. complete PAN pattern (Elements) |
| Error | Red border + badge “Invalid Credit number” (Screen11.1) |
| Disabled | While processing |
| Loading | Optional brand icon detection |

### Validation Rules
- Required.
- Digits only (spaces for display); Luhn check; length by brand (typically 13–19).
- Reject incomplete numbers (design invalid example shorter than full PAN).
- **Never** log or persist full PAN in Audient; use Stripe Elements.

### Accessibility
- Label “Card number”; `autocomplete="cc-number"`; `inputmode="numeric"`.
- Error text not color-only; linked with `aria-describedby`.

### API Dependency
- Stripe Element / Payment Method create — Audient receives **paymentMethodId** only.
- `POST /billing/checkout` or attach PM to customer; webhooks grant entitlements.

### Analytics
- `payment_validation_failed` `{ field: "card_number", reason }`
- Do **not** send card digits to analytics.

### Keyboard Behaviour
- Numeric entry; **Tab** to CVV.
- Elements may trap focus internally — preserve Esc to close modal at dialog level.

---

# INP-006 — CVV

### Purpose
Card security code on Payment modal and Payment Details (half-width beside Expiry).

### States
| State | Behaviour |
|-------|-----------|
| Default / Focus / Filled | Standard field states |
| Error | Red border + short message |
| Disabled | During submit |

### Validation Rules
- Required; **3–4** digits (`inputmode="numeric"`).
- Never store CVV after authorization (PCI).

### Accessibility
- Label “CVV”; `autocomplete="cc-csc"`.
- Optional `aria-describedby` hint (“3 digits on the back”).

### API Dependency
- Handled inside Stripe Elements; not sent to Audient API as plaintext.

### Analytics
- `payment_validation_failed` `{ field: "cvv" }` only — no value.

### Keyboard Behaviour
- **Tab** between CVV and Expiry (side-by-side row).
- Digits only.

---

# INP-007 — Expiry Date

### Purpose
Card expiry on Payment modal and Payment Details. Design example format `31/11/40` — product should normalize to **MM/YY** (or MM/YYYY) and reject impossible months.

### States
| State | Behaviour |
|-------|-----------|
| Default / Focus / Filled | Standard |
| Error | Red border if invalid or past date |
| Disabled | During submit |

### Validation Rules
- Required.
- Valid month 01–12; date must be **in the future**.
- Prefer **MM/YY** for Stripe compatibility (clarify Figma `DD/MM/YY`-looking example as design placeholder).

### Accessibility
- Label “Expiry Date”; `autocomplete="cc-exp"` (or `cc-exp-month` / `cc-exp-year` if split).
- Announce format in helper text.

### API Dependency
- Stripe Elements; expiry not stored raw in Audient.

### Analytics
- `payment_validation_failed` `{ field: "expiry" }`

### Keyboard Behaviour
- **Tab** from CVV; numeric / slash formatting as typed.
- **Enter** may submit payment form if all fields valid.

---

# INP-008 — Save Card Details (Checkbox)

### Purpose
Opt-in to save the payment method for renewals / future charges (Payment modal: “Save card details”).

### States
| State | Behaviour |
|-------|-----------|
| Unchecked (default) | One-time payment method unless Stripe subscription requires saving |
| Checked | Create/attach reusable payment method (mandate/off-session as required) |
| Disabled | While processing |
| Focus | Focus ring on checkbox |

### Validation Rules
- Optional boolean.
- If unchecked on subscription Checkout, Stripe may still save PM for recurring — reflect provider rules in helper copy.
- Must remain lawful under consent (disclose storage via Stripe).

### Accessibility
- Label associated with checkbox; clickable label text.
- State exposed to AT (`aria-checked` if custom).

### API Dependency
- Influences Stripe SetupIntent / `setup_future_usage` / customer attachment — not a separate Audient field beyond billing prefs.

### Analytics
- `save_card_toggled` `{ checked: true|false }`

### Keyboard Behaviour
- **Tab** to checkbox; **Space** toggles.

---

# INP-009 — OTP Code (4-digit)

### Purpose
Enter one-time code shown under “Enter OTP sent to registered email” on Payment modal, with countdown badge (e.g. “119 S”). Maps to **3-D Secure / SCA** challenge in production (prefer Stripe 3DS UI; keep segmented inputs if matching Figma).

### States
| State | Behaviour |
|-------|-----------|
| Empty | Four empty cells; focus first |
| Entering | Digits fill; auto-advance |
| Pending / Countdown | Timer visible; resend disabled until 0 |
| Verifying | Cells disabled; busy |
| Error | Shake/red + message (invalid/expired) |
| Expired | Timer 0; enable resend |
| Success | Proceed to Payment Success |
| Locked | Too many attempts |

### Validation Rules
- Exactly **4** digits (as designed); numeric only.
- Required before “Update Changes” completes payment.
- Expired OTP rejected; resend issues new challenge.
- Rate-limit attempts (server/provider).

### Accessibility
- Group label “Verification code” / OTP instruction.
- `inputmode="numeric"`; `autocomplete="one-time-code"`.
- Countdown and errors in `aria-live` (throttled).
- Paste distributes across cells.

### API Dependency
- Confirm PaymentIntent / 3DS challenge with provider — not a custom Audient OTP store if using Stripe SCA.
- If custom email OTP were used (not recommended), verify via auth/billing confirm endpoint.

### Analytics
- `payment_otp_submitted`, `payment_otp_failed`, `payment_otp_resend`, `payment_otp_expired`

### Keyboard Behaviour
- Digits move focus to next cell; **Backspace** moves to previous when empty.
- **Paste** full code into group.
- **Tab** exits group to primary CTA.

---

# INP-010 — First Name

### Purpose
Edit user’s first name on Account Settings → Personal (pre-filled e.g. “John”).

### States
| State | Behaviour |
|-------|-----------|
| Default / Focus / Filled | Standard text field |
| Disabled | While saving |
| Error | Required / length / charset |
| Success | “Saved” via parent toast after Update Changes |

### Validation Rules
- Required (or optional if product allows empty — designs show filled; **recommend required**).
- Trim; max length (e.g. 50); no leading/trailing spaces stored.

### Accessibility
- Label “First Name”; `autocomplete="given-name"`.
- Error linked with `aria-describedby`.

### API Dependency
- `GET /me` load; `PATCH /me` `{ name }` or `{ firstName, lastName }` (compose full name server-side if single `name` column).

### Analytics
- `profile_field_edited` `{ field: "first_name" }`
- `profile_updated` on successful save

### Keyboard Behaviour
- **Tab** to Last Name; standard text keys.
- **Enter** may submit Personal form.

---

# INP-011 — Last Name

### Purpose
Edit user’s last name on Account Settings → Personal (e.g. “David”).

### States
Same pattern as First Name.

### Validation Rules
Same as First Name (required, length, trim).

### Accessibility
- Label “Last Name”; `autocomplete="family-name"`.

### API Dependency
- Same `PATCH /me` as First Name (combined display name).

### Analytics
- `profile_field_edited` `{ field: "last_name" }`
- `profile_updated` on save

### Keyboard Behaviour
- **Tab** from First Name → Email; **Enter** submits form.

---

# INP-012 — Email

### Purpose
Show / manage email on Account Settings → Personal. Design shows **two** fields both labeled “Email” (R6 — treat as bug unless Product defines primary vs confirm/billing).

### States
| State | Behaviour |
|-------|-----------|
| Read-only (recommended) | Supabase Auth email; not editable inline |
| Focus | If editable — focus ring |
| Error | Invalid format (if editable) |
| Disabled | Always if auth-managed |

### Validation Rules
- Valid email format if editable.
- **Adopted recommendation:** single read-only Email; change via provider account settings; remove duplicate field in design.
- If “confirm email” intended: must match primary.

### Accessibility
- Label “Email”; `autocomplete="email"`.
- If read-only, expose as text or `readOnly` input announced as non-editable.

### API Dependency
- Loaded from `GET /me` / session; **not** changed via `PATCH /me` (API: email managed by Supabase Auth).

### Analytics
- `profile_email_change_requested` only if a change flow exists (none in current screens).

### Keyboard Behaviour
- **Tab** through field(s) to Update Changes; no edit if read-only.

---

# INP-013 — Profile Avatar Upload

### Purpose
Change profile photo via grey circle + pencil control on Account Settings → Personal.

### States
| State | Behaviour |
|-------|-----------|
| Default | Placeholder circle or current photo |
| Hover / Focus | Pencil affordance; focus ring |
| Uploading | Spinner on avatar |
| Success | New image shown |
| Error | Toast / inline “Upload failed” |
| Disabled | While another save in progress |

### Validation Rules
- Images only (recommend PNG/JPEG/WEBP); max size (e.g. 5 MB).
- Square crop optional (client).
- Reject non-images.

### Accessibility
- Control is a button: `aria-label="Change profile photo"`.
- Not icon-only without name; keyboard activatable.

### API Dependency
- `POST /uploads/sign` (avatar content types) → PUT → `PATCH /me` `{ avatarUrl }` or avatar key.

### Analytics
- `avatar_upload_clicked`, `avatar_uploaded`, `avatar_upload_failed`

### Keyboard Behaviour
- **Tab** to control; **Enter** / **Space** open file picker.

---

## Shared input rules (all INP-*)

| Topic | Rule |
|-------|------|
| Focus | Visible focus ring; Primary/Secondary border on focus |
| Error | Error `#DC2626` border + text; never color-only |
| Success | Success `#16A34A` where used (upload chips) |
| Typography | Manrope; labels `infoBody` / `smallBody` |
| Spacing | 8 / 16 between label and control |
| Radius | Medium **8px** for text fields; Large **16px** for upload tile |
| Offline | Disable submit-related inputs; show banner |
| Security | No secrets in analytics; card data only via Stripe |

---

# Part 2 — Button Components

Runtime behavior for **buttons** visible in uploaded screens. Cross-checked with SCREEN_MAPPING and COMPONENT_MAPPING (`Button`, `OAuthButtons`, `CheckoutButton`, `PdfDownloadButton`).

**Tokens:** Primary `#1C018E` · Secondary `#8050E6` · Success `#16A34A` · Error `#DC2626` · white label on purple fills · Radius Medium/Large · Manrope.

## Button inventory (from uploaded screens)

| ID | Component | Screens |
|----|-----------|---------|
| BTN-001 | GO Button | Landing, Free Home, Pro Home |
| BTN-002 | Screenshot Upload Trigger | Landing, Free Home, Pro Home (tile acts as button; pairs with INP-002) |
| BTN-003 | Login with Google | SSO Login Modal (Screen3) |
| BTN-004 | Login with Apple | SSO Login Modal |
| BTN-005 | Login with Microsoft | SSO Login Modal |
| BTN-006 | Subscribe | Manage Plan — Pro & Business cards |
| BTN-007 | Active Account | Manage Plan — current paid plan (Screen4.2) |
| BTN-008 | Update Changes (Payment) | Payment Modal (Screen5) |
| BTN-009 | Update Changes (Profile) | Account Settings → Personal |
| BTN-010 | Update Changes (Payment Details) | Account Settings → Payment Details |
| BTN-011 | History PDF Download | History list (Screen8) — circular download icon |
| BTN-012 | Chip Dismiss (✕) | Upload success/fail chips; Invalid URL chip |
| BTN-013 | Avatar Menu Trigger | Header guest/user avatar (opens profile menu) |
| BTN-014 | Credits Badge Control | Header credits (navigates to billing) |
| BTN-015 | Premium Crown Control | Pro header crown (opens Manage Plan) |
| BTN-016 | Profile Avatar Edit | Account Settings — pencil on avatar (pairs with INP-013) |
| BTN-017 | History Report Link | History row title (acts as link-button to report) |

**Not clearly present as discrete buttons in uploads:** Payment Success/Failed modal CTAs (Continue / Try again) — recommended in **MDL-004 / MDL-005**; Modal overlay dismiss is not a labeled button.

---

# BTN-001 — GO Button

### Purpose
Start a **URL** UX audit from the URL field (attached to the right of INP-001). Grey/muted on Guest/Free; solid purple on Pro.

### States
| State | Behaviour |
|-------|-----------|
| Default | Label **GO**; muted or purple by tier |
| Hover / Focus / Pressed | Fill darken; focus-visible ring |
| Disabled | Empty/invalid URL, audit running, credits exhausted, offline |
| Loading | Spinner + text **Analyzing...**; disabled |
| Failure | Return to GO; toast from parent |

### Validation Rules
- Client: URL valid before API (or click → validate → error on INP-001).
- Guest URL → SSO (no audit API). Free URL → Upgrade. Pro/Business → credits check then API.
- Prevent double-submit (loading + Idempotency-Key).

### Accessibility
- Native `<button>`; name “GO” / “Analyzing…” when loading.
- `aria-busy="true"` while loading; ≥44px height with field.
- Contrast AA on purple and muted variants.

### API Dependency
- `POST /audits` `{ inputType: "URL", websiteUrl }` → `202` → Progress.
- Credits via `GET /credits` / reservation on create.

### Analytics
- `go_clicked`, `audit_started` (on 202), related `url_attempt_gated`, `invalid_url`

### Keyboard Behaviour
- **Tab** after URL field; **Enter** / **Space** activate.
- **Enter** in URL field equals GO click.

---

# BTN-002 — Screenshot Upload Trigger

### Purpose
Open file picker / accept drop to start screenshot selection (visual: purple square with image icon). Behavior paired with **INP-002**.

### States
Default tile · Hover/Focus · Drag-over · Compressing/Uploading (busy) · Disabled (quota/credits/offline) · Error/Success reflected on chips (not on tile permanently)

### Validation Rules
Does not upload itself — delegates to INP-002 rules (PNG/JPEG/WEBP, 10 MB, max 5).

### Accessibility
- `aria-label="Upload image or screenshot"`; keyboard file picker; not drag-only.

### API Dependency
Triggers INP-002 pipeline (`/uploads/sign` → PUT → optional `POST /audits`).

### Analytics
- `screenshot_upload_clicked` (then INP-002 events)

### Keyboard Behaviour
- **Enter** / **Space** open picker; **Tab** into preview/remove controls.

---

# BTN-003 — Login with Google

### Purpose
Start Google OAuth sign-in/up from SSO modal.

### States
Default (outlined + Google mark) · Hover/Focus · Loading/redirecting (`aria-busy`, others disabled) · Error (modal Alert) · Disabled (another provider in flight)

### Validation Rules
- Provider must be enabled in Supabase; `redirectTo` on allow-list (PKCE).

### Accessibility
- Name **“Login with Google”**; icon `aria-hidden`; ≥44px; focus ring.

### API Dependency
- Supabase Auth `signInWithOAuth("google")` → callback → `GET /me`.

### Analytics
- `oauth_started{provider:google}`, `oauth_succeeded`, `oauth_failed`

### Keyboard Behaviour
- **Tab** among three OAuth buttons; **Enter** / **Space** activate; **Esc** closes modal (dialog).

---

# BTN-004 — Login with Apple

### Purpose
Start Apple OAuth (Sign in with Apple). Same pattern as BTN-003 with Apple mark and Apple HIG styling constraints.

### States
Same as BTN-003 (idle / redirecting / error / disabled).

### Validation Rules
- Apple provider configured (Services ID/key); handle private-relay email.

### Accessibility
- Name **“Login with Apple”**; meet Apple button label/contrast guidance where applicable.

### API Dependency
- `signInWithOAuth("apple")`.

### Analytics
- `oauth_started{provider:apple}`, `oauth_succeeded`, `oauth_failed`

### Keyboard Behaviour
Same as BTN-003.

---

# BTN-005 — Login with Microsoft

### Purpose
Start Microsoft / Azure AD OAuth.

### States
Same as BTN-003.

### Validation Rules
- Azure provider configured in Supabase.

### Accessibility
- Name **“Login with Microsoft”**; icon decorative.

### API Dependency
- `signInWithOAuth("azure")`.

### Analytics
- `oauth_started{provider:microsoft}`, `oauth_succeeded`, `oauth_failed`

### Keyboard Behaviour
Same as BTN-003.

---

# BTN-006 — Subscribe

### Purpose
Start purchase of **Pro** or **Business** from a Pricing Card on Manage Plan (purple gradient CTA).

### States
Default (Subscribe) · Hover/Focus/Pressed · Loading (spinner creating checkout) · Disabled (offline / already redirecting)

### Validation Rules
- User authenticated (else SSO with intent).
- Tier not already current (`409` if attempted).
- Server maps tier → Stripe Price (Pro **$29**, Business **$99**).

### Accessibility
- Name includes plan: “Subscribe to Pro” / “Subscribe to Business”.
- Loading announced (`aria-busy`).

### API Dependency
- `POST /billing/checkout` `{ tier, billingInterval: "MONTHLY" }` → redirect `checkoutUrl` (Stripe Checkout). Idempotency-Key.

### Analytics
- `pricing_clicked`, `subscribe_clicked`, `checkout_started`

### Keyboard Behaviour
- **Tab** to CTA; **Enter** / **Space** start checkout.

---

# BTN-007 — Active Account

### Purpose
Indicate the user’s **current** paid plan on Manage Plan (outlined purple “Active Account”). Not a purchase action.

### States
Default (outline, current) · Focus (visible ring) · Disabled for activation (non-interactive or `aria-disabled`)

### Validation Rules
- Shown only when `membership.tier` matches card and status is ACTIVE/TRIALING.
- Must not open Checkout.

### Accessibility
- Name “Pro plan, Active Account” (include plan); convey current with `aria-current="true"` on card/CTA.

### API Dependency
- None on click; state from `GET /membership`.

### Analytics
- `current_plan_viewed` (impression) — optional click no-op event

### Keyboard Behaviour
- Focusable for discovery; **Enter** does nothing (or moves to Billing Portal “Manage” if Product wires later).

---

# BTN-008 — Update Changes (Payment Modal)

### Purpose
Confirm payment in Payment modal after card (+ OTP) — primary purple CTA bottom-right (“Update Changes”).

### States
Default · Hover/Focus · Loading (“Processing…”) · Disabled until required fields/OTP valid · Failure (stay + toast / Failed modal)

### Validation Rules
- Name, card, CVV, expiry valid; OTP complete if step required.
- Use Stripe Elements confirmation — no raw PAN to Audient.

### Accessibility
- Name “Update Changes” or “Pay and subscribe”; `aria-busy` while processing.

### API Dependency
- Confirm PaymentIntent / Checkout; entitlements via Stripe **webhook**.

### Analytics
- `payment_submitted`, `payment_succeeded`, `payment_failed`

### Keyboard Behaviour
- **Enter** in form may activate; **Tab** from OTP to button.

---

# BTN-009 — Update Changes (Profile)

### Purpose
Save Personal settings (First Name, Last Name, etc.) on Account Settings → Personal.

### States
Default · Hover/Focus · Loading (Saving…) · Disabled when no dirty fields or invalid · Success (toast) · Failure (inline/toast)

### Validation Rules
- First/Last name rules (INP-010/011); block save if invalid.
- Email typically read-only — not sent on PATCH.

### Accessibility
- Name “Update Changes”; announce save result via live region/toast.

### API Dependency
- `PATCH /me` (whitelisted profile fields).

### Analytics
- `profile_updated`, `profile_update_failed`

### Keyboard Behaviour
- **Enter** in name fields may submit; **Tab** to button then **Enter**/**Space**.

---

# BTN-010 — Update Changes (Payment Details)

### Purpose
Save updated payment method on Account Settings → Payment Details.

### States
Same pattern as BTN-008/009 (idle / loading / disabled / error).

### Validation Rules
- Card fields valid (INP-004–007) via Elements; reject invalid card number state shown in designs.

### Accessibility
- “Update Changes” / “Save payment method”; busy state while tokenizing.

### API Dependency
- Attach/update Stripe payment method on customer; no PAN storage in Audient.

### Analytics
- `payment_method_updated`, `payment_method_update_failed`

### Keyboard Behaviour
- **Tab** from Expiry to button; **Enter**/**Space** save.

---

# BTN-011 — History PDF Download

### Purpose
Download the audit PDF from a History row (circular control with download arrow).

### States
Default icon button · Hover/Focus · Loading (spinner on icon) · Disabled (Free / no PDF / offline) · Error (toast)

### Validation Rules
- User owns audit; tier allows PDF (Pro/Business); PDF exists (`hasPdf`).
- Free → Upgrade instead of download.

### Accessibility
- `aria-label="Download PDF for {report title}"` (not icon-only).
- Loading: `aria-busy`.

### API Dependency
- `GET /report/{auditId}/pdf` (alias `/audits/{id}/report/pdf`) → short-lived signed URL → browser download.

### Analytics
- `pdf_downloaded`, `pdf_download_failed`, `history_pdf_clicked`

### Keyboard Behaviour
- **Tab** to icon; **Enter**/**Space** download.

---

# BTN-012 — Chip Dismiss (✕)

### Purpose
Dismiss status chips (upload success/fail, Invalid URL) and/or remove associated upload preview.

### States
Default ✕ · Hover/Focus · Pressed (removes chip / clears error / removes file)

### Validation Rules
- None beyond parent ownership of the chip.

### Accessibility
- `aria-label="Dismiss"` / “Remove uploaded image” / “Clear error”.

### API Dependency
- None (client UI). If removing uploaded file, drop key from pending `screenshotKeys`.

### Analytics
- `chip_dismissed` `{ type }`, `screenshot_removed`, clear URL error (no required event)

### Keyboard Behaviour
- **Tab** to ✕; **Enter**/**Space** dismiss.

---

# BTN-013 — Avatar Menu Trigger

### Purpose
Open Guest or authenticated profile dropdown from header avatar.

### States
Default · Hover/Focus · Expanded (`aria-expanded=true`) · Menu closed on Esc/outside

### Validation Rules
- None.

### Accessibility
- `aria-haspopup="menu"`; `aria-expanded`; `aria-label="Account menu"`.
- Focus returns to trigger on close.

### API Dependency
- None to open; menu items may call `signOut` or navigate.

### Analytics
- `account_menu_opened`, `guest_menu_opened`

### Keyboard Behaviour
- **Enter**/**Space** open; **Esc** close; arrows inside menu (menu pattern).

---

# BTN-014 — Credits Badge Control

### Purpose
Header credits display as a control: open Billing / Manage Plan (or SSO if guest). Pairs with credits display component.

### States
Default (colored by balance band) · Hover/Focus · Loading skeleton

### Validation Rules
- None on click; destination depends on auth.

### Accessibility
- `aria-label="Credits: {n} remaining"` / “Unlimited”; role button or link.

### API Dependency
- Read: `GET /user/credits` (alias `/credits`) / `GET /me`. Click → navigate (no write).

### Analytics
- `credits_badge_clicked`

### Keyboard Behaviour
- **Enter**/**Space** navigate.

---

# BTN-015 — Premium Crown Control

### Purpose
Gold crown in Pro header — shortcut to Manage Plan / billing.

### States
Default · Hover/Focus · Hidden for Free/Guest

### Validation Rules
- Visible when tier is Pro/Business (or paid-looking state).

### Accessibility
- Not icon-only: `aria-label="Premium plan — Manage plan"`.

### API Dependency
- None; navigation only. Tier from `GET /membership` / `GET /me`.

### Analytics
- `premium_badge_clicked`

### Keyboard Behaviour
- **Enter**/**Space** → Manage Plan.

---

# BTN-016 — Profile Avatar Edit

### Purpose
Pencil control on Account Settings avatar to change photo (triggers INP-013).

### States
Default · Hover/Focus · Uploading (busy on avatar)

### Validation Rules
- Delegates to INP-013 (image type/size).

### Accessibility
- `aria-label="Change profile photo"`.

### API Dependency
- Same as INP-013 (`/uploads/sign` → `PATCH /me`).

### Analytics
- `avatar_upload_clicked`, `avatar_uploaded`

### Keyboard Behaviour
- **Enter**/**Space** open file picker.

---

# BTN-017 — History Report Link

### Purpose
Open audit report from History row title (underlined purple text, e.g. “UX Audit for apple.pdf”).

### States
Default link style · Hover (underline/emphasis) · Focus ring · Disabled if audit not COMPLETED (optional)

### Validation Rules
- User owns audit; if still processing → Progress; if failed → Failure view.

### Accessibility
- Link name includes title + date context; real `<a href>` or button with clear name.

### API Dependency
- Navigate to `/audit/{id}`; data via `GET /audits/{id}` (+ report endpoints).

### Analytics
- `history_row_opened` `{ auditId }`

### Keyboard Behaviour
- **Tab** to link; **Enter** activate.

---

## Shared button rules (all BTN-*)

| Topic | Rule |
|-------|------|
| Primitive | Prefer shadcn `Button` variants (primary / outline / ghost / icon) |
| Loading | Spinner + `aria-busy` + disabled; don’t lose accessible name |
| Focus | Visible focus ring always |
| Target | ≥ 44×44 px (icons included) |
| Contrast | Purple fill + white text AA; outline purple on white AA |
| Icons | Decorative icons `aria-hidden`; provide `aria-label` when icon-only |
| Double submit | Disable on click until request settles; Idempotency-Key on charge APIs |
| Reduced motion | No essential info by animation only |

---

# Part 3 — Card Components

Runtime behavior for **cards** in uploaded screens, cross-checked with SCREEN_MAPPING and COMPONENT_MAPPING (`Card`, `PlanCard`, history rows).

**Tokens:** Surface `#F8FDFF` / white fills · Primary/Secondary accents · Radius **Large 16px** · Shadow SM/MD · Spacing 8/16/24 · Manrope.

## Card inventory (from uploaded screens)

| ID | Component | Screens |
|----|-----------|---------|
| CARD-001 | Plan / Pricing Card | Manage Plan (Screen4 / 4.1 / 4.2) — Free, Pro, Business |
| CARD-002 | History Audit Card | History populated (Screen8) |
| CARD-003 | Manage Plan Panel | Manage Plan shell (white rounded container holding plan cards) |
| CARD-004 | Payment Details Visual Card | Account Settings → Payment Details — “Credit Card Details” graphic panel (decorative + label) |

**Not in uploaded screens (defer to Report / Dashboard pass):** Score Card, Recommendation Card, Stat/Metric Card, Auth Card layout, Report summary cards. Payment Success/Failed and SSO are **modals** (see Part 4 — MDL-*).

---

# CARD-001 — Plan / Pricing Card

### Purpose
Display one subscription tier (Free / Pro / Business): group label, name, price, feature copy, and CTA (Subscribe or Active Account). Composes Manage Plan comparison.

### States
| State | Behaviour |
|-------|-----------|
| Normal | Default border, full content from `plans.ts` |
| Hovered | Border Primary/Secondary; optional Shadow MD |
| Selected | Stronger ring when focused in group (pre-checkout) |
| Recommended | Purple “Recommended” badge (Business) |
| Purchased / Current | CTA = outlined **Active Account**; no Checkout |
| Expired | “Expired”/“Past due” treatment; CTA Renew/Subscribe |
| Loading | CTA spinner while Checkout session creates |
| Disabled | CTA blocked (offline / redirecting) |

### Validation Rules
- Content from **`src/config/plans.ts`** / PRICING.md (Free **$0**, Pro **$29**, Business **$99**) — never hardcode prices in UI.
- Subscribe only for `PRO` / `ENTERPRISE`; Free has no Checkout CTA.
- Current tier must not re-purchase (`409`).
- Guest Subscribe → SSO with intent, then Checkout.

### Accessibility
- Plan name as **heading**; features as a **list**.
- Price as text (“29 dollars per month”).
- Recommended / Current / Expired in text, not color-only.
- CTA names: “Subscribe to Pro”, “Active Account”, “Renew Business”.
- Keyboard: Tab to card/CTA; focus-visible ring.

### API Dependency
- Read current plan: `GET /membership`.
- Subscribe: `POST /billing/checkout` `{ tier, billingInterval: "MONTHLY" }` → Stripe Checkout URL.
- Entitlements via webhook only.

### Analytics
- `pricing_clicked` `{ tier, state, isRecommended, isCurrent }`
- `checkout_started`, `current_plan_viewed` (impression on Purchased)

### Keyboard Behaviour
- **Tab** across cards and CTAs.
- **Enter** / **Space** on Subscribe → checkout pipeline.
- Optional **Arrow** keys to move selection in a radiogroup pattern.

---

# CARD-002 — History Audit Card

### Purpose
Show one past audit in History: report title (link), date, and download control. Grouped under period headers (“This year”, “2025”).

### States
| State | Behaviour |
|-------|-----------|
| Default | Purple-bordered row/card; title + date + download |
| Hover | Background/border emphasis |
| Focus | Focus-visible on card or inner controls |
| Loading | Skeleton row while list fetches |
| Download loading | Spinner on download icon (BTN-011) |
| Empty list | Not this card — page empty state (“No History to display”) |
| Error | Toast on download/open failure; card remains |

### Validation Rules
- Row only for audits owned by the user.
- Title link: COMPLETED → Report; PROCESSING → Progress; FAILED → Failure view.
- Download: Pro/Business + PDF available; else Upgrade / disable.

### Accessibility
- Card as article/list item; title link name includes report name + date.
- Download control has its own `aria-label` (BTN-011).
- Group headers are headings (“This year”).

### API Dependency
- List: `GET /history` (alias `/audits?limit=&cursor=&sort=-createdAt`).
- Open: navigate + `GET /audits/{id}` (+ report).
- Download: `GET /audits/{id}/report/pdf` signed URL.

### Analytics
- `history_row_opened`, `history_pdf_clicked` / `pdf_downloaded`
- `history_card_hovered` optional

### Keyboard Behaviour
- **Tab** to title link, then download button.
- **Enter** on link opens report; **Enter**/**Space** on download starts PDF fetch.

---

# CARD-003 — Manage Plan Panel

### Purpose
White rounded container titled **“Manage Plan”** that hosts the three Pricing Cards. Acts as the billing comparison surface (modal or full panel over dimmed app chrome in designs).

### States
| State | Behaviour |
|-------|-----------|
| Default / Open | Panel visible with three CARD-001 instances |
| Loading | Membership skeleton inside panel |
| Behind overlay | Dimmed when Payment / Success / Failed modals open (still mounted) |
| Closed | User leaves route / dismisses if modal |

### Validation Rules
- Must render exactly the plan catalog order: Free → Pro → Business (`PLAN_DISPLAY_ORDER`).
- Prices/features always from config.

### Accessibility
- If modal: `role="dialog"`, `aria-modal`, labelled by “Manage Plan” heading, focus trap, Esc dismiss (if dismissible).
- If page: `main` region + `h1` “Manage Plan”.
- Focus order: heading → Free card → Pro → Business.

### API Dependency
- `GET /membership` (and `GET /me`) to mark Purchased/Expired on child cards.
- No direct write; children call checkout.

### Analytics
- `manage_plan_viewed`
- Child card events as CARD-001

### Keyboard Behaviour
- **Tab** through panel chrome then cards.
- **Esc** closes if implemented as modal; otherwise browser back / nav.

---

# CARD-004 — Payment Details Visual Card

### Purpose
Left-column graphic panel on Account Settings → Payment Details (“Credit Card Details” over card collage). Communicates context for the payment form; largely **decorative**, not a data card.

### States
| State | Behaviour |
|-------|-----------|
| Default | Hex/rounded frame + overlay title |
| Hidden | Collapsed/hidden on small breakpoints (form stacks) |
| Loading | Optional shimmer while payment method loads |

### Validation Rules
- None (non-interactive). Must not be the only cue that the form is for cards.

### Accessibility
- Treat as decorative: `alt=""` / `aria-hidden="true"` on collage; visible form labels carry meaning.
- Overlay text “Credit Card Details” can be `aria-hidden` if the form heading already exists — or use as `h2` if it’s the section heading (prefer one clear heading for the form).

### API Dependency
- None.

### Analytics
- None required.

### Keyboard Behaviour
- Not focusable (decorative). Tab moves to Name on Card (INP-004).

---

## Shared card rules (all CARD-*)

| Topic | Rule |
|-------|------|
| Primitive | Build on shadcn `Card` where interactive/content cards |
| Radius | Large **16px** (plan + history) |
| Border | Light grey default; Primary/Secondary on hover/recommended |
| Elevation | Shadow SM default; Shadow MD on hover for interactive cards |
| Typography | Manrope; price uses Primary purple |
| Interactive cards | Keyboard reachable; hover ≠ only affordance |
| Loading | Skeleton matching card shape |
| Empty | Parent empty state — don’t render zero cards with errors |
| PCI / payment | CARD-004 decorative only; real payment fields are Inputs + Stripe |

---

# Part 4 — Modal Components

Runtime behavior for **modals / dialogs** in uploaded screens. Built on shadcn/Radix `Dialog`. Cross-checked with SCREEN_MAPPING (SCREEN-003, 005–008).

**Tokens:** White dialog surface · dimmed overlay · Radius Large **16px** · Shadow LG · Primary/Secondary CTAs · Success `#16A34A` · Error `#DC2626` · Manrope.

## Modal inventory (from uploaded screens)

| ID | Component | Screens |
|----|-----------|---------|
| MDL-001 | SSO Login Modal | Screen3 over Landing |
| MDL-002 | Manage Plan Modal | Screen4 / 4.1 / 4.2 (panel over app chrome) |
| MDL-003 | Payment Modal | Screen5 over Manage Plan |
| MDL-004 | Payment Failed Modal | Screen5.1 / 5.2 |
| MDL-005 | Payment Success Modal | Screen5.3 / 5.4 |

**Not in uploads (defer):** Upgrade Dialog (M08), Confirm Dialog (delete/cancel), Session Expired, cookie consent. Profile dropdown = **Menu**, not modal.

> **Related:** MDL-002 hosts **CARD-001** plan cards; MDL-003 hosts payment **INP-*** fields + **BTN-008**.

---

# MDL-001 — SSO Login Modal

### Purpose
Authenticate via Google, Apple, or Microsoft OAuth. Opened from Guest Profile → Login, or gated actions (URL audit, Subscribe while guest).

### States
| State | Behaviour |
|-------|-----------|
| Closed | Not in DOM or `hidden`; trigger retains focus after close |
| Open / Default | Centered white dialog; three OAuth buttons; backdrop dimmed |
| Provider loading | Selected button “redirecting”; `aria-busy`; other providers disabled |
| Error | Inline Alert (provider denied/cancelled/failed); modal stays open |
| Success | Session set → close → resume intent (Home / Checkout / audit) |

### Validation Rules
- `redirectTo` allow-listed; PKCE via Supabase.
- Only configured providers (google / apple / azure).
- Overlay click / Esc dismiss allowed unless a redirect is in flight (block dismiss while loading).

### Accessibility
- `role="dialog"` + `aria-modal="true"`; labelled by title (e.g. “Log in to Audient”) — add visible title if missing in crop.
- **Focus trap**; initial focus first OAuth button; focus return to trigger on close.
- **Esc** closes; backdrop click closes (when not loading).
- OAuth buttons: full names (“Login with Google”, etc.).

### API Dependency
- `signInWithOAuth(provider)` → provider → callback → `GET /me`.
- Seeds Free membership/credits on first login.

### Analytics
- `login_modal_opened` `{ source }`
- `oauth_started` / `oauth_succeeded` / `oauth_failed` `{ provider }`
- `login_modal_dismissed`

### Keyboard Behaviour
- **Tab** / **Shift+Tab** cycle OAuth buttons (and close control if present).
- **Enter** / **Space** activate provider.
- **Esc** dismiss.

---

# MDL-002 — Manage Plan Modal

### Purpose
Present Free / Pro / Business comparison and CTAs. Opened from Profile → Manage Plan, Credits badge, Crown, or upgrade gates. Designs show a large white “Manage Plan” surface over dimmed header.

### States
| State | Behaviour |
|-------|-----------|
| Closed | Hidden |
| Open | Title “Manage Plan” + three **CARD-001** instances |
| Loading | Skeleton cards while `GET /membership` loads |
| Child checkout | May stay mounted under MDL-003 / Success / Failed |
| Error | Toast if membership fetch fails; retry |

### Validation Rules
- Plan data from `plans.ts` (Pro **$29**, Business **$99**).
- Subscribe rules owned by CARD-001 / BTN-006.
- Dismiss: Esc / backdrop only if Product allows (designs lack clear X — **recommend** Esc + optional X + backdrop).

### Accessibility
- Dialog semantics + `aria-labelledby` → “Manage Plan”.
- Focus trap; initial focus heading or first Subscribe.
- When Payment modal opens on top, move focus into MDL-003; on close, return focus to Manage Plan trigger CTA.

### API Dependency
- `GET /membership`, `GET /me`.
- Checkout via child Subscribe → `POST /billing/checkout`.

### Analytics
- `manage_plan_viewed`, `manage_plan_dismissed`
- Child: `pricing_clicked`, `checkout_started`

### Keyboard Behaviour
- **Tab** through plan CTAs.
- **Esc** closes Manage Plan (if no child modal open); if Payment open, Esc closes Payment first.

---

# MDL-003 — Payment Modal

### Purpose
Collect plan selection + payment (card fields + OTP per Figma) to complete Subscribe. Opens from Manage Plan **Subscribe**.

### States
| State | Behaviour |
|-------|-----------|
| Open | Title “Payment”; plan dropdown; price; card fields; OTP; **Update Changes** |
| Field errors | Inline red validation (card, etc.) |
| OTP pending | Countdown badge (e.g. 119 S) |
| Submitting | CTA loading; inputs disabled |
| Success path | Close → open MDL-005 (or replace content) |
| Failure path | Close → open MDL-004 |
| Dismiss | Backdrop/Esc (confirm if form dirty — recommended) |

### Validation Rules
- Plan = Pro or Business; amounts from server/config.
- Card + OTP rules per INP-004–009.
- **Implement with Stripe Elements / Checkout + 3DS** (PCI); Figma OTP ≈ SCA challenge.

### Accessibility
- Dialog + focus trap; title “Payment”.
- Labels on all fields; OTP group labelled; errors `aria-describedby`.
- Announce countdown via polite live region (throttled).
- Initial focus: plan select or first field.

### API Dependency
- `POST /billing/checkout` and/or PaymentIntent confirm (Stripe).
- Entitlements **only** after verified webhook.
- `GET /membership` / `GET /credits` after success.

### Analytics
- `payment_modal_opened` `{ tier }`
- `payment_plan_changed`, `payment_submitted`, `payment_otp_*`
- `payment_modal_dismissed`

### Keyboard Behaviour
- **Tab** order: Plan → Name → Number → CVV → Expiry → Save → OTP → Update Changes.
- **Enter** submits when valid.
- **Esc** dismiss (with dirty check).

---

# MDL-004 — Payment Failed Modal

### Purpose
Confirm that payment for a plan (e.g. Pro) **failed**. Centered white dialog, red ✕ icon, message: `Payment for "Pro" subscription failed`.

### States
| State | Behaviour |
|-------|-----------|
| Open | Icon + failure message over dimmed Manage Plan |
| Dismissed | Back to Manage Plan (MDL-002); user can retry Subscribe |

**Recommended CTAs** (not always visible in crop): **Try again** → reopen MDL-003; **Close** / backdrop.

### Validation Rules
- Triggered only after payment provider failure (decline, 3DS fail, network).
- **No** credits or membership grant.
- Message should include plan name dynamically.

### Accessibility
- Prefer `role="alertdialog"`; assertive live announcement of failure text.
- Focus primary recovery control (Try again) or message heading.
- Icon decorative (`aria-hidden`); meaning in text.
- Esc / backdrop dismiss.

### API Dependency
- None to display (outcome of prior payment attempt).
- Retry → same checkout/PaymentIntent flow as MDL-003.
- Optional: read decline code for friendlier copy (no sensitive raw data).

### Analytics
- `payment_failed_modal_viewed` `{ tier, reason? }`
- `payment_retry_clicked`, `payment_failed_dismissed`

### Keyboard Behaviour
- **Tab** to Try again / Close.
- **Enter** on Try again; **Esc** dismiss.

---

# MDL-005 — Payment Success Modal

### Purpose
Confirm successful subscription payment. Green check + sparkles; message like `Payment for "Pro" subscription is Successful` (fix Figma typo “Succesfull” → **Successful** in product copy).

### States
| State | Behaviour |
|-------|-----------|
| Open | Success icon + message |
| Webhook pending | Optional “Activating your plan…” if membership not yet ACTIVE |
| Dismissed / Continue | Navigate to Pro Home; refresh credits/crown |

**Recommended CTA:** **Continue** (designs may omit X — still provide Esc + Continue).

### Validation Rules
- Show after provider success **or** client return from Checkout.
- Do **not** treat UI alone as entitlement — poll `GET /membership` until ACTIVE or timeout, then sync Credits badge.
- Plan name in message must match purchased tier.

### Accessibility
- `role="alertdialog"` or `dialog` with polite/assertive success text.
- Focus Continue; Esc dismisses equivalently.
- Icon decorative; success in text.

### API Dependency
- Poll `GET /membership` + `GET /credits` (webhook delay).
- No charge API on this modal.

### Analytics
- `payment_success_modal_viewed` `{ tier }`
- `plan_activated` when membership confirms
- `payment_success_continued` / dismissed

### Keyboard Behaviour
- **Enter** / **Space** on Continue; **Esc** close → Pro Home / Manage Plan.

---

## Shared modal rules (all MDL-*)

| Topic | Rule |
|-------|------|
| Primitive | shadcn/Radix `Dialog` |
| Overlay | Dimmed backdrop; click-to-dismiss when allowed |
| Focus | Trap while open; restore to trigger on close |
| Stacking | Only one “top” modal interactive (Payment over Manage Plan); Esc closes topmost first |
| Scroll | Lock body scroll while open |
| Motion | Open/close animation respects `prefers-reduced-motion` |
| Titles | Visible accessible name required |
| Security | Never show raw card data in Success/Failed copy |
| Mobile | Near full-width / sheet; sticky primary CTA where needed |

### Open / close map

```text
Guest Login → MDL-001
Manage Plan → MDL-002
  Subscribe → MDL-003
    fail → MDL-004 → (retry) MDL-003
    success → MDL-005 → Pro Home
```

---

## Next passes

- Badges (Credits bands, Severity, Recommended)
- Menus (Profile dropdown items)
- Progress / Report surfaces (when designs land)

---
