#!/usr/bin/env python3
"""Generate docs/TEST_CASES.md — run from repo root: python3 scripts/gen_test_cases.py"""
from pathlib import Path
from collections import Counter


def row(
    tid,
    pri,
    mod,
    pre,
    steps,
    exp,
    auto="Yes",
    reg="Yes",
    smoke="No",
    edge="No",
    neg="No",
    perf="No",
    browser="Yes",
    mobile="Yes",
    a11y="No",
):
    return dict(
        id=tid,
        pri=pri,
        mod=mod,
        pre=pre,
        steps=steps,
        exp=exp,
        actual="",
        status="Not Run",
        auto=auto,
        reg=reg,
        smoke=smoke,
        edge=edge,
        neg=neg,
        perf=perf,
        browser=browser,
        mobile=mobile,
        a11y=a11y,
    )


cases = []


def A(tid, pri, mod, pre, steps, exp, **kw):
    cases.append(row(tid, pri, mod, pre, steps, exp, **kw))


def main():
    # AUTH 25
    A("TC-AUTH-001", "P0", "Authentication", "Guest on Landing", "Open avatar → Login", "SCREEN-003 SSO opens", smoke="Yes")
    A("TC-AUTH-002", "P0", "Authentication", "SSO open", "Complete Google OAuth", "Session + Home/resume", smoke="Yes")
    A("TC-AUTH-003", "P0", "Authentication", "SSO open", "Complete Apple OAuth", "Session created")
    A("TC-AUTH-004", "P0", "Authentication", "SSO open", "Complete Microsoft OAuth", "Session created")
    A("TC-AUTH-005", "P0", "Authentication", "Brand-new IdP user", "First login", "FREE + 300 credits seeded", smoke="Yes")
    A("TC-AUTH-006", "P1", "Authentication", "Existing user", "Login again", "No credit re-seed to 300")
    A("TC-AUTH-007", "P0", "Authentication", "SSO open", "Cancel IdP consent", "Error/stay; can retry", neg="Yes")
    A("TC-AUTH-008", "P1", "Authentication", "SSO open", "Provider timeout", "Friendly error + retry", neg="Yes", edge="Yes")
    A("TC-AUTH-009", "P0", "Authentication", "Logged in", "Logout", "Guest Landing", smoke="Yes")
    A("TC-AUTH-010", "P0", "Authentication", "Expired JWT", "Open History", "Session expired + re-auth", edge="Yes")
    A("TC-AUTH-011", "P0", "Authentication", "No session", "Open /history via UI", "Blocked; login required", neg="Yes", smoke="Yes")
    A("TC-AUTH-012", "P1", "Authentication", "SSO open", "Esc", "Closes; focus restore", a11y="Yes")
    A("TC-AUTH-013", "P1", "Authentication", "SSO open", "Click overlay", "Dismisses per MDL rules")
    A("TC-AUTH-014", "P1", "Authentication", "SSO open", "Start Google; try Apple", "Others disabled; aria-busy", edge="Yes", a11y="Yes")
    A("TC-AUTH-015", "P0", "Authentication", "Guest audit done", "Login", "Audit claimed (BR-GUEST-006)", smoke="Yes")
    A("TC-AUTH-016", "P1", "Authentication", "emailVerified=false", "Start audit", "EMAIL_NOT_VERIFIED gate", neg="Yes")
    A("TC-AUTH-017", "P2", "Authentication", "Offline", "Click provider", "Offline UX", neg="Yes", edge="Yes")
    A("TC-AUTH-018", "P1", "Authentication", "Auth RL tripped", "Retry OAuth", "429 surfaced", neg="Yes", edge="Yes")
    A("TC-AUTH-019", "P1", "Authentication", "No Bearer", "Call GET /me", "401", neg="Yes", mobile="No")
    A("TC-AUTH-020", "P2", "Authentication", "SSO open", "Inspect UI", "No password fields", smoke="Yes")
    A("TC-AUTH-021", "P1", "Authentication", "URL-gate intent", "Login", "Resume upgrade", edge="Yes")
    A("TC-AUTH-022", "P1", "Authentication", "Guest intent", "Login", "Resume audit/report", edge="Yes")
    A("TC-AUTH-023", "P2", "Authentication", "Apple relay", "First login", "Profile usable", edge="Yes")
    A("TC-AUTH-024", "P1", "Authentication", "Two sessions", "Logout one", "Other invalidated or independent per policy", edge="Yes", mobile="No")
    A("TC-AUTH-025", "P1", "Authentication", "SSO open", "Keyboard only login Google", "Full keyboard path", a11y="Yes")

    # LANDING 30
    A("TC-LAND-001", "P0", "Landing Page", "Cold visit", "Open /", "SCREEN-001 renders H1 + form", smoke="Yes")
    A("TC-LAND-002", "P0", "Landing Page", "Guest", "View header", "Credits display guest value; avatar", smoke="Yes")
    A("TC-LAND-003", "P0", "Landing Page", "Guest", "Click Upload tile", "File picker opens", smoke="Yes")
    A("TC-LAND-004", "P1", "Landing Page", "Guest", "Paste valid URL only", "URL field accepts; GO gated for URL", neg="Yes")
    A("TC-LAND-005", "P0", "Landing Page", "Guest", "URL + GO", "guest_url_gated → SSO/upgrade", smoke="Yes", neg="Yes")
    A("TC-LAND-006", "P1", "Landing Page", "Guest", "Empty GO click", "GO disabled / no audit", neg="Yes")
    A("TC-LAND-007", "P1", "Landing Page", "Guest", "Invalid URL blur", "Validation error chip", neg="Yes")
    A("TC-LAND-008", "P1", "Landing Page", "Guest", "Open avatar", "SCREEN-002; Login enabled others disabled")
    A("TC-LAND-009", "P2", "Landing Page", "Guest menu", "Click History", "No-op + tooltip", neg="Yes")
    A("TC-LAND-010", "P1", "Landing Page", "Guest", "UTM params in URL", "Page loads; UTM retained for analytics", edge="Yes")
    A("TC-LAND-011", "P1", "Landing Page", "Guest", "Refresh mid-upload", "No corrupt state; re-upload possible", edge="Yes")
    A("TC-LAND-012", "P2", "Landing Page", "Guest", "Deep-link with hash", "Stable render", edge="Yes")
    A("TC-LAND-013", "P1", "Landing Page", "Offline", "Try upload", "Offline banner; blocked", neg="Yes", edge="Yes")
    A("TC-LAND-014", "P1", "Landing Page", "Guest", "Rapid GO clicks", "Single create / idempotent", edge="Yes", perf="Yes")
    A("TC-LAND-015", "P2", "Landing Page", "Guest", "Zoom 200%", "Form usable", a11y="Yes")
    A("TC-LAND-016", "P0", "Landing Page", "Guest", "Complete 1 screenshot audit", "Progress→brief report allowed", smoke="Yes")
    A("TC-LAND-017", "P0", "Landing Page", "After guest audit used", "Upload+GO again", "Login required (BR-GUEST-004)", neg="Yes", smoke="Yes")
    A("TC-LAND-018", "P1", "Landing Page", "Guest", "Remove upload chip", "File cleared; can re-add")
    A("TC-LAND-019", "P2", "Landing Page", "Guest", "Logo click", "Stays/reloads Landing")
    A("TC-LAND-020", "P1", "Landing Page", "Guest", "Paste URL with spaces", "Trim/validate per VAL-URL", edge="Yes", neg="Yes")
    A("TC-LAND-021", "P1", "Landing Page", "Guest", "http:// public URL", "Accept or normalize per rules", edge="Yes")
    A("TC-LAND-022", "P0", "Landing Page", "Guest", "javascript:alert(1) URL", "Rejected", neg="Yes")
    A("TC-LAND-023", "P0", "Landing Page", "Guest", "http://127.0.0.1 URL", "SSRF blocked", neg="Yes")
    A("TC-LAND-024", "P2", "Landing Page", "iPhone Safari", "Load Landing", "Layout stacks; targets ≥44px", mobile="Yes", a11y="Yes")
    A("TC-LAND-025", "P1", "Landing Page", "Guest", "Use upload without drag", "Button picker available", a11y="Yes")
    A("TC-LAND-026", "P2", "Landing Page", "Guest", "Hero copy visible", "Matches design; single H1", a11y="Yes")
    A("TC-LAND-027", "P1", "Landing Page", "429 guest create", "Trigger RL", "Rate limit toast", neg="Yes", edge="Yes")
    A("TC-LAND-028", "P2", "Landing Page", "Consent rejected", "Load + interact", "Essential UI works; analytics off", edge="Yes")
    A("TC-LAND-029", "P1", "Landing Page", "Guest", "Long URL > max", "Too long error", neg="Yes", edge="Yes")
    A("TC-LAND-030", "P2", "Landing Page", "Chrome/Firefox/Safari", "Smoke Landing", "Parity render", browser="Yes", smoke="Yes", mobile="No")

    # Continue in part 2 via exec of remaining - keep file manageable by calling build_rest
    build_rest()

    ids = [c["id"] for c in cases]
    assert len(ids) == len(set(ids)), [x for x in ids if ids.count(x) > 1]
    write_md(cases)
    print("TOTAL", len(cases))


