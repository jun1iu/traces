"use client";

import { useSyncExternalStore } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { getTheme, setTheme, subscribeTheme, type ThemePreference } from "@/lib/theme";

const options = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies readonly { value: ThemePreference; label: string }[];

export function ThemeToggle() {
  // The server renders "system". The client switches to the saved preference after hydration.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "system" as const);

  return (
    <SegmentedControl
      aria-label="Colour theme"
      size="sm"
      options={options}
      value={theme}
      onValueChange={setTheme}
    />
  );
}
