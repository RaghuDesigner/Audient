# Audient — AI Engine Architecture

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Audience:** AI/ML · Backend · Platform · QA · Product  

**Format:** Markdown only — **no application code**.  
**Purpose:** Define how the Audient AI audit engine is structured, orchestrated, secured, and operated — consuming versioned prompts from `AI_PROMPTS.md` and the stage sequence in `AI_WORKFLOW.md`.

**Related:** `AI_PROMPTS.md` · `AI_WORKFLOW.md` · `TECHNICAL_ARCHITECTURE.md` · `SECURITY.md` (§8) · `SCHEMA.md` · `ERROR_HANDLING.md` · `ANALYTICS.md` · `PRICING.md` · `BUSINESS_RULES.md` (BR-AI-*) · `BACKEND_TASKS.md` (BM-07/08/09) · `DEPLOYMENT.md`

**Non-goals:** Teams/API keys · required competitive analysis (`BR-AI-006` undecided) · model-owned overall scores · training on customer data (`BR-SEC-004`).

---

## 1. Engine overview

The AI engine is the **core product loop**: capture evidence → analyze with multimodal LLM + measured tools → score in code → persist → notify → (paid) PDF.

```text
┌─────────────────────────────────────────────────────────────────┐
│                     API (sync intake)                           │
│  Validate · Auth · Tier · Reserve credits · Enqueue · 202       │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Worker orchestrator (BullMQ)                       │
│  Stage runner · timeouts · retries · progress events            │
└───┬─────────┬─────────┬──────────┬──────────┬───────────────────┘
    ▼         ▼         ▼          ▼          ▼
 Crawl   Screenshots  Extract   axe+LH    Evidence bundle
 (URL)      (both)      DOM      facts         │
    └─────────┴─────────┴──────────┴───────────┘
                             ▼
              ┌──────────────────────────────┐
              │   lib/ai (provider-agnostic) │
              │   Prompt pipeline A0–A6/R1   │
              └──────────────┬───────────────┘
                             ▼
              Validate JSON → Recommendation Engine (code scores)
                             ▼
              Persist · PDF (paid) · Notify · Analytics
```

| Mode | Evidence | Time budget | Report depth |
|------|----------|-------------|--------------|
| **Screenshot** | User upload (+ optional light axe if rendered) | ≤ ~90s | Brief (Free) / fuller if paid |
| **URL** | Crawl + desktop/mobile shots + DOM + axe + Lighthouse | ≤ ~8 min | Full (Pro/Business) |

**Tier depth:** Free = brief summary + limited findings (`BR-AI-003`); Pro/Business = full + PDF. Guest = Free-depth screenshot once (`PRICING.md`).

---

## 2. Workflow

Aligns with `AI_WORKFLOW.md` Steps 1–14. Engine-owned stages are **4–12** (worker).

### 2.1 Sync intake (API — not LLM)

1. URL/screenshot validation (SSRF for URL).  
2. Auth + email verified.  
3. Tier gate (URL = paid).  
4. Credit reserve + `Audit` `QUEUED` + enqueue.  
5. Return `202` → UI Progress (`SCREEN-M01`).

### 2.2 Async pipeline (worker)

| Stage | Name | Engine role |
|-------|------|-------------|
| 4 | Website crawling | URL only — Playwright map |
| 5 | Screenshot generation | Capture / normalize / store |
| 6 | HTML extraction | DOM outline + copy bounds |
| 7 | Accessibility + speed scan | axe-core + Lighthouse facts |
| 8 | UX analysis prep | Evidence bundle + rubric binding |
| 9 | Multimodal analysis | Prompt pipeline → findings JSON |
| 10 | Recommendation engine | Dedup, severity/priority normalize, **deterministic scores** |
| 11 | Database storage | Audit, Report, Recommendations, FileAssets |
| 12 | PDF generation | Paid HTML→PDF from `reportJson` |
| 13–14 | Dashboard + notification | Status COMPLETED + `AUDIT_COMPLETE` |

### 2.3 Progress mapping (UI)

| Screenshot stages | URL stages |
|-------------------|------------|
| Queued → Upload received → Analyzing → Summarizing | Queued → Crawling → Screenshots → Accessibility → AI analysis → Report |

Emit status/`progress` for poll or Realtime `audit:{id}`.