def build_rest():
    # DASHBOARD 20
    A("TC-HOME-001", "P0", "Dashboard", "Free user", "Login → Home", "SCREEN-004; real credits", smoke="Yes")
    A("TC-HOME-002", "P0", "Dashboard", "Pro user", "Login → Home", "SCREEN-009; purple GO; crown", smoke="Yes")
    A("TC-HOME-003", "P0", "Dashboard", "Free", "Open profile menu", "All items enabled")
    A("TC-HOME-004", "P1", "Dashboard", "Free", "Header skeleton while loading", "Skeleton then hydrate")
    A("TC-HOME-005", "P0", "Dashboard", "Free", "Navigate Manage Plan", "SCREEN-005", smoke="Yes")
    A("TC-HOME-006", "P0", "Dashboard", "Free", "Navigate History", "SCREEN-012/013", smoke="Yes")
    A("TC-HOME-007", "P0", "Dashboard", "Free", "Navigate Settings", "SCREEN-010", smoke="Yes")
    A("TC-HOME-008", "P1", "Dashboard", "Free", "Credits badge click", "Opens plan/credits UX per design")
    A("TC-HOME-009", "P1", "Dashboard", "Pro", "Crown click", "Manage Plan", smoke="Yes")
    A("TC-HOME-010", "P1", "Dashboard", "PAST_DUE Pro", "Open Home", "Premium limited + billing prompt", edge="Yes", neg="Yes")
    A("TC-HOME-011", "P2", "Dashboard", "Business user", "Open Home", "ENTERPRISE entitlements; crown")
    A("TC-HOME-012", "P1", "Dashboard", "Free", "Tamper credits in DOM", "Server balance unchanged", neg="Yes")
    A("TC-HOME-013", "P2", "Dashboard", "Slow GET /me", "Load Home", "Timeout/retry UX", perf="Yes", edge="Yes")
    A("TC-HOME-014", "P1", "Dashboard", "Authenticated", "Refresh Home", "Session persists")
    A("TC-HOME-015", "P2", "Dashboard", "Mobile", "Home layout", "Stacked AuditForm", mobile="Yes")
    A("TC-HOME-016", "P1", "Dashboard", "Free", "URL attempt", "Upgrade gate", neg="Yes", smoke="Yes")
    A("TC-HOME-017", "P0", "Dashboard", "Pro", "Valid URL + GO", "Audit starts", smoke="Yes")
    A("TC-HOME-018", "P2", "Dashboard", "Prefers-reduced-motion", "Home", "No essential motion loss", a11y="Yes")
    A("TC-HOME-019", "P1", "Dashboard", "Offline", "Home actions", "Banner; blocked", neg="Yes")
    A("TC-HOME-020", "P2", "Dashboard", "Multiple tabs", "Change plan in A; refresh B", "Credits/tier sync", edge="Yes", mobile="No")

    # URL 35
    for tid, pri, pre, steps, exp, kw in [
        ("TC-URL-001", "P0", "Pro ACTIVE", "Valid https URL + GO", "202; M01 progress", dict(smoke="Yes")),
        ("TC-URL-002", "P0", "Business ACTIVE", "Valid URL + GO", "202; credits deducted", dict(smoke="Yes")),
        ("TC-URL-003", "P0", "Free", "URL + GO", "Upgrade gate; no charge", dict(neg="Yes", smoke="Yes")),
        ("TC-URL-004", "P0", "Guest", "URL + GO", "Login/upgrade gate", dict(neg="Yes", smoke="Yes")),
        ("TC-URL-005", "P0", "Pro", "Poll until COMPLETED", "M02 report", dict(smoke="Yes", perf="Yes")),
        ("TC-URL-006", "P0", "Pro", "Force FAILED taxonomy", "M03; refund if policy", dict(neg="Yes")),
        ("TC-URL-007", "P1", "Pro", "Cancel on M01 if supported", "Cancelled; credit policy per BR", dict(edge="Yes")),
        ("TC-URL-008", "P1", "Pro", "Retry after fail", "New audit or retry path", {}),
        ("TC-URL-009", "P0", "Pro", "URL localhost", "SSRF_BLOCKED", dict(neg="Yes")),
        ("TC-URL-010", "P0", "Pro", "URL link-local metadata IP", "SSRF_BLOCKED", dict(neg="Yes")),
        ("TC-URL-011", "P1", "Pro", "Unreachable host", "URL_UNREACHABLE + refund", dict(neg="Yes", edge="Yes")),
        ("TC-URL-012", "P1", "Pro", "Bot-blocked site", "SITE_BLOCKS_BOT messaging", dict(neg="Yes", edge="Yes")),
        ("TC-URL-013", "P1", "Pro", "Login-walled URL", "AUTH_REQUIRED", dict(neg="Yes")),
        ("TC-URL-014", "P1", "Pro", "Huge page", "PAGE_TOO_HEAVY or timeout", dict(neg="Yes", edge="Yes", perf="Yes")),
        ("TC-URL-015", "P1", "Pro", "Crawl timeout", "CRAWL_TIMEOUT + refund", dict(neg="Yes", perf="Yes")),
        ("TC-URL-016", "P0", "Pro low credits", "URL costing > balance", "INSUFFICIENT_CREDITS", dict(neg="Yes", smoke="Yes")),
        ("TC-URL-017", "P1", "Pro", "Double submit GO", "Idempotent single audit", dict(edge="Yes")),
        ("TC-URL-018", "P1", "Pro", "Invalid scheme ftp://", "Validation fail", dict(neg="Yes")),
        ("TC-URL-019", "P2", "Pro", "Internationalized domain", "Handled or clear error", dict(edge="Yes")),
        ("TC-URL-020", "P1", "Pro", "AI unavailable", "AI_UNAVAILABLE + refund", dict(neg="Yes", edge="Yes")),
        ("TC-URL-021", "P0", "Pro", "Credits before/after", "Balance -= URL cost (400)", dict(smoke="Yes")),
        ("TC-URL-022", "P1", "Pro", "Progress poll ~2s", "UI updates; no SR spam", dict(perf="Yes", a11y="Yes")),
        ("TC-URL-023", "P2", "Pro", "Leave M01 and return", "Resume progress", dict(edge="Yes")),
        ("TC-URL-024", "P1", "Pro", "Network blip mid-poll", "Recovers or retry", dict(edge="Yes", neg="Yes")),
        ("TC-URL-025", "P2", "Pro", "Compare timing to SLA", "Within BR-URL-005", dict(perf="Yes")),
        ("TC-URL-026", "P1", "Pro", "www without scheme", "Invalid or normalized per VAL", dict(edge="Yes", neg="Yes")),
        ("TC-URL-027", "P0", "Pro", "Completed→report depth", "Full paid report (BR-AI-003)", dict(smoke="Yes")),
        ("TC-URL-028", "P1", "Pro", "RATE_LIMITED create", "429 UX", dict(neg="Yes")),
        ("TC-URL-029", "P2", "Pro", "Concurrent 2 URL audits", "Both queued or RL per policy", dict(edge="Yes", perf="Yes")),
        ("TC-URL-030", "P1", "Pro", "INTERNAL_ERROR", "Friendly + support id", dict(neg="Yes")),
        ("TC-URL-031", "P2", "Mobile Pro", "URL audit E2E", "Works on mobile browser", dict(mobile="Yes", smoke="Yes")),
        ("TC-URL-032", "P1", "Pro", "CREDIT_DEDUCT_FAILED", "No silent charge", dict(neg="Yes", edge="Yes")),
        ("TC-URL-033", "P2", "Pro", "Redirecting URL http→https", "Audit follows public site policy", dict(edge="Yes")),
        ("TC-URL-034", "P1", "Pro", "Whitespace URL", "Trimmed validation", dict(edge="Yes")),
        ("TC-URL-035", "P0", "Free after upgrade Pro", "First URL audit", "Succeeds with new entitlements", dict(smoke="Yes")),
    ]:
        A(tid, pri, "Website Audit", pre, steps, exp, **kw)

    # SHOT 30
    for tid, pri, pre, steps, exp, kw in [
        ("TC-SHOT-001", "P0", "Guest unused quota", "PNG upload + GO", "202; M01", dict(smoke="Yes")),
        ("TC-SHOT-002", "P0", "Free", "JPEG upload + GO", "202; deduct 150", dict(smoke="Yes")),
        ("TC-SHOT-003", "P0", "Pro", "WebP upload + GO", "202; deduct 100", dict(smoke="Yes")),
        ("TC-SHOT-004", "P0", "Guest quota used", "Second screenshot", "Login required", dict(neg="Yes", smoke="Yes")),
        ("TC-SHOT-005", "P1", "Free", "Upload GIF", "Rejected type", dict(neg="Yes")),
        ("TC-SHOT-006", "P1", "Free", "Upload PDF as image", "Rejected", dict(neg="Yes")),
        ("TC-SHOT-007", "P1", "Free", "File > size limit", "Size error", dict(neg="Yes")),
        ("TC-SHOT-008", "P1", "Free", "Corrupt image bytes", "SCREENSHOT_INVALID", dict(neg="Yes", edge="Yes")),
        ("TC-SHOT-009", "P1", "Free", "Upload 6 images if max 5", "Max count error", dict(neg="Yes", edge="Yes")),
        ("TC-SHOT-010", "P0", "Free", "Upload success chip", "Green chip + remove", dict(smoke="Yes")),
        ("TC-SHOT-011", "P1", "Free", "Upload fail chip", "Red chip + retry", dict(neg="Yes")),
        ("TC-SHOT-012", "P1", "Free", "Remove chip then GO", "Cannot start without input", dict(neg="Yes")),
        ("TC-SHOT-013", "P0", "Free", "Complete audit", "Brief Free report", dict(smoke="Yes")),
        ("TC-SHOT-014", "P0", "Pro", "Complete audit", "Full report", dict(smoke="Yes")),
        ("TC-SHOT-015", "P1", "Free", "Insufficient credits", "422 + upgrade/topup CTA", dict(neg="Yes")),
        ("TC-SHOT-016", "P1", "Free", "Sign URL expiry mid-PUT", "Fail + retry", dict(edge="Yes", neg="Yes")),
        ("TC-SHOT-017", "P2", "Free", "Large valid image under cap", "Accepts within timeout", dict(perf="Yes", edge="Yes")),
        ("TC-SHOT-018", "P1", "Free", "Keyboard upload", "Picker via Enter", dict(a11y="Yes")),
        ("TC-SHOT-019", "P1", "Offline", "Upload", "Blocked", dict(neg="Yes")),
        ("TC-SHOT-020", "P2", "iOS", "Photo library upload", "Works", dict(mobile="Yes")),
        ("TC-SHOT-021", "P1", "Free", "Multiple images within limit", "All attached; cost rules apply", dict(edge="Yes")),
        ("TC-SHOT-022", "P0", "Business", "Screenshot audit", "Lower credit cost 50", dict(smoke="Yes")),
        ("TC-SHOT-023", "P1", "Free", "HEIC if unsupported", "Clear reject", dict(neg="Yes", edge="Yes", mobile="Yes")),
        ("TC-SHOT-024", "P2", "Free", "Filename unicode", "Handled safely", dict(edge="Yes")),
        ("TC-SHOT-025", "P1", "Free", "Idempotent create", "No double deduct", dict(edge="Yes")),
        ("TC-SHOT-026", "P1", "Worker fail after deduct", "Force fail", "Auto-refund (BR-ERR-001)", dict(neg="Yes")),
        ("TC-SHOT-027", "P2", "Free", "SLA timing", "Within BR-SHOT-003", dict(perf="Yes")),
        ("TC-SHOT-028", "P1", "Guest", "Abuse second device", "RL/captcha per BR-GUEST-007", dict(neg="Yes", edge="Yes")),
        ("TC-SHOT-029", "P2", "Android Chrome", "Upload+GO E2E", "Success", dict(mobile="Yes")),
        ("TC-SHOT-030", "P1", "Free", "Progress cancel", "Policy honored", dict(edge="Yes")),
    ]:
        A(tid, pri, "Screenshot Audit", pre, steps, exp, **kw)

    build_more()


