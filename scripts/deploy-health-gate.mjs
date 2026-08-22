/**
 * BACKEND-012A — health-gated deployment check (CI or post-deploy manual gate).
 * Does NOT deploy, switch Stripe live, or create payments.
 *
 * Usage:
 *   DEPLOY_HEALTH_URL=https://your-app.example.com npm run verify:health-gate
 *   node scripts/deploy-health-gate.mjs https://your-app.example.com
 *
 * Exit 0 only when GET /api/health returns ready=true and mockAuth=false.
 */

const baseUrl =
  process.env.DEPLOY_HEALTH_URL?.trim() || process.argv[2]?.trim() || "";

if (!baseUrl) {
  console.error(
    "Usage: DEPLOY_HEALTH_URL=https://app.example.com npm run verify:health-gate",
  );
  process.exit(2);
}

const healthUrl = `${baseUrl.replace(/\/$/, "")}/api/health`;
const maxAttempts = Number(process.env.HEALTH_GATE_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HEALTH_GATE_DELAY_MS ?? 5000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    const response = await fetch(healthUrl, { cache: "no-store" });
    const body = await response.json();

    const ready =
      response.status === 200 &&
      body.ready === true &&
      body.mockAuth === false &&
      Array.isArray(body.configIssues) &&
      body.configIssues.length === 0;

    if (ready) {
      console.log(
        `PASS: deployment health gate (attempt ${attempt}/${maxAttempts})`,
        { status: body.status, ready: body.ready, production: body.production },
      );
      process.exit(0);
    }

    console.log(`WAIT: attempt ${attempt}/${maxAttempts}`, {
      httpStatus: response.status,
      ready: body.ready,
      mockAuth: body.mockAuth,
      configIssues: body.configIssues,
      supabaseReachable: body.supabase?.reachable,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`WAIT: attempt ${attempt}/${maxAttempts}`, { error: message });
  }

  if (attempt < maxAttempts) {
    await sleep(delayMs);
  }
}

console.error(
  "FAIL: deployment is not ready for production traffic (ready=false or config invalid).",
);
process.exit(1);
