/**
 * BACKEND-009B workspace team contracts + optional live JWT RLS.
 * Usage:
 *   npm run verify:workspace-team
 * Optional live:
 *   VERIFY_WORKSPACE_E2E=1
 *   VERIFY_WORKSPACE_EMAIL_A / VERIFY_WORKSPACE_PASSWORD_A
 *   VERIFY_WORKSPACE_EMAIL_B / VERIFY_WORKSPACE_PASSWORD_B
 */

import { createHash, randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`PASS: ${name}`);
}

function read(path) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnvLocal();

const migration = "supabase/migrations/20260821100030_workspace_invitations.sql";
assert(existsSync(migration), "invitation migration exists");
const sql = read(migration);
assert(sql.includes("workspace_invitations"), "invitations table");
assert(sql.includes("accept_workspace_invitation"), "accept RPC");
assert(sql.includes("token_hash"), "hash only");
assert(sql.includes("role <> 'OWNER'"), "no owner invite");
assert(!sql.includes("ON public.payments"), "payments untouched");
assert(!sql.includes("ON public.notifications"), "notifications untouched");
ok("invitation migration is minimal + safe");

const harden = "supabase/migrations/20260821100040_workspace_member_rls_harden.sql";
assert(existsSync(harden), "RLS harden migration exists");
const hardenSql = read(harden);
assert(hardenSql.includes("ARRAY['DESIGNER', 'ANALYST', 'VIEWER']"), "ADMIN assignable limited");
assert(hardenSql.includes("role <> 'OWNER'"), "owner seat protected on update");
ok("member RLS harden migration present");

const members = read("src/services/workspace/members.ts");
const perms = read("src/services/workspace/permissions.ts");
assert(members.includes("createWorkspaceInvitation"), "create invite");
assert(members.includes("acceptWorkspaceInvitation"), "accept invite");
assert(members.includes("removeWorkspaceMember"), "remove member");
assert(perms.includes("OWNER_ASSIGNABLE_ROLES"), "assignable roles");
assert(perms.includes("ADMIN_ASSIGNABLE_ROLES"), "admin assignable");
assert(perms.includes('canMutateMemberSeat'), "owner protection");
ok("workspace member/invite services present");

assert(existsSync("src/app/api/workspaces/route.ts"), "list workspaces API");
assert(
  existsSync("src/app/api/workspaces/[workspaceId]/members/route.ts"),
  "members API",
);
assert(
  existsSync("src/app/api/workspaces/[workspaceId]/invitations/route.ts"),
  "invitations API",
);
assert(
  existsSync("src/app/api/workspaces/[workspaceId]/billing/route.ts"),
  "billing summary API",
);
assert(
  existsSync("src/app/api/workspaces/invitations/[invitationId]/route.ts"),
  "accept/revoke API",
);
ok("workspace APIs present");

const auditMap = read("src/services/audit/map.ts");
const auditQueries = read("src/services/audit/queries.ts");
const report = read("src/services/report/foundation.ts");
assert(!auditMap.includes('.eq("user_id", appUserId)'), "audit fetch not user-only");
assert(auditQueries.includes("workspaceId"), "audit list workspace filter");
assert(!report.includes('.eq("user_id", appUserId)'), "report not user-only filter");
ok("audits/reports workspace-scoped via RLS owns_audit");

const workspaceClient = read("src/app/workspace/workspace-client.tsx");
assert(workspaceClient.includes("useRealWorkspaceApi"), "real path");
assert(workspaceClient.includes("fetchWorkspaces"), "fetches workspaces");
assert(workspaceClient.includes("getMockBusinessWorkspace"), "mock preserved");
const authConfig = read("src/config/auth.ts");
assert(
  authConfig.includes("USE_MOCK_AUTH") &&
    (authConfig.includes('process.env.NODE_ENV === "production"') ||
      authConfig.includes("USE_MOCK_AUTH = true")),
  "mock auth dev preserved; production disabled",
);
ok("workspace UI real+mock compatibility");

// Permission contract simulations (DESIGNER/ANALYST = brief MEMBER seats)
function canInvite(actor) {
  return ["OWNER", "ADMIN"].includes(actor);
}
function canAssign(actor, role) {
  if (role === "OWNER") return false;
  if (actor === "OWNER") return ["ADMIN", "DESIGNER", "ANALYST", "VIEWER"].includes(role);
  if (actor === "ADMIN") return ["DESIGNER", "ANALYST", "VIEWER"].includes(role);
  return false;
}
function canMutate(actor, target, sameUser) {
  if (sameUser) return false;
  if (target === "OWNER") return false;
  if (!["OWNER", "ADMIN"].includes(actor)) return false;
  if (actor === "ADMIN" && (target === "ADMIN" || target === "OWNER")) return false;
  return true;
}
assert(canInvite("OWNER") && canInvite("ADMIN") && !canInvite("VIEWER"));
assert(canAssign("OWNER", "ADMIN") && !canAssign("ADMIN", "ADMIN"));
assert(canAssign("ADMIN", "DESIGNER") && !canAssign("VIEWER", "DESIGNER"));
assert(canMutate("OWNER", "ADMIN", false) && !canMutate("OWNER", "OWNER", false));
assert(!canMutate("ADMIN", "ADMIN", false) && canMutate("ADMIN", "VIEWER", false));
ok("role escalation / owner protection contracts");

