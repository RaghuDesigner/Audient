# AUDIENT — BACKEND-002.1  
# DATABASE ARCHITECTURE RECONCILIATION

**Status:** Approved  
**Approved on:** 2026-08-15  
**Last updated:** 2026-08-15  
**Depends on:** BACKEND-001 (complete), BACKEND-002 review  
**Phase rule:** Conflicts resolved on paper. Corrective migrations may be authored in a follow-up apply phase — **not auto-started by this approval alone.**

---

## 0. Decisions summary (locked by this document)

| Topic | Decision |
|-------|----------|
| Pricing SoT | `docs/PRICING.md` + `src/config/plans.ts` |
| Plan credits | FREE **300** · PRO **1000** · ENTERPRISE/Business **10000** (metered, **not** unlimited) |
| Obsolete | Free 200 · Pro 2000 · Enterprise unlimited — **rejected** |
| Guest audits | Opaque guest session + owned rows + TTL + claim-on-login (see §2) |
| Audit input DB values | `SCREENSHOT` \| `URL` only |
| Findings graph | **AUDIT → REPORT → FINDINGS** (table remains `recommendations` until rename migration) |
| Severity | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW` \| `INFO` |
| Credits | Split wallet + immutable ledger + atomic server ops |
| Membership | Server-writable only; tier enum `FREE`/`PRO`/`ENTERPRISE` |
| Invoices | **No new invoices table for MVP** — map `payments` → Invoice History API |
| Jobs table | **Not required** — enrich `audits` for workers |
| Workspaces | **DDL deferred**; frontend stays mock |
| Existing migrations | **Keep**; follow with **corrective migrations** after approval |

---

## 1. Source of truth — pricing

### 1.1 Authoritative

| Source | Role |
|--------|------|
| `docs/PRICING.md` | Product rules (guest, costs, gates) |
| `src/config/plans.ts` | Runtime plan catalog until DB plans are synced |

### 1.2 Target plan seed

| `plans.key` | UI name | `monthly_credits` | `price_cents` (monthly) | `screenshot_cost` | `url_cost` | `is_unlimited` | URL audits |
|-------------|---------|-------------------|-------------------------|-------------------|------------|----------------|------------|
| `FREE` | Free | **300** | 0 | 150 | **0** | **false** | disabled |
| `PRO` | Pro | **1000** | 2900 | 100 | **400** | **false** | enabled |
| `ENTERPRISE` | **Business** | **10000** | 9900 | 50 | **100** | **false** | enabled |

Annual prices: store as separate `plans` rows with `billing_interval = YEARLY` when Stripe yearly prices exist (nullable `stripe_price_id` until then). Do not invent yearly cents in this phase beyond product docs.

### 1.3 Obsolete references (do not re-seed)

- Free **200**, Pro **2000**, Enterprise **unlimited** / `is_unlimited = true`
- SCHEMA.md Credits section describing those values
- Auth trigger fallbacks of **200**
- Seed display_name `"Enterprise"` without Business labeling

**Doc follow-up (non-DDL):** mark SCHEMA Credits / Enterprise-unlimited as superseded by PRICING (separate docs PR; not blocking reconciliation approval).

### 1.4 Frontend / DB duplication

- Short term: `plans.ts` remains frontend SoT while mock auth is on.
- After corrective seed + API: **DB `plans` is billing SoT**; frontend reads via API or generated config — do not hardcode divergent grants in UI.

---

## 2. Guest audit model

### 2.1 Product rules

| Rule | Behavior |
|------|----------|
| Auth | Guest = unauthenticated |
| Allowed | Exactly **1** `SCREENSHOT` audit (teaser / minimal report) |
| Forbidden | URL audits; extra screenshots without login |
| After login | Claim guest audit into user history when claim token valid |

### 2.2 Guest identifier

| Item | Definition |
|------|------------|
| Cookie | Existing `audient_guest_id` (UUID, httpOnly) — **browser correlation only** |
| Server secret | `guest_sessions` row (or equivalent) with `id`, `guest_key_hash`, `created_at`, `expires_at`, `claimed_at`, `claimed_by_user_id` |
| Client never stores | Raw capability to list other guests’ audits |

**Do not** use only the public cookie as authorization for reading audit payloads.

### 2.3 Ownership model (security-first)

Prefer **dedicated guest owner** over nullable `user_id` on all user tables:

1. On first guest audit: create `guest_sessions` + ephemeral **guest user** row in `public.users` with:
   - `status = 'ACTIVE'` (or dedicated flag later)
   - `email` = synthetic unique (`guest+{uuid}@audient.guest`)
   - `auth_provider_id` = **NULL** until claim *(requires making `auth_provider_id` nullable)* **or** synthetic UUID not in `auth.users` with CHECK that guest rows skip Auth FK  
2. Prefer cleaner approach:

**Adopted approach (BACKEND-002.1):**

| Column additions | Purpose |
|------------------|---------|
| `audits.guest_session_id` UUID NULL → `guest_sessions` | Guest ownership |
| `audits.user_id` UUID **NULL allowed** | Set on create for authed users; **NULL while guest**; set on claim |
| `file_assets.guest_session_id` UUID NULL | Guest asset ownership |
| `file_assets.user_id` UUID NULL | Same pattern |
| CHECK | Exactly one of (`user_id`, `guest_session_id`) is non-null for audits/assets in guest-capable tables |

Authenticated audits: `user_id` NOT NULL, `guest_session_id` NULL.  
Guest audits: `guest_session_id` NOT NULL, `user_id` NULL until claim.

**RLS:** guests never get a JWT. Guest read/write only via **server routes** holding the guest session secret (service role or SECURITY DEFINER RPC with hashed token). Anon JWT must **not** SELECT arbitrary guest audits.

### 2.4 TTL / expiration

| Asset | TTL (initial recommendation) |
|-------|------------------------------|
| `guest_sessions.expires_at` | **7 days** from creation |
| Guest `file_assets.expires_at` | **7 days** (align with session) |
| Guest audit rows | Soft-delete or hard-delete after TTL if `claimed_at` IS NULL |

Cleanup: scheduled job (Edge Function / cron) deletes expired unclaimed guest sessions, audits, reports, findings, and Storage objects.

### 2.5 Claim process

```
Guest completes screenshot audit (user_id NULL, guest_session_id set)
  → Client receives claim_token (high-entropy, stored hashed on guest_sessions)
