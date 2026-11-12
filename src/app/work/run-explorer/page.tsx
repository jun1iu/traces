import type { Metadata } from "next";
import Link from "next/link";
import { CvdCompare } from "@/components/case-study/cvd-compare";
import { LayoutCompare } from "@/components/case-study/layout-compare";
import { Decision, Figure, Metrics, P, Section } from "@/components/case-study/prose";
import { VirtualCounter } from "@/components/case-study/virtual-counter";

export const metadata: Metadata = {
  title: "Run explorer: case study",
  description:
    "How I designed a tool for inspecting AI agent runs: the problem, the decisions and what each one cost, and what review caught.",
};

const keys = [
  ["/", "Search, from anywhere on the page"],
  ["↑ ↓ or j k", "Previous or next run"],
  ["Page Up / Down, Home, End", "Jump through the list"],
  ["Tab", "Move from the list into the run's steps"],
  ["→ ←", "Expand or collapse a step; go to its child or parent"],
  ["Esc", "Clear the search"],
] as const;

const caught = [
  {
    what: "A third of runs were failing",
    found:
      "The first data generator scored runs so harshly that 36% failed evaluation. A test I wrote to assert a believable mix of outcomes failed before I ever looked at the screen.",
    fix: "Reshaped the score distribution into a long tail: 79% pass, 14% fail evaluation, 7% error.",
  },
  {
    what: "The header overflowed by 3 pixels",
    found:
      "Adding the Runs link made the header 393 px wide on a 390 px phone, so the theme switcher was clipped. I only saw it because the review script measures scroll width on every page.",
    fix: "Tightened the link spacing on small screens; every page measures exactly 390 px again.",
  },
  {
    what: "The header didn't line up with the page",
    found:
      "The explorer is wider than the rest of the site, but the header stayed at the narrow width, so its edges didn't match.",
    fix: "Pages can mark themselves wide; the header follows with a :has() selector, no JavaScript.",
  },
  {
    what: "Step names were cut to “clas…” on phones",
    found: "The LLM / TOOL labels took the space the names needed in the narrow step column.",
    fix: "Below the sm breakpoint the labels are visually hidden but still read by screen readers; the colour key carries the type.",
  },
  {
    what: "Timeline labels collided on phones",
    found:
      "While reviewing this case study at phone width, the timeline’s axis labels ran together, and the full-width bar’s duration landed on top of its step name. The same bug was in the Run explorer; my earlier phone screenshots had cropped it out.",
    fix: "On phones the axis shows only its start and end; a duration that fits on neither side of its bar now sits inside the bar’s end.",
  },
] as const;

