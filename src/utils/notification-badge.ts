/**
 * COMPONENT-042 — Notification Badge helpers.
 * Count formatting + a11y labels — no React / no API.
 */

import {
  NOTIFICATION_BADGE_COPY,
  NOTIFICATION_BADGE_MAX_DISPLAY,
  NOTIFICATION_BADGE_OVERFLOW_LABEL,
  type NotificationBadgeCountBucket,
} from "@/config/notification-badge";

/** Numeric badge text; null when count is 0 (hide badge). */
export function formatUnreadBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  if (count > NOTIFICATION_BADGE_MAX_DISPLAY) {
    return NOTIFICATION_BADGE_OVERFLOW_LABEL;
  }
  return String(count);
}

/** Inline page header label (e.g. "3 unread"). */
export function formatUnreadInlineLabel(count: number): string | null {
  if (count <= 0) return null;
  if (count > NOTIFICATION_BADGE_MAX_DISPLAY) {
    return NOTIFICATION_BADGE_COPY.inlineOverflow;
  }
  if (count === 1) {
    return NOTIFICATION_BADGE_COPY.inlineUnreadOne;
  }
  return NOTIFICATION_BADGE_COPY.inlineUnreadMany(count);
}

/** Accessible name for bell / badge control. */
export function notificationBadgeAccessibleLabel(
  count: number,
  options?: { loading?: boolean },
): string {
  if (options?.loading) {
    return NOTIFICATION_BADGE_COPY.loading;
  }
  if (count <= 0) {
    return NOTIFICATION_BADGE_COPY.noUnread;
  }
  if (count > NOTIFICATION_BADGE_MAX_DISPLAY) {
    return NOTIFICATION_BADGE_COPY.unreadOverflow;
  }
  if (count === 1) {
    return NOTIFICATION_BADGE_COPY.unreadOne;
  }
  return NOTIFICATION_BADGE_COPY.unreadMany(count);
}

export function notificationBadgeCountBucket(
  count: number,
): NotificationBadgeCountBucket {
  if (count <= 0) return "0";
  if (count > NOTIFICATION_BADGE_MAX_DISPLAY) return "99+";
  return "1-99";
}
