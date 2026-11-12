import Link from "next/link";
import { formatMs } from "@/lib/runs/stats";
import type { SpanKind } from "@/lib/runs/types";
import { cn } from "@/lib/cn";

export interface HeroSpan {
  id: string;
  name: string;
  kind: SpanKind;
  start: number;
  duration: number;
  depth: number;
}

const kindStyle: Record<SpanKind, { label: string; bar: string }> = {
  agent: { label: "Agent", bar: "bg-foreground/15 ring-1 ring-inset ring-foreground/30" },
  llm: { label: "Model call", bar: "bg-span-llm" },
  tool: { label: "Tool call", bar: "bg-span-tool" },
  retrieval: { label: "Retrieval", bar: "bg-span-retrieval" },
};

/** The page-load replay takes this long in total, whatever the run's real duration. */
const REPLAY_SECONDS = 1.6;

/**
 * One agent run drawn as a trace: each step's name beside its bar on a shared time axis.
 * On load the bars replay in their real order, compressed into 1.6 s. That is the
 * site's one piece of unprompted motion. It is plain CSS (trace-grow in globals.css),
 * so the bars are in the HTML at full size: without JavaScript, or with reduced motion,
 * they are simply there.
 */
export function HeroTrace({
  runId,
  task,
  duration,
  spans,
}: {
  runId: string;
  task: string;
  duration: number;
  spans: HeroSpan[];
}) {
  const ticks = niceTicks(duration);
  const pct = (ms: number) => `${(ms / duration) * 100}%`;

  return (
    <figure className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
        <p>
          <span className="font-medium">{task}</span>{" "}
          <span className="font-data text-muted">{runId}</span>
        </p>
        <p className="text-muted">
          Passed in <span className="font-data text-foreground">{formatMs(duration)}</span>
        </p>
      </div>

      <div className="grid grid-cols-[minmax(7.5rem,30%)_1fr] sm:grid-cols-[14rem_1fr]">
        {/* Time axis */}
        <div aria-hidden />
        <div aria-hidden className="relative mb-2 h-5 border-b border-border">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute bottom-1.5 -translate-x-1/2 font-data text-[11px] text-muted first:translate-x-0"
              style={{ left: pct(t) }}
            >
              {formatMs(t)}
            </span>
          ))}
        </div>

        <ol className="contents">
          {spans.map((s) => {
            const style = kindStyle[s.kind];
            const delay = (s.start / duration) * REPLAY_SECONDS;
            const grow = Math.max(0.18, (s.duration / duration) * REPLAY_SECONDS);
            return (
              <li key={s.id} className="contents">
                <span
                  className="flex h-8 min-w-0 items-center gap-2 pr-3 text-sm"
                  style={{ paddingLeft: `${s.depth * 0.875}rem` }}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="sr-only">
                    , {style.label}, starts at {formatMs(s.start)}, takes {formatMs(s.duration)}
                  </span>
                </span>
                <span aria-hidden className="relative h-8">
                  {ticks.map((t) => (
                    <span
                      key={t}
                      className="absolute inset-y-0 w-px bg-border/70"
                      style={{ left: pct(t) }}
                    />
                  ))}
                  <span
                    className={cn(
                      "absolute top-2 h-4 origin-left rounded-[3px] motion-safe:animate-[trace-grow_var(--grow)_var(--ease-snappy)_var(--delay)_both]",
                      style.bar,
                    )}
                    style={{
                      left: pct(s.start),
                      width: pct(s.duration),
                      "--delay": `${delay}s`,
                      "--grow": `${grow}s`,
                    }}
                  />
                  {/* The root spans the whole axis; its total is in the header already. */}
                  {s.depth > 0 && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 font-data text-[11px] whitespace-nowrap text-muted motion-safe:animate-[trace-label_0.2s_ease-out_var(--delay)_both]"
                      style={{
                        ...(s.start + s.duration > duration * 0.78
                          ? { right: `calc(${pct(duration - s.start)} + 0.5rem)` }
                          : { left: `calc(${pct(s.start + s.duration)} + 0.5rem)` }),
                        "--delay": `${delay + grow}s`,
                      }}
                    >
                      {formatMs(s.duration)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <figcaption className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Key">
          {(["llm", "tool", "retrieval"] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span aria-hidden className={cn("size-2.5 rounded-[2px]", kindStyle[k].bar)} />
              {kindStyle[k].label}
            </li>
          ))}
        </ul>
        <p>
          One of 5,000 sample runs.{" "}
          <Link
            href={`/runs?run=${runId}`}
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Open it in the run explorer
          </Link>
        </p>
      </figcaption>
    </figure>
  );
}

/** Three or four round-number ticks across the run, starting at zero. */
function niceTicks(total: number) {
  const raw = total / 4;
  const step = [100, 200, 250, 500, 1000, 2000].find((s) => s >= raw) ?? 5000;
  const ticks: number[] = [];
  for (let t = 0; t < total * 0.95; t += step) ticks.push(t);
  return ticks;
}