def build_more():
    # REPORT 25
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Completed Pro audit", "Open M02", "Report scores + recommendations", dict(smoke="Yes")),
            ("P0", "Completed Free audit", "Open M02", "Brief Free depth (BR-AI-003)", dict(smoke="Yes")),
            ("P1", "Report open", "Expand recommendation", "Disclosure works", dict(a11y="Yes")),
            ("P1", "Report open", "Submit feedback up/down", "Persisted via API", {}),
            ("P0", "Other user audit id", "Open report URL", "404/403", dict(neg="Yes")),
            ("P1", "Failed audit", "Open report", "Not available; M03", dict(neg="Yes")),
            ("P1", "In-progress", "Open report early", "Not ready UX", dict(edge="Yes")),
            ("P2", "Pro", "Severity badges", "Text+color", dict(a11y="Yes")),
            ("P2", "Pro", "Score gauges", "Numeric text available", dict(a11y="Yes")),
            ("P1", "Pro", "Annotated screenshot", "Alt/text description", dict(a11y="Yes")),
            ("P1", "History", "Open row", "Navigates to report", dict(smoke="Yes")),
            ("P2", "Pro", "Copy recommendation if UI", "Copies text", dict(edge="Yes")),
            ("P1", "Pro", "Refresh report", "Stable content", {}),
            ("P2", "Slow report API", "Open", "Loading then content", dict(perf="Yes")),
            ("P1", "Mobile", "Report reflow", "Readable", dict(mobile="Yes", a11y="Yes")),
            ("P0", "Guest brief report", "View after guest audit", "Readable teaser", dict(smoke="Yes")),
            ("P2", "Pro", "Categories present", "Match BR-AI-002 dimensions", {}),
            ("P1", "Simulated bad AI output", "Open/fail path", "User-safe failure/refund", dict(neg="Yes", edge="Yes")),
            ("P2", "Pro", "Zoom 200%", "No clipped critical content", dict(a11y="Yes")),
            ("P1", "Session expire on report", "Stay", "Re-auth preserves", dict(edge="Yes")),
            ("P2", "Pro", "Keyboard expand", "Operable", dict(a11y="Yes")),
            ("P1", "Free", "PDF gated messaging", "Explains upgrade", dict(neg="Yes")),
            ("P2", "Pro", "Empty recommendations edge", "Graceful empty", dict(edge="Yes")),
            ("P1", "Pro", "Deep link report id", "Opens if owned", {}),
            ("P0", "Pro URL audit complete", "Report full", "Activation KPI path", dict(smoke="Yes")),
        ],
        1,
    ):
        A(f"TC-RPT-{i:03d}", pri, "Audit Report", pre, steps, exp, **kw)

    # PDF 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Pro completed", "Download PDF", "Signed URL; file downloads", dict(smoke="Yes")),
            ("P0", "Business completed", "Download PDF", "Success; 0 credits (BR-PDF-002)", dict(smoke="Yes")),
            ("P0", "Free completed", "Download PDF", "Blocked/gated", dict(neg="Yes", smoke="Yes")),
            ("P1", "Pro", "PDF from History icon", "Downloads", dict(smoke="Yes")),
            ("P1", "Pro", "Expired signed URL", "Fail + regenerate", dict(edge="Yes", neg="Yes")),
            ("P1", "Pro", "PDF worker fail", "Error; report intact; no audit refund", dict(neg="Yes")),
            ("P0", "Pro", "Open PDF", "Tagged/accessible PDF", dict(a11y="Yes", smoke="Yes")),
            ("P1", "Other user", "GET pdf", "403/404", dict(neg="Yes")),
            ("P2", "Pro", "Double click download", "Single or safe multi", dict(edge="Yes")),
            ("P1", "Pro", "Network fail mid-download", "Error toast", dict(neg="Yes")),
            ("P2", "Pro", "Large PDF gen time", "Loading state; completes", dict(perf="Yes")),
            ("P1", "Guest", "PDF", "Not available", dict(neg="Yes")),
            ("P2", "Mobile", "Download", "Works or share sheet", dict(mobile="Yes")),
            ("P1", "Pro", "Button aria-busy while gen", "Announced", dict(a11y="Yes")),
            ("P2", "Pro", "Filename sensible", "Contains audit identity", dict(edge="Yes")),
            ("P1", "PAST_DUE", "PDF entitlement", "Per BR-SUB-006 policy", dict(edge="Yes", neg="Yes")),
            ("P2", "Chrome/Firefox", "Open PDF", "Renders", dict(browser="Yes")),
            ("P1", "Pro", "Concurrent PDF requests", "RL or succeed", dict(edge="Yes", perf="Yes")),
            ("P2", "Pro", "PDF text extractable", "Not image-only", dict(a11y="Yes")),
            ("P1", "Pro", "Retry after PDF_FAILED", "Succeeds", dict(neg="Yes")),
        ],
        1,
    ):
        A(f"TC-PDF-{i:03d}", pri, "PDF Export", pre, steps, exp, **kw)

    build_billing_and_rest()


