/**
 * Pagination analytics — COMPONENT-025.
 * Dev stub — fire only on user-driven changes (not mount).
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const paginationAnalytics = {
  pageChanged: (props: {
    module: string;
    page: number;
    pageSize: number;
    totalPages: number;
  }) => track("page_changed", props),

  itemsPerPageChanged: (props: {
    module: string;
    pageSize: number;
    previousPageSize: number;
  }) => track("items_per_page_changed", props),
};
