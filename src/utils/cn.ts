import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Design-system fontSize keys from tailwind.config.ts.
 * Without registering them, tailwind-merge treats utilities like
 * `text-body-sm` as text-color classes and incorrectly strips
 * `text-primary-foreground` (and other color utilities) when both
 * appear on the same element — e.g. Button primary + size md.
 */
const FONT_SIZE_TOKENS = [
  "info",
  "body-sm",
  "body",
  "body-lg",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "caption",
  "overline",
  "code",
  "display",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZE_TOKENS] }],
    },
  },
});

/**
 * Merge conditional class names and resolve Tailwind class conflicts.
 * Used by shadcn/ui primitives and all component variants.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
