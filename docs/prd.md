# Audient — Product Requirements Document

**Status:** Complete draft — pending final sign-off on open items (see §11.3)
**Last updated:** 2026-07-26
**Owner:** Raghunath Kamlekar

---

## 1. Product Overview & Vision

### 1.1 The Problem
Small business websites often fail to achieve their business goals (leads, sales, sign-ups) because of poor user experience — confusing navigation, weak calls-to-action, cluttered layouts, slow or unclear paths to conversion. Small business owners rarely have the budget for a professional UX designer or the expertise to diagnose *why* their site underperforms. Traditional UX audits are expensive, slow, and require specialist knowledge that most small businesses don't have access to.

### 1.2 What Audient Does
Audient is an AI-powered UX audit platform. A user submits either:
- a **live website URL**, or
- **screenshots** of their website/pages,

and Audient returns a UX audit that identifies problems hurting the site's business goals and recommends concrete fixes.

### 1.3 Vision _(draft — confirm)_
To make expert-level UX guidance accessible and affordable for every small business — turning underperforming websites into ones that convert, without needing to hire a designer.

### 1.4 Why Now / Why AI _(draft — confirm)_
Modern multimodal AI can "see" a webpage or screenshot, reason about layout, hierarchy, copy, and conversion flow, and generate actionable recommendations in minutes instead of the days/weeks a human audit takes — at a fraction of the cost. This makes professional-grade UX auditing viable at small-business price points for the first time.

### 1.5 One-Line Pitch _(draft — confirm)_
"Audient — instant, AI-powered UX audits that turn small business websites into conversion machines."

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
- **Primary:** Reach **$1M in revenue by end of next year**.
- Supporting goals _(draft — confirm)_:
  - Establish a repeatable free-to-paid conversion funnel.
  - Build a base of recurring paying subscribers (not one-off audits).

### 2.2 User Outcome Goals
When a user submits their website, Audient should:
- Analyze the **entire user flow** end to end (not just isolated pages).
- **Understand the flow's intent** and how a real visitor would move through it.
- **Pinpoint the specific UX issues** causing **user confusion** or **business failure** (lost conversions, drop-offs, unclear CTAs).
- Deliver findings that are clear and actionable enough for a non-designer to act on.

### 2.3 Product Tiers (drives key metrics)
- **Free users:** Limited **credits**; **screenshot/image upload only** for audits.
- **Paid users:** **Live website link** audit option enabled (full user-flow analysis), plus higher/expanded credits.

### 2.4 Key Metrics to Track _(draft — confirm)_
- **Acquisition:** New sign-ups per week.
- **Activation:** % of new users who complete their first audit.
- **Conversion:** Free → Paid conversion rate.
- **Revenue:** MRR / ARR, progress toward $1M target.
- **Engagement:** Audits run per user per month; credit consumption rate.
- **Quality:** Report satisfaction rating; % of users who report acting on a recommendation.
- **Retention:** Monthly subscriber churn.

### 2.5 Non-Goals _(draft — confirm)_
- Not a full website builder or page editor (Audient diagnoses and recommends; it does not rebuild the site for the user — at least in v1).
- Not a general SEO or performance-monitoring tool (UX-focused, though it may touch on UX-adjacent performance issues).
- Not targeted at large enterprises in v1 (focus is small businesses).

---

## 3. Target Users & Personas

### 3.1 Primary User — Small Business Owner
- Runs the business and the website; wants more leads/sales but isn't a UX expert.
- May be tech-savvy, but the product must stay usable for **non-technical owners** too.
- Motivation: "My site isn't converting and I don't know why — tell me what to fix."
- Needs: plain-English findings, clear priorities, and fixes they can act on (or hand to someone).

### 3.2 Secondary User — Freelancer / Agency
- Runs audits **on behalf of clients** to justify work, win deals, or speed up delivery.
- More technically fluent; values speed, credibility of findings, and (eventually) shareable/branded reports.
- Motivation: "Give me a fast, professional audit I can put in front of a client."

### 3.3 Target Business Types
- **All small business types**, including:
  - E-commerce stores
  - Local services (restaurants, salons, trades, clinics, etc.)
  - Coaches / creators / solo professionals
  - Small SaaS / landing pages
- No single vertical restriction in v1; messaging may lead with e-commerce and local services.

### 3.4 Tech Comfort & Design Implications
- **Most users are reasonably tech-savvy**, but the product must **degrade gracefully for non-technical users**:
  - Simple, jargon-free language in reports and UI.
  - Clear step-by-step flow (submit → analyze → results).
  - Explanations of *why* an issue matters in business terms, not designer terms.

