import { redirect } from "next/navigation";

import { buildLegalDocumentRoute } from "@/utils/legal-privacy-screen";

/**
 * Legacy `/privacy` route — redirects to Legal & Privacy document.
 */
export default function PrivacyRedirectPage() {
  redirect(buildLegalDocumentRoute("privacy"));
}
