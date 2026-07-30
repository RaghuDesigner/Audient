# Audient — QA Test Cases

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** SCREEN_MAPPING · BUSINESS_RULES · VALIDATION_RULES · ERROR_HANDLING · ACCESSIBILITY · ANALYTICS · API.md · AUTH/AUDIT/USER/BILLING_API · PRICING · SECURITY · STATE_MANAGEMENT · prd.md

**Audience:** QA · Engineering · Product  
**Format:** Markdown only — no application code.

**Source of truth:** uploaded Figma screens + project docs. Do not invent UI. **OOS** cases are skippable until designed (teams, search, share, password).

**Catalogue size:** **476** test scenarios.

---

## 1. How to use this document

| Field | Meaning |
|-------|---------|
| **Test Case ID** | Stable ID (`TC-{MODULE}-{nnn}`) |
| **Priority** | P0 release blocker · P1 high · P2 medium |
| **Module** | Functional area |
| **Preconditions** | Account / tier / data setup |
| **Steps** | Actions to perform |
| **Expected Result** | Observable outcome |
| **Actual Result** | Filled during execution (blank = not run) |
| **Status** | `Not Run` · `Pass` · `Fail` · `Blocked` · `Skipped` |
| **Automation Candidate** | `Yes` · `Partial` · `No` |
| **Regression** | Include in regression suite |
| **Smoke Test** | Include in smoke suite |
| **Edge Cases** | Boundary / unusual path |
| **Negative Tests** | Invalid / unauthorized / failure path |
| **Performance Tests** | Timing / load / SLA |
| **Browser Compatibility** | Explicit cross-browser verification |
| **Mobile Testing** | Phone / tablet required |
| **Accessibility Testing** | WCAG 2.2 AA focus |

### Environments & personas

| Env | Use |
|-----|-----|
| Local | Dev smoke |
| Staging | Full regression + Stripe test mode |
| Production | Synthetic smoke only (no live PAN) |

| Persona | Setup |
|---------|-------|
| Guest | Cleared storage; unused guest screenshot quota |
| Free | SSO; `FREE`; ~300 credits |
| Pro | `PRO` ACTIVE; credits; Stripe test PM |
| Business | `ENTERPRISE` ACTIVE; 10k credits |
| PAST_DUE | Failed renewal |
| Unverified | `emailVerified=false` |

### Smoke path

All **Smoke=Yes** rows. Minimum happy path: Landing → guest screenshot audit → login claim → Free URL gate → Subscribe Pro → URL audit → report → PDF → logout.

### OOS / skip

| Area | Policy |
|------|--------|
| Teams / invites / roles | Skip TC-ENT-004…007 (BR-ENT-003 FUTURE) |
| History search/filter | Assert absent (TC-HIST-013) |
| Report share / password auth / referral | Not tested |
| Theme/language | Skip until UI (TC-SET-013) |

---

## 2. Coverage matrix

| Module | Count |
|--------|------:|
| Website Audit | 35 |
| API | 30 |
| Landing Page | 30 |
| Screenshot Audit | 30 |
| Audit Report | 25 |
| Authentication | 25 |
| Billing | 25 |
| Credits | 25 |
| Validation | 25 |
| Accessibility | 24 |
| Dashboard | 20 |
| Error Handling | 20 |
| History | 20 |
| PDF Export | 20 |
| Security | 20 |
| Settings | 20 |
| Subscriptions | 20 |
| Notifications | 15 |
| Performance | 15 |
| Enterprise Features | 12 |
| Browser Compatibility | 10 |
| Mobile Testing | 10 |
| **Total** | **476** |

| Flag | Count |
|------|------:|
| Smoke=Yes | 126 |
| Regression=Yes | 476 |
| Negative=Yes | 162 |
| Edge=Yes | 111 |
| Performance=Yes | 38 |
| Accessibility=Yes | 63 |
| Mobile=Yes | 427 |

---

## 3. Master test catalogue

Defaults: **Actual Result** blank · **Status** `Not Run`.

### Authentication

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-AUTH-001 | P0 | Authentication | Guest on Landing | Open avatar → Login | SCREEN-003 SSO opens |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-002 | P0 | Authentication | SSO open | Complete Google OAuth | Session + Home/resume |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-003 | P0 | Authentication | SSO open | Complete Apple OAuth | Session created |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-AUTH-004 | P0 | Authentication | SSO open | Complete Microsoft OAuth | Session created |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-AUTH-005 | P0 | Authentication | Brand-new IdP user | First login | FREE + 300 credits seeded |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-006 | P1 | Authentication | Existing user | Login again | No credit re-seed to 300 |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-AUTH-007 | P0 | Authentication | SSO open | Cancel IdP consent | Error/stay; can retry |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-AUTH-008 | P1 | Authentication | SSO open | Provider timeout | Friendly error + retry |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-AUTH-009 | P0 | Authentication | Logged in | Logout | Guest Landing |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-010 | P0 | Authentication | Expired JWT | Open History | Session expired + re-auth |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-AUTH-011 | P0 | Authentication | No session | Open /history via UI | Blocked; login required |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-AUTH-012 | P1 | Authentication | SSO open | Esc | Closes; focus restore |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-AUTH-013 | P1 | Authentication | SSO open | Click overlay | Dismisses per MDL rules |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-AUTH-014 | P1 | Authentication | SSO open | Start Google; try Apple | Others disabled; aria-busy |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | Yes |
| TC-AUTH-015 | P0 | Authentication | Guest audit done | Login | Audit claimed (BR-GUEST-006) |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-016 | P1 | Authentication | emailVerified=false | Start audit | EMAIL_NOT_VERIFIED gate |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-AUTH-017 | P2 | Authentication | Offline | Click provider | Offline UX |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-AUTH-018 | P1 | Authentication | Auth RL tripped | Retry OAuth | 429 surfaced |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-AUTH-019 | P1 | Authentication | No Bearer | Call GET /me | 401 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-AUTH-020 | P2 | Authentication | SSO open | Inspect UI | No password fields |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-AUTH-021 | P1 | Authentication | URL-gate intent | Login | Resume upgrade |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-AUTH-022 | P1 | Authentication | Guest intent | Login | Resume audit/report |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-AUTH-023 | P2 | Authentication | Apple relay | First login | Profile usable |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-AUTH-024 | P1 | Authentication | Two sessions | Logout one | Other invalidated or independent per policy |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | No | No |
| TC-AUTH-025 | P1 | Authentication | SSO open | Keyboard only login Google | Full keyboard path |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |

