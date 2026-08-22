/**
 * Invoice History analytics — SCREEN-017.
 * Dev stub — plan/status/ids only; no full invoice body or tax IDs.
 */

import { INVOICE_HISTORY_ANALYTICS_SOURCES } from "@/config/invoice-history";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(props?: {
  source?: string;
  invoiceId?: string;
  plan?: string;
  status?: string;
}): Props {
  return {
    source: props?.source ?? INVOICE_HISTORY_ANALYTICS_SOURCES.page,
    invoiceId: props?.invoiceId,
    plan: props?.plan,
    status: props?.status,
    mock: true,
  };
}

export const invoiceHistoryAnalytics = {
  /** Screen open — Invoice History Viewed. */
  viewed: (props?: {
    catalogCount?: number;
    source?: string;
  }) => {
    track("invoice_history_viewed", {
      ...base({ source: props?.source }),
      catalogCount: props?.catalogCount,
    });
  },

  /** Search executed / debounced commit — Invoice Search. */
  search: (props: {
    queryLength: number;
    resultCount: number;
    source?: string;
  }) => {
    track("invoice_search", {
      ...base({ source: props.source }),
      queryLength: props.queryLength,
      resultCount: props.resultCount,
      // never send raw query text (may match invoice/customer strings)
    });
  },

  /** Filter applied — Invoice Filter Used. */
  filterUsed: (props: {
    filterType: "status" | "plan" | "date" | "clear";
    value?: string;
    resultCount?: number;
    source?: string;
  }) => {
    track("invoice_filter_used", {
      ...base({ source: props.source }),
      filterType: props.filterType,
      value: props.value,
      resultCount: props.resultCount,
    });
  },

  /** View Invoice / details open — Invoice Viewed. */
  invoiceViewed: (props: {
    invoiceId: string;
    plan?: string;
    status?: string;
    source?: string;
  }) => {
    track("invoice_viewed", base(props));
  },

  /** Download PDF placeholder click — Invoice Download Clicked. */
  downloadClicked: (props: {
    invoiceId: string;
    plan?: string;
    status?: string;
    source?: string;
  }) => {
    track("invoice_download_clicked", {
      ...base(props),
      placeholder: true,
    });
  },
};
