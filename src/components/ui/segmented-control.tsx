"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/cn";
import { springs } from "@/tokens/tokens";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  /** Required: a segmented control has no visible group label. */
  "aria-label": string;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A single-choice control (WAI-ARIA radio group).
 * Arrow keys move and select, Home/End jump, and only the selected option is a
 * Tab stop. The selection indicator is one shared element that glides between
 * options.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const [selected, setSelected] = useControllableState<T>({
    value,
    defaultValue: defaultValue ?? options[0].value,
    onChange: onValueChange,
  });
  const indicatorId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = options.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-lg border border-border bg-surface-hover p-0.5",
        className,
      )}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setSelected(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative rounded-md font-medium transition-colors duration-150",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3.5 text-sm",
              isSelected ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {isSelected && (
              <motion.span
                layoutId={indicatorId}
                aria-hidden
                className="absolute inset-0 rounded-md bg-surface shadow-sm ring-1 ring-border"
                transition={springs.snappy}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
