/**
 * SCREEN-024 — Legal document mock content.
 * Placeholder sections only — pending legal review. No invented compliance claims.
 */

import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import { LEGAL_PRIVACY_COPY } from "@/config/legal-privacy-screen";

export type LegalDocumentSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type LegalDocumentContent = {
  slug: LegalDocumentSlug;
  sections: LegalDocumentSection[];
};

const PLACEHOLDER = LEGAL_PRIVACY_COPY.placeholderNotice;

function section(
  slug: LegalDocumentSlug,
  id: string,
  heading: string,
  body: string[],
): LegalDocumentSection {
  return {
    id: `${slug}-${id}`,
    heading,
    paragraphs: [PLACEHOLDER, ...body],
  };
}

export const MOCK_LEGAL_DOCUMENTS: LegalDocumentContent[] = [
  {
    slug: "terms",
    sections: [
      section("terms", "overview", "Overview", [
        "These placeholder terms describe how you may access and use Audient during the product preview.",
        "Final terms will be published after legal review.",
      ]),
      section("terms", "accounts", "Accounts", [
        "You are responsible for activity under your account and for keeping sign-in credentials secure.",
        "Mock authentication is used in this demo — production terms will reflect real account policies.",
      ]),
      section("terms", "acceptable", "Service use", [
        "Use Audient only for lawful purposes and in accordance with product documentation.",
        "Do not attempt to disrupt the service or access data that is not yours.",
      ]),
      section("terms", "changes", "Changes", [
        "We may update these terms. When we do, we will revise the version and last updated date on this page.",
      ]),
    ],
  },
  {
    slug: "privacy",
    sections: [
      section("privacy", "intro", "Introduction", [
        "This placeholder privacy overview explains, at a high level, what information Audient may process when you use the product.",
        "It is not a final privacy policy.",
      ]),
      section("privacy", "collection", "Information we may process", [
        "Account details you provide (such as name and email) when you sign in.",
        "Audit inputs you submit (such as screenshots or URLs) to generate reports.",
        "Usage information needed to operate and improve the service.",
      ]),
      section("privacy", "use", "How information may be used", [
        "To provide audits, reports, billing, and support.",
        "To maintain security and prevent abuse.",
        "To improve product quality when permitted by your settings and applicable law.",
      ]),
      section("privacy", "choices", "Your choices", [
        "You can manage optional cookies and communications from the Privacy preferences section on this page.",
        "Account deletion and data export flows will be documented when available.",
      ]),
    ],
  },
  {
    slug: "cookies",
    sections: [
      section("cookies", "intro", "About cookies", [
        "Cookies and similar technologies help websites remember preferences and understand usage.",
        "This placeholder describes cookie categories used in the Audient demo.",
      ]),
      section("cookies", "essential", "Essential cookies", [
        "Required for authentication, security, and core navigation. These cannot be turned off while using signed-in features.",
      ]),
      section("cookies", "analytics", "Analytics cookies", [
        "Optional cookies that help us measure product usage. Disabled by default in this demo until you enable them in Privacy preferences.",
      ]),
      section("cookies", "marketing", "Marketing cookies", [
        "Optional cookies that may support campaign measurement. Disabled by default in this demo.",
      ]),
    ],
  },
  {
    slug: "acceptable-use",
    sections: [
      section("acceptable-use", "scope", "Scope", [
        "This placeholder acceptable use policy outlines expected conduct on Audient.",
      ]),
      section("acceptable-use", "permitted", "Permitted use", [
        "Running UX audits on sites and assets you own or have permission to test.",
        "Collaborating with teammates according to your workspace role.",
      ]),
      section("acceptable-use", "prohibited", "Prohibited use", [
        "Uploading unlawful, harmful, or infringing content.",
        "Attempting to probe, scan, or test vulnerabilities without authorization.",
        "Misrepresenting audit results as formal legal or regulatory certifications.",
      ]),
      section("acceptable-use", "enforcement", "Enforcement", [
        "We may suspend access for violations once enforcement processes are in place.",
      ]),
    ],
  },
  {
    slug: "data-processing",
    sections: [
      section("data-processing", "intro", "Purpose", [
        "This placeholder page summarizes how Audient may process customer content submitted for audits.",
        "It is informational only and not a executed data processing agreement.",
      ]),
      section("data-processing", "roles", "Roles", [
        "Customers typically act as controllers of the website content they submit.",
        "Audient acts as a processor when generating audit outputs on the customer's behalf.",
      ]),
      section("data-processing", "subprocessors", "Subprocessors", [
        "Infrastructure and payment providers may process limited data as subprocessors under contractual safeguards.",
        "A definitive subprocessor list will be published before enterprise launch.",
      ]),
      section("data-processing", "security", "Security measures", [
        "Access controls, encryption in transit, and isolation between customer workspaces are design goals described in technical documentation.",
      ]),
    ],
  },
];

export function getMockLegalDocument(
  slug: LegalDocumentSlug,
): LegalDocumentContent | undefined {
  return MOCK_LEGAL_DOCUMENTS.find((doc) => doc.slug === slug);
}

export function getMockLegalDocumentsBundle(input?: {
  state?: "loading" | "success" | "error";
}): {
  state: "loading" | "success" | "error";
  documents: LegalDocumentContent[];
} {
  const state = input?.state ?? "success";

  if (state === "loading" || state === "error") {
    return { state, documents: [] };
  }

  return { state: "success", documents: MOCK_LEGAL_DOCUMENTS };
}
