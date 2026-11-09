"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

interface SplitPaneProps {
  /** "horizontal" puts the panes side by side; "vertical" stacks them. */
  orientation: "horizontal" | "vertical";
  /** Size of the first pane, in percent. */
  defaultSize: number;
  min?: number;
  max?: number;
  /** Names the divider for screen readers, e.g. "Resize run list". */
  label: string;
  first: ReactNode;
  second: ReactNode;
  className?: string;
}

/**
 * Two resizable panes. Drag the divider, or focus it and use the arrow keys
 * (Shift for bigger steps, Home and End for the limits). Below the md breakpoint
 * the panes simply stack, since there is no room to split.
 */
export function SplitPane({
  orientation,
  defaultSize,
  min = 20,
  max = 80,
  label,
  first,
  second,
  className,
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize);
  const container = useRef<HTMLDivElement>(null);
  const horizontal = orientation === "horizontal";
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !container.current) return;
    const rect = container.current.getBoundingClientRect();
    const pct = horizontal
      ? ((e.clientX - rect.left) / rect.width) * 100
      : ((e.clientY - rect.top) / rect.height) * 100;
    setSize(clamp(pct));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 2;
    const less = horizontal ? "ArrowLeft" : "ArrowUp";
    const more = horizontal ? "ArrowRight" : "ArrowDown";
    const next =
      e.key === less
        ? size - step
        : e.key === more
          ? size + step
          : e.key === "Home"
            ? min
            : e.key === "End"
              ? max
              : null;
    if (next === null) return;
    e.preventDefault();
    setSize(clamp(next));
  }

  return (
    <div
      ref={container}
      style={{ "--split": `${size}%` } as CSSProperties}
      className={cn(
        "flex min-h-0 min-w-0 flex-col",
        horizontal ? "md:flex-row" : "md:flex-col",
        className,
      )}
    >
      <div className="min-h-0 min-w-0 shrink-0 md:basis-(--split)">{first}</div>
      <div
        role="separator"
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-label={label}
        aria-valuenow={Math.round(size)}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        className={cn(
          "group relative hidden shrink-0 touch-none outline-none md:block",
          horizontal ? "w-px cursor-col-resize bg-border" : "h-px cursor-row-resize bg-border",
        )}
      >
        {/* A wider invisible hit area, and a highlight on hover and focus. */}
        <span
          className={cn(
            "absolute z-10 transition-colors group-hover:bg-accent/60 group-focus-visible:bg-accent",
            horizontal ? "inset-y-0 -left-[3px] w-[7px]" : "inset-x-0 -top-[3px] h-[7px]",
          )}
        />
      </div>
      <div className="min-h-0 min-w-0 flex-1">{second}</div>
    </div>
  );
}
