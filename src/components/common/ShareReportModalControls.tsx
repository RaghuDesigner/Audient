"use client";

import { Caption } from "@/components/ui/typography";
import type {
  ShareReportPermission,
  ShareReportShareOption,
} from "@/config/share-report-modal";
import type {
  ShareReportOptionAvailability,
  ShareReportPermissionAvailability,
} from "@/utils/share-report-modal";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

export function ShareOptionChip({
  option,
  selected,
  onSelect,
}: {
  option: ShareReportOptionAvailability;
  selected: boolean;
  onSelect: (option: ShareReportShareOption) => void;
}) {
  const selectable = option.enabled || option.option === "organization" || option.option === "team";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!selectable}
      title={option.hint ?? undefined}
      onClick={() => onSelect(option.option)}
      className={cn(
        "min-h-11 rounded-md border px-md text-body-sm font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-surface text-foreground hover:border-border/80",
        !selectable && "opacity-50",
      )}
    >
      {option.label}
    </button>
  );
}

export function SharePermissionRow({
  item,
  selected,
  onSelect,
}: {
  item: ShareReportPermissionAvailability;
  selected: boolean;
  onSelect: (permission: ShareReportPermission) => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-sm rounded-md border border-border p-md",
        !item.enabled && "cursor-not-allowed opacity-70",
      )}
    >
      <input
        type="radio"
        className="mt-1"
        name="share-permission"
        value={item.permission}
        checked={selected}
        disabled={!item.enabled}
        onChange={() => {
          if (item.enabled) onSelect(item.permission);
        }}
      />
      <span className="min-w-0">
        <span className="block text-body-sm font-semibold text-foreground">
          {item.label}
        </span>
        {item.hint ? (
          <Caption className="mt-sm text-muted-foreground">{item.hint}</Caption>
        ) : null}
      </span>
    </label>
  );
}

export function SharePlaceholderAction({
  hint,
  label,
  onClick,
}: {
  hint: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-dashed border-border bg-muted/40 p-md">
      <Caption className="text-muted-foreground">{hint}</Caption>
      <Button type="button" variant="outline" size="sm" onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}
