"use client";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "umnord-theme";

function applyTheme(t: Theme) {
  const html = document.documentElement;
  if (t === "light") html.dataset.theme = "light";
  else delete html.dataset.theme;
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark") stored = raw;
    } catch {}
    const initial: Theme = stored ?? "dark";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Lülita hele teema" : "Lülita tume teema"
      }
      className="theme-toggle grid place-items-center rounded-full border border-white/15 text-white/55 transition hover:text-white hover:border-white/30"
      style={{
        height: "3.4cqh",
        width: "3.4cqh",
        fontSize: "1.6cqh",
      }}
      suppressHydrationWarning
    >
      {/* Render a placeholder until mounted so SSR matches client */}
      {mounted ? (
        theme === "dark" ? (
          // sun
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // moon
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )
      ) : (
        <span style={{ width: "1em", height: "1em" }} />
      )}
    </button>
  );
}
