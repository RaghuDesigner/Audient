import { Caption } from "@/components/ui/typography";
import { cn } from "@/utils/cn";

export type CreditsBadgeProps = {
  /** Display value — Screen1 guest teaser is 100. */
  value?: number;
  className?: string;
};

/**
 * Header credits teaser (Screen1) — label + bold primary value.
 */
export function CreditsBadge({ value = 100, className }: CreditsBadgeProps) {
  return (
    <div
      className={cn("flex flex-col items-center leading-none", className)}
      aria-label={`Credits: ${value}`}
    >
      <Caption className="text-muted-foreground">Credits</Caption>
      <span className="mt-px text-body-sm font-bold text-secondary sm:text-body">
        {value}
      </span>
    </div>
  );
}