### 3.5 Discovery / Acquisition Channels _(early signal)_
- **Social media** (organic + paid).
- **SEO / content** (e.g., "why isn't my website converting" style content).
- _(Secondary, later)_: agencies/freelancers reselling or recommending Audient.

---

## 4. User Stories & Use Cases

### 4.1 Core Journey — Free User → Pro Conversion
1. User opens Audient and sees their account state: **limited credits**, with only the **Upload Image/Screenshot** option available (not a Pro user yet).
2. User uploads an **image/screenshot** of their site to run an audit.
3. System runs the audit and returns a **brief summary** of findings.
4. User wants the **full, detailed report** but has **no credits left**.
5. User upgrades to **Pro membership**.
6. As a Pro user, the **website link upload** option is now enabled.
7. User enters their **website URL** in the input field.
8. System runs a full audit across the business's user flow and delivers a **detailed audit report as a downloadable PDF**.

### 4.2 User Stories

**Business Owner (Primary)**
- As a business owner, I want to upload a screenshot and get a quick UX summary so that I can see if Audient understands my problems before paying.
- As a business owner, I want to submit my live website link and get a detailed report so that I know exactly what's hurting my conversions.
- As a business owner, I want the report in plain language with business impact so that I can act on it without hiring a designer.
- As a business owner, I want a downloadable PDF report so that I can keep it, share it, or hand it to a developer.

**Freelancer / Agency (Secondary)**
- As an agency user, I want more credits so that I can run audits for multiple clients.
- As an agency user, I want professional, detailed reports so that I can present credible findings to clients.

### 4.3 Repeat Use
- Users return because Audient delivers **accurate audits grounded in established UX principles**, helping them improve business reach and hit their goals.
- Ongoing reasons to return _(draft — confirm)_:
  - **Re-audit** after making changes to measure improvement.
  - Audit **new pages, campaigns, or landing pages** over time.
  - Agencies running **continuous audits across a client portfolio**.

### 4.4 The "Aha" Moment
Many business owners underrate UX. The aha moment is when Audient delivers a **detailed audit report grounded in UX principles**, paired with:
- **Business growth statistics** (why each issue matters to revenue/conversions), and
- **Competitive analysis** (how their UX stacks up against competitors).

This reframes UX from an abstract concern into a concrete, prioritized growth lever — the point where the user sees it's worth paying for.

---

## 5. Core Features & Functional Requirements

### 5.1 Audit Engine — What Audient Evaluates
Audits are grounded in **established UX principles** and evaluate the following dimensions:
- **Navigation clarity** — is it easy to find things and move through the site?
- **CTA effectiveness** — are calls-to-action clear, visible, and compelling?
- **Visual hierarchy** — does the layout guide attention to what matters?
- **Mobile responsiveness** — does the experience hold up on mobile?
- **Copy / messaging** — is the messaging clear, persuasive, and jargon-free?
- **Trust signals** — testimonials, reviews, security, social proof.
- **Page speed** — does perceived/actual speed hurt the experience?
- **Accessibility** — can all users, including those with impairments, use the site?
- **Conversion flow** — does the end-to-end user flow lead smoothly to the goal?

### 5.2 Input Modes
- **Screenshot / image upload** — available to all tiers (Free included).
- **Live website link** — Pro and Agency only; enables full **user-flow** analysis across the site.

### 5.3 Report Contents
Every detailed report includes:
- **Overall UX score** (see 5.4).
- **Prioritized issues** ranked by severity.
- **Screenshots with annotations** highlighting each issue in context.
- **Recommended fixes** — concrete, plain-language actions.
- **Business impact** — why each issue matters (growth statistics / conversion impact).
- **Competitive analysis** — how the site's UX compares to competitors.

**Report delivery by tier:**
- **Free:** brief on-screen **summary** of findings.
- **Pro / Agency:** full **detailed report, downloadable as PDF**.

### 5.4 Scoring
- Each issue is assigned a **severity level: Critical / Major / Minor**.
- An **overall UX score** is derived from the number and severity of issues _(draft — confirm: 0–100 scale rolled up from severities)_.

### 5.5 Competitive Analysis _(open decision)_
- Needs a decision on how competitors are identified:
  - **Option A:** User names their competitors.
  - **Option B:** Audient auto-detects competitors from business type/industry.
  - _(Recommended: start with Option A for accuracy; add auto-detect later.)_

### 5.6 Credits Model

**As specified (monthly plans only; no yearly plan for now):**

