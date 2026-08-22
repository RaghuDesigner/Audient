"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BodySmall, Caption } from "@/components/ui/typography";
import { INVOICE_HISTORY_COPY } from "@/config/invoice-history";
import type { InvoiceStatus } from "@/config/invoice-history";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  invoiceCycleLabel,
  invoicePlanLabel,
  invoiceStatusLabel,
  type InvoiceHistoryRecord,
} from "@/utils/invoice-history";

export type InvoiceDetailsModalProps = {
  invoice: InvoiceHistoryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (invoice: InvoiceHistoryRecord) => void;
};

function statusBadgeVariant(
  status: InvoiceStatus,
): "success" | "warning" | "error" | "neutral" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "error";
  return "neutral";
}

function DetailRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-md">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall
        className={
          emphasize
            ? "text-right font-semibold text-foreground"
            : "text-right text-foreground"
        }
      >
        {value}
      </BodySmall>
    </div>
  );
}

/**
 * Invoice details dialog — View Invoice.
 * Mock fields only; PDF remains a placeholder action.
 */
export function InvoiceDetailsModal({
  invoice,
  open,
  onOpenChange,
  onDownload,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      scrollable
      title={INVOICE_HISTORY_COPY.detailsTitle}
      description={invoice.invoiceNumber}
      showCloseButton
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {INVOICE_HISTORY_COPY.detailsClose}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onDownload(invoice)}
          >
            {INVOICE_HISTORY_COPY.downloadPdf}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-md">
        <div className="flex flex-wrap items-center gap-sm">
          <Badge
            variant={statusBadgeVariant(invoice.status)}
            size="sm"
            shape="rounded"
          >
            {invoiceStatusLabel(invoice.status)}
          </Badge>
          <Caption className="text-muted-foreground">
            {formatInvoiceDate(invoice.dateIso)}
          </Caption>
        </div>

        <div className="flex flex-col gap-sm rounded-md border border-border bg-surface p-md">
          <DetailRow
            label={INVOICE_HISTORY_COPY.columnNumber}
            value={invoice.invoiceNumber}
            emphasize
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.columnDate}
            value={formatInvoiceDate(invoice.dateIso)}
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.customer}
            value={
              <span className="block">
                {invoice.customerName}
                <span className="mt-sm block text-muted-foreground">
                  {invoice.customerEmail}
                </span>
              </span>
            }
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.columnPlan}
            value={invoicePlanLabel(invoice.plan)}
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.columnCycle}
            value={invoiceCycleLabel(invoice.cycle)}
          />
        </div>

        <div className="flex flex-col gap-sm rounded-md border border-border bg-surface p-md">
          <DetailRow
            label={INVOICE_HISTORY_COPY.subtotal}
            value={formatInvoiceMoney(invoice.subtotalCents)}
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.discount}
            value={
              invoice.discountCents > 0
                ? `−${formatInvoiceMoney(invoice.discountCents)}`
                : formatInvoiceMoney(0)
            }
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.tax}
            value={formatInvoiceMoney(invoice.taxCents)}
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.total}
            value={formatInvoiceMoney(invoice.totalCents)}
            emphasize
          />
          <DetailRow
            label={INVOICE_HISTORY_COPY.paymentStatus}
            value={invoiceStatusLabel(invoice.status)}
          />
        </div>
      </div>
    </Modal>
  );
}
