# Audient — Testing Strategy

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Engineering · QA · Product · DevOps  

**Format:** Markdown only — **no application code**.  
**Purpose:** Define what to test, where, with which tools, and when — so quality gates match Audient’s credit metering, Stripe entitlements, AI pipeline, and WCAG 2.2 AA bar.

**Related:** `TEST_CASES.md` (476 scenarios) · `DEVELOPER_GUIDELINES.md` §15 · `FOLDER_STRUCTURE.md` (`tests/`) · `ACCESSIBILITY.md` · `SECURITY.md` · `DEPLOYMENT.md` · `PAYMENT_FLOW.md` · `AI_ENGINE_ARCHITECTURE.md` · `ERROR_HANDLING.md` · `BACKEND_TASKS.md` · `FRONTEND_TASKS.md` · `PRICING.md` · `BUSINESS_RULES.md`

**Layout:**

```text
tests/
├── unit/
├── integration/
└── e2e/          # Playwright
```

**Environments:** Local · Preview · Staging (Stripe **test**) · Production (synthetic smoke only — no live PAN, no destructive audits on real customers without consent).

**Personas:** Guest · Free · Pro · Business (`ENTERPRISE`) · PAST_DUE · Unverified email.

**OOS (skip until product):** Teams · History search · Report share · Password auth · Required competitive analysis.

---

## 1. Goals & principles

| Principle | Practice |
|-----------|----------|
| Risk-based | Heaviest coverage on money, credits, auth, SSRF, AI refunds |
| Docs-aligned | Map automation to `TC-*` IDs in `TEST_CASES.md` |
| Pyramid | Many unit · fewer integration · thin critical e2e |
| Server truth | Assert ledger/webhook outcomes, not UI-only entitlement claims |
| PCI-safe | Never automate with real PAN; Stripe test cards only |
| Shift-left | Typecheck, lint, unit on every PR |
| No flakes | Deterministic fixtures; mock LLM for CI; isolate Stripe CLI |

### Definition of Done (change-level)

- [ ] Relevant unit/integration green  
- [ ] P0 smoke for touched flow  
- [ ] TEST_CASES IDs listed in PR  
- [ ] No new Critical/Serious axe on touched P0 routes  

---

## 2. Unit testing

**Where:** `tests/unit` · fast, no network · CI on every PR.

### Scope

| Area | Examples |
|------|----------|
| Credits math | Costs from `plans.ts`, reserve/refund idempotency helpers |
| Scoring | Deterministic overall/category scores from findings |
| Validation | Zod schemas (URL, upload MIME/size, packId) |
| SSRF helpers | Private IP / metadata rejection |
| Prompt merge | Dedup / max_findings / enum normalize |
| Pure utils | `cn`, formatters, date/period reset logic |

### Out of unit scope

DB, Stripe, real LLM, Playwright browser, Next route handlers (those = integration/e2e).

### Practices

- Arrange–Act–Assert; name tests after `TC-*` when mapping 1:1.  
- Table-driven cases for Free/Pro/Business credit matrices (`PRICING.md`).  
- Target: high coverage on `services/credits`, scoring, SSRF, Zod — not vanity % on UI.

### Gate

`npm test` (unit) required green before merge once suite exists.

---

## 3. Integration testing

**Where:** `tests/integration` · real or testcontainers DB · Redis optional · Stripe mocked or test mode.

### Scope

| Area | Assert |
|------|--------|
| API handlers | Status codes, error codes from `API_SPECIFICATION` / `ERROR_HANDLING` |
| Auth seed | New user → Membership FREE + Credits 300 + Settings |
| Credits ledger | Concurrent reserve cannot double-spend |
| Webhooks | Signature fail rejected; duplicate `stripeEventId` no double grant |
| RLS | User A cannot read User B audits |
| Uploads | Signed URL constraints; guest quota |
| Audit create | 202 + QUEUED; tier gates URL |

### Practices

- Use staging/dev Supabase or ephemeral Postgres.  
- Fixture users per persona.  
- Never hit production DB.  
- Mock multimodal LLM responses with golden JSON fixtures (`AI_PROMPTS` schema).

### Gate

PR for billing/credits/auth: integration suite must pass. Nightly full integration on staging.

---

## 4. End-to-end testing

**Where:** `tests/e2e` · **Playwright** · Staging + Stripe test + seeded prompts/fixtures.

### Smoke path (minimum)

