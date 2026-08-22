"use client";

import * as React from "react";

import type { ProfileNavigationAction } from "@/config/profile-navigation";
import { useAuth } from "@/hooks/use-auth";

export type UseProfileNavigationOptions = {
  /**
   * Return `false` to block navigation (e.g. during payment processing).
   * Logout is also blocked when this returns false.
   */
  beforeAction?: (action: ProfileNavigationAction) => boolean;
  /** Side effects before navigation (analytics, etc.). */
  onAction?: (action: ProfileNavigationAction) => void;
};

export type UseProfileNavigationReturn = {
  /**
   * Handle a profile menu action — logout via auth, side effects only.
   * Navigation is performed by `AuthenticatedProfileDropdown` (fall-through).
   * Return `false` when `beforeAction` blocks the action.
   */
  handleProfileAction: (action: ProfileNavigationAction) => boolean | void;
};

/**
 * Shared profile menu handler — logout + optional side effects.
 * Route navigation is delegated to the dropdown after this handler runs.
 */
export function useProfileNavigation(
  options?: UseProfileNavigationOptions,
): UseProfileNavigationReturn {
  const { signOut } = useAuth();
  const beforeAction = options?.beforeAction;
  const onAction = options?.onAction;

  const handleProfileAction = React.useCallback(
    (action: ProfileNavigationAction): boolean | void => {
      if (beforeAction && !beforeAction(action)) {
        return false;
      }

      onAction?.(action);

      if (action === "logout") {
        void signOut();
        return;
      }

      return true;
    },
    [beforeAction, onAction, signOut],
  );

  return { handleProfileAction };
}
