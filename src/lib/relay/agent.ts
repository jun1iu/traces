import { run, type Outcome, type RefundDraft, type StepKind } from "./engine";

/**
 * Streams a Relay Returns run as the events a chat UI renders: steps starting and
 * finishing, then the reply arriving a few words at a time.
 *
 * Today the events come from replaying the deterministic engine with realistic
 * pacing. A model-backed transport (for example an AI SDK stream) can emit the same
 * events, and the UI would not change.
 */
export type AgentEvent =
  | { type: "step-start"; id: string; kind: StepKind; name: string; input: Record<string, unknown> }
  | { type: "step-end"; id: string; output: Record<string, unknown>; failed: boolean }
  | { type: "text"; delta: string }
  | { type: "done"; status: Outcome; draft: RefundDraft | null };

export interface AgentOptions {
  signal?: AbortSignal;
  /** Milliseconds per step and per word. 0 makes the run instant (tests). */
  pace?: { step: number; word: number };
}

export const DEFAULT_PACE = { step: 650, word: 28 };

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (ms <= 0 || signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => (clearTimeout(t), resolve()), { once: true });
  });

export async function* runAgent(
  prompt: string,
  { signal, pace = DEFAULT_PACE }: AgentOptions = {},
) {
  const result = run(prompt);

  for (const [i, step] of result.trace.entries()) {
    if (signal?.aborted) return;
    const id = `step-${i}`;
    yield {
      type: "step-start",
      id,
      kind: step.kind,
      name: step.name,
      input: step.input,
    } satisfies AgentEvent;
    await wait(pace.step, signal);
    if (signal?.aborted) return;
    yield {
      type: "step-end",
      id,
      output: step.output,
      failed: "error" in step.output,
    } satisfies AgentEvent;
  }

  // Words keep their trailing space so the text reflows naturally while streaming.
  for (const word of result.reply.match(/\S+\s*/g) ?? []) {
    if (signal?.aborted) return;
    await wait(pace.word, signal);
    if (signal?.aborted) return;
    yield { type: "text", delta: word } satisfies AgentEvent;
  }

  yield { type: "done", status: result.status, draft: result.draft } satisfies AgentEvent;
}
