"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The selected run lives in the URL (?run=run_00042), so a link opens the same
 * run and the back button behaves. The server renders with no selection.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

const read = () => new URLSearchParams(window.location.search).get("run");

export function useRunParam() {
  const value = useSyncExternalStore(subscribe, read, () => null);
  const set = useCallback((id: string) => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("run") === id) return;
    url.searchParams.set("run", id);
    window.history.replaceState(window.history.state, "", url);
    listeners.forEach((l) => l());
  }, []);
  return [value, set] as const;
}
