"use client";

import * as React from "react";

import { HelpSupportScreen } from "@/components/help/HelpSupportScreen";
import { type HelpSupportScreenState } from "@/config/help-support-screen";
import { getMockHelpSupportBundle } from "@/data/mock-help-support";
import { useAuth } from "@/hooks/use-auth";

export type HelpClientProps = {
  state?: HelpSupportScreenState | null;
};

/**
 * SCREEN-023 client shell — guest + authenticated; mock bundle only.
 */
export function HelpClient({ state = null }: HelpClientProps) {
  const { user, isGuest } = useAuth();
  const [bundle, setBundle] = React.useState(() =>
    getMockHelpSupportBundle({
      state: state ?? undefined,
      emptyRequests: state === "empty-requests",
    }),
  );

  React.useEffect(() => {
    setBundle(
      getMockHelpSupportBundle({
        state: state ?? undefined,
        emptyRequests: state === "empty-requests",
        userId: user?.id,
      }),
    );
  }, [isGuest, state, user?.id]);

  return (
    <HelpSupportScreen
      data={bundle}
      screenState={bundle.state}
      onRetry={() => {
        setBundle(
          getMockHelpSupportBundle({
            state: "success",
            userId: user?.id,
          }),
        );
      }}
    />
  );
}
