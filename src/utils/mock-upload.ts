/**
 * Mock image upload pipeline — no backend.
 * Simulates corrupted decode, network, and timeout failures for QA.
 *
 * Filename markers (case-insensitive):
 * - `corrupt`  → corrupted image
 * - `timeout`  → upload timeout
 * - `offline`  → network failure (also when navigator.onLine is false)
 */

import type { ImageFailureReason } from "@/utils/upload-errors";
import { validateImageFile } from "@/utils/file-validation";

export type MockUploadResult =
  | { ok: true; previewUrl: string }
  | { ok: false; reason: ImageFailureReason };

const MOCK_DELAY_MS = 400;
const MOCK_TIMEOUT_MS = 600;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function nameIncludes(file: File, token: string): boolean {
  return file.name.toLowerCase().includes(token);
}

async function canDecodeImage(file: File): Promise<boolean> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      return true;
    } catch {
      return false;
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    image.src = url;
  });
}

/**
 * Mock “upload” after client type/size validation.
 * Returns a local object URL on success.
 */
export async function mockUploadImage(file: File): Promise<MockUploadResult> {
  const sync = validateImageFile(file);
  if (!sync.ok) {
    return { ok: false, reason: sync.reason };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, reason: "network" };
  }

  if (nameIncludes(file, "offline") || nameIncludes(file, "network")) {
    await wait(MOCK_DELAY_MS);
    return { ok: false, reason: "network" };
  }

  if (nameIncludes(file, "timeout")) {
    await wait(MOCK_TIMEOUT_MS);
    return { ok: false, reason: "timeout" };
  }

  if (nameIncludes(file, "corrupt")) {
    await wait(MOCK_DELAY_MS);
    return { ok: false, reason: "corrupted" };
  }

  await wait(MOCK_DELAY_MS);

  const decodable = await canDecodeImage(file);
  if (!decodable) {
    return { ok: false, reason: "corrupted" };
  }

  return { ok: true, previewUrl: URL.createObjectURL(file) };
}
