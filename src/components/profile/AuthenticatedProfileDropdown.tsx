"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { Avatar } from "@/components/home/avatar";
import { MenuItem } from "@/components/profile/MenuItem";
import {
  getProfileActionHref,
  PROFILE_NAVIGATION_MENU_ITEMS,
  PROFILE_WORKSPACE_MENU_ITEM,
  type ProfileNavigationAction,
} from "@/config/profile-navigation";
import {
  useProfileNavigation,
  type UseProfileNavigationOptions,
} from "@/hooks/use-profile-navigation";
import { cn } from "@/utils/cn";

export type AuthenticatedProfileAction = ProfileNavigationAction;

type ProfileMenuItem = {
  id: AuthenticatedProfileAction;
  label: string;
  href: string;
};

export type AuthenticatedProfileDropdownProps = {
  displayName?: string | null;
  tier?: "free" | "pro" | "business";
  /** Optional side effects / guards — navigation always falls through. */
  profileNavigation?: UseProfileNavigationOptions;
  className?: string;
};

/**
 * SCREEN-008 — Authenticated Profile menu.
 * Profile · History · Notifications · Account Settings · Manage Plan · Logout.
 * Business Workspace shown for Business tier only.
 */
export function AuthenticatedProfileDropdown({
  displayName = null,
  tier = "free",
  profileNavigation,
  className,
}: AuthenticatedProfileDropdownProps) {
  const router = useRouter();
  const { handleProfileAction } = useProfileNavigation(profileNavigation);
  const [open, setOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = React.useId();
  const showCrown = tier === "pro" || tier === "business";
  const menuItems = React.useMemo((): ProfileMenuItem[] => {
    const items: ProfileMenuItem[] = PROFILE_NAVIGATION_MENU_ITEMS.map(
      (item) => ({ ...item }),
    );
    if (tier === "business") {
      const settingsIndex = items.findIndex((item) => item.id === "settings");
      items.splice(settingsIndex >= 0 ? settingsIndex : items.length - 1, 0, {
        id: PROFILE_WORKSPACE_MENU_ITEM.id,
        label: PROFILE_WORKSPACE_MENU_ITEM.label,
        href: PROFILE_WORKSPACE_MENU_ITEM.href,
      });
    }
    return items;
  }, [tier]);
  const label = displayName?.trim()
    ? `Account menu for ${displayName.trim()}`
    : "Account menu";

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }, []);

  const toggle = React.useCallback(() => {
    setOpen((wasOpen) => !wasOpen);
  }, []);

  const activate = React.useCallback(
    (action: AuthenticatedProfileAction, href: string) => {
      close(false);

      if (action === "logout") {
        setLogoutOpen(true);
        return;
      }

      const allowed = handleProfileAction(action);
      if (allowed === false) {
        return;
      }

      const destination = getProfileActionHref(action) ?? href;
      router.push(destination);
    },
    [close, handleProfileAction, router],
  );

  const handleLogoutConfirm = React.useCallback(() => {
    setLogoutOpen(false);
    handleProfileAction("logout");
  }, [handleProfileAction]);

  React.useEffect(() => {
    if (!open) return;

    itemRefs.current[0]?.focus();

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
      if (items.length === 0) return;
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement,
      );

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = items[(currentIndex + 1 + items.length) % items.length];
        next?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = items[(currentIndex - 1 + items.length) % items.length];
        prev?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Avatar
          ref={triggerRef}
          label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={toggle}
        />
        {showCrown ? (
          <span
            className={cn(
              "pointer-events-none absolute -right-0.5 -top-0.5",
              "inline-flex size-4 items-center justify-center rounded-full",
              "bg-secondary text-secondary-foreground",
            )}
            aria-hidden
          >
            <Crown className="size-2.5" />
          </span>
        ) : null}
      </div>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute right-0 top-full z-dropdown mt-sm w-max whitespace-nowrap",
            "rounded-md border border-border bg-popover py-sm text-popover-foreground",
            "shadow-md",
          )}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              onSelect={() => activate(item.id, item.href)}
            >
              {item.label}
            </MenuItem>
          ))}
        </div>
      ) : null}

      <LogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
