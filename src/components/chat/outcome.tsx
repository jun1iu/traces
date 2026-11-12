import type { Outcome as OutcomeStatus, RefundDraft } from "@/lib/relay/engine";
import { cn } from "@/lib/cn";

const outcomes: Record<OutcomeStatus, { label: string; tone: string }> = {
  review: { label: "Needs human review", tone: "border-accent/40 bg-accent/10 text-accent" },
  denied: { label: "Not eligible", tone: "border-border bg-surface-hover text-foreground" },
  clarify: { label: "Needs more information", tone: "border-border bg-surface-hover text-muted" },
  retry: { label: "Couldn’t verify", tone: "border-danger/40 bg-danger/10 text-danger" },
};

export function OutcomeBadge({ status }: { status: OutcomeStatus }) {
  const { label, tone } = outcomes[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone,
      )}
    >
      {label}
    </span>
  );
}

/** The refund the agent prepared. It cannot issue it: a person approves or rejects it. */
export function DraftCard({ draft }: { draft: RefundDraft }) {
  const rows: [string, string][] = [
    ["Order", draft.order],
    ["Refund", draft.amount],
    ["Policy", draft.policy],
  ];
  return (
    <figure className="rounded-lg border border-dashed border-border bg-background/60 p-4">
      <figcaption className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">Refund draft</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
          Awaiting human approval
        </span>
      </figcaption>
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="font-mono text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">Only staff can approve it. No money has moved.</p>
    </figure>
  );
}
