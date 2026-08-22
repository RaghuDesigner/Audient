/**
 * Terms Checkbox analytics — COMPONENT-037.
 * Dev stub — context + legal versions only; no PII.
 */

import type { TermsCheckboxContext } from "@/config/terms-checkbox";
import { TERMS_CHECKBOX_LEGAL } from "@/config/terms-checkbox";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const termsCheckboxAnalytics = {
  /** Checkbox transitions to checked — Terms Accepted. */
  termsAccepted: (props: {
    context?: TermsCheckboxContext | string;
    termsVersion?: string;
    privacyVersion?: string;
  }) =>
    track("terms_accepted", {
      context: props.context ?? "checkout",
      termsVersion: props.termsVersion ?? TERMS_CHECKBOX_LEGAL.termsVersion,
      privacyVersion:
        props.privacyVersion ?? TERMS_CHECKBOX_LEGAL.privacyVersion,
    }),

  /** Checkbox transitions checked → unchecked — Terms Rejected. */
  termsRejected: (props: {
    context?: TermsCheckboxContext | string;
    termsVersion?: string;
    privacyVersion?: string;
  }) =>
    track("terms_rejected", {
      context: props.context ?? "checkout",
      termsVersion: props.termsVersion ?? TERMS_CHECKBOX_LEGAL.termsVersion,
      privacyVersion:
        props.privacyVersion ?? TERMS_CHECKBOX_LEGAL.privacyVersion,
    }),
};