export default function RunExplorerCaseStudy() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex max-w-3xl flex-col gap-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/work" className="transition-colors hover:text-foreground">
            Case studies
          </Link>
          <span aria-hidden className="px-2">
            /
          </span>
          <span aria-current="page" className="text-foreground">
            Run explorer
          </span>
        </nav>
        <h1 className="max-w-[18ch] font-display text-5xl text-balance sm:text-7xl sm:leading-[0.98]">
          Finding the one bad run in five thousand
        </h1>
        <P className="text-lg text-muted">
          An AI agent run is dozens of steps: model calls, tool calls, retrievals, retries. When one
          goes wrong, someone has to find it among thousands, see where the time went and read what
          failed. The{" "}
          <Link href="/runs" className="text-foreground underline underline-offset-4">
            Run explorer
          </Link>{" "}
          is my answer, and this is how I got there.
        </P>
      </header>

      <Metrics
        items={[
          { value: "5,000", label: "runs, 27,865 steps (sample data)" },
          { value: "<30", label: "rows in the page at once, measured" },
          { value: "<100 ms", label: "to search every run" },
          { value: "91", label: "tests, 28 for the explorer" },
        ]}
      />

      <Section id="problem" kicker="01 · The problem" title="Three jobs, in order">
        <P>
          I started from what someone debugging agents actually does, in the order they do it.
          First, <strong>triage</strong>: which runs failed, and are they the slow or expensive
          ones? Then <strong>diagnose</strong>: inside one run, where did the time go, and which
          step broke? Finally, <strong>read</strong>: the exact input, output and error of that
          step.
        </P>
        <P>
          That order became the layout, left to right: the list for triage, the run’s steps for
          diagnosis, the inspector for reading. Summary numbers sit above, because they answer the
          question before the question: is today worse than usual?
        </P>
      </Section>

      <Section id="principles" kicker="02 · Principles" title="What I held myself to">
        <ul className="grid max-w-[68ch] gap-3 text-[15px] leading-relaxed">
          <li>
            <strong>Dense, not noisy.</strong> Show a lot at once, but give every pixel a job. No
            decoration on data.
          </li>
          <li>
            <strong>The keyboard is the fast path.</strong> People who debug for a living live on
            it.
          </li>
          <li>
            <strong>Never colour alone.</strong> About one in twelve men can’t rely on red versus
            green.
          </li>
          <li>
            <strong>Honest data.</strong> It is sample data, generated from a fixed seed, and the
            page says so.
          </li>
        </ul>
      </Section>

      <Section id="decisions" kicker="03 · Decisions" title="What I chose, and what it cost">
        <Decision
          title="Steps and their timing on the same row"
          chose="A tree of steps on the left with each step’s bar on the same row, sharing one time axis."
          rejected="A flame graph, the usual way to draw traces: steps stacked by depth with names inside the bars."
          because="A flame graph is compact, but names get cut off inside short bars, and two tool calls running in parallel at the same depth land on the same row, where one can hide the other completely. On a shared row, the eye goes from a name straight to its bar, nesting is plain indentation, and parallel calls show as overlapping bars on separate rows."
          cost="It takes more vertical space: one row per step instead of one per level. For agent runs of 5 to 15 steps that is cheap; for traces with hundreds of steps it would need collapsing by default."
        >
          <Figure caption="The same real run, both ways. In the flame graph, fetch_diff ran in parallel with run_linter and disappears behind it: nothing tells you the step happened at all.">
            <LayoutCompare />
          </Figure>
        </Decision>

        <Decision
          title="Failure that survives colour blindness"
          chose="Failed steps are red, striped and labelled “▲ Error”. Run status uses a different icon shape per state, always with a text label."
          rejected="Red bars on their own, which is what most dashboards do."
          because="Under deuteranopia, the red of a failed step and the orange of a tool call become nearly the same colour. The stripes and the label carry the meaning without hue."
          cost="Slightly busier bars. I limited stripes to failures, so they stay rare enough to stand out."
        >
          <Figure caption="A real errored run under simulated colour vision (Machado et al., 2009). With “Colour only” and Deuteranopia, the two failed calls (create_refund_draft and its retry) differ from the working tool calls above them only by a slightly darker olive.">
            <CvdCompare />
          </Figure>
        </Decision>

        <Decision
          title="Validate the palette, don’t eyeball it"
          chose="Step colours from a categorical palette I checked with a validator against the site’s own light and dark backgrounds: worst colour-blind separation ΔE 9.2 (light) and 9.4 (dark), above the target of 8."
          rejected="Picking colours that looked right on my screen."
          because="Colour-blind safety is computable, so I computed it. The check also flagged that the light-mode aqua is only 2.82:1 against white, below the 3:1 guideline."
          cost="That aqua needs relief: every step shows its type as text next to the colour, so contrast never carries meaning alone. It also limits the chart to three categorical colours before it must fall back to labels."
        />

        <Decision
          title="Render only what is on screen"
          chose="A virtualized list: rows are absolutely positioned inside a spacer as tall as all 5,000, and only the ones in view, plus a small buffer, exist in the page."
          rejected="Rendering all rows, or paginating."
          because="All 5,000 rows makes scrolling and filtering sluggish; pages break the flow of scanning and make “jump to the slowest” awkward. Virtualized, search filters every run in under 100 ms, including typing."
          cost="The browser’s find-in-page can’t see rows that aren’t rendered, so search has to live in the app, which it does. Screen readers would also lose their place, which is why each row carries its position (“row 37 of 5,000”) and the list announces the active row."
        >
          <Figure caption="The real list with all 5,000 runs. The count is measured from the page as you scroll.">
            <VirtualCounter />
          </Figure>
        </Decision>

        <Decision
          title="One Tab stop per region"
          chose="The run list is a single Tab stop driven by arrow keys (a listbox), and the steps follow the WAI-ARIA tree pattern."
          rejected="Making every row a link or button."
          because="Five thousand Tab stops would make the page unusable from the keyboard. With one per region, Tab moves between list, steps and inspector, and the arrows move within them."
          cost="Custom keyboard handling had to be built and tested, and it must match what screen-reader users expect from a listbox and a tree."
        >
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Keyboard shortcuts</caption>
              <tbody>
                {keys.map(([k, v]) => (
                  <tr key={k} className="border-b border-border last:border-b-0">
                    <th
                      scope="row"
                      className="w-1/3 bg-surface px-4 py-2 text-left font-mono text-[13px] font-normal"
                    >
                      {k}
                    </th>
                    <td className="px-4 py-2 text-muted">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Decision>

        <Decision
          title="Connect the summary to the single run"
          chose="A duration histogram with a marker showing where the selected run falls."
          rejected="A chart that only describes the whole set, or no chart."
          because="“Is this run slow?” only has an answer relative to the others. The marker answers it at a glance. It is a single series, so it has a title instead of a legend, a tooltip on every bar, and a hidden table for screen readers."
          cost="Equal-width bins make the long tail of slow runs look thin; that is honest, but the slowest outliers are easier to find with the Slowest sort than in the chart."
        />

        <Decision
          title="The selected run lives in the URL"
          chose="Selecting a run updates ?run= in the address bar."
          rejected="Keeping the selection only in memory."
          because="Debugging is a team activity: “look at run_00062” should be a link. It also survives a reload."
          cost="The server renders without a selection, so the first frame shows the newest run until the browser reads the URL. With static pages that is a deliberate trade for speed."
        />
      </Section>

      <Section id="review" kicker="04 · What review caught" title="Five things I got wrong first">
        <P>
          I review my own work the way I would review someone else’s: tests first, then a script
          that loads every page in light, dark and at phone width, measures overflow and collects
          console errors, then screenshots I actually look at. These came out of that.
        </P>
        <ol className="grid gap-4">
          {caught.map((c, i) => (
            <li key={c.what} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-semibold">
                <span className="font-mono text-sm text-muted">
                  {String(i + 1).padStart(2, "0")}{" "}
                </span>
                {c.what}
              </p>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted">{c.found}</p>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed">
                <span className="font-medium">Fix: </span>
                {c.fix}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="next" kicker="05 · What’s next" title="What I would build next, and why">
        <ul className="grid max-w-[68ch] gap-3 text-[15px] leading-relaxed">
          <li>
            <strong>Zoom and pan on the timeline.</strong> A 50 ms tool call next to a 5 s timeout
            is a sliver; you should be able to zoom into it.
          </li>
          <li>
            <strong>Compare two runs.</strong> The most common debugging question is “what changed
            between the run that worked and the one that didn’t?”
          </li>
          <li>
            <strong>Real traces.</strong> Recording the{" "}
            <Link href="/returns" className="underline underline-offset-4">
              Returns assistant
            </Link>
            ’s runs into the explorer would replace sample data with real behaviour.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/runs"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Open the Run explorer
          </Link>
          <a
            href="https://github.com/jun1iu/traces/tree/main/src/components/runs"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            Read the code
          </a>
        </div>
      </Section>
    </article>
  );
}