User authenticates (mock later → Supabase Auth)
  → POST /api/guest/claim { claim_token }
  → Server verifies hash, expiry, unclaimed
  → Sets audits.user_id = current app user; clears guest_session_id (or keeps for audit trail)
  → Same for file_assets
  → Marks guest_sessions.claimed_at / claimed_by_user_id
  → Does NOT grant extra Free credits beyond normal signup grant
```

### 2.6 Claim security

- One-time claim token; rotate/invalidate on use  
- Bind claim to authenticated `auth.uid()` → `users.id`  
- Reject if session expired or already claimed  
- Rate-limit claim endpoint  
- Never accept raw `guest_session_id` alone from the client as proof  

### 2.7 If guest never logs in

- After TTL: purge guest session, orphaned audits/reports/findings/assets, Storage keys  
- No membership/credits created  

---

## 3. Audit model (reconciled fields)

Preserve migration capabilities; add guest + worker fields via corrective migration.

### 3.1 `audits` — locked column set

| Column | Required | Notes |
|--------|----------|-------|
| `id` | YES | UUID PK |
| `user_id` | CONDITIONAL | NULL iff guest; NOT NULL for authed |
| `guest_session_id` | CONDITIONAL | NULL iff authed |
| `input_type` | YES | `SCREENSHOT` \| `URL` |
| `website_url` | CONDITIONAL | Required when `URL` (keep migration name; API may alias `sourceUrl`) |
| `primary_asset_id` | NO | FK → `file_assets` for screenshot audits *(add if missing)* |
| `status` | YES | `QUEUED` \| `PROCESSING` \| `COMPLETED` \| `FAILED` |
| `progress_percent` | YES | 0–100; default 0 |
| `credits_cost` | YES | Snapshot of charged credits |
| `overall_score` | NO | Set on COMPLETED |
| `accessibility_score` | NO | Keep |
| `conversion_score` | NO | Keep |
| `mobile_score` | NO | Keep |
| `competitor_urls` | YES | Default `{}` |
| `summary` | NO | Short teaser/summary |
| `failure_code` | NO | Typed code when FAILED *(add)* |
| `error_message` | NO | Human message; required when FAILED (existing CHECK) |
| `attempt_count` | YES | Default 1 *(add)* |
| `claimed_at` | NO | Worker claim timestamp *(add)* |
| `worker_id` | NO | Worker instance id *(add)* |
| `correlation_id` | NO | Request/trace id *(add)* |
| `started_at` | NO | |
| `completed_at` | NO | Success completion |
| `failed_at` | NO | Failure timestamp *(add)* |
| `created_at` / `updated_at` | YES | |
| `deleted_at` | NO | Soft delete |

**Keep** migration name `website_url` (do not rename in-place without dual-write); document API alias.

### 3.2 Lifecycle

```
QUEUED → PROCESSING → COMPLETED
QUEUED → PROCESSING → FAILED
```

No skipping `PROCESSING` in production workers.

### 3.3 Retry

| Rule | Behavior |
|------|----------|
| Product retry | Creates a **new** `audits` row (new id) linked optionally via `metadata.parent_audit_id` or `retry_of_audit_id` *(optional FK)* |
| Do not | Mutate a COMPLETED/FAILED row back to QUEUED in a way that erases history |
| Worker redelivery | May increment `attempt_count` on same row only while status is QUEUED/PROCESSING and claim lease valid |
| Credits | New attempt charges again unless product says otherwise; FAILED refunds per failure catalog `refundEligible` |

---

## 4. Audit input types

| Database (`audit_input_type`) | Allowed |
|-------------------------------|---------|
| `SCREENSHOT` | Guest (1×), Free, Pro, Business |
| `URL` | Pro, Business only |

| Frontend label | Maps to |
|----------------|---------|
| Image / Screenshot / Upload | `SCREENSHOT` |
| Website / URL / Live URL | `URL` |

History mocks using `screenshot` | `website` must map to these enums at API boundary — **DB never stores `IMAGE` or `website`.**

---

## 5. Audit findings architecture

### 5.1 Locked graph

```
audits
  └── reports          (1:1 on completed paid/full reports; teaser may omit or use minimal report)
        └── recommendations   ← physical table name (MVP)
              = FINDINGS in product/API terminology
