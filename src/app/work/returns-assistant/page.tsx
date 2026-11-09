import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementCompare } from "@/components/case-study/announcement-compare";
import { Decision, Figure, Metrics, P, Section } from "@/components/case-study/prose";
import { StepDisplayCompare } from "@/components/case-study/step-display-compare";

export const metadata: Metadata = {
  title: "Returns assistant: case study",
  description:
    "How I designed a chat interface for an AI agent that waits, calls tools, can fail, and must never move money on its own.",
};

const caught = [
  {
    what: "The step icons were cut in half",
    found:
      "The steps open and close with a height animation, which clips anything outside the list. The status icons sat on the timeline line just outside the list’s edge, so mid-run they showed as half circles. Only a screenshot taken mid-run showed it; the finished state looked fine.",
    fix: "Drew the line inside the list, so the icons sit fully within the clipped area.",
  },
  {
    what: "Adding “Assistant” pushed the theme switcher off phones",
    found:
      "The header grew to 400 px on a 390 px screen, so the switcher was 10 px off the edge on every page, not just this one.",
    fix: "On phones the “Playground” wordmark becomes a compact mark; screen readers still hear the name.",
  },
  {
    what: "Enter didn’t send while a reply was streaming",
    found:
      "My review script typed a second message and pressed Enter before the first reply finished. Nothing was sent, and I first took it for a bug.",
    fix: "It was the behaviour I wanted: the draft is held, not lost, until the reply finishes or you press Esc to stop it. I kept it and the Send button turns into Stop while busy, so the state is visible.",
  },
] as const;

