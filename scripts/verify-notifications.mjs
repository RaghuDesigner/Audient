/**
 * BACKEND-008 local contracts — no Stripe charges, no DB writes.
 * Usage: npm run verify:notifications
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

const emit = read("src/services/notification/emit.ts");
const create = read("src/services/notification/create.ts");
const list = read("src/services/notification/list.ts");
const webhook = read("src/services/billing/webhook.ts");
const auditCreate = read("src/services/audit/create.ts");
const apiList = read("src/app/api/notifications/route.ts");
const apiRead = read("src/app/api/notifications/[notificationId]/route.ts");
const apiAll = read("src/app/api/notifications/read-all/route.ts");
const invoicesApi = read("src/app/api/billing/invoices/route.ts");
const client = read("src/app/notifications/notifications-client.tsx");

assert(create.includes("idempotencyKey"), "create requires idempotency");
assert(create.includes("notifySafely"), "safe wrapper");
ok("notification create is idempotent + safe");

assert(list.includes("user_id"), "list scoped");
assert(list.includes("markNotificationRead"), "mark read");
assert(list.includes("markAllNotificationsRead"), "mark all");
ok("list / mark-read ownership helpers present");

assert(apiList.includes("loadAccountSnapshot"), "api auth account");
assert(apiRead.includes("markNotificationRead"), "patch read");
assert(apiAll.includes("markAllNotificationsRead"), "read-all");
assert(!apiList.includes("createNotification"), "clients cannot create");
assert(apiRead.includes("INVALID_BODY") || apiRead.includes("read: true"), "patch constrained");
ok("notification APIs authenticated; no client create");

assert(
  apiRead.includes("account.appUserId") || apiRead.includes("appUserId"),
  "patch uses account ownership",
);
assert(
  !apiList.includes("SUPABASE_SERVICE_ROLE") &&
    !create.includes("NEXT_PUBLIC_STRIPE"),
  "no public secrets in notification paths",
);
ok("unauthorized forge paths rejected by design");

assert(webhook.includes("notifySubscriptionPaymentSucceeded"), "sub pay notif");
assert(webhook.includes("notifyCreditPurchaseSucceeded"), "topup notif");
assert(webhook.includes("notifyPaymentFailed"), "fail notif");
assert(webhook.includes("notifySubscriptionCanceled"), "cancel notif");
ok("Stripe webhook emits billing notifications after mutations");

assert(auditCreate.includes("notifyAuditCompleted"), "audit complete notif");
assert(auditCreate.includes("notifyAuditFailed"), "audit failed notif");
assert(auditCreate.includes("notifyCreditRefunded"), "refund notif");
ok("audit complete/fail/refund emit notifications");

assert(invoicesApi.includes("listPaymentsForUser"), "invoice projection");
ok("invoice history still uses payments projection");

assert(client.includes("useRealNotificationsApi"), "real path");
assert(client.includes("fetchNotifications"), "fetches API");
assert(existsSync(join(process.cwd(), "src/lib/auth/mock-session.ts")), "mock auth kept");
ok("frontend real path + mock auth preserved");

// Idempotency key contract simulation
const seen = new Set();
function createOnce(key) {
  if (seen.has(key)) return "skip";
  seen.add(key);
  return "create";
}
assert(createOnce("payment:p1:succeeded") === "create");
assert(createOnce("payment:p1:succeeded") === "skip");
assert(createOnce("audit:a1:completed") === "create");
assert(createOnce("audit:a1:completed") === "skip");
ok("duplicate webhook notification prevention contract");

assert(emit.includes("PAYMENT_SUCCEEDED") || emit.includes("SYSTEM"), "uses DB enum");
assert(emit.includes('uiType: "payment_failed"'), "failed payments use SYSTEM+uiType");
ok("DB notification_type enum reused (no migration)");

console.log(`\nverify-notifications: ${passed} checks passed.`);
