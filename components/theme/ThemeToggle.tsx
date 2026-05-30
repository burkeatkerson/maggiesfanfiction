"use client";

import { useTheme } from "./ThemeProvider";

/** Segmented Light/Dark control, ported from homepage.jsx. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const opts: { id: "light" | "dark"; label: string }[] = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <span className="kicker text-[10.5px]">Reading mode</span>
      <div
        role="group"
        aria-label="Color theme"
        className="relative inline-flex rounded-full border border-line bg-canvas p-1"
      >
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-taupe transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: "calc(50% - 4px)", left: theme === "dark" ? "50%" : 4 }}
        />
        {opts.map((o) => {
          const active = theme === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setTheme(o.id)}
              aria-pressed={active}
              className="relative z-10 cursor-pointer rounded-full px-6 py-2 font-meta text-[12.5px] font-semibold tracking-[0.04em] transition-colors"
              style={{
                color: active ? (theme === "dark" ? "#1c1a17" : "#fff") : "var(--ink-muted)",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Compact text toggle used in the admin rail / login. */
export function ThemeToggleLink({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={className ?? "font-meta text-[12.5px] text-ink-muted transition-colors hover:text-taupe"}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
