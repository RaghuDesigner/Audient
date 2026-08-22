"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cookie,
  Database,
  FileText,
  Scale,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardSubtitle,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  legalDocumentCardAccessibleName,
  legalDocumentViewLabel,
} from "@/config/legal-document-card";
import {
  LEGAL_PRIVACY_COPY,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import { legalDocumentCardAnalytics } from "@/lib/analytics/legal-document-card-events";
import {
  formatLegalLastUpdated,
  formatLegalVersionLabel,
} from "@/utils/legal-privacy-screen";
import { cn } from "@/utils/cn";

const DOCUMENT_ICONS: Record<LegalDocumentSlug, LucideIcon> = {
  terms: FileText,
  privacy: Shield,
  cookies: Cookie,
  "acceptable-use": Scale,
  "data-processing": Database,
};

export type LegalDocumentCardProps = {
  slug: LegalDocumentSlug;
  title: string;
  description?: string;
  version: string;
  lastUpdatedIso: string;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  viewLabel?: string;
  href?: string;
  onView?: (slug: LegalDocumentSlug) => void;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * COMPONENT-067 — Legal Document Card.
 * Hub tile for one legal document — mock metadata only; no backend.
 */
export function LegalDocumentCard({
  slug,
  title,
  description,
  version,
  lastUpdatedIso,
  active = false,
  disabled = false,
  loading = false,
  viewLabel,
  href,
  onView,
  icon,
  className,
}: LegalDocumentCardProps) {
  const Icon = DOCUMENT_ICONS[slug];
  const titleId = `legal-doc-card-title-${slug}`;
  const descId = `legal-doc-card-desc-${slug}`;
  const metaId = `legal-doc-card-meta-${slug}`;
  const versionLabel = formatLegalVersionLabel(version);
  const lastUpdatedLabel = `${LEGAL_PRIVACY_COPY.lastUpdatedPrefix}: ${formatLegalLastUpdated(lastUpdatedIso)}`;
  const actionLabel = viewLabel ?? legalDocumentViewLabel(title);
  const targetHref = href ?? `/legal/${slug}`;

  const handleActivate = () => {
    if (disabled || loading) return;
    legalDocumentCardAnalytics.opened({ documentSlug: slug, version });
    onView?.(slug);
  };

  if (loading) {
    return (
      <Card variant="default" padding="md" className={cn("w-full", className)}>
        <CardContent className="gap-sm">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-11 w-28" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      variant={active ? "elevated" : "default"}
      padding="md"
      className={cn(
        "flex h-full w-full flex-col",
        active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        disabled && "opacity-60",
        className,
      )}
      aria-labelledby={titleId}
      aria-describedby={`${descId} ${metaId}`}
    >
      <CardContent className="flex-1 gap-sm">
        <div className="flex items-start gap-sm">
          <span
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"
            aria-hidden
          >
            {icon ?? <Icon className="size-4" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1 space-y-xs">
            <CardTitle id={titleId} as="h3" className="text-body-sm">
              {title}
            </CardTitle>
            {description ? (
              <CardSubtitle id={descId} className="line-clamp-3">
                {description}
              </CardSubtitle>
            ) : null}
          </div>
        </div>

        <div id={metaId} className="flex flex-col gap-xs">
          <Caption className="font-semibold text-foreground">
            {versionLabel}
          </Caption>
          <BodySmall className="text-muted-foreground">
            {lastUpdatedLabel}
          </BodySmall>
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-0">
        {onView ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled}
            aria-label={legalDocumentCardAccessibleName(title, versionLabel)}
            aria-current={active ? "page" : undefined}
            onClick={handleActivate}
          >
            {actionLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled}
            asChild
          >
            <Link
              href={targetHref}
              aria-label={legalDocumentCardAccessibleName(title, versionLabel)}
              aria-current={active ? "page" : undefined}
              onClick={handleActivate}
            >
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
