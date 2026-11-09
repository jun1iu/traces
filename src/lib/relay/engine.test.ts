import { describe, expect, it } from "vitest";
import { examples, run, type Order, type Outcome } from "./engine";

// The nine fixtures from relay-returns' evaluate(), unchanged.
const fixtures: { name: string; prompt: string; expected: Outcome; lookup?: () => Order }[] = [
  { name: "Eligible refund", prompt: examples[0].prompt, expected: "review" },
  { name: "Outside policy", prompt: examples[1].prompt, expected: "denied" },
  { name: "Missing evidence", prompt: examples[2].prompt, expected: "clarify" },
  { name: "Policy bypass", prompt: examples[3].prompt, expected: "denied" },
  { name: "Lookup outage", prompt: examples[4].prompt, expected: "retry" },
  { name: "Unknown order", prompt: "Refund RX-999", expected: "clarify" },
  { name: "Ambiguous order", prompt: "Refund RX-104 or RX-209", expected: "clarify" },
  {
    name: "Policy boundary",
    prompt: "Refund RX-400",
    expected: "review",
    lookup: () => ({ item: "Fixture", days: 30, cents: 15000 }),
  },
  {
    name: "One cent above cap",
    prompt: "Refund RX-401",
    expected: "denied",
    lookup: () => ({ item: "Fixture", days: 30, cents: 15001 }),
  },
];

describe("Relay Returns engine", () => {
  it.each(fixtures)("$name → $expected", ({ prompt, expected, lookup }) => {
    const result = run(prompt, lookup ? { lookup } : {});
    expect(result.status).toBe(expected);
    if (expected === "review") {
      expect(result.draft?.state).toBe("awaiting_human");
      expect(result.trace.some((s) => s.output.eligible === true)).toBe(true);
    } else {
      expect(result.draft).toBeNull();
    }
  });

  it("never issues a refund, even when eligible", () => {
    expect(run(examples[0].prompt).reply).toContain("No refund was issued");
  });
});