From `TEST_CASES.md`:

```text
Landing → guest screenshot audit → Progress → brief Report
  → login / claim → Free Home → URL gated → Manage Plan
  → Subscribe Pro (Checkout test) → webhook → Pro Home
  → URL audit → Report → PDF → History → Logout
```

### Priority suites

| Suite | Coverage |
|-------|----------|
| P0 Smoke | Path above + payment fail retry |
| Auth | Google/Apple/Microsoft (staging test IdPs or mocked session inject) |
| Billing | Top-up pack; portal open; PAST_DUE banner |
| Audit fail | Taxonomy + credit refund visible |
| Guest abuse | Second guest attempt → SSO |

### Practices

- Prefer role/accessible names over brittle CSS.  
- Stub or record LLM for CI speed; one nightly “live AI” job optional.  
- Idempotency: unique keys per run.  
- Artifacts: trace + screenshot on failure.  
- Align steps with `TC-*` `Smoke=Yes` / `Automation Candidate=Yes`.

### Gate

- PR: optional smoke on Preview if stable.  
- Merge to `main` / pre-release: P0 e2e on staging required.

---

## 5. Visual regression

**Goal:** Catch unintended UI drift vs Figma/`Screens/*` without redesigning.

### Scope

| Capture | Screens |
|---------|---------|
| Landing guest | SCREEN-001 |
| SSO modal | SCREEN-003 |
| Free / Pro Home | SCREEN-004 / 009 |
| Manage Plan | SCREEN-005 ($29/$99 copy) |
| History empty/populated | SCREEN-012 / 013 |
| Progress / Report stubs | M01 / M02 |

### Practices

- Playwright screenshots or Chromatic/Percy-style baselines.  
- Stable viewport set: 390 × 844 · 768 × 1024 · 1280 × 800.  
- Mask dynamic credits/timestamps/avatars.  
- Review diffs in PR; update baselines intentionally.  
- Do not invent dark-mode baselines until designed.

### Gate

Visual suite on staging before major UI releases; not every PR unless UI-touched.

---

## 6. Accessibility testing

**Standard:** WCAG **2.2 AA** (`ACCESSIBILITY.md`).

### Layers

| Layer | Method |
|-------|--------|
| Automated | axe-core in Playwright e2e on P0 routes — zero Serious/Critical |
| Component | Story/smoke axe on Dialog, Form, CreditMeter |
| Manual | Keyboard marathon; VoiceOver/TalkBack spot-check |
| Contrast | Token audit (warning amber on white, empty History gray) |
| Motion | `prefers-reduced-motion` paths |

### P0 routes

Landing · SSO · Home · Manage Plan · Progress · Report · History · Settings · Payment (around Stripe Elements — not inside Stripe iframe).

### Gate

- CI: axe Serious/Critical fail build on P0.  
- Release: manual keyboard + one SR pass on smoke path.  
- Waived rules need owner + expiry.

---

## 7. Performance testing

### Product SLAs

| Flow | Target |
|------|--------|
| Screenshot audit | ≤ ~90s end-to-end |
| URL audit | ≤ ~8 min end-to-end |
| API create audit | Fast 202 (< few seconds) |
| Web vitals (marketing/app shell) | Track LCP / INP / CLS |

### Methods

| Type | Approach |
|------|----------|
| Synthetic timing | e2e measures Progress → COMPLETED duration |
| Stage budgets | Worker logs p50/p95 per crawl/AI/PDF stage |
| Front-end | Lighthouse CI on Landing + Home (lab) |
| Bundle | Next build size watch on PR |

### Assert

- Timeout → FAILED + refund (regression if silent hang).  
- Queue concurrency does not melt p95 under light load (see Load).

### Gate

Staging soak before private beta; alert if URL p95 breaches budget rate.

---

## 8. Security testing

Align with `SECURITY.md` · `PAYMENT_FLOW.md` · SSRF / injection.

### Scope

| Area | Tests |
|------|-------|
| AuthZ | Ownership → 404 not 403 leak; RLS integration |
| SSRF | localhost, RFC1918, metadata IP, DNS rebinding fixtures |
| Uploads | MIME spoof, oversize, path traversal keys |
| Webhooks | Bad signature; replay same event id |
| PCI | Confirm no PAN in network tab / logs (manual + log scan) |
| Prompt injection | Corpus of malicious page copy/HTML → schema still valid; no score hijack |
| Secrets | CI secret scan; no keys in repo |
| Rate limit | Burst `POST /audits` / checkout → 429 |
| Headers | CSP, HSTS on deployed envs |

