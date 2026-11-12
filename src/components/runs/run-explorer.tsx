"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SplitPane } from "@/components/ui/split-pane";
import { generateRuns } from "@/lib/runs/generate";
import { formatCost, formatMs, formatTime, summarize } from "@/lib/runs/stats";
import type { Run, RunStatus } from "@/lib/runs/types";
import { RunList } from "./run-list";
import { RunStats } from "./run-stats";
import { SpanInspector } from "./span-inspector";
import { SpanTree } from "./span-tree";
import { StatusBadge } from "./status";
import { useRunParam } from "./url-state";

type StatusFilter = "all" | RunStatus;
type Sort = "newest" | "slowest" | "costliest";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "errored", label: "Errored" },
] as const;

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "slowest", label: "Slowest" },
  { value: "costliest", label: "Costliest" },
] as const;

const sorters: Record<Sort, ((a: Run, b: Run) => number) | null> = {
  newest: null, // generated newest first
  slowest: (a, b) => b.duration - a.duration,
  costliest: (a, b) => b.cost - a.cost,
};

let cache: Run[] | null = null;
const allRuns = () => (cache ??= generateRuns());

export function RunExplorer({ runs = allRuns() }: { runs?: Run[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [runParam, setRunParam] = useRunParam();
  const [spanPick, setSpanPick] = useState<{ runId: string; spanId: string } | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list = runs.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!q ||
          r.id.includes(q) ||
          r.task.toLowerCase().includes(q) ||
          r.prompt.toLowerCase().includes(q) ||
          r.model.includes(q) ||
          r.spans.some((s) => s.name.toLowerCase().includes(q))),
    );
    const sorter = sorters[sort];
    if (sorter) list = [...list].sort(sorter);
    return list;
  }, [runs, deferredQuery, status, sort]);

  const summary = useMemo(() => summarize(filtered), [filtered]);
  const active = filtered.find((r) => r.id === runParam) ?? filtered[0] ?? null;
  const spanId = active && spanPick?.runId === active.id ? spanPick.spanId : active?.spans[0].id;
  const span = active?.spans.find((s) => s.id === spanId) ?? active?.spans[0];

  // "/" jumps to search from anywhere on the page, as in most developer tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key !== "/" ||
        e.metaKey ||
        e.ctrlKey ||
        target.closest("input, textarea, [contenteditable]")
      )
        return;
      e.preventDefault();
      search.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="run-search" className="sr-only">
            Search runs
          </label>
          <input
            id="run-search"
            ref={search}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search by task, prompt, tool, model or run ID"
            className="h-9 w-full rounded-lg border border-border bg-surface pr-9 pl-3 text-sm outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-ring/25"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[11px] text-muted">
            /
          </kbd>
        </div>
        <SegmentedControl
          aria-label="Filter by status"
          size="sm"
          options={statusOptions}
          value={status}
          onValueChange={setStatus}
        />
        <SegmentedControl
          aria-label="Sort runs"
          size="sm"
          options={sortOptions}
          value={sort}
          onValueChange={setSort}
        />
      </div>

      <RunStats summary={summary} highlight={active?.duration} />

      <div className="overflow-hidden rounded-lg border border-border bg-surface md:h-[min(76vh,820px)] md:min-h-[560px]">
        <SplitPane
          orientation="horizontal"
          defaultSize={32}
          min={22}
          max={50}
          label="Resize run list"
          className="h-full"
          first={
            <div className="h-[46vh] border-b border-border md:h-full md:border-b-0">
              <RunList runs={filtered} activeId={active?.id ?? null} onActivate={setRunParam} />
            </div>
          }
          second={
            active && span ? (
              <div className="flex h-full min-h-0 flex-col">
                <RunHeader run={active} />
                <SplitPane
                  orientation="vertical"
                  defaultSize={58}
                  min={30}
                  max={80}
                  label="Resize timeline and step details"
                  className="min-h-0 flex-1"
                  first={
                    <div className="h-[52vh] md:h-full">
                      <SpanTree
                        key={active.id}
                        run={active}
                        selectedId={span.id}
                        onSelect={(id) => setSpanPick({ runId: active.id, spanId: id })}
                      />
                    </div>
                  }
                  second={
                    <div className="border-t border-border md:h-full md:border-t-0">
                      <SpanInspector run={active} span={span} />
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="grid h-full place-items-center p-8 text-sm text-muted">
                Select a run to see its steps.
              </div>
            )
          }
        />
      </div>
    </div>
  );
}

function RunHeader({ run }: { run: Run }) {
  return (
    <header className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold">{run.task}</h2>
        <StatusBadge status={run.status} />
        <span className="font-mono text-xs text-muted">{run.id}</span>
      </div>
      <p className="mt-1 truncate text-sm text-muted">“{run.prompt}”</p>
      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {[
          ["Score", run.score === null ? "—" : run.score.toFixed(2)],
          ["Duration", formatMs(run.duration)],
          ["Tokens", run.tokens.toLocaleString("en-US")],
          ["Est. cost", formatCost(run.cost)],
          ["Model", run.model],
          ["Started", formatTime(run.startedAt)],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
