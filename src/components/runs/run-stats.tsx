"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatCost, formatMs, type summarize } from "@/lib/runs/stats";

type Summary = ReturnType<typeof summarize>;

/**
 * Headline numbers for the runs in view, plus their duration distribution.
 * The chart is a single series, so it has a title instead of a legend; each bar
 * has a hover tooltip, and a screen-reader table carries the same numbers.
 */
export function RunStats({ summary, highlight }: { summary: Summary; highlight?: number }) {
  const tiles = [
    { label: "Runs", value: summary.count.toLocaleString("en-US") },
    { label: "Pass rate", value: `${(summary.passRate * 100).toFixed(1)}%` },
    { label: "p50 duration", value: formatMs(summary.p50) },
    { label: "p95 duration", value: formatMs(summary.p95) },
    { label: "Est. cost", value: formatCost(summary.cost) },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col justify-between gap-3 bg-surface px-4 py-3">
            <dt className="text-xs text-muted">{t.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight">{t.value}</dd>
          </div>
        ))}
      </dl>
      <DurationChart bins={summary.histogram} highlight={highlight} />
    </div>
  );
}

function DurationChart({ bins, highlight }: { bins: Summary["histogram"]; highlight?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...bins.map((b) => b.count));
  const end = bins.at(-1)?.to ?? 1;
  const hi =
    highlight === undefined
      ? -1
      : bins.findIndex((b, i) => highlight < b.to || i === bins.length - 1);

  return (
    <figure className="rounded-xl border border-border bg-surface px-4 pt-3 pb-2">
      <figcaption className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">Duration distribution</span>
        {hi >= 0 && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="h-2.5 w-0.5 bg-foreground" aria-hidden /> Selected run
          </span>
        )}
      </figcaption>
      <div
        className="relative mt-2 flex h-16 items-end gap-[2px]"
        onPointerLeave={() => setHover(null)}
        aria-hidden
      >
        {bins.map((b, i) => (
          <div
            key={i}
            className="relative flex h-full flex-1 items-end"
            onPointerEnter={() => setHover(i)}
          >
            <div
              className={cn(
                "w-full rounded-t-[4px] transition-colors",
                b.count === 0 ? "h-px bg-border" : hover === i ? "bg-span-llm" : "bg-span-llm/70",
              )}
              style={b.count ? { height: `${Math.max(4, (b.count / max) * 100)}%` } : undefined}
            />
            {i === hi && (
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-foreground" />
            )}
          </div>
        ))}
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 rounded-md border border-border bg-surface px-2 py-1 text-xs whitespace-nowrap text-foreground tabular-nums shadow-sm"
            style={{ left: `${((hover + 0.5) / bins.length) * 100}%` }}
          >
            {formatMs(bins[hover].from)}–{formatMs(bins[hover].to)} ·{" "}
            {bins[hover].count.toLocaleString("en-US")} runs
          </div>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums" aria-hidden>
        <span>0 s</span>
        <span>{formatMs(end)}</span>
      </div>
      <table className="sr-only">
        <caption>Runs by duration</caption>
        <thead>
          <tr>
            <th scope="col">Duration</th>
            <th scope="col">Runs</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((b, i) => (
            <tr key={i}>
              <td>
                {formatMs(b.from)} to {formatMs(b.to)}
              </td>
              <td>{b.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
