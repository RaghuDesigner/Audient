/**
 * Shared layout spacing — documented scale 8 / 16 / 24 (DESIGN_TOKENS).
 */
export type SpacingToken = "none" | "sm" | "md" | "lg";

export const spacingClassName: Record<SpacingToken, string> = {
  none: "gap-0",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
};

export const spaceYClassName: Record<SpacingToken, string> = {
  none: "space-y-0",
  sm: "space-y-sm",
  md: "space-y-md",
  lg: "space-y-lg",
};

export const paddingYClassName: Record<SpacingToken, string> = {
  none: "py-0",
  sm: "py-sm",
  md: "py-md",
  lg: "py-lg",
};

export const sizeClassName: Record<Exclude<SpacingToken, "none">, string> = {
  sm: "size-sm",
  md: "size-md",
  lg: "size-lg",
};
