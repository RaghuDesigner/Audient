# Audient — UI Build Checklist

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Source:** `SCREEN_MAPPING.md` · `MISSING_SCREENS_PLAN.md` · `PRICING.md` · `ANALYTICS.md` · `ACCESSIBILITY.md`  
**Format:** Markdown only — checkbox lists for build/QA. No application code.

**How to use:** Check items as built and verified. Prices/credits: Free **300** · Pro **$29 / 1,000** · Business **$99 / 10,000** · Guest **1** screenshot (`PRICING.md`) — update Figma copy where screens still show older numbers. Payments: implement with **Stripe Elements / Checkout** (PCI); treat Screen5 card fields as visual reference (R4).

**Legend:** □ = not done · ☑ = done (mark in your tracker). Cross-cutting items (Mobile / Tablet / Desktop / Accessibility / Analytics / API Integration) appear on every screen.

---

## Index

| ID | Screen |
|----|--------|
| SCREEN-001 | Landing (Guest) |
| SCREEN-002 | Guest Profile Dropdown |
| SCREEN-003 | SSO Login Modal |
| SCREEN-004 | Logged-in Home (Free) |
| SCREEN-005 | Manage Plan |
| SCREEN-006 | Payment Modal |
| SCREEN-007 | Payment Failed Modal |
| SCREEN-008 | Payment Success Modal |
| SCREEN-009 | Pro Home (Premium) |
| SCREEN-010 | Account Settings — Personal |
| SCREEN-011 | Account Settings — Payment Details |
| SCREEN-012 | History (Populated) |
| SCREEN-013 | History (Empty) |
| SCREEN-M01 | Audit Progress |
| SCREEN-M02 | Audit Report / Result |
| SCREEN-M03 | Audit Failure |
| SCREEN-M04 | Notifications |
| SCREEN-M05 | Buy Credits |
| SCREEN-M06 | Billing Management |
| SCREEN-M07 | Checkout Return |
| SCREEN-M08 | Upgrade Dialog |
| SCREEN-M09 | 404 Not Found |
| SCREEN-M10 | 500 Error / Boundary |
| SCREEN-M11 | Offline |
| SCREEN-M12 | Legal & Consent |
| SCREEN-M13 | Privacy Policy |
| SCREEN-M14 | Terms of Service |
| SCREEN-M15 | Delete Account |
| SCREEN-M16 | Session Expired |
| SCREEN-M17 | Maintenance |

---

## SCREEN-001 — Landing (Guest)

□ Header  
□ Logo (“Audient — AUDIT · ANALYZE · ELEVATE UX”)  
□ Credits teaser (guest: **1 free audit** / cost display — server-authoritative)  
□ Guest Avatar (gray circle)  
□ Hero H1 (“Turn Your Website Into a Better User Experience”)  
□ Hero subcopy  
□ Upload image / Screenshot tile  
□ Website URL input  
□ GO button (disabled / gray until valid; guest URL gated)  
□ Upload success chip (green “…image uploaded ✕”)  
□ Upload failure chip (red “…image failed ✕”)  
□ Invalid URL chip (red)  
□ Chip dismiss (✕)  
□ Empty / pristine inputs  
□ Loading (upload progress)  
□ Loading (GO spinner / `aria-busy`)  
□ Disabled GO (no input)  
□ Offline banner (blocks upload/GO)  
□ Rate-limit toast (429)  
□ API timeout toast (retry)  
□ Opens Guest Profile Dropdown (SCREEN-002)  
□ Opens SSO on gated URL / second guest attempt (SCREEN-003)  
□ Navigate to Progress after create (SCREEN-M01)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility  
□ Analytics (`upload_screenshot_clicked`, `screenshot_uploaded`, `screenshot_removed`, `go_clicked`, `guest_url_gated`, `guest_menu_opened`)  
□ API Integration (`GET /me` session detect · `POST /uploads/sign` · `POST /audits` screenshot · Idempotency-Key)

---

