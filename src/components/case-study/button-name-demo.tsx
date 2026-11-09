"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Two loading buttons. The rendered text (innerText) excludes anything hidden with
 * visibility: hidden, which is also what removes it from the accessibility tree,
 * so it shows what a screen reader is left with.
 */
export function ButtonNameDemo() {
  const [loading, setLoading] = useState(false);
  const shipped = useRef<HTMLDivElement>(null);
  const rejected = useRef<HTMLDivElement>(null);
  const [names, setNames] = useState({ shipped: "Save changes", rejected: "Save changes" });

  function toggle() {
    setLoading((l) => !l);
    // Measure after the browser has applied the new state.
    requestAnimationFrame(() =>
      setNames({
        shipped: shipped.current?.querySelector("button")?.innerText?.trim() || "(nothing)",
        rejected: rejected.current?.querySelector("button")?.innerText?.trim() || "(nothing)",
      }),
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-sm text-muted">Both buttons, same label</span>
        <Button size="sm" variant="secondary" onClick={toggle}>
          {loading ? "Stop loading" : "Start loading"}
        </Button>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="flex flex-col items-start gap-3 bg-surface px-4 py-5">
          <p className="text-sm font-medium">Label hidden with opacity (shipped)</p>
          <div ref={shipped}>
            <Button loading={loading}>Save changes</Button>
          </div>
          <p className="text-sm text-muted">
            Text left for a screen reader:{" "}
            <span className="font-mono text-foreground" data-testid="name-shipped">
              {names.shipped}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 bg-surface px-4 py-5">
          <p className="text-sm font-medium">Label hidden with visibility</p>
          <div ref={rejected}>
            <button
              type="button"
              disabled={loading}
              aria-busy={loading || undefined}
              className="relative inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              <span className={cn(loading && "invisible")}>Save changes</span>
              {loading && (
                <span className="absolute inset-0 grid place-items-center" aria-hidden>
                  <svg className="size-4 animate-spin" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="6.5"
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeWidth="2"
                    />
                    <path
                      d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
          <p className="text-sm text-muted">
            Text left for a screen reader:{" "}
            <span className="font-mono text-foreground" data-testid="name-rejected">
              {names.rejected}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
