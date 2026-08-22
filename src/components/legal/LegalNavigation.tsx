"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ResponsiveNavList,
  type ResponsiveNavItem,
} from "@/components/layout/responsive-nav-list";
import {
  LEGAL_DOCUMENT_VERSIONS,
  LEGAL_PRIVACY_COPY,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import { legalNavigationAnalytics } from "@/lib/analytics/legal-document-nav-events";
import {
  buildLegalNavigationItems,
  isLegalNavigationSlug,
} from "@/utils/legal-navigation";

export type LegalNavigationProps = {
  activeSlug: LegalDocumentSlug;
  disabled?: boolean;
  onNavigate?: (slug: LegalDocumentSlug) => void;
  className?: string;
};

/**
 * COMPONENT-068 — Legal Navigation.
 * Switches between legal documents — mock routes only; no backend.
 */
export function LegalNavigation({
  activeSlug,
  disabled = false,
  onNavigate,
  className,
}: LegalNavigationProps) {
  const router = useRouter();
  const items = React.useMemo(() => buildLegalNavigationItems(), []);

  const navItems: ResponsiveNavItem[] = React.useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
      })),
    [items],
  );

  const handleActivate = (id: string) => {
    if (!isLegalNavigationSlug(id)) return;
    legalNavigationAnalytics.documentOpened({
      documentSlug: id,
      version: LEGAL_DOCUMENT_VERSIONS[id].version,
    });
    onNavigate?.(id);
    router.push(items.find((item) => item.slug === id)?.href ?? `/legal/${id}`);
  };

  return (
    <ResponsiveNavList
      items={navItems}
      activeId={activeSlug}
      navLabel={LEGAL_PRIVACY_COPY.navLabel}
      mobileSelectLabel={LEGAL_PRIVACY_COPY.documentNavLabel}
      disabled={disabled}
      onItemActivate={handleActivate}
      className={className}
    />
  );
}