## SCREEN-002 — Guest Profile Dropdown

□ Avatar trigger  
□ Menu open / close  
□ Login item (enabled)  
□ Profile item (disabled)  
□ History item (disabled)  
□ Manage Plan item (disabled)  
□ Account Settings item (disabled)  
□ Disabled tooltip (“Log in to access”)  
□ Hover / focus on items  
□ Esc closes + focus returns to avatar  
□ Outside click closes  
□ Opens SSO Login Modal (SCREEN-003)  
□ Mobile (bottom sheet / full-width)  
□ Tablet  
□ Desktop (anchored dropdown)  
□ Accessibility (`role="menu"`, `menuitem`, `aria-disabled`, `aria-expanded`)  
□ Analytics (`guest_login_clicked`, `guest_disabled_item_clicked`)  
□ API Integration (none direct — UI only)

---

## SCREEN-003 — SSO Login Modal

□ Overlay / dimmed backdrop  
□ Dialog shell  
□ Login with Google button  
□ Login with Apple button  
□ Login with Microsoft button  
□ Brand icons (`aria-hidden`)  
□ Loading / redirecting (active provider `aria-busy`)  
□ Other providers disabled while loading  
□ Error / Alert (provider denied/cancelled)  
□ Success (close + redirect + hydrate)  
□ Dismiss (Esc / overlay) when not loading  
□ Focus trap  
□ Focus restore to trigger  
□ Offline (providers disabled + banner)  
□ 429 throttle message  
□ “Taking longer…” timeout copy  
□ Resume post-login intent (guest audit / upgrade)  
□ Mobile (near-full-width sheet)  
□ Tablet  
□ Desktop (centered)  
□ Accessibility (`role="dialog"`, `aria-modal`, ≥44px targets)  
□ Analytics (`oauth_started{google|apple|microsoft}`, `oauth_succeeded`, `login_modal_dismissed`)  
□ API Integration (Supabase OAuth google/apple/azure · `GET /me` hydrate)

---

## SCREEN-004 — Logged-in Home (Free)

□ Header  
□ Logo  
□ Credits (live from API)  
□ Profile Avatar (photo)  
□ Authenticated Profile Dropdown  
□ Profile menu item  
□ Manage Plan menu item  
□ History menu item  
□ Account Settings menu item  
□ Logout menu item  
□ Hero (same as landing)  
□ Upload tile  
□ Website URL input  
□ GO button (screenshot enabled; URL gated / gray)  
□ Upload success chip  
□ Upload / URL failure chips  
□ Header skeleton (loading me/credits)  
□ Loading (GO / upload)  
□ Success (navigate to SCREEN-M01)  
□ Failure (`422` credits → Upgrade M08)  
□ Free URL → Upgrade Dialog (SCREEN-M08)  
□ Expired session → SSO  
□ Offline banner  
□ 429 / API timeout  
□ Email-not-verified banner (if gated)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (skip link, credits announced, gated URL explained)  
□ Analytics (`audit_started{screenshot}`, `url_attempt_gated`, `profile_opened`, `manage_plan_opened`, `history_opened`, `settings_opened`, `logout`)  
□ API Integration (`GET /me` · `GET /credits` · `POST /uploads/sign` · `POST /audits` · `signOut`)

---

## SCREEN-005 — Manage Plan

□ Header / page chrome  
□ Individual group label  
□ Free plan card ($0 · 300 credits copy per PRICING)  
□ Pro plan card (**$29/mo** · crown · 1,000 credits)  
□ Business plan card (**$99/mo** · crown · **Recommended** badge · 10,000 credits)  
□ Feature lists per card  
□ Subscribe button (Pro)  
□ Subscribe button (Business)  
□ Active Account button (current paid plan — non-purchase)  
□ Free card (no Subscribe CTA)  
□ Loading (Subscribe spinner)  
□ Failure → Payment Failed (SCREEN-007)  
□ Success → Payment Success (SCREEN-008)  
□ Webhook delay (“updating your plan…”)  
□ Expired session  
□ 429  
□ Hover / focus / pressed on cards & CTAs  
□ Mobile (stacked; Recommended first)  
□ Tablet (2+1 or scroll)  
□ Desktop (3-column)  
□ Accessibility (headings, price readable, Recommended not colour-only)  
□ Analytics (`subscribe_clicked{pro|business}`, `current_plan_viewed`)  
□ API Integration (`GET /membership` · `POST /billing/checkout` · Idempotency-Key)