### Landing Page

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-LAND-001 | P0 | Landing Page | Cold visit | Open / | SCREEN-001 renders H1 + form |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-LAND-002 | P0 | Landing Page | Guest | View header | Credits display guest value; avatar |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-LAND-003 | P0 | Landing Page | Guest | Click Upload tile | File picker opens |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-LAND-004 | P1 | Landing Page | Guest | Paste valid URL only | URL field accepts; GO gated for URL |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-005 | P0 | Landing Page | Guest | URL + GO | guest_url_gated → SSO/upgrade |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-LAND-006 | P1 | Landing Page | Guest | Empty GO click | GO disabled / no audit |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-007 | P1 | Landing Page | Guest | Invalid URL blur | Validation error chip |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-008 | P1 | Landing Page | Guest | Open avatar | SCREEN-002; Login enabled others disabled |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-LAND-009 | P2 | Landing Page | Guest menu | Click History | No-op + tooltip |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-010 | P1 | Landing Page | Guest | UTM params in URL | Page loads; UTM retained for analytics |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-LAND-011 | P1 | Landing Page | Guest | Refresh mid-upload | No corrupt state; re-upload possible |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-LAND-012 | P2 | Landing Page | Guest | Deep-link with hash | Stable render |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-LAND-013 | P1 | Landing Page | Offline | Try upload | Offline banner; blocked |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-LAND-014 | P1 | Landing Page | Guest | Rapid GO clicks | Single create / idempotent |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-LAND-015 | P2 | Landing Page | Guest | Zoom 200% | Form usable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-LAND-016 | P0 | Landing Page | Guest | Complete 1 screenshot audit | Progress→brief report allowed |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-LAND-017 | P0 | Landing Page | After guest audit used | Upload+GO again | Login required (BR-GUEST-004) |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-LAND-018 | P1 | Landing Page | Guest | Remove upload chip | File cleared; can re-add |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-LAND-019 | P2 | Landing Page | Guest | Logo click | Stays/reloads Landing |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-LAND-020 | P1 | Landing Page | Guest | Paste URL with spaces | Trim/validate per VAL-URL |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-LAND-021 | P1 | Landing Page | Guest | http:// public URL | Accept or normalize per rules |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-LAND-022 | P0 | Landing Page | Guest | javascript:alert(1) URL | Rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-023 | P0 | Landing Page | Guest | http://127.0.0.1 URL | SSRF blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-LAND-024 | P2 | Landing Page | iPhone Safari | Load Landing | Layout stacks; targets ≥44px |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-LAND-025 | P1 | Landing Page | Guest | Use upload without drag | Button picker available |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-LAND-026 | P2 | Landing Page | Guest | Hero copy visible | Matches design; single H1 |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-LAND-027 | P1 | Landing Page | 429 guest create | Trigger RL | Rate limit toast |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-LAND-028 | P2 | Landing Page | Consent rejected | Load + interact | Essential UI works; analytics off |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-LAND-029 | P1 | Landing Page | Guest | Long URL > max | Too long error |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-LAND-030 | P2 | Landing Page | Chrome/Firefox/Safari | Smoke Landing | Parity render |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |

### Dashboard

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-HOME-001 | P0 | Dashboard | Free user | Login → Home | SCREEN-004; real credits |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-002 | P0 | Dashboard | Pro user | Login → Home | SCREEN-009; purple GO; crown |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-003 | P0 | Dashboard | Free | Open profile menu | All items enabled |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-004 | P1 | Dashboard | Free | Header skeleton while loading | Skeleton then hydrate |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-005 | P0 | Dashboard | Free | Navigate Manage Plan | SCREEN-005 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-006 | P0 | Dashboard | Free | Navigate History | SCREEN-012/013 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-007 | P0 | Dashboard | Free | Navigate Settings | SCREEN-010 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-008 | P1 | Dashboard | Free | Credits badge click | Opens plan/credits UX per design |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-009 | P1 | Dashboard | Pro | Crown click | Manage Plan |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-010 | P1 | Dashboard | PAST_DUE Pro | Open Home | Premium limited + billing prompt |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-HOME-011 | P2 | Dashboard | Business user | Open Home | ENTERPRISE entitlements; crown |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-012 | P1 | Dashboard | Free | Tamper credits in DOM | Server balance unchanged |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-HOME-013 | P2 | Dashboard | Slow GET /me | Load Home | Timeout/retry UX |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-HOME-014 | P1 | Dashboard | Authenticated | Refresh Home | Session persists |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-015 | P2 | Dashboard | Mobile | Home layout | Stacked AuditForm |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HOME-016 | P1 | Dashboard | Free | URL attempt | Upgrade gate |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-HOME-017 | P0 | Dashboard | Pro | Valid URL + GO | Audit starts |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HOME-018 | P2 | Dashboard | Prefers-reduced-motion | Home | No essential motion loss |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-HOME-019 | P1 | Dashboard | Offline | Home actions | Banner; blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-HOME-020 | P2 | Dashboard | Multiple tabs | Change plan in A; refresh B | Credits/tier sync |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | No | No |

