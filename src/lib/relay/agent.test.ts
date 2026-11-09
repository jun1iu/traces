import { describe, expect, it } from "vitest";
import { runAgent, type AgentEvent } from "./agent";
import { examples } from "./engine";

const instant = { step: 0, word: 0 };

async function collect(prompt: string, signal?: AbortSignal) {
  const events: AgentEvent[] = [];
  for await (const e of runAgent(prompt, { pace: instant, signal })) events.push(e);
  return events;
}

describe("runAgent", () => {
  it("emits every step before the reply, then a single done event", async () => {
    const events = await collect(examples[0].prompt);
    const types = events.map((e) => e.type);
    const firstText = types.indexOf("text");
    expect(types.slice(0, firstText).every((t) => t.startsWith("step-"))).toBe(true);
    expect(types.filter((t) => t === "done")).toHaveLength(1);
    expect(types.at(-1)).toBe("done");
  });

  it("rebuilds the exact reply from the text deltas", async () => {
    const events = await collect(examples[1].prompt);
    const text = events.flatMap((e) => (e.type === "text" ? [e.delta] : [])).join("");
    expect(text).toMatch(/^Order RX-209 isn’t eligible/);
    expect(text.endsWith("No refund was issued.")).toBe(true);
  });

  it("marks a failed tool call", async () => {
    const events = await collect(examples[4].prompt);
    const failed = events.find((e) => e.type === "step-end" && e.failed);
    expect(failed).toBeDefined();
    expect(events.at(-1)).toMatchObject({ type: "done", status: "retry" });
  });

  it("stops emitting once aborted", async () => {
    const controller = new AbortController();
    const events: AgentEvent[] = [];
    for await (const e of runAgent(examples[0].prompt, {
      pace: instant,
      signal: controller.signal,
    })) {
      events.push(e);
      if (events.length === 2) controller.abort();
    }
    expect(events).toHaveLength(2);
  });
});