### Practices

- Dependency audit (`npm audit`) in CI.  
- Periodic manual pen-test before public launch.  
- Never run destructive SSRF tests against third-party prod sites without permission — use fixtures.

### Gate

P0 security cases (SSRF, webhook idempotency, RLS) must pass before beta.

---

## 9. Cross-browser testing

| Browser | Priority |
|---------|----------|
| Chromium / Chrome (latest) | P0 — primary e2e |
| Safari (macOS + iOS) | P0 — auth, upload, checkout |
| Firefox (latest) | P1 |
| Edge (Chromium) | P1 |

### Focus flows

SSO redirect · file upload · Stripe Checkout · PDF download · Progress polling.

### Cadence

- Automated e2e: Chromium every PR/staging.  
- Safari/Firefox: weekly or pre-release matrix.  
- Document known Stripe/Safari quirks.

---

## 10. Mobile testing

**Mobile-first UI** (`FRONTEND_TASKS` / SCREEN_MAPPING responsive notes).

### Devices / viewports

| Class | Examples |
|-------|----------|
| Phone | 390×844 (iPhone-class), Android Chrome |
| Tablet | 768×1024 |
| Touch | ≥44px targets; sticky payment CTA vs focus (2.4.11) |

### Scope

- Landing stack Upload / URL / GO.  
- Profile menu → sheet.  
- Manage Plan stacked cards.  
- Checkout return / Elements on mobile Safari.  
- History rows + download hit area.  
- Offline banner.

### Methods

Playwright mobile projects + real-device spot-check pre-release (iOS Safari + Android Chrome per DEVELOPER_GUIDELINES).

### Gate

P0 smoke on mobile viewport in e2e; real-device checklist before go-live.

---

## 11. Load testing

**Goal:** Protect spend (LLM/crawl) and UX under concurrent audits — not infinite scale day one.

### Scenarios

| Scenario | Intent |
|----------|--------|
| Concurrent `POST /audits` | Credit lock correctness + 429 behaviour |
| Worker queue depth | Backpressure; no unbounded Playwright/LLM |
| Webhook burst | Idempotent grants under duplicate/retry storm |
| Read-heavy | History/report GET p95 |

### Practices

- k6 / Artillery / similar against **staging** only.  
- Cap concurrency to production-like queue limits.  
- Use fixture AI (no live expensive models) for load.  
- Watch: error rate, queue age, refund anomalies, DB connections.

### Gate

Pre-beta and pre-public launch; after major worker changes.

---

## 12. Regression testing

### Suites

| Suite | Contents | When |
|-------|----------|------|
| Smoke | `Smoke=Yes` TCs | Every staging deploy |
| Regression | All `Regression=Yes` P0/P1 | Weekly + pre-release |
| Billing regression | Checkout, webhook, top-up, PAST_DUE | After BM-06 / payment changes |
| AI regression | Golden fixtures + schema + scores | After prompt/model bump |
| Credit regression | Free/Pro/Business cost matrix | After `plans.ts` change |

### Practices

- Failures block release; triage flake vs product bug.  
- Prompt version bumps require golden fixture update PR.  
- Price copy $29/$99 asserted so Figma drift doesn’t ship.

---

## 13. Acceptance testing

**Owner:** Product + QA against PRD / BUSINESS_RULES / SCREEN_MAPPING.

### Criteria (MVP)

- [ ] Guest: exactly 1 screenshot audit; URL → SSO  
- [ ] Free: 300 credits; screenshot works; URL/PDF gated  
- [ ] Pro: $29 path; URL audit; PDF; top-ups  
- [ ] Business: $99; higher grants/lower costs  
- [ ] Failed audit refunds credits  
- [ ] Entitlements only after webhook (activating state OK)  
- [ ] No raw card data in Audient UI  
- [ ] WCAG 2.2 AA P0 paths accepted  
- [ ] OOS features absent (search, share, password, teams)

### Method

Execute Acceptance-tagged / P0 cases from `TEST_CASES.md`; Product signs MVP checklist in `MISSING_SCREENS_PLAN` DoD + `DEPLOYMENT` launch list.

### Gate

Written Product sign-off before private beta and before public launch.

---

## 14. Go-live testing

