"use client";

import { Check, Minus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  PLAN_COMPARISON_TABLE_COPY,
  type PlanComparisonTableVariant,
} from "@/config/plan-comparison-table";
import type {
  PlanComparisonCell,
  PlanComparisonColumnId,
} from "@/config/plan-comparison";
import { planComparisonTableColumns } from "@/utils/plan-comparison-table";
import { cn } from "@/utils/cn";

export function PlanComparisonCellValue({
  cell,
  columnId,
}: {
  cell: PlanComparisonCell;
  columnId: PlanComparisonColumnId;
}) {
  switch (cell.kind) {
    case "check":
      return (
        <span
          className="inline-flex text-success"
          aria-label={`Included in ${columnId}`}
        >
          <Check className="size-4 shrink-0" aria-hidden />
        </span>
      );
    case "dash":
      return (
        <span
          className="inline-flex text-muted-foreground"
          aria-label={`Not included in ${columnId}`}
        >
          <Minus className="size-4 shrink-0" aria-hidden />
        </span>
      );
    case "coming_soon":
      return (
        <span className="font-semibold text-secondary">
          {PLAN_COMPARISON_TABLE_COPY.comingSoon}
        </span>
      );
    case "text":
      return <span className="text-foreground">{cell.value}</span>;
  }
}

export function PlanComparisonTableLoading({
  variant = "page",
  className,
}: {
  variant?: PlanComparisonTableVariant;
  className?: string;
}) {
  const columns = planComparisonTableColumns(variant);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border p-md",
        className,
      )}
      aria-busy="true"
      aria-label={PLAN_COMPARISON_TABLE_COPY.loadingLabel}
    >
      <div className="flex gap-md">
        <Skeleton className="h-16 w-28 shrink-0" />
        {columns.map((id) => (
          <Skeleton key={id} className="h-16 min-w-[8.5rem] flex-1" />
        ))}
      </div>
      <div className="mt-md flex flex-col gap-sm">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