### Website Audit

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-URL-001 | P0 | Website Audit | Pro ACTIVE | Valid https URL + GO | 202; M01 progress |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-URL-002 | P0 | Website Audit | Business ACTIVE | Valid URL + GO | 202; credits deducted |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-URL-003 | P0 | Website Audit | Free | URL + GO | Upgrade gate; no charge |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-URL-004 | P0 | Website Audit | Guest | URL + GO | Login/upgrade gate |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-URL-005 | P0 | Website Audit | Pro | Poll until COMPLETED | M02 report |  | Not Run | Yes | Yes | Yes | No | No | Yes | Yes | Yes | No |
| TC-URL-006 | P0 | Website Audit | Pro | Force FAILED taxonomy | M03; refund if policy |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-007 | P1 | Website Audit | Pro | Cancel on M01 if supported | Cancelled; credit policy per BR |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-008 | P1 | Website Audit | Pro | Retry after fail | New audit or retry path |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-URL-009 | P0 | Website Audit | Pro | URL localhost | SSRF_BLOCKED |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-010 | P0 | Website Audit | Pro | URL link-local metadata IP | SSRF_BLOCKED |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-011 | P1 | Website Audit | Pro | Unreachable host | URL_UNREACHABLE + refund |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-012 | P1 | Website Audit | Pro | Bot-blocked site | SITE_BLOCKS_BOT messaging |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-013 | P1 | Website Audit | Pro | Login-walled URL | AUTH_REQUIRED |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-014 | P1 | Website Audit | Pro | Huge page | PAGE_TOO_HEAVY or timeout |  | Not Run | Yes | Yes | No | Yes | Yes | Yes | Yes | Yes | No |
| TC-URL-015 | P1 | Website Audit | Pro | Crawl timeout | CRAWL_TIMEOUT + refund |  | Not Run | Yes | Yes | No | No | Yes | Yes | Yes | Yes | No |
| TC-URL-016 | P0 | Website Audit | Pro low credits | URL costing > balance | INSUFFICIENT_CREDITS |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-URL-017 | P1 | Website Audit | Pro | Double submit GO | Idempotent single audit |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-018 | P1 | Website Audit | Pro | Invalid scheme ftp:// | Validation fail |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-019 | P2 | Website Audit | Pro | Internationalized domain | Handled or clear error |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-020 | P1 | Website Audit | Pro | AI unavailable | AI_UNAVAILABLE + refund |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-021 | P0 | Website Audit | Pro | Credits before/after | Balance -= URL cost (400) |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-URL-022 | P1 | Website Audit | Pro | Progress poll ~2s | UI updates; no SR spam |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | Yes |
| TC-URL-023 | P2 | Website Audit | Pro | Leave M01 and return | Resume progress |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-024 | P1 | Website Audit | Pro | Network blip mid-poll | Recovers or retry |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-025 | P2 | Website Audit | Pro | Compare timing to SLA | Within BR-URL-005 |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-URL-026 | P1 | Website Audit | Pro | www without scheme | Invalid or normalized per VAL |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-027 | P0 | Website Audit | Pro | Completed→report depth | Full paid report (BR-AI-003) |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-URL-028 | P1 | Website Audit | Pro | RATE_LIMITED create | 429 UX |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-029 | P2 | Website Audit | Pro | Concurrent 2 URL audits | Both queued or RL per policy |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-URL-030 | P1 | Website Audit | Pro | INTERNAL_ERROR | Friendly + support id |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-URL-031 | P2 | Website Audit | Mobile Pro | URL audit E2E | Works on mobile browser |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-URL-032 | P1 | Website Audit | Pro | CREDIT_DEDUCT_FAILED | No silent charge |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-URL-033 | P2 | Website Audit | Pro | Redirecting URL http→https | Audit follows public site policy |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-034 | P1 | Website Audit | Pro | Whitespace URL | Trimmed validation |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-URL-035 | P0 | Website Audit | Free after upgrade Pro | First URL audit | Succeeds with new entitlements |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |

### Screenshot Audit

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-SHOT-001 | P0 | Screenshot Audit | Guest unused quota | PNG upload + GO | 202; M01 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-002 | P0 | Screenshot Audit | Free | JPEG upload + GO | 202; deduct 150 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-003 | P0 | Screenshot Audit | Pro | WebP upload + GO | 202; deduct 100 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-004 | P0 | Screenshot Audit | Guest quota used | Second screenshot | Login required |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SHOT-005 | P1 | Screenshot Audit | Free | Upload GIF | Rejected type |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-006 | P1 | Screenshot Audit | Free | Upload PDF as image | Rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-007 | P1 | Screenshot Audit | Free | File > size limit | Size error |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-008 | P1 | Screenshot Audit | Free | Corrupt image bytes | SCREENSHOT_INVALID |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SHOT-009 | P1 | Screenshot Audit | Free | Upload 6 images if max 5 | Max count error |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SHOT-010 | P0 | Screenshot Audit | Free | Upload success chip | Green chip + remove |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-011 | P1 | Screenshot Audit | Free | Upload fail chip | Red chip + retry |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-012 | P1 | Screenshot Audit | Free | Remove chip then GO | Cannot start without input |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-013 | P0 | Screenshot Audit | Free | Complete audit | Brief Free report |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-014 | P0 | Screenshot Audit | Pro | Complete audit | Full report |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-015 | P1 | Screenshot Audit | Free | Insufficient credits | 422 + upgrade/topup CTA |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-016 | P1 | Screenshot Audit | Free | Sign URL expiry mid-PUT | Fail + retry |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SHOT-017 | P2 | Screenshot Audit | Free | Large valid image under cap | Accepts within timeout |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-SHOT-018 | P1 | Screenshot Audit | Free | Keyboard upload | Picker via Enter |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-SHOT-019 | P1 | Screenshot Audit | Offline | Upload | Blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-020 | P2 | Screenshot Audit | iOS | Photo library upload | Works |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SHOT-021 | P1 | Screenshot Audit | Free | Multiple images within limit | All attached; cost rules apply |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SHOT-022 | P0 | Screenshot Audit | Business | Screenshot audit | Lower credit cost 50 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SHOT-023 | P1 | Screenshot Audit | Free | HEIC if unsupported | Clear reject |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SHOT-024 | P2 | Screenshot Audit | Free | Filename unicode | Handled safely |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SHOT-025 | P1 | Screenshot Audit | Free | Idempotent create | No double deduct |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SHOT-026 | P1 | Screenshot Audit | Worker fail after deduct | Force fail | Auto-refund (BR-ERR-001) |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SHOT-027 | P2 | Screenshot Audit | Free | SLA timing | Within BR-SHOT-003 |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-SHOT-028 | P1 | Screenshot Audit | Guest | Abuse second device | RL/captcha per BR-GUEST-007 |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SHOT-029 | P2 | Screenshot Audit | Android Chrome | Upload+GO E2E | Success |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SHOT-030 | P1 | Screenshot Audit | Free | Progress cancel | Policy honored |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |

### Audit Report

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-RPT-001 | P0 | Audit Report | Completed Pro audit | Open M02 | Report scores + recommendations |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-RPT-002 | P0 | Audit Report | Completed Free audit | Open M02 | Brief Free depth (BR-AI-003) |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-RPT-003 | P1 | Audit Report | Report open | Expand recommendation | Disclosure works |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-004 | P1 | Audit Report | Report open | Submit feedback up/down | Persisted via API |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-RPT-005 | P0 | Audit Report | Other user audit id | Open report URL | 404/403 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-RPT-006 | P1 | Audit Report | Failed audit | Open report | Not available; M03 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-RPT-007 | P1 | Audit Report | In-progress | Open report early | Not ready UX |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-RPT-008 | P2 | Audit Report | Pro | Severity badges | Text+color |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-009 | P2 | Audit Report | Pro | Score gauges | Numeric text available |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-010 | P1 | Audit Report | Pro | Annotated screenshot | Alt/text description |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-011 | P1 | Audit Report | History | Open row | Navigates to report |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-RPT-012 | P2 | Audit Report | Pro | Copy recommendation if UI | Copies text |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-RPT-013 | P1 | Audit Report | Pro | Refresh report | Stable content |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-RPT-014 | P2 | Audit Report | Slow report API | Open | Loading then content |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-RPT-015 | P1 | Audit Report | Mobile | Report reflow | Readable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-016 | P0 | Audit Report | Guest brief report | View after guest audit | Readable teaser |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-RPT-017 | P2 | Audit Report | Pro | Categories present | Match BR-AI-002 dimensions |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-RPT-018 | P1 | Audit Report | Simulated bad AI output | Open/fail path | User-safe failure/refund |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-RPT-019 | P2 | Audit Report | Pro | Zoom 200% | No clipped critical content |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-020 | P1 | Audit Report | Session expire on report | Stay | Re-auth preserves |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-RPT-021 | P2 | Audit Report | Pro | Keyboard expand | Operable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-RPT-022 | P1 | Audit Report | Free | PDF gated messaging | Explains upgrade |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-RPT-023 | P2 | Audit Report | Pro | Empty recommendations edge | Graceful empty |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-RPT-024 | P1 | Audit Report | Pro | Deep link report id | Opens if owned |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-RPT-025 | P0 | Audit Report | Pro URL audit complete | Report full | Activation KPI path |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |

### PDF Export

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-PDF-001 | P0 | PDF Export | Pro completed | Download PDF | Signed URL; file downloads |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-PDF-002 | P0 | PDF Export | Business completed | Download PDF | Success; 0 credits (BR-PDF-002) |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-PDF-003 | P0 | PDF Export | Free completed | Download PDF | Blocked/gated |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-PDF-004 | P1 | PDF Export | Pro | PDF from History icon | Downloads |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-PDF-005 | P1 | PDF Export | Pro | Expired signed URL | Fail + regenerate |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-PDF-006 | P1 | PDF Export | Pro | PDF worker fail | Error; report intact; no audit refund |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-PDF-007 | P0 | PDF Export | Pro | Open PDF | Tagged/accessible PDF |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | Yes |
| TC-PDF-008 | P1 | PDF Export | Other user | GET pdf | 403/404 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-PDF-009 | P2 | PDF Export | Pro | Double click download | Single or safe multi |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-PDF-010 | P1 | PDF Export | Pro | Network fail mid-download | Error toast |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-PDF-011 | P2 | PDF Export | Pro | Large PDF gen time | Loading state; completes |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PDF-012 | P1 | PDF Export | Guest | PDF | Not available |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-PDF-013 | P2 | PDF Export | Mobile | Download | Works or share sheet |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-PDF-014 | P1 | PDF Export | Pro | Button aria-busy while gen | Announced |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-PDF-015 | P2 | PDF Export | Pro | Filename sensible | Contains audit identity |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-PDF-016 | P1 | PDF Export | PAST_DUE | PDF entitlement | Per BR-SUB-006 policy |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-PDF-017 | P2 | PDF Export | Chrome/Firefox | Open PDF | Renders |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-PDF-018 | P1 | PDF Export | Pro | Concurrent PDF requests | RL or succeed |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-PDF-019 | P2 | PDF Export | Pro | PDF text extractable | Not image-only |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-PDF-020 | P1 | PDF Export | Pro | Retry after PDF_FAILED | Succeeds |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |

### Credits

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-CRED-001 | P0 | Credits | Free new user | GET credits | 300 balance |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-002 | P0 | Credits | Pro new | GET credits | 1000 after activate |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-003 | P0 | Credits | Business | GET credits | 10000 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-004 | P0 | Credits | Free | Run screenshot | -150 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-005 | P0 | Credits | Pro | Run URL | -400 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-006 | P0 | Credits | Pro | Run screenshot | -100 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-007 | P0 | Credits | Business | Run URL | -100 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-008 | P0 | Credits | Any | Failed audit refundable | Credits restored |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-CRED-009 | P0 | Credits | Balance 0 | Start audit | INSUFFICIENT_CREDITS |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-CRED-010 | P1 | Credits | Free | Attempt top-up | Blocked (BR-CRED-006) |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-CRED-011 | P0 | Credits | Pro | Purchase top-up pack | Balance increases |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-012 | P1 | Credits | Pro | Monthly reset | Plan grant resets; top-up rollover per BR-CRED-005 |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-CRED-013 | P1 | Credits | Client shows 9999 | Server deduct | Server truth wins |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-CRED-014 | P1 | Credits | Refund fail | Force compensation fail | Alert; support path |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-CRED-015 | P2 | Credits | Header live update | After audit | Credits refresh |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-CRED-016 | P1 | Credits | Race two audits | Near-zero balance | One succeeds max; no negative |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-CRED-017 | P2 | Credits | Guest display | Landing | Teaser not fake 300 |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-CRED-018 | P1 | Credits | Pro | Buy credits CTA | Checkout/topup flow |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-CRED-019 | P2 | Credits | Ledger | Inspect transactions | DEDUCT/REFUND/GRANT rows |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-CRED-020 | P1 | Credits | Idempotent deduct | Retry same Idempotency-Key | Single deduct |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-CRED-021 | P2 | Credits | nextResetAt shown | Settings/billing | Accurate |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-CRED-022 | P1 | Credits | Business costs | Verify matrix | 50 shot / 100 URL |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-CRED-023 | P2 | Credits | Mobile | Credits readable | Named for SR |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-CRED-024 | P1 | Credits | Top-up webhook dup | Replay event | Idempotent grant |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-CRED-025 | P0 | Credits | After refund | Header | Updated balance |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |

### Subscriptions

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-SUB-001 | P0 | Subscriptions | Free | Open Manage Plan | Free/Pro/Business $0/$29/$99 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-002 | P0 | Subscriptions | Free | Subscribe Pro | Payment flow starts |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-003 | P0 | Subscriptions | Free | Subscribe Business | Payment for ENTERPRISE |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-004 | P0 | Subscriptions | Pro active | View Manage Plan | Active Account on Pro |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-005 | P1 | Subscriptions | Pro | Click Active Account | No new charge |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SUB-006 | P0 | Subscriptions | Webhook success | Confirm | Membership ACTIVE + credits |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-007 | P0 | Subscriptions | Before webhook | UI success only | No premature entitlements |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SUB-008 | P1 | Subscriptions | Pro→Business | Upgrade path | Entitlements update |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-009 | P1 | Subscriptions | Cancel via portal | Cancel | Cancelled; access per policy |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SUB-010 | P1 | Subscriptions | Renewal invoice.paid | Simulate | Renewed; credits grant |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SUB-011 | P0 | Subscriptions | Renewal fail | Simulate | PAST_DUE limits premium |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SUB-012 | P1 | Subscriptions | Monthly only | Inspect catalog | No annual in v1 |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SUB-013 | P2 | Subscriptions | Recommended badge | Business card | Visible + SR text |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-SUB-014 | P1 | Subscriptions | Already on Pro | Checkout Pro again | 409/already |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SUB-015 | P2 | Subscriptions | Portal open | Billing portal | External portal loads |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SUB-016 | P1 | Subscriptions | Webhook delay | After pay | Activating… then Home |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-SUB-017 | P0 | Subscriptions | Success modal | Continue | Pro Home SCREEN-009 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SUB-018 | P2 | Subscriptions | UI prices | Verify | $29/$99 not old Figma $99/$199 |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SUB-019 | P1 | Subscriptions | Free card | No Subscribe on Free | Correct CTAs only |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SUB-020 | P2 | Subscriptions | Mobile Manage Plan | Subscribe | Sheet usable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |

### Billing

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-BILL-001 | P0 | Billing | Checkout started | Complete Elements payment | payment_succeeded server |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-BILL-002 | P0 | Billing | Payment | Decline card | SCREEN-007; no entitlements |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-BILL-003 | P0 | Billing | Failed modal | Try again | Returns to payment |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-BILL-004 | P1 | Billing | 3DS required | Complete OTP/3DS | Succeeds |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BILL-005 | P1 | Billing | 3DS | Fail/abandon 3DS | Failed; no grant |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-BILL-006 | P0 | Billing | PCI | Inspect network | No raw PAN to Audient API |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-BILL-007 | P1 | Billing | Invalid card UI | Submit bad number | Field errors |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-BILL-008 | P1 | Billing | Save card checkbox | Check + succeed | Method saved if supported |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-009 | P1 | Billing | Settings Payment | Update method | payment_method_updated |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-010 | P1 | Billing | Webhook | Replay same event | Idempotent |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BILL-011 | P1 | Billing | Unsigned webhook | POST forge | Rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-BILL-012 | P2 | Billing | Invoice | Download if available | File or portal |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BILL-013 | P1 | Billing | Refund ops | Support refund | Ledger + Stripe aligned |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | No | No |
| TC-BILL-014 | P2 | Billing | Currency | Pay | USD cents correct |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-015 | P1 | Billing | Double submit pay | Click Update twice | Single intent |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BILL-016 | P2 | Billing | Offline mid-pay | Submit | Error; safe |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-BILL-017 | P1 | Billing | Timeout | Slow Stripe | Timeout UX |  | Not Run | Yes | Yes | No | No | Yes | Yes | Yes | Yes | No |
| TC-BILL-018 | P2 | Billing | Mobile payment sheet | Sticky CTA | Focus not obscured |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-BILL-019 | P1 | Billing | Dismiss failed | Close MDL-004 | Back to Manage Plan |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-020 | P0 | Billing | Top-up Pro | Complete top-up | credits_purchased |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-BILL-021 | P2 | Billing | Autocomplete attrs | Inspect fields | cc-* present |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-BILL-022 | P1 | Billing | Expired card | Pay | Decline messaging |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-BILL-023 | P2 | Billing | Browser matrix | Checkout | Chrome/Firefox/Safari |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-024 | P1 | Billing | Plan dropdown | Change Pro→Business | Price updates; no charge yet |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BILL-025 | P0 | Billing | Success | Webhook+poll ACTIVE | Crown + URL enabled |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |

### Notifications

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-NOTIF-001 | P1 | Notifications | M04 built | Open notifications | List loads |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-002 | P0 | Notifications | Audit completes | Receive notif | AUDIT_COMPLETE type |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-NOTIF-003 | P1 | Notifications | Open notif | Click item | Opens report |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-004 | P1 | Notifications | Mark read | PATCH read | Unread clears |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-005 | P0 | Notifications | Other user | GET their notifs | 403/empty |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-NOTIF-006 | P2 | Notifications | Empty | Open panel | Empty state |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-007 | P1 | Notifications | Guest | Notifications | Unavailable |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-NOTIF-008 | P2 | Notifications | Types | Only allowed BR-NOTIF-001 | No junk types |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-009 | P2 | Notifications | Keyboard | Open/read | Operable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-NOTIF-010 | P1 | Notifications | Payment failed notif | If sent | Opens billing |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-011 | P2 | Notifications | Mobile | Bell + list | Usable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-NOTIF-012 | P1 | Notifications | Realtime delay | Complete audit | Notif within SLA |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-NOTIF-013 | P2 | Notifications | Many unread | Badge count | Accurate |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-NOTIF-014 | P1 | Notifications | Session expired | Open notifs | Re-auth |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-NOTIF-015 | P2 | Notifications | Mark all if exists | Action | All read |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |

### Settings

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-SET-001 | P0 | Settings | Auth | Open Personal | SCREEN-010 fields |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SET-002 | P0 | Settings | Auth | Update first/last name | Saved toast |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SET-003 | P0 | Settings | Auth | Try edit email | Read-only (BR-AUTH-005) |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SET-004 | P1 | Settings | Auth | Invalid name | Inline errors |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SET-005 | P1 | Settings | Auth | Change avatar valid | Updates |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SET-006 | P1 | Settings | Auth | Avatar too large | Error |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SET-007 | P0 | Settings | Auth | Switch Payment tab | SCREEN-011 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SET-008 | P1 | Settings | Pro | Update payment method | Success |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SET-009 | P1 | Settings | Tabs | Arrow keys | tablist pattern |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-SET-010 | P0 | Settings | Auth | Delete account start | Confirm M15 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SET-011 | P0 | Settings | Active sub | Delete without cancel | 409 cancel-sub-first |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SET-012 | P0 | Settings | Eligible | Confirm delete | GDPR erasure; logout |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SET-013 | P2 | Settings | Theme/language if absent | N/A | Skip — OOS until UI |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SET-014 | P1 | Settings | Offline | Save profile | Error |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SET-015 | P2 | Settings | Mobile | Settings forms | Usable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-SET-016 | P1 | Settings | Duplicate email fields R6 | Inspect | One logical email read-only |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SET-017 | P2 | Settings | autocomplete | Names | given-name/family-name |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-SET-018 | P1 | Settings | Rapid save | Double click | Single PATCH |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SET-019 | P2 | Settings | Skeleton load | Slow /me | Loading state |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-SET-020 | P1 | Settings | Session expire | Save | Re-auth |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |

### History

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-HIST-001 | P0 | History | User with audits | Open History | Grouped list |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HIST-002 | P0 | History | No audits | Open History | SCREEN-013 empty |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HIST-003 | P0 | History | List | Click row | Opens report |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HIST-004 | P0 | History | Pro | PDF icon | Downloads |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HIST-005 | P0 | History | Guest | Open History | Blocked |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-HIST-006 | P0 | History | User A | Access User B id | Denied |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-HIST-007 | P1 | History | Many audits | Scroll/load more | Pagination works |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-HIST-008 | P1 | History | Free | Depth limit | Older hidden per BR-HIST-003 |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-HIST-009 | P1 | History | Empty CTA | Click run first audit | Goes Home |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HIST-010 | P2 | History | Skeleton | Loading | Skeletons + status |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-HIST-011 | P1 | History | Failed audit row | Open | Failure or limited view |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-HIST-012 | P2 | History | Mobile | List | Tap targets OK |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HIST-013 | P1 | History | Search/filter | N/A OOS | Not present |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-HIST-014 | P2 | History | Offline | Open | Error/banner |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-HIST-015 | P1 | History | Claimed guest audit | After login | Appears in list |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-HIST-016 | P2 | History | Row names SR | Inspect | Title+date in name |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-HIST-017 | P1 | History | Concurrent complete | Refresh | New row appears |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-HIST-018 | P2 | History | Chrome/Safari | Open History | Parity |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-HIST-019 | P1 | History | PDF fail from history | Click download | Error toast |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-HIST-020 | P2 | History | Empty contrast | 013 text | ≥4.5:1 |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |

### Enterprise Features

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-ENT-001 | P0 | Enterprise Features | Business plan | URL+screenshot costs | Per Business matrix |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-ENT-002 | P0 | Enterprise Features | Business | 10k credits grant | Correct |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-ENT-003 | P1 | Enterprise Features | Business | PDF download | Allowed |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-ENT-004 | P2 | Enterprise Features | Teams invite | N/A | OOS BR-ENT-003 — skip |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-ENT-005 | P2 | Enterprise Features | Role change | N/A | OOS |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-ENT-006 | P2 | Enterprise Features | Team created | N/A | OOS |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-ENT-007 | P2 | Enterprise Features | White-label API | N/A | OOS BR-ENT-004 |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-ENT-008 | P1 | Enterprise Features | Business Recommended | Manage Plan | Badge visible |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-ENT-009 | P1 | Enterprise Features | Subscribe Business | Webhook | tier ENTERPRISE ACTIVE |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-ENT-010 | P2 | Enterprise Features | Unlimited copy in Figma | Product | Metered 10k not unlimited |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-ENT-011 | P1 | Enterprise Features | Business PAST_DUE | Premium features | Limited |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-ENT-012 | P2 | Enterprise Features | Feature parity v1 | Compare to Pro | BR-ENT-002 parity |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |

### Accessibility

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-A11Y-001 | P0 | Accessibility | Per ACCESSIBILITY.md | Landing keyboard order: Tab through header+form | Order per ACCESSIBILITY §23 |  | Not Run | Partial | Yes | Yes | No | No | No | Yes | Yes | Yes |
| TC-A11Y-002 | P1 | Accessibility | Per ACCESSIBILITY.md | Upload keyboard: Enter on upload | Picker opens |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-003 | P1 | Accessibility | Per ACCESSIBILITY.md | URL error a11y: Invalid URL | aria-invalid + describedby |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-004 | P1 | Accessibility | Per ACCESSIBILITY.md | Guest menu a11y: Esc menu | Focus restore |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-005 | P0 | Accessibility | Per ACCESSIBILITY.md | SSO focus trap: Tab in modal | Trap + Esc |  | Not Run | Partial | Yes | Yes | No | No | No | Yes | Yes | Yes |
| TC-A11Y-006 | P1 | Accessibility | Per ACCESSIBILITY.md | Provider names: SR providers | Login with … |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-007 | P1 | Accessibility | Per ACCESSIBILITY.md | Free URL gate announce: GO URL Free | Reason announced |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-008 | P1 | Accessibility | Per ACCESSIBILITY.md | Progressbar: Start audit | role=progressbar |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-009 | P1 | Accessibility | Per ACCESSIBILITY.md | Report scores: Open report | Numbers spoken |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-010 | P1 | Accessibility | Per ACCESSIBILITY.md | PDF control name: Focus PDF | Discernible name |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-011 | P1 | Accessibility | Per ACCESSIBILITY.md | Payment fail assertive: Decline | Alert + focus CTA |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-012 | P1 | Accessibility | Per ACCESSIBILITY.md | OTP group: Enter OTP | Group labelled; paste |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-013 | P1 | Accessibility | Per ACCESSIBILITY.md | Settings tabs: Arrows | tabpanels |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-014 | P1 | Accessibility | Per ACCESSIBILITY.md | History names: SR row | Title+date |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-015 | P1 | Accessibility | Per ACCESSIBILITY.md | Empty contrast: 013 | ≥4.5:1 |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-016 | P1 | Accessibility | Per ACCESSIBILITY.md | Warning token contrast: Inspect badges | AA or remediated |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-017 | P1 | Accessibility | Per ACCESSIBILITY.md | Reduced motion: OS reduce | No info loss |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-018 | P1 | Accessibility | Per ACCESSIBILITY.md | Touch targets: Mobile CTAs | ≥44px |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-019 | P1 | Accessibility | Per ACCESSIBILITY.md | Consent banner: M12 keyboard | Accept/Reject |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-020 | P1 | Accessibility | Per ACCESSIBILITY.md | Session expired focus: Expire | Focus login |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-021 | P1 | Accessibility | Per ACCESSIBILITY.md | Offline assertive: Disconnect | Banner alert |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-022 | P0 | Accessibility | Per ACCESSIBILITY.md | axe P0: Run axe | 0 Serious/Critical |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | Yes |
| TC-A11Y-023 | P1 | Accessibility | Per ACCESSIBILITY.md | Lighthouse: Landing+Report | ≥90 a11y |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-A11Y-024 | P1 | Accessibility | Per ACCESSIBILITY.md | Focus not obscured: Mobile pay | Field visible |  | Not Run | Partial | Yes | No | No | No | No | Yes | Yes | Yes |

