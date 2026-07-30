# Audient — Developer Guidelines

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** Frontend · Backend · Full-stack · QA · AI coding agents  

**Related (read before coding):**  
`AGENTS.md` · `docs/CURSOR_RULES.md` · `docs/FOLDER_STRUCTURE.md` · `docs/TECHNICAL_ARCHITECTURE.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/SCREEN_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `BUSINESS_RULES.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/API.md` · `docs/TEST_CASES.md`

**Format:** Markdown only — standards document, not application code.

**Stack (authoritative for this guide):** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v3 · shadcn/ui · Supabase (Auth / Postgres / Storage) · Prisma · PostgreSQL · Stripe · Zod · React Hook Form · Framer Motion · Lucide · BullMQ/Redis (workers) · Playwright (crawl/PDF) · Vercel (web) · GitHub Actions (CI).

**Product facts developers must not invent:** SSO = Google / Apple / Microsoft only · Plans = Free / Pro / Business (`ENTERPRISE` in schema) · Guest = 1 screenshot audit · Pricing = `docs/PRICING.md` + `src/config/plans.ts` · Figma screens = UI source of truth · Do not redesign screens.

---

## 1. Purpose

These guidelines unify how humans and AI agents build Audient so code stays consistent with architecture, security, accessibility, and business rules. When this file conflicts with a more specific domain doc, **domain docs win** for that topic (e.g. PRICING for credits, ACCESSIBILITY for WCAG, SECURITY for controls) — then update this file to match.

---

## 2. Folder Structure

Follow `docs/FOLDER_STRUCTURE.md`. Do not invent parallel trees.

```text
audient/
├── src/
│   ├── app/                 # Routes, layouts, API route handlers (thin)
│   ├── components/          # ui/ + domain (audit, billing, report, …)
│   ├── hooks/               # Client logic
│   ├── services/            # Business logic (server)
│   ├── lib/                 # Supabase, Stripe, AI, queue, Prisma client
│   ├── types/               # Shared TS types
│   ├── utils/               # Pure helpers
│   ├── config/              # plans.ts, constants, feature flags
│   ├── styles/              # Global CSS complements
│   └── middleware.ts        # Auth / session gate
├── prisma/                  # Schema + migrations
├── supabase/                # Migrations, RLS, config
├── workers/                 # Audit pipeline consumers
├── tests/                   # unit / integration / e2e
├── scripts/                 # Dev & maintenance scripts
├── docs/                    # Specs (source of truth for product)
├── public/                  # Static assets
└── .env.example             # Documented env vars (no secrets)
```

| Layer | Put here | Do not put here |
|-------|----------|-----------------|
| `app/` | Pages, layouts, thin route handlers | Credit math, Stripe logic |
| `components/` | UI composition | Direct DB / Stripe / AI calls |
| `hooks/` | Client state, data fetching orchestration | Durable business rules |
| `services/` | Credits, audits, billing, reports | JSX |
| `lib/` | SDK clients & adapters | Product policy (use `services` + `config`) |
| `utils/` | Pure formatters/validators | I/O, React |
| `config/` | Plan catalog, costs | Secrets |

**Import alias:** `@/*` → `src/*`. Prefer `@/components/...` over deep relatives.

---

## 3. Naming Conventions

| Kind | Convention | Examples |
|------|------------|----------|
| React components | PascalCase file + export | `AuditForm.tsx`, `ScoreGauge.tsx` |
| Hooks | `use` + camelCase | `useAudit.ts`, `useCredits.ts` |
| Services | camelCase module; verb functions | `credits/reserveCredits.ts` |
| Utils | camelCase | `formatCredits.ts`, `cn.ts` |
| Types / interfaces | PascalCase | `Audit`, `MembershipTier` |
| Zod schemas | camelCase + `Schema` | `createAuditSchema` |
| API routes | Next App Router folders | `app/api/audits/route.ts` |
| Env vars | `SCREAMING_SNAKE` | `SUPABASE_SERVICE_ROLE_KEY` |
| Public env | `NEXT_PUBLIC_*` only when browser needs it | `NEXT_PUBLIC_APP_URL` |
| DB / Prisma | schema conventions in SCHEMA.md | `User`, `CreditTransaction` |
| CSS tokens | Tailwind theme keys | `bg-primary`, `text-error` |
| Test IDs | Align with `TEST_CASES.md` | `TC-AUTH-001` |
| Analytics events | snake_case past tense | `audit_started` |
| Branches | §16 | `feat/audit-progress` |
| Commits | §17 Conventional Commits | `feat(audit): …` |

**IDs in product docs:** Screen `SCREEN-001`, components `BTN-001` / `INP-001` / `MDL-001`, rules `BR-*`, validation `VAL-*`, errors `ERR-*` — reference these in PRs when touching mapped UI.

---

## 4. Component Structure

1. Prefer existing `src/components/ui` (shadcn) and domain components before creating new ones (`CURSOR_RULES` §1).  
2. **≤ 250 lines** per component file; split when larger.  
3. Presentation only — no credit deduction, SSRF checks, or webhook handling in JSX.  
4. Explicit props types; export named components (default export OK for Next pages only).  
5. Compose with `cn()` (`src/utils/cn.ts`) for class variants.  
6. Handle **loading / empty / error / disabled / offline** where the screen defines them (`SCREEN_MAPPING`, `STATE_MANAGEMENT.md`).  
7. Icons: Lucide; brand SVGs from `public/brand`. Decorative icons `aria-hidden`.  
8. Domains: `audit/`, `report/`, `billing/`, `auth/`, `layout/`, `common/`, `pricing/`, `dashboard/`.

**Page rule:** App Router pages stay thin — fetch/wire via hooks or server components calling `services/`.

---

## 5. Hooks

| Rule | Detail |
|------|--------|
| Location | `src/hooks/` |
| Naming | `useX` |
| Responsibility | Client orchestration: form state, polling, UI-facing mutations |
| Not for | Authoritative credit math, entitlement grants, webhook side effects |
| Data | Call API routes or server actions; never embed service-role keys |
| Forms | React Hook Form + Zod resolvers aligned with `VALIDATION_RULES.md` |
| Polling | Audit status ~2s with backoff; respect `prefers-reduced-motion` for animation, not for correctness |

Examples: `useAudit`, `useCredits`, `useSubscription`, `useUser`, `useNotifications`.

---

## 6. Services

| Rule | Detail |
|------|--------|
| Location | `src/services/{domain}/` |
| Used by | API route handlers **and** `workers/` |
| Must implement | Tier gates, credit reserve/deduct/refund, ownership checks, audit lifecycle |
| Config | Read costs/grants from `src/config/plans.ts` — never hardcode plan numbers in services |
| Transactions | Credit mutations use DB transactions / row locks (`BR-CRED-*`, SECURITY.md) |
| Idempotency | Honor `Idempotency-Key` on create/checkout/top-up |
| Errors | Throw typed domain errors mapped to API codes in `ERROR_HANDLING.md` |

Domains: `audit`, `credits`, `billing`, `report`, `notification`, `user`.

---

## 7. API Layer

| Rule | Detail |
|------|--------|
| Shape | Next.js Route Handlers under `src/app/api/**` |
| Thickness | Validate → authz → call `services/` → map response |
| Spec | Product paths in `AUTH_API` / `AUDIT_API` / `USER_API` / `BILLING_API` / `API.md` / `API_MAPPING.md` |
| Auth | Derive user from verified Supabase JWT / session — **never** trust client `userId` |
| Validation | Zod at boundary (`VALIDATION_RULES.md`) |
| Envelope | Prefer `{ data }` / `{ error: { code, message } }` per `API.md` |
| Status codes | 200/201/202/400/401/403/404/409/422/429/500 as specified |
| Webhooks | `api/webhooks/stripe` — verify signature; idempotent processing |
| Health | `api/health` for uptime checks |

Do not duplicate business rules in the handler that already live in `services/`.

---

## 8. State Management

| Kind | Approach |
|------|----------|
| Server truth | Postgres via Prisma/Supabase; credits & membership always server-authoritative |
| Auth session | Supabase SSR helpers (`lib/supabase/server`, `client`, middleware) |
| UI ephemeral | React state / RHF; URL search params for shareable filters only when designed |
| Async jobs | Audit `status` + progress from API/Realtime — do not invent fake fine-grained stages beyond API contract |
| Global client store | Avoid heavy Redux unless justified; prefer React context sparingly (`providers/`) |
| Spec | Follow `STATE_MANAGEMENT.md` state IDs when implementing screen states |

**Never** treat client-edited credit balances as authoritative.

---

## 9. Environment Variables

Source: `.env.example`. Copy to `.env.local` — **never commit secrets**.

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | Public | App origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon key only |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Never `NEXT_PUBLIC_` |
| `DATABASE_URL` | Server | Pooled Prisma URL |
| `DIRECT_URL` | Server | Migrations |
| `STRIPE_SECRET_KEY` | Server | Test/live by env |
| `STRIPE_WEBHOOK_SECRET` | Server | Signature verify |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Elements |
| `REDIS_URL` | Workers/server | Queue / RL |
| `AI_API_KEY` | Server/workers | Provider key |

**Rules**

- Document every new var in `.env.example` with a comment.  
- Fail fast at boot if required server secrets missing.  
- Separate values per environment (local / staging / production).  
- Rotate keys on leak; revoke compromised Stripe/Supabase keys immediately.

---

## 10. Error Handling

| Layer | Standard |
|-------|----------|
| Spec | `docs/ERROR_HANDLING.md` + failure taxonomy in `SCREEN_MAPPING` |
| API | Map to stable `error.code` (`INSUFFICIENT_CREDITS`, `TIER_NOT_ALLOWED`, `SSRF_BLOCKED`, …) |
| UI | User-facing copy from ERROR_HANDLING; icon + text (not color-only) |
| Credits | Failed refundable audits → idempotent refund (`BR-ERR-001`) |
| Focus / a11y | Assertive for blocking errors; focus primary CTA / first invalid field |
| Correlation | Propagate `X-Request-Id` / `request_id` to logs and Support CTA |
| Never | Leak stack traces, SQL, or Stripe raw errors to clients in production |

---

## 11. Logging

| Do | Don’t |
|----|-------|
| Log `request_id`, `userId` (internal), `auditId`, route, error code | Log PAN, ID tokens, raw screenshots, service-role keys |
| Structured JSON logs in workers/API | `console.log` spam in production UI |
| Sentry (or equivalent) for exceptions with scrubbing | Attach full request bodies with PII |
| Metric: queue depth, webhook lag, refund failures | Log other users’ data in shared contexts |

Align with ERROR_HANDLING logging strategy and SECURITY.md data handling.

---

## 12. Accessibility

**Target:** WCAG **2.2 AA** (`docs/ACCESSIBILITY.md`). `CURSOR_RULES` historically cites 2.1 AA — treat **2.2 AA** as product standard.

Mandatory:

- Semantic HTML; one `<h1>` per view; landmarks + skip link on app shell  
- Keyboard operability; visible `:focus-visible`; modal focus trap (Radix Dialog)  
- Labels + `aria-invalid` / `aria-describedby` on errors  
- Live regions per ERROR_HANDLING (assertive vs polite)  
- Contrast via tokens; never color-only status  
- Touch targets ≥ **44×44** CSS px  
- `prefers-reduced-motion` honored  
- Tagged/accessible PDF for paid exports  
- Upload is button/file-picker based — not drag-only  

PRs that regress a11y fail review (`CURSOR_RULES` §14).

---

## 13. Performance

| Area | Guideline |
|------|-----------|
| Next.js | Prefer Server Components by default; mark client components only when needed |
| Images | Next/Image where applicable; compress uploads client-side only if product allows |
| Bundles | Avoid large client-only libs on Landing; dynamic-import heavy PDF/admin tools |
| Audits | Always async via queue — never block HTTP for full crawl/AI |
| Polling | Bounded interval + stop on terminal status |
| Caching | Cache `GET /me` briefly if specified; never cache personalized credits incorrectly |
| Web Vitals | Track LCP/INP/CLS on key routes (`ANALYTICS.md` / perf tests) |
| Workers | Concurrency caps to control AI spend |

---

## 14. Responsive Design

- **Mobile-first** Tailwind (`CURSOR_RULES` §11).  
- Match `SCREEN_MAPPING` responsive notes (stack Upload; full-width URL+GO; payment sheet on mobile).  
- No horizontal scroll on primary flows at 320px width.  
- Sticky CTAs must not fully obscure focused fields (WCAG 2.4.11).  
- Test iOS Safari + Android Chrome for auth, upload, and checkout.

---

## 15. Testing

| Layer | Location / tool | Focus |
|-------|-----------------|-------|
| Unit | `tests/unit` | `utils`, credit math, Zod schemas, SSRF helpers |
| Integration | `tests/integration` | services + DB (staging), webhooks idempotency |
| E2E | `tests/e2e` (Playwright) | Smoke path from `TEST_CASES.md` |
| A11y | axe + manual | `TC-A11Y-*`, ACCESSIBILITY.md |
| API | Contract tests | Status codes + error codes |

**Before merge:** relevant unit tests green; P0 smoke for touched flows.  
**Reference catalogue:** `docs/TEST_CASES.md` (400+ scenarios). Prefer automating Smoke=Yes / P0 cases.

Do not commit tests that require real PAN or production secrets.

---

## 16. Git Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; protected |
| `develop` (optional) | Integration if team uses GitFlow-lite |
| `feat/<short-name>` | Features |
| `fix/<short-name>` | Bug fixes |
| `chore/<short-name>` | Tooling, deps, docs-only |
| `hotfix/<short-name>` | Urgent production fixes from `main` |

Rules:

- Branch from up-to-date `main` (or `develop` if adopted).  
- One PR ≈ one concern; prefer small PRs.  
- Delete remote branch after merge.  
- Never force-push `main`.  
- Do not commit `.env.local`, keys, or large binary dumps.

---

## 17. Commit Message Standards

Use **Conventional Commits**:

```text
<type>(<scope>): <imperative summary>

[optional body]
```

| Type | Use |
|------|-----|
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | No behavior change |
| `test` | Tests only |
| `chore` | Build, CI, deps |
| `perf` | Performance |
| `a11y` | Accessibility-focused (optional scope type) |

**Scopes (examples):** `auth`, `audit`, `credits`, `billing`, `report`, `ui`, `api`, `workers`, `a11y`.

Examples:

- `feat(audit): poll status until completed`  
- `fix(credits): idempotent refund on AI failure`  
- `docs(guidelines): add developer guidelines`

Keep subject ≤ ~72 chars; explain **why** in body when non-obvious.

---

## 18. Pull Requests

PR description must include:

1. **Summary** — what / why  
2. **Screens / BR / API touched** — IDs (`SCREEN-009`, `BR-CRED-004`, …)  
3. **Test plan** — checklist (manual + automated)  
4. **Screenshots / recordings** for UI  
5. **Risk / rollback** for billing, credits, auth, migrations  

Checklist before requesting review:

- [ ] `npm run typecheck`  
- [ ] `npm run lint`  
- [ ] `npm run format` / `format:check`  
- [ ] No secrets in diff  
- [ ] Tokens only (no hardcoded hex)  
- [ ] A11y considered  
- [ ] Server-side gates for tier/credits  
- [ ] Migrations included if schema changed (Prisma + Supabase RLS as needed)

Link related issues/docs. Prefer draft PRs for early feedback on architecture.

---

## 19. Code Reviews

Reviewers verify:

| Gate | Fail if |
|------|---------|
| Reuse / DRY | Copied components or credit logic |
| A11y | Missing labels, traps, contrast, color-only |
| Security | Client-trusted IDs/amounts; missing SSRF; leaked secrets |
| Types | `any`, untyped public APIs |
| Structure | Logic in UI; wrong folder |
| Business rules | Diverges from `BUSINESS_RULES` / `PRICING` |
| Errors | Silent failures; no user message |

Be kind and specific; request changes for P0 issues; nitpicks optional. Authors respond to all blocking comments or explain with doc references.

---

## 20. Design System Usage

- Visual source: uploaded Figma + `DESIGN_TOKENS.md` + `tailwind.config.ts` / `globals.css`.  
- Primitives: **shadcn/ui** in `src/components/ui` only for base controls.  
- Typography: **Manrope** token sizes/weights — do not swap to Inter/system stacks in product UI.  
- Motion: Framer Motion sparingly; honor reduced motion.  
- Do **not** redesign layouts, invent FAQ/footer marketing chrome, or add dark mode until designed.  
- Plan labels: UI “Business” ↔ schema `ENTERPRISE`; prices **$29 / $99** (not outdated Figma $99/$199).

---

## 21. Reusable Components

Before adding UI:

1. Search `components/ui` and domain folders.  
2. Extend variants (`Button`, `Input`) via CVA / props — don’t fork.  
3. Shared cross-domain widgets → `components/common`.  
4. Map to COMPONENT_MAPPING / COMPONENT_BEHAVIOR IDs in PR notes when implementing INP/BTN/MDL.  
5. `AuditForm` must be reused across Landing / Free Home / Pro Home with tier gates — not three copies.

---

## 22. Token Usage

| Allowed | Forbidden |
|---------|-----------|
| `bg-primary`, `text-secondary`, semantic success/warning/error tokens | Hardcoded `#1C018E` in components |
| Spacing scale (8/16/24) via Tailwind | Magic `px-[13px]` without token need |
| Radius `rounded-md` / theme radii | One-off radii that fight the system |
| Shadow tokens | Multi-layer ad-hoc glows (also avoid purple-glow aesthetics not in brand) |

Severity badges map Critical → error, Major → warning, Minor → neutral/secondary — always with **text labels**.

If a token is missing, add it to `tailwind.config.ts` / CSS variables first, then use it.

---

## 23. TypeScript Standards

| Rule | Detail |
|------|--------|
| Strict mode | Enabled; no implicit `any` |
| Props / exports | Explicit types |
| Shared types | `src/types` + Prisma generated types |
| Validation | Zod schemas; infer types with `z.infer<>` |
| Server-only modules | `import "server-only"` for admin/service-role code |
| Exhaustiveness | Prefer `satisfies` / never checks on tier & status unions |
| Dates | ISO strings at boundaries; careful with timezone |
| Money | Integer cents; never float for charges |
| Credits | Integers; server config for costs |

Avoid type assertions unless justified and localized; prefer narrowing.

---

## 24. Security Best Practices

Summarize `SECURITY.md` + `BR-SEC-*` for daily work:

1. **Identity from token only** — ignore client-supplied user IDs as authority.  
2. **Ownership scoping** — 404 on cross-user access.  
3. **Tier + membership status** — enforce in `services/` (UI hide is not enough); honor `PAST_DUE`.  
4. **SSRF** — public http(s) only; block private/link-local/metadata IPs; re-check DNS.  
5. **Uploads** — signed URLs; MIME allowlist; private buckets; user-scoped keys.  
6. **PCI** — Stripe Elements/Checkout only; never raw PAN to Audient servers/logs.  
7. **Webhooks** — verify signatures; idempotent.  
8. **RLS** — enable and test policies on user-owned tables.  
9. **Rate limits** — audits, auth, uploads, checkout.  
10. **Secrets** — server-only; no `NEXT_PUBLIC_` for service role.  
11. **XSS** — React escaping; sanitize any HTML fed to PDF renderer.  
12. **Prompt injection** — separate untrusted site content from system instructions (`SECURITY.md` §8).  
13. **GDPR** — account deletion path (`BR-SEC-006`); no AI training on customer data.  
14. **Guest abuse** — server guest quota; do not trust cookie-only counters without server enforcement.

Auth providers for v1 UI: **Google, Apple, Microsoft** (not GitHub/password forms), per SCREEN_MAPPING / roadmap.

---

## 25. Documentation Standards

| Rule | Detail |
|------|--------|
| Specs first | Update docs when behavior changes (BR, API, screens) |
| Location | Product/engineering docs in `docs/` (some roots: `BUSINESS_RULES.md`, `STATE_MANAGEMENT.md`) |
| Code comments | Why, not what; no noise |
| README | Setup, scripts, link to AGENTS.md |
| `.env.example` | Keep in sync with real env usage |
| No secrets in docs | Use placeholders |
| AI agents | Read `AGENTS.md` + this file before generating code |
| Markdown | Prefer tables for matrices; stable IDs for cross-links |

Do not invent features in docs or code that contradict Figma / BUSINESS_RULES.

---

## 26. AI Coding Rules

For Cursor / coding agents (extends `AGENTS.md` + `CURSOR_RULES.md`):

1. **Read** PRICING, SCREEN_MAPPING, BUSINESS_RULES, and the relevant API doc before implementing a flow.  
2. **Do not redesign** UI or invent screens (no share, teams, password login, History search until specified).  
3. **Reuse** shadcn + domain components; keep files ≤250 lines.  
4. **Logic out of UI** — services/hooks.  
5. **Tokens only** — no hardcoded colors.  
6. **WCAG 2.2 AA** patterns from ACCESSIBILITY.md.  
7. **Server-side** entitlement and credit enforcement.  
8. **Match error codes** and validation messages to VALIDATION_RULES / ERROR_HANDLING.  
9. **Prefer editing** existing files over new parallel abstractions.  
10. **No commits** unless the user asks; no force-push; no secret commits.  
11. **Run** `typecheck` / `lint` / `format` before claiming done.  
12. **Plan naming:** Business UI = `ENTERPRISE` tier constant.  
13. When docs disagree, prefer **SCREEN_MAPPING + PRICING + BUSINESS_RULES** for product behavior; note conflicts in the PR.  
14. Do not generate exploit PoCs or attack tooling against any system.

---

## 27. CI Requirements

Minimum GitHub Actions (or equivalent) on PR to `main`:

| Check | Command / job |
|-------|----------------|
| Install | `npm ci` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format:check` |
| Unit tests | `npm test` (when suite exists) |
| Build | `npm run build` |
| A11y (optional gate) | axe on P0 routes when e2e ready |

Rules:

- Required status checks on protected `main`.  
- No merge on failing CI.  
- Cache dependencies responsibly.  
- Do not print secrets in logs.  
- Prisma: `prisma validate` / migrate diff checks when schema changes.  
- Workers: separate build/test job when worker code changes.

---

## 28. Deployment Requirements

| Concern | Standard |
|---------|----------|
| Web app | Vercel (or equivalent) from `main` |
| Workers | Separate host (Railway/Render/Fly) — not serverless timeout-bound for full audits |
| Envs | `preview` / `staging` / `production` with isolated Supabase + Stripe test vs live |
| Migrations | Run Prisma / SQL migrations **before** or in controlled release; never break RLS |
| Stripe | Webhook endpoint updated per env; test mode on staging |
| Secrets | Platform secret store; rotate on personnel changes |
| Health | Monitor `/api/health` + worker heartbeats |
| Rollback | Previous Vercel deployment; pause queue if bad worker release |
| Observability | Sentry + uptime; alert on 5xx, refund failures, webhook lag |
| PDF / crawl | Network-isolated workers; no access to internal metadata IPs |
| Launch gate | P0 TEST_CASES smoke green; a11y axe Serious=0 on P0 routes |

**Production checklist**

- [ ] `NEXT_PUBLIC_*` correct for domain  
- [ ] Service role not exposed  
- [ ] Stripe live keys + webhook secret  
- [ ] RLS enabled on user tables  
- [ ] Guest + paid credit paths verified  
- [ ] Error tracking scrubbing enabled  

---

## 29. Daily Developer Checklist

```text
[ ] Right folder / layer
[ ] Reused components & plans config
[ ] Zod validation at boundary
[ ] Authz + ownership + tier gates server-side
[ ] Tokens only; mobile-first
[ ] Loading/empty/error states
[ ] A11y: name, keyboard, focus, live region
[ ] Errors mapped to ERROR_HANDLING codes
[ ] No secrets / PAN / tokens in logs
[ ] typecheck + lint + format
[ ] Tests or TEST_CASES IDs listed in PR
```

---

## 30. Related Documents Index

| Doc | When to open |
|-----|----------------|
| `AGENTS.md` | Any AI/human contribution start |
| `CURSOR_RULES.md` | Core engineering rules |
| `FOLDER_STRUCTURE.md` | Where to put files |
| `TECHNICAL_ARCHITECTURE.md` | System design |
| `SECURITY.md` | Threat controls |
| `PRICING.md` / `plans.ts` | Credits & tiers |
| `SCREEN_MAPPING.md` | UI behavior |
| `BUSINESS_RULES.md` | Product rules |
| `VALIDATION_RULES.md` | Input rules |
| `ERROR_HANDLING.md` | Failures & a11y of errors |
| `ACCESSIBILITY.md` | WCAG 2.2 AA |
| `ANALYTICS.md` | Events (consent-aware) |
| `TEST_CASES.md` | QA scenarios |
| `API.md` + `*_API.md` | HTTP contracts |
| `COMPONENT_BEHAVIOR.md` | Control-level UX |
| `DESIGN_TOKENS.md` | Color/type/spacing |

---

**End of DEVELOPER_GUIDELINES.md**
