import type { Step } from "./use-assistant";

const usd = (cents: unknown) =>
  typeof cents === "number"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
    : "";

/** Plain-language labels for each engine step: what it is doing, then what it found. */
export function stepCopy(step: Step): { label: string; detail?: string } {
  const out = step.output ?? {};
  switch (step.name) {
    case "Extract order reference": {
      const ids = (out.order_ids as string[] | undefined) ?? [];
      return {
        label: "Reading your request",
        detail: step.output
          ? ids.length === 1
            ? `Found order ${ids[0]}`
            : ids.length
              ? `Found ${ids.length} order IDs`
              : "No order ID mentioned"
          : undefined,
      };
    }
    case "lookup_order": {
      const label = `Looking up order ${String(step.input.id ?? "")}`;
      if (!step.output) return { label };
      if (out.error === "ORDER_SERVICE_UNAVAILABLE")
        return { label, detail: "Order service unavailable" };
      if (out.error) return { label, detail: "Order not found" };
      return { label, detail: `${out.item}, bought ${out.days} days ago, ${usd(out.cents)}` };
    }
    case "read_policy":
      return {
        label: "Reading return policy RET-01",
        detail: step.output ? String(out.rule ?? "") : undefined,
      };
    case "Evaluate eligibility": {
      if (!step.output) return { label: "Checking eligibility" };
      if (out.eligible)
        return { label: "Checking eligibility", detail: "Within 30 days and under $150" };
      const why = [
        !out.within_window && "outside the 30-day window",
        !out.under_cap && "over the $150 cap",
      ]
        .filter(Boolean)
        .join(", ");
      return { label: "Checking eligibility", detail: `Not eligible: ${why}` };
    }
    case "Prepare approval draft":
      return {
        label: "Preparing a draft for human review",
        detail: step.output ? `Draft ready: ${String(out.amount ?? "")}` : undefined,
      };
    default:
      return { label: step.name };
  }
}
