/**
 * COMPONENT-043 — Mark All Read helpers.
 * Pure mock inbox updates — no React / no API.
 */

import { MARK_ALL_READ_MOCK_DELAY_MS } from "@/config/mark-all-read-button";

/** Minimal row shape for bulk mark-read. */
export type MarkAllReadNotification = {
  read: boolean;
};

export type MarkAllReadResult<T extends MarkAllReadNotification> = {
  items: T[];
  unreadBefore: number;
  unreadAfter: number;
  changed: number;
};

function countUnread<T extends MarkAllReadNotification>(
  items: readonly T[],
): number {
  return items.filter((item) => !item.read).length;
}

/**
 * Returns a new array with every notification marked read.
 * Does not mutate the input array.
 */
export function markAllMockNotificationsRead<
  T extends MarkAllReadNotification,
>(items: readonly T[]): MarkAllReadResult<T> {
  const unreadBefore = countUnread(items);
  const next = items.map((item) =>
    item.read ? item : { ...item, read: true },
  );
  return {
    items: next,
    unreadBefore,
    unreadAfter: 0,
    changed: unreadBefore,
  };
}

/** Simulated async mark-all for mock loading UX (no network). */
export async function markAllMockNotificationsReadAsync<
  T extends MarkAllReadNotification,
>(
  items: readonly T[],
  options?: { delayMs?: number; shouldFail?: boolean },
): Promise<MarkAllReadResult<T>> {
  const delayMs = options?.delayMs ?? MARK_ALL_READ_MOCK_DELAY_MS;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (options?.shouldFail) {
    throw new Error("mock_mark_all_read_failed");
  }
  return markAllMockNotificationsRead(items);
}
