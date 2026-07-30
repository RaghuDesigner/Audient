/**
 * Centralized, static app configuration.
 * Business constants (plan catalog, credit costs, nav) live in this layer as
 * data — see docs/FOLDER_STRUCTURE.md (src/config).
 */
export const siteConfig = {
  name: "Audient",
  description:
    "AI-powered UX audits that help small businesses fix the user-experience problems hurting their conversions.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