---

## SCREEN-006 — Payment Modal

□ Dialog title (“Payment”)  
□ Plan dropdown / selected plan  
□ Price display (server-authoritative; Pro $29 / Business $99)  
□ Stripe Payment Element / Checkout fields (tokenized — **no raw PAN to Audient**)  
□ Name on card (if Element requires)  
□ Save card details (if supported by Stripe)  
□ 3DS / SCA challenge (maps designed OTP UI)  
□ OTP / 3DS countdown or provider UI  
□ OTP expired → resend (if applicable)  
□ Confirm / pay button (“Update Changes” visual)  
□ Field validation errors (inline red)  
□ Loading (“processing payment”, `aria-busy`)  
□ Success → SCREEN-008  
□ Failure → SCREEN-007  
□ Offline  
□ API timeout  
□ Expired session  
□ Focus trap  
□ Mobile (full-height sheet; sticky CTA)  
□ Tablet  
□ Desktop  
□ Accessibility (labels, errors `aria-describedby`, status live region)  
□ Analytics (`payment_plan_changed`, `payment_submitted`, `payment_otp_submitted`, `payment_otp_resend`, `payment_succeeded`, `payment_failed`)  
□ API Integration (`POST /billing/checkout` / PaymentIntent · Stripe confirm · webhook entitlements only)

---

## SCREEN-007 — Payment Failed Modal

□ Overlay / dialog  
□ Error icon (red ✕)  
□ Failure title  
□ Failure message  
□ Retry / Try again button  
□ Change payment method / Back action  
□ Dismiss (Esc / close)  
□ Loading (n/a or retry busy)  
□ Error (as primary content)  
□ Success (n/a — exits to retry or home)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (dialog, focus to heading, alert semantics)  
□ Analytics (`payment_failed_viewed`, `payment_retry_clicked`)  
□ API Integration (none required beyond retry → SCREEN-006)

---

## SCREEN-008 — Payment Success Modal

□ Overlay / dialog  
□ Success icon  
□ Success title (fix “Successful” typo if present in design)  
□ Success message  
□ Continue / Go to Home CTA → Pro Home (SCREEN-009)  
□ Header update after webhook (crown, credits)  
□ Loading / Activating while webhook lag  
□ Error (webhook timeout → support / poll retry)  
□ Success (confirmed membership ACTIVE)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (`aria-live="polite"`, focus to heading)  
□ Analytics (`payment_succeeded_viewed`, `payment_success_continued`)  
□ API Integration (poll `GET /membership` · `GET /credits` — **do not** grant from modal alone)

---

## SCREEN-009 — Pro Home (Premium)

□ Header  
□ Logo  
□ Gold crown (Premium)  
□ Credits (e.g. 1,000 Pro / 10,000 Business)  
□ Avatar  
□ Hero  
□ Upload tile  
□ Website URL input (**enabled**)  
□ GO button (**solid purple / enabled**)  
□ Invalid URL chip (red “Invalid URL ✕”)  
□ Upload success / fail chips  
□ Loading (GO spinner)  
□ Success → SCREEN-M01  
□ Failure (create error toast)  
□ PAST_DUE / lapsed premium prompt  
□ Crown click → Manage Plan (SCREEN-005)  
□ Offline / 429 / timeout / expired session  
□ Mobile (crown may fold into menu)  
□ Tablet  
□ Desktop  
□ Accessibility (crown `aria-label` “Premium plan”, `inputmode="url"`, GO `aria-busy`)  
□ Analytics (`url_audit_started`, `audit_started{screenshot}`, `premium_badge_clicked`)  
□ API Integration (`GET /me` · `GET /credits` · `POST /audits` URL|SCREENSHOT · status poll via M01)