### 2.4 Terminal outcomes

| Outcome | Credits | Next UI |
|---------|---------|---------|
| `COMPLETED` | Kept | Report M02 |
| `FAILED` (hard) | Full refund (`BR-ERR-001`) | Failure M03 |
| Cancel (if supported) | Refund if reserved | Home |
| PDF-only fail | **No** audit refund (`BR-PDF-004`) | Report still usable |

---

## 3. Prompt pipeline

Defined in `AI_PROMPTS.md` §6. Workers **pin** `prompt_id` + `prompt_version` per environment.

```text
A0  SYS-001          System role, injection rules, schema, rubric
A1  CORE-URL | CORE-SHOT   Primary multimodal audit
A2  DIM-* (optional) Specialist passes (a11y, type, CTA, …)
A3  MERGE-001        Dedup / cap max_findings
A4  SEV-001 / PRI-001  Severity & priority normalize
A5  SUM-001          Executive summary
A6  PDF-001          PDF narrative (paid only)
R1  REPAIR-001       Bounded JSON repair on validation fail
```

**MVP default:** `A0 → A1 → validate → A4 (lite) → A5 → (A6 if paid)`.  
**Full quality:** enable A2 specialists within token/cost bounds (`BR-AI-005`).

### Rules

- All untrusted site content inside `<<<UNTRUSTED_SITE_CONTENT>>>` … `<<<END_…>>>`.  
- Model returns **findings only** — **never** `overallScore` (computed in code).  
- Variables from `AI_PROMPTS.md` §3; HTML never treated as instructions.  
- Version immutability: bump semver; rollback via config pin.

---

## 4. Screenshot analysis

### Inputs

- User-uploaded PNG/JPEG/WebP (signed upload) and/or crawl-captured viewport images.  
- Optional viewport metadata (`desktop` | `mobile`).  
- Mode `screenshot`: no crawl of other pages — state limitations in `meta.limitations`.

### Pipeline

1. Validate MIME/size (`BR-SHOT-002`).  
2. Normalize/resize for vision token budget.  
3. Store in private object storage; pass `screenshot_ref` keys only.  
4. Run `PROMPT-CORE-SHOT-001` with SYS-001.  
5. Lower confidence when axe/DOM absent; do not invent unseen flows.

### Outputs

Findings with `evidence.screenshotRef` + optional `regionHint` for annotated report UI.

---

## 5. Website crawling

**URL mode only.** Tooling: Playwright Chromium in **network-isolated** workers (`SECURITY.md`).

### Behaviour

| Concern | Spec |
|---------|------|
| Scope | Entry URL + primary nav links; **bounded** page set |
| Render | Full JS execution for SPAs |
| Roles | Infer `page_role` (home, pricing, contact, …) |
| Redirects | Follow within same eTLD+1 policy; reject open redirects off-host |
| Blocks | Bot walls → taxonomy `SITE_BLOCKS_BOT` → suggest screenshot |
| SSRF | Re-resolve DNS per navigation; block private/metadata IPs |
| Timeout | Per-page + global crawl budget inside 8 min |

### Outputs

Page set: `{ pageUrl, pageRole, linkGraph }` → feeds screenshots + extraction.

---

## 6. Accessibility analysis

**Measured first, LLM second.**

| Layer | Tool | Role |
|-------|------|------|
| Fact | **axe-core** on rendered pages | WCAG-oriented violations |
| Fact | **Lighthouse / PSI** | Perf/speed UX signals |
| Interpret | `PROMPT-DIM-A11Y-001` / `PROMPT-WCAG-001` | Map facts → findings; add `wcagCriteria` |
| Score | Code | `accessibilityScore` from ACCESSIBILITY findings + axe severity weights |

### Rules

- Prefer axe rule IDs in `evidence.axeRuleIds`.  
- Do not invent violations absent from axe or clear visual evidence.  
- Target **WCAG 2.2 AA** language; no AAA claims.  
- Soft-fail policy: a11y engine errors may degrade (document) vs hard-fail entire audit — prefer continue with limitation note when possible (`ERROR_HANDLING`).

---

## 7. Typography analysis

Specialist: `PROMPT-DIM-TYPE-001` (optional A2).

