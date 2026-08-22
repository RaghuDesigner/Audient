"use client";

import {
  AlertTriangle,
  ArrowUpCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Sparkles,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_ITEM_COPY } from "@/config/notification-item";
import type { NotificationItemType } from "@/config/notification-item";
import {
  notificationItemIconKey,
  notificationItemIconToneClass,
  type NotificationItemIconKey,
} from "@/utils/notification-item";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<NotificationItemIconKey, LucideIcon> = {
  check_circle: CheckCircle2,
  x_circle: XCircle,
  coins: Coins,
  credit_card: CreditCard,
  alert_triangle: AlertTriangle,
  sparkles: Sparkles,
  calendar: Calendar,
  file_text: FileText,
  arrow_up: ArrowUpCircle,
  clock: Clock,
  users: Users,
  bell: Bell,
};

export function NotificationItemLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 w-full gap-md rounded-md border border-border bg-surface p-md",
        className,
      )}
      aria-busy="true"
      aria-label={NOTIFICATION_ITEM_COPY.loadingLabel}
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function NotificationItemIcon({
  type,
}: {
  type: NotificationItemType;
}) {
  const Icon = ICON_MAP[notificationItemIconKey(type)];
  return (
    <span
      className={cn(
        "relative z-10 flex size-10 shrink-0 items-center justify-center",
        "rounded-full bg-muted",
        notificationItemIconToneClass(type),
      )}
      aria-hidden
    >
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}
