import { ErrorSystemClient } from "@/app/system/error/error-system-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { parseErrorSystemStateType } from "@/utils/error-system-states";

type ErrorSystemPageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-025 — QA demo route for error & system states.
 * Mock only: `/system/error?state=not_found|forbidden|…`
 */
export default async function ErrorSystemPage({
  searchParams,
}: ErrorSystemPageProps) {
  const query = await searchParams;
  const state = parseErrorSystemStateType(query.state) ?? "generic_error";

  return (
    <LoginModalProvider>
      <ErrorSystemClient state={state} />
    </LoginModalProvider>
  );
}