| Signal | Source |
|--------|--------|
| Heading hierarchy | DOM outline (h1–h6) |
| Readability / density | Screenshots + copy excerpts |
| Contrast of text | axe contrast rules + `PROMPT-DIM-CONTRAST-001` |
| Consistency | Font variety / size steps from DOM + vision |

Findings map primarily to `VISUAL_HIERARCHY` or `COPY_MESSAGING` / `ACCESSIBILITY` as appropriate — **not** a separate SCHEMA category. Tag heuristics when useful (e.g. H8 aesthetic/minimalist).

---

## 8. UX analysis

Primary path: evidence assembly (Step 8) + core prompts (Step 9).

### Nine rubric dimensions (SCHEMA enums)

| Category | Focus |
|----------|-------|
| NAVIGATION | Findability, IA, menus |
| CTA | Visibility, clarity, competition |
| VISUAL_HIERARCHY | Scan path, emphasis |
| MOBILE_RESPONSIVENESS | Viewport parity, touch |
| COPY_MESSAGING | Clarity, tone, microcopy |
| TRUST_SIGNALS | Proof, security, contact |
| PAGE_SPEED | Perceived & measured speed |
| ACCESSIBILITY | Inclusive access |
| CONVERSION_FLOW | Path to lead/sale |

### Evidence bundle (per page / global)

Screenshots (desktop/mobile) · DOM outline · HTML excerpt (truncated) · axe JSON · Lighthouse metrics · vertical overlay · `report_depth` · `max_findings`.

Optional competitive screenshots **only if** BR-AI-006 decided + evidence supplied — default **omit**.

---

## 9. Heuristic evaluation

| Prompt | Use |
|--------|-----|
| `PROMPT-HEUR-001` | Tag findings with Nielsen codes when applicable |
| `PROMPT-HEUR-NIELSEN-001` | H1–H10 reference card |

Heuristics are **annotations** (`heuristics[]`), not a parallel scoring system. Do not force a tag. They help PDF narrative and QA review, not credit math.

---

## 10. Severity scoring

### Model-suggested severity

Enums: `CRITICAL` | `MAJOR` | `MINOR` per `PROMPT-SYS-001` / `PROMPT-SEV-001`.

| Level | Meaning |
|-------|---------|
| CRITICAL | Blocks primary task or serious a11y/legal barrier |
| MAJOR | Significant friction on key path |
| MINOR | Polish / low impact |

### Code normalization

- Clamp invalid enums.  
- Auto-downgrade severity when `confidence < 0.5` (configurable).  
- axe “critical” violations bias ACCESSIBILITY findings upward when facts support.  
- **Overall / category scores (0–100) computed only in code** — weighted penalties by severity × category weights (Recommendation Engine). Never accept model-supplied overall scores (injection defense).

---

## 11. Business impact

| Prompt | Role |
|--------|------|
| `PROMPT-BIZ-001` | Rewrite `businessImpact` → leads, sales, trust, drop-off |
| Core prompts | Require impact on every finding |

### Rules

- Qualitative by default — **no fabricated conversion %**.  
- Industry stats only as general knowledge, clearly non-measured.  
- Plain English for SMB owners (PRD growth framing).  
- Free brief reports still include impact on teaser findings.

---

## 12. Recommendation engine

**Runs after validated findings JSON** (Step 10). Mostly **deterministic code** + optional prompt passes A3–A5.

```text
Validated findings
    → Dedup / merge (MERGE-001 or code similarity)
    → Cap max_findings (tier/config)
    → Severity normalize (SEV-001 + rules)
    → Priority assign (PRI-001 + severity×effort×path)
    → Effort S|M|L (EFF-001 or heuristics)
    → Business impact polish (BIZ-001)
    → Score computation (code)
    → Executive summary (SUM-001)
    → Tier truncation (brief vs full)
    → Persist Recommendations + reportJson
```

### Priority

`HIGH` | `MEDIUM` | `LOW` — high severity + low effort → HIGH; conversion-path issues rank up.

### Scores (code)

Produce at minimum: `overallScore`, `accessibilityScore`, `conversionScore`, `mobileScore`, plus `categoryScores` map for report grid. Same findings ⇒ same scores (reproducibility).

### Tier truncation

| Free / guest | Pro / Business |
|--------------|----------------|
| Executive summary + limited findings | Full set |
| Category teasers | All categories |
| No PDF | PDF job |