| Tier   | Monthly Credits | Cost per Image/Screenshot | Cost per Link |
|--------|-----------------|---------------------------|---------------|
| Free   | 300             | 150                       | N/A (disabled)|
| Pro    | 1,000           | 100                       | 400           |
| Agency | 10,000          | 50                        | 100           |

- Free tier effectively gets ~2 screenshot audits/month.
- Link audits are Pro/Agency only.

**⚠️ Recommendation — a simpler, more scalable credit model _(for your consideration)_:**
Charging different per-action prices across tiers is hard to explain and can feel arbitrary. Consider a **flat cost per action**, where tiers differ only in the credit *allotment* and in whether links are unlocked:

| Tier   | Monthly Credits | Image Audit | Link Audit | Link Enabled? |
|--------|-----------------|-------------|------------|---------------|
| Free   | 300             | 150         | —          | No            |
| Pro    | 2,000           | 150         | 500        | Yes           |
| Agency | 12,000          | 150         | 500        | Yes           |

- Same action always costs the same → easy to understand.
- Tier value comes from **more credits + unlocked link audits**, not from confusing per-action discounts.
- (Numbers are illustrative — adjust once unit economics/AI costs are known.)

### 5.7 Additional Product Requirements
- **User accounts / authentication.**
- **Audit history** — users can view a list of their past audits.
- **Saved reports** — users can revisit and re-download previous reports (PDF).

---

## 6. UX / Design Requirements

### 6.1 Brand & Vibe
- **Clean & professional** — trustworthy, modern, uncluttered.
- Because Audient *sells* good UX, the product itself must be a showcase of excellent UX.
- A design already exists in Figma; it should align with the direction below (or the direction should be adapted to it).

### 6.2 Suggested Visual Direction _(recommendation — confirm)_
- **Layout:** spacious, card-based dashboard with generous whitespace (à la the Lovable dashboard reference).
- **Color:** neutral base (white / soft gray) with a single confident accent color for actions and scores.
  - Suggested accent: a deep blue or indigo (trust + intelligence) with semantic colors for severity — **red = Critical, amber = Major, gray/blue = Minor**.
