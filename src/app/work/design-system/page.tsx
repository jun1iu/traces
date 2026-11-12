import type { Metadata } from "next";
import Link from "next/link";
import { ButtonNameDemo } from "@/components/case-study/button-name-demo";
import { Decision, Figure, Metrics, P, Section } from "@/components/case-study/prose";
import { colorTokens } from "@/tokens/tokens";

export const metadata: Metadata = {
  title: "Design system: case study",
  description:
    "Semantic tokens enforced by a test, a theme that never flashes, and components whose details hold up under a screen reader.",
};

const caught = [
  {
    what: "The switch announced its label and description as one name",
    found:
      "I wrapped the description inside the switch’s label, so a screen reader would hear “Email Weekly summary” as the control’s name. A test that checks the accessible description failed on its first run, before I saw anything on screen.",
    fix: "Moved the description out of the label and wired it with aria-describedby: the name is “Email”, the description “Weekly summary”.",
  },
  {
    what: "Tailwind’s dark: variant ignored the theme switcher",
    found:
      "The dark: variant follows the operating system’s setting, not the site’s Light / Dark / Auto choice, so a dark-only style would have shown up in the wrong theme.",
    fix: "Used a semantic token (ring-border) instead. Tokens already switch with the theme, so no component needs its own dark styles.",
  },
  {
    what: "The header kept outgrowing phones",
    found:
      "Every new page link pushed the header past 390 px: first by 10 px, later by 3 px. A script that measures scroll width on every page at phone size caught both.",
    fix: "A compact mark replaces the wordmark on phones, and the link spacing tightens; the Tokens link moved off the header.",
  },
  {
    what: "Token cards overflowed at 390 px",
    found:
      "Longer role descriptions added for the run explorer stopped the token cards from shrinking, so the Tokens page scrolled sideways on phones.",
    fix: "Let the cards shrink (min-width: 0) so the descriptions truncate as designed.",
  },
] as const;

export default function DesignSystemCaseStudy() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex max-w-3xl flex-col gap-4">
        <Link
          href="/work"
          className="w-fit text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Work
        </Link>
        <p className="font-mono text-xs tracking-wider text-accent uppercase">
          Case study · Design system
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Tokens as data, components with no surprises
        </h1>
        <P className="text-lg text-muted">
          The run explorer and the assistant are built on a small system: semantic colour tokens, a
          theme that never flashes, and a handful of components. It is small on purpose; this is
          about the details that decide whether a system can be trusted.
        </P>
      </header>

      <Metrics
        items={[
          {
            value: String(colorTokens.length),
            label: "colour tokens, checked in every theme by a test",
          },
          { value: "3", label: "themes: light, dark, and follow the system" },
          { value: "0", label: "frames of the wrong theme on reload" },
          { value: "1", label: "Tab stop per control group" },
        ]}
      />

      <Section id="decisions" kicker="01 · Decisions" title="What I chose, and what it cost">
        <Decision
          title="Name colours by job, and let a test enforce it"
          chose={
            <>
              Tokens named by role, such as <code className="font-mono text-[14px]">surface</code>,{" "}
              <code className="font-mono text-[14px]">muted</code> and{" "}
              <code className="font-mono text-[14px]">accent</code>, with their values in CSS
              variables. A test reads the stylesheet and fails if any token is missing from any
              theme or from Tailwind.
            </>
          }
          rejected="Raw palette classes (gray-100, indigo-600) in components."
          because="With roles, a theme is just data, and components never need dark-mode variants. The test means half a theme can never ship: when I added four tokens for the run explorer, it checked all of them in every theme automatically."
          cost="Dark values are written twice, once for “follow the system” and once for an explicit Dark choice. The test also checks that the two copies match."
        >
          <p className="max-w-[68ch] text-[15px] text-muted">
            See every token, in the current theme, on the{" "}
            <Link href="/tokens" className="text-foreground underline underline-offset-4">
              Tokens page
            </Link>
            .
          </p>
        </Decision>

        <Decision
          title="No flash of the wrong theme"
          chose="A tiny script in the page’s head applies the saved theme before the first paint; React reads the preference through useSyncExternalStore."
          rejected="Reading the saved theme after the page loads, or storing it in a cookie for the server."
          because="Reading it after load paints the default theme first and then flips: a white flash in a dark room. Cookies would make every page dynamic, and these pages are static."
          cost="The server doesn’t know your choice, so the theme switcher’s indicator starts on Auto and glides to Light or Dark after the page loads. The page itself is already in the right colours."
        />

        <Decision
          title="Loading keeps the button’s size and its name"
          chose="While loading, the label fades to opacity: 0 and a spinner sits on top; the button keeps its width and sets aria-busy."
          rejected="Swapping the label for a spinner, or hiding the label with visibility: hidden."
          because="Swapping changes the width, so everything next to the button jumps. Hiding with visibility removes the label from the accessibility tree, so a screen reader hears a button with no name."
          cost="Every button carries two layers, the label and the spinner, even when it never loads."
        >
          <Figure caption="Start loading. The left button keeps its name; the right one is left with nothing. The text is read from the page itself (innerText skips anything hidden with visibility, as the accessibility tree does).">
            <ButtonNameDemo />
          </Figure>
        </Decision>

        <Decision
          title="Controlled or uncontrolled, like native inputs"
          chose="Each component works either way through one small hook, useControllableState: pass a value and an onChange, or just a default."
          rejected="Components that only work one way."
          because="Native inputs work both ways, and people expect components to behave like them. Simple forms don’t need state plumbing; complex screens need full control."
          cost="Two modes to test. One test checks the tricky case: a controlled switch stays put when the parent doesn’t update it."
        />

        <Decision
          title="One Tab stop per group"
          chose="The segmented control is a radio group with a roving tab index: Tab enters it once, and the arrow keys move between options."
          rejected="A row of separate buttons, one Tab stop each."
          because="It is one choice, so it should be one stop, as native radio buttons are. The run explorer’s list and step tree follow the same rule."
          cost="The arrow keys select immediately, as native radios do. That suits switching views, but it would be wrong for options that start something expensive."
        />
      </Section>

      <Section id="review" kicker="02 · What review caught" title="Four things I got wrong first">
        <P>
          A test caught the first, I noticed the second while building, and a script that measures
          every page at phone width caught the last two.
        </P>
        <ol className="grid gap-4">
          {caught.map((c, i) => (
            <li key={c.what} className="rounded-xl border border-border bg-surface p-4">
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

      <Section id="next" kicker="03 · What’s next" title="What the system needs next">
        <ul className="grid max-w-[68ch] gap-3 text-[15px] leading-relaxed">
          <li>
            <strong>Harder components:</strong> a combobox, a ⌘K command menu and popovers that stay
            on screen. They are where accessibility usually breaks.
          </li>
          <li>
            <strong>Visual regression tests,</strong> so a token change that breaks a screen fails
            the build, not just a missing token.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            See the components
          </Link>
          <a
            href="https://github.com/jun1iu/typescript-project/tree/main/src/components/ui"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            Read the code
          </a>
        </div>
      </Section>
    </article>
  );
}