```

### 5.2 Naming reconciliation

| Layer | Name |
|-------|------|
| SQL table | `recommendations` (remain until explicit rename migration) |
| API / DTOs / docs | **Findings** |
| Comment on table | Update to “UX findings (API: findings)” |

**Do not** drop recommendation columns. Optional later: `ALTER TABLE recommendations RENAME TO audit_findings` + view alias.

### 5.3 Finding fields (keep + extend)

Keep: `report_id`, `category`, `severity`, `title`, `description`, `business_impact`, `recommendation`, `priority`, `screenshot_ref`, timestamps.

Optional add: `evidence JSONB`, `score_impact NUMERIC` — non-breaking additive migration.

---

## 6. Severity standardization

### 6.1 Target enum

```
CRITICAL | HIGH | MEDIUM | LOW | INFO
```

### 6.2 Existing → target map

| Current (`severity`) | Target |
|----------------------|--------|
| `CRITICAL` | `CRITICAL` |
| `MAJOR` | `HIGH` |
| `MINOR` | `MEDIUM` |
| *(none)* | `LOW`, `INFO` (new) |

Corrective migration pattern:

1. Add new enum values (or new enum type + column swap).  
2. UPDATE rows MAJOR→HIGH, MINOR→MEDIUM.  
3. Drop obsolete values when safe.  
4. Align `src/utils/finding-severity.ts` to identity map (no major/minor).

Frontend mocks using `high`/`medium`/`low` already match target casing in UI — persist uppercase in DB.

---

## 7. Credits architecture (locked)

### 7.1 Account (`credits`)

| Column | Role |
|--------|------|
| `plan_credits` | Monthly allotment remaining |
| `purchased_credits` | Top-ups (rollover) |
| `balance` | Generated `plan_credits + purchased_credits` |
| `monthly_grant` | Snapshot of plan grant size |
| `is_unlimited` | **Always false** under PRICING |
| `lifetime_used` | Analytics |
| `last_reset_at` / `next_reset_at` | Cycle |

Defaults in schema must become **300** (not 200) via corrective migration.

### 7.2 Ledger (`credit_transactions`)

- Immutable: no client UPDATE/DELETE; prefer trigger preventing mutations.  
- Keep `credits_id`, `amount`, `type`, `balance_after`, `plan_after`, `purchased_after`, `audit_id`, `note`/`description`.  
- Add `payment_id` NULL → payments (top-ups).  
- Extend enum with `ADMIN_ADJUSTMENT`.

**Type mapping:**

| Product | Enum |
|---------|------|
| Plan allocation | `MONTHLY_GRANT` |
| Audit usage | `AUDIT_DEDUCTION` |
| Top-up | `TOPUP` |
| Refund | `REFUND` |
| Admin | `ADMIN_ADJUSTMENT` |

### 7.3 Atomic operations (server only)

Single DB transaction:

1. Lock `credits` row (`FOR UPDATE`)  
2. Validate balance ≥ cost (unless future unlimited — unused)  
3. Decrement plan first, then purchased (document policy)  
4. Insert ledger row  
5. Commit  

Failed audit with `refundEligible`: reverse via `REFUND` (+amount) in new ledger row — never edit the deduction row.

### 7.4 Frontend display

```
remaining = plan_credits + purchased_credits  // = balance
```

Mocks may keep a single number; API returns `remaining` derived field.

---

## 8. Membership architecture (locked)

| Item | Decision |
|------|----------|
| Codes | `FREE` \| `PRO` \| `ENTERPRISE` (UI: Business) |
| Cardinality | One active `memberships` row per user |
| Writes | **service_role / trusted server only** |
| Stripe | Keep `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `plan_id` |
| History | `membership_events` **later** — not in this apply batch |
| Client | Cannot set tier (matches product; mock purchase stays server-simulated until Stripe) |

