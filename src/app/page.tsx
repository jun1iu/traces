import Link from "next/link";
import { ButtonDemo, SegmentedControlDemo, SwitchDemo } from "@/components/site/demos";
import { HeroTrace } from "@/components/site/hero-trace";
import { Specimen } from "@/components/site/specimen";
import { StudyList } from "@/components/site/study-list";
import { featuredRun, spanDepths } from "@/lib/runs/feature";

export default function Home() {
  // Chosen on the server, so the 5,000-run generator never ships to the browser.
  const run = featuredRun();
  const depths = spanDepths(run.spans);
  const spans = run.spans.map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    start: s.start,
    duration: s.duration,
    depth: depths.get(s.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <section aria-labelledby="intro" className="flex flex-col gap-12 sm:gap-14">
        <div className="flex flex-col gap-6">
          <h1
            id="intro"
            className="font-display text-[3.25rem] text-balance sm:text-[5.25rem] sm:leading-[0.96]"
          >
            Interfaces for AI tools,
            <br className="hidden sm:inline" /> with the thinking shown.
          </h1>
          <p className="max-w-[54ch] text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            I’m Jun Liu, a design engineer in Hong Kong. I design and build the tools people use to
            watch, debug and trust AI agents, like the run below, and the components underneath
            them. Everything works with a keyboard and a screen reader.
          </p>
        </div>
        <HeroTrace runId={run.id} task={run.task} duration={run.duration} spans={spans} />
      </section>

      <section aria-labelledby="studies" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="studies" className="font-display text-4xl">
            Case studies
          </h2>
          <p className="max-w-[46ch] text-muted">
            What I chose, what I turned down, and what each decision cost.
          </p>
        </div>
        <StudyList headingLevel={3} />
      </section>

      <section aria-labelledby="components" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="components" className="font-display text-4xl">
            Components
          </h2>
          <p className="max-w-[46ch] text-muted">
            The pieces the tools are built from. All of them are live: try them with the keyboard.{" "}
            <Link href="/tokens" className="text-foreground underline underline-offset-4">
              See the tokens
            </Link>
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          <Specimen
            title="Button"
            description="Four variants. While loading it keeps its width, so nothing around it shifts."
            notes={["Spring press feedback", "aria-busy while loading", "Visible focus ring"]}
          >
            <ButtonDemo />
          </Specimen>
          <Specimen
            title="Segmented control"
            description="A radio group whose selection glides between options."
            notes={["Arrow keys, Home and End", "Roving tabindex", "Shared-layout animation"]}
          >
            <SegmentedControlDemo />
          </Specimen>
          <Specimen
            title="Switch"
            description="Works controlled or uncontrolled. Clicking the label toggles it too."
            notes={['role="switch"', "Description wired to aria-describedby", "Spring thumb"]}
          >
            <SwitchDemo />
          </Specimen>
        </div>
      </section>
    </div>
  );
}
