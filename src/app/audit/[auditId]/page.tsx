import { ProcessingScreen } from "@/components/audit/processing-screen";
import { resolveAuditProcessingMockFail } from "@/config/audit-processing";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

type AuditProcessingPageProps = {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<{ fail?: string }>;
};

/**
 * SCREEN-M01 Processing / SCREEN-M03 Failed route (`/audit/[auditId]`).
 * Phase-1: mock progress briefly, then navigate to report or show failure.
 * Failure only when `?fail=` is explicitly set (QA / dashboard failed audits).
 */
export default async function AuditProcessingPage({
  params,
  searchParams,
}: AuditProcessingPageProps) {
  const { auditId } = await params;
  const { fail } = await searchParams;

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <ProcessingScreen
          auditId={auditId}
          mockFail={resolveAuditProcessingMockFail(fail)}
        />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}
