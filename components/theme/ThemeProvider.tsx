"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "maggie-theme";

/** Apply theme to <html>: data-theme attribute + the page background var. */
function apply(theme: Theme) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.style.setProperty("--bg-body", theme === "dark" ? "#141210" : "#ffffff");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialised to "light" for SSR; the inline no-flash script + this effect
  // reconcile to the stored value on mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "light";
    setThemeState(stored);
    apply(stored);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * Inline script string applied before paint to avoid a light->dark flash.
 * Rendered in the document <head> via a <script dangerouslySetInnerHTML>.
 */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')||'light';var e=document.documentElement;e.setAttribute('data-theme',t);e.style.setProperty('--bg-body',t==='dark'?'#141210':'#ffffff');}catch(e){}})();`;
