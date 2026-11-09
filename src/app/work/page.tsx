import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies: the problems, the decisions and what each one cost.",
};

const studies = [
  {
    href: "/work/run-explorer",
    kicker: "Data-dense interface",
    title: "Finding the one bad run in five thousand",
    summary:
      "Designing a tool for inspecting AI agent runs: aligning steps with their timing, failure that survives colour blindness, and a list that keeps under 30 rows in the page for 5,000 runs.",
    ready: true,
  },
  {
    href: "/work/returns-assistant",
    kicker: "AI interface",
    title: "Designing for an agent you can’t fully predict",
    summary:
      "The Returns assistant: steps that appear live then fold away, a person approves the money, failure you can act on, and one screen-reader announcement per reply instead of 25.",
    ready: true,
  },
  {
    href: "/work/design-system",
    kicker: "Design system",
    title: "Tokens as data, components with no surprises",
    summary:
      "Semantic tokens enforced by a test, a theme that never flashes, and a loading button that keeps its name for screen readers.",
    ready: true,
  },
] as const;

export default function WorkPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">Work</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Case studies</h1>
        <p className="text-lg text-pretty text-muted">
          Not just what I built, but why: the problem, the options I turned down, what each decision
          cost, and what review caught. Each one has live comparisons you can try.
        </p>
      </header>
      <ul className="grid gap-4">
        {studies.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
            >
              <span className="flex items-center gap-2 font-mono text-xs tracking-wider text-accent uppercase">
                {s.kicker}
                {!s.ready && (
                  <span className="rounded-full border border-border px-2 py-0.5 font-sans text-[11px] tracking-normal text-muted normal-case">
                    Write-up soon
                  </span>
                )}
              </span>
              <span className="text-xl font-semibold tracking-tight">{s.title}</span>
              <span className="max-w-[68ch] text-muted">{s.summary}</span>
              <span className="text-sm font-medium text-accent">
                {s.ready ? "Read the case study" : "See the project"} <span aria-hidden>→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
