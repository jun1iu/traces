export type SpanKind = "agent" | "llm" | "tool" | "retrieval";
export type RunStatus = "passed" | "failed" | "errored";

export interface Span {
  id: string;
  parentId: string | null;
  kind: SpanKind;
  name: string;
  /** Milliseconds from the start of the run. */
  start: number;
  duration: number;
  status: "ok" | "error";
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
}

export interface Run {
  id: string;
  task: string;
  prompt: string;
  model: string;
  /** Epoch milliseconds. */
  startedAt: number;
  duration: number;
  status: RunStatus;
  /** Evaluation score 0–1, or null when the run errored before it could be graded. */
  score: number | null;
  tokens: number;
  /** Estimated cost in US dollars. */
  cost: number;
  spans: Span[];
}
