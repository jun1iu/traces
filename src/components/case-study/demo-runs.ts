import { generateRuns } from "@/lib/runs/generate";
import type { Run } from "@/lib/runs/types";

let cache: Run[] | null = null;
export const allRuns = () => (cache ??= generateRuns());

/** Real runs from the explorer's data, picked for what each demo needs to show. */
export const NESTED_RUN_ID = "run_00026"; // a nested model call and two tool calls running in parallel
export const ERRORED_RUN_ID = "run_00023"; // a tool call that fails, then fails again on retry

export const runById = (id: string) => allRuns().find((r) => r.id === id)!;