- **Typography:** clean sans-serif (e.g., Inter) with clear hierarchy — large scores, readable body copy.
- **Tone:** friendly but expert; plain language, no unnecessary jargon.
- **Reference:** [Lovable dashboard](https://lovable.dev/dashboard) — intuitive, user-friendly, card-driven layout.

### 6.3 Key Screens
- **Audit results page** — the core screen (see 6.4).
- **History** — list of past audits with status, date, score, and re-download.
- **Account / Billing** — plan/tier, remaining credits, upgrade to Pro, billing management.
- Supporting screens _(implied, draft)_: landing/marketing page, sign-up/login, new-audit/upload screen, dashboard/home.

### 6.4 Results Experience
- A **brief, intuitive report** view with the **UX score shown prominently** at the top.
- Issues presented in a **scannable, prioritized** layout with severity indicators.
- **PDF download** option for the full detailed report (Pro/Agency).
- Should feel clear and reassuring even to non-technical users.

### 6.5 Platform
- **Responsive web app** — desktop-first but fully usable on mobile.
- No native mobile apps in v1.

---

## 7. Technical Architecture & Integrations

### 7.1 Frontend
- **Next.js (React)** — server-side rendering for the marketing/landing pages (SEO) and a fast app experience for the dashboard.
- **Tailwind CSS** + a component library (e.g., shadcn/ui) for a clean, consistent, responsive UI.
- Hosted on **Vercel** (native fit for Next.js).

### 7.2 Backend
- **Node.js** (TypeScript) API — can run as Next.js API routes/route handlers for v1 simplicity, or a separate Node service (e.g., Fastify/NestJS) as it grows.
- **Asynchronous job queue** for audits (crawling + AI analysis take time): e.g., a queue/worker system so audits run in the background and the UI shows progress.

### 7.3 AI / Audit Model
- **Multimodal LLM** that can "see" screenshots and reason about UX. _(Recommendation: use a top-tier multimodal model — e.g., the latest GPT or Claude vision-capable model — behind a provider-agnostic abstraction so the model can be swapped as pricing/quality changes.)_
- **Structured prompting**: the model is guided by Audient's UX-principles rubric (the dimensions in §5.1) to return **structured JSON** (issues, severity, fixes, business impact) rather than free text — enabling consistent scoring and report rendering.
- Keep a **model abstraction layer** to control cost, swap providers, and cache results.

### 7.4 Live URL Analysis Pipeline
- **Headless browser** (**Playwright**, recommended) to render the site and capture screenshots (desktop + mobile viewports).
- **Multi-page crawl** to map the user flow across key pages.
- **Performance data** via **Lighthouse / PageSpeed Insights** (page speed, accessibility signals).
- Captured screenshots + performance data + crawled structure are fed to the AI model for analysis.

### 7.5 Payments & Billing
- **Stripe** for subscriptions (Pro, Agency), plan management, and billing.
- Credits are tracked in Audient's own database; Stripe drives plan/tier and monthly renewal.

### 7.6 Auth, Database, Hosting, Storage _(recommendations)_
- **Authentication:** managed auth for speed and security — **Clerk** or **Auth.js (NextAuth)**; **Supabase Auth** is a good option if using Supabase for DB.
- **Database:** **PostgreSQL** (via **Supabase** or **Neon**) — relational data for users, credits, audits, reports.
- **File/Object storage:** **AWS S3** or **Cloudflare R2** for screenshots and generated PDFs.
- **Hosting:** **Vercel** (frontend/app) + managed DB; background workers on a suitable host (e.g., Railway/Render/Fly) if separated from Vercel.

### 7.7 PDF Generation _(recommendation)_
- Render the report as an HTML template, then convert to PDF with **Puppeteer/Playwright** (pixel-perfect, matches the on-screen report), **or**
- Use **React-PDF (@react-pdf/renderer)** for a component-based PDF approach.
- _(Recommended: HTML-template → Playwright PDF, so the PDF and web report share one design source.)_

---

## 8. Non-Functional Requirements

### 8.1 Performance
- **Screenshot/image audit:** complete in **up to 90 seconds**.
- **Full URL audit** (crawl + performance + AI analysis): complete in **up to 8 minutes** max.
- Long-running audits run asynchronously with clear **progress indication** and a notification when ready.

### 8.2 Security & Privacy
- **No AI training on user data** — user-submitted sites, screenshots, and reports are never used to train models.
- **Data deletion on request** — users can request deletion of their audits and associated data.
- **Encryption:** data encrypted in transit (TLS) and at rest _(recommended default)_.
- Access controls so users can only view their own audits/reports.

### 8.3 Compliance _(recommendation)_
- **GDPR** compliance for EU users (data access, deletion/right-to-be-forgotten, consent, clear privacy policy).
- **CCPA** alignment for California users.
- Standard **Terms of Service** and **Privacy Policy**.
- Use payment provider (Stripe) for **PCI-DSS**-compliant payment handling (no raw card data stored by Audient).

### 8.4 Scale _(reasonable growth targets)_
- **Year 1 targets:** support thousands of registered users and hundreds of concurrent/queued audits without degradation.
- Architecture (async job queue, object storage, managed DB) should scale horizontally as audit volume grows.
- Guard against abuse with **rate limiting** and the **credit system** as a natural throttle.

### 8.5 Reliability / Uptime
- Target **99.9% uptime**.
- Graceful failure handling: if an audit fails (e.g., a site can't be reached), the user is informed clearly and **credits are refunded** for failed audits _(recommended)_.

---

## 9. Business Model & Pricing

### 9.1 Pricing Tiers _(recommended price points — confirm)_

| Tier   | Price (Monthly) | Monthly Credits | Link Audits | Report Type            | Target User            |
|--------|-----------------|-----------------|-------------|------------------------|------------------------|
| Free   | $0              | 300             | No          | Brief on-screen summary| Trial / teaser         |
| Pro    | **$29 / mo**    | 1,000           | Yes         | Detailed PDF           | Business owners        |
| Agency | **$99 / mo**    | 10,000          | Yes         | Detailed PDF           | Freelancers / agencies |

- Prices are recommendations based on typical SMB SaaS benchmarks and the credit allotments; revisit once real AI/infra unit costs are known to protect margins.
- Monthly plans only for now (yearly planned later — see 9.5).

### 9.2 Free Tier Purpose
- Free is a **trial/teaser**, not a permanent free product.
- Goal: let users experience Audient's quality on a screenshot audit + brief summary, then convert to Pro for detailed reports and link audits.

### 9.3 Credit Top-Ups
- Users can **buy extra credits mid-month** if they run out (no need to wait for renewal).
- _(Recommended)_ Sell top-ups in simple packs (e.g., +500 / +2,000 / +5,000 credits) via Stripe one-time payments.
- Top-up credits _(draft — confirm)_: roll over or expire at cycle end? Recommendation: **plan credits reset monthly; purchased top-up credits roll over** (fairer to paying users).

### 9.4 Trials & Refunds _(recommendation)_
- The **Free tier acts as the trial** — no separate credit-card-required trial needed for v1.
- Optionally offer a **7-day money-back guarantee** on the first Pro/Agency payment to reduce purchase risk.
- **Failed audits refund credits** automatically (per §8.5).

### 9.5 Future Monetization
- **Yearly plans** (with a discount vs. monthly, e.g., ~2 months free) — planned next.
- Possible later: **white-label / branded reports** for agencies, **API access**, higher-tier plans.

---

## 10. Roadmap & Milestones

### 10.1 MVP (Target: ~1 month)
Core end-to-end value:
- User accounts / auth.
- **Screenshot audit** → **brief summary** (Free tier).
- **Pro link audit** (headless render + crawl + performance) → **detailed report**.
- **PDF report** generation & download.
- **Stripe** billing (Free → Pro upgrade) + credit tracking.
- Basic responsive web UI (upload, results, upgrade).

### 10.2 Private Beta (between MVP and public launch)
- Launch MVP to a **small private beta group** first.
- Goals: validate audit quality/accuracy, gather feedback, fix issues, refine credit/pricing assumptions.

### 10.3 Public Launch (Target: ~3 months)
- Open sign-ups publicly.
- Polished onboarding, marketing/landing site, SEO content, social presence.

### 10.4 Post-MVP / Phase 2+
- **Competitive analysis** in reports.
- **Audit history** and saved reports.
- **Agency features** (higher credits, multi-client, professional/branded reports).
- **Yearly plans** (with discount).
- Credit **top-ups**.

### 10.5 Timeline Summary

| Milestone       | Target        |
|-----------------|---------------|
| MVP complete    | ~Month 1      |
| Private beta    | Month 1–2     |
| Public launch   | ~Month 3      |
| Phase 2 features| Post-launch   |

---

## 11. Risks, Assumptions & Open Questions

### 11.1 Key Risks

**Product / AI quality**
- **AI accuracy & consistency** — audits must be genuinely useful and correct; generic or wrong advice destroys trust. *Mitigation:* structured UX-principles rubric, structured JSON output, private-beta validation, human spot-checks.
- **Hallucinated fixes** — model may recommend changes that don't apply. *Mitigation:* ground recommendations in captured screenshots/performance data; constrain output to observed evidence.

**Cost / margin**
- **AI + crawl costs per audit** could erode margins, especially full URL audits (multi-page + performance + vision). *Mitigation:* model abstraction to switch providers, caching, credit system as a throttle, revisit pricing against real unit economics.

**Business / market**
- **Free-to-paid conversion** may be lower than needed to reach $1M. *Mitigation:* make the free summary compelling but clearly partial; strong upgrade prompts at the "aha" moment.
- **Competition** — other AI/UX audit tools may emerge. *Mitigation:* differentiate on business-impact framing + competitive analysis + ease of use.
- **Acquisition** — reliance on SEO/social; growth may be slow to start. *Mitigation:* content strategy, agency channel, referral incentives.

**Technical / operational**
- **Crawling reliability** — some sites block bots, use heavy JS, or require auth. *Mitigation:* robust headless rendering, clear failure handling, credit refunds on failure.
- **Long audit times (up to 8 min)** — users may abandon. *Mitigation:* async jobs, progress UI, email/notification on completion.

### 11.2 Assumptions
- Small business owners are willing to pay ~$29/mo for actionable UX guidance.
- A brief free summary is enough to demonstrate value and drive upgrades.
- Multimodal LLMs are capable enough to produce credible, useful UX audits.
- Target audit performance (90s screenshot / 8 min URL) is achievable within cost targets.
- Monthly-only pricing is acceptable at launch (yearly added later).

### 11.3 Open Questions / Decisions to Finalize
- **Credit model:** adopt the as-specified per-tier pricing (§5.6) or the recommended flat-cost model? 
- **Competitive analysis:** user-named competitors vs. auto-detection (§5.5).
- **Overall UX score:** confirm the 0–100 scale and how severities roll up (§5.4).
- **Pricing:** confirm $29 / $99 against real AI/infra unit costs (§9.1).
- **$1M goal:** ARR (recurring) vs. total revenue — shapes subscription vs. one-off emphasis (§2.1).
- **Top-up credits:** rollover vs. expiry (§9.3).
- **Reconcile the existing Figma design** with the suggested visual direction (§6.2).

---

## Appendix — Document Status
- Sections 1–11 drafted collaboratively.
- Items marked _(draft — confirm)_, _(recommendation)_, or listed in §11.3 need final sign-off.