export default function ReturnsAssistantCaseStudy() {
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
          Case study · AI interface
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Designing for an agent you can’t fully predict
        </h1>
        <P className="text-lg text-muted">
          An agent takes seconds to answer, calls tools on your behalf, can be wrong, and in this
          case deals with money. The{" "}
          <Link href="/returns" className="text-foreground underline underline-offset-4">
            Returns assistant
          </Link>{" "}
          is a chat interface for my Relay Returns agent, designed around those four facts.
        </P>
      </header>

      <Metrics
        items={[
          { value: "9 / 9", label: "of Relay’s original test cases pass after the port" },
          { value: "5", label: "visible steps for an eligible refund" },
          { value: "2 vs 25", label: "screen-reader updates per reply, shipped vs naive" },
          { value: "0", label: "refunds the agent can issue on its own" },
        ]}
      />

      <Section
        id="problem"
        kicker="01 · The problem"
        title="Three moments where chat interfaces break"
      >
        <P>
          <strong>While it waits</strong>, a spinner says nothing: is it working, stuck, or about to
          time out? <strong>When it answers</strong>, the user has to decide whether to trust it,
          with nothing to go on but confident prose. <strong>When it fails</strong>, the usual red
          toast disappears along with the context.
        </P>
        <P>
          On top of that, a returns agent touches money. Relay’s own policy, RET-01, already says
          eligible requests need human approval, so the interface has to make “approved by the
          rules” and “money has moved” impossible to confuse.
        </P>
      </Section>

      <Section id="principles" kicker="02 · Principles" title="What I held myself to">
        <ul className="grid max-w-[68ch] gap-3 text-[15px] leading-relaxed">
          <li>
            <strong>Show the work, then get out of the way.</strong>
          </li>
          <li>
            <strong>The agent never moves money.</strong> A person does.
          </li>
          <li>
            <strong>Failure is information,</strong> not an apology.
          </li>
          <li>
            <strong>Calm for assistive technology.</strong> Streaming is a visual effect, not
            something to read aloud.
          </li>
          <li>
            <strong>Honest about what it is.</strong> It runs rules, not a model, and the page says
            so.
          </li>
        </ul>
      </Section>

      <Section id="decisions" kicker="03 · Decisions" title="What I chose, and what it cost">
        <Decision
          title="Steps appear live, then fold away"
          chose="Each tool call appears as it runs, in plain language (“Looking up order RX-104”, then what it found). When the answer arrives, the steps fold into one line, “Checked · 5 steps”, that can be reopened."
          rejected="A spinner, or steps that stay expanded after the answer."
          because="A spinner gives no evidence of progress and nothing to judge the answer by. Steps that stay open push the answer down and turn every reply into a log. Folding keeps the evidence one click away without making everyone read it."
          cost="Reopening costs a click, and on a very fast run the steps flash past before anyone can read them."
        >
          <Figure caption="The same real request at the assistant’s real pace. Play it in each mode: with a spinner you learn nothing until the end; always expanded, the answer sits under five finished steps.">
            <StepDisplayCompare />
          </Figure>
        </Decision>

        <Decision
          title="A person approves the money"
          chose="An eligible refund becomes a draft card marked “Awaiting human approval”, with “No money has moved” spelled out underneath."
          rejected="Issuing the refund as soon as the rules pass."
          because="Rules can be right and the outcome still wrong: fraud, a customer with history, a mistake in the order data. The policy already requires approval; the interface just has to make that state unmistakable."
          cost="Customers wait for a person, so the card has to answer “is it done?” at a glance. That is why the state has its own indicator and plain words, not just a status colour."
        />

        <Decision
          title="Failure is a state you can act on"
          chose="When the order service is down, the reply says what couldn’t be checked, the steps show which tool failed, and “Try again” reruns the request in place, replacing the failed reply."
          rejected="A toast that disappears, or silently retrying in the background."
          because="A toast loses the context. Silent retries hide a flaky service and make waits unpredictable. A visible failure tells the user what happened and gives them the next step."
          cost="In this demo the outage is permanent, so retrying fails again. That is honest about the service, but it means the retry button can’t show a recovery here."
        />

        <Decision
          title="One announcement per turn"
          chose="A separate status line for screen readers says “Checking your request…” when a turn starts, and the full reply once it’s done."
          rejected="Marking the reply itself as a live region, which is the default way to make streaming text accessible."
          because="With a live region on the reply, every step label and every streamed word is a new update: 25 for a single 20-word answer. That is noise, not access."
          cost="Screen-reader users hear the answer only when it’s complete. They can still read the conversation log at any time."
        >
          <Figure caption="What reaches a screen reader for the same reply. Counts are updates, not exact speech; screen readers queue and voice them differently.">
            <AnnouncementCompare />
          </Figure>
        </Decision>

        <Decision
          title="Stop is always one key away"
          chose="Esc, or the Send button turning into Stop, ends a reply mid-stream. A stopped reply is marked “Stopped. The reply above is incomplete.”"
          rejected="Making people wait out an answer they no longer want."
          because="Agents are slow and sometimes head the wrong way. Stopping should be instant, and partial text should never look finished."
          cost="Every reply needs a “stopped” state, in the data and in the design, alongside working, streaming and done."
        />

        <Decision
          title="Honest about what it is, built for what it could be"
          chose="The assistant runs Relay’s policy engine, ported to TypeScript, in the browser, and the page says “no AI model, nothing leaves the page”. The UI consumes a typed stream of events (step started, step finished, text, done)."
          rejected="Pretending it is a model, or wiring up a paid model API for a portfolio piece."
          because="A deterministic engine is free and safe to host publicly, and it makes every outcome testable: all nine of Relay’s original test cases pass, and the UI tests assert exact replies. A model-backed stream can emit the same events, and the interface would not change."
          cost="It only understands what the rules understand. Ask without an order ID and it can only ask you for one."
        />
      </Section>

      <Section id="review" kicker="04 · What review caught" title="Three things that surprised me">
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

      <Section id="next" kicker="05 · What’s next" title="What I would build next">
        <ul className="grid max-w-[68ch] gap-3 text-[15px] leading-relaxed">
          <li>
            <strong>A real model behind the same events.</strong> Stream a model’s tool calls
            through the same interface and compare it with the rules on Relay’s nine test cases.
          </li>
          <li>
            <strong>Record every run into the Run explorer,</strong> so the two projects share real
            traces instead of sample data.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/returns"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Try the assistant
          </Link>
          <a
            href="https://git.jun-liu.net/jzzliu/typescript-project/src/branch/main/src/components/chat"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            Read the code
          </a>
        </div>
      </Section>
    </article>
  );
}