def build_billing_and_rest():
    # CREDITS 25
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Free new user", "GET credits", "300 balance", dict(smoke="Yes")),
            ("P0", "Pro new", "GET credits", "1000 after activate", dict(smoke="Yes")),
            ("P0", "Business", "GET credits", "10000", dict(smoke="Yes")),
            ("P0", "Free", "Run screenshot", "-150", dict(smoke="Yes")),
            ("P0", "Pro", "Run URL", "-400", dict(smoke="Yes")),
            ("P0", "Pro", "Run screenshot", "-100", dict(smoke="Yes")),
            ("P0", "Business", "Run URL", "-100", dict(smoke="Yes")),
            ("P0", "Any", "Failed audit refundable", "Credits restored", dict(smoke="Yes", neg="Yes")),
            ("P0", "Balance 0", "Start audit", "INSUFFICIENT_CREDITS", dict(neg="Yes", smoke="Yes")),
            ("P1", "Free", "Attempt top-up", "Blocked (BR-CRED-006)", dict(neg="Yes")),
            ("P0", "Pro", "Purchase top-up pack", "Balance increases", dict(smoke="Yes")),
            ("P1", "Pro", "Monthly reset", "Plan grant resets; top-up rollover per BR-CRED-005", dict(edge="Yes")),
            ("P1", "Client shows 9999", "Server deduct", "Server truth wins", dict(neg="Yes")),
            ("P1", "Refund fail", "Force compensation fail", "Alert; support path", dict(neg="Yes", edge="Yes")),
            ("P2", "Header live update", "After audit", "Credits refresh", dict(a11y="Yes")),
            ("P1", "Race two audits", "Near-zero balance", "One succeeds max; no negative", dict(edge="Yes", neg="Yes")),
            ("P2", "Guest display", "Landing", "Teaser not fake 300", dict(edge="Yes")),
            ("P1", "Pro", "Buy credits CTA", "Checkout/topup flow", {}),
            ("P2", "Ledger", "Inspect transactions", "DEDUCT/REFUND/GRANT rows", dict(mobile="No")),
            ("P1", "Idempotent deduct", "Retry same Idempotency-Key", "Single deduct", dict(edge="Yes")),
            ("P2", "nextResetAt shown", "Settings/billing", "Accurate", {}),
            ("P1", "Business costs", "Verify matrix", "50 shot / 100 URL", dict(smoke="Yes")),
            ("P2", "Mobile", "Credits readable", "Named for SR", dict(mobile="Yes", a11y="Yes")),
            ("P1", "Top-up webhook dup", "Replay event", "Idempotent grant", dict(edge="Yes", neg="Yes")),
            ("P0", "After refund", "Header", "Updated balance", dict(smoke="Yes")),
        ],
        1,
    ):
        A(f"TC-CRED-{i:03d}", pri, "Credits", pre, steps, exp, **kw)

    # SUB 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Free", "Open Manage Plan", "Free/Pro/Business $0/$29/$99", dict(smoke="Yes")),
            ("P0", "Free", "Subscribe Pro", "Payment flow starts", dict(smoke="Yes")),
            ("P0", "Free", "Subscribe Business", "Payment for ENTERPRISE", dict(smoke="Yes")),
            ("P0", "Pro active", "View Manage Plan", "Active Account on Pro", dict(smoke="Yes")),
            ("P1", "Pro", "Click Active Account", "No new charge", dict(neg="Yes")),
            ("P0", "Webhook success", "Confirm", "Membership ACTIVE + credits", dict(smoke="Yes")),
            ("P0", "Before webhook", "UI success only", "No premature entitlements", dict(edge="Yes", neg="Yes")),
            ("P1", "Pro→Business", "Upgrade path", "Entitlements update", dict(smoke="Yes")),
            ("P1", "Cancel via portal", "Cancel", "Cancelled; access per policy", dict(edge="Yes")),
            ("P1", "Renewal invoice.paid", "Simulate", "Renewed; credits grant", dict(edge="Yes")),
            ("P0", "Renewal fail", "Simulate", "PAST_DUE limits premium", dict(neg="Yes", edge="Yes")),
            ("P1", "Monthly only", "Inspect catalog", "No annual in v1", {}),
            ("P2", "Recommended badge", "Business card", "Visible + SR text", dict(a11y="Yes")),
            ("P1", "Already on Pro", "Checkout Pro again", "409/already", dict(neg="Yes")),
            ("P2", "Portal open", "Billing portal", "External portal loads", {}),
            ("P1", "Webhook delay", "After pay", "Activating… then Home", dict(edge="Yes", perf="Yes")),
            ("P0", "Success modal", "Continue", "Pro Home SCREEN-009", dict(smoke="Yes")),
            ("P2", "UI prices", "Verify", "$29/$99 not old Figma $99/$199", dict(edge="Yes")),
            ("P1", "Free card", "No Subscribe on Free", "Correct CTAs only", {}),
            ("P2", "Mobile Manage Plan", "Subscribe", "Sheet usable", dict(mobile="Yes")),
        ],
        1,
    ):
        A(f"TC-SUB-{i:03d}", pri, "Subscriptions", pre, steps, exp, **kw)

    # BILLING 25
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Checkout started", "Complete Elements payment", "payment_succeeded server", dict(smoke="Yes")),
            ("P0", "Payment", "Decline card", "SCREEN-007; no entitlements", dict(neg="Yes", smoke="Yes")),
            ("P0", "Failed modal", "Try again", "Returns to payment", dict(smoke="Yes")),
            ("P1", "3DS required", "Complete OTP/3DS", "Succeeds", dict(edge="Yes")),
            ("P1", "3DS", "Fail/abandon 3DS", "Failed; no grant", dict(neg="Yes", edge="Yes")),
            ("P0", "PCI", "Inspect network", "No raw PAN to Audient API", dict(smoke="Yes", neg="Yes")),
            ("P1", "Invalid card UI", "Submit bad number", "Field errors", dict(neg="Yes")),
            ("P1", "Save card checkbox", "Check + succeed", "Method saved if supported", {}),
            ("P1", "Settings Payment", "Update method", "payment_method_updated", {}),
            ("P1", "Webhook", "Replay same event", "Idempotent", dict(edge="Yes")),
            ("P1", "Unsigned webhook", "POST forge", "Rejected", dict(neg="Yes")),
            ("P2", "Invoice", "Download if available", "File or portal", dict(edge="Yes")),
            ("P1", "Refund ops", "Support refund", "Ledger + Stripe aligned", dict(edge="Yes", mobile="No")),
            ("P2", "Currency", "Pay", "USD cents correct", {}),
            ("P1", "Double submit pay", "Click Update twice", "Single intent", dict(edge="Yes")),
            ("P2", "Offline mid-pay", "Submit", "Error; safe", dict(neg="Yes")),
            ("P1", "Timeout", "Slow Stripe", "Timeout UX", dict(perf="Yes", neg="Yes")),
            ("P2", "Mobile payment sheet", "Sticky CTA", "Focus not obscured", dict(mobile="Yes", a11y="Yes")),
            ("P1", "Dismiss failed", "Close MDL-004", "Back to Manage Plan", {}),
            ("P0", "Top-up Pro", "Complete top-up", "credits_purchased", dict(smoke="Yes")),
            ("P2", "Autocomplete attrs", "Inspect fields", "cc-* present", dict(a11y="Yes")),
            ("P1", "Expired card", "Pay", "Decline messaging", dict(neg="Yes")),
            ("P2", "Browser matrix", "Checkout", "Chrome/Firefox/Safari", dict(browser="Yes")),
            ("P1", "Plan dropdown", "Change Pro→Business", "Price updates; no charge yet", {}),
            ("P0", "Success", "Webhook+poll ACTIVE", "Crown + URL enabled", dict(smoke="Yes")),
        ],
        1,
    ):
        A(f"TC-BILL-{i:03d}", pri, "Billing", pre, steps, exp, **kw)

    build_final()


