"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { examples, policy } from "@/lib/relay/engine";
import { ChatMessage } from "./message";
import { useAssistant } from "./use-assistant";

interface Props {
  /** Milliseconds per step and per word; tests pass 0. */
  pace?: { step: number; word: number };
}

export function ReturnsAssistant({ pace }: Props) {
  const { messages, busy, send, stop, retry, reset } = useAssistant(pace ? { pace } : undefined);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  // Follow new content only while the reader is at the bottom, so scrolling up to
  // re-read an earlier answer is never interrupted.
  useEffect(() => {
    const el = log.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Grow the textarea with its content, up to about five lines.
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  function submit(text = draft) {
    if (busy || !text.trim()) return;
    stick.current = true;
    send(text);
    setDraft("");
    input.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape" && busy) {
      e.preventDefault();
      stop();
    }
  }

  // One calm announcement per turn for screen readers, instead of every streamed word.
  const last = messages.at(-1);
  const announcement =
    last?.role !== "assistant"
      ? ""
      : last.phase === "working"
        ? "Checking your request…"
        : last.phase === "done"
          ? last.text
          : last.phase === "stopped"
            ? "Stopped."
            : "";

  return (
    <section
      aria-label="Relay Returns assistant"
      className="flex h-[min(72vh,680px)] min-h-[460px] flex-col overflow-hidden rounded-lg border border-border bg-surface"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent font-mono text-xs font-semibold text-accent-foreground"
            aria-hidden
          >
            RR
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Relay Returns</p>
            <p className="truncate text-xs text-muted">
              {busy ? "Working…" : `Policy ${policy.id}: ${policy.rule}`}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={reset}>
            New chat
          </Button>
        )}
      </header>

      <div
        ref={log}
        role="log"
        aria-label="Conversation"
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
        className="flex-1 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={submit} />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} onRetry={retry} />
            ))}
          </div>
        )}
      </div>

      <form
        className="border-t border-border p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-1.5 pl-3 transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-4 focus-within:ring-ring/30">
          <label htmlFor="returns-input" className="sr-only">
            Message
          </label>
          <textarea
            id="returns-input"
            ref={input}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Describe your return, for example “RX-104 arrived damaged”"
            aria-describedby="returns-hint"
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-muted"
          />
          {busy ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={stop}
              aria-keyshortcuts="Escape"
            >
              <StopIcon /> Stop
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Send
            </Button>
          )}
        </div>
        <p id="returns-hint" className="mt-2 px-1 text-xs text-muted">
          Enter to send, Shift + Enter for a new line{busy ? ", Esc to stop" : ""}. Runs Relay’s
          policy engine in your browser: no AI model, nothing leaves the page.
        </p>
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-5 text-center">
      <div>
        <h2 className="text-lg font-semibold">How can I help with your return?</h2>
        <p className="mt-1 text-sm text-muted">
          I check orders against the returns policy and prepare refunds for a person to approve. I
          can’t issue money myself.
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Example requests">
        {examples.map((ex) => (
          <li key={ex.label}>
            <button
              type="button"
              onClick={() => onPick(ex.prompt)}
              title={ex.prompt}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {ex.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StopIcon() {
  return (
    <svg className="size-3" viewBox="0 0 12 12" aria-hidden>
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}
