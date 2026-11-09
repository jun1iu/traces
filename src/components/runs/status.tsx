import { cn } from "@/lib/cn";
import type { RunStatus } from "@/lib/runs/types";

const labels: Record<RunStatus, string> = {
  passed: "Passed",
  failed: "Failed eval",
  errored: "Errored",
};

/** Status is never colour alone: each has its own icon shape and a text label. */
export function StatusIcon({ status, className }: { status: RunStatus; className?: string }) {
  const common = cn("size-4 shrink-0", className);
  if (status === "passed")
    return (
      <svg className={cn(common, "text-success")} viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M4.8 8.2l2.1 2.1 4.3-4.6"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (status === "failed")
    return (
      <svg className={cn(common, "text-muted")} viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 8h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg className={cn(common, "text-danger")} viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1.5l7 12.5H1z" fill="currentColor" />
      <path d="M8 6v3.6M8 11.6v.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function StatusBadge({ status }: { status: RunStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
      <StatusIcon status={status} className="size-3.5" />
      {labels[status]}
    </span>
  );
}

export const statusLabel = (s: RunStatus) => labels[s];