### Security

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-SEC-001 | P0 | Security | Auth | Call API with userId body only | Ignored; token identity |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SEC-002 | P0 | Security | User A token | Access B audit | 403/404 |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SEC-003 | P0 | Security | Public | SSRF payloads | Blocked |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SEC-004 | P0 | Security | Upload | Direct storage URL guess | Private |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-005 | P0 | Security | Payment | PAN in Audient logs | Absent |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-SEC-006 | P1 | Security | API | Burst requests | 429 |  | Not Run | Yes | Yes | No | No | Yes | Yes | Yes | Yes | No |
| TC-SEC-007 | P0 | Security | Webhook | Bad signature | Rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-008 | P1 | Security | XSS | URL field script | Escaped/rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-009 | P1 | Security | XSS | Filename | Safe |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-010 | P1 | Security | CSRF | Cookie session mutate | Protected per arch |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-SEC-011 | P0 | Security | Delete account | Data gone | Erasure |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-SEC-012 | P1 | Security | AI training flag | Config | No training on customer data |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-SEC-013 | P1 | Security | Signed PDF URL | After expiry | Fails |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SEC-014 | P2 | Security | Security headers | HTTP | CSP/HSTS per SECURITY.md |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-SEC-015 | P1 | Security | IDOR history cursor | Manipulate | No leak |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-016 | P1 | Security | JWT forged | Send token | Rejected |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-SEC-017 | P2 | Security | Open redirect OAuth | Craft return | Blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-018 | P1 | Security | Guest quota bypass | Clear cookies craft | Server enforces |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-SEC-019 | P2 | Security | PII in analytics | Inspect events | No PAN/tokens |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-SEC-020 | P1 | Security | CORS | Evil origin | Blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |

### API

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-API-001 | P0 | API | Valid token | GET /me | 200 profile |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-002 | P0 | API | None | GET /me | 401 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-003 | P0 | API | Pro | POST /ai/audit URL | 202 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-004 | P0 | API | Free | POST URL audit | 403 TIER_NOT_ALLOWED |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-005 | P0 | API | Pro | GET /audit/{id} | progress/status |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-006 | P0 | API | Pro | GET report | 200 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-007 | P0 | API | Pro | GET pdf | signed URL |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-008 | P0 | API | Auth | GET /history | list+cursor |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-009 | P0 | API | Auth | GET /user/credits | balance |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-010 | P0 | API | Pro | POST /billing/checkout | checkout session |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-011 | P0 | API | Pro | POST /billing/topup | topup session |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-012 | P0 | API | Free | POST topup | 403 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-013 | P0 | API | Valid | POST /auth/google | session |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-014 | P1 | API | Bad id token | POST /auth/google | 401/400 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-015 | P1 | API | Invalid body | POST audit | 400 VALIDATION_ERROR |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-016 | P1 | API | Unknown id | GET audit | 404 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-017 | P1 | API | Idempotency-Key | Replay POST audit | Same audit |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | No | No |
| TC-API-018 | P1 | API | Cursor page | GET history | nextCursor |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-019 | P1 | API | RL | Burst | 429 RATE_LIMITED |  | Not Run | Yes | Yes | No | No | Yes | Yes | Yes | No | No |
| TC-API-020 | P1 | API | Webhook | stripe signed | 200 processing |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-021 | P2 | API | Health | GET /health | 200 |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-022 | P1 | API | PATCH /me | Update name | 200 |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-023 | P1 | API | DELETE /me | Eligible | 204/200 erased |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-024 | P1 | API | POST feedback | Valid | 200 |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-025 | P1 | API | Uploads sign | Valid meta | uploadUrl |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-API-026 | P1 | API | Uploads sign | Bad mime | 400 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-027 | P2 | API | Envelope | Errors | {error:{code,message}} |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-API-028 | P1 | API | Ownership | GET other report | 403/404 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-API-029 | P2 | API | Latency p95 | Critical GETs | Within SLO |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | No | No |
| TC-API-030 | P1 | API | OPTIONS/CORS | Allowed origin | OK |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |

### Error Handling

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-ERR-001 | P0 | Error Handling | Auth fail | Cancel OAuth | User-facing message |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-ERR-002 | P0 | Error Handling | Invalid URL | Submit | ERR-URL copy |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-ERR-003 | P0 | Error Handling | SSRF | Submit | Blocked message |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-004 | P0 | Error Handling | Insufficient credits | GO | Upgrade CTA |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-ERR-005 | P0 | Error Handling | Audit fail | M03 | Retry + refund clause |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-ERR-006 | P0 | Error Handling | Payment fail | MDL-004 | Try again |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-ERR-007 | P1 | Error Handling | Offline | Any mutate | Offline banner |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-008 | P1 | Error Handling | 429 | Burst | Rate limit toast |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-009 | P1 | Error Handling | 500 | Force | Boundary + correlationId |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-010 | P1 | Error Handling | Timeout | Slow API | Retry UX |  | Not Run | Yes | Yes | No | No | Yes | Yes | Yes | Yes | No |
| TC-ERR-011 | P1 | Error Handling | Session | Expire | M16 focus login |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-012 | P1 | Error Handling | PDF fail | Download | No audit refund |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-013 | P1 | Error Handling | Refund fail | Force | Support path |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-ERR-014 | P2 | Error Handling | Upload fail | Bad file | Chip error |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-015 | P2 | Error Handling | Webhook delay | Pay | Activating state |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-ERR-016 | P1 | Error Handling | Assertive errors | SR | Announced |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | Yes |
| TC-ERR-017 | P2 | Error Handling | Color-only | Inspect errors | Icon+text |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-ERR-018 | P1 | Error Handling | Idempotent retry | Retry create | No double charge |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-ERR-019 | P2 | Error Handling | 404 page | Bad route | M09 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-ERR-020 | P2 | Error Handling | Maintenance | Flag | Maintenance page |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |

### Validation

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-VAL-001 | P0 | Validation | URL | Empty | Required/disabled GO |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-VAL-002 | P0 | Validation | URL | not-a-url | Invalid message |  | Not Run | Yes | Yes | Yes | No | Yes | No | Yes | Yes | No |
| TC-VAL-003 | P0 | Validation | URL | https://ok.com | Passes client |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-VAL-004 | P0 | Validation | URL | 127.0.0.1 | SSRF server reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-005 | P0 | Validation | File | exe upload | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-006 | P0 | Validation | File | png ok | Accept |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-VAL-007 | P0 | Validation | File | oversize | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-008 | P0 | Validation | Credits | cost>balance | 422 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-009 | P1 | Validation | Card | Bad Luhn | Field error |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-010 | P1 | Validation | Expiry | Past date | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-011 | P1 | Validation | CVV | 1 digit | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-012 | P1 | Validation | OTP | Letters | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-013 | P1 | Validation | Name | Empty submit | Errors + focus first |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | Yes |
| TC-VAL-014 | P1 | Validation | Name | Too long | Reject |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |
| TC-VAL-015 | P1 | Validation | Avatar | wrong type | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-016 | P2 | Validation | URL | max length | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-017 | P1 | Validation | Plan | Invalid tier checkout | 400 |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | No | No |
| TC-VAL-018 | P2 | Validation | Idempotency | Missing key policy | Documented behavior |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | No | No |
| TC-VAL-019 | P1 | Validation | Upload count | max+1 | Reject |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-020 | P2 | Validation | Whitespace names | Trim | Trimmed |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-VAL-021 | P1 | Validation | email field | Attempt change | Blocked |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-022 | P2 | Validation | Unicode URL | Policy | Per VAL-URL |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-VAL-023 | P1 | Validation | GO no input | Click | No API call |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-024 | P2 | Validation | Stripe Element | Empty submit | Inline errors |  | Not Run | Yes | Yes | No | No | Yes | No | Yes | Yes | No |
| TC-VAL-025 | P1 | Validation | https messaging | http-only if disallowed | Matches VAL-URL copy |  | Not Run | Yes | Yes | No | Yes | Yes | No | Yes | Yes | No |

