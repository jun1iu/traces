import type { Run, RunStatus, Span } from "./types";

/**
 * Sample agent runs for the explorer. Deterministic: the same seed always produces
 * the same runs, so the server and the browser render identical data and tests can
 * assert exact values. Nothing here comes from a real model.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = ReturnType<typeof mulberry32>;
const between = (rng: Rng, min: number, max: number) => Math.round(min + rng() * (max - min));
const pick = <T>(rng: Rng, list: readonly T[]) => list[Math.floor(rng() * list.length)];

export const MODELS = [
  { id: "claude-haiku-5-5", input: 1, output: 5 },
  { id: "claude-sonnet-5-5", input: 3, output: 15 },
  { id: "claude-opus-5-5", input: 15, output: 75 },
] as const;

interface Task {
  name: string;
  prompts: readonly string[];
  tools: readonly string[];
}

const TASKS: readonly Task[] = [
  {
    name: "Refund eligibility",
    prompts: [
      "Can I get a refund for {order}? It arrived damaged.",
      "Refund {order} please, wrong size.",
    ],
    tools: ["lookup_order", "read_policy", "create_refund_draft"],
  },
  {
    name: "Order status",
    prompts: ["Where is my order {order}?", "{order} hasn't arrived yet."],
    tools: ["lookup_order", "track_shipment"],
  },
  {
    name: "Support triage",
    prompts: [
      "Customer says login fails after reset (ticket {ticket}).",
      "Triage ticket {ticket}: billing question.",
    ],
    tools: ["classify_ticket", "search_kb", "assign_queue"],
  },
  {
    name: "Invoice reconciliation",
    prompts: [
      "Reconcile October invoices for account {account}.",
      "Why doesn't invoice {invoice} match the payment?",
    ],
    tools: ["fetch_invoices", "match_payments", "flag_discrepancy"],
  },
  {
    name: "Meeting scheduling",
    prompts: [
      "Find 30 minutes with the design team next week.",
      "Move Thursday's review to Friday morning.",
    ],
    tools: ["get_calendar", "find_slots", "send_invite"],
  },
  {
    name: "Contract search",
    prompts: [
      "Which contracts have an auto-renewal clause?",
      "Find the termination terms in the {account} MSA.",
    ],
    tools: ["search_contracts", "extract_clause"],
  },
  {
    name: "Code review summary",
    prompts: [
      "Summarise PR #{pr} for the release notes.",
      "What changed in PR #{pr} and is it risky?",
    ],
    tools: ["fetch_diff", "run_linter", "summarize"],
  },
];

const TOOL_ERRORS = [
  "Timed out after 5,000 ms",
  "429 Too Many Requests: rate limit exceeded",
  "503 Service Unavailable",
  "Invalid arguments: missing required field",
] as const;

/** Base time for the newest run: Nov 9, 2026, 12:00 UTC. */
export const NEWEST_RUN_AT = Date.UTC(2026, 10, 9, 12, 0, 0);

function fillPrompt(rng: Rng, template: string) {
  return template
    .replace("{order}", `RX-${between(rng, 100, 999)}`)
    .replace("{ticket}", `T-${between(rng, 1000, 9999)}`)
    .replace("{account}", pick(rng, ["Northwind", "Acme", "Globex", "Initech"]))
    .replace("{invoice}", `INV-${between(rng, 20000, 29999)}`)
    .replace("{pr}", String(between(rng, 100, 999)));
}

