"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { formatMs, formatTime } from "@/lib/runs/stats";
import type { Run } from "@/lib/runs/types";
import { StatusIcon, statusLabel } from "./status";

const ROW = 64;
const OVERSCAN = 6;

interface RunListProps {
  runs: readonly Run[];
  activeId: string | null;
  onActivate: (id: string) => void;
  /** Used until the list can measure itself (server render, tests). */
  fallbackHeight?: number;
}

/**
 * A listbox of thousands of runs that only renders the rows in view. It is one Tab
 * stop: arrow keys, j/k, Page Up/Down, Home and End move the selection, and the
 * active row is announced through aria-activedescendant.
 */
export function RunList({ runs, activeId, onActivate, fallbackHeight = 480 }: RunListProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(fallbackHeight);

  useEffect(() => {
    const el = viewport.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setHeight(entry.contentRect.height || fallbackHeight),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallbackHeight]);

  const activeIndex = Math.max(
    0,
    runs.findIndex((r) => r.id === activeId),
  );
  const first = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const last = Math.min(runs.length, Math.ceil((scrollTop + height) / ROW) + OVERSCAN);

  function moveTo(index: number) {
    const i = Math.min(runs.length - 1, Math.max(0, index));
    const run = runs[i];
    if (!run) return;
    onActivate(run.id);
    // Keep the active row in view, scrolling as little as possible.
    const el = viewport.current;
    if (!el) return;
    const top = i * ROW;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + ROW > el.scrollTop + el.clientHeight) el.scrollTop = top + ROW - el.clientHeight;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const page = Math.max(1, Math.floor(height / ROW) - 1);
    const moves: Record<string, number> = {
      ArrowDown: activeIndex + 1,
      j: activeIndex + 1,
      ArrowUp: activeIndex - 1,
      k: activeIndex - 1,
      PageDown: activeIndex + page,
      PageUp: activeIndex - page,
      Home: 0,
      End: runs.length - 1,
    };
    if (!(e.key in moves) || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    moveTo(moves[e.key]);
  }

  if (runs.length === 0) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">
        No runs match these filters.
      </div>
    );
  }

  const active = runs[activeIndex];

  return (
    <div
      ref={viewport}
      role="listbox"
      aria-label={`Runs, ${runs.length.toLocaleString("en-US")} shown`}
      aria-activedescendant={active ? `run-option-${active.id}` : undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <div className="relative" style={{ height: runs.length * ROW }}>
        {runs.slice(first, last).map((run, offset) => {
          const index = first + offset;
          const selected = run.id === active?.id;
          return (
            <div
              key={run.id}
              id={`run-option-${run.id}`}
              role="option"
              aria-selected={selected}
              aria-setsize={runs.length}
              aria-posinset={index + 1}
              onClick={() => moveTo(index)}
              style={{ top: index * ROW, height: ROW }}
              className={cn(
                "absolute inset-x-0 flex cursor-default items-center gap-3 border-b border-border px-4 text-sm",
                selected ? "bg-accent/10" : "hover:bg-surface-hover",
              )}
            >
              {selected && (
                <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden />
              )}
              <StatusIcon status={run.status} />
              <span className="sr-only">{statusLabel(run.status)}, </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{run.task}</span>
                <span className="truncate text-xs text-muted">
                  <span className="font-mono">{run.id}</span> · {formatTime(run.startedAt)}
                </span>
              </span>
              <span className="flex flex-col items-end text-xs tabular-nums">
                <span className="font-medium text-foreground">{formatMs(run.duration)}</span>
                <span className="text-muted">
                  {run.model.replace("claude-", "").replace(/-5-5$/, "")}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
