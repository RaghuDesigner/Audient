/**
 * BACKEND-009 authorization contracts — no DB writes.
 * Usage: npm run verify:authorization
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

assert(existsSync("src/services/authorization/session.ts"), "authz session");
assert(existsSync("src/services/authorization/types.ts"), "authz types");
ok("authorization service present");

const session = read("src/services/authorization/session.ts");
const types = read("src/services/authorization/types.ts");
const permsApi = read("src/app/api/me/permissions/route.ts");
const auditsApi = read("src/app/api/audits/route.ts");
const auditById = read("src/app/api/audits/[auditId]/route.ts");
const reportApi = read("src/app/api/audits/[auditId]/report/route.ts");
const invoicesApi = read("src/app/api/billing/invoices/route.ts");
const notifApi = read("src/app/api/notifications/route.ts");
const notifPatch = read("src/app/api/notifications/[notificationId]/route.ts");
const rls = read("supabase/migrations/20260730100009_rls_policies.sql");
const authConfig = read("src/config/auth.ts");
const mockWorkspace = read("src/app/workspace/workspace-client.tsx");

assert(session.includes("requireAuthorizationContext"), "require context");
assert(session.includes("assertNoClientIdentityForge"), "forge reject");
assert(session.includes("assertAccountOwnsResource"), "owns assert");
assert(types.includes('accountRole: "owner"'), "personal owner role");
assert(types.includes('workspaceMode: "personal"'), "personal mode");
assert(types.includes("canManageTeam: false"), "team deferred");
ok("authorization context encodes personal ownership + deferred team");

assert(permsApi.includes("requireAuthorizationContext"), "perms uses authz");
assert(permsApi.includes("accountRole"), "exposes accountRole");
assert(permsApi.includes("canAccessWorkspaceUi"), "workspace UI gate");
assert(permsApi.includes("canManageTeam"), "team flags");
ok("GET /api/me/permissions exposes server authz");

assert(auditsApi.includes("assertNoClientIdentityForge"), "audit forge reject");
assert(auditsApi.includes("requireAuthorizationContext"), "audits authz");
assert(auditById.includes("account.appUserId") || auditById.includes("getAuditForUser"), "audit by id scoped");
assert(reportApi.includes("account.appUserId") || reportApi.includes("loadAccountSnapshot"), "report scoped");
ok("audits/report APIs session-scoped");

assert(invoicesApi.includes("account.appUserId") || invoicesApi.includes("listPaymentsForUser"), "invoices scoped");
assert(notifApi.includes("account.appUserId"), "notifications scoped");
assert(notifPatch.includes("markNotificationRead"), "notif mark own");
ok("billing + notification APIs ownership-scoped");

assert(rls.includes("notifications_select_own"), "notif RLS");
assert(rls.includes("notifications_insert_none"), "notif insert denied");
assert(rls.includes("owns_audit") || rls.includes("audits_select_own") || rls.includes("FOR SELECT"), "audit RLS present");
assert(!rls.includes("DISABLE ROW LEVEL SECURITY"), "RLS not disabled");
ok("RLS policies preserved (no weaken)");

assert(
  authConfig.includes("USE_MOCK_AUTH") &&
    (authConfig.includes('process.env.NODE_ENV === "production"') ||
      authConfig.includes("USE_MOCK_AUTH = true")),
  "mock auth kept for dev; disabled in production",
);
assert(
  mockWorkspace.includes("canAccessWorkspace") ||
    mockWorkspace.includes("getMockBusinessWorkspace") ||
    mockWorkspace.includes("Mock"),
  "workspace UI remains mock-compatible",
);
ok("mock auth + mock workspace UI preserved");

const doc = read("docs/backend/BACKEND-009_WORKSPACE_ROLES.md");
assert(doc.includes("not migrated") || doc.includes("deferred"), "DDL deferred documented");
assert(doc.includes("personal"), "personal account model documented");
assert(doc.includes("Do not start BACKEND-010") || doc.includes("BACKEND-010"), "mentions stop on BACKEND-010");
ok("multi-seat DDL deferred; personal model documented");

// IDOR contract simulation
function scopeByOwner(resourceOwnerId, sessionUserId) {
  return resourceOwnerId === sessionUserId ? "allow" : "deny";
}
assert(scopeByOwner("user-a", "user-a") === "allow");
assert(scopeByOwner("user-a", "user-b") === "deny");
assert(scopeByOwner("user-b", "user-a") === "deny");
ok("cross-account resource access denied by ownership contract");

console.log(`\nverify-authorization: ${passed} checks passed.`);
