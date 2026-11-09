"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { springs } from "@/tokens/tokens";
import { stepCopy } from "./step-copy";
import type { Phase, Step } from "./use-assistant";

/**
 * The agent's work, shown as it happens. While the agent is working every step is
 * visible; once it answers, the steps fold into one summary line that can be reopened.
 */
export function StepTimeline({ steps, phase }: { steps: Step[]; phase: Phase }) {
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const listId = useId();
  if (steps.length === 0) return null;

  const working = phase === "working";
  const open = openOverride ?? working;
  const failed = steps.some((s) => s.state === "failed");
  const summary = working
    ? "Working…"
    : `${failed ? "Stopped at a failed step" : "Checked"} · ${steps.length} step${steps.length === 1 ? "" : "s"}`;

  return (
    <div className="text-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpenOverride(!open)}
        className="inline-flex items-center gap-1.5 rounded-md py-0.5 font-medium text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Chevron open={open} />
        {summary}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            id={listId}
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.gentle}
            className="relative mt-2 overflow-hidden pl-7 before:absolute before:top-3 before:bottom-3 before:left-[8.5px] before:w-px before:bg-border"
          >
            {steps.map((step) => {
              const { label, detail } = stepCopy(step);
              return (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springs.gentle}
                  className="relative py-1.5"
                >
                  <span className="absolute top-2 -left-7 grid size-[18px] place-items-center rounded-full bg-surface">
                    <StepIcon state={step.state} />
                  </span>
                  <span
                    className={cn(
                      "block font-medium",
                      step.state === "running" && "text-foreground",
                    )}
                  >
                    {label}
                    {step.state === "running" && <span className="sr-only"> (in progress)</span>}
                  </span>
                  {detail && (
                    <span
                      className={cn(
                        "block",
                        step.state === "failed" ? "text-danger" : "text-muted",
                      )}
                    >
                      {detail}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIcon({ state }: { state: Step["state"] }) {
  if (state === "running")
    return (
      <svg
        className="size-3.5 animate-spin text-accent"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  if (state === "failed")
    return (
      <svg
        className="size-3.5 text-danger"
        viewBox="0 0 16 16"
        fill="none"
        aria-label="Failed"
        role="img"
      >
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M5.5 5.5l5 5m0-5l-5 5"
          stroke="var(--surface)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  return (
    <svg
      className="size-3.5 text-accent"
      viewBox="0 0 16 16"
      fill="none"
      aria-label="Done"
      role="img"
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M4.8 8.2l2.1 2.1 4.3-4.6"
        stroke="var(--accent-foreground)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
