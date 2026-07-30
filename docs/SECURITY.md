# Audient — Security Architecture

**Status:** Draft
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** PRD (§8.2–§8.3), Technical Architecture Document (§7 Auth, §11 Security), DATABASE.md (§5, §9.3)

This document defines Audient's security architecture. It follows a **defense-in-depth** model: multiple independent layers so no single failure exposes user data, revenue, or the AI pipeline. Because users submit their own website data, pay via subscriptions, and rely on AI output, the priorities are **strong identity, strict data isolation, safe handling of untrusted input (URLs, uploads, and AI prompts), and PCI-safe payments.**

---

## 1. Authentication

**Provider:** Supabase Auth (Google, Microsoft, GitHub OAuth + email/password and magic link).

- **Delegated credentials:** Audient never stores passwords or OAuth secrets — all credential material is managed by Supabase Auth.
- **JWT verification:** every protected request carries a Supabase-issued JWT; the server verifies its **signature and expiry** before acting. Identity is derived from the token's `sub`, never from client-supplied values.
- **Session handling:** tokens are stored in **httpOnly, Secure, SameSite** cookies; short-lived access tokens are auto-refreshed via rotating refresh tokens.
- **Email verification:** required before running audits — reduces throwaway-account abuse and protects free-credit economics.
- **MFA:** available via Supabase for users who opt in (recommended for Enterprise/admin accounts).
- **Identity linking:** all sign-in methods resolve to a single canonical user keyed by email.

---

## 2. Authorization

- **Ownership scoping:** every resource query is scoped to the authenticated user; requests for another user's resource return **404** (existence is not leaked, avoiding enumeration).
- **Role-based access control (RBAC):** `USER` vs. `ADMIN` (`User.role`) gates administrative endpoints and tooling.
- **Tier-based gating:** URL audits, detailed reports/PDFs, and credit top-ups are restricted to Pro/Enterprise, enforced **server-side** in `services/` — never by hiding UI alone.
- **Combined entitlement check:** paid features require both the correct `tier` **and** an active `status` (e.g., a `PAST_DUE` Pro user is restricted).
- **Row-Level Security (RLS):** Postgres RLS policies restrict every user-owned row to `userId = auth.uid()` — a database-level guarantee independent of application logic.
- **Least privilege:** service credentials (DB, storage, Stripe, AI) are scoped to the minimum required and separated per environment.

---

## 3. API Security

