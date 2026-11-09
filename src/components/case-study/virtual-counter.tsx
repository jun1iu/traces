"use client";

import { useRef, useState } from "react";
import { RunList } from "@/components/runs/run-list";
import { allRuns } from "./demo-runs";

/** The real run list with a live count of how many rows actually exist in the page. */
export function VirtualCounter() {
  const runs = allRuns();
  const [active, setActive] = useState(runs[0].id);
  const box = useRef<HTMLDivElement>(null);
  const [inDom, setInDom] = useState<number | null>(null);
  const frame = useRef(0);

  const count = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      setInDom(box.current?.querySelectorAll('[role="option"]').length ?? null),
    );
  };

  return (
    <div>
      <div
        ref={box}
        className="h-[300px]"
        onScrollCapture={count}
        onKeyDownCapture={count}
        onPointerEnter={count}
      >
        <RunList runs={runs} activeId={active} onActivate={setActive} fallbackHeight={300} />
      </div>
      <p className="border-t border-border px-4 py-2.5 text-sm tabular-nums" aria-live="polite">
        <span className="font-semibold">{inDom ?? "~25"}</span> rows in the page for{" "}
        <span className="font-semibold">{runs.length.toLocaleString("en-US")}</span> runs. Scroll or
        press End.
      </p>
    </div>
  );
}
