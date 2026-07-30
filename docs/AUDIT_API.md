# Audient — Audit API

**Status:** Draft  
**Last updated:** 2026-07-30  
**Owner:** Raghunath Kamlekar  
**Related:** API.md §2, AI_WORKFLOW.md, PRICING.md, SECURITY.md, COMPONENT_BEHAVIOR.md (BTN-001 GO, INP-001/002), SCREEN_MAPPING.md (SCREEN-M01 Progress)

Product-facing audit endpoints. Format: API Name · Purpose · Method · Endpoint · Called From · Request · Success · Failure · Frontend · Analytics.

**Canonical resource path in API.md:** `POST /audits` (same contract; `/ai/audit` is the product alias used below).

### Audit inventory

| ID | API Name | Method | Endpoint |
|----|----------|--------|----------|
| AUDIT-001 | Start Audit | `POST` | `/ai/audit` |
| AUDIT-002 | Check Progress | `GET` | `/audit/{auditId}` |
| AUDIT-003 | Get Audit Report | `GET` | `/audit/{auditId}/report` |
| AUDIT-004 | Download Report PDF | `GET` | `/report/{auditId}/pdf` |
| AUDIT-005 | Get History | `GET` | `/history` |

---

# Start Audit

---

## API Name

Start Audit

---

## Purpose

Starts AI UX Audit.

---

## Method

POST

---

## Endpoint

`/ai/audit`

(Alias of `/api/v1/audits`. Prefer one path in implementation; keep the other as redirect or dual-route.)

---

## Called From

GO Button (**BTN-001**) on Landing, Free Home, Pro Home.  
Requires Website URL (**INP-001**) and/or Screenshot upload (**INP-002**).

---

## Request

**URL audit (from your template):**

```json
{
  "website": "https://nike.com"
}
```

**Screenshot audit (same endpoint — GO with upload):**

```json
{
  "screenshotKeys": ["users/…/uploads/home.png"]
}
```

**Combined / explicit (optional):**

```json
{
  "website": "https://nike.com",
  "screenshotKeys": ["users/…/uploads/home.png"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `website` | string | One of website or screenshotKeys | Public `http://` or `https://` URL; max 2048 chars; SSRF-checked |
| `screenshotKeys` | string[] | One of website or screenshotKeys | Keys from prior upload (`POST /uploads/sign`) |

Header (recommended): `Idempotency-Key: <uuid>` — avoids double charge on retry.

Auth: session required (except **guest**: 1 anonymous screenshot only — no URL).

---

## Success

```json
{
  "auditId": "AUD-001",
  "status": "queued"
}
```

| Field | Notes |
|-------|--------|
| `auditId` | Audit id (UUID or product id like `AUD-001`) |
| `status` | `queued` at accept (`QUEUED` in schema / API.md) |

HTTP **202 Accepted**. Optional extras (API.md): `creditsCost`, `estimatedSeconds`.

Credits are **reserved/deducted** on success (tier costs in PRICING.md).

---

## Failure

| Case | Meaning | Typical code |
|------|---------|----------------|
| Invalid URL | Bad/missing URL, unsupported scheme | `400` |
| No Credits | Balance &lt; cost for this audit | `422` |
| Website Blocked | SSRF / private host / denylist | `400` / `403` |
| Timeout | Upstream crawl/AI setup timed out at accept (rare) | `504` / `408` |
| 429 | Rate limited | `429` |
| AI Unavailable | Provider/queue down | `503` |

Also (product rules, not in template but enforced):

| Case | Meaning |
|------|---------|
| Not logged in | Guest URL, or guest screenshot already used → open SSO |
| Tier not allowed | Free/Guest URL audit → upgrade / Manage Plan |
| Email not verified | Block audit until verified |

Example:

```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "No Credits"
  }
}
```

---

## Frontend

Open Progress Screen (**SCREEN-M01**).  
Poll **Check Progress** `GET /audit/{auditId}` every **2 seconds** until `progress` is **100** (or `status` is terminal) → Report (**SCREEN-M02**).  
On failure at GO: show inline/chip error (e.g. Invalid URL on Screen9); do not open Progress.

---

## Analytics

`go_clicked` — `{ mode: "url" | "screenshot", tier }`  
`audit_started` — `{ auditId, mode, creditsCost }` on 202  
`audit_failed` — `{ reason }` on failure at create (Invalid URL, No Credits, …)

---

# Check Progress

---

## API Name

Check Progress

---

## Purpose

Poll AI UX audit progress while the job runs.

---

## Method

GET

---

## Endpoint

`/audit/{auditId}`

(Alias of `/api/v1/audits/{auditId}/status` in API.md.)

---

## Called From

Progress Screen (**SCREEN-M01**), after Start Audit returns `auditId`.

---

## Request

(No body. `auditId` path param from Start Audit success.)

```http
GET /audit/AUD-001
Authorization: Bearer <token>
```

---

## Returns

```json
{
  "progress": 45,
  "status": "running"
}
```

