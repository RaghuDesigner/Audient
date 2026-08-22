import { redirect } from "next/navigation";

import { SETTINGS_ROUTE } from "@/config/settings-screen";

/**
 * Profile menu destination — redirects to Account Settings (profile section).
 * Avoids 404 until a dedicated profile screen exists.
 */
export default function ProfilePage() {
  redirect(SETTINGS_ROUTE);
}