def build_final():
    # NOTIF 15
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P1", "M04 built", "Open notifications", "List loads", {}),
            ("P0", "Audit completes", "Receive notif", "AUDIT_COMPLETE type", dict(smoke="Yes")),
            ("P1", "Open notif", "Click item", "Opens report", {}),
            ("P1", "Mark read", "PATCH read", "Unread clears", {}),
            ("P0", "Other user", "GET their notifs", "403/empty", dict(neg="Yes")),
            ("P2", "Empty", "Open panel", "Empty state", {}),
            ("P1", "Guest", "Notifications", "Unavailable", dict(neg="Yes")),
            ("P2", "Types", "Only allowed BR-NOTIF-001", "No junk types", {}),
            ("P2", "Keyboard", "Open/read", "Operable", dict(a11y="Yes")),
            ("P1", "Payment failed notif", "If sent", "Opens billing", {}),
            ("P2", "Mobile", "Bell + list", "Usable", dict(mobile="Yes")),
            ("P1", "Realtime delay", "Complete audit", "Notif within SLA", dict(perf="Yes", edge="Yes")),
            ("P2", "Many unread", "Badge count", "Accurate", dict(edge="Yes")),
            ("P1", "Session expired", "Open notifs", "Re-auth", dict(edge="Yes")),
            ("P2", "Mark all if exists", "Action", "All read", dict(edge="Yes")),
        ],
        1,
    ):
        A(f"TC-NOTIF-{i:03d}", pri, "Notifications", pre, steps, exp, **kw)

    # SETTINGS 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Auth", "Open Personal", "SCREEN-010 fields", dict(smoke="Yes")),
            ("P0", "Auth", "Update first/last name", "Saved toast", dict(smoke="Yes")),
            ("P0", "Auth", "Try edit email", "Read-only (BR-AUTH-005)", dict(neg="Yes", smoke="Yes")),
            ("P1", "Auth", "Invalid name", "Inline errors", dict(neg="Yes")),
            ("P1", "Auth", "Change avatar valid", "Updates", {}),
            ("P1", "Auth", "Avatar too large", "Error", dict(neg="Yes")),
            ("P0", "Auth", "Switch Payment tab", "SCREEN-011", dict(smoke="Yes")),
            ("P1", "Pro", "Update payment method", "Success", {}),
            ("P1", "Tabs", "Arrow keys", "tablist pattern", dict(a11y="Yes")),
            ("P0", "Auth", "Delete account start", "Confirm M15", dict(smoke="Yes")),
            ("P0", "Active sub", "Delete without cancel", "409 cancel-sub-first", dict(neg="Yes", edge="Yes")),
            ("P0", "Eligible", "Confirm delete", "GDPR erasure; logout", dict(smoke="Yes")),
            ("P2", "Theme/language if absent", "N/A", "Skip — OOS until UI", dict(edge="Yes")),
            ("P1", "Offline", "Save profile", "Error", dict(neg="Yes")),
            ("P2", "Mobile", "Settings forms", "Usable", dict(mobile="Yes")),
            ("P1", "Duplicate email fields R6", "Inspect", "One logical email read-only", dict(edge="Yes")),
            ("P2", "autocomplete", "Names", "given-name/family-name", dict(a11y="Yes")),
            ("P1", "Rapid save", "Double click", "Single PATCH", dict(edge="Yes")),
            ("P2", "Skeleton load", "Slow /me", "Loading state", dict(perf="Yes")),
            ("P1", "Session expire", "Save", "Re-auth", dict(edge="Yes")),
        ],
        1,
    ):
        A(f"TC-SET-{i:03d}", pri, "Settings", pre, steps, exp, **kw)

    # HISTORY 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "User with audits", "Open History", "Grouped list", dict(smoke="Yes")),
            ("P0", "No audits", "Open History", "SCREEN-013 empty", dict(smoke="Yes")),
            ("P0", "List", "Click row", "Opens report", dict(smoke="Yes")),
            ("P0", "Pro", "PDF icon", "Downloads", dict(smoke="Yes")),
            ("P0", "Guest", "Open History", "Blocked", dict(neg="Yes", smoke="Yes")),
            ("P0", "User A", "Access User B id", "Denied", dict(neg="Yes")),
            ("P1", "Many audits", "Scroll/load more", "Pagination works", dict(perf="Yes")),
            ("P1", "Free", "Depth limit", "Older hidden per BR-HIST-003", dict(edge="Yes")),
            ("P1", "Empty CTA", "Click run first audit", "Goes Home", {}),
            ("P2", "Skeleton", "Loading", "Skeletons + status", dict(a11y="Yes")),
            ("P1", "Failed audit row", "Open", "Failure or limited view", dict(edge="Yes")),
            ("P2", "Mobile", "List", "Tap targets OK", dict(mobile="Yes")),
            ("P1", "Search/filter", "N/A OOS", "Not present", dict(edge="Yes")),
            ("P2", "Offline", "Open", "Error/banner", dict(neg="Yes")),
            ("P1", "Claimed guest audit", "After login", "Appears in list", dict(smoke="Yes")),
            ("P2", "Row names SR", "Inspect", "Title+date in name", dict(a11y="Yes")),
            ("P1", "Concurrent complete", "Refresh", "New row appears", dict(edge="Yes")),
            ("P2", "Chrome/Safari", "Open History", "Parity", dict(browser="Yes")),
            ("P1", "PDF fail from history", "Click download", "Error toast", dict(neg="Yes")),
            ("P2", "Empty contrast", "013 text", "≥4.5:1", dict(a11y="Yes")),
        ],
        1,
    ):
        A(f"TC-HIST-{i:03d}", pri, "History", pre, steps, exp, **kw)

    # ENT 12
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Business plan", "URL+screenshot costs", "Per Business matrix", dict(smoke="Yes")),
            ("P0", "Business", "10k credits grant", "Correct", dict(smoke="Yes")),
            ("P1", "Business", "PDF download", "Allowed", {}),
            ("P2", "Teams invite", "N/A", "OOS BR-ENT-003 — skip", dict(edge="Yes", neg="Yes")),
            ("P2", "Role change", "N/A", "OOS", dict(edge="Yes")),
            ("P2", "Team created", "N/A", "OOS", dict(edge="Yes")),
            ("P2", "White-label API", "N/A", "OOS BR-ENT-004", dict(edge="Yes")),
            ("P1", "Business Recommended", "Manage Plan", "Badge visible", {}),
            ("P1", "Subscribe Business", "Webhook", "tier ENTERPRISE ACTIVE", dict(smoke="Yes")),
            ("P2", "Unlimited copy in Figma", "Product", "Metered 10k not unlimited", dict(edge="Yes", neg="Yes")),
            ("P1", "Business PAST_DUE", "Premium features", "Limited", dict(neg="Yes", edge="Yes")),
            ("P2", "Feature parity v1", "Compare to Pro", "BR-ENT-002 parity", dict(edge="Yes")),
        ],
        1,
    ):
        A(f"TC-ENT-{i:03d}", pri, "Enterprise Features", pre, steps, exp, **kw)

    # A11Y 24
    a11y_cases = [
        ("Landing keyboard order", "Tab through header+form", "Order per ACCESSIBILITY §23", True),
        ("Upload keyboard", "Enter on upload", "Picker opens", False),
        ("URL error a11y", "Invalid URL", "aria-invalid + describedby", False),
        ("Guest menu a11y", "Esc menu", "Focus restore", False),
        ("SSO focus trap", "Tab in modal", "Trap + Esc", True),
        ("Provider names", "SR providers", "Login with …", False),
        ("Free URL gate announce", "GO URL Free", "Reason announced", False),
        ("Progressbar", "Start audit", "role=progressbar", False),
        ("Report scores", "Open report", "Numbers spoken", False),
        ("PDF control name", "Focus PDF", "Discernible name", False),
        ("Payment fail assertive", "Decline", "Alert + focus CTA", False),
        ("OTP group", "Enter OTP", "Group labelled; paste", False),
        ("Settings tabs", "Arrows", "tabpanels", False),
        ("History names", "SR row", "Title+date", False),
        ("Empty contrast", "013", "≥4.5:1", False),
        ("Warning token contrast", "Inspect badges", "AA or remediated", False),
        ("Reduced motion", "OS reduce", "No info loss", False),
        ("Touch targets", "Mobile CTAs", "≥44px", False),
        ("Consent banner", "M12 keyboard", "Accept/Reject", False),
        ("Session expired focus", "Expire", "Focus login", False),
        ("Offline assertive", "Disconnect", "Banner alert", False),
        ("axe P0", "Run axe", "0 Serious/Critical", True),
        ("Lighthouse", "Landing+Report", "≥90 a11y", False),
        ("Focus not obscured", "Mobile pay", "Field visible", False),
    ]
    for i, (title, steps, exp, sm) in enumerate(a11y_cases, 1):
        A(
            f"TC-A11Y-{i:03d}",
            "P0" if sm else "P1",
            "Accessibility",
            "Per ACCESSIBILITY.md",
            f"{title}: {steps}",
            exp,
            smoke="Yes" if sm else "No",
            a11y="Yes",
            auto="Yes" if "axe" in title.lower() else "Partial",
        )

    # SEC 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Auth", "Call API with userId body only", "Ignored; token identity", dict(neg="Yes", smoke="Yes")),
            ("P0", "User A token", "Access B audit", "403/404", dict(neg="Yes", smoke="Yes")),
            ("P0", "Public", "SSRF payloads", "Blocked", dict(neg="Yes", smoke="Yes")),
            ("P0", "Upload", "Direct storage URL guess", "Private", dict(neg="Yes")),
            ("P0", "Payment", "PAN in Audient logs", "Absent", dict(neg="Yes", smoke="Yes")),
            ("P1", "API", "Burst requests", "429", dict(neg="Yes", perf="Yes")),
            ("P0", "Webhook", "Bad signature", "Rejected", dict(neg="Yes")),
            ("P1", "XSS", "URL field script", "Escaped/rejected", dict(neg="Yes")),
            ("P1", "XSS", "Filename", "Safe", dict(neg="Yes")),
            ("P1", "CSRF", "Cookie session mutate", "Protected per arch", dict(neg="Yes", mobile="No")),
            ("P0", "Delete account", "Data gone", "Erasure", dict(smoke="Yes")),
            ("P1", "AI training flag", "Config", "No training on customer data", dict(edge="Yes")),
            ("P1", "Signed PDF URL", "After expiry", "Fails", dict(neg="Yes", edge="Yes")),
            ("P2", "Security headers", "HTTP", "CSP/HSTS per SECURITY.md", dict(mobile="No")),
            ("P1", "IDOR history cursor", "Manipulate", "No leak", dict(neg="Yes")),
            ("P1", "JWT forged", "Send token", "Rejected", dict(neg="Yes", mobile="No")),
            ("P2", "Open redirect OAuth", "Craft return", "Blocked", dict(neg="Yes")),
            ("P1", "Guest quota bypass", "Clear cookies craft", "Server enforces", dict(neg="Yes", edge="Yes")),
            ("P2", "PII in analytics", "Inspect events", "No PAN/tokens", dict(neg="Yes")),
            ("P1", "CORS", "Evil origin", "Blocked", dict(neg="Yes", mobile="No")),
        ],
        1,
    ):
        A(f"TC-SEC-{i:03d}", pri, "Security", pre, steps, exp, **kw)

    # API 30
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Valid token", "GET /me", "200 profile", dict(smoke="Yes", mobile="No")),
            ("P0", "None", "GET /me", "401", dict(neg="Yes", mobile="No")),
            ("P0", "Pro", "POST /ai/audit URL", "202", dict(smoke="Yes", mobile="No")),
            ("P0", "Free", "POST URL audit", "403 TIER_NOT_ALLOWED", dict(neg="Yes", mobile="No")),
            ("P0", "Pro", "GET /audit/{id}", "progress/status", dict(smoke="Yes", mobile="No")),
            ("P0", "Pro", "GET report", "200", dict(smoke="Yes", mobile="No")),
            ("P0", "Pro", "GET pdf", "signed URL", dict(smoke="Yes", mobile="No")),
            ("P0", "Auth", "GET /history", "list+cursor", dict(smoke="Yes", mobile="No")),
            ("P0", "Auth", "GET /user/credits", "balance", dict(smoke="Yes", mobile="No")),
            ("P0", "Pro", "POST /billing/checkout", "checkout session", dict(smoke="Yes", mobile="No")),
            ("P0", "Pro", "POST /billing/topup", "topup session", dict(smoke="Yes", mobile="No")),
            ("P0", "Free", "POST topup", "403", dict(neg="Yes", mobile="No")),
            ("P0", "Valid", "POST /auth/google", "session", dict(smoke="Yes", mobile="No")),
            ("P1", "Bad id token", "POST /auth/google", "401/400", dict(neg="Yes", mobile="No")),
            ("P1", "Invalid body", "POST audit", "400 VALIDATION_ERROR", dict(neg="Yes", mobile="No")),
            ("P1", "Unknown id", "GET audit", "404", dict(neg="Yes", mobile="No")),
            ("P1", "Idempotency-Key", "Replay POST audit", "Same audit", dict(edge="Yes", mobile="No")),
            ("P1", "Cursor page", "GET history", "nextCursor", dict(mobile="No")),
            ("P1", "RL", "Burst", "429 RATE_LIMITED", dict(neg="Yes", perf="Yes", mobile="No")),
            ("P1", "Webhook", "stripe signed", "200 processing", dict(mobile="No")),
            ("P2", "Health", "GET /health", "200", dict(smoke="Yes", mobile="No")),
            ("P1", "PATCH /me", "Update name", "200", dict(mobile="No")),
            ("P1", "DELETE /me", "Eligible", "204/200 erased", dict(mobile="No")),
            ("P1", "POST feedback", "Valid", "200", dict(mobile="No")),
            ("P1", "Uploads sign", "Valid meta", "uploadUrl", dict(smoke="Yes", mobile="No")),
            ("P1", "Uploads sign", "Bad mime", "400", dict(neg="Yes", mobile="No")),
            ("P2", "Envelope", "Errors", "{error:{code,message}}", dict(mobile="No")),
            ("P1", "Ownership", "GET other report", "403/404", dict(neg="Yes", mobile="No")),
            ("P2", "Latency p95", "Critical GETs", "Within SLO", dict(perf="Yes", mobile="No")),
            ("P1", "OPTIONS/CORS", "Allowed origin", "OK", dict(mobile="No")),
        ],
        1,
    ):
        A(f"TC-API-{i:03d}", pri, "API", pre, steps, exp, **kw)

    # ERR 20
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Auth fail", "Cancel OAuth", "User-facing message", dict(neg="Yes", smoke="Yes")),
            ("P0", "Invalid URL", "Submit", "ERR-URL copy", dict(neg="Yes", smoke="Yes")),
            ("P0", "SSRF", "Submit", "Blocked message", dict(neg="Yes")),
            ("P0", "Insufficient credits", "GO", "Upgrade CTA", dict(neg="Yes", smoke="Yes")),
            ("P0", "Audit fail", "M03", "Retry + refund clause", dict(neg="Yes", smoke="Yes")),
            ("P0", "Payment fail", "MDL-004", "Try again", dict(neg="Yes", smoke="Yes")),
            ("P1", "Offline", "Any mutate", "Offline banner", dict(neg="Yes")),
            ("P1", "429", "Burst", "Rate limit toast", dict(neg="Yes")),
            ("P1", "500", "Force", "Boundary + correlationId", dict(neg="Yes")),
            ("P1", "Timeout", "Slow API", "Retry UX", dict(neg="Yes", perf="Yes")),
            ("P1", "Session", "Expire", "M16 focus login", dict(neg="Yes")),
            ("P1", "PDF fail", "Download", "No audit refund", dict(neg="Yes")),
            ("P1", "Refund fail", "Force", "Support path", dict(neg="Yes", edge="Yes")),
            ("P2", "Upload fail", "Bad file", "Chip error", dict(neg="Yes")),
            ("P2", "Webhook delay", "Pay", "Activating state", dict(edge="Yes")),
            ("P1", "Assertive errors", "SR", "Announced", dict(a11y="Yes", neg="Yes")),
            ("P2", "Color-only", "Inspect errors", "Icon+text", dict(a11y="Yes")),
            ("P1", "Idempotent retry", "Retry create", "No double charge", dict(edge="Yes")),
            ("P2", "404 page", "Bad route", "M09", dict(neg="Yes")),
            ("P2", "Maintenance", "Flag", "Maintenance page", dict(edge="Yes")),
        ],
        1,
    ):
        A(f"TC-ERR-{i:03d}", pri, "Error Handling", pre, steps, exp, **kw)

    # VAL 25
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "URL", "Empty", "Required/disabled GO", dict(neg="Yes", smoke="Yes")),
            ("P0", "URL", "not-a-url", "Invalid message", dict(neg="Yes", smoke="Yes")),
            ("P0", "URL", "https://ok.com", "Passes client", dict(smoke="Yes")),
            ("P0", "URL", "127.0.0.1", "SSRF server reject", dict(neg="Yes")),
            ("P0", "File", "exe upload", "Reject", dict(neg="Yes")),
            ("P0", "File", "png ok", "Accept", dict(smoke="Yes")),
            ("P0", "File", "oversize", "Reject", dict(neg="Yes")),
            ("P0", "Credits", "cost>balance", "422", dict(neg="Yes")),
            ("P1", "Card", "Bad Luhn", "Field error", dict(neg="Yes")),
            ("P1", "Expiry", "Past date", "Reject", dict(neg="Yes")),
            ("P1", "CVV", "1 digit", "Reject", dict(neg="Yes")),
            ("P1", "OTP", "Letters", "Reject", dict(neg="Yes")),
            ("P1", "Name", "Empty submit", "Errors + focus first", dict(neg="Yes", a11y="Yes")),
            ("P1", "Name", "Too long", "Reject", dict(neg="Yes", edge="Yes")),
            ("P1", "Avatar", "wrong type", "Reject", dict(neg="Yes")),
            ("P2", "URL", "max length", "Reject", dict(neg="Yes")),
            ("P1", "Plan", "Invalid tier checkout", "400", dict(neg="Yes", mobile="No")),
            ("P2", "Idempotency", "Missing key policy", "Documented behavior", dict(edge="Yes", mobile="No")),
            ("P1", "Upload count", "max+1", "Reject", dict(neg="Yes")),
            ("P2", "Whitespace names", "Trim", "Trimmed", dict(edge="Yes")),
            ("P1", "email field", "Attempt change", "Blocked", dict(neg="Yes")),
            ("P2", "Unicode URL", "Policy", "Per VAL-URL", dict(edge="Yes")),
            ("P1", "GO no input", "Click", "No API call", dict(neg="Yes")),
            ("P2", "Stripe Element", "Empty submit", "Inline errors", dict(neg="Yes")),
            ("P1", "https messaging", "http-only if disallowed", "Matches VAL-URL copy", dict(edge="Yes", neg="Yes")),
        ],
        1,
    ):
        A(f"TC-VAL-{i:03d}", pri, "Validation", pre, steps, exp, **kw)

    # PERF 15
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P1", "Landing", "LCP", "Within budget", dict(perf="Yes")),
            ("P1", "Home", "TTI interactive", "Budget", dict(perf="Yes")),
            ("P0", "Audit", "Time to report", "Within SLA", dict(perf="Yes", smoke="Yes")),
            ("P1", "PDF", "Generation time", "Budget", dict(perf="Yes")),
            ("P1", "API", "p95 GET /me", "SLO", dict(perf="Yes", mobile="No")),
            ("P1", "History", "100 rows", "Acceptable", dict(perf="Yes")),
            ("P2", "INP", "Click GO", "Good INP", dict(perf="Yes", a11y="Yes")),
            ("P2", "CLS", "Landing", "Low CLS", dict(perf="Yes")),
            ("P1", "Upload", "Large under cap", "Completes", dict(perf="Yes")),
            ("P1", "Poll", "No client meltdown", "Backoff OK", dict(perf="Yes")),
            ("P2", "Mobile 3G", "Home", "Usable", dict(perf="Yes", mobile="Yes")),
            ("P1", "Webhook", "Activation lag", "UX handles", dict(perf="Yes", edge="Yes")),
            ("P2", "Bundle", "JS size", "Budget", dict(perf="Yes", mobile="No")),
            ("P1", "Concurrent users", "Soak create", "Stable", dict(perf="Yes", mobile="No")),
            ("P2", "Image decode", "Large shot", "No UI freeze", dict(perf="Yes")),
        ],
        1,
    ):
        A(f"TC-PERF-{i:03d}", pri, "Performance", pre, steps, exp, **kw)

    # BRW 10
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "Chrome latest", "Smoke P0 flows", "Pass", dict(browser="Yes", smoke="Yes", mobile="No")),
            ("P0", "Firefox latest", "Smoke P0", "Pass", dict(browser="Yes", smoke="Yes", mobile="No")),
            ("P0", "Safari latest", "Smoke P0", "Pass", dict(browser="Yes", smoke="Yes", mobile="No")),
            ("P1", "Edge latest", "Smoke auth+audit", "Pass", dict(browser="Yes", mobile="No")),
            ("P1", "Safari iOS", "Audit+pay", "Pass", dict(browser="Yes", mobile="Yes")),
            ("P1", "Chrome Android", "Audit+pay", "Pass", dict(browser="Yes", mobile="Yes")),
            ("P2", "Safari ITP", "Cookies/session", "Auth works", dict(browser="Yes", edge="Yes", mobile="Yes")),
            ("P2", "Firefox Strict", "Tracking", "Essential works", dict(browser="Yes", edge="Yes")),
            ("P1", "Safari", "Apple SSO", "Works", dict(browser="Yes")),
            ("P2", "Chrome", "Stripe Elements", "Renders", dict(browser="Yes")),
        ],
        1,
    ):
        A(f"TC-BRW-{i:03d}", pri, "Browser Compatibility", pre, steps, exp, **kw)

    # MOB 10
    for i, (pri, pre, steps, exp, kw) in enumerate(
        [
            ("P0", "iPhone", "Landing→guest audit", "E2E", dict(mobile="Yes", smoke="Yes")),
            ("P0", "Android", "Login+Home", "E2E", dict(mobile="Yes", smoke="Yes")),
            ("P1", "iOS", "Payment sheet", "Complete/fail", dict(mobile="Yes")),
            ("P1", "Android", "Upload from camera roll", "Works", dict(mobile="Yes")),
            ("P1", "iOS", "Numeric keyboards", "URL/card/OTP", dict(mobile="Yes", a11y="Yes")),
            ("P2", "Rotate", "Home", "No data loss", dict(mobile="Yes", edge="Yes")),
            ("P1", "Safe area", "CTAs", "Not under home indicator", dict(mobile="Yes", a11y="Yes")),
            ("P2", "Slow network", "Audit", "Progress resilient", dict(mobile="Yes", perf="Yes")),
            ("P1", "VoiceOver", "Landing", "Critical path", dict(mobile="Yes", a11y="Yes")),
            ("P1", "TalkBack", "SSO", "Usable", dict(mobile="Yes", a11y="Yes")),
        ],
        1,
    ):
        A(f"TC-MOB-{i:03d}", pri, "Mobile Testing", pre, steps, exp, **kw)


