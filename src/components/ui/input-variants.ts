import { cva, type VariantProps } from "class-variance-authority";

/**
 * Visual shell for Audient Input — token-driven borders/fills.
 * Shared INP-* rules: Medium radius (8px), Primary focus ring, Error/Success chrome.
 */
export const inputShellVariants = cva(
  [
    "flex w-full items-center gap-sm rounded-md border font-sans",
    "transition-colors duration-fast ease-in-out-smooth",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
    "focus-within:ring-offset-2 focus-within:ring-offset-background",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        filled: "border-transparent bg-muted",
        outline: "border-2 border-primary bg-background",
        error: "border-error bg-background focus-within:ring-error",
        success: "border-success bg-background focus-within:ring-success",
        disabled: "border-input bg-muted opacity-50",
        readonly: "border-input bg-muted/60",
      },
      size: {
        sm: "min-h-11 px-md text-info [&_svg]:size-4",
        md: "min-h-11 px-md text-body-sm [&_svg]:size-5",
        lg: "min-h-12 px-md text-body-sm sm:px-lg sm:text-body [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type InputVariant = NonNullable<
  VariantProps<typeof inputShellVariants>["variant"]
>;
export type InputSize = NonNullable<
  VariantProps<typeof inputShellVariants>["size"]
>;

export function resolveInputVariant(
  variant: InputVariant | null | undefined,
  options: {
    disabled?: boolean;
    readOnly?: boolean;
    hasError?: boolean;
    hasSuccess?: boolean;
  },
): InputVariant {
  if (options.disabled) return "disabled";
  if (options.readOnly) return "readonly";
  if (options.hasError) return "error";
  if (options.hasSuccess) return "success";
  return variant ?? "default";
}
