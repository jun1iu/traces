import type { Metadata } from "next";
import Link from "next/link";
import { RunExplorer } from "@/components/runs/run-explorer";

export const metadata: Metadata = {
  title: "Run explorer",
  description:
    "Inspect thousands of AI agent runs: fast filtering, a timeline of every step, and full keyboard control.",
};

export default function RunsPage() {
  return (
    <div data-wide className="flex flex-col gap-6">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-[2.75rem] text-balance sm:text-6xl">Run explorer</h1>
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
          Sample data, generated from a fixed seed. No real model or customer data.{" "}
          <Link href="/work/run-explorer" className="text-foreground underline underline-offset-4">
            Read how it was designed
          </Link>
          .
        </p>
      </header>
      <RunExplorer />
    </div>
  );
}