---

## 13. JSON output

Canonical schema: `AI_PROMPTS.md` §5 (`schemaVersion` 1.0.0).

### Contract

- Structured-output / JSON mode when provider supports.  
- Validate enums, required fields, `findings` array (`BR-AI-004`).  
- Strip markdown fences if model wraps anyway.  
- Persist full payload in `Reports.reportJson`; map rows to `Recommendations`.

### Failure path

Invalid → **one** bounded `PROMPT-REPAIR-001` → still invalid → `FAILED` + refund + `AI_UNAVAILABLE` / validation taxonomy.

---

## 14. PDF generation

| Concern | Spec |
|---------|------|
| Who | Pro / Business (`BR-PDF-001`) |
| Source | Stored `reportJson` + `PROMPT-PDF-001` narrative merge |
| Render | Playwright HTML → PDF (same template family as web report) |
| Store | Private object storage; signed short-lived URL (`BR-PDF-003`) |
| Credits | **0** (`BR-PDF-002`) |
| Failure | Report remains COMPLETED; retry PDF only (`BR-PDF-004`) |
| Security | Sandboxed render; escape site-derived text; no live re-fetch |
| A11y | Aim tagged/accessible PDF where tooling allows |

Free users: no PDF job — Upgrade CTA in UI.

---

## 15. Retry logic

| Layer | Policy |
|-------|--------|
| Transient provider/network | Exponential backoff, capped attempts (e.g. 3) |
| JSON schema fail | Single repair prompt, then fail |
| Crawl flaky page | Skip page with limitation **or** fail if entry URL dead |
| Job stall / worker crash | Queue retry → then FAILED + refund (`WORKER_CRASH`) |
| User retry | New `POST /audits` + new Idempotency-Key |
| PDF | Independent retry; no credit refund |
| Idempotent refunds | Ledger-safe; never double-refund (`BR-ERR-003`) |

Do not infinite-retry against SSRF_BLOCKED or permanent 4xx validation.

---

## 16. Rate limits

| Control | Purpose |
|---------|---------|
| Per-user / per-IP on `POST /audits` | Abuse / cost (`429`) |
| Queue concurrency (global + per-tenant) | Cap simultaneous crawls/LLM calls |
| Provider RPM/TPM budgets | Stay under vendor limits; shed load gracefully |
| Guest rate + captcha hooks | `BR-GUEST-007` |
| Image / token caps | `max_findings`, page bound, image resize (`BR-AI-005`) |

Credits are an economic throttle; rate limits protect infrastructure and vendor quotas.

---

## 17. Caching

| Cache | Key idea | TTL / notes |
|-------|----------|-------------|
| Evidence artifacts | Storage keys immutable per audit | Per-audit lifetime |
| Prompt template | Version pin in worker memory | Deploy-scoped |
| Optional analysis reuse | Hash(mode + content fingerprint + prompt_version + rubric_version) | Short TTL; **never** cross-user without identical public URL policy |
| Lighthouse/axe | Per page URL+content hash within job | Intra-job only by default |
| CDN/API | N/A for private reports | Signed URLs only |

**Privacy:** Do not serve User A’s analysis to User B. Prefer cache **within** an audit job or identical owner+URL policy. Customer content not used for model training (`BR-SEC-004`).

---

## 18. Fallback models

Provider-agnostic `lib/ai` with ordered failover:

```text
Primary multimodal (vision) 
  → Secondary multimodal (same schema)
    → Text-only degrade (screenshot description limited) — last resort
      → FAILED + refund if no usable findings
```

| Rule | Detail |
|------|--------|
| Same JSON schema | All models must honor schema_version |
| Prompt pin | Fallback uses same prompt_version when possible |
| Telemetry | Log `model`, `fallback_used` |
| Quality | Fallback may lower confidence / fewer findings |
| Cost | Prefer cheaper fallback only after primary errors, not by default for paid full audits |

---

## 19. Logging

| Log | Include | Exclude |
|-----|---------|---------|
| Stage timing | stage, audit_id, duration_ms, status | Full HTML dumps in prod |
| LLM call | prompt_id, prompt_version, model, token_in/out, latency | Raw PAN, secrets, full screenshots |
| Validation | schema errors, repair attempted | Entire invalid blob if huge — truncate |
| Security | SSRF blocks, injection suspicion flags | Site PII beyond host |
| Credits | deduction/refund ids | — |