Signup (auth trigger): FREE membership + credits grant **300**.

---

## 9. Plans architecture (locked)

Retain `plans` catalog columns from migration; seed corrected per §1.2.

| Capability | Storage |
|------------|---------|
| URL permission | `features` JSON (`urlAudits`) **and/or** `url_cost > 0` |
| Stripe price ids | `stripe_price_id` per interval row |
| Active flag | `is_active` |

Annual price: YEARLY interval rows when needed — not hardcoded in app.

---

## 10. Payments / invoices (locked)

### 10.1 No MVP `invoices` table

Invoice History UI maps from `payments`.

### 10.2 Existing `payments` fields (keep)

`id`, `user_id`, `membership_id`, `amount`, `currency`, `status`, `type`, `stripe_invoice_id`, `stripe_subscription_id`, `stripe_payment_intent_id`, `credits_granted`, timestamps, soft delete.

### 10.3 Additive fields for UI/Stripe completeness

| Field | Purpose |
|-------|---------|
| `invoice_url` | Hosted invoice / PDF link |
| `paid_at` | When SUCCEEDED |
| `external_payment_id` | Optional generic id if not Stripe-only |
| `description` / `invoice_number` | Display helpers (nullable) |

Customer Stripe id remains on **`memberships.stripe_customer_id`** (avoid duplicating unless denormalizing for invoices list).