def write_md(cases):
    out = []
    out.append("# Audient — QA Test Cases")
    out.append("")
    out.append("**Status:** Draft (implementation-ready)  ")
    out.append("**Last updated:** 2026-07-30  ")
    out.append("**Owner:** Raghunath Kamlekar  ")
    out.append(
        "**Related:** SCREEN_MAPPING · BUSINESS_RULES · VALIDATION_RULES · ERROR_HANDLING · ACCESSIBILITY · ANALYTICS · API.md · AUTH/AUDIT/USER/BILLING_API · PRICING · SECURITY · STATE_MANAGEMENT · prd.md"
    )
    out.append("")
    out.append("**Audience:** QA · Engineering · Product  ")
    out.append("**Format:** Markdown only — no application code.")
    out.append("")
    out.append(
        "**Source of truth:** uploaded Figma screens + project docs. Do not invent UI. **OOS** cases are skippable until designed (teams, search, share, password)."
    )
    out.append("")
    out.append(f"**Catalogue size:** **{len(cases)}** test scenarios.")
    out.append("")
    out.append("---")
    out.append("")
    out.append("## 1. How to use this document")
    out.append("")
    out.append("| Field | Meaning |")
    out.append("|-------|---------|")
    out.append("| **Test Case ID** | Stable ID (`TC-{MODULE}-{nnn}`) |")
    out.append("| **Priority** | P0 release blocker · P1 high · P2 medium |")
    out.append("| **Module** | Functional area |")
    out.append("| **Preconditions** | Account / tier / data setup |")
    out.append("| **Steps** | Actions to perform |")
    out.append("| **Expected Result** | Observable outcome |")
    out.append("| **Actual Result** | Filled during execution (blank = not run) |")
    out.append("| **Status** | `Not Run` · `Pass` · `Fail` · `Blocked` · `Skipped` |")
    out.append("| **Automation Candidate** | `Yes` · `Partial` · `No` |")
    out.append("| **Regression** | Include in regression suite |")
    out.append("| **Smoke Test** | Include in smoke suite |")
    out.append("| **Edge Cases** | Boundary / unusual path |")
    out.append("| **Negative Tests** | Invalid / unauthorized / failure path |")
    out.append("| **Performance Tests** | Timing / load / SLA |")
    out.append("| **Browser Compatibility** | Explicit cross-browser verification |")
    out.append("| **Mobile Testing** | Phone / tablet required |")
    out.append("| **Accessibility Testing** | WCAG 2.2 AA focus |")
    out.append("")
    out.append("### Environments & personas")
    out.append("")
    out.append("| Env | Use |")
    out.append("|-----|-----|")
    out.append("| Local | Dev smoke |")
    out.append("| Staging | Full regression + Stripe test mode |")
    out.append("| Production | Synthetic smoke only (no live PAN) |")
    out.append("")
    out.append("| Persona | Setup |")
    out.append("|---------|-------|")
    out.append("| Guest | Cleared storage; unused guest screenshot quota |")
    out.append("| Free | SSO; `FREE`; ~300 credits |")
    out.append("| Pro | `PRO` ACTIVE; credits; Stripe test PM |")
    out.append("| Business | `ENTERPRISE` ACTIVE; 10k credits |")
    out.append("| PAST_DUE | Failed renewal |")
    out.append("| Unverified | `emailVerified=false` |")
    out.append("")
    out.append("### Smoke path")
    out.append("")
    out.append(
        "All **Smoke=Yes** rows. Minimum happy path: Landing → guest screenshot audit → login claim → Free URL gate → Subscribe Pro → URL audit → report → PDF → logout."
    )
    out.append("")
    out.append("### OOS / skip")
    out.append("")
    out.append("| Area | Policy |")
    out.append("|------|--------|")
    out.append("| Teams / invites / roles | Skip TC-ENT-004…007 (BR-ENT-003 FUTURE) |")
    out.append("| History search/filter | Assert absent (TC-HIST-013) |")
    out.append("| Report share / password auth / referral | Not tested |")
    out.append("| Theme/language | Skip until UI (TC-SET-013) |")
    out.append("")
    out.append("---")
    out.append("")
    out.append("## 2. Coverage matrix")
    out.append("")
    mc = Counter(c["mod"] for c in cases)
    out.append("| Module | Count |")
    out.append("|--------|------:|")
    for m, n in sorted(mc.items(), key=lambda x: (-x[1], x[0])):
        out.append(f"| {m} | {n} |")
    out.append(f"| **Total** | **{len(cases)}** |")
    out.append("")
    out.append("| Flag | Count |")
    out.append("|------|------:|")
    out.append(f"| Smoke=Yes | {sum(1 for c in cases if c['smoke']=='Yes')} |")
    out.append(f"| Regression=Yes | {sum(1 for c in cases if c['reg']=='Yes')} |")
    out.append(f"| Negative=Yes | {sum(1 for c in cases if c['neg']=='Yes')} |")
    out.append(f"| Edge=Yes | {sum(1 for c in cases if c['edge']=='Yes')} |")
    out.append(f"| Performance=Yes | {sum(1 for c in cases if c['perf']=='Yes')} |")
    out.append(f"| Accessibility=Yes | {sum(1 for c in cases if c['a11y']=='Yes')} |")
    out.append(f"| Mobile=Yes | {sum(1 for c in cases if c['mobile']=='Yes')} |")
    out.append("")
    out.append("---")
    out.append("")
    out.append("## 3. Master test catalogue")
    out.append("")
    out.append("Defaults: **Actual Result** blank · **Status** `Not Run`.")
    out.append("")

    mod_order = []
    for c in cases:
        if c["mod"] not in mod_order:
            mod_order.append(c["mod"])

    def esc(s):
        return str(s).replace("|", "\\|").replace("\n", " ")

    for mod in mod_order:
        subset = [c for c in cases if c["mod"] == mod]
        out.append(f"### {mod}")
        out.append("")
        out.append(
            "| Test Case ID | Priority | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Automation Candidate | Regression | Smoke Test | Edge Cases | Negative Tests | Performance Tests | Browser Compatibility | Mobile Testing | Accessibility Testing |"
        )
        out.append(
            "|--------------|----------|--------|---------------|-------|-----------------|---------------|--------|----------------------|------------|------------|------------|----------------|-------------------|-----------------------|----------------|----------------------|"
        )
        for c in subset:
            out.append(
                "| "
                + " | ".join(
                    [
                        esc(c["id"]),
                        esc(c["pri"]),
                        esc(c["mod"]),
                        esc(c["pre"]),
                        esc(c["steps"]),
                        esc(c["exp"]),
                        esc(c["actual"]),
                        esc(c["status"]),
                        esc(c["auto"]),
                        esc(c["reg"]),
                        esc(c["smoke"]),
                        esc(c["edge"]),
                        esc(c["neg"]),
                        esc(c["perf"]),
                        esc(c["browser"]),
                        esc(c["mobile"]),
                        esc(c["a11y"]),
                    ]
                )
                + " |"
            )
        out.append("")

    out.append("---")
    out.append("")
    out.append("## 4. Traceability")
    out.append("")
    out.append("| Module | Primary refs |")
    out.append("|--------|--------------|")
    out.append("| Authentication | BR-AUTH-* · AUTH_API · SCREEN-003 |")
    out.append("| Landing / Dashboard | SCREEN-001/004/009 · BR-GUEST-* |")
    out.append("| Website / Screenshot Audit | BR-URL-* · BR-SHOT-* · AUDIT_API · M01–M03 |")
    out.append("| Report / PDF | BR-AI-* · BR-PDF-* · M02 |")
    out.append("| Credits / Billing / Subs | BR-CRED-* · BR-SUB-* · BR-BILL-* · PRICING |")
    out.append("| History / Notifications / Settings | BR-HIST-* · BR-NOTIF-* · SCREEN-010–013 |")
    out.append("| Enterprise | BR-ENT-* |")
    out.append("| Accessibility | ACCESSIBILITY.md |")
    out.append("| Security / API | SECURITY.md · API.md · BR-SEC-* |")
    out.append("| Errors / Validation | ERROR_HANDLING · VALIDATION_RULES |")
    out.append("| Performance / Browser / Mobile | ANALYTICS perf · SCREEN_MAPPING responsive |")
    out.append("")
    out.append("---")
    out.append("")
    out.append("## 5. Execution notes")
    out.append("")
    out.append("1. Use **Stripe test mode** only; never real PAN in shared envs.")
    out.append("2. Verify entitlements via `GET /me` and `GET /user/credits` (server is source of truth).")
    out.append("3. Webhook cases need Stripe CLI / staging admin tools.")
    out.append("4. Log bugs with ERROR_HANDLING code + `X-Request-Id`.")
    out.append("5. Automate: Playwright smoke/P0 · API suite TC-API-* · axe CI for TC-A11Y-022.")
    out.append("6. Mark OOS enterprise/team cases **Skipped** with BR-ENT-003 until designed.")
    out.append(
        "7. Prices under test: Free **$0/300**, Pro **$29/1,000**, Business **$99/10,000**; costs 150/100/50 screenshot and 400/100 URL by tier."
    )
    out.append("")
    out.append("---")
    out.append("")
    out.append("**End of TEST_CASES.md**")

    path = Path(__file__).resolve().parents[1] / "docs" / "TEST_CASES.md"
    path.write_text("\n".join(out), encoding="utf-8")
    print("Wrote", path)


if __name__ == "__main__":
    main()
