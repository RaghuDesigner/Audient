"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import { INVOICE_HISTORY_COPY } from "@/config/invoice-history";
import type { InvoiceStatus } from "@/config/invoice-history";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  invoiceActionAriaLabel,
  invoiceCycleLabel,
  invoicePlanLabel,
  invoiceStatusLabel,
  type InvoiceHistoryRecord,
} from "@/utils/invoice-history";
import { cn } from "@/utils/cn";

export type InvoiceHistoryTableProps = {
  invoices: readonly InvoiceHistoryRecord[];
  onView: (invoice: InvoiceHistoryRecord) => void;
  onDownload: (invoice: InvoiceHistoryRecord) => void;
  className?: string;
};

function statusBadgeVariant(
  status: InvoiceStatus,
): "success" | "warning" | "error" | "neutral" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "error";
  return "neutral";
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      variant={statusBadgeVariant(status)}
      size="sm"
      shape="rounded"
    >
      {invoiceStatusLabel(status)}
    </Badge>
  );
}

function InvoiceRowActions({
  invoice,
  onView,
  onDownload,
}: {
  invoice: InvoiceHistoryRecord;
  onView: (invoice: InvoiceHistoryRecord) => void;
  onDownload: (invoice: InvoiceHistoryRecord) => void;
}) {
  return (
    <div className="flex flex-wrap gap-sm">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onView(invoice)}
        aria-label={invoiceActionAriaLabel("view", invoice.invoiceNumber)}
      >
        {INVOICE_HISTORY_COPY.viewInvoice}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDownload(invoice)}
        aria-label={invoiceActionAriaLabel("download", invoice.invoiceNumber)}
      >
        {INVOICE_HISTORY_COPY.downloadPdf}
      </Button>
    </div>
  );
}

function thClass(extra?: string) {
  return cn(
    "px-sm py-md text-caption font-semibold text-muted-foreground",
    extra,
  );
}

/**
 * Invoice list — desktop table + mobile cards.
 * Mock data only; no PDF generation.
 */
export function InvoiceHistoryTable({
  invoices,
  onView,
  onDownload,
  className,
}: InvoiceHistoryTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <ul
        className="flex flex-col gap-md md:hidden"
        aria-label={INVOICE_HISTORY_COPY.listRegion}
      >
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <article className="rounded-md border border-border bg-surface p-md shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-sm">
                <div>
                  <BodySmall className="font-semibold text-foreground">
                    {invoice.invoiceNumber}
                  </BodySmall>
                  <Caption className="mt-sm block text-muted-foreground">
                    {formatInvoiceDate(invoice.dateIso)}
                  </Caption>
                </div>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <dl className="mt-md grid gap-sm">
                <div className="flex justify-between gap-sm">
                  <Caption className="text-muted-foreground">
                    {INVOICE_HISTORY_COPY.columnPlan}
                  </Caption>
                  <BodySmall className="text-foreground">
                    {invoicePlanLabel(invoice.plan)}
                  </BodySmall>
                </div>
                <div className="flex justify-between gap-sm">
                  <Caption className="text-muted-foreground">
                    {INVOICE_HISTORY_COPY.columnCycle}
                  </Caption>
                  <BodySmall className="text-foreground">
                    {invoiceCycleLabel(invoice.cycle)}
                  </BodySmall>
                </div>
                <div className="flex justify-between gap-sm">
                  <Caption className="text-muted-foreground">
                    {INVOICE_HISTORY_COPY.columnAmount}
                  </Caption>
                  <BodySmall className="font-semibold text-foreground">
                    {formatInvoiceMoney(invoice.totalCents)}
                  </BodySmall>
                </div>
              </dl>
              <div className="mt-md">
                <InvoiceRowActions
                  invoice={invoice}
                  onView={onView}
                  onDownload={onDownload}
                />
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <caption className="sr-only">
            {INVOICE_HISTORY_COPY.listRegion}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnNumber}
              </th>
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnDate}
              </th>
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnPlan}
              </th>
              <th scope="col" className={thClass("hidden lg:table-cell")}>
                {INVOICE_HISTORY_COPY.columnCycle}
              </th>
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnAmount}
              </th>
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnStatus}
              </th>
              <th scope="col" className={thClass()}>
                {INVOICE_HISTORY_COPY.columnActions}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-sm py-md">
                  <BodySmall className="font-semibold text-foreground">
                    {invoice.invoiceNumber}
                  </BodySmall>
                </td>
                <td className="px-sm py-md">
                  <BodySmall className="text-foreground">
                    {formatInvoiceDate(invoice.dateIso)}
                  </BodySmall>
                </td>
                <td className="px-sm py-md">
                  <BodySmall className="text-foreground">
                    {invoicePlanLabel(invoice.plan)}
                  </BodySmall>
                </td>
                <td className="hidden px-sm py-md lg:table-cell">
                  <BodySmall className="text-foreground">
                    {invoiceCycleLabel(invoice.cycle)}
                  </BodySmall>
                </td>
                <td className="px-sm py-md">
                  <BodySmall className="font-semibold text-foreground">
                    {formatInvoiceMoney(invoice.totalCents)}
                  </BodySmall>
                </td>
                <td className="px-sm py-md">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-sm py-md">
                  <InvoiceRowActions
                    invoice={invoice}
                    onView={onView}
                    onDownload={onDownload}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
