import type { Run } from "./types";

export function percentile(sorted: readonly number[], p: number) {
  if (sorted.length === 0) return 0;
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[rank];
}

export interface Bin {
  from: number;
  to: number;
  count: number;
}

/** Equal-width bins from 0 to the largest value, so bar heights compare honestly. */
export function histogram(values: readonly number[], bins = 24): Bin[] {
  const max = Math.max(1, ...values);
  const width = max / bins;
  const out: Bin[] = Array.from({ length: bins }, (_, i) => ({
    from: i * width,
    to: (i + 1) * width,
    count: 0,
  }));
  for (const v of values) out[Math.min(bins - 1, Math.floor(v / width))].count++;
  return out;
}

export function summarize(runs: readonly Run[]) {
  const durations = runs.map((r) => r.duration).sort((a, b) => a - b);
  const passed = runs.filter((r) => r.status === "passed").length;
  return {
    count: runs.length,
    passRate: runs.length ? passed / runs.length : 0,
    p50: percentile(durations, 50),
    p95: percentile(durations, 95),
    cost: runs.reduce((a, r) => a + r.cost, 0),
    histogram: histogram(durations),
  };
}

export function formatMs(ms: number) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

export function formatCost(usd: number) {
  if (usd === 0) return "$0";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Fixed UTC format, so the server and every browser render the same text. */
export function formatTime(epochMs: number) {
  const d = new Date(epochMs);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm} UTC`;
}
