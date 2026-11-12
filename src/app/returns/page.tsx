import type { Metadata } from "next";
import { ReturnsAssistant } from "@/components/chat/returns-assistant";

export const metadata: Metadata = {
  title: "Returns assistant",
  description:
    "A chat interface for an AI returns agent: streamed replies, visible tool steps, human-in-the-loop refunds and honest failure states.",
};

const notes = [
  [
    "Steps you can see",
    "Each tool call appears as it runs, then folds into a one-line summary once the answer arrives.",
  ],
  [
    "A person approves money",
    "Eligible refunds become a draft awaiting approval. The agent never issues one.",
  ],
  [
    "Failure is a state, not a dead end",
    "An outage says what couldn’t be checked and offers a retry.",
  ],
  [
    "Calm for screen readers",
    "One announcement per turn instead of every streamed word; Esc stops a reply.",
  ],
] as const;

export default function ReturnsPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="font-display text-[2.75rem] text-balance sm:text-6xl">Returns assistant</h1>
        <p className="text-pretty text-muted">
          A chat front end for{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href="https://github.com/jun1iu/relay-returns"
          >
            Relay Returns
          </a>
          . It designs for what makes agents hard to use: waiting, partial answers, tool calls and
          mistakes. Try the examples, including the policy bypass and the outage.
        </p>
      </header>

      <ReturnsAssistant />

      <ul className="grid gap-4 sm:grid-cols-2">
        {notes.map(([title, body]) => (
          <li key={title} className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
