"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  /** Resolved visual theme. Until dark tokens exist, always `"light"`. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  /** True when a designed dark palette is available. */
  darkPaletteReady: boolean;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "audient-theme";

/**
 * Dark mode policy (ACCESSIBILITY.md §25 / DESIGN_TOKENS.md):
 * Figma is light-only — do not invent a dark skin.
 * Provider stores preference + `data-theme` for future tokens;
 * visual output stays light until `darkPaletteReady` is flipped.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  darkPaletteReady = false,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  darkPaletteReady?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const systemDark = useSystemDark(mounted);

  const prefersDark =
    theme === "dark" || (theme === "system" && systemDark);

  const resolvedTheme: "light" | "dark" =
    darkPaletteReady && prefersDark ? "dark" : "light";

  React.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [theme, resolvedTheme, mounted]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, darkPaletteReady }),
    [theme, resolvedTheme, setTheme, darkPaletteReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function useSystemDark(enabled: boolean): boolean {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDark(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [enabled]);
  return dark;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
