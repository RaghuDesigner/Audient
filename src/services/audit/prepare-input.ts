import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuditRecord } from "@/types/audit";
import { fetchUrlAuditEvidence } from "@/services/audit/fetch-url-evidence";
import { AUDIT_UPLOADS_BUCKET } from "@/services/audit/persist-screenshot";

export type PreparedAuditInput = {
  pageTextExcerpt: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
};

function isValidImageDataUrl(value: string | null | undefined): value is string {
  return (
    typeof value === "string" &&
    /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value)
  );
}

/**
 * Prepare evidence for the AI engine from an owned audit row.
 * Fast path: transient `imageDataUrl`. Durable path: `primary_asset_id` signed URL.
 */
export async function prepareAuditAiInput(
  supabase: SupabaseClient,
  audit: AuditRecord,
  options?: { imageDataUrl?: string | null },
): Promise<PreparedAuditInput> {
  let pageTextExcerpt: string | null = null;
  let imageUrl: string | null = null;
  let websiteUrl = audit.websiteUrl;

  if (audit.inputType === "URL") {
    if (!audit.websiteUrl) {
      throw new Error("INVALID_URL");
    }
    const evidence = await fetchUrlAuditEvidence(audit.websiteUrl);
    pageTextExcerpt = evidence.excerpt;
    websiteUrl = evidence.finalUrl;
  }

  if (isValidImageDataUrl(options?.imageDataUrl)) {
    imageUrl = options.imageDataUrl;
  } else if (audit.primaryAssetId) {
    const { data: asset } = await supabase
      .from("file_assets")
      .select("id, storage_key, mime_type, file_type")
      .eq("id", audit.primaryAssetId)
      .is("deleted_at", null)
      .maybeSingle();

    if (asset?.storage_key) {
      try {
        const admin = createSupabaseAdminClient();
        const { data: signed, error } = await admin.storage
          .from(AUDIT_UPLOADS_BUCKET)
          .createSignedUrl(asset.storage_key as string, 60 * 10);
        if (!error && signed?.signedUrl) {
          imageUrl = signed.signedUrl;
        }
      } catch {
        // Signed URL unavailable — screenshot audits fail closed below.
      }
    }
  }

  if (audit.inputType === "SCREENSHOT" && !imageUrl) {
    throw new Error("SCREENSHOT_INVALID");
  }

  if (
    imageUrl?.startsWith("data:image/") &&
    imageUrl.length > 5_500_000
  ) {
    throw new Error("PAGE_TOO_HEAVY");
  }

  return { pageTextExcerpt, imageUrl, websiteUrl };
}
