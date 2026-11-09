export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

/**
 * Runs in <head> before first paint so a saved theme never flashes.
 * "system" is the absence of data-theme, which leaves it to prefers-color-scheme.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function getTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function setTheme(theme: ThemePreference) {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode). The theme still applies for this visit.
  }
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
