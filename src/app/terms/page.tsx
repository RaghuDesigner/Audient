import { redirect } from "next/navigation";

import { buildLegalDocumentRoute } from "@/utils/legal-privacy-screen";

/**
 * Legacy `/terms` route — redirects to Legal & Privacy document.
 */
export default function TermsRedirectPage() {
  redirect(buildLegalDocumentRoute("terms"));
}
