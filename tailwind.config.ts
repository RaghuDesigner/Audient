import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Audient design system — generated from docs/DESIGN_TOKENS.md (Figma = source
 * of truth). Documented values (colors, typography, spacing, radius) are
 * transcribed exactly; a small set of neutral/UI tokens required by shadcn/ui
 * is derived and marked below. Colors resolve from RGB-channel CSS variables
 * (see src/app/globals.css) via `rgb(var(--token) / <alpha-value>)`, which
 * preserves the exact hex values while supporting opacity modifiers.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ---------------------------------------------------------------- Colors
      colors: {
        // Documented (DESIGN_TOKENS.md)
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },

        // Derived (required by shadcn/ui; not in DESIGN_TOKENS.md)
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",

        // Audit severity (Critical=Error, Major=Warning, Minor derived)
        severity: {
          critical: "rgb(var(--severity-critical) / <alpha-value>)",
          major: "rgb(var(--severity-major) / <alpha-value>)",
          minor: "rgb(var(--severity-minor) / <alpha-value>)",
        },
      },

      // ------------------------------------------------------------ Typography
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // Sizes + weights transcribed exactly from DESIGN_TOKENS.md.
      fontSize: {
        info: ["12px", { fontWeight: "400" }], // infoBody
        "body-sm": ["18px", { fontWeight: "400" }], // smallBody
        body: ["24px", { fontWeight: "400" }], // Body
        "body-lg": ["32px", { fontWeight: "400" }], // Body large
        h2: ["40px", { fontWeight: "600" }], // Heading 2
        h1: ["48px", { fontWeight: "700" }], // Heading 1
      },

      // --------------------------------------------------------------- Spacing
      // Design-system spacing scale (DESIGN_TOKENS.md) — Tailwind defaults kept.
      spacing: {
        sm: "8px",
        md: "16px",
        lg: "24px",
      },

      // ---------------------------------------------------------------- Radius
      borderRadius: {
        none: "0px",
        sm: "4px", // Small
        md: "8px", // Medium
        lg: "16px", // Large
        full: "9999px",
      },

      // --------------------------------------------------------- Shadows (std)
      boxShadow: {
        none: "none",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },

      // ------------------------------------------------------------ Animations
      transitionDuration: {
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.15s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
