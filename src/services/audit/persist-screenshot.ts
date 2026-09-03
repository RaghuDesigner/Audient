import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logError } from "@/lib/log";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const AUDIT_UPLOADS_BUCKET = "audit-uploads";
export const SCREENSHOT_EVIDENCE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class ScreenshotPersistError extends Error {
  constructor(message = "Unable to store screenshot evidence.") {
    super(message);
    this.name = "ScreenshotPersistError";
  }
}

type ParsedScreenshot = {
  mime: "image/png" | "image/jpeg" | "image/webp";
  ext: "png" | "jpg" | "webp";
  bytes: Buffer;
};

function parseScreenshotDataUrl(imageDataUrl: string): ParsedScreenshot {
  const match =
    /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
      imageDataUrl,
    );
  if (!match) {
    throw new ScreenshotPersistError();
  }

  const kind = match[1]?.toLowerCase();
  const payload = match[2];
  if (!kind || !payload) {
    throw new ScreenshotPersistError();
  }
  const mime =
    kind === "png"
      ? "image/png"
      : kind === "webp"
        ? "image/webp"
        : "image/jpeg";
  const ext = kind === "png" ? "png" : kind === "webp" ? "webp" : "jpg";
  const bytes = Buffer.from(payload.replace(/\s/g, ""), "base64");
  if (bytes.length === 0) {
    throw new ScreenshotPersistError();
  }

  return { mime, ext, bytes };
}

async function removeObject(storageKey: string): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.storage.from(AUDIT_UPLOADS_BUCKET).remove([storageKey]);
  } catch {
    // Best-effort cleanup — caller still fails the audit.
  }
}

/**
 * Persist screenshot bytes for an owned SCREENSHOT audit.
 * Storage is private; DB row is the inventory pointer used by prepare-input.
 */
export async function persistScreenshotEvidence(input: {
  supabase: SupabaseClient;
  appUserId: string;
  auditId: string;
  imageDataUrl: string;
}): Promise<{ assetId: string }> {
  const { supabase, appUserId, auditId, imageDataUrl } = input;

  const { data: audit } = await supabase
    .from("audits")
    .select("id, primary_asset_id, user_id, input_type")
    .eq("id", auditId)
    .eq("user_id", appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!audit || (audit as { input_type?: string }).input_type !== "SCREENSHOT") {
    throw new ScreenshotPersistError();
  }

  const existingAssetId = (audit as { primary_asset_id?: string | null })
    .primary_asset_id;
  if (existingAssetId) {
    return { assetId: existingAssetId };
  }

  const { data: existingRow } = await supabase
    .from("file_assets")
    .select("id")
    .eq("audit_id", auditId)
    .eq("user_id", appUserId)
    .eq("file_type", "SCREENSHOT")
    .is("deleted_at", null)
    .maybeSingle();

  if (existingRow?.id) {
    const admin = createSupabaseAdminClient();
    const { error: linkError } = await admin
      .from("audits")
      .update({
        primary_asset_id: existingRow.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auditId)
      .eq("user_id", appUserId);
    if (linkError) throw new ScreenshotPersistError();
    return { assetId: existingRow.id as string };
  }

  const parsed = parseScreenshotDataUrl(imageDataUrl);
  const storageKey = `${appUserId}/${auditId}/screenshot.${parsed.ext}`;
  const expiresAt = new Date(Date.now() + SCREENSHOT_EVIDENCE_TTL_MS).toISOString();

  let uploaded = false;
  try {
    const admin = createSupabaseAdminClient();
    const { error: uploadError } = await admin.storage
      .from(AUDIT_UPLOADS_BUCKET)
      .upload(storageKey, parsed.bytes, {
        contentType: parsed.mime,
        upsert: true,
      });
    if (uploadError) {
      throw new ScreenshotPersistError();
    }
    uploaded = true;

    const { data: inserted, error: insertError } = await admin
      .from("file_assets")
      .insert({
        user_id: appUserId,
        storage_key: storageKey,
        file_type: "SCREENSHOT",
        mime_type: parsed.mime,
        size_bytes: parsed.bytes.length,
        audit_id: auditId,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      throw new ScreenshotPersistError();
    }

    const assetId = inserted.id as string;
    const { error: linkError } = await admin
      .from("audits")
      .update({
        primary_asset_id: assetId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auditId)
      .eq("user_id", appUserId);

    if (linkError) {
      await admin
        .from("file_assets")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", assetId)
        .eq("user_id", appUserId);
      throw new ScreenshotPersistError();
    }

    return { assetId };
  } catch (error) {
    if (uploaded) {
      await removeObject(storageKey);
    }
    logError("audit.screenshot_persist_failed", {
      auditId,
      userId: appUserId,
      detail:
        error instanceof Error
          ? error.name.slice(0, 80)
          : "screenshot_persist_failed",
    });
    if (error instanceof ScreenshotPersistError) throw error;
    throw new ScreenshotPersistError();
  }
}