### 10.4 API mapping (Invoice History)

| UI field | Source |
|----------|--------|
| Amount / currency / status | `payments` |
| Invoice URL | `invoice_url` |
| Paid date | `paid_at` or `created_at` |
| Plan / cycle | Join membership / metadata JSON |
| Credits granted | `credits_granted` |

---

## 11. AI audit worker support (locked)

**No separate jobs table** for MVP.

Worker uses `audits` columns in §3.1:

- `status`, `progress_percent`, `attempt_count`  
- `claimed_at`, `worker_id`, `correlation_id`  
- `failure_code`, `error_message`  
- `started_at`, `completed_at`, `failed_at`  

Claim lease: worker sets `claimed_at` + `worker_id` when moving `QUEUED` → `PROCESSING`; stale claims reaped by timeout.

Failure codes align with `src/config/audit-failure.ts` (`SSRF_BLOCKED`, …, `INTERNAL_ERROR`). Prefer TEXT + CHECK or Postgres enum matching that catalog.

---

## 12. File assets (locked)

### 12.1 Keep / extend `file_assets`

| Column | Notes |
|--------|-------|
| `id` | PK |
| `user_id` | NULL if guest |
| `guest_session_id` | NULL if authed |
| `storage_key` | Object path |
| `file_type` | SCREENSHOT, ANNOTATION, PDF, OTHER |
| `mime_type` | |
| `size_bytes` | |
| `audit_id` / `report_id` / `recommendation_id` | Optional links |
| `expires_at` | Guest TTL |
| timestamps / `deleted_at` | |

CHECK: exactly one owner (`user_id` XOR `guest_session_id`).

### 12.2 Guest cleanup

Cron deletes Storage object + row when `expires_at < now()` and unclaimed.

---

## 13. RLS requirements (reconciled)

| Table | Anon | Authenticated user | Service role |
|-------|------|--------------------|--------------|
| plans | SELECT active | SELECT active | ALL |
| users | deny | own row | ALL |
| memberships / credits / credit_transactions / payments | deny | SELECT own | ALL writes |
| audits / reports / recommendations | deny | own via user_id / ownership helpers | ALL |
| notifications | deny | SELECT/UPDATE read/DELETE own; no INSERT | INSERT+ |
| file_assets | deny | own | ALL |
| guest_sessions | deny | deny | ALL |
| Guest audits/assets | **No direct anon policies** | — | Server RPC only |
| Workspaces* | — | — | Deferred |

\*When workspace DDL lands: member-scoped policies + permission helpers.

**Never** rely on frontend gates for credits, URL permission, or membership.

---

## 14. Existing migrations — disposition

| Migration | Disposition |
|-----------|-------------|
| `…000_extensions_enums.sql` | **Remain** → follow with enum corrective migration (severity, credit_txn_type, guest support) |
| `…001_functions.sql` | **Remain** |
| `…002_identity_plans.sql` | **Remain** → amend via later migration (`auth_provider_id` nullability only if required by chosen guest design; prefer guest_session without nullable auth id on normal users) |
| `…003_credits.sql` | **Remain** → corrective defaults 300; `ADMIN_ADJUSTMENT`; `payment_id` |
| `…004_product.sql` | **Remain** → guest columns; worker columns; `failure_code`; nullable `user_id` + CHECKs |
| `…005_billing_engagement.sql` | **Remain** → `invoice_url`, `paid_at` |
| `…006_indexes.sql` | **Remain** → add guest_session / failure / claim indexes |
| `…007_triggers.sql` | **Remain** → optional append-only ledger trigger |
| `…008_seed_plans.sql` | **Supersede via corrective seed migration** (do not edit file if already applied anywhere; add new migration) |
| `…009_rls_policies.sql` | **Remain** → policies for guest_session (deny) + updated audits ownership |
| `…010_auth_user_sync.sql` | **Remain** → corrective function replace: grant **300**, never unlimited Business |

