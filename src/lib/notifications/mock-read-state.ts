/**
 * Mock notification read overlay — frontend demos only.
 * SessionStorage so header badge and /notifications stay in sync.
 */

const STORAGE_KEY = "audient_mock_notification_read_ids";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readMockNotificationReadIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function persistMockNotificationReadIds(ids: readonly string[]): void {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function markMockNotificationsRead(ids: readonly string[]): void {
  const next = new Set(readMockNotificationReadIds());
  for (const id of ids) {
    if (id) next.add(id);
  }
  persistMockNotificationReadIds([...next]);
}

export function clearMockNotificationReadState(): void {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function applyMockNotificationReadOverlay<
  T extends { id: string; read: boolean },
>(items: readonly T[]): T[] {
  const readIds = new Set(readMockNotificationReadIds());
  if (readIds.size === 0) return [...items];
  return items.map((item) =>
    readIds.has(item.id) && !item.read ? { ...item, read: true } : item,
  );
}
