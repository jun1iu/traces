"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { runAgent } from "@/lib/relay/agent";
import { examples } from "@/lib/relay/engine";
import { stepCopy } from "@/components/chat/step-copy";
import type { Step } from "@/components/chat/use-assistant";

interface Log {
  live: string[];
  once: string[];
}

/**
 * Replays a real reply and logs what reaches a screen reader under two strategies:
 * a polite live region on the whole reply (every step and every streamed word is an
 * update) versus the shipped approach (one status line per turn). It counts updates;
 * exactly how each screen reader voices them varies.
 */
export function AnnouncementCompare() {
  const [log, setLog] = useState<Log>({ live: [], once: [] });
  const [running, setRunning] = useState(false);
  const runId = useRef(0);

  async function play() {
    const id = ++runId.current;
    setRunning(true);
    setLog({ live: [], once: ["Checking your request…"] });
    let text = "";
    for await (const e of runAgent(examples[0].prompt, { pace: { step: 350, word: 45 } })) {
      if (runId.current !== id) return;
      if (e.type === "step-start") {
        const step: Step = {
          id: e.id,
          kind: e.kind,
          name: e.name,
          input: e.input,
          state: "running",
        };
        const label = stepCopy(step).label;
        setLog((l) => ({ ...l, live: [...l.live, label] }));
      } else if (e.type === "text") {
        text += e.delta;
        const word = e.delta.trim();
        setLog((l) => ({ ...l, live: [...l.live, word] }));
      } else if (e.type === "done") {
        const final = text.trim();
        setLog((l) => ({ ...l, once: [...l.once, final] }));
      }
    }
    setRunning(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-sm text-muted">The “Damaged headphones” request, replayed</span>
        <Button size="sm" variant="secondary" onClick={play} disabled={running}>
          {log.live.length ? "Replay" : "Play"}
        </Button>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2">
        <Column title="Live region on the reply" items={log.live} />
        <Column title="One announcement per turn (shipped)" items={log.once} />
      </div>
    </div>
  );
}

function Column({ title, items }: { title: string; items: string[] }) {
  const list = useRef<HTMLOListElement>(null);
  // Follow the newest entry, so the left column visibly fills up as the reply streams.
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [items.length]);
  return (
    <div className="bg-surface px-4 py-3">
      <p className="flex items-baseline justify-between gap-2 text-sm font-medium">
        {title}
        <span
          className="text-2xl font-semibold tabular-nums"
          data-testid={`count-${title.startsWith("Live") ? "live" : "once"}`}
        >
          {items.length}
        </span>
      </p>
      <ol
        ref={list}
        className="mt-2 flex h-40 flex-col gap-1 overflow-y-auto font-mono text-[12px] text-muted"
      >
        {items.map((it, i) => (
          <li key={i} className="shrink-0 truncate">
            <span className="text-foreground/40">{String(i + 1).padStart(2, "0")}</span> {it}
          </li>
        ))}
      </ol>
    </div>
  );
}
