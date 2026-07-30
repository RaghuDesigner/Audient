# Audient — Pricing & Credits (Adopted)

**Status:** Adopted decisions
**Last updated:** 2026-07-29
**Owner:** Raghunath Kamlekar
**Related:** PRD.md (§5.6, §9), SCREEN_MAPPING.md, MISSING_SCREENS_PLAN.md, SCHEMA.md, API.md

Authoritative Free / Pro / Business plan structure. Confirmed product decisions:

1. **Pro pricing & credits follow the original PRD:** **$29 / month · 1,000 credits** (not the Figma $99 card).
2. **Guest teaser:** **1 anonymous screenshot audit** allowed before login.

---

## 1. Business Goals (from PRD)

| Goal | Implication |
|------|-------------|
| **$1M revenue by end of next year** | Need volume at $29 Pro (~**2,900 Pro subs** ARR ≈ $1M) *or* mix with Business + top-ups |
| Free / guest = teaser → paid | 1 guest audit + Free credits → clear upgrade wall (URL + PDF) |
| Primary = SMB owners; secondary = freelancers/agencies | Pro = owners; Business = volume / multi-site |

### Path to ~$1M ARR (illustrative)

| Mix | Math | ARR |
|-----|------|-----|
| Pro-heavy | ~2,900 Pro × $29 × 12 | ~$1.01M |
| Balanced | 2,000 Pro × $29 × 12 + 400 Business × $99 × 12 | ~$1.17M |
| Top-ups (~10% of paid MRR) | | +$80–120k |

At $29, conversion volume matters more than ARPU — Free→Pro funnel and “aha” report quality are critical.

---

## 2. Adopted Plan Structure

| | **Free** | **Pro** | **Business** |
|---|----------|---------|--------------|
| **UI group label** | Individual | Individual 👑 | Enterprise 👑 |
| **Schema / Stripe tier** | `FREE` | `PRO` | `ENTERPRISE` (label = **Business**) |
| **Price** | **$0** | **$29 / month** | **$99 / month** |
| **Monthly credits** | **300** | **1,000** | **10,000** |
| **Screenshot / image audit** | **150 credits** | **100 credits** | **50 credits** |
| **Live URL audit** | ❌ Disabled | **400 credits** | **100 credits** |
| **~Audits / month** | **2 screenshots** | ~10 screenshots **or** ~2–3 URL audits | High volume (agency) |
| **Report** | Brief on-screen summary | Full report + **PDF** | Full report + **PDF** |
| **History / re-download** | Limited | Full | Full |
| **Credit top-ups** | ❌ | ✅ | ✅ |
| **Target user** | Trial / teaser | SMB owners | Freelancers / agencies |

> **Figma note:** Manage Plan cards currently show Pro **$99** and Business **$199**. **Update card copy/prices to $29 / $99** to match this adopted PRD model — layout and structure stay the same (not a redesign).

### Credit cost reference (config)

| Action | Free | Pro | Business |
|--------|------|-----|----------|
| Screenshot / image audit | **150** | **100** | **50** |
| Live URL audit | — | **400** | **100** |
| PDF download | ⛔ gated | ✅ (0 credits) | ✅ (0 credits) |
| Failed audit | Refund full cost | Refund | Refund |

### Top-up packs (Pro / Business only)

| Pack | Credits | Price |
|------|---------|-------|
| Starter | 500 | **$9** |
| Growth | 2,000 | **$29** |
| Agency | 5,000 | **$59** |

- Plan credits **reset** monthly; **purchased top-ups roll over**.
- Free cannot buy top-ups (forces upgrade).

---

## 3. Guest — 1 Anonymous Screenshot Audit (adopted)

| Rule | Spec |
|------|------|
| **Allowed** | Exactly **1** screenshot audit without login |
| **Credits shown** | Display **150** (cost of one screenshot) or “1 free audit” — do **not** invent a large guest balance |
| **URL on Landing** | GO on URL → **SSO Login** (then Free/Pro gate); guests cannot run URL audits |
| **After 1 guest audit** | Further GO / upload → **SSO Login**; optional: migrate guest audit into account on login |
| **Abuse controls** | Server-issued guest session (cookie/device id), **rate limit**, optional captcha after abuse signals; TTL cleanup of guest uploads |
| **Report depth** | Same as Free: **brief summary** only; PDF gated |
| **Claim on login** | Associate `auditId` + files with new/existing `Users` row |

### Guest flow

```text
Landing (guest)
  → Upload screenshot → GO
  → Server: create guest session + POST /audits (screenshot) if guestAuditCount < 1
  → Audit Progress → Brief Report
  → Second attempt → SSO Login Modal
  → After login: history includes claimed guest audit; Free 300 credits apply for next audits
```

---

## 4. Feature Gates

| Capability | Guest | Free | Pro | Business |
|------------|:----:|:----:|:---:|:--------:|
| 1 screenshot audit | ✅ (once) | ✅ | ✅ | ✅ |
| More screenshot audits | ⛔ login | ✅ (credits) | ✅ | ✅ |
| URL / live audit | ⛔ login | ⛔ upgrade | ✅ | ✅ |
| Brief summary | ✅ | ✅ | ✅ | ✅ |
| Full report + PDF | ⛔ | ⛔ | ✅ | ✅ |
| Buy top-ups | ⛔ | ⛔ | ✅ | ✅ |

---

## 5. Config Source of Truth

`src/config/plans.ts` — UI, API credit checks, and Stripe metadata must read from this file.

---

## 6. Stripe Product Mapping

| Stripe Product | Price | Metadata |
|----------------|-------|----------|
| Audient Pro Monthly | $29.00 | `tier=PRO`, `credits=1000` |
| Audient Business Monthly | $99.00 | `tier=ENTERPRISE`, `credits=10000` |
| Credit Pack 500 / 2000 / 5000 | $9 / $29 / $59 | `type=topup`, `credits=N` |

Entitlements apply **only** via verified webhooks.

---

## 7. Decisions Log

| # | Decision | Choice |
|---|----------|--------|
| 1 | Pro price / credits | **PRD: $29 / 1,000** (Figma $99 cards to be updated) |
| 2 | Guest audit | **1 anonymous screenshot audit**, then login required |
| 3 | Business | **PRD Agency: $99 / 10,000** (UI label remains Business) |
| 4 | Free | **PRD: 300 credits · 150 / screenshot** |
