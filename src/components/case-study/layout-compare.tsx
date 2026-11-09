"use client";

import { useState } from "react";
import { SpanTree, kindStyles } from "@/components/runs/span-tree";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";
import type { Run, Span } from "@/lib/runs/types";
import { NESTED_RUN_ID, runById } from "./demo-runs";

const options = [
  { value: "aligned", label: "Tree + timeline" },
  { value: "flame", label: "Flame graph" },
] as const;

/** The same run in the layout I shipped and the common alternative I rejected. */
export function LayoutCompare() {
  const run = runById(NESTED_RUN_ID);
  const [layout, setLayout] = useState<(typeof options)[number]["value"]>("aligned");
  const [selected, setSelected] = useState(run.spans[0].id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-sm font-medium">
          {run.task} <span className="font-mono text-xs text-muted">{run.id}</span>
        </span>
        <SegmentedControl
          aria-label="Layout"
          size="sm"
          options={options}
          value={layout}
          onValueChange={setLayout}
        />
      </div>
      <div className="h-[340px]">
        {layout === "aligned" ? (
          <SpanTree run={run} selectedId={selected} onSelect={setSelected} />
        ) : (
          <FlameGraph run={run} />
        )}
      </div>
    </div>
  );
}

function depthOf(span: Span, byId: Map<string, Span>): number {
  let d = 0;
  let p = span.parentId;
  while (p) {
    d++;
    p = byId.get(p)?.parentId ?? null;
  }
  return d;
}

function FlameGraph({ run }: { run: Run }) {
  const byId = new Map(run.spans.map((s) => [s.id, s]));
  const rows = Math.max(...run.spans.map((s) => depthOf(s, byId))) + 1;
  return (
    <div
      className="flex h-full flex-col justify-center gap-1 px-4"
      role="img"
      aria-label="Flame graph of the same run: steps stacked by depth, labels inside the bars"
    >
      {Array.from({ length: rows }, (_, depth) => (
        <div key={depth} className="relative h-8">
          {run.spans
            .filter((s) => depthOf(s, byId) === depth)
            .map((s) => (
              <span
                key={s.id}
                className={cn(
                  "absolute inset-y-0 flex items-center overflow-hidden rounded-[3px] border border-surface px-1.5 text-[11px] font-medium whitespace-nowrap",
                  s.status === "error" ? "bg-danger" : kindStyles[s.kind].bar,
                  s.kind === "agent" ? "text-foreground" : "text-white",
                )}
                style={{
                  left: `${(s.start / run.duration) * 100}%`,
                  width: `${(s.duration / run.duration) * 100}%`,
                }}
              >
                {s.name}
              </span>
            ))}
        </div>
      ))}
    </div>
  );
}