**Rule:** never silently drop production-relevant columns. Additive + enum remap only.

---

## 15. Pricing seed correction (required corrective migration)

**New migration (after approval), not an edit of `…008` if deployed:**

1. UPDATE `plans` SET correct credits/costs/`is_unlimited`/`display_name`.  
2. REPLACE auth trigger / backfill function fallbacks `200` → `300`.  
3. Optionally UPDATE existing Free users’ `monthly_grant` / `plan_credits` only under an explicit product rule (default: **new signups only**; existing balances untouched unless ops requests backfill).

Target values: §1.2.

---

## 16. Workspace

- **No DDL** in BACKEND-002.1 apply batch.  
- Frontend `/workspace` and roles remain **mock**.  
- Architecture reserved in BACKEND-002 §7 for a later phase.

---

## 17. Required corrective migrations (checklist for apply phase)

Ordered recommendation (names illustrative):

1. `…011_guest_sessions.sql` — `guest_sessions` + FKs  
2. `…012_audits_guest_and_worker.sql` — nullable `user_id`, `guest_session_id`, worker/failure columns, CHECKs  
3. `…013_file_assets_guest.sql` — guest ownership XOR check  
4. `…014_severity_remap.sql` — CRITICAL/HIGH/MEDIUM/LOW/INFO + data map  
5. `…015_credits_adjustments.sql` — defaults 300, `ADMIN_ADJUSTMENT`, `payment_id`  
6. `…016_payments_invoice_fields.sql` — `invoice_url`, `paid_at`, …  
7. `…017_seed_plans_pricing_correction.sql` — PRICING seed  
8. `…018_auth_trigger_grant_300.sql` — trigger/function replace  
9. `…019_rls_guest_and_updates.sql` — RLS adjustments  
10. Optional: findings comment / rename view `findings` → `recommendations`

**Do not run these until BACKEND-002.1 is approved.**

---

## 18. Success criteria (this phase)

| Criterion | Status |
|-----------|--------|
| Pricing conflicts resolved | **Locked** (§1) |
| Guest ownership model defined | **Locked** (§2) |
| Audit fields reconciled | **Locked** (§3) |
| Input types standardized | **Locked** (§4) |
| Severity standardized | **Locked** (§6) |
| Findings/report architecture locked | **Locked** (§5) |
| Credits architecture locked | **Locked** (§7) |
| Membership architecture locked | **Locked** (§8) |
| Payment/invoice mapping defined | **Locked** (§10) |
| AI worker requirements defined | **Locked** (§11) |
| File asset requirements defined | **Locked** (§12) |
| Existing migrations accounted for | **Locked** (§14) |
| Corrective migrations identified | **Locked** (§17) |
| RLS requirements defined | **Locked** (§13) |
| Tables changed | **None** (by design) |

---

## 19. Out of scope

- Applying migrations  
- Disabling `USE_MOCK_AUTH`  
- Stripe / AI worker implementation  
- Workspace DDL  
- Editing obsolete SCHEMA prose (recommended follow-up docs PR only)

---

## 20. Approval record

**Approved 2026-08-15**, including:

1. Guest model (session + XOR ownership + server-only access)  
2. Severity remap MAJOR→HIGH, MINOR→MEDIUM  
3. SQL table name `recommendations` with API name **Findings**  
4. No invoices table (map `payments`)  
5. Corrective migration list §17  

**Next step (explicit request required):** BACKEND-002 apply phase — author/run versioned corrective migrations from §17. Do **not** flip `USE_MOCK_AUTH` in that phase unless separately approved.

---

**End of BACKEND-002.1 — no database tables were modified by this approval.**
