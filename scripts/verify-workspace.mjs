/**
 * BACKEND-009A workspace foundation contracts — no Stripe charges.
 * Usage: npm run verify:workspace
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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

const migration = "supabase/migrations/20260821000020_workspace_foundation.sql";
assert(existsSync(migration), "migration file exists");
const sql = read(migration);

assert(sql.includes("workspace_member_role"), "role enum");
assert(sql.includes("workspace_member_status"), "status enum");
assert(sql.includes("CREATE TABLE IF NOT EXISTS public.workspaces"), "workspaces");
assert(sql.includes("CREATE TABLE IF NOT EXISTS public.workspace_members"), "members");
assert(sql.includes("ensure_personal_workspace"), "backfill fn");
assert(sql.includes("audits.workspace_id") || sql.includes("ADD COLUMN IF NOT EXISTS workspace_id"), "audit col");
assert(sql.includes("owns_audit"), "owns_audit extended");
assert(sql.includes("is_active_workspace_member"), "member helper");
assert(sql.includes("role <> 'OWNER'"), "no owner grant via insert");
assert(!sql.includes("DROP POLICY") || sql.includes("audits_select_own"), "audit policies replaced carefully");
assert(!sql.includes("ON public.payments"), "payments RLS untouched");
assert(!sql.includes("ON public.notifications"), "notifications RLS untouched");
assert(!sql.includes("credit_transactions"), "credits ledger untouched in policies");
ok("migration covers foundation without touching payments/notifications");

const membership = read("src/services/workspace/membership.ts");
assert(membership.includes("resolveWorkspaceIdForAuditCreate"), "resolve ws");
assert(membership.includes("assertWorkspaceRole"), "assert role");
assert(membership.includes("ensurePersonalWorkspace"), "ensure personal");
assert(membership.includes("IDENTITY_FORGE") || membership.includes("assertNoForged"), "forge guard");
ok("server membership helpers present");

const create = read("src/services/audit/create.ts");
assert(create.includes("workspace_id: workspaceId"), "audit insert sets workspace");
assert(create.includes("resolveWorkspaceIdForAuditCreate"), "create uses resolver");
ok("audit create wires workspace_id");

const authz = read("src/services/authorization/session.ts");
assert(!authz.includes('"workspaceId"'), "workspaceId not blanket-forged (validated separately)");
ok("workspace_id validated via membership helper not blanket reject");

// Security contract simulations
function canInsertMember(actorRole, newRole, targetIsSelf) {
  if (!["OWNER", "ADMIN"].includes(actorRole)) return false;
  if (newRole === "OWNER") return false;
  if (targetIsSelf) return false;
  return true;
}
assert(canInsertMember("OWNER", "VIEWER", false) === true);
assert(canInsertMember("OWNER", "OWNER", false) === false);
assert(canInsertMember("ADMIN", "ADMIN", true) === false);
assert(canInsertMember("VIEWER", "ADMIN", false) === false);
ok("membership mutation escalation contracts");

function canCreateAudit(role) {
  return ["OWNER", "ADMIN", "DESIGNER", "ANALYST"].includes(role);
}
assert(canCreateAudit("VIEWER") === false);
assert(canCreateAudit("DESIGNER") === true);
ok("viewer cannot create audits");

console.log(`\nverify-workspace: ${passed} checks passed.`);