### Performance

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-PERF-001 | P1 | Performance | Landing | LCP | Within budget |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-002 | P1 | Performance | Home | TTI interactive | Budget |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-003 | P0 | Performance | Audit | Time to report | Within SLA |  | Not Run | Yes | Yes | Yes | No | No | Yes | Yes | Yes | No |
| TC-PERF-004 | P1 | Performance | PDF | Generation time | Budget |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-005 | P1 | Performance | API | p95 GET /me | SLO |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | No | No |
| TC-PERF-006 | P1 | Performance | History | 100 rows | Acceptable |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-007 | P2 | Performance | INP | Click GO | Good INP |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | Yes |
| TC-PERF-008 | P2 | Performance | CLS | Landing | Low CLS |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-009 | P1 | Performance | Upload | Large under cap | Completes |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-010 | P1 | Performance | Poll | No client meltdown | Backoff OK |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-011 | P2 | Performance | Mobile 3G | Home | Usable |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-PERF-012 | P1 | Performance | Webhook | Activation lag | UX handles |  | Not Run | Yes | Yes | No | Yes | No | Yes | Yes | Yes | No |
| TC-PERF-013 | P2 | Performance | Bundle | JS size | Budget |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | No | No |
| TC-PERF-014 | P1 | Performance | Concurrent users | Soak create | Stable |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | No | No |
| TC-PERF-015 | P2 | Performance | Image decode | Large shot | No UI freeze |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |

### Browser Compatibility

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-BRW-001 | P0 | Browser Compatibility | Chrome latest | Smoke P0 flows | Pass |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-BRW-002 | P0 | Browser Compatibility | Firefox latest | Smoke P0 | Pass |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-BRW-003 | P0 | Browser Compatibility | Safari latest | Smoke P0 | Pass |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | No | No |
| TC-BRW-004 | P1 | Browser Compatibility | Edge latest | Smoke auth+audit | Pass |  | Not Run | Yes | Yes | No | No | No | No | Yes | No | No |
| TC-BRW-005 | P1 | Browser Compatibility | Safari iOS | Audit+pay | Pass |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BRW-006 | P1 | Browser Compatibility | Chrome Android | Audit+pay | Pass |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BRW-007 | P2 | Browser Compatibility | Safari ITP | Cookies/session | Auth works |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BRW-008 | P2 | Browser Compatibility | Firefox Strict | Tracking | Essential works |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-BRW-009 | P1 | Browser Compatibility | Safari | Apple SSO | Works |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-BRW-010 | P2 | Browser Compatibility | Chrome | Stripe Elements | Renders |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |

### Mobile Testing

| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |
|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|
| TC-MOB-001 | P0 | Mobile Testing | iPhone | Landing→guest audit | E2E |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-MOB-002 | P0 | Mobile Testing | Android | Login+Home | E2E |  | Not Run | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| TC-MOB-003 | P1 | Mobile Testing | iOS | Payment sheet | Complete/fail |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-MOB-004 | P1 | Mobile Testing | Android | Upload from camera roll | Works |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | No |
| TC-MOB-005 | P1 | Mobile Testing | iOS | Numeric keyboards | URL/card/OTP |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-MOB-006 | P2 | Mobile Testing | Rotate | Home | No data loss |  | Not Run | Yes | Yes | No | Yes | No | No | Yes | Yes | No |
| TC-MOB-007 | P1 | Mobile Testing | Safe area | CTAs | Not under home indicator |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-MOB-008 | P2 | Mobile Testing | Slow network | Audit | Progress resilient |  | Not Run | Yes | Yes | No | No | No | Yes | Yes | Yes | No |
| TC-MOB-009 | P1 | Mobile Testing | VoiceOver | Landing | Critical path |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |
| TC-MOB-010 | P1 | Mobile Testing | TalkBack | SSO | Usable |  | Not Run | Yes | Yes | No | No | No | No | Yes | Yes | Yes |

---

## 4. Traceability

| Module | Primary refs |
|--------|--------------|
| Authentication | BR-AUTH-* · AUTH_API · SCREEN-003 |
| Landing / Dashboard | SCREEN-001/004/009 · BR-GUEST-* |
| Website / Screenshot Audit | BR-URL-* · BR-SHOT-* · AUDIT_API · M01–M03 |
| Report / PDF | BR-AI-* · BR-PDF-* · M02 |
| Credits / Billing / Subs | BR-CRED-* · BR-SUB-* · BR-BILL-* · PRICING |
| History / Notifications / Settings | BR-HIST-* · BR-NOTIF-* · SCREEN-010–013 |
| Enterprise | BR-ENT-* |
| Accessibility | ACCESSIBILITY.md |
| Security / API | SECURITY.md · API.md · BR-SEC-* |
| Errors / Validation | ERROR_HANDLING · VALIDATION_RULES |
| Performance / Browser / Mobile | ANALYTICS perf · SCREEN_MAPPING responsive |

---

## 5. Execution notes

1. Use **Stripe test mode** only; never real PAN in shared envs.
2. Verify entitlements via `GET /me` and `GET /user/credits` (server is source of truth).
3. Webhook cases need Stripe CLI / staging admin tools.
4. Log bugs with ERROR_HANDLING code + `X-Request-Id`.
5. Automate: Playwright smoke/P0 · API suite TC-API-* · axe CI for TC-A11Y-022.
6. Mark OOS enterprise/team cases **Skipped** with BR-ENT-003 until designed.
7. Prices under test: Free **$0/300**, Pro **$29/1,000**, Business **$99/10,000**; costs 150/100/50 screenshot and 400/100 URL by tier.

---

**End of TEST_CASES.md**