| Field | Type | Notes |
|-------|------|--------|
| `progress` | number | 0–100 (percent complete) |
| `status` | string | `queued` · `running` · `completed` · `failed` |

---

## Called Every

**2 seconds**

---

## Until

**100%** (`progress === 100`) — or sooner if `status` is `failed`.

Then stop polling and open Report (or error UI).

---

## Failure

Not found · Not authenticated · Network Error · Server Error · Audit `failed`

---

## Frontend

Update Progress UI from `progress` / `status`.  
On `progress: 100` or `status: "completed"` → `GET /audit/{auditId}/report` → Report Screen.  
On `status: "failed"` → stop poll; show error (credits refunded if applicable).  
Clear interval on unmount / navigation away.

---

## Analytics

`audit_progress_polled` (optional, sampled) · `audit_completed` · `audit_failed`

---

# Get Audit Report

---

## API Name

Get Audit Report

---

## Purpose

Fetch AI UX audit results after progress reaches 100%.

---

## Method

GET

---

## Endpoint

`/audit/{auditId}/report`

(Alias of `/api/v1/audits/{auditId}/report` in API.md §3.1.)

---

## Called From

Report Screen (**SCREEN-M02**); after Check Progress reaches `progress: 100` / `status: "completed"`.

---

## Request

(No body.)

```http
GET /audit/AUD-001/report
Authorization: Bearer <token>
```

---

## Success

```json
{
  "auditId": "AUD-001",
  "status": "completed",
  "overallScore": 72,
  "summary": "…"
}
```

Full shape (scores, categoryScores, recommendations, PDF flag): API.md §3. Free tier may receive summary-only; PDF gated for paid tiers.

---

## Failure

Not ready (still running) · Not found · Tier gated · Not authenticated · Network · Server

---

## Frontend

Render Report; enable PDF download when allowed (**BTN-011**) via **`GET /report/{auditId}/pdf`**.

---

## Analytics

`report_viewed` `{ auditId }`

---

# Download Report PDF

---

## API Name

Download Report PDF

---

## Purpose

Download the completed audit report as a PDF.

---

## Method

GET

---

## Endpoint

`/report/{auditId}/pdf`

(Alias of `/api/v1/audits/{auditId}/report/pdf` in API.md §3.3.)

---

## Called From

Report Screen PDF control; History row download (**BTN-011**).

---

## Request

(No body.)

```http
GET /report/AUD-001/pdf
Authorization: Bearer <token>
```

---

## Success

```json
{
  "downloadUrl": "https://storage.audient.app/signed/...",
  "expiresIn": 300
}
```

Client opens `downloadUrl` (short-lived signed URL). File is not streamed through this API.

---

## Failure

Not authenticated · Tier gated (Free) · PDF not ready · Not found · Network · Server

---

## Frontend

On success → open/download via `downloadUrl`.  
On Free / gated → open Manage Plan / upgrade.  
Show loading on download button while request in flight.

---

## Analytics

`pdf_downloaded` `{ auditId }` · `pdf_download_failed` · `history_pdf_clicked` (if from History)

---

## Flow

```text
GO Button
  → POST /ai/audit { website }
  → 202 { auditId, status: "queued" }
  → Open Progress Screen
  → every 2s: GET /audit/{auditId} → { progress, status }
  → until progress === 100 (or failed)
  → GET /audit/{auditId}/report
  → Report Screen
  → (optional) GET /report/{auditId}/pdf → downloadUrl
```

---

# Get History

---

## API Name

Get History

---

## Purpose

List the user’s past UX audits for the History screen.

---

## Method

GET

---

## Endpoint

`/history`

(Alias of `/api/v1/audits` list in API.md §2.2.)

---

## Called From

History page (Screen8 / SCREEN-012); Profile → History; empty state (Screen13).

---

## Request

(No body. Query params optional.)

```http
GET /history?limit=20&cursor=<id>&status=completed&sort=-createdAt
Authorization: Bearer <token>
```

| Param | Notes |
|-------|--------|
| `limit` | Page size (default 20) |
| `cursor` | Next page cursor |
| `status` | Optional filter (`completed`, `failed`, …) |
| `sort` | Default `-createdAt` (newest first) |

---

## Success

```json
{
  "items": [
    {
      "auditId": "AUD-001",
      "title": "nike.com",
      "website": "https://nike.com",
      "status": "completed",
      "overallScore": 72,
      "hasPdf": true,
      "createdAt": "2026-07-27T09:10:00Z"
    }
  ],
  "nextCursor": null
}
```

Empty list → History empty state (no error).

---

## Failure

Not authenticated · Invalid params · Network · Server

---

## Frontend

Render history cards (**CARD-002**). Row click → Report (`GET /audit/{auditId}/report`). PDF icon → `GET /report/{auditId}/pdf`. Loading → skeletons; empty → empty illustration + CTA to start audit.

---

## Analytics

`history_viewed` · `history_row_opened` `{ auditId }` · `history_pdf_clicked`

---

## Flow

```text
Open History
  → GET /history
  → { items, nextCursor }
  → History list / empty state
```
