"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { springs } from "@/tokens/tokens";
import { DraftCard, OutcomeBadge } from "./outcome";
import { StepTimeline } from "./step-timeline";
import type { AssistantMessage, Message } from "./use-assistant";

export function ChatMessage({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: (m: AssistantMessage) => void;
}) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.gentle}
        className="flex justify-end"
      >
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-accent-foreground">
          <span className="sr-only">You: </span>
          {message.text}
        </p>
      </motion.div>
    );
  }

  const { steps, text, phase, status, draft } = message;
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.gentle}
      aria-label="Assistant reply"
      aria-busy={phase === "working" || phase === "streaming"}
      className="flex max-w-[92%] flex-col gap-3"
    >
      <StepTimeline steps={steps} phase={phase} />

      {phase === "working" && steps.length === 0 && <ThinkingDots />}

      {text && (
        <p className="text-[15px] leading-relaxed">
          {text}
          {phase === "streaming" && (
            <span
              className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-accent"
              aria-hidden
            />
          )}
        </p>
      )}

      {phase === "stopped" && (
        <p className="text-sm text-muted">
          Stopped. {text ? "The reply above is incomplete." : "Nothing was checked."}
        </p>
      )}

      {phase === "done" && status && (
        <div className="flex flex-wrap items-center gap-2">
          <OutcomeBadge status={status} />
          {status === "retry" && (
            <Button size="sm" variant="secondary" onClick={() => onRetry(message)}>
              Try again
            </Button>
          )}
        </div>
      )}

      {phase === "done" && draft && <DraftCard draft={draft} />}
    </motion.article>
  );
}

function ThinkingDots() {
  return (
    <span className="flex gap-1 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}