---

## SCREEN-010 — Account Settings — Personal

□ Breadcrumb (Home / Account Settings)  
□ Tabs (Personal active · Payment Details)  
□ Avatar (circular)  
□ Avatar edit pencil / upload  
□ First Name input  
□ Last Name input  
□ Email input (**read-only** — auth-managed; resolve R6 duplicate)  
□ Update Changes button  
□ Loading (Update spinner)  
□ Success (“Saved” toast)  
□ Failure (inline field errors)  
□ Skeleton (initial load)  
□ Avatar uploading busy  
□ Expired session  
□ Mobile (single column; avatar on top)  
□ Tablet  
□ Desktop (avatar left / form right)  
□ Accessibility (`tablist`/`tab`/`tabpanel`, `autocomplete`, save `aria-live`)  
□ Analytics (`avatar_updated`, `profile_updated`, `settings_tab_changed`)  
□ API Integration (`GET /me` · `PATCH /me` · `POST /uploads/sign` for avatar)

---

## SCREEN-011 — Account Settings — Payment Details

□ Breadcrumb / Tabs (Payment Details active)  
□ “Credit Card Details” graphic (decorative)  
□ Stripe Elements / Payment Method form (**tokenized**)  
□ Name on card (Element)  
□ Card number Element (show last-4 + brand after save — never store PAN)  
□ CVV / Expiry via Stripe Element  
□ Invalid card inline error (“Invalid Credit number” pattern)  
□ Valid card state  
□ Update Changes button  
□ Loading  
□ Success  
□ Failure  
□ Offline  
□ Mobile (stacked; numeric keyboards)  
□ Tablet  
□ Desktop (graphic left / form right)  
□ Accessibility (`autocomplete="cc-*"`, errors described, graphic `alt=""`)  
□ Analytics (`payment_method_updated`)  
□ API Integration (Stripe tokenize · `POST /billing/payment-method` · never raw PAN to Audient)

---

## SCREEN-012 — History (Populated)

□ Header (Logo · Credits · crown if premium · Avatar)  
□ Breadcrumb (Home / History)  
□ Year / period group headers (“This year”, “2025”, …)  
□ Row: report title link  
□ Row: date  
□ Row: download icon / button  
□ Row hover / focus  
□ Download loading (spinner on icon)  
□ Open report → SCREEN-M02  
□ PDF download (paid tier; signed URL)  
□ Loading skeleton rows  
□ Pagination / load more (if used)  
□ Failure (download / list error toast)  
□ Offline  
□ Expired session  
□ Empty → render SCREEN-013 instead  
□ Mobile (stacked rows; ≥44px download)  
□ Tablet  
□ Desktop (wide rows)  
□ Accessibility (group headings, labeled links, download name)  
□ Analytics (`history_row_opened`, `pdf_downloaded`)  
□ API Integration (`GET /audits` · `GET /audits/{id}/report/pdf`)

---

## SCREEN-013 — History (Empty)

□ Header  
□ Breadcrumb (Home / History)  
□ Centered message (“No History to display”)  
□ Recommended CTA (“Run your first audit”) → Home  
□ Loading skeleton (before empty resolve)  
□ Error state (fetch failed — **distinct from empty**)  
□ Empty state (confirmed empty list)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (heading; CTA as button; contrast ≥4.5:1 on empty text)  
□ Analytics (`empty_history_cta_clicked`, `history_empty_viewed`)  
□ API Integration (`GET /audits` → empty array)

---

## SCREEN-M01 — Audit Progress

