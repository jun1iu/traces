import type { Transition } from "motion/react";

/**
 * Metadata for the colour tokens defined in src/app/globals.css.
 * The CSS is the source of the values. This file is the source of names
 * and intent, and it powers the /tokens page.
 */
export const colorTokens = [
  { name: "background", role: "Page canvas" },
  { name: "surface", role: "Cards, inputs, raised elements" },
  { name: "surface-hover", role: "Hover state for surfaces and ghost buttons" },
  { name: "border", role: "Hairlines and dividers" },
  { name: "foreground", role: "Primary text and icons" },
  { name: "muted", role: "Secondary text, captions" },
  { name: "accent", role: "Primary actions, selected states" },
  { name: "accent-hover", role: "Hover state for accent" },
  { name: "accent-foreground", role: "Text on accent" },
  { name: "danger", role: "Destructive actions, errors" },
  { name: "ring", role: "Focus indicator" },
  { name: "success", role: "Passed status icon (always paired with a label)" },
  { name: "span-llm", role: "Model call in a trace (data viz slot 1)" },
  { name: "span-tool", role: "Tool call in a trace (data viz slot 2)" },
  { name: "span-retrieval", role: "Retrieval in a trace (data viz slot 3)" },
] as const;

export type ColorToken = (typeof colorTokens)[number]["name"];

/** Durations in seconds (Motion's unit). */
export const durations = {
  instant: 0.08,
  fast: 0.15,
  base: 0.24,
  slow: 0.4,
} as const;

/** Named motion presets, so interactions feel like one system. */
export const springs = {
  /** Toggles, indicators: quick and settled, no visible overshoot. */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  /** Press feedback: very short and firm. */
  press: { type: "spring", stiffness: 800, damping: 40 },
  /** Larger surfaces entering: softer. */
  gentle: { type: "spring", stiffness: 260, damping: 30 },
} as const satisfies Record<string, Transition>;
