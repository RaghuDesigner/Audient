export {
  clearGuestId,
  getGuestId,
  getOrCreateGuestId,
} from "@/lib/auth/guest";
export { mapAuthError } from "@/lib/auth/map-error";
export { mapSupabaseUser } from "@/lib/auth/map-user";
export {
  AuthRequiredError,
  getAuthSession,
  getAuthUser,
  requireAuthUser,
} from "@/lib/auth/session";
