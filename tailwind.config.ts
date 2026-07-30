import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Audient Tailwind theme — maps design tokens to utilities.
 *
 * Source of truth: docs/DESIGN_TOKENS.md (Figma).
 * CSS variable values: src/styles/tokens.css
 *
 * Documented values are transcribed exactly.
 * Derived values (needed by shadcn / stacking / motion) are marked in tokens.css.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // ---------------------------------------------------------------- Breakpoints
    // Mobile-first (CURSOR_RULES §11). Explicit so the scale is part of the theme.
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem", // 16px — spacing-md on mobile
        lg: "1.5rem", // 24px — spacing-lg on desktop
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ------------------------------------------------------------ Colors
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

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
        error: {
          DEFAULT: "rgb(var(--error) / <alpha-value>)",
          foreground: "rgb(var(--error-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },

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

        severity: {
          critical: "rgb(var(--severity-critical) / <alpha-value>)",
          major: "rgb(var(--severity-major) / <alpha-value>)",
          minor: "rgb(var(--severity-minor) / <alpha-value>)",
        },
      },

      // -------------------------------------------------------- Typography
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      fontWeight: {
        regular: "var(--font-weight-regular)", // 400 — Body*
        semibold: "var(--font-weight-semibold)", // 600 — Heading 2
        bold: "var(--font-weight-bold)", // 700 — Heading 1
      },

      fontSize: {
        info: [
          "var(--font-size-info)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        "body-sm": [
          "var(--font-size-body-sm)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        body: [
          "var(--font-size-body)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        "body-lg": [
          "var(--font-size-body-lg)",
          {
            lineHeight: "var(--line-height-snug)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        h2: [
          "var(--font-size-h2)",
          {
            lineHeight: "var(--line-height-tight)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-tight)",
          },
        ],
        h1: [
          "var(--font-size-h1)",
          {
            lineHeight: "var(--line-height-tight)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--letter-spacing-tighter)",
          },
        ],
        // Derived roles — documented sizes only (see tokens.css)
        display: [
          "var(--font-size-display)",
          {
            lineHeight: "var(--line-height-tight)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--letter-spacing-tighter)",
          },
        ],
        h3: [
          "var(--font-size-h3)",
          {
            lineHeight: "var(--line-height-snug)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-tight)",
          },
        ],
        h4: [
          "var(--font-size-h4)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        h5: [
          "var(--font-size-h5)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        h6: [
          "var(--font-size-h6)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-wide)",
          },
        ],
        caption: [
          "var(--font-size-caption)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
        overline: [
          "var(--font-size-overline)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-wide)",
          },
        ],
        code: [
          "var(--font-size-code)",
          {
            lineHeight: "var(--line-height-normal)",
            fontWeight: "var(--font-weight-regular)",
            letterSpacing: "var(--letter-spacing-normal)",
          },
        ],
      },

      lineHeight: {
        none: "var(--line-height-none)",
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
      },

      letterSpacing: {
        tighter: "var(--letter-spacing-tighter)",
        tight: "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
      },

      // ------------------------------------------------------------ Spacing
      // Design-system scale (8 / 16 / 24). Tailwind numeric scale remains.
      spacing: {
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
      },

      // ------------------------------------------------------ Border radius
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },

      // ------------------------------------------------------------ Shadows
      boxShadow: {
        none: "none",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      // ------------------------------------------------------------ Opacity
      opacity: {
        0: "var(--opacity-0)",
        5: "var(--opacity-5)",
        10: "var(--opacity-10)",
        20: "var(--opacity-20)",
        40: "var(--opacity-40)",
        50: "var(--opacity-50)",
        60: "var(--opacity-60)",
        80: "var(--opacity-80)",
        100: "var(--opacity-100)",
      },

      // ------------------------------------------------------------ Z-index
      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },

      // ------------------------------------------------------- Transitions
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-DEFAULT)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        "in-out-smooth": "var(--ease-in-out-smooth)",
        "out-expo": "var(--ease-out-expo)",
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
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.15s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
        "progress-indeterminate":
          "progress-indeterminate 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
