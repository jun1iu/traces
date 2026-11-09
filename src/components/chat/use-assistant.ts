"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { DEFAULT_PACE, runAgent, type AgentEvent } from "@/lib/relay/agent";
import type { Outcome, RefundDraft, StepKind } from "@/lib/relay/engine";

export interface Step {
  id: string;
  kind: StepKind;
  name: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  state: "running" | "done" | "failed";
}

export type Phase = "working" | "streaming" | "done" | "stopped";

export type Message =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      prompt: string;
      steps: Step[];
      text: string;
      phase: Phase;
      status?: Outcome;
      draft?: RefundDraft | null;
    };

export type AssistantMessage = Extract<Message, { role: "assistant" }>;

type Action =
  | { type: "send"; userId: string; assistantId: string; text: string }
  | { type: "restart"; id: string }
  | { type: "event"; id: string; event: AgentEvent }
  | { type: "stopped"; id: string }
  | { type: "reset" };

function update(messages: Message[], id: string, fn: (m: AssistantMessage) => AssistantMessage) {
  return messages.map((m) => (m.id === id && m.role === "assistant" ? fn(m) : m));
}

function reducer(messages: Message[], action: Action): Message[] {
  switch (action.type) {
    case "send":
      return [
        ...messages,
        { id: action.userId, role: "user", text: action.text },
        {
          id: action.assistantId,
          role: "assistant",
          prompt: action.text,
          steps: [],
          text: "",
          phase: "working",
        },
      ];
    case "restart":
      return update(messages, action.id, (m) => ({
        ...m,
        steps: [],
        text: "",
        phase: "working",
        status: undefined,
        draft: undefined,
      }));
    case "stopped":
      return update(messages, action.id, (m) =>
        m.phase === "done" ? m : { ...m, phase: "stopped" },
      );
    case "reset":
      return [];
    case "event": {
      const e = action.event;
      return update(messages, action.id, (m) => {
        switch (e.type) {
          case "step-start":
            return {
              ...m,
              steps: [
                ...m.steps,
                { id: e.id, kind: e.kind, name: e.name, input: e.input, state: "running" },
              ],
            };
          case "step-end":
            return {
              ...m,
              steps: m.steps.map((s) =>
                s.id === e.id ? { ...s, output: e.output, state: e.failed ? "failed" : "done" } : s,
              ),
            };
          case "text":
            return { ...m, phase: "streaming", text: m.text + e.delta };
          case "done":
            return { ...m, phase: "done", status: e.status, draft: e.draft };
        }
      });
    }
  }
}

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

/** Conversation state for the Relay Returns assistant: send, stop, retry and reset. */
export function useAssistant({ pace = DEFAULT_PACE } = {}) {
  const [messages, dispatch] = useReducer(reducer, []);
  const controller = useRef<AbortController | null>(null);
  const activeId = useRef<string | null>(null);

  const stream = useCallback(
    async (id: string, prompt: string) => {
      controller.current?.abort();
      const ctrl = new AbortController();
      controller.current = ctrl;
      activeId.current = id;
      for await (const event of runAgent(prompt, { signal: ctrl.signal, pace })) {
        dispatch({ type: "event", id, event });
      }
      if (ctrl.signal.aborted) dispatch({ type: "stopped", id });
      if (controller.current === ctrl) {
        controller.current = null;
        activeId.current = null;
      }
    },
    [pace],
  );

  const send = useCallback(
    (text: string) => {
      const prompt = text.trim();
      if (!prompt) return;
      const assistantId = nextId("assistant");
      dispatch({ type: "send", userId: nextId("user"), assistantId, text: prompt });
      void stream(assistantId, prompt);
    },
    [stream],
  );

  const retry = useCallback(
    (message: AssistantMessage) => {
      dispatch({ type: "restart", id: message.id });
      void stream(message.id, message.prompt);
    },
    [stream],
  );

  const stop = useCallback(() => controller.current?.abort(), []);

  const reset = useCallback(() => {
    controller.current?.abort();
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  const last = messages.at(-1);
  const busy =
    last?.role === "assistant" && (last.phase === "working" || last.phase === "streaming");

  return { messages, busy, send, stop, retry, reset };
}
