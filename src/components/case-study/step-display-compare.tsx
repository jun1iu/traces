"use client";

import { useState } from "react";
import { StepTimeline } from "@/components/chat/step-timeline";
import { useAssistant } from "@/components/chat/use-assistant";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { examples } from "@/lib/relay/engine";

const modes = [
  { value: "spinner", label: "Spinner only" },
  { value: "expanded", label: "Always expanded" },
  { value: "fold", label: "Live, then fold" },
] as const;
type Mode = (typeof modes)[number]["value"];

/** One real request, replayed at the assistant's real pace, shown three ways. */
export function StepDisplayCompare() {
  const [mode, setMode] = useState<Mode>("fold");
  const { messages, busy, send, reset } = useAssistant();
  const reply = messages.find((m) => m.role === "assistant");
  const prompt = examples[0].prompt;

  function replay() {
    reset();
    send(prompt);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <SegmentedControl
          aria-label="How steps are shown"
          size="sm"
          options={modes}
          value={mode}
          onValueChange={setMode}
        />
        <Button size="sm" variant="secondary" onClick={replay} disabled={busy}>
          {reply ? "Replay" : "Play"}
        </Button>
      </div>
      <div className="flex min-h-[260px] flex-col gap-3 px-4 py-4 text-[15px]">
        <p className="self-end rounded-2xl rounded-br-md bg-accent px-4 py-2 text-accent-foreground">
          {prompt}
        </p>
        {!reply && (
          <p className="text-sm text-muted">Press Play, then switch modes and replay to compare.</p>
        )}
        {reply?.role === "assistant" && (
          <div className="flex flex-col gap-3" aria-live="off">
            {mode === "spinner" ? (
              reply.phase === "working" && (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <svg
                    className="size-3.5 animate-spin"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeOpacity=".25"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 8a6 6 0 0 0-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Working…
                </span>
              )
            ) : (
              <StepTimeline
                key={mode}
                steps={reply.steps}
                phase={reply.phase}
                alwaysOpen={mode === "expanded"}
              />
            )}
            {reply.text && <p className="leading-relaxed">{reply.text}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