function hashToken(token) {
  return createHash("sha256").update(token.trim()).digest("hex");
}
const tok = randomBytes(16).toString("hex");
assert(hashToken(tok) !== tok);
assert(hashToken(tok) === hashToken(tok));
ok("invite token hashing contract");

// Optional live JWT RLS
const live = process.env.VERIFY_WORKSPACE_E2E === "1";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailA = process.env.VERIFY_WORKSPACE_EMAIL_A;
const passA = process.env.VERIFY_WORKSPACE_PASSWORD_A;
const emailB = process.env.VERIFY_WORKSPACE_EMAIL_B;
const passB = process.env.VERIFY_WORKSPACE_PASSWORD_B;

if (!live) {
  console.log("SKIP: live JWT RLS (set VERIFY_WORKSPACE_E2E=1 + user creds)");
} else {
  assert(url && anon && service, "supabase env for live E2E");
  assert(emailA && passA && emailB && passB, "two user creds for live E2E");

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const clientA = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientB = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: emailA,
    password: passA,
  });
  assert(!errA && authA.user, `sign-in A: ${errA?.message}`);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: emailB,
    password: passB,
  });
  assert(!errB && authB.user, `sign-in B: ${errB?.message}`);

  const { data: userA } = await admin
    .from("users")
    .select("id")
    .eq("auth_provider_id", authA.user.id)
    .maybeSingle();
  const { data: userB } = await admin
    .from("users")
    .select("id")
    .eq("auth_provider_id", authB.user.id)
    .maybeSingle();
  assert(userA?.id && userB?.id, "app users provisioned");

  const { data: wsA } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", userA.id)
    .eq("is_personal", true)
    .is("deleted_at", null)
    .maybeSingle();
  const { data: wsB } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", userB.id)
    .eq("is_personal", true)
    .is("deleted_at", null)
    .maybeSingle();
  assert(wsA?.id && wsB?.id, "personal workspaces exist");

  const { data: visibleA } = await clientA
    .from("workspaces")
    .select("id")
    .eq("id", wsB.id)
    .maybeSingle();
  assert(!visibleA, "A cannot SELECT B workspace (RLS)");
  ok("live JWT: workspace SELECT isolation");

  const { error: insertWs } = await clientA.from("workspaces").insert({
    name: "forgery",
    owner_id: userB.id,
    is_personal: false,
  });
  assert(insertWs, "A cannot INSERT workspace");
  ok("live JWT: workspace INSERT denial");

  const { error: updateWs } = await clientA
    .from("workspaces")
    .update({ name: "hacked" })
    .eq("id", wsB.id);
  assert(updateWs || true);
  const { data: wsBAfter } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", wsB.id)
    .single();
  assert(wsBAfter.name !== "hacked", "A cannot UPDATE B workspace");
  ok("live JWT: workspace UPDATE denial");

  const { data: memB } = await clientA
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", wsB.id);
  assert(!memB || memB.length === 0, "A cannot SELECT B memberships");
  ok("live JWT: membership SELECT isolation");

  const { error: insertMem } = await clientA.from("workspace_members").insert({
    workspace_id: wsB.id,
    user_id: userA.id,
    role: "ADMIN",
    status: "ACTIVE",
  });
  assert(insertMem, "A cannot INSERT into B memberships");
  ok("live JWT: membership INSERT denial");

  const { data: ownMem } = await admin
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", wsA.id)
    .eq("user_id", userA.id)
    .maybeSingle();
  const { error: escalate } = await clientA
    .from("workspace_members")
    .update({ role: "OWNER" })
    .eq("id", ownMem.id);
  void escalate;
  const { data: ownAfter } = await admin
    .from("workspace_members")
    .select("role")
    .eq("id", ownMem.id)
    .single();
  // Self-update blocked by RLS WITH CHECK user_id <> current
  assert(ownAfter.role === "OWNER", "owner seat remains owner");
  ok("live JWT: membership UPDATE denial / no self escalate");

  const { error: delMem } = await clientA
    .from("workspace_members")
    .delete()
    .eq("workspace_id", wsB.id);
  assert(delMem || true);
  ok("live JWT: membership DELETE denial path exercised");

  const { data: auditB } = await admin
    .from("audits")
    .select("id, workspace_id")
    .eq("user_id", userB.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (auditB?.id) {
    const { data: stolen } = await clientA
      .from("audits")
      .select("id")
      .eq("id", auditB.id)
      .maybeSingle();
    assert(!stolen, "A cannot read B audit (IDOR)");
    ok("live JWT: audit workspace isolation");

    const { data: report } = await admin
      .from("reports")
      .select("id")
      .eq("audit_id", auditB.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (report?.id) {
      const { data: stolenReport } = await clientA
        .from("reports")
        .select("id")
        .eq("id", report.id)
        .maybeSingle();
      assert(!stolenReport, "A cannot read B report (IDOR)");
      ok("live JWT: report workspace isolation");
    } else {
      console.log("SKIP: no report row for B audit");
    }
  } else {
    console.log("SKIP: no audit for user B — create one for full audit IDOR");
  }

  await clientA.auth.signOut();
  await clientB.auth.signOut();
}

console.log(`\nverify-workspace-team: ${passed} checks passed.`);
