"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { BodySmall, H1 } from "@/components/ui/typography";
import { ERROR_SYSTEM_COPY } from "@/config/error-system-states";
import { generateMockErrorId } from "@/utils/error-system-states";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Root error boundary fallback — minimal self-contained shell.
 * Used when the root layout itself fails; cannot rely on app providers.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorId = React.useMemo(
    () => generateMockErrorId(error.digest ?? "global-error"),
    [error.digest],
  );

  return (
    <html lang="en">
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <main
          className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-md px-md py-xl text-center"
          role="alert"
          aria-live="assertive"
        >
          <H1 className="text-body font-bold sm:text-body-lg">
            Something went wrong
          </H1>
          <BodySmall className="text-muted-foreground">
            We couldn&apos;t complete your request.
          </BodySmall>
          <BodySmall className="text-muted-foreground">
            {ERROR_SYSTEM_COPY.errorIdLabel}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {errorId}
            </span>
          </BodySmall>
          <Button
            type="button"
            variant="primary"
            className="min-h-11"
            onClick={() => reset()}
          >
            {ERROR_SYSTEM_COPY.actionTryAgain}
          </Button>
        </main>
      </body>
    </html>
  );
}
