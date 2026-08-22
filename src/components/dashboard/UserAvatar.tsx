"use client";

import { initialsFromName } from "@/utils/greeting";
import { cn } from "@/utils/cn";

export type UserAvatarProps = {
  displayName?: string | null;
  avatarUrl?: string | null;
  className?: string;
  size?: "md" | "lg";
};

/**
 * Display avatar for Welcome Card — photo or initials (not the header menu control).
 */
export function UserAvatar({
  displayName = null,
  avatarUrl = null,
  className,
  size = "lg",
}: UserAvatarProps) {
  const initials = initialsFromName(displayName);
  const label = displayName?.trim()
    ? `Avatar for ${displayName.trim()}`
    : "User avatar";

  const sizeClass = size === "lg" ? "size-14 sm:size-16" : "size-11";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote / mock profile URLs
      <img
        src={avatarUrl}
        alt={label}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-border",
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-primary/10 font-semibold text-primary ring-2 ring-border",
        size === "lg" ? "text-body-sm sm:text-body" : "text-info",
        sizeClass,
        className,
      )}
    >
      {initials}
    </span>
  );
}
