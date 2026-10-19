export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Shared by the inline bootstrap script and the theme provider. */
export const THEME_STORAGE_KEY = "rescuebite-theme";

const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

export const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Runs synchronously in <head> before the first paint so the stored theme is
 * applied without a flash. The key is inlined so this string can never drift
 * from THEME_STORAGE_KEY.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=null;try{t=window.localStorage.getItem(k)}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia(${JSON.stringify(PREFERS_DARK_QUERY)}).matches?"dark":"light"}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t}catch(e){}})();`;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // storage unavailable (private mode, blocked) — fall back to system
  }
  return "system";
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

/** Mirrors what the bootstrap script does, for changes made after hydration. */
export function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