Final verification on production (or production-like) with **controlled** scope.

### Pre-flight (staging sign-off)

- [ ] CI green on `main`  
- [ ] Migrations applied; RLS on  
- [ ] Stripe **live** webhook endpoint verified in test event  
- [ ] Plans/prices match `PRICING.md`  
- [ ] Sentry/uptime receiving events  
- [ ] Feature flags / maintenance page ready  

### Production go-live checklist

| Check | Notes |
|-------|-------|
| Synthetic health | `GET /api/health` |
| Auth | One real SSO login (founder account) |
| Free screenshot | Low-cost live AI canary **or** feature-flagged fixture |
| Checkout | **$0 / 100% off coupon** or minimal live charge + immediate refund playbook |
| Webhook | Membership flips ACTIVE |
| Portal | Opens for that customer |
| Negative | Invalid URL rejected; SSRF blocked |
| PDF | Paid canary download signed URL |
| Monitoring | Error budget quiet for N minutes |
| Rollback | Documented (`DEPLOYMENT.md`) |

### Rules

- No load tests against production LLM budget casually.  
- No real PAN in shared docs/recordings.  
- Prefer canary user list for private beta.  
- Post-go-live: 24–48h heightened watch on payment_failed, refund, AI fail rates.

### Gate

Go-live owner checklist signed; on-call staffed.

---

## 15. Tooling map

| Layer | Suggested tooling |
|-------|-------------------|
| Unit | Vitest or Jest (project choice) |
| Integration | Vitest/Jest + test DB / Supabase local |
| E2E | Playwright |
| A11y | axe + Playwright; manual SR |
| Visual | Playwright screenshots / Percy/Chromatic |
| Perf | Lighthouse CI; worker timing metrics |
| Load | k6 / Artillery on staging |
| Security | `npm audit`, secret scan, manual SSRF/injection suites |
| CI | GitHub Actions: lint · typecheck · unit · build · (e2e staging) |

---

## 16. CI / CD quality gates

```text
PR  → lint · typecheck · unit · build
      + axe on changed P0 (when e2e harness ready)
Merge main → deploy staging
Staging → P0 e2e smoke · webhook sanity
Release → regression + acceptance sign-off → production
Production → synthetic smoke · monitor
```

Optional: Playwright smoke on Preview (Stripe test only).

---

## 17. Test data & fixtures

| Fixture | Use |
|---------|-----|
| Persona seeds | Free/Pro/Business/PAST_DUE |
| Golden screenshots | Shot audit + visual |
| Golden findings JSON | Scoring + report render |
| Stripe test cards | Success / decline / 3DS |
| Malicious HTML corpus | Prompt injection |
| Private IP URLs | SSRF |

Reset staging periodically; never copy prod PII to local laptops casually (GDPR).

---

## 18. Ownership & cadence

| Activity | Owner | Cadence |
|----------|-------|---------|
| Unit/integration maintain | Eng | Continuous |
| E2E smoke | Eng/QA | Every staging deploy |
| Full regression | QA | Weekly + release |
| A11y audit | FE + QA | Each UI milestone + release |
| Security review | Eng | Beta + launch |
| Load test | Eng/DevOps | Pre-beta, pre-launch |
| Acceptance | Product | Beta, launch |
| Go-live | Eng lead + Product | Launch day |

---

## 19. Traceability

| Artifact | Links to |
|----------|----------|
| `TEST_CASES.md` | Manual + automation candidates |
| `UI_BUILD_CHECKLIST.md` | Screen build verification |
| `PAYMENT_FLOW.md` | Billing scenarios |
| `AI_ENGINE_ARCHITECTURE.md` | Pipeline / refund / schema tests |
| `ACCESSIBILITY.md` | TC-A11Y-* |
| PR template | Lists TC IDs + risk |

---

## 20. Exit criteria by milestone

| Milestone | Testing bar |
|-----------|-------------|
| Auth (BM/FM-03) | Unit + integration auth seed; e2e SSO smoke |
| Credits/Billing | Integration webhook idempotency; payment e2e test mode |
| Screenshot audit | E2E guest+Free; refund on forced fail |
| URL audit | SSRF suite; SLA timing; full report e2e |
| PDF | Paid download; PDF fail no credit refund |
| Private beta | Acceptance + a11y + security P0 + load light |
| Public launch | Go-live checklist + monitoring |

---

**End of TESTING_STRATEGY.md**
