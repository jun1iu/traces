import { generateRuns } from "./generate";
import type { Run, Span } from "./types";

/** Depth of each span in its run's tree (the root agent span is 0). */
export function spanDepths(spans: readonly Span[]) {
  const byId = new Map(spans.map((s) => [s.id, s]));
  const depth = new Map<string, number>();
  const of = (s: Span): number => {
    const known = depth.get(s.id);
    if (known !== undefined) return known;
    const parent = s.parentId ? byId.get(s.parentId) : undefined;
    const d = parent ? of(parent) + 1 : 0;
    depth.set(s.id, d);
    return d;
  };
  spans.forEach(of);
  return depth;
}

/** True when two sibling steps overlap in time, i.e. the agent ran them in parallel. */
function hasParallelSiblings(spans: readonly Span[]) {
  return spans.some((a) =>
    spans.some(
      (b) =>
        a !== b &&
        a.parentId !== null &&
        a.parentId === b.parentId &&
        a.start < b.start &&
        b.start < a.start + a.duration,
    ),
  );
}

/**
 * The run shown on the home page: one that passed and shows every kind of step,
 * nesting and parallel tool calls, in few enough steps to read at a glance.
 * Deterministic, because the sample data comes from a fixed seed.
 */
export function featuredRun(): Run {
  const runs = generateRuns(200);
  const pick = runs.find((run) => {
    const kinds = new Set(run.spans.map((s) => s.kind));
    const depths = spanDepths(run.spans);
    return (
      run.status === "passed" &&
      run.spans.length >= 6 &&
      run.spans.length <= 9 &&
      kinds.has("llm") &&
      kinds.has("tool") &&
      kinds.has("retrieval") &&
      Math.max(...depths.values()) >= 2 &&
      hasParallelSiblings(run.spans)
    );
  });
  return pick ?? runs[0];
}
