import { SignInClient } from "@/app/(auth)/sign-in/sign-in-client";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

/**
 * SSO sign-in for protected-route redirects (LOGIN_SCREEN §5 route_guard).
 * Providers only — Google, Apple, Microsoft (no email/password).
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeAuthRedirect(params.next);
  const initialError = params.error ?? null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-md py-xl">
      <SignInClient nextPath={nextPath} initialError={initialError} />
    </main>
  );
}
