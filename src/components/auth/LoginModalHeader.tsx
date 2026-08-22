"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

export type LoginModalHeaderProps = {
  title?: string;
  description?: string;
  className?: string;
};

const DEFAULT_TITLE = "Unlock the Full Power of Audient";
const DEFAULT_DESCRIPTION =
  "Sign in to save your UX audits, manage credits, track improvement history, generate PDF reports, and access premium AI-powered recommendations.";

/**
 * COMPONENT-002 header — visible title + supporting copy above OAuth buttons.
 */
export function LoginModalHeader({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  className,
}: LoginModalHeaderProps) {
  return (
    <DialogHeader className={cn("gap-sm", className)}>
      <DialogTitle className="text-body-sm font-semibold text-foreground sm:text-body">
        {title}
      </DialogTitle>
      <DialogDescription className="text-info text-muted-foreground sm:text-body-sm">
        {description}
      </DialogDescription>
    </DialogHeader>
  );
}