□ Header (Logo · Credits · Avatar)  
□ Breadcrumb (Home / Auditing…)  
□ Website / screenshot context label  
□ Progress bar or circular progress  
□ Stage list (screenshot set)  
□ Stage list (URL set)  
□ ETA (“About Xs remaining”)  
□ Cancel audit control  
□ Cancel confirm dialog  
□ Queued state  
□ Processing state  
□ Reconnecting state  
□ Completed → auto-redirect SCREEN-M02  
□ Failed → SCREEN-M03  
□ Cancelled → refund messaging → Home  
□ Timeout failure  
□ Resume after refresh  
□ Offline banner  
□ Loading (initial status)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (`role="progressbar"`, throttled `aria-live` on stage change)  
□ Analytics (`audit_progress_viewed`, `audit_cancelled`, `audit_completed`, `audit_failed`)  
□ API Integration (`GET /audits/{id}/status` poll ~3s · optional Realtime `audit:{id}`)

---

## SCREEN-M02 — Audit Report / Result

□ Header  
□ Breadcrumb (Home / Report)  
□ Website URL or “Screenshot audit” label  
□ Download PDF button (Pro/Business)  
□ Upgrade for PDF CTA (Free)  
□ Overall UX Score  
□ Score band / colour + text alternative  
□ Executive summary  
□ Category scores grid  
□ Strengths section (hide if empty)  
□ Weaknesses / issue cards + severity badges  
□ Recommendation cards  
□ Locked / blurred recommendations (Free) + Upgrade  
□ Annotated screenshot (if available)  
□ Feedback (👍 👎 / useful)  
□ Re-audit button  
□ Loading report skeleton  
□ PDF generating (“Generating PDF…”)  
□ PDF ready  
□ PDF download failed (toast + retry; no credit refund claim)  
□ No report found  
□ Free teaser depth  
□ Full paid depth  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (scores as text; list semantics; PDF a11y note)  
□ Analytics (`report_viewed`, `recommendation_expanded`, `pdf_downloaded`, `report_upgrade_prompt`, `report_feedback`, `reaudit_clicked`)  
□ API Integration (`GET /audits/{id}` · `.../report` · `.../recommendations` · `.../report/pdf` · `POST .../feedback`)

---

## SCREEN-M03 — Audit Failure

□ Error icon (red)  
□ Title from failure taxonomy  
□ User-facing message  
□ “Credits refunded” chip (when eligible)  
□ Try again CTA  
□ Upload screenshot instead CTA (e.g. bot-blocked)  
□ Back home CTA  
□ Support reference / correlationId  
□ Taxonomy: URL_INVALID  
□ Taxonomy: URL_UNREACHABLE  
□ Taxonomy: SSRF_BLOCKED  
□ Taxonomy: SITE_BLOCKS_BOT  
□ Taxonomy: AUTH_REQUIRED  
□ Taxonomy: PAGE_TOO_HEAVY  
□ Taxonomy: SCREENSHOT_INVALID  
□ Taxonomy: CRAWL_TIMEOUT  
□ Taxonomy: AI_UNAVAILABLE  
□ Taxonomy: CREDIT_DEDUCT_FAILED  
□ Taxonomy: PDF_FAILED (report intact path)  
□ Taxonomy: RATE_LIMITED  
□ Taxonomy: INTERNAL_ERROR  
□ Loading (n/a)  
□ Error (primary)  
□ Success (n/a)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (`role="alert"`, focus to title)  
□ Analytics (per-code `audit_failed{…}`)  
□ API Integration (status FAILED payload · retry = new `POST /audits` + Idempotency-Key)

---

## SCREEN-M04 — Notifications

□ Header bell icon (left of Credits)  
□ Unread badge  
□ Notifications dropdown / panel  
□ “See all” → `/notifications`  
□ Item: AUDIT_COMPLETE → M02  
□ Item: LOW_CREDITS → M05/M08  
□ Item: PAYMENT_SUCCEEDED → Home  
□ Item: SUBSCRIPTION_EXPIRING → M06  
□ Mark as read  
□ Mark all read  
□ Empty (“No notifications”)  
□ Loading skeleton  
□ Error load state  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (list, live region polite for new items)  
□ Analytics (`notification_opened`, `notification_marked_read`, `notifications_viewed`)  
□ API Integration (`GET /notifications` · `PATCH /notifications/{id}` · `POST /notifications/read-all`)

