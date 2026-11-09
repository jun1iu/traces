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
      "Designing a tool for inspecting AI agent runs: aligning steps with their timing, failure that survives colour blindness, and a list that renders 25 rows for 5,000 runs.",
    ready: true,
  },
  {
    href: "/returns",
    kicker: "AI interface",
    title: "Designing for an agent you can’t fully predict",
    summary:
      "The Returns assistant: visible tool steps, a person approves money, and failure as a state. Write-up coming next.",
    ready: false,
  },
  {
    href: "/tokens",
    kicker: "Design system",
    title: "Tokens as data",
    summary: "A theme is one swap of CSS variables, enforced by a test. Write-up coming next.",
    ready: false,
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
