"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { formatMs } from "@/lib/runs/stats";
import type { Run, Span, SpanKind } from "@/lib/runs/types";

export const kindStyles: Record<SpanKind, { label: string; bar: string; dot: string }> = {
  agent: { label: "Agent", bar: "bg-muted/45", dot: "bg-muted" },
  llm: { label: "LLM", bar: "bg-span-llm", dot: "bg-span-llm" },
  tool: { label: "Tool", bar: "bg-span-tool", dot: "bg-span-tool" },
  retrieval: { label: "Retrieval", bar: "bg-span-retrieval", dot: "bg-span-retrieval" },
};

interface Row {
  span: Span;
  depth: number;
  hasChildren: boolean;
  posinset: number;
  setsize: number;
}

/** Depth-first rows in start order, skipping the children of collapsed spans. */
function flatten(spans: readonly Span[], collapsed: ReadonlySet<string>): Row[] {
  const children = new Map<string | null, Span[]>();
  for (const s of spans) children.set(s.parentId, [...(children.get(s.parentId) ?? []), s]);
  for (const list of children.values()) list.sort((a, b) => a.start - b.start);
  const rows: Row[] = [];
  const walk = (parentId: string | null, depth: number) => {
    const list = children.get(parentId) ?? [];
    list.forEach((span, i) => {
      const kids = children.get(span.id) ?? [];
      rows.push({
        span,
        depth,
        hasChildren: kids.length > 0,
        posinset: i + 1,
        setsize: list.length,
      });
      if (kids.length && !collapsed.has(span.id)) walk(span.id, depth + 1);
    });
  };
  walk(null, 1);
  return rows;
}

const TICKS = [0, 0.25, 0.5, 0.75, 1];

interface SpanTreeProps {
  run: Run;
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * The run's steps as a tree (left) beside a timeline of when each ran (right).
 * Keyboard follows the WAI-ARIA tree pattern: Up/Down move, Right expands or goes
 * to the first child, Left collapses or goes to the parent, Home/End jump.
 */
export function SpanTree({ run, selectedId, onSelect }: SpanTreeProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const rows = useMemo(() => flatten(run.spans, collapsed), [run.spans, collapsed]);
  const total = run.duration;
  const index = Math.max(
    0,
    rows.findIndex((r) => r.span.id === selectedId),
  );

  const setOpen = (id: string, open: boolean) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggle = (id: string) => setOpen(id, collapsed.has(id));

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const row = rows[index];
    if (!row) return;
    const go = (i: number) => {
      const target = rows[Math.min(rows.length - 1, Math.max(0, i))];
      if (target) {
        onSelect(target.span.id);
        document
          .getElementById(`span-${run.id}-${target.span.id}`)
          ?.scrollIntoView({ block: "nearest" });
      }
    };
    const open = row.hasChildren && !collapsed.has(row.span.id);
    switch (e.key) {
      case "ArrowDown":
        go(index + 1);
        break;
      case "ArrowUp":
        go(index - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(rows.length - 1);
        break;
      case "ArrowRight":
        if (row.hasChildren && !open) setOpen(row.span.id, true);
        else if (open) go(index + 1);
        break;
      case "ArrowLeft":
        if (open) setOpen(row.span.id, false);
        else if (row.span.parentId) onSelect(row.span.parentId);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  return (
    <div className="flex h-full min-h-0 flex-col text-sm">
      {/* Time axis */}
      <div className="grid grid-cols-[minmax(150px,36%)_1fr] border-b border-border text-[11px] text-muted tabular-nums">
        <div className="px-4 py-1.5">Step</div>
        <div className="relative mr-14 py-1.5" aria-hidden>
          {TICKS.map((t) => (
            <span
              key={t}
              className={cn(
                "absolute top-1.5",
                t === 0 ? "left-0" : t === 1 ? "right-0" : "-translate-x-1/2",
              )}
              style={t > 0 && t < 1 ? { left: `${t * 100}%` } : undefined}
            >
              {formatMs(total * t)}
            </span>
          ))}
        </div>
      </div>

      <div
        role="tree"
        aria-label={`Steps in ${run.id}`}
        aria-activedescendant={rows[index] ? `span-${run.id}-${rows[index].span.id}` : undefined}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {rows.map(({ span, depth, hasChildren, posinset, setsize }) => {
          const selected = span.id === rows[index]?.span.id;
          const left = (span.start / total) * 100;
          const width = Math.max(0.6, (span.duration / total) * 100);
          const kind = kindStyles[span.kind];
          const labelAfter = left + width < 78;
          return (
            <div
              key={span.id}
              id={`span-${run.id}-${span.id}`}
              role="treeitem"
              aria-level={depth}
              aria-posinset={posinset}
              aria-setsize={setsize}
              aria-selected={selected}
              aria-expanded={hasChildren ? !collapsed.has(span.id) : undefined}
              onClick={() => onSelect(span.id)}
              className={cn(
                "grid cursor-default grid-cols-[minmax(150px,36%)_1fr] items-center",
                selected ? "bg-accent/10" : "hover:bg-surface-hover",
              )}
            >
              <div
                className="flex min-w-0 items-center gap-1.5 py-1.5 pr-2"
                style={{ paddingLeft: 8 + (depth - 1) * 16 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(span.id);
                    }}
                    className="grid size-4 shrink-0 place-items-center rounded text-muted hover:text-foreground"
                  >
                    <svg
                      className={cn(
                        "size-3 transition-transform",
                        !collapsed.has(span.id) && "rotate-90",
                      )}
                      viewBox="0 0 12 12"
                      aria-hidden
                    >
                      <path
                        d="M4.5 3l3 3-3 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                <span className={cn("size-2 shrink-0 rounded-[2px]", kind.dot)} aria-hidden />
                <span className="truncate font-medium">{span.name}</span>
                <span className="sr-only shrink-0 font-mono text-[10px] tracking-wide text-muted uppercase sm:not-sr-only">
                  {kind.label}
                </span>
                {span.status === "error" && (
                  <span className="shrink-0 text-xs font-medium text-danger">
                    <span aria-hidden>▲ </span>Error
                  </span>
                )}
              </div>
              <div
                className="relative mr-14 h-7"
                style={{
                  backgroundImage: "linear-gradient(to right, var(--border) 1px, transparent 1px)",
                  backgroundSize: "25% 100%",
                }}
              >
                <span
                  className={cn(
                    "absolute top-1/2 h-3 -translate-y-1/2 rounded-[3px]",
                    span.status === "error" ? "bg-danger" : kind.bar,
                    selected && "ring-2 ring-foreground/70 ring-offset-1 ring-offset-surface",
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundImage:
                      span.status === "error"
                        ? "repeating-linear-gradient(135deg, transparent 0 4px, rgb(255 255 255 / .35) 4px 6px)"
                        : undefined,
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 text-[11px] whitespace-nowrap text-muted tabular-nums"
                  style={
                    labelAfter
                      ? { left: `calc(${left + width}% + 6px)` }
                      : { right: `calc(${100 - left}% + 6px)` }
                  }
                >
                  {formatMs(span.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-xs text-muted"
        aria-hidden
      >
        {(["llm", "tool", "retrieval", "agent"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-[2px]", kindStyles[k].dot)} />
            {kindStyles[k].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-[2px] bg-danger" />
          Failed
        </span>
      </div>
    </div>
  );
}