---

## SCREEN-M05 — Buy Credits

□ Page or modal shell  
□ Pack: 500 credits / $9  
□ Pack: 2,000 credits / $29  
□ Pack: 5,000 credits / $59  
□ Select pack  
□ Checkout CTA (Stripe Checkout / Element)  
□ Free user blocked → Upgrade (M08)  
□ Loading  
□ Success (toast + header credits refresh)  
□ Failure  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility  
□ Analytics (`topup_pack_selected`, `topup_checkout_started`, `topup_succeeded`)  
□ API Integration (`POST /credits/topups` · webhook credit grant · `GET /credits`)

---

## SCREEN-M06 — Billing Management

□ Current plan display  
□ Renewal / period end date  
□ Status (ACTIVE / PAST_DUE / CANCELED / TRIALING)  
□ Manage in Stripe Portal CTA  
□ Invoice / payment history list  
□ Empty payments (“No payments yet”)  
□ Cancel / downgrade via Portal  
□ Loading  
□ Error  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility  
□ Analytics (`billing_portal_opened`, `invoices_viewed`)  
□ API Integration (`GET /membership` · `POST /billing/portal` · `GET /payments`)

---

## SCREEN-M07 — Checkout Return

□ Route `/billing/return?status=success|cancel`  
□ Success state  
□ Cancel state (“Checkout cancelled”)  
□ Activating / webhook delay copy  
□ Poll membership until ACTIVE or timeout  
□ Navigate Pro Home on success  
□ Navigate Manage Plan on cancel  
□ Loading  
□ Error / timeout support CTA  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (`role="status"` for activating)  
□ Analytics (`checkout_return_success`, `checkout_return_cancel`, `webhook_delay_shown`)  
□ API Integration (poll `GET /membership` · `GET /credits`)

---

## SCREEN-M08 — Upgrade Dialog

□ Modal shell (same family as SSO/Payment)  
□ Title (reason-specific: URL / PDF / credits / locked recs)  
□ Benefit copy (1–2 sentences)  
□ Mini plan strip: Pro **$29** · Business **$99** (Recommended)  
□ Upgrade to Pro CTA → Manage Plan / Payment  
□ Maybe later dismiss  
□ Loading (n/a or CTA busy)  
□ Error (n/a)  
□ Success (navigates away)  
□ Triggers: Free URL GO  
□ Triggers: Free PDF  
□ Triggers: INSUFFICIENT_CREDITS  
□ Triggers: locked recommendation expand  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (focus trap, Esc, restore focus)  
□ Analytics (`upgrade_dialog_opened{reason}`, `upgrade_cta_clicked`, `upgrade_dismissed`)  
□ API Integration (none required; CTA → SCREEN-005/006)

---

## SCREEN-M09 — 404 Not Found

□ Centered message  
□ Go home CTA  
□ Optional illustration / EmptyState pattern  
□ Loading (n/a)  
□ Error (as page)  
□ Success (n/a)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (single H1)  
□ Analytics (`not_found_viewed`)  
□ API Integration (none — ownership 404s may reuse this UI)

---

## SCREEN-M10 — 500 Error / Boundary

□ Error boundary UI  
□ User message  
□ Correlation ID  
□ Try again CTA  
□ Go home CTA  
□ Loading (retry busy)  
□ Error (primary)  
□ Success (n/a)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility  
□ Analytics (`app_error_boundary`, `error_retry_clicked`)  
□ API Integration (none — client boundary; optional error report beacon)

---

## SCREEN-M11 — Offline

□ Sticky top banner (“You’re offline”)  
□ Blocks upload / GO / checkout while offline  
□ Reconnect clears banner  
□ Loading (n/a)  
□ Error (offline as state)  
□ Success (back online toast optional)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (`role="status"`)  
□ Analytics (`offline_shown`, `online_restored`)  
□ API Integration (client network detection; queue/retry UX only)