function buildRun(index: number, seed: number, startedAt: number): Run {
  const rng = mulberry32(seed * 100003 + index * 7919);
  const task = pick(rng, TASKS);
  const model = rng() < 0.55 ? MODELS[1] : rng() < 0.7 ? MODELS[0] : MODELS[2];
  const prompt = fillPrompt(rng, pick(rng, task.prompts));
  const willError = rng() < 0.07;

  const spans: Span[] = [];
  let n = 0;
  const nextId = () => `s${++n}`;
  const root: Span = {
    id: nextId(),
    parentId: null,
    kind: "agent",
    name: task.name,
    start: 0,
    duration: 0,
    status: "ok",
    input: { prompt },
    output: {},
  };
  spans.push(root);

  const llm = (name: string, parentId: string, start: number, min: number, max: number): Span => {
    const tokensIn = between(rng, 400, 4200);
    const tokensOut = between(rng, 40, 700);
    const span: Span = {
      id: nextId(),
      parentId,
      kind: "llm",
      name,
      start,
      duration: between(rng, min, max) + Math.round(tokensOut * 1.2),
      status: "ok",
      model: model.id,
      tokensIn,
      tokensOut,
      input: {
        messages: between(rng, 2, 9),
        system: `You are a ${task.name.toLowerCase()} agent.`,
      },
      output: { stop_reason: name === "respond" ? "end_turn" : "tool_use" },
    };
    spans.push(span);
    return span;
  };

  let t = between(rng, 5, 40);
  t += llm("plan", root.id, t, 250, 900).duration + between(rng, 2, 20);

  if (rng() < 0.5) {
    const k = between(rng, 3, 8);
    const retrieval: Span = {
      id: nextId(),
      parentId: root.id,
      kind: "retrieval",
      name: "search_docs",
      start: t,
      duration: between(rng, 60, 380),
      status: "ok",
      input: { query: prompt.slice(0, 48), k },
      output: { documents: k, top_score: Number((0.6 + rng() * 0.35).toFixed(2)) },
    };
    spans.push(retrieval);
    t += retrieval.duration + between(rng, 2, 15);
  }

  const toolCount = between(rng, 1, task.tools.length);
  const errorAt = willError ? between(rng, 0, toolCount - 1) : -1;
  let errored = false;
  for (let i = 0; i < toolCount && !errored; i++) {
    const name = task.tools[i % task.tools.length];
    const failing = i === errorAt;
    const error = failing ? pick(rng, TOOL_ERRORS) : undefined;
    const duration = error?.startsWith("Timed out") ? 5000 : between(rng, 50, 1100);
    const tool: Span = {
      id: nextId(),
      parentId: root.id,
      kind: "tool",
      name,
      start: t,
      duration,
      status: failing ? "error" : "ok",
      input: { args: { ref: prompt.match(/[A-Z]+-\d+|#\d+/)?.[0] ?? task.name } },
      output: failing ? {} : { ok: true, items: between(rng, 1, 12) },
      error,
    };
    spans.push(tool);

    // Some tools call a model themselves: a nested span shows the tree's depth.
    if (
      !failing &&
      (name === "summarize" || name === "classify_ticket" || name === "extract_clause")
    ) {
      const inner = llm(`${name}.llm`, tool.id, t + between(rng, 10, 40), 150, 500);
      tool.duration = Math.max(
        tool.duration,
        inner.start - t + inner.duration + between(rng, 5, 30),
      );
    }

    // Occasionally the next tool runs in parallel with this one.
    const parallel = !failing && i + 1 < toolCount && rng() < 0.3;
    t += parallel ? between(rng, 5, 30) : tool.duration + between(rng, 2, 25);

    if (failing) {
      // One retry, which fails too: the run is marked errored.
      const retry: Span = {
        ...tool,
        id: nextId(),
        name: `${name} (retry)`,
        start: t,
        duration: Math.min(duration, between(rng, 200, 5000)),
      };
      spans.push(retry);
      t = retry.start + retry.duration;
      errored = true;
    }
  }

  if (!errored) t += llm("respond", root.id, t + between(rng, 2, 20), 300, 1500).duration;
  const end = Math.max(...spans.map((s) => s.start + s.duration), t) + between(rng, 3, 20);
  root.duration = end;

  let status: RunStatus;
  let score: number | null;
  if (errored) {
    status = "errored";
    score = null;
    root.status = "error";
    root.error = "Run stopped: a tool call failed after one retry";
  } else {
    score = Number(
      Math.min(1, Math.max(0.2, 0.92 - Math.pow(rng(), 8) * 0.75 + (rng() - 0.5) * 0.1)).toFixed(2),
    );
    status = score >= 0.7 ? "passed" : "failed";
  }
  root.output = errored ? { error: root.error } : { score, status };

  const llmSpans = spans.filter((s) => s.kind === "llm");
  const tokensIn = llmSpans.reduce((a, s) => a + (s.tokensIn ?? 0), 0);
  const tokensOut = llmSpans.reduce((a, s) => a + (s.tokensOut ?? 0), 0);
  const cost = (tokensIn * model.input + tokensOut * model.output) / 1_000_000;

  return {
    id: `run_${String(index + 1).padStart(5, "0")}`,
    task: task.name,
    prompt,
    model: model.id,
    startedAt,
    duration: end,
    status,
    score,
    tokens: tokensIn + tokensOut,
    cost: Number(cost.toFixed(5)),
    spans,
  };
}

/** Newest first. About two minutes apart on average, so 5,000 runs cover roughly a week. */
export function generateRuns(count = 5000, seed = 7): Run[] {
  const gaps = mulberry32(seed);
  const runs: Run[] = [];
  let at = NEWEST_RUN_AT;
  for (let i = 0; i < count; i++) {
    runs.push(buildRun(i, seed, at));
    at -= Math.round(20_000 + gaps() * 200_000);
  }
  return runs;
}
