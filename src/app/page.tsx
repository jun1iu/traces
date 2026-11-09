import { ButtonDemo, SegmentedControlDemo, SwitchDemo } from "@/components/site/demos";
import Link from "next/link";
import { Specimen } from "@/components/site/specimen";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">Design engineering</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Small components with the details sweated.
        </h1>
        <p className="text-lg text-pretty text-muted">
          Each piece here is built on shared design tokens. It works with a keyboard and a screen
          reader, and its motion follows your system settings. Try switching the theme or tabbing
          through the page.
        </p>
        <Link
          href="/returns"
          className="group inline-flex w-fit items-center gap-3 rounded-full border border-border bg-surface py-1.5 pr-4 pl-1.5 text-sm transition-colors hover:border-accent"
        >
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            New
          </span>
          <span>
            <span className="font-medium">Returns assistant</span>
            <span className="text-muted">: an AI chat interface with visible tool steps</span>
          </span>
          <span aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Specimen
          title="Button"
          description="Four variants. While loading it keeps its width, so nothing around it shifts."
          notes={["Spring press feedback", "aria-busy while loading", "Visible focus ring"]}
        >
          <ButtonDemo />
        </Specimen>

        <Specimen
          title="Segmented control"
          description="A radio group whose selection indicator glides between options."
          notes={["← → Home End", "Roving tabindex", "Shared-layout animation"]}
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

        <Specimen
          title="Theme"
          description="Auto, light and dark, chosen in the header. The choice persists without a flash on reload."
          notes={["Inline pre-paint script", "useSyncExternalStore", "Semantic colour tokens"]}
        >
          <div className="grid w-full max-w-xs grid-cols-3 gap-2" aria-hidden>
            {[
              "bg-background",
              "bg-surface",
              "bg-surface-hover",
              "bg-accent",
              "bg-muted",
              "bg-danger",
            ].map((c) => (
              <div key={c} className={`h-12 rounded-lg border border-border ${c}`} />
            ))}
          </div>
        </Specimen>
      </div>
    </div>
  );
}
