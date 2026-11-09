import type { Metadata } from "next";
import { RunExplorer } from "@/components/runs/run-explorer";

export const metadata: Metadata = {
  title: "Run explorer",
  description:
    "Inspect thousands of AI agent runs: fast filtering, a timeline of every step, and full keyboard control.",
};

export default function RunsPage() {
  return (
    <div data-wide className="flex flex-col gap-6">
      <header className="flex max-w-3xl flex-col gap-3">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">
          Data-dense interface
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Run explorer
        </h1>
        <p className="text-pretty text-muted">
          A tool for inspecting AI agent runs. 5,000 runs, each with its model calls, tool calls and
          retrievals laid out on a timeline. The list renders only what is on screen, the panes
          resize, and everything works from the keyboard:{" "}
          <kbd className="font-mono text-foreground">/</kbd> to search,{" "}
          <kbd className="font-mono text-foreground">↑ ↓</kbd> or{" "}
          <kbd className="font-mono text-foreground">j k</kbd> through runs,{" "}
          <kbd className="font-mono text-foreground">Tab</kbd> into the steps.
        </p>
        <p className="text-xs text-muted">
          Sample data, generated from a fixed seed. No real model or customer data.
        </p>
      </header>
      <RunExplorer />
    </div>
  );
}
