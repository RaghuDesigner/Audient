import { cva, type VariantProps } from "class-variance-authority";

/**
 * Modal / Dialog content chrome — COMPONENT_MAPPING sizes + intent tones.
 * Radius Large (16px), Surface/card fills, token shadows.
 */
export const dialogContentVariants = cva(
  [
    "relative z-modal flex w-full flex-col border bg-card text-card-foreground",
    "font-sans shadow-lg duration-fast ease-out-expo",
    "data-[state=open]:animate-scale-in",
    "focus:outline-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "max-w-sm rounded-lg p-md sm:p-lg",
        md: "max-w-lg rounded-lg p-md sm:p-lg",
        lg: "max-w-2xl rounded-lg p-md sm:p-lg",
        fullscreen:
          "h-[100dvh] max-w-none rounded-none p-md sm:p-lg md:p-lg",
      },
      variant: {
        default: "border-border",
        confirmation: "border-border",
        warning: "border-warning/40",
        error: "border-error/50",
        success: "border-success/40",
      },
      scrollable: {
        true: "max-h-[min(90dvh,56rem)]",
        false: "",
      },
    },
    compoundVariants: [
      {
        size: "fullscreen",
        scrollable: true,
        class: "max-h-[100dvh]",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "default",
      scrollable: false,
    },
  },
);

export type DialogSize = NonNullable<
  VariantProps<typeof dialogContentVariants>["size"]
>;
export type DialogVariant = NonNullable<
  VariantProps<typeof dialogContentVariants>["variant"]
>;