- **Transport:** HTTPS/TLS everywhere; HSTS enabled; no plaintext transport.
- **Input validation:** all request bodies/params are schema-validated (e.g., Zod) at the boundary → invalid input rejected with `400` before reaching logic (see §9).
- **Injection protection:** parameterized queries via the ORM (no SQL injection); React output escaping (no reflected XSS).
- **Security headers:** `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, HSTS.
- **CORS:** locked to Audient's own origins; no wildcard on authenticated endpoints.
- **CSRF:** SameSite cookies plus CSRF protection on state-changing requests.
- **SSRF protection (critical for URL audits):** user-submitted URLs are validated to be public `http/https` only; private/internal/reserved IP ranges (RFC1918, `localhost`, link-local, and the cloud metadata IP `169.254.169.254`) are rejected; DNS is resolved and the resolved IP re-checked to prevent DNS rebinding. Crawlers run in a **network-isolated worker environment** with no access to internal services.
- **Idempotency:** charge/side-effect endpoints (`POST /audits`, checkout, top-ups) accept an `Idempotency-Key`.
- **Secrets management:** all keys in environment secrets / a secrets manager; never in code or the repo; rotated periodically; service-role keys are server-only.

---

## 4. Credit Abuse Prevention

Credits are Audient's economic unit — protecting them protects revenue and AI cost.

- **Email verification gate:** unverified users cannot run audits, blocking bulk throwaway free accounts.
- **Server-authoritative deduction:** credit costs and balances are computed and enforced **server-side** from plan config; clients cannot influence cost.
- **Transactional reservation:** credits are checked and reserved within a **row-locked DB transaction** at audit creation, preventing double-spend from concurrent/parallel requests.
- **Append-only ledger:** every credit movement (grant, deduction, refund, top-up) is recorded in the Credit Transactions ledger — abuse and disputes are traceable.
- **Refund integrity:** only genuinely failed audits are refunded, and refunds are **idempotent** to prevent repeated-refund exploits.
- **Anti-farming heuristics:** monitor for rapid multi-account creation from the same device/IP and unusual audit spikes; throttle or flag suspicious patterns.
- **Free-tier limits:** low free credit allotment plus screenshot-only access limits the value of abusing free accounts.
- **Rollover integrity:** plan credits reset monthly; purchased (rollover) credits are tracked distinctly so resets can't be gamed (DATABASE.md §9.3).

---

## 5. Rate Limiting

- **Per-user and per-IP limits** enforced via Redis (sliding window) on sensitive endpoints: audit creation, upload signing, auth attempts, and checkout → `429 RATE_LIMITED` on exceed.
- **Queue concurrency caps:** the job queue limits simultaneous crawls/AI calls, protecting spend and upstream providers regardless of request bursts.
- **Credit system as economic throttle:** every audit costs credits, naturally bounding volume.
- **Auth throttling:** repeated failed sign-ins are rate-limited (defense against credential stuffing / brute force), complementing Supabase's own protections.
- **Graduated responses:** soft limits (slow down) before hard blocks; suspicious spikes can trigger CAPTCHA on sign-up.

---

## 6. File Security

Applies to uploaded screenshots and captured site assets.

- **Direct-to-storage uploads:** files upload via short-lived **signed URLs** straight to object storage — they never transit the API server.
- **Upload constraints:** allowed MIME types only (`image/png`, `image/jpeg`, `image/webp`), enforced max size and file count; the **actual content type is validated**, not just the extension.
- **Private buckets:** storage is private by default; there is no public listing, and all access is via **time-limited signed URLs** scoped to the owning user.
- **User-scoped keys:** artifacts are namespaced under `users/{userId}/…` to prevent cross-user access and enumeration.
- **Untrusted content isolation:** screenshots/HTML captured from audited sites are treated as untrusted — never executed in Audient's context; image decoding/dimension checks guard against malformed files.
- **Retention:** captured site content is subject to a retention/TTL policy (data minimization), tracked via the File Assets inventory for reliable cleanup and GDPR deletion.

---

## 7. PDF Security

- **Sandboxed rendering:** report PDFs are rendered by a headless browser (Playwright) in a **sandboxed, network-restricted** context, so untrusted content embedded in a report cannot trigger outbound requests or access internal resources.
- **Trusted data source:** PDFs are generated from Audient's own stored `reportJson`, not from live re-fetching of the audited site at render time — limiting injection vectors.
- **Content sanitization:** any user/site-derived text placed into the PDF template is escaped/sanitized to prevent markup or script injection into the rendering context.
- **Private storage + signed access:** generated PDFs are stored in private object storage and downloaded only via short-lived, user-scoped signed URLs.
- **Tier authorization:** PDF access is gated to Pro/Enterprise and verified server-side on each download request.
- **No sensitive data leakage:** PDFs contain only the user's own audit content; no internal identifiers, secrets, or other users' data.

---

## 8. Prompt Injection Prevention

The audit pipeline feeds **untrusted content** (website copy, HTML, screenshots) into an LLM — a prompt-injection surface that must be contained.

- **Treat site content as untrusted data, not instructions:** captured HTML/text is passed as clearly delimited **input data**, with system prompts instructing the model to analyze it as content to evaluate — never as commands to follow.
- **Strong system prompt boundaries:** the rubric, output schema, and role are fixed in the system prompt; the model is instructed to **ignore any instructions found within the audited content**.
- **Structured output enforcement:** the model must return a **fixed JSON schema** (issues, severity, fixes). Output is **validated** against the schema and anything off-contract is rejected/repaired — so an injection attempting to change output format fails validation.
- **No tool/action authority from model output:** the LLM only produces findings; it cannot trigger side effects, database writes, or external calls. All actions are performed by deterministic code around it.
- **Input sanitization & bounding:** captured content is truncated/normalized and stripped of control sequences before being sent, reducing injection payload surface and token cost.
- **Deterministic scoring outside the model:** scores are computed in code from validated findings, so an injection cannot manipulate the headline score.
- **Output validation before storage/display:** findings are schema-checked and de-duplicated before persistence, preventing malicious content from flowing unchecked into reports.

---

## 9. Input Validation

- **Boundary validation:** all API inputs validated against strict schemas (types, formats, enums, ranges) → `400 VALIDATION_ERROR` on failure.
- **Domain constraints at the DB:** `NOT NULL`, `CHECK` (e.g., non-negative credit balance, score 0–100), enums, and foreign keys prevent invalid data even if application logic has a bug.
- **URL validation:** dedicated validation + SSRF checks for audit target URLs (see §3).
- **File validation:** MIME/type/size/count checks for uploads (see §6).
- **Enum/whitelist enforcement:** tiers, categories, severities, statuses, and settings values are constrained to allowed sets.
- **No mass assignment:** only whitelisted fields are accepted on updates (e.g., profile, settings); server-controlled fields (role, tier, balances) can never be set by the client.
- **Output encoding:** all user/site-derived content is escaped on render (web and PDF).

---

## 10. Stripe (Payment) Security

- **Hosted payment flows:** card entry happens on **Stripe Checkout / Billing Portal**; card data never touches Audient's servers → minimal **PCI-DSS (SAQ-A)** scope.
- **No card storage:** only Stripe reference IDs (`customerId`, `subscriptionId`, `paymentIntentId`, `invoiceId`) are stored — never PANs.
- **Webhook signature verification:** every Stripe webhook is verified with the signing secret; unverified events are rejected.
- **Idempotent webhook handling:** events are de-duplicated (keyed on Stripe event ID via the Processed Webhook Events table) — Stripe may deliver events more than once.
- **Server-authoritative entitlements:** tier/credit changes are applied **only** from verified webhooks, never from client "success" redirects (which can be spoofed).
- **Server-side amounts:** prices and credit-pack values come from server config; client-provided amounts are never trusted.
- **Financial record integrity:** payments are append-only; GDPR deletion **anonymizes** payment records rather than destroying required financial history.

---

## 11. Supabase Security

- **Row-Level Security everywhere:** RLS is **mandatory** on every user-owned table, enforced with `auth.uid()`, so even direct database access (Supabase client) cannot cross tenant boundaries. This is the most important Supabase-specific control.
- **Service-role key isolation:** the service-role key (bypasses RLS) is used **only** in trusted server code/workers — never exposed in the client bundle or to the browser.
- **Anon key scoping:** the public anon key is safe for the client only because RLS restricts what it can read/write.
- **Auth ↔ app data bridge:** a Supabase auth hook/trigger atomically seeds the app `Users`, `Membership`, `Credits`, and `Settings` on new-user creation, keeping identity and app data consistent.
- **Storage policies:** Supabase Storage buckets are private with access policies aligned to user ownership; downloads via signed URLs.
- **Schema hygiene:** application tables live in `public` with explicit policies; the `auth` schema is not modified directly; migrations (including RLS) are versioned and reviewed.
- **Environment isolation:** separate Supabase projects for dev/staging/production, each with its own keys and data.
- **Encryption:** data encrypted in transit (TLS) and at rest by the managed platform.

---

## 12. Data Protection & Privacy (Cross-Cutting)
- **No AI training on user data** (PRD §8.2) — submitted sites, screenshots, and reports are used only to produce that user's audit.
- **Right to erasure (GDPR):** account deletion cascades removal of audits, reports, recommendations, notifications, settings, and stored files; payment records are anonymized (retained for finance/tax).
- **Data minimization & retention:** audited-site content is retained only as long as needed, governed by a retention/TTL policy.
- **Encryption:** TLS in transit; encryption at rest for database and object storage.
- **Compliance posture:** GDPR/CCPA alignment, clear Terms & Privacy Policy, PCI handled via Stripe.

---

## 13. Operational Security
- **Environment isolation:** distinct secrets, databases, and Stripe keys (test vs. live) per environment.
- **Audit logging:** security-relevant events (logins, deletions, plan changes, admin actions) recorded in an append-only Activity Log for traceability and compliance.
- **Dependency hygiene:** automated dependency scanning (e.g., Dependabot) and prompt patching.
- **Monitoring & alerting:** Sentry + uptime/log monitoring flag error spikes, auth anomalies, and unusual spend.
- **Least-privilege access:** scoped credentials per integration; admin access limited and logged.

---

## Security Layer Summary

| Area | Primary Controls |
|------|------------------|
| Authentication | Supabase Auth, JWT verification, httpOnly cookies, email verification, optional MFA |
| Authorization | Ownership scoping (404), RBAC, tier+status gating, Postgres RLS |
| API Security | TLS, schema validation, security headers, CORS/CSRF, **SSRF protection**, idempotency |
| Credit Abuse | Email gate, server-authoritative transactional deduction, ledger, anti-farming heuristics |
| Rate Limiting | Redis per-user/IP limits, queue concurrency caps, auth throttling |
| File Security | Signed URLs, private buckets, MIME/size validation, user-scoped keys, isolation |
| PDF Security | Sandboxed rendering, trusted data source, sanitization, signed access, tier gating |
| Prompt Injection | Untrusted-content boundaries, schema-enforced output, no model action authority |
| Input Validation | Boundary schemas, DB constraints, whitelists, no mass assignment |
| Stripe Security | Hosted flows, no card storage, signature-verified idempotent webhooks, server-authoritative |
| Supabase Security | Mandatory RLS via auth.uid(), service-role isolation, storage policies, env isolation |

---