---

## SCREEN-M12 — Legal & Consent

□ Cookie / consent banner (first visit)  
□ Accept / Reject / Preferences controls  
□ Preferences link  
□ Blocks non-essential analytics until consent (per ANALYTICS.md)  
□ Loading  
□ Error  
□ Success (preferences saved)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (focus management on banner)  
□ Analytics (consent events only after allowed)  
□ API Integration (local preference store; optional consent API if added later)

---

## SCREEN-M13 — Privacy Policy

□ Static SSR page  
□ Heading / body content  
□ Footer / nav link from Landing  
□ Loading  
□ Error (n/a)  
□ Success (n/a)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (readable landmarks, heading hierarchy)  
□ Analytics (`legal_page_viewed{privacy}`)  
□ API Integration (none)

---

## SCREEN-M14 — Terms of Service

□ Static SSR page  
□ Heading / body content  
□ Footer / nav link from Landing  
□ Loading  
□ Error (n/a)  
□ Success (n/a)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility  
□ Analytics (`legal_page_viewed{terms}`)  
□ API Integration (none)

---

## SCREEN-M15 — Delete Account

□ Danger zone in Account Settings  
□ Warning copy  
□ Type DELETE confirmation  
□ Confirm delete button  
□ Cancel  
□ Loading (delete in flight)  
□ Error (`409` cancel subscription first, etc.)  
□ Success → signed out → Landing  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (clear warnings, confirm dialog)  
□ Analytics (`account_delete_started`, `account_deleted`)  
□ API Integration (`DELETE /me`)

---

## SCREEN-M16 — Session Expired

□ Modal (“Session expired”)  
□ Re-login CTA → SSO (SCREEN-003)  
□ Resume intent after re-auth  
□ Dismiss / restricted  
□ Loading (re-auth)  
□ Error (auth fail)  
□ Success (session restored)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (focus trap)  
□ Analytics (`session_expired_shown`, `session_restored`)  
□ API Integration (401 handling · SSO · resume)

---

## SCREEN-M17 — Maintenance

□ Full-page maintenance message  
□ Optional ETA / status link  
□ No app chrome actions (or read-only)  
□ Loading (n/a)  
□ Error (n/a)  
□ Success (n/a — wait)  
□ Mobile  
□ Tablet  
□ Desktop  
□ Accessibility (single H1)  
□ Analytics (`maintenance_viewed`)  
□ API Integration (feature flag / status endpoint if used)

---

## Global chrome (shared — check once, verify on each screen)

□ Logo link behaviour  
□ Credits meter (bands / skeleton)  
□ Avatar menu (guest vs authed)  
□ Crown (Pro/Business only)  
□ Skip to main content  
□ Toast / snackbar host  
□ Focus-visible rings  
□ `prefers-reduced-motion` respected  
□ Touch targets ≥44px  
□ No invented dark-mode skin  

---

## MVP sign-off (P0 screens)

□ SCREEN-001 Landing  
□ SCREEN-002 Guest menu  
□ SCREEN-003 SSO  
□ SCREEN-004 Free Home  
□ SCREEN-005 Manage Plan  
□ SCREEN-006 Payment (Stripe-safe)  
□ SCREEN-007 Payment Failed  
□ SCREEN-008 Payment Success  
□ SCREEN-009 Pro Home  
□ SCREEN-M01 Progress  
□ SCREEN-M02 Report  
□ SCREEN-M03 Failure  
□ SCREEN-M08 Upgrade  
□ Mobile / Tablet / Desktop spot-check on all P0  
□ Accessibility WCAG 2.2 AA on P0 paths  
□ Analytics core funnel events  
□ API Integration against staging  

---

**Related:** `FRONTEND_TASKS.md` · `SCREEN_MAPPING.md` · `MISSING_SCREENS_PLAN.md` · `TEST_CASES.md`

**End of UI_BUILD_CHECKLIST.md**