Correlate with `audit_id` + `correlationId` for support (`INTERNAL_ERROR`). Retention aligned with DEPLOYMENT/SECURITY.

---

## 20. Analytics

Product + AI ops events (`ANALYTICS.md`):

| Event | When |
|-------|------|
| `audit_started` | 202 create |
| `audit_queued` / `audit_processing` | Worker progress |
| `audit_completed` | COMPLETED + durationSec, overallScore? |
| `audit_failed` | Taxonomy code + refunded |
| `pdf_downloaded` | Paid download |
| `report_viewed` | Client |
| Internal AI metrics | tokens, cost_estimate, prompt_version, model, fallback_used, repair_count, stage_timings |

Never send screenshot binaries or full HTML to analytics. Respect consent banner for client events; server outcome events remain authoritative.

---

## 21. Monitoring

| Signal | Alert when |
|--------|------------|
| Audit success rate | Drop vs baseline |
| p95 duration | Screenshot >90s / URL >8min budget breach rate |
| LLM error / timeout rate | Spike |
| Token cost per audit | Spike or budget burn |
| Refund rate | Abnormal (quality or abuse) |
| Queue depth / age | Backlog |
| Worker crash / OOM | Immediate |
| SSRF block rate | Security review if novel patterns |
| Schema validation fail rate | Prompt/model regression |
| PDF failure rate | Eng (report OK) |

Dashboards: Sentry (exceptions) + metrics/logs (`DEPLOYMENT.md`). On-call for `AI_UNAVAILABLE` / `WORKER_CRASH` bursts.

---

## 22. Security & trust (engine-specific)

| Control | Mechanism |
|---------|-----------|
| Prompt injection | Delimiters, system rules, schema validation, no tool-calling authority |
| SSRF | DNS recheck, private IP deny, isolated worker network |
| Data isolation | Per-user storage keys; RLS on DB |
| No training | Vendor settings + contract: no customer data training |
| Scoring integrity | Scores in code only |
| PDF isolation | Sandbox + trusted `reportJson` |

---

## 23. Component map (code locations — descriptive)

| Module | Responsibility |
|--------|----------------|
| `src/lib/ai` | Provider clients, structured generate, failover |
| `src/lib/ai/providers/*` | Vendor adapters |
| `src/services/audit` | Orchestration, status, refunds |
| Crawler / processors | Playwright crawl, shots, extract, axe, LH |
| Recommendation / scoring utils | Deterministic scores, priority |
| `src/services/report` | reportJson assembly, PDF |
| `workers/*` | Queue consumer, stage runner |
| Prompt registry | Versioned templates from `AI_PROMPTS.md` |

---

## 24. Configuration knobs

| Knob | Effect |
|------|--------|
| `prompt_version` pin | Quality rollback |
| `max_findings` | Cost / brevity |
| `enable_specialists` | A2 on/off |
| `max_pages` | Crawl bound |
| `primary_model` / `fallback_model` | Failover |
| `analysis_cache_ttl` | Cost vs freshness |
| `stage_timeouts` | SLA enforcement |
| `report_depth` | brief \| full from tier |

---

## 25. Quality gates (before promoting a prompt/model)

- [ ] Schema fuzz + repair path tested  
- [ ] Injection corpus does not break output contract  
- [ ] Golden screenshot/URL fixtures score stable (±tolerance)  
- [ ] Token cost within BR-AI-005 budget  
- [ ] Free brief vs paid full depth verified  
- [ ] No competitive hallucination without BR-AI-006  
- [ ] Analytics + logs emit prompt_version/model  

---

## 26. Related documents

| Doc | Role |
|-----|------|
| AI_PROMPTS.md | Prompt texts, schema, chaining |
| AI_WORKFLOW.md | End-to-end stage narrative |
| SECURITY.md | Injection, SSRF, PDF, privacy |
| ERROR_HANDLING.md | Taxonomy + refunds |
| SCHEMA.md | Persistence shape |
| ANALYTICS.md | Event catalogue |
| BACKEND_TASKS.md | BM-07/08/09 implementation |

---

**End of AI_ENGINE_ARCHITECTURE.md**
