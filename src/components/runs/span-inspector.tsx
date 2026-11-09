import { formatCost, formatMs } from "@/lib/runs/stats";
import type { Run, Span } from "@/lib/runs/types";
import { MODELS } from "@/lib/runs/generate";
import { kindStyles } from "./span-tree";
import { cn } from "@/lib/cn";

/** Everything known about one step: timing, tokens, cost, input, output and any error. */
export function SpanInspector({ run, span }: { run: Run; span: Span }) {
  const price = MODELS.find((m) => m.id === span.model);
  const cost =
    price && span.tokensIn !== undefined && span.tokensOut !== undefined
      ? (span.tokensIn * price.input + span.tokensOut * price.output) / 1_000_000
      : null;
  const facts: [string, string][] = [
    ["Started", `+${formatMs(span.start)}`],
    ["Duration", formatMs(span.duration)],
    ["Share of run", `${((span.duration / run.duration) * 100).toFixed(1)}%`],
    ...(span.model ? ([["Model", span.model]] as [string, string][]) : []),
    ...(span.tokensIn !== undefined
      ? ([
          [
            "Tokens in / out",
            `${span.tokensIn.toLocaleString("en-US")} / ${span.tokensOut?.toLocaleString("en-US")}`,
          ],
        ] as [string, string][])
      : []),
    ...(cost !== null ? ([["Est. cost", formatCost(cost)]] as [string, string][]) : []),
  ];

  return (
    <section aria-label="Step details" className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className={cn("size-2.5 rounded-[2px]", kindStyles[span.kind].dot)} aria-hidden />
        <h3 className="truncate text-sm font-semibold">{span.name}</h3>
        <span className="font-mono text-[10px] tracking-wide text-muted uppercase">
          {kindStyles[span.kind].label}
        </span>
        <span
          className={cn(
            "ml-auto text-xs font-medium",
            span.status === "error" ? "text-danger" : "text-muted",
          )}
        >
          {span.status === "error" ? "▲ Error" : "OK"}
        </span>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="truncate font-mono text-[13px] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {span.error && (
          <p
            role="note"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-foreground"
          >
            <span className="font-medium text-danger">Error: </span>
            {span.error}
          </p>
        )}
        <Json label="Input" value={span.input} />
        <Json label="Output" value={span.output} />
      </div>
    </section>
  );
}

function Json({ label, value }: { label: string; value: Record<string, unknown> }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-background px-3 py-2 font-mono text-[12px] leading-relaxed">
        {Object.keys(value).length ? JSON.stringify(value, null, 2) : "—"}
      </pre>
    </div>
  );
}
