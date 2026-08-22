/**
 * Live JWT RLS E2E for BACKEND-009B.
 * Creates ephemeral auth users, verifies denials, cleans up.
 * Usage: node scripts/e2e-workspace-jwt-rls.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`PASS: ${name}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && anon && service, "Supabase env required");

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stamp = Date.now();
const password = `Tmp!${randomBytes(12).toString("base64url")}`;
const emailA = `ws-rls-a-${stamp}@example.com`;
const emailB = `ws-rls-b-${stamp}@example.com`;

const createdAuthIds = [];

async function createAuthUser(email) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert(!error && data.user, `createUser ${email}: ${error?.message}`);
  createdAuthIds.push(data.user.id);
  return data.user;
}

async function waitForAppUser(authId, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const { data } = await admin
      .from("users")
      .select("id, email")
      .eq("auth_provider_id", authId)
      .maybeSingle();
    if (data?.id) return data;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`app user not provisioned for ${authId}`);
}

async function cleanup() {
  for (const id of createdAuthIds) {
    // Resolve app user before auth delete for FK cleanup
    const { data: appUser } = await admin
      .from("users")
      .select("id")
      .eq("auth_provider_id", id)
      .maybeSingle();
    if (appUser?.id) {
      await admin
        .from("workspace_invitations")
        .delete()
        .or(`inviter_id.eq.${appUser.id},invitee_user_id.eq.${appUser.id}`);
      await admin.from("workspace_members").delete().eq("user_id", appUser.id);
      await admin.from("workspaces").delete().eq("owner_id", appUser.id);
      await admin.from("users").delete().eq("id", appUser.id);
    }
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
}

try {
  console.log("Creating ephemeral auth users…");
  const authA = await createAuthUser(emailA);
  const authB = await createAuthUser(emailB);
  const userA = await waitForAppUser(authA.id);
  const userB = await waitForAppUser(authB.id);
  ok("ephemeral users + app rows provisioned");

  // Ensure personal workspaces
  const { data: wsAId, error: eA } = await admin.rpc("ensure_personal_workspace", {
    p_user_id: userA.id,
  });
  const { data: wsBId, error: eB } = await admin.rpc("ensure_personal_workspace", {
    p_user_id: userB.id,
  });
  assert(!eA && wsAId, `ws A: ${eA?.message}`);
  assert(!eB && wsBId, `ws B: ${eB?.message}`);
  ok("personal workspaces ensured");

  const clientA = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientB = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: sA } = await clientA.auth.signInWithPassword({
    email: emailA,
    password,
  });
  const { error: sB } = await clientB.auth.signInWithPassword({
    email: emailB,
    password,
  });
  assert(!sA && !sB, `sign-in failed ${sA?.message || sB?.message}`);
  ok("JWT sessions established");

  // Cross-workspace SELECT denial
  const { data: stolenWs } = await clientA
    .from("workspaces")
    .select("id")
    .eq("id", wsBId)
    .maybeSingle();
  assert(!stolenWs, "A must not SELECT B workspace");
  ok("live JWT: cross-workspace SELECT denial");

  // Unauthorized workspace INSERT
  const { error: insWs } = await clientA.from("workspaces").insert({
    name: "forgery-ws",
    owner_id: userB.id,
    is_personal: false,
  });
  assert(!!insWs, "A must not INSERT workspace");
  ok("live JWT: workspace INSERT denial");

  // Unauthorized workspace UPDATE
  await clientA.from("workspaces").update({ name: "hacked" }).eq("id", wsBId);
  const { data: wsBCheck } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", wsBId)
    .single();
  assert(wsBCheck.name !== "hacked", "A must not UPDATE B workspace");
  ok("live JWT: workspace UPDATE denial");

  // Membership SELECT isolation
  const { data: memB } = await clientA
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", wsBId);
  assert(!memB || memB.length === 0, "A must not SELECT B members");
  ok("live JWT: membership SELECT isolation");

  // Unauthorized member INSERT into B
  const { error: insMem } = await clientA.from("workspace_members").insert({
    workspace_id: wsBId,
    user_id: userA.id,
    role: "VIEWER",
    status: "ACTIVE",
  });
  assert(!!insMem, "A must not INSERT into B memberships");
  ok("live JWT: membership INSERT denial");

  // Role escalation: A cannot set self to OWNER via update on own seat... own seat is OWNER already.
  // Add B as VIEWER on A's workspace via service role, then A (OWNER) tries to set B to OWNER via JWT
  const { data: seatB, error: seatErr } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: wsAId,
      user_id: userB.id,
      role: "VIEWER",
      status: "ACTIVE",
    })
    .select("id, role")
    .single();
  assert(!seatErr && seatB, `seed seat: ${seatErr?.message}`);

  const { error: escOwner } = await clientA
    .from("workspace_members")
    .update({ role: "OWNER" })
    .eq("id", seatB.id);
  void escOwner;
  const { data: afterEsc } = await admin
    .from("workspace_members")
    .select("role")
    .eq("id", seatB.id)
    .single();
  assert(afterEsc.role === "VIEWER", "cannot escalate seat to OWNER via JWT");
  ok("live JWT: role escalation to OWNER denied");

  // Promote B to ADMIN via service, then try ADMIN JWT escalate peer to ADMIN
  await admin
    .from("workspace_members")
    .update({ role: "ADMIN" })
    .eq("id", seatB.id);

  // Sign in as B (ADMIN on A's WS). Create third user C as VIEWER, B tries to promote C to ADMIN.
  const emailC = `ws-rls-c-${stamp}@example.com`;
  const authC = await createAuthUser(emailC);
  const userC = await waitForAppUser(authC.id);
  await admin.rpc("ensure_personal_workspace", { p_user_id: userC.id });
  const { data: seatC } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: wsAId,
      user_id: userC.id,
      role: "VIEWER",
      status: "ACTIVE",
    })
    .select("id")
    .single();

  const clientAdminSeat = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await clientAdminSeat.auth.signInWithPassword({ email: emailB, password });

  const { error: adminEscalate } = await clientAdminSeat
    .from("workspace_members")
    .update({ role: "ADMIN" })
    .eq("id", seatC.id);
  void adminEscalate;
  const { data: seatCAfter } = await admin
    .from("workspace_members")
    .select("role")
    .eq("id", seatC.id)
    .single();
  assert(seatCAfter.role === "VIEWER", "ADMIN cannot promote to ADMIN via JWT");
  ok("live JWT: ADMIN→ADMIN escalation denied");

  // ADMIN cannot remove OWNER
  const { data: ownerSeat } = await admin
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", wsAId)
    .eq("user_id", userA.id)
    .single();
  const { error: delOwner } = await clientAdminSeat
    .from("workspace_members")
    .delete()
    .eq("id", ownerSeat.id);
  void delOwner;
  const { data: ownerStill } = await admin
    .from("workspace_members")
    .select("id")
    .eq("id", ownerSeat.id)
    .is("deleted_at", null)
    .maybeSingle();
  assert(!!ownerStill, "ADMIN cannot DELETE OWNER seat");
  ok("live JWT: OWNER delete protection");

  // Unauthorized member DELETE of foreign workspace
  const { data: bOwn } = await admin
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", wsBId)
    .eq("user_id", userB.id)
    .single();
  await clientA.from("workspace_members").delete().eq("id", bOwn.id);
  const { data: bOwnStill } = await admin
    .from("workspace_members")
    .select("id")
    .eq("id", bOwn.id)
    .maybeSingle();
  assert(!!bOwnStill, "A cannot DELETE B's own membership");
  ok("live JWT: membership DELETE denial");

  // Invitation flow — remove C seat first so accept creates membership
  await admin
    .from("workspace_members")
    .delete()
    .eq("id", seatC.id);

  const { createHash, randomBytes: rb } = await import("node:crypto");
  const rawToken = rb(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const { data: invite, error: invCreateErr } = await admin
    .from("workspace_invitations")
    .insert({
      workspace_id: wsAId,
      inviter_id: userA.id,
      invitee_email: emailC,
      invitee_user_id: userC.id,
      role: "DESIGNER",
      status: "PENDING",
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();
  assert(!invCreateErr && invite, `invite create: ${invCreateErr?.message}`);

  const clientC = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await clientC.auth.signInWithPassword({ email: emailC, password });

  // Wrong user (A) cannot accept C's invite
  const { error: wrongAccept } = await clientA.rpc("accept_workspace_invitation", {
    p_invitation_id: invite.id,
    p_token: rawToken,
  });
  assert(!!wrongAccept, "wrong user must not accept invite");
  ok("live JWT: invitation wrong-user acceptance denied");

  // Correct user accepts
  const { data: memberId, error: acceptErr } = await clientC.rpc(
    "accept_workspace_invitation",
    { p_invitation_id: invite.id, p_token: rawToken },
  );
  assert(!acceptErr && memberId, `accept: ${acceptErr?.message}`);
  const { data: acceptedSeat } = await admin
    .from("workspace_members")
    .select("role, status")
    .eq("id", memberId)
    .single();
  assert(
    acceptedSeat?.role === "DESIGNER" && acceptedSeat?.status === "ACTIVE",
    "accepted seat role/status",
  );
  ok("live JWT: invitation acceptance");

  // Duplicate accept idempotent
  const { data: memberId2, error: accept2 } = await clientC.rpc(
    "accept_workspace_invitation",
    { p_invitation_id: invite.id, p_token: rawToken },
  );
  assert(!accept2 && String(memberId2) === String(memberId), "duplicate accept idempotent");
  ok("live JWT: invitation duplicate accept idempotent");

  // Expired invite rejection
  const expiredToken = rb(32).toString("base64url");
  const { data: expiredInv } = await admin
    .from("workspace_invitations")
    .insert({
      workspace_id: wsAId,
      inviter_id: userA.id,
      invitee_email: emailC,
      role: "VIEWER",
      status: "PENDING",
      token_hash: createHash("sha256").update(expiredToken).digest("hex"),
      expires_at: new Date(Date.now() - 1000).toISOString(),
    })
    .select("id")
    .single();
  const { error: expiredAccept } = await clientC.rpc("accept_workspace_invitation", {
    p_invitation_id: expiredInv.id,
    p_token: expiredToken,
  });
  assert(!!expiredAccept, "expired invite must not accept");
  ok("live JWT: expired invitation rejection");

  await clientC.auth.signOut();

  const { count: invCount, error: invErr } = await admin
    .from("workspace_invitations")
    .select("*", { count: "exact", head: true });
  assert(!invErr, `invitations table: ${invErr?.message}`);
  ok(`workspace_invitations ready (count=${invCount ?? 0})`);

  // Regression smoke: existing foundation intact
  const { count: wsCount } = await admin
    .from("workspaces")
    .select("*", { count: "exact", head: true });
  assert((wsCount ?? 0) >= 2, "workspaces still present");
  ok("foundation workspaces intact after harden");

  await clientA.auth.signOut();
  await clientB.auth.signOut();
  await clientAdminSeat.auth.signOut();

  console.log(`\ne2e-workspace-jwt-rls: ${passed} checks passed.`);
} catch (err) {
  console.error("FAIL:", err.message || err);
  process.exitCode = 1;
} finally {
  await cleanup();
  console.log("Cleanup: ephemeral auth users deleted.");
}
