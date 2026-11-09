import { describe, expect, it } from "vitest";
import { generateRuns, NEWEST_RUN_AT } from "./generate";
import { histogram, percentile, summarize, formatMs, formatTime } from "./stats";

const runs = generateRuns(5000);

describe("generateRuns", () => {
  it("is deterministic", () => {
    expect(generateRuns(50)).toEqual(generateRuns(50));
    expect(generateRuns(50, 8)[0]).not.toEqual(generateRuns(50, 7)[0]);
  });

  it("orders runs newest first, starting at the fixed base time", () => {
    expect(runs[0].startedAt).toBe(NEWEST_RUN_AT);
    expect(runs.every((r, i) => i === 0 || r.startedAt < runs[i - 1].startedAt)).toBe(true);
  });

  it("produces a believable mix of outcomes", () => {
    const share = (s: string) => runs.filter((r) => r.status === s).length / runs.length;
    expect(share("passed")).toBeGreaterThan(0.6);
    expect(share("failed")).toBeGreaterThan(0.05);
    expect(share("errored")).toBeGreaterThan(0.03);
  });

  it("keeps every span inside its run and its parent", () => {
    for (const run of runs.slice(0, 500)) {
      const byId = new Map(run.spans.map((s) => [s.id, s]));
      for (const span of run.spans) {
        expect(span.start + span.duration).toBeLessThanOrEqual(run.duration);
        if (span.parentId) {
          const parent = byId.get(span.parentId)!;
          expect(span.start).toBeGreaterThanOrEqual(parent.start);
          expect(span.start + span.duration).toBeLessThanOrEqual(parent.start + parent.duration);
        }
      }
    }
  });

  it("marks errored runs with a failed tool and no score", () => {
    const errored = runs.filter((r) => r.status === "errored");
    expect(
      errored.every(
        (r) => r.score === null && r.spans.some((s) => s.kind === "tool" && s.status === "error"),
      ),
    ).toBe(true);
  });

  it("includes nested spans and parallel tool calls", () => {
    expect(runs.some((r) => r.spans.some((s) => s.parentId && s.parentId !== r.spans[0].id))).toBe(
      true,
    );
    const overlapping = runs.some((r) => {
      const tools = r.spans.filter((s) => s.kind === "tool");
      return tools.some((a, i) =>
        tools.slice(i + 1).some((b) => b.start < a.start + a.duration && b.start >= a.start),
      );
    });
    expect(overlapping).toBe(true);
  });
});

describe("stats", () => {
  it("computes nearest-rank percentiles", () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2);
    expect(percentile([1, 2, 3, 4], 95)).toBe(4);
    expect(percentile([], 50)).toBe(0);
  });

  it("puts every value in exactly one bin", () => {
    const values = runs.map((r) => r.duration);
    expect(histogram(values).reduce((a, b) => a + b.count, 0)).toBe(values.length);
  });

  it("summarizes a set of runs", () => {
    const s = summarize(runs);
    expect(s.count).toBe(5000);
    expect(s.p50).toBeLessThan(s.p95);
    expect(s.passRate).toBeGreaterThan(0.6);
  });

  it("formats durations and times consistently", () => {
    expect(formatMs(840)).toBe("840 ms");
    expect(formatMs(2345)).toBe("2.35 s");
    expect(formatTime(NEWEST_RUN_AT)).toBe("Nov 9, 12:00 UTC");
  });
});
